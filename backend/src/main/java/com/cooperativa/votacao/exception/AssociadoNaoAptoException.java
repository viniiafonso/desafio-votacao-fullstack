package com.cooperativa.votacao.exception;

public class AssociadoNaoAptoException extends RuntimeException {
    public AssociadoNaoAptoException(String cpf) {
        super("Associado com CPF " + cpf + " nao esta apto a votar");
    }
}
