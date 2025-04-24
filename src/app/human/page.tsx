'use client'

import { useState } from 'react'
import { saveAnalysis } from '@/lib/saveAnalysis'
import { useStore } from '@/lib/useStore'

export default function HumanizerPage() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [loading, setLoading] = useState(false)
  const { user } = useStore()

  const handleHumanize = async () => {
    if (!user) {
      setOutputText('Você precisa estar logado para usar o humanizador.')
      return
    }

    setLoading(true)
    setOutputText('')

    try {
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

      if (!documentId) throw new Error('Erro ao enviar o texto.')

      let tries = 0
      let resultData = null

      while (tries < 10) {
        await new Promise((r) => setTimeout(r, 3000))

        const checkRes = await fetch('https://humanize.undetectable.ai/document', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: '8895035d-0dd9-43ab-97a0-9aed70bb885d'
          },
          body: JSON.stringify({ id: documentId })
        })

        resultData = await checkRes.json()
        if (resultData.output) break

        tries++
      }

      if (resultData?.output) {
        setOutputText(resultData.output)
        await saveAnalysis({
          user,
          type: 'humanizer',
          input_text: inputText,
          result: resultData.output
        })
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
    <div className="flex justify-center items-center min-h-[80vh] px-4 py-12">
      <div className="w-full max-w-4xl bg-white border border-gray-200 rounded-3xl shadow-xl p-8 sm:p-10">
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">📝 Humanizador de Texto</h1>
          <p className="text-gray-500 text-sm mt-2">Transforme seu texto para soar mais natural e humano.</p>
        </div>

        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          rows={8}
          className="w-full rounded-2xl border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none p-4 text-gray-700 text-base resize-none transition shadow-sm bg-gray-50"
          placeholder="Cole o texto com pelo menos 50 caracteres"
        />

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleHumanize}
            disabled={loading || inputText.length < 50}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-md flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Processando...' : 'Humanizar'}
          </button>
        </div>

        {outputText && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-3 text-gray-800">Texto Humanizado:</h2>
            <div className="whitespace-pre-wrap border rounded-2xl p-5 bg-gray-100 text-gray-700 shadow-inner transition-all duration-300">
              {outputText}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
