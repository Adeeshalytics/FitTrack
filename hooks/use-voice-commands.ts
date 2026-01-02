"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"

interface VoiceCommand {
  pattern: RegExp
  action: (matches: RegExpMatchArray) => void | Promise<void>
  description: string
}

export function useVoiceCommands() {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [lastCommand, setLastCommand] = useState("")
  const router = useRouter()
  const supabase = createBrowserClient()

  const commands: VoiceCommand[] = [
    {
      pattern: /log (\d+) minutes? of (.+) today/i,
      action: async (matches) => {
        const duration = Number.parseInt(matches[1])
        const exerciseName = matches[2].trim()
        await logQuickWorkout(exerciseName, duration)
        setLastCommand(`Logged ${duration} minutes of ${exerciseName}`)
      },
      description: "Log [number] minutes of [exercise] today",
    },
    {
      pattern: /show (?:me )?(?:my )?weekly progress/i,
      action: () => {
        router.push("/dashboard/analytics")
        setLastCommand("Navigating to weekly progress")
      },
      description: "Show me my weekly progress",
    },
    {
      pattern: /start (.+) workout (?:plan)?/i,
      action: async (matches) => {
        const planName = matches[1].trim()
        await startWorkoutPlan(planName)
      },
      description: "Start [workout type] workout plan",
    },
    {
      pattern: /go to (?:the )?dashboard/i,
      action: () => {
        router.push("/dashboard")
        setLastCommand("Navigating to dashboard")
      },
      description: "Go to dashboard",
    },
    {
      pattern: /show (?:me )?(?:my )?workout plans/i,
      action: () => {
        router.push("/dashboard/workout-plans")
        setLastCommand("Navigating to workout plans")
      },
      description: "Show me my workout plans",
    },
    {
      pattern: /log (?:a )?(?:new )?workout/i,
      action: () => {
        router.push("/dashboard/log-workout")
        setLastCommand("Opening workout logger")
      },
      description: "Log a new workout",
    },
    {
      pattern: /show (?:me )?(?:my )?profile/i,
      action: () => {
        router.push("/dashboard/profile")
        setLastCommand("Navigating to profile")
      },
      description: "Show me my profile",
    },
  ]

  const logQuickWorkout = async (exerciseName: string, duration: number) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Create a quick workout entry
      const { data: workout, error: workoutError } = await supabase
        .from("workouts")
        .insert({
          user_id: user.id,
          name: `Quick ${exerciseName}`,
          duration: duration,
          notes: "Added via voice command",
        })
        .select()
        .single()

      if (workoutError) throw workoutError

      // Add a simple exercise entry
      const { error: exerciseError } = await supabase.from("exercises").insert({
        workout_id: workout.id,
        name: exerciseName,
        sets: 1,
        reps: 1,
        notes: `${duration} minutes`,
      })

      if (exerciseError) throw exerciseError
    } catch (error) {
      console.error("Error logging workout:", error)
      setLastCommand("Failed to log workout")
    }
  }

  const startWorkoutPlan = async (planType: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Find matching workout plan
      const { data: userPlans } = await supabase
        .from("user_workout_plans")
        .select(`
          *,
          workout_plan_templates (
            name,
            focus_area
          )
        `)
        .eq("user_id", user.id)
        .eq("is_active", true)

      const matchingPlan = userPlans?.find(
        (plan) =>
          plan.name.toLowerCase().includes(planType.toLowerCase()) ||
          plan.workout_plan_templates?.focus_area.toLowerCase().includes(planType.toLowerCase()),
      )

      if (matchingPlan) {
        router.push(`/dashboard/workout-plans/${matchingPlan.id}`)
        setLastCommand(`Starting ${matchingPlan.name}`)
      } else {
        router.push("/dashboard/workout-plans")
        setLastCommand(`No ${planType} plan found, showing all plans`)
      }
    } catch (error) {
      console.error("Error finding workout plan:", error)
      setLastCommand("Failed to find workout plan")
    }
  }

  const processCommand = useCallback((text: string) => {
    const normalizedText = text.toLowerCase().trim()

    for (const command of commands) {
      const matches = normalizedText.match(command.pattern)
      if (matches) {
        command.action(matches)
        return true
      }
    }

    setLastCommand(`Command not recognized: "${text}"`)
    return false
  }, [])

  const startListening = useCallback(() => {
    if (!isSupported) return

    const recognition = new (window as any).webkitSpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = "en-US"

    recognition.onstart = () => {
      setIsListening(true)
      setTranscript("")
    }

    recognition.onresult = (event: any) => {
      const result = event.results[0][0].transcript
      setTranscript(result)
      processCommand(result)
    }

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }, [isSupported])

  const stopListening = useCallback(() => {
    setIsListening(false)
  }, [])

  useEffect(() => {
    // Check if speech recognition is supported
    const supported = "webkitSpeechRecognition" in window || "SpeechRecognition" in window
    setIsSupported(supported)
  }, [])

  return {
    isListening,
    isSupported,
    transcript,
    lastCommand,
    commands: commands.map((cmd) => cmd.description),
    startListening,
    stopListening,
  }
}
