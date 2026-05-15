# Votação Cooperativista — Fullstack

Sistema para gerenciamento de pautas e sessões de votação em cooperativas.

## Stack

| Camada    | Tecnologia                                                                 |
|-----------|----------------------------------------------------------------------------|
| Backend   | Java 21, Spring Boot 3.3, PostgreSQL 16, Flyway, MapStruct, Springdoc     |
| Frontend  | React 18, TypeScript, Vite 5, TailwindCSS 3, React Query 5, React Router 6 |
| Infra     | Docker, Docker Compose, Nginx                                              |

---

## Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) e Docker Compose instalados

---

## Como executar (Docker Compose — recomendado)

```bash
# Clone o repositório
git clone https://github.com/viniiafonso/desafio-votacao-fullstack.git
cd desafio-votacao-fullstack

# Sobe todos os serviços (banco, backend e frontend)
docker compose up --build
```

Após subir, acesse:

| Serviço      | URL                                   |
|--------------|---------------------------------------|
| Frontend     | http://localhost:5173                 |
| Backend API  | http://localhost:8080                 |
| Swagger UI   | http://localhost:8080/swagger-ui.html |
| Health check | http://localhost:8080/actuator/health |

Para encerrar:

```bash
docker compose down          # mantém os dados do banco
docker compose down -v       # remove também o volume do banco
```

---

## Como executar sem Docker

### Backend

**Pré-requisitos:** Java 21+, Maven 3.9+, PostgreSQL 16.

```bash
# Suba o banco (se não tiver localmente)
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

O frontend sobe em `http://localhost:5173` e já faz proxy de `/api` para `http://localhost:8080` automaticamente em desenvolvimento.

---

## Funcionalidades

- **Cadastrar pautas** com título e descrição
- **Abrir sessão de votação** com duração configurável (padrão: 1 minuto)
- **Iniciar / Pausar / Retomar / Encerrar** sessões de votação
- **Registrar votos** (SIM ou NÃO) por CPF — um voto por associado por pauta
- **Contagem regressiva** ao vivo do tempo restante da sessão
- **QR code** para cooperados acessarem a página de votação pelo celular
- **Resultado em tempo real** com gráfico de barras (oculto durante a votação)
- **Validação de CPF** via Facade fake (ABLE_TO_VOTE / UNABLE_TO_VOTE aleatório)
- **Documentação da API** via Swagger UI (`/swagger-ui.html`)

---

## Testes (Backend)

```bash
cd backend
mvn test      # unitários + integração (Testcontainers com PostgreSQL)
mvn verify    # gera relatório de cobertura Jacoco em target/site/jacoco/index.html
```

---

## Versionamento da API

A API está versionada via path (`/api/v1/...`). Essa abordagem foi escolhida por ser:
- Explícita e fácil de consumir (browsers, curl, clientes REST)
- Simples de rotear em gateways/proxies por prefixo de URL
- Compatível com Spring sem configuração extra

---

## Estrutura do projeto

```
desafio-votacao-fullstack/
├── backend/                        # Spring Boot API REST
│   ├── src/
│   │   ├── main/java/...
│   │   │   ├── controller/         # PautaController, VotoController, CpfFakeController
│   │   │   ├── service/            # PautaService, SessaoService, VotoService, ResultadoService
│   │   │   ├── entity/             # Pauta, Sessao, Voto
│   │   │   ├── dto/                # Request/Response records
│   │   │   └── exception/          # GlobalExceptionHandler + exceções de negócio
│   │   └── resources/
│   │       ├── application.yml
│   │       └── db/migration/       # Scripts Flyway (V1, V2, V3)
│   └── Dockerfile
├── frontend/                       # React SPA (CoopVoto)
│   ├── src/
│   │   ├── pages/                  # ListaPautas, CriarPauta, DetalhePauta, Votar, NotFound
│   │   ├── components/             # Layout, StatusBadge, EmptyState, Spinner
│   │   ├── api/                    # client.ts (fetch), pautas.ts, votos.ts
│   │   ├── lib/                    # utils (cn, formatDateTime, maskCpf, isValidCpf)
│   │   └── types/                  # Tipos TypeScript compartilhados
│   ├── Dockerfile                  # Build multi-stage (Node → Nginx)
│   └── nginx.conf                  # Serve SPA + proxy reverso para /api
└── docker-compose.yml              # PostgreSQL + Backend + Frontend
```
