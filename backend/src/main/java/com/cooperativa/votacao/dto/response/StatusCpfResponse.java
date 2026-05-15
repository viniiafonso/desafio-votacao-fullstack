package com.cooperativa.votacao.dto.response;

import com.cooperativa.votacao.enums.StatusCpf;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Resposta do servico de validacao de CPF")
public record StatusCpfResponse(
        @Schema(example = "ABLE_TO_VOTE") StatusCpf status
) {
}
