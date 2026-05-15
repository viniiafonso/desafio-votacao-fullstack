package com.cooperativa.votacao.validator;

import com.cooperativa.votacao.exception.CpfInvalidoException;
import org.springframework.stereotype.Component;

@Component
public class CpfValidator {

    public void validar(String cpf) {
        if (!isValid(cpf)) {
            throw new CpfInvalidoException(cpf);
        }
    }

    public boolean isValid(String cpf) {
        if (cpf == null) {
            return false;
        }
        String numeros = cpf.replaceAll("\\D", "");
        if (numeros.length() != 11) {
            return false;
        }
        if (numeros.chars().distinct().count() == 1) {
            return false;
        }
        try {
            int soma = 0;
            for (int i = 0; i < 9; i++) {
                soma += Character.getNumericValue(numeros.charAt(i)) * (10 - i);
            }
            int dv1 = 11 - (soma % 11);
            if (dv1 >= 10) {
                dv1 = 0;
            }
            if (dv1 != Character.getNumericValue(numeros.charAt(9))) {
                return false;
            }

            soma = 0;
            for (int i = 0; i < 10; i++) {
                soma += Character.getNumericValue(numeros.charAt(i)) * (11 - i);
            }
            int dv2 = 11 - (soma % 11);
            if (dv2 >= 10) {
                dv2 = 0;
            }
            return dv2 == Character.getNumericValue(numeros.charAt(10));
        } catch (Exception e) {
            return false;
        }
    }
}
