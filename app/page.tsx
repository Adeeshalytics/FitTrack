import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900">FitTracker</CardTitle>
            <CardDescription className="text-lg text-gray-600">
              Track your workouts, monitor progress, and achieve your fitness goals
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700">
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full h-12 text-lg border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent"
            >
              <Link href="/auth/sign-up">Create Account</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
