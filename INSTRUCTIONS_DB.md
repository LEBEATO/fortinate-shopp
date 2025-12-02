
# Como conectar ao Banco de Dados (Neon + Prisma)

Como este projeto está rodando em um ambiente de navegador, ele usa um "Mock Database" temporário. Para usar o banco de dados real (Neon), siga os passos abaixo no seu computador:

## 1. Configuração do Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Pegue esta URL no painel do Neon (neon.tech)
DATABASE_URL="postgresql://user:password@ep-something. region.aws.neon.tech/neondb?sslmode=require"
```

## 2. Instalação das Dependências

No terminal do seu computador:

```bash
npm install prisma @prisma/client
npm install ts-node --save-dev
```

## 3. Sincronizar o Banco (Migration)

Para criar as tabelas no Neon baseadas no arquivo `prisma/schema.prisma`:

```bash
npx prisma db push
```

## 4. Integrar com a Aplicação

No arquivo `services/mockDb.ts`, você substituiria as chamadas de `localStorage` por chamadas à API do Next.js que usam o arquivo `lib/prisma.ts` criado.

Exemplo de como seria uma API Route no Next.js 16 (`app/api/auth/register/route.ts`):

```typescript
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const user = await prisma.user.create({
    data: {
      email: body.email,
      name: body.name,
      password: body.password, // Lembre-se de usar hash na senha na vida real!
      inventory: [],
    }
  });
  return NextResponse.json(user);
}
```
