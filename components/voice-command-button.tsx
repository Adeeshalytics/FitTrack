"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Volume2 } from "lucide-react"
import { useVoiceCommands } from "@/hooks/use-voice-commands"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export function VoiceCommandButton() {
  const [showCommands, setShowCommands] = useState(false)
  const { isListening, isSupported, transcript, lastCommand, commands, startListening, stopListening } =
    useVoiceCommands()

  if (!isSupported) {
    return null
  }

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant={isListening ? "destructive" : "outline"}
        size="sm"
        onClick={isListening ? stopListening : startListening}
        className="relative"
      >
        {isListening ? (
          <>
            <MicOff className="w-4 h-4 mr-2" />
            Stop
          </>
        ) : (
          <>
            <Mic className="w-4 h-4 mr-2" />
            Voice
          </>
        )}
        {isListening && <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />}
      </Button>

      <Popover open={showCommands} onOpenChange={setShowCommands}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm">
            <Volume2 className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm mb-2">Voice Commands</h4>
              <div className="space-y-1">
                {commands.map((command, index) => (
                  <div key={index} className="text-xs text-gray-600 p-2 bg-gray-50 rounded">
                    "{command}"
                  </div>
                ))}
              </div>
            </div>

            {transcript && (
              <div>
                <h5 className="font-medium text-xs text-gray-700 mb-1">Last Heard:</h5>
                <Badge variant="outline" className="text-xs">
                  {transcript}
                </Badge>
              </div>
            )}

            {lastCommand && (
              <div>
                <h5 className="font-medium text-xs text-gray-700 mb-1">Status:</h5>
                <Badge variant="secondary" className="text-xs">
                  {lastCommand}
                </Badge>
              </div>
            )}

            {isListening && (
              <div className="text-center">
                <div className="inline-flex items-center text-xs text-blue-600">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2" />
                  Listening...
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
