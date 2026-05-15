package com.cooperativa.votacao.validator;

import com.cooperativa.votacao.exception.CpfInvalidoException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class CpfValidatorTest {

    private final CpfValidator validator = new CpfValidator();

    @ParameterizedTest(name = "[{index}] CPF valido: {0}")
    @ValueSource(strings = {"52998224725", "11144477735", "529.982.247-25"})
    @DisplayName("Deve aceitar CPFs validos com ou sem mascara")
    void deveAceitarCpfsValidos(String cpf) {
        assertThat(validator.isValid(cpf)).isTrue();
    }

    @ParameterizedTest(name = "[{index}] CPF invalido: {0}")
    @ValueSource(strings = {"12345678901", "00000000000", "11111111111", "abc", "1234"})
    @DisplayName("Deve recusar CPFs invalidos")
    void deveRecusarCpfsInvalidos(String cpf) {
        assertThat(validator.isValid(cpf)).isFalse();
    }

    @Test
    @DisplayName("Deve recusar CPF nulo")
    void deveRecusarCpfNulo() {
        assertThat(validator.isValid(null)).isFalse();
    }

    @Test
    @DisplayName("Deve lancar excecao quando CPF for invalido")
    void deveLancarExcecaoParaCpfInvalido() {
        assertThatThrownBy(() -> validator.validar("00000000000"))
                .isInstanceOf(CpfInvalidoException.class);
    }

    @Test
    @DisplayName("Nao deve lancar excecao para CPF valido")
    void naoDeveLancarExcecaoParaCpfValido() {
        validator.validar("52998224725");
    }
}
