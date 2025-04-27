'use client'

import { useState } from 'react'
import { saveAnalysis } from '@/lib/saveAnalysis'
import { useStore } from '@/lib/useStore'
import { Copy, Loader2 } from 'lucide-react'

export default function HumanizerPage() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const { user } = useStore()

  // Handle text humanization process
  const handleHumanize = async () => {
    if (!user) {
      setOutputText('⚠️ You must be logged in to use the humanizer.')
      return
    }

    if (inputText.trim().length < 50) {
      setOutputText('⚠️ Minimum input length is 50 characters.')
      return
    }

    setLoading(true)
    setOutputText('')

    try {
      // 1. Submit the text to internal API
      const submitRes = await fetch('/api/humanize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputText }),
      })

      const { id: documentId } = await submitRes.json()
      if (!documentId) throw new Error('Submission failed.')

      // 2. Polling to check the result
      let tries = 0
      let resultData: any = null

      while (tries < 10) {
        await new Promise((r) => setTimeout(r, 3000))

        const checkRes = await fetch('/api/document', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: documentId }),
        })

        resultData = await checkRes.json()
        if (resultData.output) break

        tries++
      }

      if (resultData?.output) {
        setOutputText(resultData.output)

        // Save the analysis result
        await saveAnalysis({
          user,
          type: 'humanizer',
          input_text: inputText,
          result: resultData.output,
        })
      } else {
        setOutputText('❌ Processing failed or no output returned.')
      }
    } catch (error) {
      console.error('Humanization error:', error)
      setOutputText('❌ An error occurred while processing the text.')
    } finally {
      setLoading(false)
    }
  }

  // Handle copying output text to clipboard
  const handleCopy = () => {
    if (!outputText) return
    navigator.clipboard.writeText(outputText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-screen px-4 py-6 bg-gray-50">
      <div className="w-full max-w-6xl bg-white border border-gray-200 rounded-2xl shadow-2xl p-6 sm:p-8">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 flex items-center justify-center gap-2">
            📝 Text Humanizer
          </h1>
          <p className="text-gray-500 text-base mt-3">
            Make your text sound more natural and human-like.
          </p>
          <p className="text-gray-400 text-sm mt-1">
            Minimum recommended length: 50 characters
          </p>
        </div>

        {/* Input textarea */}
        <div className="relative">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={8}
            maxLength={3000}
            placeholder="Paste or type your text here..."
            className="w-full rounded-2xl border border-gray-300 focus:ring-4 focus:ring-blue-300 focus:outline-none p-4 text-gray-700 text-sm resize-none transition shadow-sm bg-gray-100 pr-24"
          />
          <div className="absolute bottom-2 right-4 text-xs text-gray-400">
            {inputText.trim() ? inputText.trim().split(/\s+/).length : 0}/3000 words
          </div>
        </div>

        {/* Humanize button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleHumanize}
            disabled={loading || inputText.trim().length < 50}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold px-6 py-2 rounded-full shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                Processing...
              </>
            ) : (
              <>
                ✨ Humanize
              </>
            )}
          </button>
        </div>

        {/* Output section */}
        {outputText && (
          <div className="mt-12">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Humanized Text</h2>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition"
              >
                <Copy size={18} />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <div className="whitespace-pre-wrap bg-gray-100 border border-gray-200 rounded-2xl p-6 shadow-inner text-gray-700 text-base transition-all duration-300 hover:bg-gray-50">
              {outputText}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
