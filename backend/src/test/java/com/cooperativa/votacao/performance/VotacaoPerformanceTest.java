package com.cooperativa.votacao.performance;

import com.cooperativa.votacao.client.CpfStatusClient;
import com.cooperativa.votacao.enums.StatusCpf;
import com.cooperativa.votacao.enums.TipoVoto;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Teste de performance para validar comportamento sob carga concorrente.
 *
 * Simula N threads votando simultaneamente em uma mesma pauta, verificando:
 * - Ausencia de duplicatas (constraint de unicidade cpf+pauta)
 * - Contagem final correta
 * - Throughput aceitavel
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class VotacaoPerformanceTest {

    private static final int THREADS = 20;
    private static final int VOTOS_ESPERADOS = THREADS;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @TestConfiguration
    static class MockConfig {
        @Bean
        @Primary
        CpfStatusClient cpfStatusClient() {
            CpfStatusClient mock = mock(CpfStatusClient.class);
            when(mock.consultarStatus(anyString())).thenReturn(StatusCpf.ABLE_TO_VOTE);
            return mock;
        }
    }

    @Test
    @DisplayName("Deve processar votos concorrentes sem duplicatas e com throughput aceitavel")
    void deveProcessarVotosConcorrentes() throws Exception {
        Long pautaId = criarPauta("Pauta Performance " + System.currentTimeMillis());
        abrirESessaoEIniciar(pautaId, 10);

        List<String> cpfs = gerarCpfsValidos(THREADS);

        ExecutorService executor = Executors.newFixedThreadPool(THREADS);
        AtomicInteger sucessos = new AtomicInteger();
        AtomicInteger conflitos = new AtomicInteger();

        List<Callable<Integer>> tasks = new ArrayList<>();
        for (int i = 0; i < THREADS; i++) {
            final String cpf = cpfs.get(i);
            final TipoVoto voto = i % 2 == 0 ? TipoVoto.SIM : TipoVoto.NAO;
            tasks.add(() -> {
                try {
                    int status = mockMvc.perform(post("/api/v1/votos")
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .content(objectMapper.writeValueAsString(Map.of(
                                            "pautaId", pautaId,
                                            "cpf", cpf,
                                            "voto", voto.name()))))
                            .andReturn()
                            .getResponse()
                            .getStatus();
                    if (status == 201) {
                        sucessos.incrementAndGet();
                    } else if (status == 409) {
                        conflitos.incrementAndGet();
                    }
                    return status;
                } catch (Exception e) {
                    return 500;
                }
            });
        }

        long inicio = System.currentTimeMillis();
        List<Future<Integer>> futures = executor.invokeAll(tasks);
        executor.shutdown();
        long elapsed = System.currentTimeMillis() - inicio;

        futures.forEach(f -> {
            try {
                f.get();
            } catch (Exception ignored) {
            }
        });

        assertThat(sucessos.get()).isEqualTo(VOTOS_ESPERADOS);
        assertThat(conflitos.get()).isZero();

        MvcResult resultado = mockMvc.perform(get("/api/v1/pautas/{id}/resultado", pautaId))
                .andExpect(status().isOk())
                .andReturn();

        long totalVotos = objectMapper.readTree(resultado.getResponse().getContentAsString())
                .path("totalSim").asLong()
                + objectMapper.readTree(resultado.getResponse().getContentAsString())
                .path("totalNao").asLong();

        assertThat(totalVotos).isEqualTo(VOTOS_ESPERADOS);

        double throughput = (VOTOS_ESPERADOS * 1000.0) / elapsed;
        System.out.printf(
                "[PERFORMANCE] %d votos concorrentes em %d ms (%.1f votos/s)%n",
                VOTOS_ESPERADOS, elapsed, throughput
        );

        assertThat(throughput).isGreaterThan(5.0);
    }

    @Test
    @DisplayName("Deve rejeitar voto duplicado do mesmo CPF sob concorrencia")
    void deveRejeitarVotoDuplicadoConcorrente() throws Exception {
        Long pautaId = criarPauta("Pauta Duplicata " + System.currentTimeMillis());
        abrirESessaoEIniciar(pautaId, 10);

        String cpf = "52998224725";
        int tentativas = 5;

        ExecutorService executor = Executors.newFixedThreadPool(tentativas);
        AtomicInteger sucessos = new AtomicInteger();

        List<Callable<Integer>> tasks = new ArrayList<>();
        for (int i = 0; i < tentativas; i++) {
            tasks.add(() -> {
                try {
                    int httpStatus = mockMvc.perform(post("/api/v1/votos")
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .content(objectMapper.writeValueAsString(Map.of(
                                            "pautaId", pautaId,
                                            "cpf", cpf,
                                            "voto", TipoVoto.SIM.name()))))
                            .andReturn()
                            .getResponse()
                            .getStatus();
                    if (httpStatus == 201) {
                        sucessos.incrementAndGet();
                    }
                    return httpStatus;
                } catch (Exception e) {
                    return 500;
                }
            });
        }

        executor.invokeAll(tasks);
        executor.shutdown();

        assertThat(sucessos.get()).isEqualTo(1);
    }

    private Long criarPauta(String titulo) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/pautas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("titulo", titulo))))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();
    }

    private void abrirESessaoEIniciar(Long pautaId, int duracao) throws Exception {
        mockMvc.perform(post("/api/v1/pautas/{id}/sessao", pautaId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("duracaoEmMinutos", duracao))))
                .andExpect(status().isCreated());

        mockMvc.perform(patch("/api/v1/pautas/{id}/sessao/iniciar", pautaId))
                .andExpect(status().isOk());
    }

    /**
     * Gera CPFs validos de forma deterministica calculando os digitos verificadores.
     */
    private List<String> gerarCpfsValidos(int quantidade) {
        List<String> cpfs = new ArrayList<>();
        int base = 100000000;
        while (cpfs.size() < quantidade) {
            String cpf = calcularCpf(base++);
            if (cpf != null) {
                cpfs.add(cpf);
            }
        }
        return cpfs;
    }

    private String calcularCpf(int base) {
        String n = String.format("%09d", base);
        if (n.chars().distinct().count() == 1) {
            return null;
        }
        int sum1 = 0;
        for (int i = 0; i < 9; i++) {
            sum1 += (n.charAt(i) - '0') * (10 - i);
        }
        int d1 = 11 - (sum1 % 11);
        if (d1 >= 10) d1 = 0;

        String s = n + d1;
        int sum2 = 0;
        for (int i = 0; i < 10; i++) {
            sum2 += (s.charAt(i) - '0') * (11 - i);
        }
        int d2 = 11 - (sum2 % 11);
        if (d2 >= 10) d2 = 0;

        return s + d2;
    }
}
