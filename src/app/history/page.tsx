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

  const fetchData = async () => {
    if (!user) {
      console.log('Usuário não encontrado.')
      return
    }

    setLoading(true)
    console.log('🔍 Buscando dados para user_id:', user.id, 'e type:', type)

    let query = supabase
      .from('analyses')
      .select('*')
      .eq('user_id', user.auth_user_id)
      .eq('type', type)
      .order('created_at', { ascending: false })

    if (startDate) {
      query = query.gte('created_at', new Date(startDate).toISOString())
    }
    if (endDate) {
      query = query.lte('created_at', new Date(endDate + 'T23:59:59').toISOString())
    }

    const { data, error } = await query

    console.log('📦 Data:', data)
    console.log('❌ Error:', error)

    if (!error && data) {
      setData(data)
    }

    setLoading(false)
  }

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user, type])

  if (!user) {
    return (
      <div className="max-w-xl mx-auto p-6 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Histórico</h1>
        <p className="text-red-600">Você precisa estar logado para acessar o histórico.</p>
      </div>
    )
  }

  return (
    <div className="flex justify-center px-4 py-12 min-h-[80vh]">
      <div className="w-full max-w-4xl bg-white border border-gray-200 rounded-3xl shadow-xl p-8 sm:p-10">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">📜 Histórico</h1>

        <div className="flex justify-center gap-4 mb-8">
          <button
            className={`px-6 py-2.5 rounded-full font-medium transition ${
              type === 'detector'
                ? 'bg-blue-600 text-white shadow'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setType('detector')}
          >
            Detector
          </button>
          <button
            className={`px-6 py-2.5 rounded-full font-medium transition ${
              type === 'humanizer'
                ? 'bg-blue-600 text-white shadow'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setType('humanizer')}
          >
            Humanizador
          </button>
        </div>

        <div className="flex flex-wrap justify-center items-end gap-4 mb-6">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">📅 Início</label>
            <input
              type="date"
              className="border border-gray-300 rounded-xl px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">📅 Fim</label>
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
            Filtrar
          </button>
          <button
            onClick={() => {
              setStartDate('')
              setEndDate('')
              fetchData()
            }}
            className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-full shadow hover:bg-gray-100 transition font-semibold"
          >
            Ver tudo
          </button>
        </div>

        <p className="text-sm text-gray-600 text-center mb-6 italic">
          Total de registros encontrados: <span className="font-semibold">{data.length}</span>
        </p>

        {loading ? (
          <p className="text-center text-gray-500">Carregando...</p>
        ) : data.length === 0 ? (
          <p className="text-center text-gray-500">Nenhum dado encontrado.</p>
        ) : (
          <ul className="space-y-4">
            {data.map((item, idx) => {
              const isExpanded = expandedItems[item.id] || false
              const toggleExpand = () => {
                setExpandedItems((prev) => ({
                  ...prev,
                  [item.id]: !isExpanded,
                }))
              }

              const textContent = item.input ?? ''

              const previewText = textContent.slice(0, 200)

              const handleCopy = async () => {
                try {
                  await navigator.clipboard.writeText(textContent)
                  alert('Texto copiado!')
                } catch (err) {
                  alert('Erro ao copiar texto.')
                }
              }

              return (
                <li
                  key={item.id || idx}
                  className="bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-sm transition hover:shadow-md"
                >
                  <p className="text-sm text-gray-500 mb-2">
                    <strong className="text-gray-700">Data:</strong>{' '}
                    {new Date(item.created_at).toLocaleString()}
                  </p>

                  <div className="flex flex-col gap-2 mb-2">
                    <button
                      onClick={handleCopy}
                      className="text-sm text-blue-600 hover:underline font-medium self-start"
                    >
                      Copiar texto
                    </button>

                    <p className="text-gray-800 whitespace-pre-wrap">
                      <strong className="text-gray-700">
                        {type === 'humanizer' ? 'Texto Humanizado:' : 'Texto:'}
                      </strong>{' '}
                      {isExpanded
                        ? textContent
                        : previewText + (textContent.length > 200 ? '...' : '')}
                      {textContent.length > 200 && (
                        <button
                          onClick={toggleExpand}
                          className="ml-2 text-blue-600 hover:underline text-sm font-medium"
                        >
                          {isExpanded ? 'Ler menos' : 'Ler mais'}
                        </button>
                      )}
                    </p>
                  </div>

                  {type === 'detector' && (
                    <p className="text-sm text-gray-700">
                      <strong>Resultado:</strong>{' '}
                      {item.output
                        ? parseFloat(item.output) >= 50
                          ? 'Provável IA'
                          : 'Provável Humano'
                        : 'Indefinido'}
                    </p>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
