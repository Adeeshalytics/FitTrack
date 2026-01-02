"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Target, CheckCircle, Plus } from "lucide-react"

interface Goal {
  id: string
  goal_type: string
  target_value: number
  current_value: number
  start_date: string
  end_date?: string
  is_active: boolean
  completed_at?: string
}

interface GoalTrackerProps {
  goals: Goal[]
  onCreateGoal?: () => void
}

export function GoalTracker({ goals, onCreateGoal }: GoalTrackerProps) {
  const getGoalTypeLabel = (type: string) => {
    switch (type) {
      case "weekly_workouts":
        return "Weekly Workouts"
      case "monthly_workouts":
        return "Monthly Workouts"
      case "streak":
        return "Workout Streak"
      case "calories":
        return "Calories Burned"
      default:
        return type
    }
  }

  const getGoalProgress = (goal: Goal) => {
    return Math.min((goal.current_value / goal.target_value) * 100, 100)
  }

  const activeGoals = goals.filter((goal) => goal.is_active && !goal.completed_at)
  const completedGoals = goals.filter((goal) => goal.completed_at)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Target className="w-5 h-5 mr-2 text-blue-600" />
            Goals
          </CardTitle>
          {onCreateGoal && (
            <Button variant="outline" size="sm" onClick={onCreateGoal}>
              <Plus className="w-4 h-4 mr-2" />
              Add Goal
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Active Goals */}
          {activeGoals.length > 0 && (
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-3">Active Goals</h4>
              <div className="space-y-3">
                {activeGoals.map((goal) => {
                  const progress = getGoalProgress(goal)
                  const isCompleted = progress >= 100

                  return (
                    <div key={goal.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <span className="font-medium text-sm">{getGoalTypeLabel(goal.goal_type)}</span>
                          {isCompleted && <CheckCircle className="w-4 h-4 text-green-600 ml-2" />}
                        </div>
                        <Badge variant={isCompleted ? "default" : "secondary"}>
                          {goal.current_value}/{goal.target_value}
                        </Badge>
                      </div>
                      <Progress value={progress} className="mb-2" />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{Math.round(progress)}% complete</span>
                        {goal.end_date && <span>Due {new Date(goal.end_date).toLocaleDateString()}</span>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Completed Goals */}
          {completedGoals.length > 0 && (
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-3">Recently Completed</h4>
              <div className="space-y-2">
                {completedGoals.slice(0, 3).map((goal) => (
                  <div key={goal.id} className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      <span className="text-sm font-medium">{getGoalTypeLabel(goal.goal_type)}</span>
                    </div>
                    <Badge variant="outline" className="text-green-700 border-green-200">
                      Completed
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Goals State */}
          {activeGoals.length === 0 && completedGoals.length === 0 && (
            <div className="text-center py-6">
              <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm mb-3">No goals set yet</p>
              {onCreateGoal && (
                <Button variant="outline" onClick={onCreateGoal}>
                  Create Your First Goal
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
