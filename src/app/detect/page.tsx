'use client'

import { useState } from "react"
import { Loader2, Bot, Smile, AlertCircle, Clock, CheckCircle } from "lucide-react"
import { useStore } from "@/lib/useStore"
import { saveAnalysis } from "@/lib/saveAnalysis"

export default function Home() {
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<number | null>(null)
  const [status, setStatus] = useState("")
  const [platformsLoaded, setPlatformsLoaded] = useState(0)
  const { user } = useStore()

  const platforms = [
    "GPTZero", "OpenAI", "Writer", "QuillBot",
    "Copyleaks", "Sapling", "Grammarly", "ZeroGPT"
  ]

  const handleDetect = async () => {
    setLoading(true)
    setResult(null)
    setStatus("Analyzing...")
    setPlatformsLoaded(0)

    try {
      const detectRes = await fetch("/api/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      })

      const { id } = await detectRes.json()

      let retries = 0
      let data
      while (retries < 5) {
        await new Promise(res => setTimeout(res, 2000))
        const queryRes = await fetch("/api/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id })
        })
        data = await queryRes.json()
        if (data.status === "done") break
        retries++
      }

      if (data.status === "done") {
        setResult(data.result)
        setStatus("Analysis complete.")
        setPlatformsLoaded(platforms.length)

        await saveAnalysis({
          type: "detector",
          input_text: text,
          result: String(data.result),
          user,
        })
      } else {
        setStatus("Timeout. Please try again.")
      }
    } catch (err) {
      console.error(err)
      setStatus("Detection error.")
    }

    setLoading(false)
  }

  const getResultInfo = (score: number) => {
    const humanPercent = 100 - score
  
    if (humanPercent > 75) {
      return {
        icon: <Smile className="text-green-600" />,
        label: "Likely Human",
        color: "bg-green-100 text-green-800",
      }
    }
  
    if (score > 75) {
      return {
        icon: <Bot className="text-red-600" />,
        label: "Likely AI",
        color: "bg-red-100 text-red-700",
      }
    }
  
    return {
      icon: <AlertCircle className="text-yellow-500" />,
      label: "Mixed (AI + Human)",
      color: "bg-yellow-100 text-yellow-700",
    }
  }
  
  const resultInfo = result !== null ? getResultInfo(result) : null

  return (
    <div className="flex justify-center items-center min-h-[80vh] px-4 py-12">
      <div className="w-full max-w-4xl bg-white border border-gray-200 rounded-3xl shadow-xl p-8 sm:p-10 relative">
        <div className="mb-6 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
            <span className="text-blue-600">🤖</span> AI Text Analysis
          </h1>
          <p className="text-gray-500 text-sm mt-2">Paste your text below to detect potential AI-generated content.</p>
          <p className="text-gray-500 text-sm mt-2">Best accuracy with at least 200 words</p>
        </div>

        <div className="relative">
          <textarea
            placeholder="Paste or type your text here..."
            rows={8}
            maxLength={3000}
            className="w-full rounded-2xl border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none p-4 text-gray-700 text-base resize-none transition shadow-sm bg-gray-50 pr-20"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="absolute bottom-3 right-4 text-xs text-gray-400">
            {text.trim() ? text.trim().split(/\s+/).length : 0}/3000 words
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={handleDetect}
            disabled={loading || !text.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-md flex items-center gap-2 disabled:opacity-50"
          >
            {loading && <Loader2 className="animate-spin" size={18} />}
            {loading ? "Analyzing..." : "Detect"}
          </button>
        </div>

        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2 text-sm text-gray-600 justify-items-center">
          {platforms.map((name, i) => (
            <div key={name} className="flex items-center gap-2">
              {loading
                ? platformsLoaded > i
                  ? <CheckCircle className="text-green-500 w-4 h-4" />
                  : <Loader2 className="text-gray-400 w-4 h-4 animate-spin" />
                : platformsLoaded > i
                  ? <CheckCircle className="text-green-500 w-4 h-4" />
                  : <Clock className="text-gray-300 w-4 h-4" />}
              <span>{name}</span>
            </div>
          ))}
        </div>

        {status && (
          <p className="mt-6 text-center text-sm text-gray-500 italic">{status}</p>
        )}

        {loading && (
          <div className="mt-8 w-full">
            <div className="text-sm text-gray-600 font-semibold mb-1">
              Analyzing text...
            </div>
            <div className="w-full bg-gray-200 rounded-xl h-4 overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-blue-400 to-blue-600 animate-pulse"
                style={{ width: `${(platformsLoaded / platforms.length) * 100}%` }}
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-600">
                {(platformsLoaded / platforms.length * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        )}

{!loading && result !== null && (
  <>
    <div className="mt-8 flex items-center gap-4 text-sm text-gray-600">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-red-500 rounded-sm" />
        <span>AI</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-green-500 rounded-sm" />
        <span>Human</span>
      </div>
    </div>

    <div className="mt-2 w-full">

      <div className="text-sm text-gray-600 font-semibold mb-1">
        Result
      </div>
      <div className="w-full bg-gray-200 rounded-xl h-5 overflow-hidden relative flex text-xs font-semibold text-white">
        <div
          className="h-full bg-red-500 flex items-center justify-center"
          style={{ width: `${result}%` }}
        >
          {result.toFixed(1)}%
        </div>
        <div
          className="h-full bg-green-500 flex items-center justify-center"
          style={{ width: `${100 - result}%` }}
        >
          {(100 - result).toFixed(1)}%
        </div>
      </div>
    </div>

    <div className={`mt-6 flex items-center justify-center gap-3 rounded-xl px-6 py-4 ${resultInfo?.color}`}>
  {resultInfo?.icon}
  <span className="font-semibold text-lg">
    Result: {resultInfo?.label}
  </span>
</div>

  </>
)}



      </div>
    </div>
  )
}
