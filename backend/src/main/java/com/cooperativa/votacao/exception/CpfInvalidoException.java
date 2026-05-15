package com.cooperativa.votacao.exception;

public class CpfInvalidoException extends RuntimeException {
    public CpfInvalidoException(String cpf) {
        super("CPF invalido: " + cpf);
    }
}
