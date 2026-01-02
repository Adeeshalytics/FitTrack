"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Play, X } from "lucide-react"

interface ExerciseVideoPlayerProps {
  videoId: string
  exerciseName: string
}

export function ExerciseVideoPlayer({ videoId, exerciseName }: ExerciseVideoPlayerProps) {
  const [showVideo, setShowVideo] = useState(false)

  if (!showVideo) {
    return (
      <Button variant="outline" onClick={() => setShowVideo(true)} className="w-full">
        <Play className="w-4 h-4 mr-2" />
        Watch Exercise Demo
      </Button>
    )
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-700">Exercise Demo: {exerciseName}</p>
        <Button variant="ghost" size="sm" onClick={() => setShowVideo(false)}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
        <iframe
          className="absolute top-0 left-0 w-full h-full rounded-lg"
          src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
          title={`${exerciseName} Exercise Demo`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  )
}
