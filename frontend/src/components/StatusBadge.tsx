import { cn } from '@/lib/utils';
import type { ResultadoVotacao, StatusSessao } from '@/types';

const sessaoStyles: Record<StatusSessao, string> = {
  AGUARDANDO: 'bg-sky-50 text-sky-700 ring-1 ring-sky-300',
  ABERTA:     'bg-coop-50 text-coop-700 ring-1 ring-coop-300',
  PAUSADA:    'bg-gold-50 text-gold-700 ring-1 ring-gold-300',
  ENCERRADA:  'bg-earth-100 text-earth-600 ring-1 ring-earth-300',
};

const resultadoStyles: Record<ResultadoVotacao, string> = {
  APROVADA:     'bg-coop-50 text-coop-700 ring-1 ring-coop-300',
  REJEITADA:    'bg-rose-50 text-rose-700 ring-1 ring-rose-300',
  EMPATE:       'bg-gold-50 text-gold-700 ring-1 ring-gold-300',
  SEM_VOTOS:    'bg-earth-100 text-earth-600 ring-1 ring-earth-300',
  EM_ANDAMENTO: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
};

const resultadoLabels: Record<ResultadoVotacao, string> = {
  APROVADA:     '✔ Aprovada',
  REJEITADA:    '✘ Rejeitada',
  EMPATE:       '⇌ Empate',
  SEM_VOTOS:    'Sem votos',
  EM_ANDAMENTO: 'Em andamento',
};

const sessaoLabels: Record<StatusSessao, string> = {
  AGUARDANDO: 'Aguardando Início',
  ABERTA:     'Sessão Aberta',
  PAUSADA:    'Sessão Pausada',
  ENCERRADA:  'Sessão Encerrada',
};

const dotStyles: Record<StatusSessao, string> = {
  AGUARDANDO: 'bg-sky-400 animate-pulse2',
  ABERTA:     'bg-coop-500 animate-pulse2',
  PAUSADA:    'bg-gold-500',
  ENCERRADA:  'bg-earth-400',
};

interface StatusBadgeProps {
  variant: 'sessao' | 'resultado';
  value: StatusSessao | ResultadoVotacao;
  className?: string;
}

export function StatusBadge({ variant, value, className }: StatusBadgeProps) {
  if (variant === 'sessao') {
    const v = value as StatusSessao;
    return (
      <span className={cn('badge', sessaoStyles[v], className)}>
        <span className={cn('h-2 w-2 rounded-full flex-shrink-0', dotStyles[v])} />
        {sessaoLabels[v]}
      </span>
    );
  }
  const v = value as ResultadoVotacao;
  return (
    <span className={cn('badge', resultadoStyles[v], className)}>
      {resultadoLabels[v]}
    </span>
  );
}
