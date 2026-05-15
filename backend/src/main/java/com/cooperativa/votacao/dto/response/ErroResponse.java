package com.cooperativa.votacao.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Resposta padrao de erro")
public record ErroResponse(
        @Schema(example = "Pauta nao encontrada") String erro,
        @Schema(example = "404") Integer status,
        @Schema(example = "/api/v1/pautas/99") String path,
        @Schema(example = "2026-05-14T19:00:00") LocalDateTime timestamp,
        List<String> detalhes
) {
    public static ErroResponse of(String erro, int status, String path) {
        return new ErroResponse(erro, status, path, LocalDateTime.now(), null);
    }

    public static ErroResponse of(String erro, int status, String path, List<String> detalhes) {
        return new ErroResponse(erro, status, path, LocalDateTime.now(), detalhes);
    }
}
