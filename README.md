# Votação Cooperativista — Fullstack

Sistema para gerenciamento de pautas e sessões de votação em cooperativas.

## Stack

| Camada    | Tecnologia                                     |
|-----------|------------------------------------------------|
| Backend   | Java 21, Spring Boot 3.3, PostgreSQL 16, Flyway |
| Frontend  | React 18, TypeScript, Vite                     |
| Infra     | Docker, Docker Compose, Nginx                  |

---

## Como executar (Docker Compose — recomendado)

> Pré-requisitos: [Docker](https://docs.docker.com/get-docker/) e [Docker Compose](https://docs.docker.com/compose/) instalados.

```bash
# Na raiz do projeto (onde está o docker-compose.yml)
docker compose up --build
```

Após subir, os serviços estarão disponíveis em:

| Serviço      | URL                                      |
|--------------|------------------------------------------|
| Frontend     | http://localhost:5173                    |
| Backend API  | http://localhost:8080                    |
| Swagger UI   | http://localhost:8080/swagger-ui.html    |
| Health check | http://localhost:8080/actuator/health    |

Para parar:

```bash
docker compose down
```

Para parar e remover os dados do banco:

```bash
docker compose down -v
```

---

## Como executar sem Docker

### Backend

**Pré-requisitos:** Java 21+, Maven 3.9+, PostgreSQL 16 rodando localmente.

```bash
# Suba o banco (opcional, se não tiver PostgreSQL local)
docker run --rm --name pg-votacao \
  -e POSTGRES_DB=votacao \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 postgres:16-alpine

# Execute o backend
cd backend
mvn spring-boot:run
```

O backend sobe em `http://localhost:8080`.

### Frontend

**Pré-requisitos:** Node.js 20+.

```bash
cd frontend
npm install
npm run dev
```

O frontend sobe em `http://localhost:5173`.

> Por padrão, o Vite proxy `/api` para `http://backend:8080`. Em desenvolvimento local, altere o `target` em `vite.config.ts` para `http://localhost:8080`.

---

## Funcionalidades

- **Cadastrar pautas** com título e descrição
- **Abrir sessão de votação** com duração configurável (padrão: 1 minuto)
- **Iniciar / Pausar / Retomar / Encerrar** sessões
- **Registrar votos** (SIM ou NÃO) por CPF — um voto por associado por pauta
- **Consultar resultado** em tempo real com contagem de votos
- **Validação de CPF** via Facade fake (retorna aleatoriamente ABLE_TO_VOTE / UNABLE_TO_VOTE)
- **Documentação da API** via Swagger UI

---

## Testes (Backend)

```bash
cd backend
mvn test          # unitários + integração (H2 em memória)
mvn verify        # gera relatório Jacoco em target/site/jacoco/index.html
```

---

## Versionamento da API

A API está versionada via path (`/api/v1/...`). Essa abordagem foi escolhida por ser:
- Explícita e fácil de consumir (browsers, curl, clientes REST)
- Simples de versionar em gateways/proxies (roteamento por prefixo)
- Compatível com Spring sem configuração extra

---

## Estrutura do projeto

```
desafio-votacao-fullstack/
├── backend/          # Spring Boot API
│   ├── src/
│   └── Dockerfile
├── frontend/         # React + Vite SPA
│   ├── src/
│   │   ├── api.ts          # Chamadas HTTP
│   │   ├── types.ts        # Tipos TypeScript
│   │   ├── App.tsx         # Componente raiz
│   │   └── components/     # PautaCard, modais de sessão/voto/resultado
│   ├── Dockerfile
│   └── nginx.conf
└── docker-compose.yml
```
