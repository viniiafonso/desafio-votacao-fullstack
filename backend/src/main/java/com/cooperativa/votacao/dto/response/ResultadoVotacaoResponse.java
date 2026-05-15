package com.cooperativa.votacao.dto.response;

import com.cooperativa.votacao.enums.ResultadoVotacao;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Resposta com o resultado da votacao")
public record ResultadoVotacaoResponse(
        @Schema(example = "1") Long pautaId,
        @Schema(example = "Reducao da taxa administrativa") String titulo,
        @Schema(example = "20") Long totalSim,
        @Schema(example = "12") Long totalNao,
        @Schema(example = "APROVADA") ResultadoVotacao resultado
) {
}
