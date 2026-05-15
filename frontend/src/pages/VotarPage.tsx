import { FormEvent, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  PauseCircle,
  ThumbsDown,
  ThumbsUp,
  TimerOff,
  Vote,
  XCircle,
} from 'lucide-react';
import { pautasApi } from '@/api/pautas';
import { votosApi } from '@/api/votos';
import { ApiRequestError, extractApiError } from '@/api/client';
import { Spinner } from '@/components/Spinner';
import { isValidCpf, maskCpf, unmaskCpf } from '@/lib/utils';
import type { Pauta, TipoVoto } from '@/types';

/* Garante que datas sem fuso sejam interpretadas como UTC */
function asUtc(s: string) {
  return s.endsWith('Z') || s.includes('+') ? s : s + 'Z';
}

/* ─── Countdown ─── */
function useCountdown(fim?: string | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!fim) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [fim]);
  if (!fim) return { remaining: 0, label: '--:--' };
  const diff = Math.max(0, new Date(asUtc(fim)).getTime() - now);
  const min = Math.floor(diff / 60_000);
  const sec = Math.floor((diff % 60_000) / 1000);
  return { remaining: diff, label: `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}` };
}

function sessaoAberta(pauta?: Pauta | null): boolean {
  if (!pauta?.sessao) return false;
  return pauta.sessao.status === 'ABERTA' && new Date(asUtc(pauta.sessao.fim)).getTime() > Date.now();
}

/* ─── Page ─── */
type Etapa = 'cpf' | 'votar' | 'sucesso';

export function VotarPage() {
  const { id } = useParams<{ id: string }>();
  const pautaId = Number(id);

  const [etapa, setEtapa] = useState<Etapa>('cpf');
  const [cpf, setCpf] = useState('');
  const [votoEscolhido, setVotoEscolhido] = useState<TipoVoto | null>(null);

  const pautaQuery = useQuery({
    queryKey: ['votar-pauta', pautaId],
    queryFn: () => pautasApi.buscar(pautaId),
    enabled: Number.isFinite(pautaId),
    refetchInterval: 5_000,
  });

  const pauta = pautaQuery.data;
  const sessao = pauta?.sessao ?? null;
  const aguardando = sessao?.status === 'AGUARDANDO';
  const aberta = sessaoAberta(pauta);
  const pausada = sessao?.status === 'PAUSADA';
  const encerrada = !sessao || sessao.status === 'ENCERRADA' || (!aguardando && !aberta && !pausada && !!sessao);

  const { remaining, label: countdownLabel } = useCountdown(aberta ? sessao?.fim : null);

  // Detecta quando o tempo esgota
  const expirouRef = useRef(false);
  useEffect(() => {
    if (aberta) expirouRef.current = false;
    if (aberta && remaining <= 0 && !expirouRef.current) {
      expirouRef.current = true;
      setTimeout(() => pautaQuery.refetch(), 1500);
    }
  }, [aberta, remaining]);

  if (pautaQuery.isLoading) return <TelaCarregando />;
  if (pautaQuery.isError || !pauta) return <TelaErro mensagem="Pauta não encontrada." />;

  const duracaoTotal = sessao
    ? new Date(asUtc(sessao.fim)).getTime() - new Date(asUtc(sessao.inicio)).getTime()
    : 1;
  const pct = aberta ? Math.max(0, Math.min(100, (remaining / duracaoTotal) * 100)) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-coop-900 via-coop-800 to-coop-700 flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Decoração de fundo */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-10 left-10 h-64 w-64 rounded-full bg-white blur-3xl" />
        <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-gold-400 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur rounded-2xl px-5 py-3 mb-5">
            <div className="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Vote className="h-4 w-4 text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">CoopVoto</span>
          </div>
          <h1 className="text-white text-xl sm:text-2xl font-bold leading-snug px-2">
            {pauta.titulo}
          </h1>
          {pauta.descricao && (
            <p className="text-coop-200 text-sm mt-2 max-w-sm mx-auto leading-relaxed">
              {pauta.descricao}
            </p>
          )}
        </div>

        {/* Status da sessão */}
        {aberta && (
          <div className="bg-white/10 backdrop-blur rounded-2xl p-4 text-center border border-white/20">
            <p className="text-coop-200 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
              <Clock className="h-3.5 w-3.5" /> Tempo Restante
            </p>
            <p className="text-white text-5xl font-bold font-mono tracking-tighter">{countdownLabel}</p>
            <div className="mt-3 h-2 w-full rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full bg-gold-gradient rounded-full transition-all duration-1000"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )}

        {aguardando && (
          <div className="bg-sky-500/20 backdrop-blur rounded-2xl p-4 text-center border border-sky-400/30">
            <Clock className="h-8 w-8 text-sky-300 mx-auto mb-2 animate-pulse" />
            <p className="text-white font-semibold text-sm">Aguardando início</p>
            <p className="text-coop-200 text-xs mt-1">A votação ainda não foi iniciada. Aguarde o administrador.</p>
          </div>
        )}

        {pausada && (
          <div className="bg-gold-500/20 backdrop-blur rounded-2xl p-4 text-center border border-gold-400/30">
            <PauseCircle className="h-8 w-8 text-gold-300 mx-auto mb-2" />
            <p className="text-white font-semibold text-sm">Votação pausada</p>
            <p className="text-coop-200 text-xs mt-1">Aguarde o administrador retomar a sessão.</p>
          </div>
        )}

        {encerrada && etapa !== 'sucesso' && (
          <div className="bg-white/10 backdrop-blur rounded-2xl p-4 text-center border border-white/20">
            <TimerOff className="h-8 w-8 text-coop-300 mx-auto mb-2" />
            <p className="text-white font-semibold text-sm">Votação encerrada</p>
            <p className="text-coop-200 text-xs mt-1">O prazo para votar nesta pauta expirou.</p>
          </div>
        )}

        {/* Conteúdo por etapa */}
        {etapa === 'cpf' && !encerrada && !pausada && !aguardando && (
          <ModalCpf
            cpf={cpf}
            onChange={setCpf}
            onConfirmar={(c) => {
              setCpf(c);
              setEtapa('votar');
            }}
          />
        )}

        {etapa === 'votar' && aberta && (
          <FormVoto
            pautaId={pautaId}
            cpf={unmaskCpf(cpf)}
            votoEscolhido={votoEscolhido}
            setVotoEscolhido={setVotoEscolhido}
            onSucesso={() => setEtapa('sucesso')}
            onVoltar={() => setEtapa('cpf')}
          />
        )}

        {etapa === 'sucesso' && <TelaSucesso />}
      </div>
    </div>
  );
}

