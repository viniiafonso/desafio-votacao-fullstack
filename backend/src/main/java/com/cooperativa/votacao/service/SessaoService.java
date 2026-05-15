package com.cooperativa.votacao.service;

import com.cooperativa.votacao.dto.request.AbrirSessaoRequest;
import com.cooperativa.votacao.dto.response.SessaoResponse;
import com.cooperativa.votacao.entity.Pauta;
import com.cooperativa.votacao.entity.Sessao;
import com.cooperativa.votacao.enums.StatusSessao;
import com.cooperativa.votacao.exception.SessaoEncerradaException;
import com.cooperativa.votacao.exception.SessaoJaAbertaException;
import com.cooperativa.votacao.exception.SessaoNaoEncontradaException;
import com.cooperativa.votacao.mapper.SessaoMapper;
import com.cooperativa.votacao.repository.SessaoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class SessaoService {

    private static final int DURACAO_DEFAULT_MIN = 1;

    private final SessaoRepository sessaoRepository;
    private final SessaoMapper sessaoMapper;
    private final PautaService pautaService;

    @Transactional
    public SessaoResponse abrir(Long pautaId, AbrirSessaoRequest request) {
        log.info("Abrindo sessao para pauta {}", pautaId);
        Pauta pauta = pautaService.buscarEntidade(pautaId);

        if (sessaoRepository.existsByPautaId(pautaId)) {
            throw new SessaoJaAbertaException(pautaId);
        }

        int duracao = Optional.ofNullable(request)
                .map(AbrirSessaoRequest::duracaoEmMinutos)
                .orElse(DURACAO_DEFAULT_MIN);

        LocalDateTime inicio = LocalDateTime.now();
        Sessao sessao = Sessao.builder()
                .pauta(pauta)
                .inicio(inicio)
                .fim(inicio.plusMinutes(duracao))   // fim provisório; recalculado ao iniciar
                .status(StatusSessao.AGUARDANDO)
                .duracaoEmMinutos(duracao)
                .build();

        Sessao salva = sessaoRepository.save(sessao);
        log.info("Sessao criada em aguardo para pauta {} (duracao={}min)", pautaId, duracao);
        return sessaoMapper.toResponse(salva);
    }

    @Transactional
    public SessaoResponse iniciar(Long pautaId) {
        log.info("Iniciando contagem para pauta {}", pautaId);
        pautaService.buscarEntidade(pautaId);
        Sessao sessao = buscarPorPautaId(pautaId);

        if (sessao.getStatus() != StatusSessao.AGUARDANDO) {
            throw new SessaoEncerradaException("A sessao nao esta em estado de aguardo para ser iniciada");
        }

        int duracao = sessao.getDuracaoEmMinutos() != null ? sessao.getDuracaoEmMinutos() : 1;
        LocalDateTime agora = LocalDateTime.now();
        sessao.setInicio(agora);
        sessao.setFim(agora.plusMinutes(duracao));
        sessao.setStatus(StatusSessao.ABERTA);

        Sessao salva = sessaoRepository.save(sessao);
        log.info("Contagem iniciada para pauta {}, encerra em {}", pautaId, salva.getFim());
        return sessaoMapper.toResponse(salva);
    }

    @Transactional(readOnly = true)
    public Sessao buscarPorPautaId(Long pautaId) {
        return sessaoRepository.findByPautaId(pautaId)
                .orElseThrow(() -> new SessaoNaoEncontradaException(pautaId));
    }

    @Transactional(readOnly = true)
    public SessaoResponse buscarResponsePorPautaId(Long pautaId) {
        pautaService.buscarEntidade(pautaId);
        Sessao sessao = buscarPorPautaId(pautaId);
        return sessaoMapper.toResponse(sessao);
    }

    @Transactional
    public SessaoResponse pausar(Long pautaId) {
        log.info("Pausando sessao para pauta {}", pautaId);
        pautaService.buscarEntidade(pautaId);
        Sessao sessao = buscarPorPautaId(pautaId);

        if (sessao.getStatus() != StatusSessao.ABERTA || !sessao.estaAberta()) {
            throw new SessaoEncerradaException("A sessao nao esta aberta para ser pausada");
        }

        long segundosRestantes = ChronoUnit.SECONDS.between(LocalDateTime.now(), sessao.getFim());
        sessao.setStatus(StatusSessao.PAUSADA);
        sessao.setTempoRestanteEmSegundos(Math.max(0, segundosRestantes));

        Sessao salva = sessaoRepository.save(sessao);
        log.info("Sessao da pauta {} pausada com {} segundos restantes", pautaId, salva.getTempoRestanteEmSegundos());
        return sessaoMapper.toResponse(salva);
    }

    @Transactional
    public SessaoResponse retomar(Long pautaId) {
        log.info("Retomando sessao para pauta {}", pautaId);
        pautaService.buscarEntidade(pautaId);
        Sessao sessao = buscarPorPautaId(pautaId);

        if (sessao.getStatus() != StatusSessao.PAUSADA) {
            throw new SessaoEncerradaException("A sessao nao esta pausada");
        }

        long segundosRestantes = sessao.getTempoRestanteEmSegundos() != null
                ? sessao.getTempoRestanteEmSegundos()
                : 60L;

        sessao.setStatus(StatusSessao.ABERTA);
        sessao.setFim(LocalDateTime.now().plusSeconds(segundosRestantes));
        sessao.setTempoRestanteEmSegundos(null);

        Sessao salva = sessaoRepository.save(sessao);
        log.info("Sessao da pauta {} retomada, novo fim: {}", pautaId, salva.getFim());
        return sessaoMapper.toResponse(salva);
    }

    @Transactional
    public SessaoResponse encerrarManualmente(Long pautaId) {
        log.info("Encerrando sessao manualmente para pauta {}", pautaId);
        pautaService.buscarEntidade(pautaId);
        Sessao sessao = buscarPorPautaId(pautaId);
        if (sessao.getStatus() == StatusSessao.ENCERRADA) {
            throw new SessaoEncerradaException("A sessao de votacao da pauta " + pautaId + " ja esta encerrada");
        }
        sessao.setStatus(StatusSessao.ENCERRADA);
        sessao.setFim(LocalDateTime.now());
        Sessao salva = sessaoRepository.save(sessao);
        log.info("Sessao da pauta {} encerrada manualmente", pautaId);
        return sessaoMapper.toResponse(salva);
    }

    @Transactional(readOnly = true)
    public Optional<Sessao> buscarOptionalPorPautaId(Long pautaId) {
        return sessaoRepository.findByPautaId(pautaId);
    }

    @Transactional
    @Scheduled(fixedDelayString = "${votacao.scheduler.delay-ms:30000}")
    public void encerrarSessoesExpiradas() {
        int total = sessaoRepository.encerrarSessoesExpiradas(StatusSessao.ENCERRADA, LocalDateTime.now());
        if (total > 0) {
            log.info("Sessoes encerradas automaticamente: {}", total);
        }
    }
}
