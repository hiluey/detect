'use client'

import { useEffect, useState } from 'react'
import { useStore } from '@/lib/useStore'
import { supabase } from '@/lib/supabaseClient'

export default function HistoryPage() {
  const { user } = useStore()

  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState<'detector' | 'humanizer'>('detector')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Fetch user analysis data
  const fetchData = async () => {
    if (!user) return

    setLoading(true)

    let query = supabase
      .from('analyses')
      .select('*')
      .eq('user_id', user.auth_user_id)
      .eq('type', type)
      .order('created_at', { ascending: false })

    if (startDate) query = query.gte('created_at', new Date(startDate).toISOString())
    if (endDate) query = query.lte('created_at', new Date(endDate + 'T23:59:59').toISOString())

    const { data, error } = await query

    if (error) {
      console.error('Error fetching data:', error)
    } else {
      setData(data || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user, type])

  // Toggle text expansion
  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  // Copy text to clipboard
  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 1500)
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">🔒 Restricted Access</h1>
        <p className="text-gray-600 mb-6">
          You must be logged in to view your analysis history.
        </p>
        <a
          href="/login"
          className="inline-block bg-blue-600 text-white font-semibold px-6 py-3 rounded-full shadow hover:bg-blue-700 transition"
        >
          Go to Login
        </a>
      </div>
    )
  }

  return (
    <div className="flex justify-center px-4 pt-6">
      <div className="w-full max-w-6xl bg-white border border-gray-200 rounded-2xl shadow-2xl p-6 sm:p-8">

        <h1 className="text-4xl font-bold text-gray-800 text-center mb-10">📜 Analysis History</h1>

        {/* Filters */}
        <div className="flex flex-wrap justify-center items-end gap-6 mb-10">
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-700 mb-2">📅 Start Date</label>
            <input
              type="date"
              className="border border-gray-300 rounded-xl px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-700 mb-2">📅 End Date</label>
            <input
              type="date"
              className="border border-gray-300 rounded-xl px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <button
            onClick={fetchData}
            className="bg-blue-600 text-white px-6 py-2 rounded-full shadow hover:bg-blue-700 transition font-semibold"
          >
            Filter
          </button>
          <button
            onClick={() => {
              setStartDate('')
              setEndDate('')
              fetchData()
            }}
            className="border border-gray-300 text-gray-700 px-6 py-2 rounded-full shadow hover:bg-gray-100 transition font-semibold"
          >
            Clear Filters
          </button>
        </div>

        {/* Type Switch */}
        <div className="flex justify-center gap-4 mb-8">
          {['detector', 'humanizer'].map((option) => (
            <button
              key={option}
              onClick={() => setType(option as 'detector' | 'humanizer')}
              className={`px-8 py-3 rounded-full font-semibold transition ${
                type === option
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>

        {/* Total count */}
        <p className="text-sm text-gray-600 text-center mb-8 italic">
          Total records found: <span className="font-semibold">{data.length}</span>
        </p>

        {/* Data List */}
        <div className="flex-1">
          {loading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : data.length === 0 ? (
            <p className="text-center text-gray-500">No data found.</p>
          ) : (
            <ul className="space-y-6">
              {data.map((item) => {
                const isExpanded = expandedItems[item.id] || false
                const textContent = item.input || ''
                const previewText = textContent.slice(0, 200)

                return (
                  <li
                    key={item.id}
                    className="bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-sm transition hover:shadow-md"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-sm text-gray-500">
                        <strong className="text-gray-700">Date:</strong> {new Date(item.created_at).toLocaleString()}
                      </p>
                      <button
                        onClick={() => handleCopy(textContent, item.id)}
                        className="text-blue-600 hover:underline text-sm font-semibold"
                      >
                        {copiedId === item.id ? 'Copied!' : 'Copy Text'}
                      </button>
                    </div>

                    <p className="text-gray-800 whitespace-pre-wrap mb-3">
                      <strong className="text-gray-700">
                        {type === 'humanizer' ? 'Humanized Text:' : 'Text:'}
                      </strong>{' '}
                      {isExpanded ? textContent : previewText + (textContent.length > 200 ? '...' : '')}
                    </p>

                    {textContent.length > 200 && (
                      <button
                        onClick={() => toggleExpand(item.id)}
                        className="text-blue-600 hover:underline text-sm font-medium"
                      >
                        {isExpanded ? 'Show Less' : 'Show More'}
                      </button>
                    )}

                    {type === 'detector' && (
                      <p className="mt-4 text-sm text-gray-700">
                        <strong>Result:</strong>{' '}
                        {item.output
                          ? parseFloat(item.output) >= 50
                            ? 'Likely AI'
                            : 'Likely Human'
                          : 'Undefined'}
                      </p>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
