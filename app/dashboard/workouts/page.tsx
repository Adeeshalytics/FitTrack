import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { WorkoutCard } from "@/components/workout-card"
import { LogoutButton } from "@/components/logout-button"

export default async function WorkoutsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  // Get all user's workouts
  const { data: workouts } = await supabase
    .from("workouts")
    .select(`
      *,
      exercises (*)
    `)
    .eq("user_id", user.id)
    .order("date", { ascending: false })

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
              <h1 className="text-xl font-semibold text-gray-900">All Workouts</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="/dashboard/log-workout">Log Workout</Link>
              </Button>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Workout History</h2>
          <p className="text-gray-600">{workouts?.length || 0} total workouts logged</p>
        </div>

        {workouts && workouts.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {workouts.map((workout) => (
              <WorkoutCard key={workout.id} workout={workout} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No workouts yet</h3>
            <p className="text-gray-500 mb-4">Start your fitness journey by logging your first workout</p>
            <Button asChild>
              <Link href="/dashboard/log-workout">Log Your First Workout</Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
