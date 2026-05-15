package com.cooperativa.votacao.controller;

import com.cooperativa.votacao.dto.response.ErroResponse;
import com.cooperativa.votacao.dto.response.StatusCpfResponse;
import com.cooperativa.votacao.enums.StatusCpf;
import com.cooperativa.votacao.validator.CpfValidator;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.concurrent.ThreadLocalRandom;

@Tag(name = "CPF (Fake)", description = "Servico fake de validacao de status de CPF")
@RestController
@RequestMapping("/api/v1/fake")
@RequiredArgsConstructor
public class CpfFakeController {

    private final CpfValidator cpfValidator;

    @Operation(
            summary = "Consultar status de CPF",
            description = "Retorna 404 para CPFs invalidos. Para CPFs validos, retorna aleatoriamente " +
                    "ABLE_TO_VOTE (200) ou 404 (UNABLE_TO_VOTE), simulando elegibilidade de associado."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "CPF valido e apto a votar",
                    content = @Content(schema = @Schema(implementation = StatusCpfResponse.class))),
            @ApiResponse(responseCode = "404", description = "CPF invalido ou associado nao apto",
                    content = @Content(schema = @Schema(implementation = ErroResponse.class)))
    })
    @GetMapping("/cpf/{cpf}")
    public ResponseEntity<StatusCpfResponse> consultar(@PathVariable String cpf) {
        if (!cpfValidator.isValid(cpf)) {
            return ResponseEntity.notFound().build();
        }
        if (ThreadLocalRandom.current().nextBoolean()) {
            return ResponseEntity.ok(new StatusCpfResponse(StatusCpf.ABLE_TO_VOTE));
        }
        return ResponseEntity.notFound().build();
    }
}
