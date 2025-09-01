import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { id } = await req.json()

  const res = await fetch("https://ai-detect.undetectable.ai/query", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({ id })
  })

  const data = await res.json()
  return NextResponse.json(data)
}
