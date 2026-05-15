package com.cooperativa.votacao.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;

@Schema(description = "Request para abertura de uma sessao de votacao")
public record AbrirSessaoRequest(

        @Schema(description = "Duracao da sessao em minutos (default 1 se nao informado)", example = "5")
        @Min(value = 1, message = "duracaoEmMinutos deve ser maior ou igual a 1")
        Integer duracaoEmMinutos
) {
}
