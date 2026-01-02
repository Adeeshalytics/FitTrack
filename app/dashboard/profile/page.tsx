import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ProfileForm } from "@/components/profile-form"
import { LogoutButton } from "@/components/logout-button"

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Get user stats
  const { data: totalWorkouts } = await supabase
    .from("workouts")
    .select("id", { count: "exact" })
    .eq("user_id", user.id)

  const { data: recentWorkout } = await supabase
    .from("workouts")
    .select("date")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .limit(1)
    .single()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard">← Dashboard</Link>
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">Profile</h1>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <CardTitle className="text-xl">{profile?.full_name || "User"}</CardTitle>
                <CardDescription>{profile?.email || user.email}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{totalWorkouts?.length || 0}</div>
                    <div className="text-xs text-gray-500">Total Workouts</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {recentWorkout
                        ? Math.ceil((Date.now() - new Date(recentWorkout.date).getTime()) / (1000 * 60 * 60 * 24))
                        : 0}
                    </div>
                    <div className="text-xs text-gray-500">Days Since Last</div>
                  </div>
                </div>

                {profile?.bio && (
                  <div className="pt-4 border-t">
                    <h4 className="font-medium text-gray-900 mb-2">About</h4>
                    <p className="text-sm text-gray-600">{profile.bio}</p>
                  </div>
                )}

                {profile?.fitness_goal && (
                  <div className="pt-4 border-t">
                    <h4 className="font-medium text-gray-900 mb-2">Fitness Goal</h4>
                    <p className="text-sm text-gray-600">{profile.fitness_goal}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Physical Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {profile?.age && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Age</span>
                    <span className="font-medium">{profile.age} years</span>
                  </div>
                )}
                {profile?.height && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Height</span>
                    <span className="font-medium">{profile.height} cm</span>
                  </div>
                )}
                {profile?.weight && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Weight</span>
                    <span className="font-medium">{profile.weight} kg</span>
                  </div>
                )}
                {profile?.activity_level && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Activity Level</span>
                    <span className="font-medium">{profile.activity_level}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
                <CardDescription>Update your personal information and fitness preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <ProfileForm profile={profile} />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
