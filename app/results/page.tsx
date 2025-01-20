'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Beer, Mic, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

function ResultsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isRecording, setIsRecording] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null)
  const [audioLevel, setAudioLevel] = useState(0)
  const audioContext = useRef<AudioContext | null>(null)
  const analyser = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  
  const previousTranscripts = JSON.parse(decodeURIComponent(searchParams.get('transcripts') || '[]'))
  const limericks = JSON.parse(decodeURIComponent(searchParams.get('limericks') || '[]'))

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const newRecognition = new SpeechRecognition()
      newRecognition.continuous = true
      newRecognition.interimResults = true
      
      newRecognition.onresult = (event: SpeechRecognitionEvent) => {
        const text = Array.from(event.results)
          .map(result => result[0].transcript)
          .join(' ')
        setTranscript(text)
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
      // Stop recording and generate
      recognition.stop()
      setIsRecording(false)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (audioContext.current?.state === 'running') {
        await audioContext.current.close()
      }
      handleGenerate()
    } else {
      // Start recording
      try {
        await setupAudioVisualization()
        recognition.start()
        setIsRecording(true)
        setTranscript('')
      } catch (error) {
        console.error('Error starting recording:', error)
        toast.error('Failed to start recording. Please try again.')
      }
    }
  }

  const handleGenerate = async () => {
    if (!transcript.trim()) {
      toast.error('No speech detected. Please try again.')
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate-limericks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript,
          previousTranscripts: previousTranscripts
        })
      })

      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate limericks')
      }

      const updatedTranscripts = [...previousTranscripts, transcript]
      const updatedLimericks = [...limericks, ...data.limericks]
      router.push(`/results?limericks=${encodeURIComponent(JSON.stringify(updatedLimericks))}&transcripts=${encodeURIComponent(JSON.stringify(updatedTranscripts))}`)
      setTranscript('')
    } catch (error) {
      console.error('Error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to generate limericks')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 min-h-screen flex flex-col">
      <div className="text-center mb-8 sm:mb-12">
        <Beer className="w-10 h-10 sm:w-12 sm:h-12 text-amber-400 mx-auto mb-4" />
        <h2 className="text-2xl sm:text-3xl font-bold text-white">Your Limericks for Trent</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 mb-20">
        {[...limericks].reverse().map((limerick: string, index: number) => {
          const isLatestBatch = index < 2;
          return (
            <Card 
              key={limericks.length - 1 - index}
              className={`backdrop-blur-sm transform transition-all duration-200 hover:scale-[1.02] h-full
                ${isLatestBatch ? 'bg-amber-500/[0.08] ring-2 ring-amber-500/40 border border-amber-500/30' : 'bg-white/10'}`}
            >
              <CardContent className="p-4 sm:p-8">
                <pre className="whitespace-pre-wrap text-zinc-200 font-serif text-base sm:text-lg leading-relaxed">
                  {limerick}
                </pre>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="sticky bottom-4 sm:bottom-6 mt-auto">
        <div className="max-w-2xl mx-auto">
          <Card className="backdrop-blur-lg bg-zinc-900/90 shadow-xl border border-white/5">
            <CardContent className="p-4 sm:p-8 space-y-4 sm:space-y-6">
              <div className="space-y-1 sm:space-y-2">
                <h3 className="text-lg sm:text-xl font-bold text-white">Generate More Limericks</h3>
                <p className="text-sm sm:text-base text-zinc-300">What else would you like to roast Trent on?</p>
              </div>
              
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

              {isGenerating && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center rounded-lg z-50">
                  <div className="text-center space-y-4">
                    <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
                    <p className="text-white font-medium">Crafting your roasts...</p>
                  </div>
                </div>
              )}

              <Button
                onClick={handleToggleRecording}
                disabled={isGenerating}
                className="w-full bg-amber-500 hover:bg-amber-600 text-black h-12 sm:h-16 relative text-sm sm:text-base"
              >
                {isRecording ? (
                  'Tap to Generate Limericks'
                ) : (
                  <>
                    <Mic className="mr-2 h-6 w-6" />
                    Start Recording
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <div className="text-center mt-3 sm:mt-4">
            <Button
              onClick={() => router.push('/')}
              variant="outline"
              className="bg-zinc-800/95 border-amber-500/20 text-amber-100 hover:bg-zinc-700/95 hover:border-amber-500/30 hover:text-amber-50 text-sm sm:text-base h-10 sm:h-11 backdrop-blur-sm shadow-lg"
            >
              Start Fresh
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Results() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-900 to-zinc-800 p-6">
      <Suspense fallback={
        <div className="text-center text-white">
          Loading results...
        </div>
      }>
        <ResultsContent />
      </Suspense>
    </main>
  )
}

