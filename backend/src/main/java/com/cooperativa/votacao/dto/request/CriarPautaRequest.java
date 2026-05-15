package com.cooperativa.votacao.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Request para criacao de uma nova pauta")
public record CriarPautaRequest(

        @Schema(description = "Titulo da pauta", example = "Reducao da taxa administrativa")
        @NotBlank(message = "titulo e obrigatorio")
        @Size(max = 200, message = "titulo deve ter no maximo 200 caracteres")
        String titulo,

        @Schema(description = "Descricao opcional da pauta", example = "Votacao para reduzir taxa de 5% para 3%")
        @Size(max = 1000, message = "descricao deve ter no maximo 1000 caracteres")
        String descricao
) {
}
