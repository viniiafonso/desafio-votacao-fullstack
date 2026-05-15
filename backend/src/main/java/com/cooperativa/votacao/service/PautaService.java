package com.cooperativa.votacao.service;

import com.cooperativa.votacao.dto.request.CriarPautaRequest;
import com.cooperativa.votacao.dto.response.PautaResponse;
import com.cooperativa.votacao.entity.Pauta;
import com.cooperativa.votacao.exception.PautaNaoEncontradaException;
import com.cooperativa.votacao.mapper.PautaMapper;
import com.cooperativa.votacao.repository.PautaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class PautaService {

    private final PautaRepository pautaRepository;
    private final PautaMapper pautaMapper;

    @Transactional
    public PautaResponse criar(CriarPautaRequest request) {
        log.info("Criando nova pauta com titulo: {}", request.titulo());
        Pauta pauta = pautaMapper.toEntity(request);
        Pauta salva = pautaRepository.save(pauta);
        log.info("Pauta criada com id: {}", salva.getId());
        return pautaMapper.toResponse(salva);
    }

    @Transactional(readOnly = true)
    public PautaResponse buscarPorId(Long id) {
        return pautaMapper.toResponse(buscarEntidade(id));
    }

    @Transactional(readOnly = true)
    public Page<PautaResponse> listar(Pageable pageable) {
        return pautaRepository.findAll(pageable).map(pautaMapper::toResponse);
    }

    @Transactional
    public void deletar(Long id) {
        Pauta pauta = buscarEntidade(id);
        pautaRepository.delete(pauta);
        log.info("Pauta {} removida", id);
    }

    @Transactional(readOnly = true)
    public Pauta buscarEntidade(Long id) {
        return pautaRepository.findById(id)
                .orElseThrow(() -> new PautaNaoEncontradaException(id));
    }
}
