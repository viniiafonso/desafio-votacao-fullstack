import type {
  PageResponse,
  PautaResponse,
  ResultadoVotacaoResponse,
  SessaoResponse,
  TipoVoto,
} from './types'

const BASE = import.meta.env.VITE_API_URL ?? '/api/v1'

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.mensagem ?? `Erro ${res.status}`)
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

export async function listarPautas(page = 0, size = 20): Promise<PageResponse<PautaResponse>> {
  const res = await fetch(`${BASE}/pautas?page=${page}&size=${size}&sort=id,desc`)
  return handleResponse(res)
}

export async function criarPauta(titulo: string, descricao: string): Promise<PautaResponse> {
  const res = await fetch(`${BASE}/pautas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ titulo, descricao }),
  })
  return handleResponse(res)
}

export async function deletarPauta(id: number): Promise<void> {
  const res = await fetch(`${BASE}/pautas/${id}`, { method: 'DELETE' })
  return handleResponse(res)
}

export async function abrirSessao(
  pautaId: number,
  duracaoEmMinutos: number | null
): Promise<SessaoResponse> {
  const body = duracaoEmMinutos ? { duracaoEmMinutos } : {}
  const res = await fetch(`${BASE}/pautas/${pautaId}/sessao`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return handleResponse(res)
}

export async function iniciarSessao(pautaId: number): Promise<SessaoResponse> {
  const res = await fetch(`${BASE}/pautas/${pautaId}/sessao/iniciar`, { method: 'PATCH' })
  return handleResponse(res)
}

export async function pausarSessao(pautaId: number): Promise<SessaoResponse> {
  const res = await fetch(`${BASE}/pautas/${pautaId}/sessao/pausar`, { method: 'PATCH' })
  return handleResponse(res)
}

export async function retomarSessao(pautaId: number): Promise<SessaoResponse> {
  const res = await fetch(`${BASE}/pautas/${pautaId}/sessao/retomar`, { method: 'PATCH' })
  return handleResponse(res)
}

export async function encerrarSessao(pautaId: number): Promise<SessaoResponse> {
  const res = await fetch(`${BASE}/pautas/${pautaId}/sessao/encerrar`, { method: 'PATCH' })
  return handleResponse(res)
}

export async function registrarVoto(
  pautaId: number,
  cpf: string,
  voto: TipoVoto
): Promise<unknown> {
  const res = await fetch(`${BASE}/votos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pautaId, cpf, voto }),
  })
  return handleResponse(res)
}

export async function obterResultado(pautaId: number): Promise<ResultadoVotacaoResponse> {
  const res = await fetch(`${BASE}/pautas/${pautaId}/resultado`)
  return handleResponse(res)
}
