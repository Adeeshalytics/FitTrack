"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ExerciseForm } from "@/components/exercise-form"
import { ExerciseSearch } from "@/components/exercise-search"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

interface Exercise {
  name: string
  sets: number
  reps: number
  weight: number
  restTime: number
  notes: string
}

export default function LogWorkoutPage() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const addExercise = (exercise: Exercise) => {
    setExercises([...exercises, exercise])
  }

  const addExerciseFromLibrary = (libraryExercise: any) => {
    const exercise: Exercise = {
      name: libraryExercise.name,
      sets: 3,
      reps: 10,
      weight: 0,
      restTime: 60,
      notes: "",
    }
    addExercise(exercise)
  }

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const workoutName = `Workout - ${new Date().toLocaleDateString("en-US", { 
        month: "short", 
        day: "numeric",
        year: "numeric" 
      })}`
      
      const { data: workout, error: workoutError } = await supabase
        .from("workouts")
        .insert({
          user_id: user.id,
          name: workoutName,
          date: new Date().toISOString().split("T")[0],
          duration: null,
          notes: null,
        })
        .select()
        .single()

      if (workoutError) throw workoutError

      // Create exercises
      if (exercises.length > 0) {
        const exerciseData = exercises.map((exercise) => ({
          workout_id: workout.id,
          name: exercise.name,
          sets: exercise.sets,
          reps: exercise.reps,
          weight: exercise.weight,
          rest_time: exercise.restTime,
          notes: exercise.notes || null,
        }))

        const { error: exerciseError } = await supabase.from("exercises").insert(exerciseData)

        if (exerciseError) throw exerciseError
      }

      router.push("/dashboard")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard">← Back</Link>
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">Log Workout</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Exercises */}
          <Card>
            <CardHeader>
              <CardTitle>Exercises</CardTitle>
              <CardDescription>Add the exercises you performed</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="manual" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                  <TabsTrigger value="library">Exercise Library</TabsTrigger>
                </TabsList>
                <TabsContent value="manual" className="space-y-4">
                  <ExerciseForm onAddExercise={addExercise} />
                </TabsContent>
                <TabsContent value="library" className="space-y-4">
                  <ExerciseSearch onSelectExercise={addExerciseFromLibrary} showAddButton={true} />
                </TabsContent>
              </Tabs>

              {exercises.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h4 className="font-medium text-gray-900">Added Exercises</h4>
                  {exercises.map((exercise, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{exercise.name}</div>
                        <div className="text-sm text-gray-600">
                          {exercise.sets} sets × {exercise.reps} reps
                          {exercise.weight > 0 && ` @ ${exercise.weight}kg`}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExercise(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {error && <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</div>}

          {/* Submit */}
          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" asChild>
              <Link href="/dashboard">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isLoading || exercises.length === 0}>
              {isLoading ? "Saving..." : "Save Workout"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
