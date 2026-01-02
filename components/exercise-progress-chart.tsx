"use client"

import { useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Exercise {
  id: string
  name: string
  weight: number
  reps: number
  sets: number
  workouts: {
    date: string
  }
}

interface ExerciseProgressChartProps {
  exercises: Exercise[]
}

export function ExerciseProgressChart({ exercises }: ExerciseProgressChartProps) {
  // Get unique exercise names
  const exerciseNames = [...new Set(exercises.map((e) => e.name))].filter(
    (name) => exercises.filter((e) => e.name === name && e.weight > 0).length > 1,
  )

  const [selectedExercise, setSelectedExercise] = useState(exerciseNames[0] || "")

  // Get progress data for selected exercise
  const getExerciseProgress = (exerciseName: string) => {
    return exercises
      .filter((e) => e.name === exerciseName && e.weight > 0)
      .map((exercise) => ({
        date: exercise.workouts.date,
        weight: exercise.weight,
        reps: exercise.reps,
        formattedDate: new Date(exercise.workouts.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  const progressData = selectedExercise ? getExerciseProgress(selectedExercise) : []

  return (
    <div className="space-y-4">
      {exerciseNames.length > 0 ? (
        <>
          <Select value={selectedExercise} onValueChange={setSelectedExercise}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select an exercise" />
            </SelectTrigger>
            <SelectContent>
              {exerciseNames.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="formattedDate" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-white p-2 border rounded shadow">
                          <p className="text-sm">{`${label}: ${data.weight}kg × ${data.reps} reps`}</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <p className="text-sm">No exercise progress data available</p>
            <p className="text-xs">Log the same exercises multiple times with weights to see progress</p>
          </div>
        </div>
      )}
    </div>
  )
}
