import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { text } = await req.json()

  const res = await fetch("https://ai-detect.undetectable.ai/detect", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({
      text,
      key: "8895035d-0dd9-43ab-97a0-9aed70bb885d", 
      model: "xlm_ud_detector",
      retry_count: 0
    })
  })

  const data = await res.json()
  return NextResponse.json({ id: data.id })
}
