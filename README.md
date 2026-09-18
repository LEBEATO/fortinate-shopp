# Fortnite Vault

Aplicação full stack para explorar, comprar e colecionar cosméticos do Fortnite com V-Bucks fictícios. O projeto consome a [Fortnite API](https://fortnite-api.com/), persiste os dados em PostgreSQL e implementa integralmente o desafio técnico proposto.

## Funcionalidades

- Catálogo público paginado com busca por nome.
- Filtros por tipo, raridade, período, novidades, loja e promoção.
- Detalhes completos de cada cosmético e conteúdo de bundles.
- Sincronização de `/cosmetics/br`, `/cosmetics/new` e `/shop`.
- Cadastro por e-mail e senha com 10.000 V-Bucks iniciais.
- Sessão segura em cookie `HttpOnly` e senha protegida com bcrypt.
- Compra transacional de itens individuais e pacotes.
- Proteção contra compra duplicada e saldo insuficiente.
- Inventário privado e histórico de compras/devoluções.
- Reembolso sem limite de tempo, com restauração integral do saldo.
- Comunidade pública paginada e perfis com inventário.
- Interface responsiva, animações e suporte a `prefers-reduced-motion`.

## Stack

- Next.js 16, React 19 e TypeScript
- Tailwind CSS
- PostgreSQL e Prisma ORM
- Zod e bcryptjs
- Vitest
- Docker e Docker Compose

## Executando localmente

Requisitos: Node.js 22+, npm e uma instância PostgreSQL.

```bash
git clone https://github.com/LEBEATO/fortinate-shopp.git
cd fortinate-shopp
npm install
```

Crie `.env` com base em `.env.example`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
SYNC_SECRET="um-token-longo-e-aleatorio"
```

Prepare o banco e inicie a aplicação:

```bash
npm run db:generate
npm run db:push
npm run dev
```

Acesse `http://localhost:3000`.

## Sincronizando a Fortnite API

Com a aplicação em execução, envie uma requisição autenticada:

```bash
curl -X POST http://localhost:3000/api/sync \
  -H "Authorization: Bearer SEU_SYNC_SECRET"
```

A sincronização atualiza cosméticos, novidades e ofertas atuais. Ofertas ausentes na sincronização seguinte são marcadas como inativas, preservando o histórico.

## Docker

O Compose inicia a aplicação e um PostgreSQL local:

```bash
docker compose up --build
```

Depois, sincronize os dados usando o comando da seção anterior e o token configurado em `docker-compose.yml`.

## Qualidade

```bash
npm test
npm run typecheck
npm run build
```

## Decisões técnicas

- **App Router e Server Components:** consultas sensíveis permanecem no servidor e menos JavaScript é enviado ao navegador.
- **Sessão opaca:** somente um token aleatório fica no cookie; seu hash SHA-256 é armazenado no banco.
- **Transações serializáveis:** compra, débito, inventário e reembolso são operações atômicas.
- **Histórico preservado:** ofertas podem ficar inativas sem apagar compras antigas.
- **Privacidade:** perfis públicos mostram nome e coleção, nunca e-mail ou dados de autenticação.
- **Sincronização protegida:** o endpoint exige `SYNC_SECRET` comparado em tempo constante.

## Estrutura principal

```text
src/app/                 Rotas, páginas, Server Actions e endpoint de sync
src/components/          Componentes de catálogo, autenticação e navegação
src/lib/auth/            Sessões, validação e segurança
src/lib/fortnite-api.ts  Cliente da API externa
src/lib/sync-fortnite.ts Normalização e persistência dos dados
prisma/schema.prisma     Modelo relacional completo
```

## Observação

Fortnite e suas marcas pertencem à Epic Games. Este projeto é educacional e utiliza somente créditos fictícios.
