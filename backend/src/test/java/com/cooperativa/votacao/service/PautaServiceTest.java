package com.cooperativa.votacao.service;

import com.cooperativa.votacao.dto.request.CriarPautaRequest;
import com.cooperativa.votacao.dto.response.PautaResponse;
import com.cooperativa.votacao.entity.Pauta;
import com.cooperativa.votacao.exception.PautaNaoEncontradaException;
import com.cooperativa.votacao.mapper.PautaMapper;
import com.cooperativa.votacao.repository.PautaRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PautaServiceTest {

    @Mock
    private PautaRepository pautaRepository;

    @Mock
    private PautaMapper pautaMapper;

    @InjectMocks
    private PautaService pautaService;

    @Test
    @DisplayName("Deve criar pauta com sucesso")
    void deveCriarPautaComSucesso() {
        CriarPautaRequest request = new CriarPautaRequest("Titulo", "Descricao");
        Pauta pautaSemId = Pauta.builder().titulo("Titulo").descricao("Descricao").build();
        Pauta salva = Pauta.builder().id(1L).titulo("Titulo").descricao("Descricao").dataCriacao(LocalDateTime.now()).build();
        PautaResponse esperado = new PautaResponse(1L, "Titulo", "Descricao", salva.getDataCriacao(), null);

        when(pautaMapper.toEntity(request)).thenReturn(pautaSemId);
        when(pautaRepository.save(pautaSemId)).thenReturn(salva);
        when(pautaMapper.toResponse(salva)).thenReturn(esperado);

        PautaResponse retorno = pautaService.criar(request);

        assertThat(retorno).isEqualTo(esperado);
    }

    @Test
    @DisplayName("Deve buscar pauta por id")
    void deveBuscarPautaPorId() {
        Pauta pauta = Pauta.builder().id(1L).titulo("T").build();
        PautaResponse resp = new PautaResponse(1L, "T", null, null, null);

        when(pautaRepository.findById(1L)).thenReturn(Optional.of(pauta));
        when(pautaMapper.toResponse(pauta)).thenReturn(resp);

        assertThat(pautaService.buscarPorId(1L)).isEqualTo(resp);
    }

    @Test
    @DisplayName("Deve lancar excecao quando pauta nao encontrada")
    void deveLancarExcecaoQuandoNaoEncontrada() {
        when(pautaRepository.findById(any())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> pautaService.buscarPorId(99L))
                .isInstanceOf(PautaNaoEncontradaException.class);
    }
}
