"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Target, Zap, Users } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface WorkoutPlanTemplate {
  id: string
  name: string
  description: string
  focus_area: string
  difficulty_level: string
  duration_minutes: number
  fitness_goal: string
  template_exercises: Array<{
    id: string
    name: string
    sets: number
    reps: number
    muscle_groups: string[]
    equipment: string
  }>
}

interface WorkoutPlanCardProps {
  template: WorkoutPlanTemplate
}

export function WorkoutPlanCard({ template }: WorkoutPlanCardProps) {
  const [isAdding, setIsAdding] = useState(false)
  const router = useRouter()
  const supabase = createBrowserClient()

  const handleAddToPlan = async () => {
    setIsAdding(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase.from("user_workout_plans").insert({
        user_id: user.id,
        template_id: template.id,
        name: template.name,
        is_custom: false,
      })

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error("Error adding workout plan:", error)
    } finally {
      setIsAdding(false)
    }
  }

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-100 text-green-800"
      case "intermediate":
        return "bg-yellow-100 text-yellow-800"
      case "advanced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getFocusAreaIcon = (area: string) => {
    switch (area) {
      case "full_body":
        return <Users className="w-4 h-4" />
      case "chest":
      case "arms":
        return <Zap className="w-4 h-4" />
      default:
        return <Target className="w-4 h-4" />
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          {getFocusAreaIcon(template.focus_area)}
          <h3 className="text-lg font-semibold text-gray-900 ml-2">{template.name}</h3>
        </div>
        <Badge className={getDifficultyColor(template.difficulty_level)}>{template.difficulty_level}</Badge>
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{template.description}</p>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="w-4 h-4 mr-2" />
          {template.duration_minutes} minutes
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Target className="w-4 h-4 mr-2" />
          {template.focus_area.replace("_", " ")} focus
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Zap className="w-4 h-4 mr-2" />
          {template.template_exercises?.length || 0} exercises
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-4">
        {template.template_exercises?.slice(0, 3).map((exercise) => (
          <Badge key={exercise.id} variant="outline" className="text-xs">
            {exercise.name}
          </Badge>
        ))}
        {template.template_exercises?.length > 3 && (
          <Badge variant="outline" className="text-xs">
            +{template.template_exercises.length - 3} more
          </Badge>
        )}
      </div>

      <Button onClick={handleAddToPlan} disabled={isAdding} className="w-full bg-blue-600 hover:bg-blue-700">
        {isAdding ? "Adding..." : "Add to My Plans"}
      </Button>
    </div>
  )
}
