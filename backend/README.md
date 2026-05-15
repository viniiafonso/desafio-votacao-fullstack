# Backend - Votacao Cooperativista

API REST em Spring Boot 3 + Java 21 para o sistema de votacao.

## Stack

- Java 21
- Spring Boot 3.3 (Web, Data JPA, Validation, WebFlux, Actuator)
- PostgreSQL 16 + Flyway
- Lombok + MapStruct
- Springdoc OpenAPI
- JUnit 5 + Mockito + AssertJ + Testcontainers (PostgreSQL)
- Jacoco (cobertura)
- Maven

## Requisitos

- Java 21+
- Maven 3.9+
- PostgreSQL 16 (ou Docker)

## Configuracao

Variaveis de ambiente reconhecidas (`application.yml`):

| Variavel | Default | Descricao |
|---|---|---|
| `DB_URL` | `jdbc:postgresql://localhost:5432/votacao` | URL JDBC |
| `DB_USER` | `postgres` | Usuario do banco |
| `DB_PASSWORD` | `postgres` | Senha do banco |
| `CPF_VALIDATOR_URL` | `http://localhost:8080/api/v1/fake` | Base URL do servico de CPF |

## Executar

```bash
# Banco (se nao tiver)
docker run --rm --name pg-votacao -e POSTGRES_DB=votacao \
  -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 postgres:16-alpine

# App
mvn spring-boot:run
```

A aplicacao sobe em http://localhost:8080.

## Testes

```bash
mvn test                    # unit + integracao (com H2 em memoria)
mvn verify                  # gera relatorio Jacoco em target/site/jacoco
```

## Endpoints principais

| Metodo | Endpoint | Descricao |
|---|---|---|
| POST | `/api/v1/pautas` | Criar pauta |
| GET  | `/api/v1/pautas` | Listar pautas (paginado) |
| GET  | `/api/v1/pautas/{id}` | Detalhe |
| POST | `/api/v1/pautas/{id}/sessao` | Abrir sessao |
| GET  | `/api/v1/pautas/{id}/sessao` | Detalhes da sessao |
| GET  | `/api/v1/pautas/{id}/resultado` | Contabilizar resultado |
| POST | `/api/v1/votos` | Registrar voto |
| GET  | `/api/v1/fake/cpf/{cpf}` | CPF fake (random) |
| GET  | `/swagger-ui.html` | Documentacao OpenAPI |
| GET  | `/actuator/health` | Health check |

## Build da imagem Docker

```bash
docker build -t votacao-backend:latest .
docker run --rm -p 8080:8080 \
  -e DB_URL=jdbc:postgresql://host.docker.internal:5432/votacao \
  votacao-backend:latest
```
