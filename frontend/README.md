# Frontend - Votacao Cooperativista

SPA em React + Vite + TypeScript + TailwindCSS para o sistema de votacao.

## Stack

- React 18 + TypeScript estrito
- Vite 5
- TailwindCSS 3
- React Router 6
- TanStack Query (React Query) 5
- Axios
- Sonner (toasts)
- lucide-react (icones)

## Requisitos

- Node.js 20+
- npm 10+

## Configuracao

Crie um `.env.local` baseado em `.env.example`:

```env
VITE_API_URL=http://localhost:8080/api/v1
```

> Em desenvolvimento o Vite tambem proxia `/api` para o backend (ver `vite.config.ts`).
> Em producao via Docker, o Nginx faz o proxy reverso para `backend:8080`.

## Scripts

```bash
npm install              # instala dependencias
npm run dev              # dev server em http://localhost:5173
npm run build            # type-check estrito + build de producao
npm run preview          # serve o build localmente
```

## Estrutura

```
src/
├── api/             # axios + clients (pautas, votos)
├── components/      # Layout, StatusBadge, EmptyState, Spinner
├── lib/             # utils (cpf, datas, classnames)
├── pages/           # ListaPautas, CriarPauta, DetalhePauta, NotFound
├── types/           # tipos compartilhados
├── App.tsx          # roteamento
├── main.tsx         # bootstrap
└── index.css        # Tailwind + componentes utilitarios
```

## Funcionalidades

- Listagem de pautas com data formatada e link para detalhes.
- Criacao de pauta com validacao client-side e feedback via toast.
- Pagina de detalhes:
  - Abertura de sessao com duracao configuravel.
  - Countdown ao vivo do tempo restante.
  - Formulario de voto com mascara de CPF + validacao algoritmica antes do envio.
  - Resultado em tempo real (refetch a cada 5s enquanto sessao aberta).
  - Barra de progresso visual de SIM x NAO.
- Tratamento elegante de erros (toasts + tela de erro).
- Layout responsivo mobile-first.

## Build da imagem Docker

```bash
docker build -t votacao-frontend:latest .
docker run --rm -p 5173:5173 votacao-frontend:latest
```
