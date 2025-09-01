import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { inputText } = await req.json()

  const apiKey = process.env.UNDETECTABLE_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  const submitRes = await fetch('https://humanize.undetectable.ai/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: apiKey
    },
    body: JSON.stringify({
      content: inputText,
      readability: 'High School',
      purpose: 'General Writing',
      strength: 'More Human',
      model: 'v11'
    })
  })

  const data = await submitRes.json()

  return NextResponse.json(data)
}
