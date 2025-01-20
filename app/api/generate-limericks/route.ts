import { OpenAI } from 'openai'
import { NextResponse } from 'next/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const runtime = 'nodejs'
export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { transcript } = await req.json()

    const prompt = `Generate a funny limerick about Trent based on this description:
    ${transcript}
    
    Make it raunchy and playfully savage, perfect for a bachelor party.
    Must follow the classic AABBA rhyme scheme and traditional limerick meter.`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { 
          role: "system", 
          content: `You are a master of raunchy, no-holds-barred bachelor party limericks.
          You specialize in playful roasts that push the envelope.
          You understand the classic AABBA rhyme scheme and traditional limerick meter.
          You always respond with exactly one limerick, no additional text.` 
        },
        { 
          role: "user", 
          content: prompt 
        }
      ],
      temperature: 0.9,
      max_tokens: 100,
    })

    const limerick = completion.choices[0].message.content

    return NextResponse.json({ 
      success: true, 
      limerick 
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to generate limerick' 
    }, { status: 500 })
  }
}

