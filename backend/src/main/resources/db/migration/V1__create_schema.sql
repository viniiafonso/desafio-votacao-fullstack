CREATE TABLE pautas (
    id            BIGSERIAL PRIMARY KEY,
    titulo        VARCHAR(200) NOT NULL,
    descricao     VARCHAR(1000),
    data_criacao  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sessoes (
    id        BIGSERIAL PRIMARY KEY,
    pauta_id  BIGINT      NOT NULL,
    inicio    TIMESTAMP   NOT NULL,
    fim       TIMESTAMP   NOT NULL,
    status    VARCHAR(20) NOT NULL,
    CONSTRAINT fk_sessao_pauta FOREIGN KEY (pauta_id) REFERENCES pautas (id) ON DELETE CASCADE,
    CONSTRAINT uk_sessao_pauta UNIQUE (pauta_id)
);

CREATE TABLE votos (
    id         BIGSERIAL PRIMARY KEY,
    pauta_id   BIGINT      NOT NULL,
    cpf        VARCHAR(11) NOT NULL,
    voto       VARCHAR(5)  NOT NULL,
    data_voto  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_voto_pauta FOREIGN KEY (pauta_id) REFERENCES pautas (id) ON DELETE CASCADE,
    CONSTRAINT uk_voto_cpf_pauta UNIQUE (cpf, pauta_id)
);

CREATE INDEX idx_voto_pauta ON votos (pauta_id);
CREATE INDEX idx_voto_cpf   ON votos (cpf);
CREATE INDEX idx_sessao_status ON sessoes (status);
CREATE INDEX idx_pauta_data_criacao ON pautas (data_criacao DESC);
