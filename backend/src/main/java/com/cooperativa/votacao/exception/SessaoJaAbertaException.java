package com.cooperativa.votacao.exception;

public class SessaoJaAbertaException extends RuntimeException {
    public SessaoJaAbertaException(Long pautaId) {
        super("Ja existe uma sessao de votacao para a pauta " + pautaId);
    }
}
