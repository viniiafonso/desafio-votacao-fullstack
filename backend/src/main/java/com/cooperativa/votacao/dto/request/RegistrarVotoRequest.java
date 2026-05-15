package com.cooperativa.votacao.dto.request;

import com.cooperativa.votacao.enums.TipoVoto;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

@Schema(description = "Request para registrar um voto")
public record RegistrarVotoRequest(

        @Schema(description = "Id da pauta", example = "1")
        @NotNull(message = "pautaId e obrigatorio")
        Long pautaId,

        @Schema(description = "CPF do associado (somente numeros)", example = "12345678901")
        @NotBlank(message = "cpf e obrigatorio")
        @Pattern(regexp = "\\d{11}", message = "cpf deve conter exatamente 11 digitos numericos")
        String cpf,

        @Schema(description = "Voto do associado", example = "SIM", allowableValues = {"SIM", "NAO"})
        @NotNull(message = "voto e obrigatorio")
        TipoVoto voto
) {
}
