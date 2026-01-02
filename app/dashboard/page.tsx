import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { WorkoutCard } from "@/components/workout-card"
import { DashboardStats } from "@/components/dashboard-stats"
import { LogoutButton } from "@/components/logout-button"
import { VoiceCommandButton } from "@/components/voice-command-button"
import { User, Dumbbell, TrendingUp, Calendar, Award } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  // Get user profile for personalized greeting
  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single()

  // Get user's recent workouts
  const { data: workouts } = await supabase
    .from("workouts")
    .select(`
      *,
      exercises (*)
    `)
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .limit(5)

  // Get workout stats
  const { data: totalWorkouts } = await supabase
    .from("workouts")
    .select("id", { count: "exact" })
    .eq("user_id", user.id)

  const { data: thisWeekWorkouts } = await supabase
    .from("workouts")
    .select("id", { count: "exact" })
    .eq("user_id", user.id)
    .gte("date", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  FitTracker
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <VoiceCommandButton />
              <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
                <Link href="/dashboard/analytics">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Analytics
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
                <Link href="/dashboard/workout-plans">
                  <Calendar className="w-4 h-4 mr-2" />
                  Plans
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="hidden lg:inline-flex">
                <Link href="/dashboard/exercises">Exercises</Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="hidden lg:inline-flex">
                <Link href="/dashboard/calories">Calories</Link>
              </Button>
              <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30">
                <Link href="/dashboard/log-workout">Log Workout</Link>
              </Button>
              <Button asChild variant="ghost" size="icon" className="rounded-full">
                <Link href="/dashboard/profile">
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center ring-2 ring-blue-200">
                    <User className="w-5 h-5 text-blue-700" />
                  </div>
                </Link>
              </Button>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
        {/* Welcome Section */}
        <div className="mb-10">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Award className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Welcome back{profile?.full_name ? `, ${profile.full_name}` : ""}!
              </h2>
              <p className="text-gray-600 mt-1">Keep crushing your fitness goals 💪</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-10">
          <DashboardStats totalWorkouts={totalWorkouts?.length || 0} thisWeekWorkouts={thisWeekWorkouts?.length || 0} />
        </div>

        {/* Recent Workouts */}
        <div className="mt-10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Recent Workouts</h3>
            <Button asChild variant="outline" className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-colors">
              <Link href="/dashboard/workouts">View All</Link>
            </Button>
          </div>

          {workouts && workouts.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {workouts.map((workout) => (
                <WorkoutCard key={workout.id} workout={workout} />
              ))}
            </div>
          ) : (
            <Card className="border-none shadow-xl bg-white/60 backdrop-blur-sm">
              <CardContent className="flex flex-col items-center justify-center py-16 px-8">
                <div className="relative mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center">
                    <Dumbbell className="w-12 h-12 text-blue-600" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-xl">✨</span>
                  </div>
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-2">Start Your Journey</h4>
                <p className="text-gray-600 text-center mb-8 max-w-sm">
                  Ready to transform your fitness? Log your first workout and watch your progress soar!
                </p>
                <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30">
                  <Link href="/dashboard/log-workout">
                    <Dumbbell className="w-5 h-5 mr-2" />
                    Log Your First Workout
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Actions - Optional Footer Section */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/dashboard/workout-plans" className="group">
            <Card className="border-none shadow-md hover:shadow-xl transition-all duration-300 bg-white/60 backdrop-blur-sm hover:-translate-y-1">
              <CardContent className="flex flex-col items-center justify-center py-6">
                <Calendar className="w-8 h-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-gray-900">Plans</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/analytics" className="group">
            <Card className="border-none shadow-md hover:shadow-xl transition-all duration-300 bg-white/60 backdrop-blur-sm hover:-translate-y-1">
              <CardContent className="flex flex-col items-center justify-center py-6">
                <TrendingUp className="w-8 h-8 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-gray-900">Analytics</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/exercises" className="group">
            <Card className="border-none shadow-md hover:shadow-xl transition-all duration-300 bg-white/60 backdrop-blur-sm hover:-translate-y-1">
              <CardContent className="flex flex-col items-center justify-center py-6">
                <Dumbbell className="w-8 h-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-gray-900">Exercises</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/calories" className="group">
            <Card className="border-none shadow-md hover:shadow-xl transition-all duration-300 bg-white/60 backdrop-blur-sm hover:-translate-y-1">
              <CardContent className="flex flex-col items-center justify-center py-6">
                <Award className="w-8 h-8 text-amber-600 mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-gray-900">Calories</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  )
}