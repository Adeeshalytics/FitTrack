"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface Exercise {
  name: string
  sets: number
  reps: number
  weight: number
  restTime: number
  notes: string
}

interface ExerciseFormProps {
  onAddExercise: (exercise: Exercise) => void
}

export function ExerciseForm({ onAddExercise }: ExerciseFormProps) {
  const [name, setName] = useState("")
  const [sets, setSets] = useState("")
  const [reps, setReps] = useState("")
  const [weight, setWeight] = useState("")
  const [restTime, setRestTime] = useState("")
  const [notes, setNotes] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !sets || !reps) return

    onAddExercise({
      name,
      sets: Number.parseInt(sets),
      reps: Number.parseInt(reps),
      weight: Number.parseFloat(weight) || 0,
      restTime: Number.parseInt(restTime) || 0,
      notes,
    })

    // Reset form
    setName("")
    setSets("")
    setReps("")
    setWeight("")
    setRestTime("")
    setNotes("")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-white">
      <h4 className="font-medium text-gray-900">Add Exercise</h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="exerciseName">Exercise Name</Label>
          <Input
            id="exerciseName"
            placeholder="e.g., Bench Press"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sets">Sets</Label>
          <Input
            id="sets"
            type="number"
            placeholder="3"
            value={sets}
            onChange={(e) => setSets(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="reps">Reps</Label>
          <Input
            id="reps"
            type="number"
            placeholder="10"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="weight">Weight (kg)</Label>
          <Input
            id="weight"
            type="number"
            step="0.5"
            placeholder="50"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="restTime">Rest (seconds)</Label>
          <Input
            id="restTime"
            type="number"
            placeholder="60"
            value={restTime}
            onChange={(e) => setRestTime(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="exerciseNotes">Notes (optional)</Label>
        <Textarea
          id="exerciseNotes"
          placeholder="Form notes, difficulty, etc."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <Button type="submit" className="w-full">
        Add Exercise
      </Button>
    </form>
  )
}
