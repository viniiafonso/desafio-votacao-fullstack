import { useState } from 'react'
import { registrarVoto } from '../api'
import type { TipoVoto } from '../types'

interface Props {
  pautaId: number
  titulo: string
  onClose: () => void
}

export default function VotoModal({ pautaId, titulo, onClose }: Props) {
  const [cpf, setCpf] = useState('')
  const [voto, setVoto] = useState<TipoVoto | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const cpfClean = cpf.replace(/\D/g, '')
    if (cpfClean.length !== 11) { setError('CPF deve conter exatamente 11 dígitos'); return }
    if (!voto) { setError('Selecione SIM ou NÃO'); return }
    setLoading(true)
    setError(null)
    try {
      await registrarVoto(pautaId, cpfClean, voto)
      setSuccess(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao registrar voto')
    } finally {
      setLoading(false)
    }
  }

  const formatCpf = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 11)
    return d
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4')
  }

  if (success) {
    return (
      <div className="overlay" onClick={onClose}>
        <div className="modal" onClick={e => e.stopPropagation()} style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '.5rem' }}>✅</div>
          <h2>Voto registrado!</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '.5rem', marginBottom: '1.5rem' }}>
            Seu voto foi computado com sucesso.
          </p>
          <button className="btn-primary" onClick={onClose}>Fechar</button>
        </div>
      </div>
    )
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>Registrar Voto</h2>
        <p className="pauta-titulo-label">{titulo}</p>
        <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
          <div className="form-group">
            <label htmlFor="cpf">CPF do Associado</label>
            <input
              id="cpf"
              value={cpf}
              onChange={e => setCpf(formatCpf(e.target.value))}
              placeholder="000.000.000-00"
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Seu voto</label>
            <div className="voto-options">
              <button
                type="button"
                className={`voto-btn ${voto === 'SIM' ? 'selected-sim' : ''}`}
                onClick={() => setVoto('SIM')}
              >
                👍 SIM
              </button>
              <button
                type="button"
                className={`voto-btn ${voto === 'NAO' ? 'selected-nao' : ''}`}
                onClick={() => setVoto('NAO')}
              >
                👎 NÃO
              </button>
            </div>
          </div>
          {error && <p className="error-msg">{error}</p>}
          <div className="modal-footer">
            <button type="button" className="btn-ghost" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading || !voto}>
              {loading ? 'Enviando...' : 'Confirmar Voto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
