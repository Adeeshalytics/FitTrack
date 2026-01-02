import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { WorkoutPlanCard } from "@/components/workout-plan-card"
import { Button } from "@/components/ui/button"
import { Plus, Target, Clock, TrendingUp } from "lucide-react"
import Link from "next/link"

export default async function WorkoutPlansPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile for personalization
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Get workout plan templates
  const { data: templates } = await supabase
    .from("workout_plan_templates")
    .select(`
      *,
      template_exercises (
        id,
        name,
        sets,
        reps,
        muscle_groups,
        equipment
      )
    `)
    .order("created_at", { ascending: true })

  // Get user's active workout plans
  const { data: userPlans } = await supabase
    .from("user_workout_plans")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)

  // Filter templates based on user profile
  const recommendedTemplates =
    templates?.filter((template) => {
      if (!profile?.fitness_goal) return true
      return template.fitness_goal === profile.fitness_goal || template.fitness_goal === null
    }) || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Workout Plans</h1>
              <p className="text-gray-600">Personalized workout plans based on your fitness goals</p>
            </div>
            <Link href="/dashboard/workout-plans/create">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Custom Plan
              </Button>
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-center">
                <Target className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Active Plans</p>
                  <p className="text-2xl font-bold text-gray-900">{userPlans?.length || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Fitness Goal</p>
                  <p className="text-lg font-semibold text-gray-900 capitalize">
                    {profile?.fitness_goal?.replace("_", " ") || "Not set"}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Activity Level</p>
                  <p className="text-lg font-semibold text-gray-900 capitalize">
                    {profile?.activity_level || "Not set"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* My Active Plans */}
        {userPlans && userPlans.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">My Active Plans</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userPlans.map((plan) => (
                <div key={plan.id} className="bg-white rounded-lg p-6 shadow-sm border border-blue-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{plan.is_custom ? "Custom Plan" : "Template Plan"}</p>
                  <Link href={`/dashboard/workout-plans/${plan.id}`}>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">View Plan</Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Templates */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {profile?.fitness_goal ? "Recommended for You" : "Available Workout Plans"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedTemplates.map((template) => (
              <WorkoutPlanCard key={template.id} template={template} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
