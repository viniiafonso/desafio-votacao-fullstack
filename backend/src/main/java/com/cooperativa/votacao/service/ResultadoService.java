package com.cooperativa.votacao.service;

import com.cooperativa.votacao.dto.response.ResultadoVotacaoResponse;
import com.cooperativa.votacao.entity.Pauta;
import com.cooperativa.votacao.entity.Sessao;
import com.cooperativa.votacao.enums.ResultadoVotacao;
import com.cooperativa.votacao.enums.TipoVoto;
import com.cooperativa.votacao.repository.VotoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumMap;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResultadoService {

    private final PautaService pautaService;
    private final SessaoService sessaoService;
    private final VotoRepository votoRepository;

    @Transactional(readOnly = true)
    public ResultadoVotacaoResponse obterResultado(Long pautaId) {
        log.debug("Calculando resultado da pauta {}", pautaId);
        Pauta pauta = pautaService.buscarEntidade(pautaId);
        Optional<Sessao> sessao = sessaoService.buscarOptionalPorPautaId(pautaId);

        Map<TipoVoto, Long> totais = new EnumMap<>(TipoVoto.class);
        totais.put(TipoVoto.SIM, 0L);
        totais.put(TipoVoto.NAO, 0L);

        votoRepository.contarVotosPorTipo(pautaId)
                .forEach(c -> totais.put(c.getTipo(), c.getTotal()));

        long sim = totais.get(TipoVoto.SIM);
        long nao = totais.get(TipoVoto.NAO);
        ResultadoVotacao resultado = calcular(sim, nao, sessao);

        return new ResultadoVotacaoResponse(pauta.getId(), pauta.getTitulo(), sim, nao, resultado);
    }

    private ResultadoVotacao calcular(long sim, long nao, Optional<Sessao> sessao) {
        if (sessao.isPresent() && sessao.get().estaAberta()) {
            return ResultadoVotacao.EM_ANDAMENTO;
        }
        if (sim == 0 && nao == 0) {
            return ResultadoVotacao.SEM_VOTOS;
        }
        if (sim > nao) {
            return ResultadoVotacao.APROVADA;
        }
        if (nao > sim) {
            return ResultadoVotacao.REJEITADA;
        }
        return ResultadoVotacao.EMPATE;
    }
}
