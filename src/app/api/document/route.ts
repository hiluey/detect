import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { id } = await req.json()

  const apiKey = process.env.UNDETECTABLE_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  const res = await fetch('https://humanize.undetectable.ai/document', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: apiKey,
    },
    body: JSON.stringify({ id }),
  })

  const data = await res.json()

  return NextResponse.json(data)
}
