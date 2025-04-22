/*import { Metadata } from "next"

export const metadata: Metadata = {
  title: 'AI-Detect Human',
  description: 'Detector de IA'
}

export default function Human() {
    return(
      <div>
        <h1>Human</h1>
      </div>
    )
  }*/

'use client'

import { useState } from 'react'

export default function HumanizerPage() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [loading, setLoading] = useState(false)

  const handleHumanize = async () => {
    setLoading(true)
    setOutputText('')

    try {
      // Etapa 1: enviar texto
      const submitRes = await fetch('https://humanize.undetectable.ai/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: '8895035d-0dd9-43ab-97a0-9aed70bb885d'
        },
        body: JSON.stringify({
          content: inputText,
          readability: 'High School',
          purpose: 'General Writing',
          strength: 'More Human',
          model: 'v11'
        })
      })

      const submitData = await submitRes.json()
      const documentId = submitData.id

      if (!documentId) {
        throw new Error('Erro ao enviar o texto.')
      }

      // Etapa 2: checar até estar pronto
      let tries = 0
      let resultData = null

      while (tries < 10) {
        await new Promise((r) => setTimeout(r, 3000)) // aguarda 3s entre tentativas

        const checkRes = await fetch('https://humanize.undetectable.ai/document', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: '8895035d-0dd9-43ab-97a0-9aed70bb885d'
          },
          body: JSON.stringify({ id: documentId })
        })

        resultData = await checkRes.json()

        if (resultData.output) {
          break
        }

        tries++
      }

      if (resultData?.output) {
        setOutputText(resultData.output)
      } else {
        setOutputText('Texto ainda não processado ou falha na resposta.')
      }
    } catch (error) {
      console.error(error)
      setOutputText('Erro ao humanizar o texto.')
    }

    setLoading(false)
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Humanizador de Texto</h1>

      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        rows={10}
        className="w-full border p-2 rounded mb-4"
        placeholder="Cole o texto com pelo menos 50 caracteres"
      />

      <button
        onClick={handleHumanize}
        disabled={loading || inputText.length < 50}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Processando...' : 'Humanizar'}
      </button>

      {outputText && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Texto Humanizado:</h2>
          <div className="whitespace-pre-wrap border rounded p-4 bg-gray-100">{outputText}</div>
        </div>
      )}
    </div>
  )
}
