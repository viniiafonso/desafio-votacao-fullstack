package com.cooperativa.votacao.exception;

public class SessaoEncerradaException extends RuntimeException {
    public SessaoEncerradaException(Long pautaId) {
        super("A sessao de votacao da pauta " + pautaId + " nao esta aberta");
    }

    public SessaoEncerradaException(String message) {
        super(message);
    }
}
