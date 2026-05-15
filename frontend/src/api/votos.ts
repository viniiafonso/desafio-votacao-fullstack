import { api } from './client';
import type { TipoVoto } from '@/types';

export interface RegistrarVotoInput {
  pautaId: number;
  cpf: string;
  voto: TipoVoto;
}

export const votosApi = {
  registrar: (input: RegistrarVotoInput): Promise<{ mensagem: string }> =>
    api.post('/votos', input),
};
