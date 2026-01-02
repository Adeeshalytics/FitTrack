"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Plus } from "lucide-react"
import { ExerciseVideoPlayer } from "./exercise-video-player"

interface ExerciseLibraryItem {
  id: string
  name: string
  description: string
  instructions: string
  muscle_groups: string[]
  equipment: string
  difficulty_level: string
  youtube_video_id: string
  calories_per_minute: number
  category: string
}

interface ExerciseSearchProps {
  onSelectExercise?: (exercise: ExerciseLibraryItem) => void
  showAddButton?: boolean
}

export function ExerciseSearch({ onSelectExercise, showAddButton = false }: ExerciseSearchProps) {
  const [exercises, setExercises] = useState<ExerciseLibraryItem[]>([])
  const [filteredExercises, setFilteredExercises] = useState<ExerciseLibraryItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedEquipment, setSelectedEquipment] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createBrowserClient()

  useEffect(() => {
    fetchExercises()
  }, [])

  useEffect(() => {
    filterExercises()
  }, [searchTerm, selectedCategory, selectedEquipment, exercises])

  const fetchExercises = async () => {
    try {
      const { data, error } = await supabase.from("exercise_library").select("*").order("name")

      if (error) throw error
      setExercises(data || [])
    } catch (error) {
      console.error("Error fetching exercises:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterExercises = () => {
    let filtered = exercises

    if (searchTerm) {
      filtered = filtered.filter(
        (exercise) =>
          exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          exercise.muscle_groups.some((muscle) => muscle.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((exercise) => exercise.category === selectedCategory)
    }

    if (selectedEquipment !== "all") {
      filtered = filtered.filter((exercise) => exercise.equipment === selectedEquipment)
    }

    setFilteredExercises(filtered)
  }

  const categories = ["all", ...Array.from(new Set(exercises.map((e) => e.category)))]
  const equipmentTypes = ["all", ...Array.from(new Set(exercises.map((e) => e.equipment)))]

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

  if (isLoading) {
    return <div className="text-center py-8">Loading exercises...</div>
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search exercises or muscle groups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex flex-wrap gap-1">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className="cursor-pointer capitalize"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
          <div className="flex flex-wrap gap-1">
            {equipmentTypes.map((equipment) => (
              <Badge
                key={equipment}
                variant={selectedEquipment === equipment ? "default" : "outline"}
                className="cursor-pointer capitalize"
                onClick={() => setSelectedEquipment(equipment)}
              >
                {equipment}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Exercise Results */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredExercises.map((exercise) => (
          <Card key={exercise.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-lg">{exercise.name}</h3>
                  <Badge className={getDifficultyColor(exercise.difficulty_level)}>{exercise.difficulty_level}</Badge>
                </div>

                <p className="text-sm text-gray-600 line-clamp-2">{exercise.description}</p>

                <div className="flex flex-wrap gap-1">
                  {exercise.muscle_groups.slice(0, 3).map((muscle) => (
                    <Badge key={muscle} variant="secondary" className="text-xs">
                      {muscle}
                    </Badge>
                  ))}
                  {exercise.muscle_groups.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{exercise.muscle_groups.length - 3}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="capitalize">{exercise.equipment}</span>
                  <span>{exercise.calories_per_minute} cal/min</span>
                </div>

                {exercise.youtube_video_id && (
                  <ExerciseVideoPlayer videoId={exercise.youtube_video_id} exerciseName={exercise.name} />
                )}

                {showAddButton && onSelectExercise && (
                  <Button
                    onClick={() => onSelectExercise(exercise)}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add to Workout
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredExercises.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No exercises found matching your criteria. Try adjusting your search or filters.
        </div>
      )}
    </div>
  )
}
