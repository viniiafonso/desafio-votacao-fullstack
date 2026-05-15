package com.cooperativa.votacao.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Resposta com dados da pauta")
public record PautaResponse(
        @Schema(example = "1") Long id,
        @Schema(example = "Reducao da taxa administrativa") String titulo,
        @Schema(example = "Votacao para reduzir taxa de 5% para 3%") String descricao,
        @Schema(example = "2026-05-14T19:00:00") LocalDateTime dataCriacao,
        @Schema(description = "Sessao de votacao da pauta, se existir") SessaoResponse sessao
) {
}
