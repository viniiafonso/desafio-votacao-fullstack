package com.cooperativa.votacao.exception;

public class SessaoNaoEncontradaException extends RuntimeException {
    public SessaoNaoEncontradaException(Long pautaId) {
        super("Sessao nao encontrada para a pauta " + pautaId);
    }
}
