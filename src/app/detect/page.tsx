'use client'

import { useState } from "react"
import { saveAnalysis } from "@/lib/saveAnalysis"
import { useStore } from "@/lib/useStore"

export default function Home() {
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<number | null>(null)
  const [status, setStatus] = useState("")

  const { user } = useStore() // <-- pega o usuário (pode ser undefined)

  const handleDetect = async () => {
    setLoading(true)
    setResult(null)
    setStatus("Detectando...")

    try {
      const detectRes = await fetch("/api/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      })

      const { id } = await detectRes.json()

      // Espera e consulta o resultado
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

        // Salvar no Supabase
        await saveAnalysis({
          type: "detector",
          input_text: text,
          result: String(data.result),
          user, // <-- funciona mesmo que undefined
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

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Detector de IA</h1>

      <textarea
        placeholder="Cole seu texto aqui..."
        rows={10}
        className="w-full border p-2 rounded mb-4"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button
        onClick={handleDetect}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Detectando..." : "Detectar"}
      </button>

      <div className="mt-6">
        <p>{status}</p>
        {result !== null && (
          <p>
            Resultado: <strong>{result}</strong> —{" "}
            {result < 50
              ? "Humano"
              : result < 60
              ? "Possível IA"
              : "IA Detectada"}
          </p>
        )}
      </div>
    </div>
  )
}
