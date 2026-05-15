package com.cooperativa.votacao.dto.response;

import com.cooperativa.votacao.enums.StatusSessao;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "Resposta com dados da sessao de votacao")
public record SessaoResponse(
        @Schema(example = "1") Long pautaId,
        @Schema(example = "2026-05-14T19:00:00") LocalDateTime inicio,
        @Schema(example = "2026-05-14T19:05:00") LocalDateTime fim,
        @Schema(example = "ABERTA") StatusSessao status
) {
}
