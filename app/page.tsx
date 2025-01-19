import Link from 'next/link'
import { Beer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-900 to-zinc-800 flex flex-col items-center justify-center p-6">
      <Card className="w-full max-w-lg mx-auto backdrop-blur-sm bg-white/10">
        <CardContent className="flex flex-col items-center space-y-6 p-8">
          <div className="animate-bounce">
            <Beer className="w-16 h-16 text-amber-400" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-center bg-gradient-to-r from-amber-200 to-amber-400 text-transparent bg-clip-text">
            Trent gets Bent!
          </h1>
          
          <p className="text-center text-zinc-300 max-w-md">
            Welcome to the ultimate roast generator! Create hilarious limericks 
            for Trent&apos;s bachelor party by answering a few questions about our 
            beloved groom-to-be.
          </p>

          <Button 
            asChild
            className="bg-amber-500 hover:bg-amber-600 text-black font-bold transition-all duration-300 transform hover:scale-105"
          >
            <Link href="/form">
              Start Roasting
            </Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}

