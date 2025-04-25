'use client'

import { useState } from 'react'
import { saveAnalysis } from '@/lib/saveAnalysis'
import { useStore } from '@/lib/useStore'
import { Copy } from 'lucide-react'

export default function HumanizerPage() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const { user } = useStore()

  const handleHumanize = async () => {
    if (!user) {
      setOutputText('You must be logged in to use the humanizer.')
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

      const { id: documentId } = await submitRes.json()
      if (!documentId) throw new Error('Submission failed.')

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
        setOutputText('Processing failed or no output returned.')
      }
    } catch (error) {
      console.error(error)
      setOutputText('An error occurred while processing the text.')
    }

    setLoading(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex justify-center items-center min-h-[80vh] px-4 py-12">
      <div className="w-full max-w-4xl bg-white border border-gray-200 rounded-3xl shadow-xl p-8 sm:p-10">
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">📝 Text Humanizer</h1>
          <p className="text-gray-500 text-sm mt-2">Make your text sound more natural and human-like.</p>
          <p className="text-gray-500 text-sm mt-1">Minimum recommended length: 50 characters</p>
        </div>

        <div className="relative">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={8}
            className="w-full rounded-2xl border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none p-4 text-gray-700 text-base resize-none transition shadow-sm bg-gray-50 pr-20"
            placeholder="Paste your text here..."
          />
          <div className="absolute bottom-3 right-4 text-xs text-gray-400">
            {inputText.trim() ? inputText.trim().split(/\s+/).length : 0}/3000 words
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={handleHumanize}
            disabled={loading || inputText.length < 50}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-md flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Humanize'}
          </button>
        </div>

        {outputText && (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-semibold text-gray-800">Humanized Text</h2>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline"
              >
                <Copy size={16} />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="whitespace-pre-wrap border rounded-2xl p-5 bg-gray-100 text-gray-700 shadow-inner transition-all duration-300 text-base">
              {outputText}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
