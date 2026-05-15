package com.cooperativa.votacao.exception;

public class PautaNaoEncontradaException extends RuntimeException {
    public PautaNaoEncontradaException(Long id) {
        super("Pauta nao encontrada para id: " + id);
    }
}
