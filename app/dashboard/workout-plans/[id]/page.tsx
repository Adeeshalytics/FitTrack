import { createServerClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Play, Clock, Target, Zap, Users } from "lucide-react"
import Link from "next/link"
import { ExerciseVideoPlayer } from "@/components/exercise-video-player"

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
  rest_time?: number
  equipment?: string
  instructions?: string
  muscle_groups?: string[]
  youtube_video_id?: string
  order_index: number
}

interface WorkoutPlanTemplate {
  id: string
  name: string
  description?: string
  difficulty_level: "beginner" | "intermediate" | "advanced" | string
  duration_minutes?: number
  focus_area: string
  template_exercises?: Exercise[]
}

interface UserWorkoutPlan {
  id: string
  name: string
  user_id: string
  workout_plan_templates: WorkoutPlanTemplate
}

export default async function WorkoutPlanDetailPage({ params }: PageProps) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user workout plan
  const { data: userPlan } = await supabase
    .from("user_workout_plans")
    .select(`
      *,
      workout_plan_templates (
        *,
        template_exercises (
          *
        )
      )
    `)
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single()

  if (!userPlan) {
    notFound()
  }

  const template = userPlan.workout_plan_templates
  const exercises: Exercise[] = template?.template_exercises || []

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
        return <Users className="w-5 h-5" />
      case "chest":
      case "arms":
        return <Zap className="w-5 h-5" />
      default:
        return <Target className="w-5 h-5" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Link href="/dashboard/workout-plans">
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Plans
            </Button>
          </Link>
        </div>

        {/* Plan Overview */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                {template && getFocusAreaIcon(template.focus_area)}
                <div className="ml-3">
                  <CardTitle className="text-2xl">{userPlan.name}</CardTitle>
                  <p className="text-gray-600 mt-1">{template?.description}</p>
                </div>
              </div>
              {template && (
                <Badge className={getDifficultyColor(template.difficulty_level)}>
                  {template.difficulty_level}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-blue-600 mr-2" />
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-semibold">{template?.duration_minutes} minutes</p>
                </div>
              </div>
              <div className="flex items-center">
                <Target className="w-5 h-5 text-green-600 mr-2" />
                <div>
                  <p className="text-sm text-gray-600">Focus Area</p>
                  <p className="font-semibold capitalize">
                    {template?.focus_area.replace("_", " ")}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <Zap className="w-5 h-5 text-purple-600 mr-2" />
                <div>
                  <p className="text-sm text-gray-600">Exercises</p>
                  <p className="font-semibold">{exercises.length}</p>
                </div>
              </div>
            </div>

            <Button asChild className="bg-blue-600 hover:bg-blue-700" size="lg">
              <Link href={`/dashboard/workout-plans/${params.id}/start`}>
                <Play className="w-4 h-4 mr-2" />
                Start Workout
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Exercise List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Exercises</h2>
          {exercises
            .sort((a: Exercise, b: Exercise) => a.order_index - b.order_index)
            .map((exercise: Exercise, index: number) => (
              <Card key={exercise.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{exercise.name}</h3>
                        <p className="text-sm text-gray-600">
                          {exercise.sets} sets × {exercise.reps} reps
                          {exercise.rest_time && ` • ${exercise.rest_time}s rest`}
                        </p>
                      </div>
                    </div>
                    {exercise.equipment && <Badge variant="outline">{exercise.equipment}</Badge>}
                  </div>

                  {exercise.instructions && (
                    <p className="text-gray-700 mb-4">{exercise.instructions}</p>
                  )}

                  {exercise.muscle_groups && exercise.muscle_groups.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {exercise.muscle_groups.map((muscle: string) => (
                        <Badge key={muscle} variant="secondary" className="text-xs">
                          {muscle}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {exercise.youtube_video_id && (
                    <ExerciseVideoPlayer
                      videoId={exercise.youtube_video_id}
                      exerciseName={exercise.name}
                    />
                  )}
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    </div>
  )
}