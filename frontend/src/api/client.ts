import type { ApiError } from '@/types';

const baseURL = import.meta.env.VITE_API_URL || '/api/v1';

export class ApiRequestError extends Error {
  constructor(
    public readonly status: number,
    public readonly data: ApiError,
  ) {
    super(data.erro || `HTTP ${status}`);
    this.name = 'ApiRequestError';
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = path.startsWith('http') ? path : `${baseURL}${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    let data: ApiError = { erro: `Erro ${response.status}`, status: response.status };
    try {
      const json = await response.json();
      if (json) data = { ...data, ...json };
    } catch {
      // corpo vazio ou não-JSON
    }
    throw new ApiRequestError(response.status, data);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const api = {
  get:    <T>(path: string)                    => request<T>(path),
  post:   <T>(path: string, body?: unknown)    => request<T>(path, { method: 'POST',   body: body !== undefined ? JSON.stringify(body) : undefined }),
  put:    <T>(path: string, body?: unknown)    => request<T>(path, { method: 'PUT',    body: body !== undefined ? JSON.stringify(body) : undefined }),
  patch:  <T>(path: string, body?: unknown)    => request<T>(path, { method: 'PATCH',  body: body !== undefined ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string)                    => request<T>(path, { method: 'DELETE' }),
};

export function extractApiError(error: unknown): ApiError {
  if (error instanceof ApiRequestError) {
    return { ...error.data, status: error.status };
  }
  if (error instanceof Error) {
    return { erro: error.message || 'Erro inesperado' };
  }
  return { erro: 'Erro inesperado' };
}
