package com.cooperativa.votacao.service;

import com.cooperativa.votacao.dto.request.AbrirSessaoRequest;
import com.cooperativa.votacao.dto.response.SessaoResponse;
import com.cooperativa.votacao.entity.Pauta;
import com.cooperativa.votacao.entity.Sessao;
import com.cooperativa.votacao.enums.StatusSessao;
import com.cooperativa.votacao.exception.SessaoJaAbertaException;
import com.cooperativa.votacao.mapper.SessaoMapper;
import com.cooperativa.votacao.repository.SessaoRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SessaoServiceTest {

    @Mock
    private SessaoRepository sessaoRepository;
    @Mock
    private SessaoMapper sessaoMapper;
    @Mock
    private PautaService pautaService;

    @InjectMocks
    private SessaoService sessaoService;

    @Test
    @DisplayName("Deve abrir sessao com duracao informada")
    void deveAbrirSessaoComDuracaoInformada() {
        Pauta pauta = Pauta.builder().id(1L).titulo("Titulo").build();
        SessaoResponse expected = new SessaoResponse(1L, LocalDateTime.now(), LocalDateTime.now().plusMinutes(5), StatusSessao.ABERTA);

        when(pautaService.buscarEntidade(1L)).thenReturn(pauta);
        when(sessaoRepository.existsByPautaId(1L)).thenReturn(false);
        when(sessaoRepository.save(any(Sessao.class))).thenAnswer(inv -> inv.getArgument(0));
        when(sessaoMapper.toResponse(any(Sessao.class))).thenReturn(expected);

        SessaoResponse response = sessaoService.abrir(1L, new AbrirSessaoRequest(5));

        assertThat(response).isEqualTo(expected);
    }

    @Test
    @DisplayName("Deve usar duracao default quando request nulo e criar sessao em AGUARDANDO")
    void deveUsarDuracaoDefault() {
        Pauta pauta = Pauta.builder().id(1L).titulo("Titulo").build();
        when(pautaService.buscarEntidade(1L)).thenReturn(pauta);
        when(sessaoRepository.existsByPautaId(1L)).thenReturn(false);
        when(sessaoRepository.save(any(Sessao.class))).thenAnswer(inv -> inv.getArgument(0));
        when(sessaoMapper.toResponse(any(Sessao.class))).thenAnswer(inv -> {
            Sessao s = inv.getArgument(0);
            return new SessaoResponse(1L, s.getInicio(), s.getFim(), s.getStatus());
        });

        SessaoResponse response = sessaoService.abrir(1L, null);

        assertThat(response.fim()).isAfter(response.inicio());
        assertThat(response.status()).isEqualTo(StatusSessao.AGUARDANDO);
    }

    @Test
    @DisplayName("Nao deve abrir sessao duplicada")
    void naoDeveAbrirSessaoDuplicada() {
        Pauta pauta = Pauta.builder().id(1L).titulo("Titulo").build();
        when(pautaService.buscarEntidade(1L)).thenReturn(pauta);
        when(sessaoRepository.existsByPautaId(1L)).thenReturn(true);

        assertThatThrownBy(() -> sessaoService.abrir(1L, new AbrirSessaoRequest(5)))
                .isInstanceOf(SessaoJaAbertaException.class);
    }
}
