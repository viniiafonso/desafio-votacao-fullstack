package com.cooperativa.votacao.exception;

import com.cooperativa.votacao.dto.response.ErroResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.List;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(PautaNaoEncontradaException.class)
    public ResponseEntity<ErroResponse> handlePautaNaoEncontrada(PautaNaoEncontradaException ex, HttpServletRequest req) {
        log.warn("Pauta nao encontrada: {}", ex.getMessage());
        return build(HttpStatus.NOT_FOUND, "Pauta nao encontrada", req);
    }

    @ExceptionHandler(SessaoNaoEncontradaException.class)
    public ResponseEntity<ErroResponse> handleSessaoNaoEncontrada(SessaoNaoEncontradaException ex, HttpServletRequest req) {
        log.warn("Sessao nao encontrada: {}", ex.getMessage());
        return build(HttpStatus.NOT_FOUND, "Sessao nao encontrada", req);
    }

    @ExceptionHandler(SessaoJaAbertaException.class)
    public ResponseEntity<ErroResponse> handleSessaoJaAberta(SessaoJaAbertaException ex, HttpServletRequest req) {
        log.warn("Sessao ja aberta: {}", ex.getMessage());
        return build(HttpStatus.CONFLICT, ex.getMessage(), req);
    }

    @ExceptionHandler(SessaoEncerradaException.class)
    public ResponseEntity<ErroResponse> handleSessaoEncerrada(SessaoEncerradaException ex, HttpServletRequest req) {
        log.warn("Sessao encerrada: {}", ex.getMessage());
        return build(HttpStatus.UNPROCESSABLE_ENTITY, ex.getMessage(), req);
    }

    @ExceptionHandler(VotoDuplicadoException.class)
    public ResponseEntity<ErroResponse> handleVotoDuplicado(VotoDuplicadoException ex, HttpServletRequest req) {
        log.warn("Voto duplicado: {}", ex.getMessage());
        return build(HttpStatus.CONFLICT, "Associado ja votou", req);
    }

    @ExceptionHandler(CpfInvalidoException.class)
    public ResponseEntity<ErroResponse> handleCpfInvalido(CpfInvalidoException ex, HttpServletRequest req) {
        log.warn("CPF invalido: {}", ex.getMessage());
        return build(HttpStatus.NOT_FOUND, "CPF invalido", req);
    }

    @ExceptionHandler(AssociadoNaoAptoException.class)
    public ResponseEntity<ErroResponse> handleAssociadoNaoApto(AssociadoNaoAptoException ex, HttpServletRequest req) {
        log.warn("Associado nao apto: {}", ex.getMessage());
        return build(HttpStatus.UNPROCESSABLE_ENTITY, "Associado nao apto a votar", req);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErroResponse> handleValidacao(MethodArgumentNotValidException ex, HttpServletRequest req) {
        List<String> detalhes = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
                .toList();
        log.warn("Erro de validacao: {}", detalhes);
        return ResponseEntity.badRequest()
                .body(ErroResponse.of("Dados invalidos", HttpStatus.BAD_REQUEST.value(), req.getRequestURI(), detalhes));
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErroResponse> handleConstraint(ConstraintViolationException ex, HttpServletRequest req) {
        List<String> detalhes = ex.getConstraintViolations().stream()
                .map(v -> v.getPropertyPath() + ": " + v.getMessage())
                .toList();
        log.warn("Violacao de constraint: {}", detalhes);
        return ResponseEntity.badRequest()
                .body(ErroResponse.of("Dados invalidos", HttpStatus.BAD_REQUEST.value(), req.getRequestURI(), detalhes));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErroResponse> handleNotReadable(HttpMessageNotReadableException ex, HttpServletRequest req) {
        log.warn("Payload invalido: {}", ex.getMessage());
        return build(HttpStatus.BAD_REQUEST, "Payload invalido", req);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErroResponse> handleTypeMismatch(MethodArgumentTypeMismatchException ex, HttpServletRequest req) {
        log.warn("Tipo de parametro invalido: {}", ex.getMessage());
        return build(HttpStatus.BAD_REQUEST, "Parametro invalido", req);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErroResponse> handleDataIntegrity(DataIntegrityViolationException ex, HttpServletRequest req) {
        log.warn("Violacao de integridade: {}", ex.getMostSpecificCause().getMessage());
        return build(HttpStatus.CONFLICT, "Conflito de dados", req);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErroResponse> handleGeneric(Exception ex, HttpServletRequest req) {
        log.error("Erro nao tratado", ex);
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "Erro interno", req);
    }

    private ResponseEntity<ErroResponse> build(HttpStatus status, String mensagem, HttpServletRequest req) {
        return ResponseEntity.status(status)
                .body(ErroResponse.of(mensagem, status.value(), req.getRequestURI()));
    }
}
