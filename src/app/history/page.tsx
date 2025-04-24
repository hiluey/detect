'use client'

import { useEffect, useState } from 'react'
import { useStore } from '@/lib/useStore'
import { supabase } from '@/lib/supabaseClient'

export default function HistoryPage() {
  const { user } = useStore()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState<'detector' | 'humanizer'>('detector')

  const fetchData = async () => {
    if (!user) {
      console.log('Usuário não encontrado.')
      return
    }

    setLoading(true)
    console.log('🔍 Buscando dados para user_id:', user.id, 'e type:', type)

    const { data, error } = await supabase
      .from('analyses')
      .select('*')
      .eq('user_id', user.auth_user_id)

      .eq('type', type)
      .order('created_at', { ascending: false })

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
        <h1 className="text-2xl font-bold mb-4">Histórico</h1>
        <p className="text-red-600">Você precisa estar logado para acessar o histórico.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Histórico</h1>

      <div className="flex gap-4 mb-6">
        <button
          className={`px-4 py-2 rounded ${type === 'detector' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setType('detector')}
        >
          Detector
        </button>
        <button
          className={`px-4 py-2 rounded ${type === 'humanizer' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setType('humanizer')}
        >
          Humanizador
        </button>
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : data.length === 0 ? (
        <p>Nenhum dado encontrado.</p>
      ) : (
        <ul className="space-y-2">
          {data.map((item, idx) => (
            <li key={item.id || idx} className="border p-4 rounded shadow">
              <p><strong>ID:</strong> {item.id}</p>
              <p><strong>Texto:</strong> {item.input}</p>
              <p><strong>Resultado:</strong> {item.result}</p>
              <p><strong>Data:</strong> {new Date(item.created_at).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
