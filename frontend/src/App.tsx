import { useCallback, useEffect, useState } from 'react'
import { listarPautas, deletarPauta } from './api'
import type { PautaResponse } from './types'
import PautaCard from './components/PautaCard'
import NovaPautaForm from './components/NovaPautaForm'
import './App.css'

export default function App() {
  const [pautas, setPautas] = useState<PautaResponse[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const fetchPautas = useCallback(async (p = page) => {
    setLoading(true)
    setError(null)
    try {
      const data = await listarPautas(p)
      setPautas(data.content)
      setTotalPages(data.totalPages)
    } catch {
      setError('Não foi possível carregar as pautas.')
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { fetchPautas() }, [fetchPautas])

  const handlePautaCreated = () => {
    setShowForm(false)
    fetchPautas(0)
    setPage(0)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Remover esta pauta?')) return
    try {
      await deletarPauta(id)
      fetchPautas()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erro ao remover pauta')
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="header-title">
            <span className="header-icon">🗳️</span>
            <div>
              <h1>Votação Cooperativista</h1>
              <p>Sistema de gestão de pautas e sessões de votação</p>
            </div>
          </div>
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            + Nova Pauta
          </button>
        </div>
      </header>

      <main className="app-main">
        {showForm && (
          <NovaPautaForm
            onSuccess={handlePautaCreated}
            onCancel={() => setShowForm(false)}
          />
        )}

        {loading && <div className="state-msg">Carregando pautas...</div>}
        {error && <div className="state-msg error">{error}</div>}

        {!loading && !error && pautas.length === 0 && (
          <div className="state-msg empty">
            <span>📋</span>
            <p>Nenhuma pauta cadastrada ainda.</p>
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              Criar primeira pauta
            </button>
          </div>
        )}

        <div className="pautas-grid">
          {pautas.map(pauta => (
            <PautaCard
              key={pauta.id}
              pauta={pauta}
              onRefresh={fetchPautas}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="btn-ghost"
              onClick={() => { setPage(p => p - 1); fetchPautas(page - 1) }}
              disabled={page === 0}
            >
              ← Anterior
            </button>
            <span className="page-info">Página {page + 1} de {totalPages}</span>
            <button
              className="btn-ghost"
              onClick={() => { setPage(p => p + 1); fetchPautas(page + 1) }}
              disabled={page >= totalPages - 1}
            >
              Próxima →
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
