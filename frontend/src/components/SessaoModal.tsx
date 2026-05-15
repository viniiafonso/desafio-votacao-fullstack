import { useState } from 'react'
import { abrirSessao, iniciarSessao, pausarSessao, retomarSessao, encerrarSessao } from '../api'
import type { PautaResponse, SessaoResponse } from '../types'

interface Props {
  pauta: PautaResponse
  onClose: () => void
  onRefresh: () => void
}

function formatDateTime(dt: string | null) {
  if (!dt) return '—'
  return new Date(dt).toLocaleString('pt-BR')
}

export default function SessaoModal({ pauta, onClose, onRefresh }: Props) {
  const [duracao, setDuracao] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessao, setSessao] = useState<SessaoResponse | null>(pauta.sessao)

  const wrap = async (fn: () => Promise<SessaoResponse>) => {
    setLoading(true)
    setError(null)
    try {
      const result = await fn()
      setSessao(result)
      onRefresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro na operação')
    } finally {
      setLoading(false)
    }
  }

  const handleAbrir = () =>
    wrap(() => abrirSessao(pauta.id, duracao ? parseInt(duracao) : null))

  const status = sessao?.status

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>Sessão — {pauta.titulo}</h2>

        {!sessao && (
          <div>
            <p className="sessao-info-text">Nenhuma sessão aberta. Configure a duração e inicie.</p>
            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label htmlFor="duracao">Duração (minutos)</label>
              <input
                id="duracao"
                type="number"
                min={1}
                value={duracao}
                onChange={e => setDuracao(e.target.value)}
                placeholder="1 (padrão)"
              />
            </div>
          </div>
        )}

        {sessao && (
          <div className="sessao-details">
            <div className="sessao-row">
              <span className="sessao-label">Status</span>
              <span className={`badge badge-${sessao.status.toLowerCase()}`}>{sessao.status}</span>
            </div>
            <div className="sessao-row">
              <span className="sessao-label">Início</span>
              <span>{formatDateTime(sessao.inicio)}</span>
            </div>
            <div className="sessao-row">
              <span className="sessao-label">Fim previsto</span>
              <span>{formatDateTime(sessao.fim)}</span>
            </div>
          </div>
        )}

        {error && <p className="error-msg">{error}</p>}

        <div className="modal-footer">
          <button className="btn-ghost" onClick={onClose}>Fechar</button>

          {!sessao && (
            <button className="btn-primary" onClick={handleAbrir} disabled={loading}>
              {loading ? 'Abrindo...' : 'Abrir Sessão'}
            </button>
          )}

          {status === 'AGUARDANDO' && (
            <button className="btn-success" onClick={() => wrap(() => iniciarSessao(pauta.id))} disabled={loading}>
              {loading ? '...' : '▶ Iniciar'}
            </button>
          )}

          {status === 'ABERTA' && (
            <>
              <button className="btn-outline" onClick={() => wrap(() => pausarSessao(pauta.id))} disabled={loading}>
                {loading ? '...' : '⏸ Pausar'}
              </button>
              <button className="btn-danger" onClick={() => wrap(() => encerrarSessao(pauta.id))} disabled={loading}>
                {loading ? '...' : '⏹ Encerrar'}
              </button>
            </>
          )}

          {status === 'PAUSADA' && (
            <>
              <button className="btn-success" onClick={() => wrap(() => retomarSessao(pauta.id))} disabled={loading}>
                {loading ? '...' : '▶ Retomar'}
              </button>
              <button className="btn-danger" onClick={() => wrap(() => encerrarSessao(pauta.id))} disabled={loading}>
                {loading ? '...' : '⏹ Encerrar'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
