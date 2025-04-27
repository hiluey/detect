import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { text } = await req.json()

  const apiKey = process.env.UNDETECTABLE_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  const res = await fetch("https://ai-detect.undetectable.ai/detect", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({
      text,
      key: apiKey,
      model: "xlm_ud_detector",
      retry_count: 0
    })
  })

  const data = await res.json()
  return NextResponse.json({ id: data.id })
}
