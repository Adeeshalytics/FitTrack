import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { WorkoutFrequencyChart } from "@/components/workout-frequency-chart"
import { VolumeProgressChart } from "@/components/volume-progress-chart"
import { ExerciseProgressChart } from "@/components/exercise-progress-chart"
import { LogoutButton } from "@/components/logout-button"

export default async function AnalyticsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  // Get workout data for analytics
  const { data: workouts } = await supabase
    .from("workouts")
    .select(`
      *,
      exercises (*)
    `)
    .eq("user_id", user.id)
    .order("date", { ascending: true })

  // Get exercise progression data
  const { data: exerciseData } = await supabase
    .from("exercises")
    .select(`
      *,
      workouts!inner (
        date,
        user_id
      )
    `)
    .eq("workouts.user_id", user.id)
    .order("workouts.date", { ascending: true })

  // Calculate analytics
  const totalWorkouts = workouts?.length || 0
  const totalExercises = workouts?.reduce((sum, workout) => sum + (workout.exercises?.length || 0), 0) || 0
  const avgWorkoutDuration = workouts?.length
    ? Math.round(workouts.reduce((sum, w) => sum + (w.duration || 0), 0) / workouts.length)
    : 0

  // Calculate current month vs last month
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

  const currentMonthWorkouts =
    workouts?.filter((w) => {
      const date = new Date(w.date)
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear
    }).length || 0

  const lastMonthWorkouts =
    workouts?.filter((w) => {
      const date = new Date(w.date)
      return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear
    }).length || 0

  const monthlyChange =
    lastMonthWorkouts > 0
      ? Math.round(((currentMonthWorkouts - lastMonthWorkouts) / lastMonthWorkouts) * 100)
      : currentMonthWorkouts > 0
        ? 100
        : 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard">← Dashboard</Link>
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">Analytics & Progress</h1>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Workouts</CardTitle>
              <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalWorkouts}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Exercises</CardTitle>
              <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalExercises}</div>
              <p className="text-xs text-muted-foreground">Exercises completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
              <svg className="h-4 w-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgWorkoutDuration}</div>
              <p className="text-xs text-muted-foreground">Minutes per workout</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Change</CardTitle>
              <svg className="h-4 w-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {monthlyChange > 0 ? "+" : ""}
                {monthlyChange}%
              </div>
              <p className="text-xs text-muted-foreground">vs last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Workout Frequency</CardTitle>
              <CardDescription>Your workout activity over the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <WorkoutFrequencyChart workouts={workouts || []} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Volume Progress</CardTitle>
              <CardDescription>Total workout volume over time</CardDescription>
            </CardHeader>
            <CardContent>
              <VolumeProgressChart workouts={workouts || []} />
            </CardContent>
          </Card>
        </div>

        {/* Exercise Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Exercise Progress</CardTitle>
            <CardDescription>Track your strength progression in key exercises</CardDescription>
          </CardHeader>
          <CardContent>
            <ExerciseProgressChart exercises={exerciseData || []} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
