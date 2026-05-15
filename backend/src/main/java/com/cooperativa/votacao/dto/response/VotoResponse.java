package com.cooperativa.votacao.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Resposta de sucesso ao registrar um voto")
public record VotoResponse(
        @Schema(example = "Voto registrado com sucesso") String mensagem
) {
}
