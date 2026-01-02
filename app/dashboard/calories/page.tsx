"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus, Target, TrendingUp, Trash2 } from "lucide-react"

interface Meal {
  id: string
  meal_name: string
  calories: number
  meal_type: string
  created_at: string
}

export default function CaloriesPage() {
  const [dailyTarget, setDailyTarget] = useState(2000)
  const [meals, setMeals] = useState<Meal[]>([])
  const [newMealName, setNewMealName] = useState("")
  const [newMealCalories, setNewMealCalories] = useState("")
  const [newMealType, setNewMealType] = useState("breakfast")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showAddMeal, setShowAddMeal] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadCalorieData()
  }, [])

  const loadCalorieData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const today = new Date().toISOString().split("T")[0]

      // Load daily goal
      const { data: goalData } = await supabase
        .from("daily_calorie_goals")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", today)
        .single()

      if (goalData) {
        setDailyTarget(goalData.target_calories)
      }

      // Load today's meals
      const { data: mealsData } = await supabase
        .from("meals")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", today)
        .order("created_at", { ascending: false })

      if (mealsData) {
        setMeals(mealsData)
      }
    } catch (error) {
      console.error("Error loading calorie data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateDailyGoal = async () => {
    setIsSaving(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const today = new Date().toISOString().split("T")[0]

      await supabase
        .from("daily_calorie_goals")
        .upsert({
          user_id: user.id,
          target_calories: dailyTarget,
          date: today,
        })
        .select()

      alert("Daily goal updated!")
    } catch (error) {
      console.error("Error updating goal:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const addMeal = async () => {
    if (!newMealName || !newMealCalories) return

    setIsSaving(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const today = new Date().toISOString().split("T")[0]

      const { data, error } = await supabase
        .from("meals")
        .insert({
          user_id: user.id,
          meal_name: newMealName,
          calories: Number.parseInt(newMealCalories),
          meal_type: newMealType,
          date: today,
        })
        .select()
        .single()

      if (error) throw error

      setMeals([data, ...meals])
      setNewMealName("")
      setNewMealCalories("")
      setNewMealType("breakfast")
      setShowAddMeal(false)
    } catch (error) {
      console.error("Error adding meal:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const deleteMeal = async (mealId: string) => {
    try {
      await supabase.from("meals").delete().eq("id", mealId)
      setMeals(meals.filter((meal) => meal.id !== mealId))
    } catch (error) {
      console.error("Error deleting meal:", error)
    }
  }

  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0)
  const remainingCalories = dailyTarget - totalCalories
  const progressPercentage = Math.min((totalCalories / dailyTarget) * 100, 100)

  const getMealTypeColor = (type: string) => {
    switch (type) {
      case "breakfast":
        return "bg-yellow-100 text-yellow-800"
      case "lunch":
        return "bg-blue-100 text-blue-800"
      case "dinner":
        return "bg-purple-100 text-purple-800"
      case "snack":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">Loading calorie data...</div>
        </div>
      </div>
    )
  }

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
              <h1 className="text-xl font-semibold text-gray-900">Calorie Tracking</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Daily Goal Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-5 h-5 mr-2 text-blue-600" />
              Daily Calorie Goal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-3">
              <Input
                type="number"
                value={dailyTarget}
                onChange={(e) => setDailyTarget(Number.parseInt(e.target.value) || 0)}
                className="w-32"
              />
              <span className="text-gray-600">calories</span>
              <Button onClick={updateDailyGoal} disabled={isSaving} size="sm">
                {isSaving ? "Saving..." : "Update Goal"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Progress Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{dailyTarget}</div>
                <div className="text-sm text-gray-600">Target</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{totalCalories}</div>
                <div className="text-sm text-gray-600">Consumed</div>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-bold ${remainingCalories >= 0 ? "text-orange-600" : "text-red-600"}`}>
                  {Math.abs(remainingCalories)}
                </div>
                <div className="text-sm text-gray-600">{remainingCalories >= 0 ? "Remaining" : "Over"}</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
              <div
                className={`h-4 rounded-full transition-all duration-300 ${
                  progressPercentage > 100 ? "bg-red-600" : "bg-blue-600"
                }`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="text-center text-sm text-gray-600">{progressPercentage.toFixed(0)}% of daily goal</div>
          </CardContent>
        </Card>

        {/* Add Meal Button */}
        {!showAddMeal && (
          <Button onClick={() => setShowAddMeal(true)} className="w-full mb-6" size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Add Meal
          </Button>
        )}

        {/* Add Meal Form */}
        {showAddMeal && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Add New Meal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mealName">Meal Name</Label>
                <Input
                  id="mealName"
                  placeholder="e.g., Chicken Salad"
                  value={newMealName}
                  onChange={(e) => setNewMealName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mealCalories">Calories</Label>
                <Input
                  id="mealCalories"
                  type="number"
                  placeholder="e.g., 350"
                  value={newMealCalories}
                  onChange={(e) => setNewMealCalories(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mealType">Meal Type</Label>
                <select
                  id="mealType"
                  value={newMealType}
                  onChange={(e) => setNewMealType(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
              </div>
              <div className="flex space-x-3">
                <Button onClick={addMeal} disabled={isSaving || !newMealName || !newMealCalories} className="flex-1">
                  {isSaving ? "Adding..." : "Add Meal"}
                </Button>
                <Button onClick={() => setShowAddMeal(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Meals List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
              Today's Meals
            </CardTitle>
          </CardHeader>
          <CardContent>
            {meals.length > 0 ? (
              <div className="space-y-3">
                {meals.map((meal) => (
                  <div key={meal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge className={getMealTypeColor(meal.meal_type)}>{meal.meal_type}</Badge>
                      <div>
                        <div className="font-medium text-gray-900">{meal.meal_name}</div>
                        <div className="text-sm text-gray-600">{meal.calories} calories</div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMeal(meal.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No meals logged yet today.</p>
                <p className="text-sm">Click "Add Meal" to start tracking your calories!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
