import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  console.log('Test API route called')
  try {
    console.log('Attempting to connect to OpenAI')
    const result = await streamText({
      model: openai('gpt-3.5-turbo'),
      messages: [
        {
          role: 'user',
          content: 'Write a single line test response.'
        }
      ]
    })

    const text = await result.text
    console.log('OpenAI response received:', text)
    return NextResponse.json({ success: true, text })
  } catch (error) {
    console.error('OpenAI API Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to connect to OpenAI',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500 
    })
  }
}

