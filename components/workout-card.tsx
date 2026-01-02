import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Exercise {
  id: string
  name: string
  sets: number
  reps: number
  weight: number
}

interface Workout {
  id: string
  name: string
  date: string
  duration: number
  notes: string
  exercises: Exercise[]
}

interface WorkoutCardProps {
  workout: Workout
}

export function WorkoutCard({ workout }: WorkoutCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{workout.name}</CardTitle>
            <CardDescription>{formatDate(workout.date)}</CardDescription>
          </div>
          {workout.duration && <Badge variant="secondary">{workout.duration} min</Badge>}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{workout.exercises?.length || 0}</span> exercises
          </div>
          {workout.exercises && workout.exercises.length > 0 && (
            <div className="space-y-1">
              {workout.exercises.slice(0, 3).map((exercise) => (
                <div key={exercise.id} className="text-sm text-gray-500 flex justify-between">
                  <span>{exercise.name}</span>
                  <span>
                    {exercise.sets}×{exercise.reps}
                  </span>
                </div>
              ))}
              {workout.exercises.length > 3 && (
                <div className="text-xs text-gray-400">+{workout.exercises.length - 3} more exercises</div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
