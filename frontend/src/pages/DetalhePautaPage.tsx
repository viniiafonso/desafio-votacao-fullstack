import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  ArrowLeft,
  BarChart3,
  CalendarClock,
  Clock,
  Copy,
  ExternalLink,
  Info,
  PauseCircle,
  PlayCircle,
  QrCode,
  StopCircle,
  ThumbsDown,
  ThumbsUp,
  TimerOff,
  Vote,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { pautasApi } from '@/api/pautas';
import { extractApiError } from '@/api/client';
import { PageSpinner, Spinner } from '@/components/Spinner';
import { StatusBadge } from '@/components/StatusBadge';
import { formatDateTime } from '@/lib/utils';
import type { Pauta, Sessao } from '@/types';

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

function sessaoAberta(sessao?: Sessao | null): boolean {
  if (!sessao) return false;
  return sessao.status === 'ABERTA' && new Date(asUtc(sessao.fim)).getTime() > Date.now();
}

function sessaoPausada(sessao?: Sessao | null): boolean {
  return sessao?.status === 'PAUSADA';
}

/* ─── Page ─── */
export function DetalhePautaPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const pautaId = Number(id);

  // Uma única query que já traz a sessão embutida — sem requests separados para sessão
  const pautaQuery = useQuery({
    queryKey: ['pauta', pautaId],
    queryFn: () => pautasApi.buscar(pautaId),
    enabled: Number.isFinite(pautaId),
    refetchInterval: (q) => {
      const p = q.state.data as Pauta | undefined;
      if (p?.sessao && sessaoAberta(p.sessao)) return 5_000;
      return false;
    },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <button onClick={() => navigate(-1)} className="btn-ghost px-2 -ml-2 text-sm">
        <ArrowLeft className="h-4 w-4" />
        Voltar para Pautas
      </button>

      {pautaQuery.isLoading ? (
        <PageSpinner />
      ) : pautaQuery.isError ? (
        <ErroCard error={pautaQuery.error as Error} onBack={() => navigate('/')} />
      ) : pautaQuery.data ? (
        <>
          <div className="card border-l-4 border-l-coop-500">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-coop-gradient flex items-center justify-center shadow-coop">
                <Vote className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-xs text-earth-500 mb-1">
                  <span className="font-semibold text-coop-600">Pauta #{pautaQuery.data.id}</span>
                  <span>•</span>
                  <CalendarClock className="h-3 w-3" />
                  <span>Cadastrada em {formatDateTime(pautaQuery.data.dataCriacao)}</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-coop-900">{pautaQuery.data.titulo}</h1>
                {pautaQuery.data.descricao && (
                  <p className="text-earth-600 mt-3 text-sm leading-relaxed whitespace-pre-line">
                    {pautaQuery.data.descricao}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SessaoSection pautaId={pautaId} sessao={pautaQuery.data.sessao ?? null} />
            <ResultadoSection pautaId={pautaId} sessao={pautaQuery.data.sessao ?? null} />
          </div>
        </>
      ) : null}
    </div>
  );
}

/* ─── Erro ─── */
function ErroCard({ error, onBack }: { error: Error; onBack: () => void }) {
  const apiErr = extractApiError(error);
  return (
    <div className="card text-center py-16 border-rose-200">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 mx-auto mb-4">
        <AlertCircle className="h-8 w-8 text-rose-600" />
      </div>
      <h2 className="text-lg font-bold text-coop-900">{apiErr.erro || 'Pauta não encontrada'}</h2>
      <p className="text-earth-500 text-sm mt-2">Verifique se o endereço está correto.</p>
      <button className="btn-primary mt-6" onClick={onBack}>Voltar para Pautas</button>
    </div>
  );
}

/* ─── Sessão ─── */
function SessaoSection({ pautaId, sessao }: { pautaId: number; sessao: Sessao | null }) {
  const queryClient = useQueryClient();
  const [duracao, setDuracao] = useState<number>(5);

  function invalidar() {
    queryClient.invalidateQueries({ queryKey: ['pauta', pautaId] });
    queryClient.invalidateQueries({ queryKey: ['pautas'] });
    queryClient.invalidateQueries({ queryKey: ['pauta-resultado', pautaId] });
  }

  const abrirMutation = useMutation({
    mutationFn: (mins: number) => pautasApi.abrirSessao(pautaId, { duracaoEmMinutos: mins }),
    onSuccess: () => { toast.success('Sessão preparada!', { description: 'Compartilhe o QR code e clique em "Iniciar Contagem" quando todos estiverem prontos.' }); invalidar(); },
    onError: (err) => toast.error(extractApiError(err).erro),
  });

  const iniciarMutation = useMutation({
    mutationFn: () => pautasApi.iniciarSessao(pautaId),
    onSuccess: () => { toast.success('Contagem iniciada!', { description: 'Os cooperados já podem registrar seus votos.' }); invalidar(); },
    onError: (err) => toast.error(extractApiError(err).erro),
  });

  const pausarMutation = useMutation({
    mutationFn: () => pautasApi.pausarSessao(pautaId),
    onSuccess: () => { toast.success('Votação pausada.', { description: 'O tempo restante foi preservado.' }); invalidar(); },
    onError: (err) => toast.error(extractApiError(err).erro),
  });

  const retomarMutation = useMutation({
    mutationFn: () => pautasApi.retomarSessao(pautaId),
    onSuccess: () => { toast.success('Votação retomada!', { description: 'Os votos podem ser registrados novamente.' }); invalidar(); },
    onError: (err) => toast.error(extractApiError(err).erro),
  });

  const encerrarMutation = useMutation({
    mutationFn: () => pautasApi.encerrarSessao(pautaId),
    onSuccess: () => { toast.success('Votação encerrada definitivamente.'); invalidar(); },
    onError: (err) => toast.error(extractApiError(err).erro),
  });

  const aguardando = sessao?.status === 'AGUARDANDO';
  const aberta = sessaoAberta(sessao);
  const pausada = sessaoPausada(sessao);
  const { remaining, label: countdownLabel } = useCountdown(aberta ? sessao?.fim : null);

  // Quando o tempo zera no browser, força refetch imediato da pauta e do resultado
  const expiryFired = useRef(false);
  useEffect(() => {
    if (aberta) expiryFired.current = false;
    if (aberta && remaining <= 0 && !expiryFired.current) {
      expiryFired.current = true;
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['pauta', pautaId] });
        queryClient.invalidateQueries({ queryKey: ['pauta-resultado', pautaId] });
      }, 500);
    }
  }, [aberta, remaining, pautaId, queryClient]);

  const duracaoTotal = sessao
    ? new Date(asUtc(sessao.fim)).getTime() - new Date(asUtc(sessao.inicio)).getTime()
    : 1;
  const pct = aberta ? Math.max(0, Math.min(100, (remaining / duracaoTotal) * 100)) : 0;

  /* Sem sessão */
  if (!sessao) {
    return (
      <div className="card flex flex-col gap-5">
        <div>
          <h2 className="section-title"><PlayCircle className="h-5 w-5 text-coop-600" />Abrir Sessão de Votação</h2>
          <p className="section-desc">Defina a duração e inicie a votação.</p>
        </div>

        <div className="rounded-xl bg-earth-50 border border-earth-200 p-4 space-y-4">
          <label className="label">Duração da sessão</label>
          <div className="grid grid-cols-4 gap-2">
            {[1, 5, 10, 30].map((min) => (
              <button key={min} type="button" onClick={() => setDuracao(min)}
                className={`rounded-xl py-2 text-sm font-semibold border transition-all ${
                  duracao === min ? 'bg-coop-600 text-white border-coop-600 shadow-coop' : 'bg-white text-coop-700 border-earth-300 hover:border-coop-400'
                }`}>{min}min</button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input id="duracao" type="number" min={1} max={1440} value={duracao}
              onChange={(e) => setDuracao(Math.max(1, Number(e.target.value) || 1))}
              className="input flex-1" />
            <span className="text-sm text-earth-500 whitespace-nowrap">minutos</span>
          </div>
        </div>

        <div className="flex items-start gap-2 text-xs text-earth-500 bg-earth-50 rounded-xl p-3">
          <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
          <span>A sessão encerrará automaticamente ao final do prazo.</span>
        </div>

        <button type="button" className="btn-primary w-full"
          onClick={() => abrirMutation.mutate(duracao)} disabled={abrirMutation.isPending}>
          {abrirMutation.isPending ? <Spinner className="h-4 w-4" /> : <PlayCircle className="h-5 w-5" />}
          {abrirMutation.isPending ? 'Abrindo sessão...' : 'Abrir Sessão de Votação'}
        </button>
      </div>
    );
  }

  /* Com sessão */
  return (
    <div className="card flex flex-col gap-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="section-title"><Vote className="h-5 w-5 text-coop-600" />Sessão de Votação</h2>
          <p className="section-desc">
            {aguardando ? 'Sessão pronta — aguardando início da contagem.'
              : aberta ? 'Votação em andamento.'
              : pausada ? 'Votação pausada — pode ser retomada.'
              : 'Sessão encerrada.'}
          </p>
        </div>
        <StatusBadge variant="sessao" value={sessao.status} />
      </div>

      {aguardando ? (
        <div className="rounded-2xl bg-sky-50 border border-sky-200 p-4 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 mx-auto mb-2">
            <Clock className="h-5 w-5 text-sky-600" />
          </div>
          <p className="text-sm font-semibold text-sky-700">Aguardando início</p>
          <p className="text-xs text-sky-600 mt-1">Compartilhe o QR code e clique em <strong>Iniciar Contagem</strong> quando todos estiverem prontos.</p>
        </div>
      ) : aberta ? (
        <div className="rounded-2xl bg-coop-gradient p-4 text-white text-center shadow-coop">
          <p className="text-coop-200 text-xs font-semibold uppercase tracking-wider mb-1">
            <Clock className="inline h-3.5 w-3.5 mr-1" />Tempo Restante
          </p>
          <p className="text-5xl font-bold font-mono tracking-tighter">{countdownLabel}</p>
          <div className="mt-3 h-2 w-full rounded-full bg-white/20 overflow-hidden">
            <div className="h-full bg-white/70 rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
          </div>
        </div>
      ) : pausada ? (
        <div className="rounded-2xl bg-gold-50 border border-gold-200 p-4 text-center">
          <PauseCircle className="h-8 w-8 text-gold-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-gold-700">Votação pausada</p>
          <p className="text-xs text-gold-600 mt-0.5">Retome para continuar recebendo votos.</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-earth-100 border border-earth-200 p-4 text-center">
          <TimerOff className="h-8 w-8 text-earth-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-earth-600">Sessão encerrada</p>
          <p className="text-xs text-earth-500 mt-0.5">Não é mais possível registrar votos.</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-xl bg-earth-50 border border-earth-200 p-3">
          <p className="text-earth-500 font-medium mb-0.5">Início</p>
          <p className="font-semibold text-coop-800">{formatDateTime(sessao.inicio)}</p>
        </div>
        <div className="rounded-xl bg-earth-50 border border-earth-200 p-3">
          <p className="text-earth-500 font-medium mb-0.5">{aberta ? 'Encerramento' : 'Encerrou em'}</p>
          <p className="font-semibold text-coop-800">{formatDateTime(sessao.fim)}</p>
        </div>
      </div>

      {/* Botão Iniciar — só quando AGUARDANDO */}
      {aguardando && (
        <div className="grid grid-cols-2 gap-3">
          <button type="button" className="btn-primary py-3"
            onClick={() => iniciarMutation.mutate()}
            disabled={iniciarMutation.isPending || encerrarMutation.isPending}
          >
            {iniciarMutation.isPending ? <Spinner className="h-4 w-4" /> : <PlayCircle className="h-5 w-5" />}
            {iniciarMutation.isPending ? 'Iniciando...' : 'Iniciar Contagem'}
          </button>
          <button type="button"
            className="btn-secondary text-rose-700 border-rose-300 hover:bg-rose-50"
            onClick={() => encerrarMutation.mutate()}
            disabled={encerrarMutation.isPending || iniciarMutation.isPending}
          >
            {encerrarMutation.isPending ? <Spinner className="h-4 w-4" /> : <StopCircle className="h-4 w-4" />}
            {encerrarMutation.isPending ? 'Cancelando...' : 'Cancelar'}
          </button>
        </div>
      )}

      {/* Controles — aparecem quando aberta ou pausada */}
      {(aberta || pausada) && (
        <div className="grid grid-cols-2 gap-3">
          {aberta ? (
            <button type="button"
              className="btn-secondary text-gold-700 border-gold-300 hover:bg-gold-50"
              onClick={() => pausarMutation.mutate()}
              disabled={pausarMutation.isPending || encerrarMutation.isPending}
            >
              {pausarMutation.isPending ? <Spinner className="h-4 w-4" /> : <PauseCircle className="h-4 w-4" />}
              {pausarMutation.isPending ? 'Pausando...' : 'Pausar'}
            </button>
          ) : (
            <button type="button"
              className="btn-primary"
              onClick={() => retomarMutation.mutate()}
              disabled={retomarMutation.isPending || encerrarMutation.isPending}
            >
              {retomarMutation.isPending ? <Spinner className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
              {retomarMutation.isPending ? 'Retomando...' : 'Retomar'}
            </button>
          )}
          <button type="button"
            className="btn-secondary text-rose-700 border-rose-300 hover:bg-rose-50"
            onClick={() => encerrarMutation.mutate()}
            disabled={encerrarMutation.isPending || pausarMutation.isPending || retomarMutation.isPending}
          >
            {encerrarMutation.isPending ? <Spinner className="h-4 w-4" /> : <StopCircle className="h-4 w-4" />}
            {encerrarMutation.isPending ? 'Encerrando...' : 'Encerrar'}
          </button>
        </div>
      )}

      {/* QR Code — aparece em todos os estados ativos */}
      {(aguardando || aberta || pausada) && <QrCodeVotacao pautaId={pautaId} />}
    </div>
  );
}

/* ─── QR Code para cooperados ─── */
function QrCodeVotacao({ pautaId }: { pautaId: number }) {
  const [copiado, setCopiado] = useState(false);
  const url = `${window.location.origin}/votar/${pautaId}`;

  function copiarLink() {
    navigator.clipboard.writeText(url).then(() => {
      setCopiado(true);
      toast.success('Link copiado!');
      setTimeout(() => setCopiado(false), 3000);
    });
  }

  return (
    <div className="border-t border-earth-100 pt-5 space-y-4">
      <div className="flex items-center gap-2">
        <QrCode className="h-4 w-4 text-coop-600" />
        <h3 className="text-sm font-bold text-coop-900">Link de Votação para Cooperados</h3>
      </div>

      <div className="flex flex-col items-center gap-4 rounded-2xl bg-earth-50 border border-earth-200 p-5">
        {/* QR Code */}
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-earth-200">
          <QRCodeSVG
            value={url}
            size={180}
            level="M"
            includeMargin={false}
            fgColor="#1a7d54"
          />
        </div>

        <div className="text-center space-y-1 w-full">
          <p className="text-xs text-earth-500 font-medium">Escaneie ou compartilhe o link:</p>
          <div className="flex items-center gap-2 bg-white border border-earth-300 rounded-xl px-3 py-2">
            <span className="text-xs text-earth-600 font-mono truncate flex-1">{url}</span>
            <button
              type="button"
              onClick={copiarLink}
              className={`flex-shrink-0 h-7 w-7 rounded-lg flex items-center justify-center transition-colors ${
                copiado ? 'bg-coop-100 text-coop-600' : 'hover:bg-earth-100 text-earth-500 hover:text-coop-600'
              }`}
              title="Copiar link"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="btn-secondary text-xs w-full justify-center"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Abrir página de votação
        </a>
      </div>

      <div className="flex items-start gap-2 text-xs text-earth-500 bg-earth-50 rounded-xl p-3">
        <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-earth-400" />
        <span>Mostre o QR code ou envie o link para os cooperados votarem pelo celular ou computador.</span>
      </div>
    </div>
  );
}

/* ─── Resultado ─── */
function ResultadoSection({ pautaId, sessao }: { pautaId: number; sessao: Sessao | null }) {
  const aberta = sessaoAberta(sessao);
  const aguardando = sessao?.status === 'AGUARDANDO';
  const pausada = sessao?.status === 'PAUSADA';
  const encerrada = sessao?.status === 'ENCERRADA';

  // Resultado oculto enquanto a votação está em andamento; revelado manualmente após encerramento
  const deveOcultar = aguardando || aberta || pausada;
  const [revelado, setRevelado] = useState(false);

  // Ao encerrar, reseta o reveal para que o admin clique explicitamente
  useEffect(() => {
    if (!encerrada) setRevelado(false);
  }, [encerrada]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['pauta-resultado', pautaId],
    queryFn: () => pautasApi.resultado(pautaId),
    refetchInterval: aberta ? 5_000 : false,
  });

  if (isLoading) return <div className="card flex items-center justify-center py-10"><Spinner className="h-7 w-7" /></div>;
  if (isError) return <div className="card border-rose-200 text-rose-600 text-sm">Erro: {(error as Error).message}</div>;
  if (!data) return null;

  const total = data.totalSim + data.totalNao;
  const pctSim = total === 0 ? 50 : Math.round((data.totalSim / total) * 100);
  const pctNao = 100 - pctSim;

  const oculto = deveOcultar || (encerrada && !revelado);

  return (
    <div className="card flex flex-col gap-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="section-title"><BarChart3 className="h-5 w-5 text-coop-600" />Resultado da Votação</h2>
          <p className="section-desc">
            {oculto ? 'Resultado oculto durante a votação.' : total === 0 ? 'Aguardando votos.' : `${total} voto${total !== 1 ? 's' : ''} computado${total !== 1 ? 's' : ''}.`}
          </p>
        </div>
        {!oculto && <StatusBadge variant="resultado" value={data.resultado} />}
      </div>

      {/* Conteúdo desfocado ou visível */}
      <div className={`relative transition-all duration-500 ${oculto ? 'select-none pointer-events-none' : ''}`}>
        {/* Overlay de desfoque */}
        {oculto && (
          <div className="absolute inset-0 z-10 rounded-2xl backdrop-blur-md bg-white/60 flex flex-col items-center justify-center gap-3 border border-earth-200">
            <div className="h-12 w-12 rounded-2xl bg-earth-100 border border-earth-300 flex items-center justify-center">
              <svg className="h-6 w-6 text-earth-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-earth-700 text-center px-4">
              {encerrada ? 'Clique em "Revelar" para ver o resultado' : 'Resultado oculto enquanto a votação está em andamento'}
            </p>
          </div>
        )}

        {/* Conteúdo */}
        <div className={`space-y-4 ${oculto ? 'blur-sm' : ''}`}>
          <div className="grid grid-cols-2 gap-3">
            <div className={`stat-card border-2 ${pctSim > pctNao && total > 0 ? 'bg-coop-50 border-coop-300' : 'bg-earth-50 border-earth-200'}`}>
              <div className="flex items-center gap-2"><ThumbsUp className="h-4 w-4 text-coop-600" /><span className="text-xs font-bold text-coop-700 uppercase tracking-wide">Sim</span></div>
              <p className="text-4xl font-bold text-coop-800 mt-1">{data.totalSim}</p>
              <p className="text-xs text-coop-600 font-semibold">{pctSim}% dos votos</p>
            </div>
            <div className={`stat-card border-2 ${pctNao > pctSim && total > 0 ? 'bg-rose-50 border-rose-300' : 'bg-earth-50 border-earth-200'}`}>
              <div className="flex items-center gap-2"><ThumbsDown className="h-4 w-4 text-rose-600" /><span className="text-xs font-bold text-rose-700 uppercase tracking-wide">Não</span></div>
              <p className="text-4xl font-bold text-rose-800 mt-1">{data.totalNao}</p>
              <p className="text-xs text-rose-600 font-semibold">{pctNao}% dos votos</p>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1.5">
              <span className="text-coop-600">SIM {pctSim}%</span>
              <span className="text-rose-600">NÃO {pctNao}%</span>
            </div>
            <div className="h-3 w-full rounded-full bg-earth-100 overflow-hidden flex shadow-inner">
              <div className="h-full bg-coop-gradient rounded-l-full transition-all duration-700" style={{ width: `${pctSim}%` }} />
              <div className="h-full bg-gradient-to-r from-rose-500 to-rose-600 rounded-r-full transition-all duration-700" style={{ width: `${pctNao}%` }} />
            </div>
            <p className="text-xs text-earth-400 mt-2 text-center">Total: <span className="font-semibold text-earth-600">{total}</span></p>
          </div>

          {data.resultado !== 'EM_ANDAMENTO' && (
            <div className={`rounded-2xl p-4 text-center ${
              data.resultado === 'APROVADA' ? 'bg-coop-gradient text-white shadow-coop'
              : data.resultado === 'REJEITADA' ? 'bg-gradient-to-r from-rose-600 to-rose-700 text-white'
              : data.resultado === 'EMPATE' ? 'bg-gold-gradient text-white shadow-gold'
              : 'bg-earth-100 text-earth-700'}`}>
              <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Resultado Final</p>
              <p className="text-2xl font-bold">
                {data.resultado === 'APROVADA' && '✔ Pauta Aprovada'}
                {data.resultado === 'REJEITADA' && '✘ Pauta Rejeitada'}
                {data.resultado === 'EMPATE' && '⇌ Empate'}
                {data.resultado === 'SEM_VOTOS' && 'Sem Votos'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Botão Revelar — aparece só após encerrar e antes de revelar */}
      {encerrada && !revelado && (
        <button
          type="button"
          onClick={() => setRevelado(true)}
          className="btn-gold w-full py-3 text-base font-bold tracking-wide"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Revelar Resultado
        </button>
      )}

      {aberta && (
        <div className="flex items-center justify-center gap-2 text-xs text-sky-600 bg-sky-50 rounded-xl p-3 border border-sky-200">
          <div className="h-2 w-2 rounded-full bg-sky-500 animate-pulse2" />
          Atualizando automaticamente...
        </div>
      )}
    </div>
  );
}
