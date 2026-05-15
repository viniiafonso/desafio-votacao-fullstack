import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import {
  Calendar,
  ChevronRight,
  FileText,
  Info,
  Plus,
  Square,
  CheckSquare,
  Trash2,
  StopCircle,
} from 'lucide-react';

import { toast } from 'sonner';
import { pautasApi } from '@/api/pautas';
import { extractApiError } from '@/api/client';
import { PageSpinner, Spinner } from '@/components/Spinner';
import { EmptyState } from '@/components/EmptyState';
import { StatusBadge } from '@/components/StatusBadge';
import { formatDateTime } from '@/lib/utils';
import type { Pauta } from '@/types';

function isSessaoAberta(pauta: Pauta): boolean {
  if (!pauta.sessao) return false;
  return pauta.sessao.status === 'ABERTA' && new Date(pauta.sessao.fim).getTime() > Date.now();
}

export function ListaPautasPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selecionadas, setSelecionadas] = useState<Set<number>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<number[] | null>(null);

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['pautas'] });
  }, [queryClient]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['pautas'],
    queryFn: () => pautasApi.listar(0, 50),
    refetchInterval: 15_000,
  });

  const pautas = data?.content ?? [];

  const deletarMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      await Promise.all(ids.map((id) => pautasApi.deletar(id)));
    },
    onSuccess: (_, ids) => {
      toast.success(ids.length === 1 ? 'Pauta removida.' : `${ids.length} pautas removidas.`);
      setSelecionadas(new Set());
      setConfirmDelete(null);
      queryClient.invalidateQueries({ queryKey: ['pautas'] });
    },
    onError: (err) => {
      const e = extractApiError(err);
      toast.error(e.erro);
      setConfirmDelete(null);
    },
  });

  const encerrarMutation = useMutation({
    mutationFn: (id: number) => pautasApi.encerrarSessao(id),
    onSuccess: () => {
      toast.success('Votação encerrada.');
      queryClient.invalidateQueries({ queryKey: ['pautas'] });
    },
    onError: (err) => {
      toast.error(extractApiError(err).erro);
    },
  });

  function toggleSelecionar(id: number) {
    setSelecionadas((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleTodas() {
    if (selecionadas.size === pautas.length) {
      setSelecionadas(new Set());
    } else {
      setSelecionadas(new Set(pautas.map((p) => p.id)));
    }
  }

  function solicitarDelete(ids: number[]) {
    setConfirmDelete(ids);
  }

  const todasSelecionadas = pautas.length > 0 && selecionadas.size === pautas.length;
  const algumaSelecionada = selecionadas.size > 0;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Cabeçalho */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-coop-900 tracking-tight">Pautas de Votação</h1>
        <p className="text-sm text-earth-500 mt-0.5">Gerencie pautas, sessões e votos da assembleia.</p>
      </div>

      {/* Dica */}
      <div className="flex items-start gap-3 rounded-xl bg-sky-50 border border-sky-200 px-4 py-3 text-sky-800 text-sm">
        <Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-sky-500" />
        <span>Selecione pautas para excluir em lote. Clique no card para ver detalhes e votar.</span>
      </div>

      {/* Barra de ações em lote */}
      {algumaSelecionada && (
        <div className="flex items-center justify-between gap-4 rounded-xl bg-earth-100 border border-earth-300 px-4 py-3 animate-slide-in">
          <span className="text-sm font-semibold text-coop-800">
            {selecionadas.size} pauta{selecionadas.size > 1 ? 's' : ''} selecionada{selecionadas.size > 1 ? 's' : ''}
          </span>
          <button
            className="btn-danger text-sm"
            onClick={() => solicitarDelete(Array.from(selecionadas))}
            disabled={deletarMutation.isPending}
          >
            {deletarMutation.isPending ? <Spinner className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
            Remover selecionadas
          </button>
        </div>
      )}

      {/* Conteúdo */}
      {isLoading ? (
        <PageSpinner />
      ) : isError ? (
        <div className="card border-rose-200 bg-rose-50 text-rose-700 text-sm">
          Erro ao carregar pautas: {(error as Error)?.message}
        </div>
      ) : pautas.length === 0 ? (
        <div className="space-y-4">
          <EmptyState
            icon={FileText}
            title="Nenhuma pauta cadastrada no momento"
            description="Ainda não há pautas registradas na assembleia. Cadastre a primeira matéria para iniciar a votação democrática entre os associados."
            action={
              <Link to="/pautas/nova" className="btn-primary">
                <Plus className="h-4 w-4" />
                Cadastrar Primeira Pauta
              </Link>
            }
          />
          <p className="text-center text-xs text-earth-400">Atualizado automaticamente a cada 15 segundos.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Header com "selecionar todas" */}
          <div className="flex items-center justify-between px-1">
            <button
              type="button"
              onClick={toggleTodas}
              className="flex items-center gap-2 text-xs font-semibold text-earth-600 hover:text-coop-700 transition-colors"
            >
              {todasSelecionadas
                ? <CheckSquare className="h-4 w-4 text-coop-600" />
                : <Square className="h-4 w-4" />}
              Selecionar todas
            </button>
            <span className="text-xs text-earth-400">
              {data?.totalElements} pauta{(data?.totalElements ?? 0) !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Cards */}
          <div className="grid gap-3">
            {pautas.map((pauta, index) => {
              const aberta = isSessaoAberta(pauta);
              const temSessao = !!pauta.sessao;
              const selecionada = selecionadas.has(pauta.id);

              return (
                <div
                  key={pauta.id}
                  className={`card group flex items-center gap-3 transition-all duration-200 animate-fade-in ${
                    selecionada
                      ? 'border-coop-400 bg-coop-50/50 shadow-coop'
                      : 'hover:border-coop-300 hover:shadow-coop cursor-pointer'
                  }`}
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  {/* Checkbox */}
                  <button
                    type="button"
                    onClick={() => toggleSelecionar(pauta.id)}
                    className="flex-shrink-0 text-earth-400 hover:text-coop-600 transition-colors"
                    aria-label={selecionada ? 'Desmarcar' : 'Selecionar'}
                  >
                    {selecionada
                      ? <CheckSquare className="h-5 w-5 text-coop-600" />
                      : <Square className="h-5 w-5" />}
                  </button>

                  {/* Número */}
                  <div
                    onClick={() => navigate(`/pautas/${pauta.id}`)}
                    className="flex-shrink-0 h-10 w-10 rounded-xl bg-coop-50 border border-coop-200 flex items-center justify-center text-coop-700 font-bold text-xs group-hover:bg-coop-600 group-hover:text-white group-hover:border-coop-600 transition-colors cursor-pointer"
                  >
                    #{pauta.id}
                  </div>

                  {/* Info */}
                  <div
                    className="min-w-0 flex-1 cursor-pointer"
                    onClick={() => navigate(`/pautas/${pauta.id}`)}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-sm font-bold text-coop-900 truncate group-hover:text-coop-700 transition-colors">
                        {pauta.titulo}
                      </h2>
                      {temSessao && (
                        <StatusBadge
                          variant="sessao"
                          value={aberta ? 'ABERTA' : 'ENCERRADA'}
                        />
                      )}
                    </div>
                    {pauta.descricao && (
                      <p className="text-xs text-earth-500 mt-0.5 truncate">{pauta.descricao}</p>
                    )}
                    <div className="flex items-center gap-1 mt-1 text-xs text-earth-400">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDateTime(pauta.dataCriacao)}</span>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {aberta && (
                      <button
                        type="button"
                        title="Encerrar votação"
                        onClick={() => encerrarMutation.mutate(pauta.id)}
                        disabled={encerrarMutation.isPending}
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-gold-600 hover:bg-gold-50 hover:text-gold-700 transition-colors"
                      >
                        {encerrarMutation.isPending && encerrarMutation.variables === pauta.id
                          ? <Spinner className="h-4 w-4" />
                          : <StopCircle className="h-4 w-4" />}
                      </button>
                    )}
                    <button
                      type="button"
                      title="Remover pauta"
                      onClick={() => solicitarDelete([pauta.id])}
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-earth-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <ChevronRight
                      className="h-5 w-5 text-earth-300 group-hover:text-coop-600 transition-colors cursor-pointer"
                      onClick={() => navigate(`/pautas/${pauta.id}`)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal de confirmação de remoção */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 mx-auto">
              <Trash2 className="h-6 w-6 text-rose-600" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-coop-900">Confirmar remoção</h3>
              <p className="text-sm text-earth-500 mt-1">
                {confirmDelete.length === 1
                  ? 'Deseja remover esta pauta? Todos os votos e a sessão também serão excluídos.'
                  : `Deseja remover ${confirmDelete.length} pautas? Todos os votos e sessões também serão excluídos.`}
              </p>
              <p className="text-xs text-rose-600 font-semibold mt-2">Esta ação não pode ser desfeita.</p>
            </div>
            <div className="flex gap-3">
              <button
                className="btn-secondary flex-1"
                onClick={() => setConfirmDelete(null)}
                disabled={deletarMutation.isPending}
              >
                Cancelar
              </button>
              <button
                className="btn-danger flex-1"
                onClick={() => deletarMutation.mutate(confirmDelete)}
                disabled={deletarMutation.isPending}
              >
                {deletarMutation.isPending ? <Spinner className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                {deletarMutation.isPending ? 'Removendo...' : 'Remover'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