/* ─── Modal CPF ─── */
function ModalCpf({
  cpf,
  onChange,
  onConfirmar,
}: {
  cpf: string;
  onChange: (v: string) => void;
  onConfirmar: (cpf: string) => void;
}) {
  const [erro, setErro] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const raw = unmaskCpf(cpf);
    if (!isValidCpf(cpf)) {
      setErro('CPF inválido. Verifique os números e tente novamente.');
      return;
    }
    onConfirmar(maskCpf(raw));
  }

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 animate-fade-in">
      <div className="text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-coop-gradient shadow-coop mb-3">
          <Vote className="h-7 w-7 text-white" />
        </div>
        <h2 className="text-xl font-bold text-coop-900">Identifique-se para votar</h2>
        <p className="text-earth-500 text-sm mt-1">
          Insira seu CPF para acessar a cédula de votação.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label" htmlFor="cpf-votar">CPF</label>
          <input
            id="cpf-votar"
            inputMode="numeric"
            placeholder="000.000.000-00"
            value={cpf}
            onChange={(e) => {
              onChange(maskCpf(e.target.value));
              if (erro) setErro(null);
            }}
            className={`input text-center text-lg font-mono tracking-widest ${erro ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200' : ''}`}
            maxLength={14}
            autoFocus
            autoComplete="off"
          />
          {erro && (
            <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5" />{erro}
            </p>
          )}
        </div>

        <button type="submit" className="btn-primary w-full py-3.5 text-base">
          Continuar para votação
        </button>
      </form>

      <p className="text-xs text-center text-earth-400">
        Cada associado pode votar apenas uma vez por pauta.
      </p>
    </div>
  );
}

