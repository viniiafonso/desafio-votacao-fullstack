package com.cooperativa.votacao.exception;

public class VotoDuplicadoException extends RuntimeException {
    public VotoDuplicadoException() {
        super("Associado ja votou nesta pauta");
    }
}
