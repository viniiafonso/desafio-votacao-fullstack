package com.cooperativa.votacao.client;

import com.cooperativa.votacao.dto.response.StatusCpfResponse;
import com.cooperativa.votacao.enums.StatusCpf;
import com.cooperativa.votacao.exception.CpfInvalidoException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Duration;

@Slf4j
@Component
@RequiredArgsConstructor
public class CpfStatusClient {

    private static final Duration TIMEOUT = Duration.ofSeconds(5);

    private final WebClient cpfValidatorWebClient;

    public StatusCpf consultarStatus(String cpf) {
        log.debug("Consultando status do CPF {} no servico externo", cpf);
        try {
            StatusCpfResponse response = cpfValidatorWebClient.get()
                    .uri("/cpf/{cpf}", cpf)
                    .retrieve()
                    .bodyToMono(StatusCpfResponse.class)
                    .block(TIMEOUT);
            if (response == null || response.status() == null) {
                throw new CpfInvalidoException(cpf);
            }
            return response.status();
        } catch (WebClientResponseException e) {
            if (e.getStatusCode().equals(HttpStatus.NOT_FOUND)) {
                throw new CpfInvalidoException(cpf);
            }
            log.error("Erro ao consultar servico de CPF: {}", e.getMessage());
            return StatusCpf.ABLE_TO_VOTE;
        } catch (Exception e) {
            log.warn("Servico de CPF indisponivel ({}), assumindo ABLE_TO_VOTE", e.getMessage());
            return StatusCpf.ABLE_TO_VOTE;
        }
    }
}