/* ─── Formulário de voto ─── */
function FormVoto({
  pautaId,
  cpf,
  votoEscolhido,
  setVotoEscolhido,
  onSucesso,
  onVoltar,
}: {
  pautaId: number;
  cpf: string;
  votoEscolhido: TipoVoto | null;
  setVotoEscolhido: (v: TipoVoto) => void;
  onSucesso: () => void;
  onVoltar: () => void;
}) {
  const [erroApi, setErroApi] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: votosApi.registrar,
    onSuccess: onSucesso,
    onError: (err) => {
      const e = extractApiError(err);
      if (err instanceof ApiRequestError && err.status === 409) {
        setErroApi('Você já registrou seu voto nesta pauta.');
      } else {
        setErroApi(e.erro || 'Não foi possível registrar seu voto. Tente novamente.');
      }
    },
  });

  function handleVotar() {
    if (!votoEscolhido) return;
    setErroApi(null);
    mutation.mutate({ pautaId, cpf, voto: votoEscolhido });
  }

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 animate-fade-in">
      <div className="text-center">
        <p className="text-earth-500 text-xs font-medium uppercase tracking-wider mb-1">Seu voto</p>
        <p className="text-coop-900 font-bold text-sm">CPF: <span className="font-mono">{maskCpf(cpf)}</span></p>
      </div>

      <div>
        <p className="text-center text-sm font-semibold text-earth-600 mb-3">Selecione sua opção:</p>
        <div className="grid grid-cols-2 gap-4">
          {(['SIM', 'NAO'] as TipoVoto[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVotoEscolhido(v)}
              disabled={mutation.isPending}
              className={`flex flex-col items-center gap-2 rounded-2xl py-7 font-bold text-xl border-2 transition-all duration-150 ${
                votoEscolhido === v
                  ? v === 'SIM'
                    ? 'bg-coop-600 text-white border-coop-600 shadow-coop scale-[1.03]'
                    : 'bg-rose-600 text-white border-rose-600 shadow-lg scale-[1.03]'
                  : v === 'SIM'
                  ? 'bg-white text-coop-700 border-coop-200 hover:border-coop-400 hover:bg-coop-50'
                  : 'bg-white text-rose-700 border-rose-200 hover:border-rose-400 hover:bg-rose-50'
              }`}
            >
              {v === 'SIM'
                ? <ThumbsUp className={`h-9 w-9 ${votoEscolhido === 'SIM' ? 'text-white' : 'text-coop-500'}`} />
                : <ThumbsDown className={`h-9 w-9 ${votoEscolhido === 'NAO' ? 'text-white' : 'text-rose-500'}`} />}
              {v === 'SIM' ? 'SIM' : 'NÃO'}
            </button>
          ))}
        </div>
      </div>

      {erroApi && (
        <div className="flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-sm text-rose-700">
          <XCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          {erroApi}
        </div>
      )}

      <div className="space-y-2">
        <button
          type="button"
          className="btn-primary w-full py-3.5 text-base"
          disabled={!votoEscolhido || mutation.isPending}
          onClick={handleVotar}
        >
          {mutation.isPending
            ? <><Spinner className="h-4 w-4" />Registrando voto...</>
            : <><CheckCircle2 className="h-5 w-5" />Confirmar Voto</>}
        </button>
        <button
          type="button"
          onClick={onVoltar}
          disabled={mutation.isPending}
          className="btn-ghost w-full text-sm text-earth-500"
        >
          Alterar CPF
        </button>
      </div>
    </div>
  );
}

/* ─── Telas auxiliares ─── */
function TelaSucesso() {
  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8 text-center space-y-4 animate-fade-in">
      <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-coop-gradient shadow-coop">
        <CheckCircle2 className="h-8 w-8 text-white" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-coop-900">Voto registrado!</h2>
        <p className="text-earth-500 text-sm mt-2 leading-relaxed">
          Seu voto foi computado com sucesso. Obrigado por participar da assembleia cooperativista.
        </p>
      </div>
      <div className="rounded-xl bg-coop-50 border border-coop-200 p-3 text-xs text-coop-700 font-medium">
        Você pode fechar esta página.
      </div>
    </div>
  );
}

function TelaCarregando() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-coop-900 via-coop-800 to-coop-700 flex items-center justify-center">
      <div className="text-center space-y-3">
        <Spinner className="h-8 w-8 text-white mx-auto" />
        <p className="text-coop-200 text-sm">Carregando...</p>
      </div>
    </div>
  );
}

function TelaErro({ mensagem }: { mensagem: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-coop-900 via-coop-800 to-coop-700 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center space-y-3">
        <AlertCircle className="h-10 w-10 text-rose-500 mx-auto" />
        <h2 className="font-bold text-coop-900">Erro</h2>
        <p className="text-earth-500 text-sm">{mensagem}</p>
      </div>
    </div>
  );
}
