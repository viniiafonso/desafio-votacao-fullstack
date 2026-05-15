import { useState } from 'react'
import { criarPauta } from '../api'

interface Props {
  onSuccess: () => void
  onCancel: () => void
}

export default function NovaPautaForm({ onSuccess, onCancel }: Props) {
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!titulo.trim()) { setError('Título é obrigatório'); return }
    setLoading(true)
    setError(null)
    try {
      await criarPauta(titulo.trim(), descricao.trim())
      onSuccess()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao criar pauta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>Nova Pauta</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="titulo">Título *</label>
            <input
              id="titulo"
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              placeholder="Ex: Redução da taxa administrativa"
              maxLength={200}
              autoFocus
            />
          </div>
          <div className="form-group">
            <label htmlFor="descricao">Descrição</label>
            <textarea
              id="descricao"
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              placeholder="Descreva o assunto da pauta (opcional)"
              maxLength={1000}
            />
          </div>
          {error && <p className="error-msg">{error}</p>}
          <div className="modal-footer">
            <button type="button" className="btn-ghost" onClick={onCancel} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Salvando...' : 'Criar Pauta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
