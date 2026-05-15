package com.cooperativa.votacao.controller;

import com.cooperativa.votacao.dto.request.AbrirSessaoRequest;
import com.cooperativa.votacao.dto.request.CriarPautaRequest;
import com.cooperativa.votacao.dto.response.ErroResponse;
import com.cooperativa.votacao.dto.response.PautaResponse;
import com.cooperativa.votacao.dto.response.ResultadoVotacaoResponse;
import com.cooperativa.votacao.dto.response.SessaoResponse;
import com.cooperativa.votacao.service.PautaService;
import com.cooperativa.votacao.service.ResultadoService;
import com.cooperativa.votacao.service.SessaoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;

@Tag(name = "Pautas", description = "Operacoes relacionadas a pautas de votacao")
@RestController
@RequestMapping("/api/v1/pautas")
@RequiredArgsConstructor
public class PautaController {

    private final PautaService pautaService;
    private final SessaoService sessaoService;
    private final ResultadoService resultadoService;

    @Operation(summary = "Cadastrar uma nova pauta")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Pauta criada"),
            @ApiResponse(responseCode = "400", description = "Dados invalidos",
                    content = @Content(schema = @Schema(implementation = ErroResponse.class)))
    })
    @PostMapping
    public ResponseEntity<PautaResponse> criar(@Valid @RequestBody CriarPautaRequest request,
                                               UriComponentsBuilder uriBuilder) {
        PautaResponse response = pautaService.criar(request);
        URI location = uriBuilder.path("/api/v1/pautas/{id}").buildAndExpand(response.id()).toUri();
        return ResponseEntity.created(location).body(response);
    }

    @Operation(summary = "Listar pautas paginadas")
    @GetMapping
    public Page<PautaResponse> listar(@ParameterObject @PageableDefault(size = 20) Pageable pageable) {
        return pautaService.listar(pageable);
    }

    @Operation(summary = "Buscar pauta por id")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Pauta encontrada"),
            @ApiResponse(responseCode = "404", description = "Pauta nao encontrada",
                    content = @Content(schema = @Schema(implementation = ErroResponse.class)))
    })
    @GetMapping("/{id}")
    public PautaResponse buscar(@PathVariable Long id) {
        return pautaService.buscarPorId(id);
    }

    @Operation(summary = "Abrir sessao de votacao para uma pauta")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Sessao aberta"),
            @ApiResponse(responseCode = "404", description = "Pauta nao encontrada"),
            @ApiResponse(responseCode = "409", description = "Sessao ja existente")
    })
    @PostMapping("/{id}/sessao")
    @ResponseStatus(HttpStatus.CREATED)
    public SessaoResponse abrirSessao(@PathVariable Long id,
                                      @Valid @RequestBody(required = false) AbrirSessaoRequest request) {
        return sessaoService.abrir(id, request);
    }

    @Operation(summary = "Buscar dados da sessao da pauta")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Sessao encontrada"),
            @ApiResponse(responseCode = "404", description = "Pauta ou sessao nao encontrada")
    })
    @GetMapping("/{id}/sessao")
    public SessaoResponse buscarSessao(@PathVariable Long id) {
        return sessaoService.buscarResponsePorPautaId(id);
    }

    @Operation(summary = "Iniciar contagem regressiva da sessao (transicao de AGUARDANDO para ABERTA)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Sessao iniciada"),
            @ApiResponse(responseCode = "404", description = "Pauta ou sessao nao encontrada"),
            @ApiResponse(responseCode = "422", description = "Sessao nao esta em aguardo")
    })
    @PatchMapping("/{id}/sessao/iniciar")
    public SessaoResponse iniciarSessao(@PathVariable Long id) {
        return sessaoService.iniciar(id);
    }

    @Operation(summary = "Pausar sessao de votacao (preserva tempo restante)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Sessao pausada"),
            @ApiResponse(responseCode = "404", description = "Pauta ou sessao nao encontrada"),
            @ApiResponse(responseCode = "422", description = "Sessao nao esta aberta")
    })
    @PatchMapping("/{id}/sessao/pausar")
    public SessaoResponse pausarSessao(@PathVariable Long id) {
        return sessaoService.pausar(id);
    }

    @Operation(summary = "Retomar sessao de votacao pausada")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Sessao retomada"),
            @ApiResponse(responseCode = "404", description = "Pauta ou sessao nao encontrada"),
            @ApiResponse(responseCode = "422", description = "Sessao nao esta pausada")
    })
    @PatchMapping("/{id}/sessao/retomar")
    public SessaoResponse retomarSessao(@PathVariable Long id) {
        return sessaoService.retomar(id);
    }

    @Operation(summary = "Encerrar sessao de votacao manualmente")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Sessao encerrada"),
            @ApiResponse(responseCode = "404", description = "Pauta ou sessao nao encontrada"),
            @ApiResponse(responseCode = "422", description = "Sessao ja encerrada")
    })
    @PatchMapping("/{id}/sessao/encerrar")
    public SessaoResponse encerrarSessao(@PathVariable Long id) {
        return sessaoService.encerrarManualmente(id);
    }

    @Operation(summary = "Remover uma pauta e todos os seus dados")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Pauta removida"),
            @ApiResponse(responseCode = "404", description = "Pauta nao encontrada")
    })
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletar(@PathVariable Long id) {
        pautaService.deletar(id);
    }

    @Operation(summary = "Obter resultado de votacao da pauta")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Resultado calculado"),
            @ApiResponse(responseCode = "404", description = "Pauta nao encontrada")
    })
    @GetMapping("/{id}/resultado")
    public ResultadoVotacaoResponse resultado(@PathVariable Long id) {
        return resultadoService.obterResultado(id);
    }
}
