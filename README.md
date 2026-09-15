# Hackathon backend — Resolve Aí

Condomínios, empresas, bairros e organizações enfrentam dificuldades
para registrar, acompanhar e resolver problemas do dia a dia.
Normalmente, as solicitações chegam por mensagens, e-mails ou
conversas informais, dificultando a priorização e o acompanhamento.
O desafio dos grupos será desenvolver uma plataforma digital chamada
Resolve Aí, permitindo que usuários registrem ocorrências e acompanhem todo
o processo até sua resolução. A descrição completa dos requisitos está em [REQUISITOS.md](./REQUISITOS.md).

> **Sobre a base do projeto:** escolhi partir desta base (Express + TypeScript em Clean Architecture, Sequelize, JWT, Jest, Docker e pipeline no GitHub Actions) porque já a utilizei em entregas anteriores da pós. Como a estrutura de camadas, autenticação, testes e deploy já estava dominada, pude concentrar o tempo do hackathon nas regras de negócio das ocorrências — isso acelerou muito o desenvolvimento.

Disponível no Docker Hub:

```bash
docker pull fabriciopereiraviana/hackathon-backend:latest
```

---

## Sumário

- [Setup inicial](#setup-inicial)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Arquitetura](#arquitetura)
- [Estrutura de diretórios](#estrutura-de-diretórios)
- [Endpoints da API](#endpoints-da-api)
- [Autenticação e autorização](#autenticação-e-autorização)
- [Documentação da API (Swagger)](#documentação-da-api-swagger)
- [Persistência de dados](#persistência-de-dados)
- [Testes unitários](#testes-unitários)
- [CI/CD com GitHub Actions](#cicd-com-github-actions)
- [Docker](#docker)
- [Tecnologias utilizadas](#tecnologias-utilizadas)
- [Dificuldades encontradas](#dificuldades-encontradas)
- [Participante](#participante)

---

## Setup inicial

### Pré-requisitos

- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/) instalados.

### Passo a passo

1. Clone o repositório:

```bash
git clone https://github.com/Fabricio-P-Viana/fiap-pos-hackathon-backend.git
cd fiap-pos-hackathon-backend
```

2. Copie o arquivo de variáveis de ambiente e configure os valores:

```bash
cp .env-example .env
```

3. Suba todos os serviços:

```bash
docker-compose up -d --build
```

4. Acesse os serviços:

| Serviço             | URL                            |
| ------------------- | ------------------------------ |
| API                 | http://localhost:3001          |
| Documentação da API | http://localhost:3001/api-docs |
| pgAdmin             | http://localhost:8080          |

> A aplicação cria o banco (se necessário) e executa as migrations automaticamente na subida do container. Os seeds não rodam automaticamente: use o passo 4 quando quiser dados de teste.

---

## Variáveis de ambiente

| Variável                    | Descrição                                                    | Exemplo                                       |
| --------------------------- | ------------------------------------------------------------ | --------------------------------------------- |
| `DB_NAME`                   | Nome do banco de dados                                       | `resolveai`                                   |
| `DB_USER`                   | Usuário do PostgreSQL                                        | `postgres`                                    |
| `DB_PASS`                   | Senha do PostgreSQL                                          | `postgres`                                    |
| `DB_HOST`                   | Host do banco de dados                                       | `db`                                          |
| `DB_PORT`                   | Porta do banco de dados                                      | `5432`                                        |
| `DATABASE_URL`              | URL única de conexão PostgreSQL (produção/Render)            | `postgresql://user:pass@host:5432/db`         |
| `DB_SSL`                    | Habilita SSL para conexão com banco                          | `true`                                        |
| `POSTGRES_PASSWORD`         | Senha root do container Postgres                             | `postgres`                                    |
| `JWT_SECRET`                | Segredo para assinar tokens JWT                              | `meu_segredo`                                 |
| `PGADMIN_DEFAULT_EMAIL`     | Email Default para acessar o pgAdmin                         | `postgres@email.com`                          |
| `PGADMIN_DEFAULT_PASSWORD`  | Senha Default para acessar o pgAdmin                         | `postgres`                                    |
| `CORS_ORIGIN`               | Origens permitidas no CORS (separadas por vírgula)           | `http://localhost:3000,https://meu-front.com` |
| `SUPABASE_URL`              | URL do projeto Supabase (Storage dos anexos)                 | `https://xyz.supabase.co`                     |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave de serviço do Supabase                                 | `eyJhbGciOi...`                               |
| `SUPABASE_STORAGE_BUCKET`   | Bucket onde as imagens das ocorrências são salvas            | `attachments`                                 |
| `APP_BASE_URL`              | URL pública da API, usada nas URLs dos anexos em disco local | `http://localhost:3001`                       |

> Sem as variáveis do Supabase, os anexos são gravados em disco local (`uploads/`) e servidos pela própria API.

---

## Arquitetura

O projeto segue a **Clean Architecture**, garantindo separação de responsabilidades, testabilidade, baixo acoplamento e independência de frameworks. As dependências apontam sempre para dentro — a lógica de negócio **nunca** depende de detalhes de infraestrutura.

```
┌─────────────────────────────────────────────────────────────┐
│                     Interface Adapters                       │
│  Controllers · Presenters · Routes · Middlewares             │
├─────────────────────────────────────────────────────────────┤
│                       Application                            │
│          Use Cases · DTOs (orquestração)                     │
├─────────────────────────────────────────────────────────────┤
│                         Domain                               │
│  Entities · Enums · Repository Interfaces · Services         │
│  OccurrencePolicy (regras de autorização) · Erros            │
├─────────────────────────────────────────────────────────────┤
│                      Infrastructure                          │
│  Sequelize Repositories · JWT Auth · Storage (Supabase/disco)│
│  Migrations · Seeders · Swagger                              │
└─────────────────────────────────────────────────────────────┘
```

### Camadas e responsabilidades

| Camada                 | Diretório                 | Responsabilidade                                                                                                                                                                                                                                                  |
| ---------------------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Domain**             | `src/domain/`             | Entidades (`Occurrence`, `OccurrenceEvent`, `Comment`, `Attachment`, `Rating`, `Category`, `User`), enums de status e prioridade, interfaces de repositório e serviço, erros de domínio e a `OccurrencePolicy`, que concentra as regras de quem pode fazer o quê. |
| **Application**        | `src/application/`        | DTOs com validação (ex: `OccurrenceFilterDTO`) e use cases que orquestram o fluxo (ex: `ChangeOccurrenceStatusUseCase`), consultando a policy do domínio.                                                                                                         |
| **Interface Adapters** | `src/interface-adapters/` | Controllers (recebem HTTP e delegam para use cases), presenters (definem o contrato JSON, incluindo nomes de solicitante/responsável), rotas (composition root com injeção de dependência) e middlewares (auth, autorização, upload, error handler, logging).     |
| **Infrastructure**     | `src/infrastructure/`     | Implementações concretas: repositórios Sequelize, `JwtAuthService`, storage de anexos (Supabase ou disco local), configuração do banco, migrations, seeders e Swagger.                                                                                            |

### Fluxo de uma requisição

```
Client → Route (composition root) → Middleware (auth/authorize)
       → Controller → Use Case → OccurrencePolicy (regras) → Repository Interface
       → Infrastructure (Sequelize → PostgreSQL)
       → Presenter → Response JSON
```

### Entry point e composition root

- **Entry point:** `src/server.ts` — inicializa Express, middlewares globais, rotas e conexão com o banco.
- **Composition root:** `src/interface-adapters/routes/*.ts` — cada arquivo de rota instancia os repositórios, monta os use cases e injeta no controller correspondente.

---

## Estrutura de diretórios

```
src/
├── domain/                          # Camada de domínio (entidades e contratos)
│   ├── entities/                    # Occurrence, OccurrenceEvent, Comment, Attachment, Rating, Category, User
│   ├── enums/                       # Status (com transições permitidas), prioridade e tipos de evento
│   ├── errors/                      # Erros de domínio tipados (Validation, Unauthorized, NotFound...)
│   ├── repositories/                # Interfaces dos repositórios (filtros, ordenação, indicadores)
│   └── services/
│       ├── AuthService.ts           # Interface do serviço de autenticação
│       ├── OccurrencePolicy.ts      # Regras: responsável, histórico, quem comenta/anexa/avalia
│       └── StorageService.ts        # Interface do armazenamento de anexos
│
├── application/                     # Camada de aplicação (use cases e DTOs)
│   ├── auth/                        # Login
│   ├── user/                        # Cadastro, gestores, CRUD e busca por role
│   ├── category/                    # CRUD de categorias
│   ├── occurrence/                  # Abrir, listar (filtros/ordenação), editar, atribuir responsável,
│   │                                # mudar status, cancelar com motivo, histórico, eventos recentes, dashboard
│   ├── comment/                     # Comentários (internos para gestores; bloqueados após encerrar)
│   ├── attachment/                  # Upload de imagens e listagem por ocorrência
│   └── rating/                      # Avaliação da resolução e listagem escopada
│
├── interface-adapters/              # Camada de adaptadores de interface
│   ├── controllers/                 # Um controller por recurso
│   ├── middlewares/
│   │   ├── auth.ts                  # Validação do token JWT
│   │   ├── authorize.ts             # Verificação de role (REQUESTER/MANAGER)
│   │   ├── uploadImage.ts           # Recebimento multipart das imagens
│   │   ├── errorHandler.ts          # Tratamento centralizado de erros
│   │   └── requestLogger.ts         # Log de requisições
│   ├── presenters/                  # Contratos de saída (nomes, labels legíveis, URL do anexo)
│   └── routes/                      # Composition root (injeção de dependência) + anotações Swagger
│
├── infrastructure/                  # Camada de infraestrutura
│   ├── auth/services/
│   │   └── JwtAuthService.ts        # JWT + bcrypt
│   ├── database/
│   │   ├── config.ts / config.cjs
│   │   ├── sequelize.ts             # Conexão e associações entre models
│   │   ├── migrations/
│   │   ├── models/
│   │   └── seeders/                 # Categorias base + base de testes
│   ├── frameworks/                  # CORS e Swagger
│   ├── repositories/postgresql/     # Repositórios Sequelize
│   └── storage/                     # Supabase Storage ou disco local
│
└── server.ts                        # Entry point da aplicação
```

---

## Endpoints da API

Todas as rotas, exceto cadastro e login, exigem `Authorization: Bearer <token>`.

### Autenticação

| Método | Rota          | Descrição                 | Auth |
| ------ | ------------- | ------------------------- | ---- |
| `POST` | `/auth/login` | Login (retorna token JWT) | Não  |

### Usuários

| Método   | Rota                | Descrição                | Auth | Role    |
| -------- | ------------------- | ------------------------ | ---- | ------- |
| `POST`   | `/users`            | Cadastro de solicitante  | Não  | —       |
| `POST`   | `/users/managers`   | Criar gestor             | Sim  | MANAGER |
| `GET`    | `/users`            | Listar usuários          | Sim  | MANAGER |
| `GET`    | `/users/role?role=` | Listar usuários por role | Sim  | MANAGER |
| `GET`    | `/users/:id`        | Buscar usuário por ID    | Sim  | MANAGER |
| `PUT`    | `/users/:id`        | Atualizar usuário        | Sim  | —       |
| `DELETE` | `/users/:id`        | Excluir usuário          | Sim  | —       |

### Categorias

| Método   | Rota              | Descrição                 | Role    |
| -------- | ----------------- | ------------------------- | ------- |
| `GET`    | `/categories`     | Listar categorias         | —       |
| `GET`    | `/categories/:id` | Buscar categoria          | —       |
| `POST`   | `/categories`     | Criar categoria           | MANAGER |
| `PUT`    | `/categories/:id` | Atualizar/ativar/inativar | MANAGER |
| `DELETE` | `/categories/:id` | Excluir categoria         | MANAGER |

### Ocorrências (solicitações)

| Método  | Rota                         | Descrição                                                                                                                                                                                    | Role                          |
| ------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| `POST`  | `/occurrences`               | Abrir solicitação (status `OPEN`)                                                                                                                                                            | —                             |
| `GET`   | `/occurrences`               | Listar com filtros (`status`, `priority`, `categoryId`, `assigneeId` ou `me`, `search`, datas), ordenação (`sortBy`=`priority`\|`createdAt`\|`updatedAt`\|`status`, `sortOrder`) e paginação | Solicitante vê só as próprias |
| `GET`   | `/occurrences/:id`           | Detalhe da solicitação, com nomes de solicitante, responsável e categoria                                                                                                                    | Dono ou gestor                |
| `PUT`   | `/occurrences/:id`           | Editar (solicitante enquanto `OPEN`; gestor responsável altera também prioridade e resolução)                                                                                                | Dono ou responsável           |
| `PATCH` | `/occurrences/:id/assignee`  | Definir o gestor responsável (obrigatório antes de mudar status)                                                                                                                             | MANAGER                       |
| `PATCH` | `/occurrences/:id/status`    | Mudar status respeitando as transições; `CANCELLED` exige motivo                                                                                                                             | Gestor responsável            |
| `PATCH` | `/occurrences/:id/cancel`    | Cancelar com `cancellationReason` obrigatório                                                                                                                                                | Dono (`OPEN`) ou responsável  |
| `GET`   | `/occurrences/:id/events`    | Linha do tempo da solicitação                                                                                                                                                                | Dono ou gestor                |
| `GET`   | `/occurrences/events/recent` | Últimos acontecimentos no escopo do usuário (`limit`, `assignedToMe`)                                                                                                                        | —                             |
| `GET`   | `/occurrences/events`        | Histórico de todas as ocorrências                                                                                                                                                            | MANAGER                       |
| `GET`   | `/occurrences/dashboard`     | Indicadores: volume por status/prioridade/categoria, tempo médio de resolução e notas das avaliações                                                                                         | MANAGER                       |

> Não existe exclusão de ocorrência: ela permanece como histórico e o encerramento indevido é feito por cancelamento com motivo.

### Comentários

| Método   | Rota                      | Descrição                                                    |
| -------- | ------------------------- | ------------------------------------------------------------ |
| `POST`   | `/comments`               | Comentar (interno só para gestores; bloqueado após encerrar) |
| `GET`    | `/comments?occurrenceId=` | Listar comentários (internos só aparecem para gestores)      |
| `GET`    | `/comments/:id`           | Buscar comentário                                            |
| `PUT`    | `/comments/:id`           | Editar comentário                                            |
| `DELETE` | `/comments/:id`           | Excluir comentário                                           |

### Anexos

| Método   | Rota                         | Descrição                                                                        |
| -------- | ---------------------------- | -------------------------------------------------------------------------------- |
| `POST`   | `/attachments/upload`        | Enviar imagem (JPEG/PNG/WebP até 5MB) — só o solicitante dono, antes de encerrar |
| `GET`    | `/attachments?occurrenceId=` | Listar imagens de uma ocorrência com URL pública (sem o filtro: só MANAGER)      |
| `GET`    | `/attachments/:id`           | Buscar anexo                                                                     |
| `POST`   | `/attachments`               | Registrar anexo por `filePath`                                                   |
| `PUT`    | `/attachments/:id`           | Atualizar anexo                                                                  |
| `DELETE` | `/attachments/:id`           | Excluir anexo (remove também do Storage)                                         |

### Avaliações

| Método   | Rota                     | Descrição                                                              |
| -------- | ------------------------ | ---------------------------------------------------------------------- |
| `POST`   | `/ratings`               | Avaliar de 1 a 5 (somente o solicitante, somente ocorrência resolvida) |
| `GET`    | `/ratings?occurrenceId=` | Listar (gestor vê todas; solicitante só as próprias)                   |
| `GET`    | `/ratings/:id`           | Buscar avaliação (autor ou gestor)                                     |
| `PUT`    | `/ratings/:id`           | Revisar a própria avaliação                                            |
| `DELETE` | `/ratings/:id`           | Excluir (autor ou gestor)                                              |

---

## Autenticação e autorização

A aplicação usa **JWT (JSON Web Token)** para autenticação e **RBAC (Role-Based Access Control)** combinado com regras de domínio para autorização.

### Fluxo

1. O usuário se cadastra via `POST /users` como solicitante (`REQUESTER`). Gestores são criados por outro gestor via `POST /users/managers`.
2. Realiza login via `POST /auth/login` e recebe um token JWT.
3. Envia o token no header `Authorization: Bearer <token>` nas rotas protegidas.

### Roles

| Role        | Permissões                                                                                                                                                                                                |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `REQUESTER` | Abre solicitações e vê apenas as próprias. Edita e cancela (com motivo) enquanto estiverem `OPEN`. Comenta e anexa imagens enquanto a solicitação estiver ativa. Avalia a resolução depois de `RESOLVED`. |
| `MANAGER`   | Vê todas as solicitações e o dashboard. Define o responsável; somente o gestor responsável muda status, prioridade, edita e cancela. Faz comentários internos. Gerencia usuários e categorias.            |

### Regras de negócio no domínio

As regras de autorização das ocorrências ficam na **camada de domínio**, em `OccurrencePolicy`, e os use cases apenas as consultam:

- **Responsável obrigatório:** nenhuma mudança de status acontece sem gestor responsável definido, e a partir da atribuição somente esse gestor conduz a solicitação (`canManage`, `canChangeStatus`).
- **Transições válidas:** `OPEN → IN_ANALYSIS → IN_PROGRESS → RESOLVED`, com `CANCELLED` possível antes do encerramento; concluir exige resolução e cancelar exige motivo.
- **Histórico após encerrar:** solicitação `RESOLVED` ou `CANCELLED` não aceita edição, comentário nem imagem — somente a avaliação do solicitante (`canComment`, `canAttach`, `canRate`).
- **Imagens do solicitante:** apenas o dono da solicitação anexa fotos (`canAttach`).
- **Escopo de leitura:** solicitante só acessa as próprias solicitações, eventos e avaliações (`canView`).

---

## Documentação da API (Swagger)

A especificação OpenAPI é gerada com **swagger-jsdoc** a partir das anotações nos arquivos de rota e exibida com a interface do **Scalar**, incluindo filtros, ordenação, códigos de erro e os campos de nome retornados.

Acesse localmente: **http://localhost:3001/api-docs**

---

## Persistência de dados

| Tecnologia     | Uso                                                                       |
| -------------- | ------------------------------------------------------------------------- |
| **PostgreSQL** | Banco de dados relacional                                                 |
| **Sequelize**  | ORM para mapeamento objeto-relacional                                     |
| **Migrations** | Versionamento do schema em `src/infrastructure/database/migrations/`      |
| **Seeders**    | Dados iniciais e base de testes em `src/infrastructure/database/seeders/` |

### Modelos

- **UserModel** — `id`, `name`, `email` (unique), `password` (hash bcrypt), `role` (REQUESTER/MANAGER)
- **CategoryModel** — `id`, `name`, `description`, `active`
- **OccurrenceModel** — `id`, `requesterId`, `assigneeId`, `categoryId`, `title`, `description`, `status`, `priority`, `locationText`, `locationReference`, `latitude`, `longitude`, `resolution`, `cancellationReason`, `resolvedAt`
- **OccurrenceEventModel** — `id`, `occurrenceId`, `type` (CREATED, STATUS_CHANGED, PRIORITY_CHANGED, ASSIGNEE_CHANGED), `previousValue`, `newValue`, `note`, `actorId`
- **CommentModel** — `id`, `occurrenceId`, `authorId`, `body`, `isInternal`
- **AttachmentModel** — `id`, `occurrenceId`, `filePath`, `mimeType`, `sizeBytes`
- **RatingModel** — `id`, `occurrenceId` (unique), `authorId`, `score` (1 a 5), `comment`

Todos os modelos possuem `createdAt` e `updatedAt`.

## Testes unitários

Os testes foram escritos com **Jest** seguindo a estratégia **AAA (Arrange, Act, Assert)**:

- **Arrange** — prepara os mocks e dados de entrada.
- **Act** — executa o caso de uso, DTO ou regra de domínio.
- **Assert** — verifica os valores e comportamentos esperados.

### Cobertura

| Métrica    | Cobertura  |
| ---------- | ---------- |
| Statements | **94.14%** |
| Branches   | **85.85%** |
| Functions  | **94.28%** |
| Lines      | **94.65%** |

### Suites de teste (42 suites, 163 testes)

```
tests/
├── domain/
│   ├── entities/                       # Entidades (Occurrence, Comment, Rating, User...)
│   ├── enums/                          # Status, prioridade e tipos de evento
│   └── services/
│       └── OccurrencePolicy.test.ts    # Responsável, histórico, quem comenta/anexa/avalia
└── application/
    ├── auth/                           # LoginDTO e Login
    ├── User/                           # DTOs e use cases de usuário
    ├── Category/                       # DTOs e criação de categoria
    ├── Occurrence/
    │   ├── dtos/                       # Criação, edição, status e filtros/ordenação
    │   └── use-cases/                  # Criar, mudar status, cancelar com motivo, eventos recentes
    ├── Comment/                        # DTOs e bloqueio de comentário após encerrar
    ├── Attachment/                     # DTOs, criação e upload restrito ao solicitante
    └── Rating/                         # DTOs, criação e listagem escopada
```

### Executar testes

```bash
npm run test              # Rodar todos os testes
npx jest --coverage       # Rodar com relatório de cobertura
```

---

## CI/CD com GitHub Actions

O pipeline de CI/CD está em `.github/workflows/main.yaml` e é executado automaticamente a cada push na branch `master`:

1. **Checkout** do código
2. **Setup** do Node.js 22 com cache npm
3. **Instalação** das dependências (`npm ci`)
4. **Execução dos testes** (`npm run test`)
5. **Build e push** da imagem Docker para o Docker Hub com tags:
   - `latest`
   - SHA do commit (`<sha>`)

> A imagem é publicada como `fabriciopereiraviana/hackathon-backend`.

---

## Docker

### Serviços do docker-compose

| Serviço     | Imagem                                   | Porta (host:container) |
| ----------- | ---------------------------------------- | ---------------------- |
| **app**     | `fabriciopereiraviana/hackathon-backend` | 3001:3000              |
| **db**      | `postgres:18`                            | 5432:5432              |
| **pgAdmin** | `dpage/pgadmin4`                         | 8080:80                |

O container `app` aguarda o healthcheck do banco antes de iniciar, cria o banco se necessário, executa as migrations e inicia o servidor. O arquivo `docker-compose.local.yaml` sobe os mesmos serviços construindo a imagem localmente.

---

## Tecnologias utilizadas

| Categoria         | Tecnologia                                     |
| ----------------- | ---------------------------------------------- |
| Runtime           | Node.js 22                                     |
| Linguagem         | TypeScript 5                                   |
| Framework HTTP    | Express 5                                      |
| ORM               | Sequelize 6                                    |
| Banco de dados    | PostgreSQL 18                                  |
| Autenticação      | JWT (jsonwebtoken) + bcrypt                    |
| Upload de imagens | Multer + Supabase Storage (ou disco local)     |
| Documentação      | Swagger (swagger-jsdoc) + Scalar API Reference |
| Testes            | Jest + ts-jest                                 |
| Containerização   | Docker + Docker Compose                        |
| CI/CD             | GitHub Actions                                 |

---

## Dificuldades encontradas

- **Regras de autorização das ocorrências:** a base em Clean Architecture já vinha de entregas anteriores, o que me permitiu focar no domínio. O desafio foi modelar regras que dependem do estado da ocorrência e não só da role — responsável obrigatório antes de mudar status, somente o responsável conduzindo, solicitação encerrada virando histórico — e concentrá-las em uma única `OccurrencePolicy` no domínio, em vez de espalhá-las pelos controllers.

- **Contratos de leitura para o frontend:** entregar nomes de solicitante, responsável e autor sem exigir que o cliente liste usuários (rota exclusiva de gestores) exigiu carregar os relacionamentos nos repositórios e explicitar o contrato de saída nos presenters.

---

## Participante

| RM       | Nome                   | GitHub                                      |
| -------- | ---------------------- | ------------------------------------------- |
| RM369372 | Fabricio Pereira Viana | [GitHub](https://github.com/fabriciopviana) |
