"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface Exercise {
  sets: number
  reps: number
  weight: number
}

interface Workout {
  id: string
  date: string
  exercises: Exercise[]
}

interface VolumeProgressChartProps {
  workouts: Workout[]
}

export function VolumeProgressChart({ workouts }: VolumeProgressChartProps) {
  // Calculate total volume for each workout
  const volumeData = workouts
    .map((workout) => {
      const totalVolume =
        workout.exercises?.reduce((sum, exercise) => {
          return sum + exercise.sets * exercise.reps * (exercise.weight || 0)
        }, 0) || 0

      return {
        date: workout.date,
        volume: totalVolume,
        formattedDate: new Date(workout.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
      }
    })
    .filter((item) => item.volume > 0) // Only show workouts with recorded weights

  return (
    <div className="h-64">
      {volumeData.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={volumeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="formattedDate" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white p-2 border rounded shadow">
                      <p className="text-sm">{`${label}: ${payload[0].value}kg total volume`}</p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Line
              type="monotone"
              dataKey="volume"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <p className="text-sm">No volume data available</p>
            <p className="text-xs">Start logging weights to see progress</p>
          </div>
        </div>
      )}
    </div>
  )
}
