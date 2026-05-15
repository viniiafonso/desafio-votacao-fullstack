package com.cooperativa.votacao.integration;

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

import java.util.Map;

import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.notNullValue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class VotacaoIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private static final String CPF_VALIDO_1 = "52998224725";
    private static final String CPF_VALIDO_2 = "11144477735";

    @TestConfiguration
    static class MockedConfig {
        @Bean
        @Primary
        CpfStatusClient cpfStatusClient() {
            CpfStatusClient mock = mock(CpfStatusClient.class);
            when(mock.consultarStatus(anyString())).thenReturn(StatusCpf.ABLE_TO_VOTE);
            return mock;
        }
    }

    private Long criarPauta(String titulo) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/pautas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "titulo", titulo,
                                "descricao", "Desc"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(notNullValue()))
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();
    }

    private void abrirSessao(Long pautaId, int duracao) throws Exception {
        mockMvc.perform(post("/api/v1/pautas/{id}/sessao", pautaId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("duracaoEmMinutos", duracao))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("AGUARDANDO"));

        mockMvc.perform(patch("/api/v1/pautas/{id}/sessao/iniciar", pautaId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ABERTA"));
    }

    @Test
    @DisplayName("Fluxo completo: criar pauta, abrir sessao, votar e consultar resultado")
    void fluxoCompleto() throws Exception {
        Long pautaId = criarPauta("Pauta de teste");
        abrirSessao(pautaId, 5);

        mockMvc.perform(post("/api/v1/votos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "pautaId", pautaId,
                                "cpf", CPF_VALIDO_1,
                                "voto", TipoVoto.SIM.name()))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.mensagem").value("Voto registrado com sucesso"));

        mockMvc.perform(post("/api/v1/votos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "pautaId", pautaId,
                                "cpf", CPF_VALIDO_2,
                                "voto", TipoVoto.NAO.name()))))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/v1/pautas/{id}/resultado", pautaId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalSim").value(1))
                .andExpect(jsonPath("$.totalNao").value(1))
                .andExpect(jsonPath("$.resultado").value("EM_ANDAMENTO"));
    }

    @Test
    @DisplayName("Nao deve aceitar voto duplicado")
    void naoDeveAceitarVotoDuplicado() throws Exception {
        Long pautaId = criarPauta("Pauta duplicacao");
        abrirSessao(pautaId, 5);

        mockMvc.perform(post("/api/v1/votos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "pautaId", pautaId,
                                "cpf", CPF_VALIDO_1,
                                "voto", TipoVoto.SIM.name()))))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/v1/votos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "pautaId", pautaId,
                                "cpf", CPF_VALIDO_1,
                                "voto", TipoVoto.NAO.name()))))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.erro").value(equalTo("Associado ja votou")));
    }

    @Test
    @DisplayName("Nao deve abrir sessao duplicada")
    void naoDeveAbrirSessaoDuplicada() throws Exception {
        Long pautaId = criarPauta("Pauta sessao");
        abrirSessao(pautaId, 5);

        mockMvc.perform(post("/api/v1/pautas/{id}/sessao", pautaId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("Nao deve criar pauta com titulo vazio")
    void naoDeveCriarPautaComTituloVazio() throws Exception {
        mockMvc.perform(post("/api/v1/pautas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("titulo", "", "descricao", "x"))))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Nao deve abrir sessao para pauta inexistente")
    void naoDeveAbrirSessaoParaPautaInexistente() throws Exception {
        mockMvc.perform(post("/api/v1/pautas/{id}/sessao", 99999L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Deve validar CPF invalido em voto")
    void deveValidarCpfInvalidoEmVoto() throws Exception {
        Long pautaId = criarPauta("Pauta CPF");
        abrirSessao(pautaId, 5);

        mockMvc.perform(post("/api/v1/votos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "pautaId", pautaId,
                                "cpf", "00000000000",
                                "voto", TipoVoto.SIM.name()))))
                .andExpect(status().isNotFound());
    }
}
