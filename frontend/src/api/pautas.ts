import { api, ApiRequestError } from './client';
import type { Page, Pauta, ResultadoVotacaoResponse, Sessao } from '@/types';

export interface CriarPautaInput {
  titulo: string;
  descricao?: string;
}

export interface AbrirSessaoInput {
  duracaoEmMinutos?: number;
}

export const pautasApi = {
  listar: (page = 0, size = 20): Promise<Page<Pauta>> =>
    api.get(`/pautas?page=${page}&size=${size}&sort=dataCriacao,desc`),

  buscar: (id: number): Promise<Pauta> =>
    api.get(`/pautas/${id}`),

  criar: (input: CriarPautaInput): Promise<Pauta> =>
    api.post('/pautas', input),

  abrirSessao: (id: number, input: AbrirSessaoInput): Promise<Sessao> =>
    api.post(`/pautas/${id}/sessao`, input),

  buscarSessao: async (id: number): Promise<Sessao | null> => {
    try {
      return await api.get<Sessao>(`/pautas/${id}/sessao`);
    } catch (err) {
      // 404 é esperado quando a sessão ainda não foi aberta — não é um erro
      if (err instanceof ApiRequestError && err.status === 404) return null;
      throw err;
    }
  },

  iniciarSessao: (id: number): Promise<Sessao> =>
    api.patch(`/pautas/${id}/sessao/iniciar`),

  pausarSessao: (id: number): Promise<Sessao> =>
    api.patch(`/pautas/${id}/sessao/pausar`),

  retomarSessao: (id: number): Promise<Sessao> =>
    api.patch(`/pautas/${id}/sessao/retomar`),

  encerrarSessao: (id: number): Promise<Sessao> =>
    api.patch(`/pautas/${id}/sessao/encerrar`),

  deletar: (id: number): Promise<void> =>
    api.delete(`/pautas/${id}`),

  resultado: (id: number): Promise<ResultadoVotacaoResponse> =>
    api.get(`/pautas/${id}/resultado`),
};
