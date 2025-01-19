'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const questions = [
  "What's your relationship with Trent?",
  "How would you describe Trent in one sentence?",
  "What's the most embarrassing story you know about Trent?",
  "What's Trent's most ridiculous habit?",
  "What's something Trent thinks he's good at, but isn't?",
  "What's the funniest thing you've seen Trent do when drunk?",
  "What's the most annoying thing about Trent?",

]

export default function Form() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState(Array(questions.length).fill(''))
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const progress = ((step + 1) / questions.length) * 100

  const handleNext = () => {
    if (step < questions.length - 1) {
      setStep(step + 1)
    } else {
      handleSubmit()
    }
  }

  const handlePrevious = () => {
    if (step > 0) {
      setStep(step - 1)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newAnswers = [...answers]
    newAnswers[step] = e.target.value
    setAnswers(newAnswers)
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    try {
      const response = await fetch('/api/generate-limericks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate limerick')
      }

      router.push(`/results?limericks=${encodeURIComponent(JSON.stringify([data.limerick]))}`)
    } catch (error: unknown) {
      console.error('Error:', error)
      if (error instanceof Error && error.name === 'AbortError') {
        toast.error('Generation timed out. Please try again.')
      } else {
        toast.error(error instanceof Error ? error.message : 'Failed to generate limerick')
      }
    } finally {
      setIsLoading(false)
      clearTimeout(timeoutId)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-900 to-zinc-800 flex flex-col items-center justify-center p-6">
      <Card className="w-full max-w-lg mx-auto backdrop-blur-sm bg-white/10">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-center text-white">
              Question {step + 1} of {questions.length}
            </h2>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="space-y-4">
            <p className="text-lg text-zinc-200">{questions[step]}</p>
            <Textarea
              value={answers[step]}
              onChange={handleChange}
              placeholder="Type your answer here..."
              className="min-h-[120px] bg-white/5 border-white/10 text-white"
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-between pt-4">
            <Button
              onClick={handlePrevious}
              disabled={step === 0 || isLoading}
              variant="outline"
              className="bg-white/5 border-white/10 text-white hover:bg-white/10"
            >
              Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={isLoading}
              className="bg-amber-500 hover:bg-amber-600 text-black"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                step === questions.length - 1 ? 'Generate Limerick' : 'Next'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

