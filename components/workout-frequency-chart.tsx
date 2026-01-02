"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface Workout {
  id: string
  date: string
  name: string
}

interface WorkoutFrequencyChartProps {
  workouts: Workout[]
}

export function WorkoutFrequencyChart({ workouts }: WorkoutFrequencyChartProps) {
  // Generate last 30 days data
  const generateLast30Days = () => {
    const days = []
    const today = new Date()

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateString = date.toISOString().split("T")[0]

      const workoutCount = workouts.filter((w) => w.date === dateString).length

      days.push({
        date: dateString,
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        workouts: workoutCount,
      })
    }

    return days
  }

  const data = generateLast30Days()

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white p-2 border rounded shadow">
                    <p className="text-sm">{`${label}: ${payload[0].value} workouts`}</p>
                  </div>
                )
              }
              return null
            }}
          />
          <Bar dataKey="workouts" fill="#3b82f6" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
