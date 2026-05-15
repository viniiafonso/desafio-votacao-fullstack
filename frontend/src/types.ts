export type StatusSessao = 'AGUARDANDO' | 'ABERTA' | 'PAUSADA' | 'ENCERRADA'
export type ResultadoVotacao = 'APROVADA' | 'REJEITADA' | 'EMPATE' | 'SEM_VOTOS' | 'EM_ANDAMENTO'
export type TipoVoto = 'SIM' | 'NAO'

export interface SessaoResponse {
  pautaId: number
  inicio: string | null
  fim: string | null
  status: StatusSessao
}

export interface PautaResponse {
  id: number
  titulo: string
  descricao: string | null
  dataCriacao: string
  sessao: SessaoResponse | null
}

export interface ResultadoVotacaoResponse {
  pautaId: number
  titulo: string
  totalSim: number
  totalNao: number
  resultado: ResultadoVotacao
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export interface ApiError {
  mensagem: string
  status?: number
}
