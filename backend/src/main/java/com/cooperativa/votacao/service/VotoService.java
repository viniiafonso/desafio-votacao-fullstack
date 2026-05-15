package com.cooperativa.votacao.service;

import com.cooperativa.votacao.client.CpfStatusClient;
import com.cooperativa.votacao.dto.request.RegistrarVotoRequest;
import com.cooperativa.votacao.dto.response.VotoResponse;
import com.cooperativa.votacao.entity.Pauta;
import com.cooperativa.votacao.entity.Sessao;
import com.cooperativa.votacao.entity.Voto;
import com.cooperativa.votacao.enums.StatusCpf;
import com.cooperativa.votacao.exception.AssociadoNaoAptoException;
import com.cooperativa.votacao.exception.SessaoEncerradaException;
import com.cooperativa.votacao.exception.VotoDuplicadoException;
import com.cooperativa.votacao.repository.VotoRepository;
import com.cooperativa.votacao.validator.CpfValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class VotoService {

    private final VotoRepository votoRepository;
    private final PautaService pautaService;
    private final SessaoService sessaoService;
    private final CpfValidator cpfValidator;
    private final CpfStatusClient cpfStatusClient;

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public VotoResponse registrar(RegistrarVotoRequest request) {
        String cpf = normalizarCpf(request.cpf());

        cpfValidator.validar(cpf);

        Pauta pauta = pautaService.buscarEntidade(request.pautaId());

        Sessao sessao = sessaoService.buscarPorPautaId(pauta.getId());
        if (!sessao.estaAberta()) {
            throw new SessaoEncerradaException(pauta.getId());
        }

        if (votoRepository.existsByPautaIdAndCpf(pauta.getId(), cpf)) {
            throw new VotoDuplicadoException();
        }

        StatusCpf status = cpfStatusClient.consultarStatus(cpf);
        if (status != StatusCpf.ABLE_TO_VOTE) {
            throw new AssociadoNaoAptoException(cpf);
        }

        Voto voto = Voto.builder()
                .pauta(pauta)
                .cpf(cpf)
                .voto(request.voto())
                .build();
        try {
            votoRepository.save(voto);
        } catch (DataIntegrityViolationException e) {
            log.warn("Voto duplicado detectado por constraint para pauta {} e cpf {}", pauta.getId(), cpf);
            throw new VotoDuplicadoException();
        }

        log.info("Voto computado para pauta {} (cpf=***)", pauta.getId());
        return new VotoResponse("Voto registrado com sucesso");
    }

    private String normalizarCpf(String cpf) {
        return cpf == null ? null : cpf.replaceAll("\\D", "");
    }
}
