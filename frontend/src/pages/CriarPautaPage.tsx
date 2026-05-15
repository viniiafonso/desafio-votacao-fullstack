import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, FileText, Info, Save } from 'lucide-react';
import { toast } from 'sonner';
import { pautasApi } from '@/api/pautas';
import { extractApiError } from '@/api/client';
import { Spinner } from '@/components/Spinner';

export function CriarPautaPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [erroTitulo, setErroTitulo] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: pautasApi.criar,
    onSuccess: (pauta) => {
      toast.success('Pauta cadastrada com sucesso!', {
        description: `"${pauta.titulo}" está pronta para votação.`,
      });
      queryClient.invalidateQueries({ queryKey: ['pautas'] });
      navigate(`/pautas/${pauta.id}`);
    },
    onError: (err) => {
      const apiErr = extractApiError(err);
      toast.error(apiErr.erro, { description: apiErr.detalhes?.join(', ') });
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!titulo.trim()) {
      setErroTitulo('O título da pauta é obrigatório');
      return;
    }
    setErroTitulo(null);
    mutation.mutate({ titulo: titulo.trim(), descricao: descricao.trim() || undefined });
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="btn-ghost px-2 -ml-2 text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para Pautas
      </button>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-2xl bg-coop-gradient flex items-center justify-center shadow-coop flex-shrink-0">
          <FileText className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-coop-900">Nova Pauta</h1>
          <p className="text-sm text-earth-500">Registre uma nova matéria para votação na assembleia</p>
        </div>
      </div>

      {/* Dica */}
      <div className="flex items-start gap-3 rounded-xl bg-gold-50 border border-gold-200 px-4 py-3 text-gold-800 text-sm">
        <Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-gold-500" />
        <span>
          Após cadastrar a pauta, você poderá abrir a sessão de votação e definir o tempo disponível para os associados votarem.
        </span>
      </div>

      {/* Formulário */}
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label" htmlFor="titulo">
              Título da Pauta
              <span className="text-rose-500 ml-1">*</span>
              <span className="label-hint">(obrigatório)</span>
            </label>
            <input
              id="titulo"
              className={`input ${erroTitulo ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200' : ''}`}
              placeholder="Ex: Aprovação do plano de expansão 2026"
              value={titulo}
              onChange={(e) => { setTitulo(e.target.value); if (erroTitulo) setErroTitulo(null); }}
              maxLength={200}
              autoFocus
            />
            {erroTitulo ? (
              <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1">
                <span>⚠</span> {erroTitulo}
              </p>
            ) : (
              <p className="text-xs text-earth-400 mt-1.5 text-right">{titulo.length}/200 caracteres</p>
            )}
          </div>

          <div>
            <label className="label" htmlFor="descricao">
              Descrição
              <span className="label-hint">(opcional)</span>
            </label>
            <textarea
              id="descricao"
              className="input min-h-[130px] resize-y leading-relaxed"
              placeholder="Descreva os detalhes da pauta, contexto, motivação e impactos esperados para os associados..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              maxLength={1000}
            />
            <p className="text-xs text-earth-400 mt-1.5 text-right">{descricao.length}/1000 caracteres</p>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-earth-100">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate(-1)}
              disabled={mutation.isPending}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? <Spinner className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {mutation.isPending ? 'Salvando...' : 'Cadastrar Pauta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
