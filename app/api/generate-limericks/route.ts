import { OpenAI } from 'openai'
import { NextResponse } from 'next/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const runtime = 'nodejs'
export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { answers } = await req.json()

    const prompt = `Generate a raunchy, roast-style limerick about Trent using these details:
    ${answers.join('\n')}
    
    Requirements:
    - Must follow the classic AABBA rhyme scheme
    - Should be hilarious and playfully savage
    - Include specific details from the provided information
    - Perfect for a wild bachelor party
    - Must be exactly 5 lines long
    - Each line should follow traditional limerick meter
    - Don't hold back on the humor, but avoid hate speech or slurs`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { 
          role: "system", 
          content: `You are a master of raunchy, no-holds-barred bachelor party limericks.
          You specialize in playful roasts that push the envelope while staying just this side of appropriate.
          You understand the classic AABBA rhyme scheme and traditional limerick meter.
          You excel at incorporating personal details into savage but funny burns.
          You always respond with exactly one limerick, no additional text or explanation.` 
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

