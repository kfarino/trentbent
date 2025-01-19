'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Beer } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

function ResultsContent() {
  const searchParams = useSearchParams()
  const limericks = JSON.parse(decodeURIComponent(searchParams.get('limericks') || '[]'))

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-4">
        <Beer className="w-12 h-12 text-amber-400 mx-auto" />
        <h2 className="text-3xl font-bold text-white">Your Limericks for Trent</h2>
      </div>

      {limericks.map((limerick: string, index: number) => (
        <Card key={index} className="backdrop-blur-sm bg-white/10">
          <CardContent className="p-6">
            <pre className="whitespace-pre-wrap text-zinc-200 font-serif text-lg">
              {limerick}
            </pre>
          </CardContent>
        </Card>
      ))}

      <div className="text-center pt-6">
        <Button asChild className="bg-amber-500 hover:bg-amber-600 text-black">
          <Link href="/">
            Create More Limericks
          </Link>
        </Button>
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

