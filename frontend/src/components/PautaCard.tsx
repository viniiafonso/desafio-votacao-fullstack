import { useState } from 'react'
import type { PautaResponse } from '../types'
import SessaoModal from './SessaoModal'
import VotoModal from './VotoModal'
import ResultadoModal from './ResultadoModal'
import './PautaCard.css'

interface Props {
  pauta: PautaResponse
  onRefresh: () => void
  onDelete: (id: number) => void
}

export default function PautaCard({ pauta, onRefresh, onDelete }: Props) {
  const [modal, setModal] = useState<'sessao' | 'voto' | 'resultado' | null>(null)
  const sessao = pauta.sessao
  const status = sessao?.status

  return (
    <>
      <div className="pauta-card">
        <div className="card-header">
          <h3 className="card-title">{pauta.titulo}</h3>
          {status && (
            <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>
          )}
        </div>

        {pauta.descricao && (
          <p className="card-desc">{pauta.descricao}</p>
        )}

        <p className="card-date">
          Criada em {new Date(pauta.dataCriacao).toLocaleDateString('pt-BR')}
        </p>

        <div className="card-actions">
          <button
            className="btn-outline"
            onClick={() => setModal('sessao')}
            title="Gerenciar sessão de votação"
          >
            🗓 Sessão
          </button>

          <button
            className="btn-success"
            onClick={() => setModal('voto')}
            disabled={status !== 'ABERTA'}
            title={status !== 'ABERTA' ? 'Sessão deve estar ABERTA para votar' : 'Registrar voto'}
          >
            🗳 Votar
          </button>

          <button
            className="btn-outline"
            onClick={() => setModal('resultado')}
            title="Ver resultado da votação"
          >
            📊 Resultado
          </button>

          <button
            className="btn-ghost delete-btn"
            onClick={() => onDelete(pauta.id)}
            title="Remover pauta"
          >
            🗑
          </button>
        </div>
      </div>

      {modal === 'sessao' && (
        <SessaoModal pauta={pauta} onClose={() => setModal(null)} onRefresh={onRefresh} />
      )}
      {modal === 'voto' && (
        <VotoModal pautaId={pauta.id} titulo={pauta.titulo} onClose={() => setModal(null)} />
      )}
      {modal === 'resultado' && (
        <ResultadoModal pautaId={pauta.id} titulo={pauta.titulo} onClose={() => setModal(null)} />
      )}
    </>
  )
}
