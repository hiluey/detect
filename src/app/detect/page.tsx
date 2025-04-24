'use client'

import { useState } from "react"
import { Loader2, Bot, Smile, AlertCircle } from "lucide-react"
import { useStore } from "@/lib/useStore"
import { saveAnalysis } from "@/lib/saveAnalysis"

export default function Home() {
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<number | null>(null)
  const [status, setStatus] = useState("")
  const { user } = useStore()

  const handleDetect = async () => {
    setLoading(true)
    setResult(null)
    setStatus("Analisando...")

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
        setStatus("Análise concluída.")
        await saveAnalysis({
          type: "detector",
          input_text: text,
          result: String(data.result),
          user,
        })
      } else {
        setStatus("Tempo limite. Tente novamente.")
      }
    } catch (err) {
      console.error(err)
      setStatus("Erro ao detectar.")
    }

    setLoading(false)
  }

  const getResultInfo = (score: number) => {
    if (score < 50) return { icon: <Smile className="text-green-600" />, label: "Humano", color: "bg-green-100 text-green-800" }
    if (score < 60) return { icon: <AlertCircle className="text-yellow-500" />, label: "Possível IA", color: "bg-yellow-100 text-yellow-700" }
    return { icon: <Bot className="text-red-600" />, label: "IA Detectada", color: "bg-red-100 text-red-700" }
  }

  const resultInfo = result !== null ? getResultInfo(result) : null

  return (
    <div className="flex justify-center items-center min-h-[80vh] px-4 py-12">
      <div className="w-full max-w-4xl bg-white border border-gray-200 rounded-3xl shadow-xl p-8 sm:p-10">
        <div className="mb-6 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
            <span className="text-blue-600">🤖</span> Análise de Texto com IA
          </h1>
          <p className="text-gray-500 text-sm mt-2">Cole seu texto abaixo para identificar sinais de geração por inteligência artificial.</p>
        </div>

        <textarea
          placeholder="Cole ou digite o texto aqui..."
          rows={8}
          className="w-full rounded-2xl border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none p-4 text-gray-700 text-base resize-none transition shadow-sm bg-gray-50"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleDetect}
            disabled={loading || !text.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-md flex items-center gap-2 disabled:opacity-50"
          >
            {loading && <Loader2 className="animate-spin" size={18} />}
            {loading ? "Analisando..." : "Detectar"}
          </button>
        </div>

        {status && (
          <p className="mt-6 text-center text-sm text-gray-500 italic">{status}</p>
        )}

        {resultInfo && (
          <div className={`mt-6 flex items-center justify-center gap-3 rounded-xl px-6 py-4 ${resultInfo.color}`}>
            {resultInfo.icon}
            <span className="font-semibold text-lg">
              Resultado: {result?.toFixed(2)}% — {resultInfo.label}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
