package com.cooperativa.votacao.service;

import com.cooperativa.votacao.client.CpfStatusClient;
import com.cooperativa.votacao.dto.request.RegistrarVotoRequest;
import com.cooperativa.votacao.dto.response.VotoResponse;
import com.cooperativa.votacao.entity.Pauta;
import com.cooperativa.votacao.entity.Sessao;
import com.cooperativa.votacao.entity.Voto;
import com.cooperativa.votacao.enums.StatusCpf;
import com.cooperativa.votacao.enums.StatusSessao;
import com.cooperativa.votacao.enums.TipoVoto;
import com.cooperativa.votacao.exception.AssociadoNaoAptoException;
import com.cooperativa.votacao.exception.SessaoEncerradaException;
import com.cooperativa.votacao.exception.VotoDuplicadoException;
import com.cooperativa.votacao.repository.VotoRepository;
import com.cooperativa.votacao.validator.CpfValidator;
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
class VotoServiceTest {

    @Mock
    private VotoRepository votoRepository;
    @Mock
    private PautaService pautaService;
    @Mock
    private SessaoService sessaoService;
    @Mock
    private CpfStatusClient cpfStatusClient;

    private final CpfValidator cpfValidator = new CpfValidator();

    private VotoService votoService;

    private static final String CPF_VALIDO = "52998224725";

    @org.junit.jupiter.api.BeforeEach
    void setup() {
        votoService = new VotoService(votoRepository, pautaService, sessaoService, cpfValidator, cpfStatusClient);
    }

    private Pauta pauta() {
        return Pauta.builder().id(1L).titulo("Titulo").build();
    }

    private Sessao sessaoAberta(Pauta pauta) {
        return Sessao.builder()
                .id(10L)
                .pauta(pauta)
                .inicio(LocalDateTime.now().minusMinutes(1))
                .fim(LocalDateTime.now().plusMinutes(5))
                .status(StatusSessao.ABERTA)
                .build();
    }

    private Sessao sessaoEncerrada(Pauta pauta) {
        return Sessao.builder()
                .id(10L)
                .pauta(pauta)
                .inicio(LocalDateTime.now().minusMinutes(10))
                .fim(LocalDateTime.now().minusMinutes(5))
                .status(StatusSessao.ABERTA)
                .build();
    }

    @Test
    @DisplayName("Deve registrar voto valido")
    void deveRegistrarVotoValido() {
        Pauta pauta = pauta();
        when(pautaService.buscarEntidade(1L)).thenReturn(pauta);
        when(sessaoService.buscarPorPautaId(1L)).thenReturn(sessaoAberta(pauta));
        when(votoRepository.existsByPautaIdAndCpf(1L, CPF_VALIDO)).thenReturn(false);
        when(cpfStatusClient.consultarStatus(CPF_VALIDO)).thenReturn(StatusCpf.ABLE_TO_VOTE);
        when(votoRepository.save(any(Voto.class))).thenAnswer(inv -> inv.getArgument(0));

        VotoResponse response = votoService.registrar(new RegistrarVotoRequest(1L, CPF_VALIDO, TipoVoto.SIM));

        assertThat(response.mensagem()).isEqualTo("Voto registrado com sucesso");
    }

    @Test
    @DisplayName("Nao deve aceitar voto duplicado")
    void naoDeveAceitarVotoDuplicado() {
        Pauta pauta = pauta();
        when(pautaService.buscarEntidade(1L)).thenReturn(pauta);
        when(sessaoService.buscarPorPautaId(1L)).thenReturn(sessaoAberta(pauta));
        when(votoRepository.existsByPautaIdAndCpf(1L, CPF_VALIDO)).thenReturn(true);

        assertThatThrownBy(() ->
                votoService.registrar(new RegistrarVotoRequest(1L, CPF_VALIDO, TipoVoto.SIM)))
                .isInstanceOf(VotoDuplicadoException.class);
    }

    @Test
    @DisplayName("Nao deve aceitar voto com sessao encerrada")
    void naoDeveAceitarVotoSessaoEncerrada() {
        Pauta pauta = pauta();
        when(pautaService.buscarEntidade(1L)).thenReturn(pauta);
        when(sessaoService.buscarPorPautaId(1L)).thenReturn(sessaoEncerrada(pauta));

        assertThatThrownBy(() ->
                votoService.registrar(new RegistrarVotoRequest(1L, CPF_VALIDO, TipoVoto.SIM)))
                .isInstanceOf(SessaoEncerradaException.class);
    }

    @Test
    @DisplayName("Nao deve aceitar associado nao apto")
    void naoDeveAceitarAssociadoNaoApto() {
        Pauta pauta = pauta();
        when(pautaService.buscarEntidade(1L)).thenReturn(pauta);
        when(sessaoService.buscarPorPautaId(1L)).thenReturn(sessaoAberta(pauta));
        when(votoRepository.existsByPautaIdAndCpf(1L, CPF_VALIDO)).thenReturn(false);
        when(cpfStatusClient.consultarStatus(CPF_VALIDO)).thenReturn(StatusCpf.UNABLE_TO_VOTE);

        assertThatThrownBy(() ->
                votoService.registrar(new RegistrarVotoRequest(1L, CPF_VALIDO, TipoVoto.SIM)))
                .isInstanceOf(AssociadoNaoAptoException.class);
    }
}
