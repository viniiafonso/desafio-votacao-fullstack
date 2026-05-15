package com.cooperativa.votacao.service;

import com.cooperativa.votacao.dto.response.ResultadoVotacaoResponse;
import com.cooperativa.votacao.entity.Pauta;
import com.cooperativa.votacao.entity.Sessao;
import com.cooperativa.votacao.enums.ResultadoVotacao;
import com.cooperativa.votacao.enums.StatusSessao;
import com.cooperativa.votacao.enums.TipoVoto;
import com.cooperativa.votacao.repository.VotoRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ResultadoServiceTest {

    @Mock
    private PautaService pautaService;
    @Mock
    private SessaoService sessaoService;
    @Mock
    private VotoRepository votoRepository;

    @InjectMocks
    private ResultadoService resultadoService;

    private Pauta pauta() {
        return Pauta.builder().id(1L).titulo("Titulo").build();
    }

    private Sessao sessao(StatusSessao status, boolean expirada) {
        LocalDateTime agora = LocalDateTime.now();
        return Sessao.builder()
                .pauta(pauta())
                .inicio(agora.minusMinutes(10))
                .fim(expirada ? agora.minusMinutes(1) : agora.plusMinutes(5))
                .status(status)
                .build();
    }

    private VotoRepository.ContagemVotos contagem(TipoVoto tipo, long total) {
        return new VotoRepository.ContagemVotos() {
            @Override
            public TipoVoto getTipo() {
                return tipo;
            }

            @Override
            public Long getTotal() {
                return total;
            }
        };
    }

    @Test
    @DisplayName("Deve retornar EM_ANDAMENTO quando sessao aberta")
    void deveRetornarEmAndamentoQuandoSessaoAberta() {
        when(pautaService.buscarEntidade(1L)).thenReturn(pauta());
        when(sessaoService.buscarOptionalPorPautaId(1L)).thenReturn(Optional.of(sessao(StatusSessao.ABERTA, false)));
        when(votoRepository.contarVotosPorTipo(1L)).thenReturn(List.of(contagem(TipoVoto.SIM, 5L)));

        ResultadoVotacaoResponse response = resultadoService.obterResultado(1L);

        assertThat(response.resultado()).isEqualTo(ResultadoVotacao.EM_ANDAMENTO);
    }

    @Test
    @DisplayName("Deve retornar APROVADA quando SIM maior que NAO")
    void deveRetornarAprovada() {
        when(pautaService.buscarEntidade(1L)).thenReturn(pauta());
        when(sessaoService.buscarOptionalPorPautaId(1L)).thenReturn(Optional.of(sessao(StatusSessao.ENCERRADA, true)));
        when(votoRepository.contarVotosPorTipo(1L)).thenReturn(List.of(
                contagem(TipoVoto.SIM, 20L),
                contagem(TipoVoto.NAO, 12L)));

        ResultadoVotacaoResponse response = resultadoService.obterResultado(1L);

        assertThat(response.totalSim()).isEqualTo(20L);
        assertThat(response.totalNao()).isEqualTo(12L);
        assertThat(response.resultado()).isEqualTo(ResultadoVotacao.APROVADA);
    }

    @Test
    @DisplayName("Deve retornar REJEITADA quando NAO maior que SIM")
    void deveRetornarRejeitada() {
        when(pautaService.buscarEntidade(1L)).thenReturn(pauta());
        when(sessaoService.buscarOptionalPorPautaId(1L)).thenReturn(Optional.of(sessao(StatusSessao.ENCERRADA, true)));
        when(votoRepository.contarVotosPorTipo(1L)).thenReturn(List.of(
                contagem(TipoVoto.SIM, 5L),
                contagem(TipoVoto.NAO, 10L)));

        ResultadoVotacaoResponse response = resultadoService.obterResultado(1L);

        assertThat(response.resultado()).isEqualTo(ResultadoVotacao.REJEITADA);
    }

    @Test
    @DisplayName("Deve retornar EMPATE quando SIM igual NAO")
    void deveRetornarEmpate() {
        when(pautaService.buscarEntidade(1L)).thenReturn(pauta());
        when(sessaoService.buscarOptionalPorPautaId(1L)).thenReturn(Optional.of(sessao(StatusSessao.ENCERRADA, true)));
        when(votoRepository.contarVotosPorTipo(1L)).thenReturn(List.of(
                contagem(TipoVoto.SIM, 3L),
                contagem(TipoVoto.NAO, 3L)));

        ResultadoVotacaoResponse response = resultadoService.obterResultado(1L);

        assertThat(response.resultado()).isEqualTo(ResultadoVotacao.EMPATE);
    }

    @Test
    @DisplayName("Deve retornar SEM_VOTOS quando nao houver votos")
    void deveRetornarSemVotos() {
        when(pautaService.buscarEntidade(1L)).thenReturn(pauta());
        when(sessaoService.buscarOptionalPorPautaId(1L)).thenReturn(Optional.empty());
        when(votoRepository.contarVotosPorTipo(1L)).thenReturn(List.of());

        ResultadoVotacaoResponse response = resultadoService.obterResultado(1L);

        assertThat(response.resultado()).isEqualTo(ResultadoVotacao.SEM_VOTOS);
    }
}
