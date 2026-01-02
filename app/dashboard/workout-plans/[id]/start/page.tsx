"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, SkipForward, Check, X } from "lucide-react"

interface PageProps {
  params: {
    id: string
  }
}

interface Exercise {
  id: string
  name: string
  sets: number
  reps: number
  rest_time: number
  instructions: string
  equipment: string
  muscle_groups: string[]
  order_index: number
}

export default function StartWorkoutPage({ params }: PageProps) {
  const [userPlan, setUserPlan] = useState<any>(null)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [exerciseTimes, setExerciseTimes] = useState<number[]>([])
  const [exerciseStartTime, setExerciseStartTime] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadWorkoutPlan()
  }, [params.id])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning])

  const loadWorkoutPlan = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from("user_workout_plans")
        .select(`
          *,
          workout_plan_templates (
            *,
            template_exercises (*)
          )
        `)
        .eq("id", params.id)
        .eq("user_id", user.id)
        .single()

      if (data) {
        setUserPlan(data)
        const sortedExercises = (data.workout_plan_templates?.template_exercises || []).sort(
          (a: Exercise, b: Exercise) => a.order_index - b.order_index,
        )
        setExercises(sortedExercises)
        setExerciseTimes(new Array(sortedExercises.length).fill(0))
      }
    } catch (error) {
      console.error("Error loading workout plan:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const startWorkout = () => {
    setIsRunning(true)
    setExerciseStartTime(elapsedTime)
  }

  const pauseWorkout = () => {
    setIsRunning(false)
  }

  const nextExercise = () => {
    const timeSpent = elapsedTime - exerciseStartTime
    const newExerciseTimes = [...exerciseTimes]
    newExerciseTimes[currentExerciseIndex] = timeSpent
    setExerciseTimes(newExerciseTimes)

    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1)
      setExerciseStartTime(elapsedTime)
    } else {
      finishWorkout(newExerciseTimes)
    }
  }

  const finishWorkout = async (times: number[]) => {
    setIsRunning(false)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Create workout record
      const { data: workout, error: workoutError } = await supabase
        .from("workouts")
        .insert({
          user_id: user.id,
          name: userPlan.name,
          date: new Date().toISOString().split("T")[0],
          duration: Math.floor(elapsedTime / 60),
          notes: `Completed ${exercises.length} exercises from ${userPlan.name}`,
        })
        .select()
        .single()

      if (workoutError) throw workoutError

      // Create exercise records
      const exerciseData = exercises.map((exercise, index) => ({
        workout_id: workout.id,
        name: exercise.name,
        sets: exercise.sets,
        reps: exercise.reps,
        weight: 0,
        rest_time: exercise.rest_time,
        notes: `Time spent: ${Math.floor(times[index] / 60)}m ${times[index] % 60}s`,
      }))

      const { error: exerciseError } = await supabase.from("exercises").insert(exerciseData)

      if (exerciseError) throw exerciseError

      router.push("/dashboard/analytics")
    } catch (error) {
      console.error("Error saving workout:", error)
    }
  }

  const cancelWorkout = () => {
    if (confirm("Are you sure you want to cancel this workout? Your progress will not be saved.")) {
      router.back()
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">Loading workout...</div>
        </div>
      </div>
    )
  }

  const currentExercise = exercises[currentExerciseIndex]
  const progress = ((currentExerciseIndex + 1) / exercises.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Timer and Progress Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="text-center mb-4">
              <div className="text-5xl font-bold text-blue-600 mb-2">{formatTime(elapsedTime)}</div>
              <div className="text-sm text-gray-600">
                Exercise {currentExerciseIndex + 1} of {exercises.length}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Control Buttons */}
            <div className="flex justify-center space-x-3">
              {!isRunning ? (
                <Button onClick={startWorkout} size="lg" className="bg-green-600 hover:bg-green-700">
                  <Play className="w-5 h-5 mr-2" />
                  {elapsedTime === 0 ? "Start Workout" : "Resume"}
                </Button>
              ) : (
                <Button onClick={pauseWorkout} size="lg" variant="outline">
                  <Pause className="w-5 h-5 mr-2" />
                  Pause
                </Button>
              )}
              <Button onClick={cancelWorkout} size="lg" variant="destructive">
                <X className="w-5 h-5 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Current Exercise */}
        {currentExercise && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{currentExercise.name}</h2>
                {currentExercise.equipment && <Badge variant="outline">{currentExercise.equipment}</Badge>}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-blue-600">{currentExercise.sets}</div>
                  <div className="text-sm text-gray-600">Sets</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-green-600">{currentExercise.reps}</div>
                  <div className="text-sm text-gray-600">Reps</div>
                </div>
              </div>

              {currentExercise.rest_time && (
                <div className="bg-orange-50 p-3 rounded-lg mb-4 text-center">
                  <div className="text-sm text-gray-600">Rest Time</div>
                  <div className="text-lg font-semibold text-orange-600">{currentExercise.rest_time}s</div>
                </div>
              )}

              {currentExercise.instructions && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Instructions</h4>
                  <p className="text-gray-700 text-sm">{currentExercise.instructions}</p>
                </div>
              )}

              {currentExercise.muscle_groups && currentExercise.muscle_groups.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {currentExercise.muscle_groups.map((muscle) => (
                    <Badge key={muscle} variant="secondary" className="text-xs">
                      {muscle}
                    </Badge>
                  ))}
                </div>
              )}

              <Button
                onClick={nextExercise}
                disabled={!isRunning}
                size="lg"
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {currentExerciseIndex < exercises.length - 1 ? (
                  <>
                    <SkipForward className="w-5 h-5 mr-2" />
                    Next Exercise
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    Finish Workout
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Exercise List */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold text-gray-900 mb-3">Remaining Exercises</h3>
            <div className="space-y-2">
              {exercises.map((exercise, index) => (
                <div
                  key={exercise.id}
                  className={`p-3 rounded-lg flex justify-between items-center ${
                    index === currentExerciseIndex
                      ? "bg-blue-100 border-2 border-blue-600"
                      : index < currentExerciseIndex
                        ? "bg-green-50 opacity-60"
                        : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold mr-3 ${
                        index === currentExerciseIndex
                          ? "bg-blue-600 text-white"
                          : index < currentExerciseIndex
                            ? "bg-green-600 text-white"
                            : "bg-gray-300 text-gray-600"
                      }`}
                    >
                      {index < currentExerciseIndex ? "✓" : index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{exercise.name}</div>
                      <div className="text-xs text-gray-600">
                        {exercise.sets} × {exercise.reps}
                      </div>
                    </div>
                  </div>
                  {exerciseTimes[index] > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {formatTime(exerciseTimes[index])}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
