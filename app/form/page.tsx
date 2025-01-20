'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Mic, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const questions = [
  "What's your relationship with Trent?",
  "How would you describe Trent in one sentence?",
  "What's the most embarrassing story you know about Trent?",
  "What's Trent's most ridiculous habit?",
  "What's something Trent thinks he's good at, but isn't?",
  "What's the funniest thing you've seen Trent do?",
  "What's the most annoying thing about Trent?"
]

export default function Form() {
  const [step, setStep] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [fullTranscript, setFullTranscript] = useState('')
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null)
  const [audioLevel, setAudioLevel] = useState(0)
  const audioContext = useRef<AudioContext | null>(null)
  const analyser = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const router = useRouter()

  const progress = ((step + 1) / questions.length) * 100

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const newRecognition = new SpeechRecognition()
      newRecognition.continuous = true
      newRecognition.interimResults = true
      
      newRecognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join(' ')
        setFullTranscript(transcript)
      }

      newRecognition.onerror = (event: SpeechRecognitionEvent) => {
        console.error('Speech recognition error:', event.error)
        if (event.error.error !== 'no-speech') {
          setIsRecording(false)
          toast.error('Microphone error. Please try again.')
        }
      }

      setRecognition(newRecognition)
    } else {
      toast.error('Speech recognition is not supported in this browser')
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (audioContext.current?.state === 'running') {
        audioContext.current.close()
      }
    }
  }, [])

  const setupAudioVisualization = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      
      audioContext.current = new AudioContext()
      analyser.current = audioContext.current.createAnalyser()
      const source = audioContext.current.createMediaStreamSource(stream)
      source.connect(analyser.current)
      analyser.current.fftSize = 256
      
      const updateLevel = () => {
        if (!analyser.current || !isRecording) return
        const dataArray = new Uint8Array(analyser.current.frequencyBinCount)
        analyser.current.getByteFrequencyData(dataArray)
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length
        setAudioLevel(average)
        if (isRecording) requestAnimationFrame(updateLevel)
      }
      
      updateLevel()
    } catch (error) {
      console.error('Error accessing microphone:', error)
      throw new Error('Unable to access microphone')
    }
  }

  const handleToggleRecording = async () => {
    if (!recognition) {
      toast.error('Speech recognition is not available')
      return
    }

    if (isRecording) {
      if (step === questions.length - 1) {
        // On last question, stop recording and generate
        recognition.stop()
        setIsRecording(false)
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
        }
        if (audioContext.current?.state === 'running') {
          await audioContext.current.close()
        }
        handleSubmit()
      } else {
        // Just move to next question, keep recording
        setStep(step + 1)
      }
    } else {
      // Start recording
      try {
        await setupAudioVisualization()
        recognition.start()
        setIsRecording(true)
        setFullTranscript('')
      } catch (error) {
        console.error('Error starting recording:', error)
        toast.error('Failed to start recording. Please try again.')
      }
    }
  }

  const handleSubmit = async () => {
    if (!fullTranscript.trim()) {
      toast.error('No speech detected. Please try again.')
      return
    }

    setIsLoading(true)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    try {
      const response = await fetch('/api/generate-limericks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          transcript: fullTranscript,
          previousTranscripts: []
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate limericks')
      }

      router.push(`/results?limericks=${encodeURIComponent(JSON.stringify(data.limericks))}&transcripts=${encodeURIComponent(JSON.stringify([fullTranscript]))}`)
    } catch (error: unknown) {
      console.error('Error:', error)
      if (error instanceof Error && error.name === 'AbortError') {
        toast.error('Generation timed out. Please try again.')
      } else {
        toast.error(error instanceof Error ? error.message : 'Failed to generate limericks')
      }
    } finally {
      setIsLoading(false)
      clearTimeout(timeoutId)
    }
  }

  return (
    <main className="min-h-[100dvh] bg-gradient-to-b from-zinc-900 to-zinc-800 flex flex-col items-center justify-center p-4">
      <Card className={`w-full max-w-md mx-auto backdrop-blur-sm transition-colors duration-200 ${isLoading ? 'bg-black/40' : 'bg-white/10'}`}>
        <CardContent className="p-6 space-y-8 relative">
          {isLoading && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center rounded-lg z-50">
              <div className="text-center space-y-4">
                <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
                <p className="text-white font-medium">Crafting your roasts...</p>
              </div>
            </div>
          )}

          <div className={`space-y-2 transition-opacity duration-200 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
            <h2 className="text-xl md:text-2xl font-bold text-center text-white">
              Question {step + 1} of {questions.length}
            </h2>
            <Progress value={progress} className="h-2" />
          </div>

          <div className={`space-y-6 transition-opacity duration-200 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
            <p className="text-lg text-zinc-200 text-center">{questions[step]}</p>
            
            {isRecording && (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse" />
                </div>
                <div className="text-center text-zinc-200 animate-pulse">
                  Recording in progress...
                </div>
                <div className="relative w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="absolute inset-0 bg-amber-500 transition-all duration-100"
                    style={{ width: `${(audioLevel / 255) * 100}%` }}
                  />
                </div>
              </div>
            )}

            <Button
              onClick={handleToggleRecording}
              disabled={isLoading}
              size="lg"
              className="w-full h-16 bg-amber-500 hover:bg-amber-600 text-black transition-colors duration-200"
            >
              {isRecording ? (
                step === questions.length - 1 ? 'Finish & Generate' : 'Next Question'
              ) : (
                <>
                  <Mic className="mr-2 h-6 w-6" />
                  Start Recording
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

