'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Mic,
  MicOff,
  Play,
  Pause,
  Square,
  Trash2,
  Send
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AudioRecorderProps {
  onAudioReady: (audioBlob: Blob, duration: number) => void
  onCancel: () => void
  disabled?: boolean
  maxDuration?: number // in seconds
}

export function AudioRecorder({ 
  onAudioReady, 
  onCancel, 
  disabled = false,
  maxDuration = 300 // 5 minutes
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Format duration as MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setAudioBlob(blob)
        setAudioUrl(url)
        
        // Clean up stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
          streamRef.current = null
        }
      }

      mediaRecorder.start()
      setIsRecording(true)
      setDuration(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration(prev => {
          const newDuration = prev + 1
          // Auto-stop at max duration
          if (newDuration >= maxDuration) {
            stopRecording()
            return maxDuration
          }
          return newDuration
        })
      }, 1000)

    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Erro ao acessar o microfone. Verifique as permissões.')
    }
  }

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }

    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  // Play/pause audio
  const togglePlayback = () => {
    if (!audioRef.current || !audioUrl) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  // Delete recording
  const deleteRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    setAudioUrl(null)
    setAudioBlob(null)
    setDuration(0)
    setIsPlaying(false)
    onCancel()
  }

  // Send recording
  const sendRecording = () => {
    if (audioBlob) {
      onAudioReady(audioBlob, duration)
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleEnded = () => setIsPlaying(false)
    const handlePause = () => setIsPlaying(false)

    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('pause', handlePause)

    return () => {
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('pause', handlePause)
    }
  }, [audioUrl])

  // If currently recording
  if (isRecording) {
    return (
      <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
        <div className="flex items-center space-x-2 flex-1">
          <div className="relative">
            <Mic className="h-5 w-5 text-red-500" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          </div>
          <span className="text-sm font-medium text-red-600 dark:text-red-400">
            Gravando...
          </span>
          <span className="text-sm text-red-500 font-mono">
            {formatDuration(duration)}
          </span>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={stopRecording}
          className="text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/40"
        >
          <Square className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  // If has recorded audio
  if (audioUrl && audioBlob) {
    return (
      <div className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <audio ref={audioRef} src={audioUrl} preload="metadata" />
        
        <Button
          variant="ghost"
          size="icon"
          onClick={togglePlayback}
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/40"
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-blue-600 dark:text-blue-400">
              Áudio gravado
            </span>
            <span className="text-sm text-blue-500 font-mono">
              {formatDuration(duration)}
            </span>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={deleteRecording}
          className="text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/40"
        >
          <Trash2 className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={sendRecording}
          className="text-green-600 hover:text-green-700 hover:bg-green-100 dark:hover:bg-green-900/40"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  // Initial state - record button
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={startRecording}
      disabled={disabled}
      className="shrink-0"
    >
      <Mic className="h-5 w-5" />
    </Button>
  )
}

export default AudioRecorder