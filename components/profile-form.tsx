"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Profile {
  id: string
  full_name: string
  email: string
  age?: number
  height?: number
  weight?: number
  fitness_goal?: string
  activity_level?: string
  bio?: string
}

interface ProfileFormProps {
  profile: Profile | null
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [fullName, setFullName] = useState(profile?.full_name || "")
  const [age, setAge] = useState(profile?.age?.toString() || "")
  const [height, setHeight] = useState(profile?.height?.toString() || "")
  const [weight, setWeight] = useState(profile?.weight?.toString() || "")
  const [fitnessGoal, setFitnessGoal] = useState(profile?.fitness_goal || "")
  const [activityLevel, setActivityLevel] = useState(profile?.activity_level || "")
  const [bio, setBio] = useState(profile?.bio || "")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: fullName,
        email: profile?.email || user.email,
        age: age ? Number.parseInt(age) : null,
        height: height ? Number.parseFloat(height) : null,
        weight: weight ? Number.parseFloat(weight) : null,
        fitness_goal: fitnessGoal || null,
        activity_level: activityLevel || null,
        bio: bio || null,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      setSuccess(true)
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="25"
              min="13"
              max="120"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us a bit about yourself and your fitness journey..."
            rows={3}
          />
        </div>
      </div>

      {/* Physical Stats */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Physical Stats</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="height">Height (cm)</Label>
            <Input
              id="height"
              type="number"
              step="0.1"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="175"
              min="100"
              max="250"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="70"
              min="30"
              max="300"
            />
          </div>
        </div>
      </div>

      {/* Fitness Preferences */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Fitness Preferences</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fitnessGoal">Primary Fitness Goal</Label>
            <Select value={fitnessGoal} onValueChange={setFitnessGoal}>
              <SelectTrigger>
                <SelectValue placeholder="Select your goal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weight_loss">Weight Loss</SelectItem>
                <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                <SelectItem value="strength">Build Strength</SelectItem>
                <SelectItem value="endurance">Improve Endurance</SelectItem>
                <SelectItem value="general_fitness">General Fitness</SelectItem>
                <SelectItem value="athletic_performance">Athletic Performance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="activityLevel">Activity Level</Label>
            <Select value={activityLevel} onValueChange={setActivityLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Select activity level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sedentary">Sedentary (little/no exercise)</SelectItem>
                <SelectItem value="lightly_active">Lightly Active (1-3 days/week)</SelectItem>
                <SelectItem value="moderately_active">Moderately Active (3-5 days/week)</SelectItem>
                <SelectItem value="very_active">Very Active (6-7 days/week)</SelectItem>
                <SelectItem value="extremely_active">Extremely Active (2x/day or intense)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {error && <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</div>}

      {success && (
        <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
          Profile updated successfully!
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  )
}
