"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Flame, Calendar, Trophy } from "lucide-react"

interface StreakCounterProps {
  currentStreak: number
  longestStreak: number
  lastWorkoutDate?: string
}

export function StreakCounter({ currentStreak, longestStreak, lastWorkoutDate }: StreakCounterProps) {
  const isStreakActive = lastWorkoutDate && new Date(lastWorkoutDate).toDateString() === new Date().toDateString()

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Flame className={`w-5 h-5 mr-2 ${isStreakActive ? "text-orange-500" : "text-gray-400"}`} />
          Workout Streak
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Current Streak */}
          <div className="text-center">
            <div className={`text-3xl font-bold ${isStreakActive ? "text-orange-500" : "text-gray-400"}`}>
              {currentStreak}
            </div>
            <p className="text-sm text-gray-600">{currentStreak === 1 ? "day" : "days"} current streak</p>
            {isStreakActive && (
              <div className="flex items-center justify-center mt-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse mr-2" />
                <span className="text-xs text-orange-600 font-medium">Active today!</span>
              </div>
            )}
          </div>

          {/* Longest Streak */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Trophy className="w-4 h-4 text-yellow-600 mr-2" />
              <span className="text-sm font-medium">Personal Best</span>
            </div>
            <span className="text-lg font-bold text-gray-900">{longestStreak}</span>
          </div>

          {/* Last Workout */}
          {lastWorkoutDate && (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-blue-600 mr-2" />
                <span className="text-sm font-medium">Last Workout</span>
              </div>
              <span className="text-sm text-gray-700">{new Date(lastWorkoutDate).toLocaleDateString()}</span>
            </div>
          )}

          {/* Streak Motivation */}
          <div className="text-center p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <p className="text-xs text-gray-600">
              {currentStreak === 0
                ? "Start your streak today! 💪"
                : currentStreak < 7
                  ? `${7 - currentStreak} more days to reach a week! 🎯`
                  : currentStreak < 30
                    ? `${30 - currentStreak} more days to reach a month! 🚀`
                    : "You're on fire! Keep it up! 🔥"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
