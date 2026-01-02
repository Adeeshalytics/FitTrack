"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Trophy, Lock } from "lucide-react"

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: string
  requirement_type: string
  requirement_value: number
  points: number
  earned_at?: string
}

interface AchievementBadgeProps {
  achievement: Achievement
  isEarned: boolean
  progress?: number
}

export function AchievementBadge({ achievement, isEarned, progress = 0 }: AchievementBadgeProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "milestone":
        return "bg-blue-100 text-blue-800"
      case "streak":
        return "bg-orange-100 text-orange-800"
      case "workout":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const progressPercentage = Math.min((progress / achievement.requirement_value) * 100, 100)

  return (
    <Card className={`relative overflow-hidden ${isEarned ? "border-yellow-200 bg-yellow-50" : "border-gray-200"}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                isEarned ? "bg-yellow-100" : "bg-gray-100"
              }`}
            >
              {isEarned ? achievement.icon : <Lock className="w-4 h-4 text-gray-400" />}
            </div>
            <div className="ml-3">
              <h4 className={`font-semibold text-sm ${isEarned ? "text-gray-900" : "text-gray-500"}`}>
                {achievement.name}
              </h4>
              <p className={`text-xs ${isEarned ? "text-gray-600" : "text-gray-400"}`}>{achievement.description}</p>
            </div>
          </div>
          {isEarned && <Trophy className="w-4 h-4 text-yellow-600" />}
        </div>

        <div className="flex items-center justify-between">
          <Badge className={getCategoryColor(achievement.category)} variant="secondary">
            {achievement.category}
          </Badge>
          <div className="text-xs text-gray-500">+{achievement.points} pts</div>
        </div>

        {!isEarned && progress > 0 && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span>
                {progress}/{achievement.requirement_value}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {isEarned && achievement.earned_at && (
          <div className="mt-2 text-xs text-gray-500">
            Earned {new Date(achievement.earned_at).toLocaleDateString()}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
