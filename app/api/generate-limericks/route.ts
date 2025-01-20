import { OpenAI } from 'openai'
import { NextResponse } from 'next/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const runtime = 'nodejs'
export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { transcript, previousTranscripts = [] } = await req.json()

    const prompt = `Generate 2 unique and different funny limericks about Trent based on this description:
    ${transcript}
    
    ${previousTranscripts.length > 0 ? `Also consider these previous descriptions about Trent, but focus mainly on the latest description:
    ${previousTranscripts.join('\n')}` : ''}
    
    Make them raunchy and playfully savage, perfect for a bachelor party.
    Each must follow the classic AABBA rhyme scheme and traditional limerick meter.
    Return exactly 2 limericks, separated by two newlines.`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { 
          role: "system", 
          content: `You are a master of raunchy, no-holds-barred bachelor party limericks.
          You specialize in playful roasts that push the envelope.
          You understand the classic AABBA rhyme scheme and traditional limerick meter.
          You always respond with exactly 2 limericks, separated by two newlines.
          Each limerick should be unique and focus on different aspects of the description.` 
        },
        { 
          role: "user", 
          content: prompt 
        }
      ],
      temperature: 0.9,
      max_tokens: 300,
    })

    const limericks = completion.choices[0].message.content?.split('\n\n').filter(l => l.trim()) || []

    return NextResponse.json({ 
      success: true, 
      limericks 
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to generate limericks' 
    }, { status: 500 })
  }
}

