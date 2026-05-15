export type StatusSessao = 'AGUARDANDO' | 'ABERTA' | 'PAUSADA' | 'ENCERRADA';
export type TipoVoto = 'SIM' | 'NAO';
export type ResultadoVotacao =
  | 'APROVADA'
  | 'REJEITADA'
  | 'EMPATE'
  | 'SEM_VOTOS'
  | 'EM_ANDAMENTO';

export interface Pauta {
  id: number;
  titulo: string;
  descricao?: string | null;
  dataCriacao: string;
  sessao?: Sessao | null;
}

export interface Sessao {
  pautaId: number;
  inicio: string;
  fim: string;
  status: StatusSessao;
}

export interface ResultadoVotacaoResponse {
  pautaId: number;
  titulo: string;
  totalSim: number;
  totalNao: number;
  resultado: ResultadoVotacao;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export interface ApiError {
  erro: string;
  status?: number;
  path?: string;
  timestamp?: string;
  detalhes?: string[];
}
