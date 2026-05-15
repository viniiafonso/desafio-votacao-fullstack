import { useEffect, useState } from 'react'
import { obterResultado } from '../api'
import type { ResultadoVotacaoResponse } from '../types'

interface Props {
  pautaId: number
  titulo: string
  onClose: () => void
}

const resultadoLabel: Record<string, string> = {
  APROVADA: '✅ Aprovada',
  REJEITADA: '❌ Rejeitada',
  EMPATE: '🤝 Empate',
  SEM_VOTOS: '⚪ Sem votos',
  EM_ANDAMENTO: '⏳ Em andamento',
}

const resultadoColor: Record<string, string> = {
  APROVADA: 'var(--success)',
  REJEITADA: 'var(--danger)',
  EMPATE: 'var(--warning)',
  SEM_VOTOS: 'var(--neutral)',
  EM_ANDAMENTO: 'var(--primary)',
}

export default function ResultadoModal({ pautaId, titulo, onClose }: Props) {
  const [resultado, setResultado] = useState<ResultadoVotacaoResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    obterResultado(pautaId)
      .then(setResultado)
      .catch(err => setError(err instanceof Error ? err.message : 'Erro ao buscar resultado'))
      .finally(() => setLoading(false))
  }, [pautaId])

  const total = resultado ? resultado.totalSim + resultado.totalNao : 0
  const pctSim = total > 0 ? Math.round((resultado!.totalSim / total) * 100) : 0
  const pctNao = total > 0 ? Math.round((resultado!.totalNao / total) * 100) : 0

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>Resultado da Votação</h2>
        <p className="pauta-titulo-label">{titulo}</p>

        {loading && <p style={{ margin: '1.5rem 0', color: 'var(--text-muted)' }}>Calculando...</p>}
        {error && <p className="error-msg" style={{ margin: '1rem 0' }}>{error}</p>}

        {resultado && (
          <div className="resultado-body">
            <div
              className="resultado-badge"
              style={{ color: resultadoColor[resultado.resultado] }}
            >
              {resultadoLabel[resultado.resultado] ?? resultado.resultado}
            </div>

            <div className="votos-bar">
              <div className="bar-sim" style={{ width: `${pctSim}%` }} />
              <div className="bar-nao" style={{ width: `${pctNao}%` }} />
            </div>

            <div className="votos-stats">
              <div className="stat sim">
                <span className="stat-value">{resultado.totalSim}</span>
                <span className="stat-label">👍 SIM ({pctSim}%)</span>
              </div>
              <div className="stat nao">
                <span className="stat-value">{resultado.totalNao}</span>
                <span className="stat-label">👎 NÃO ({pctNao}%)</span>
              </div>
            </div>
            <p className="total-votos">Total: {total} voto{total !== 1 ? 's' : ''}</p>
          </div>
        )}

        <div className="modal-footer">
          <button className="btn-ghost" onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  )
}
