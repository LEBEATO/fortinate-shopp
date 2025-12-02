# Fortinat-shop 🛒


Uma aplicação web moderna que simula a loja de cosméticos do Fortnite. O projeto permite visualizar o catálogo, filtrar itens, simular compras com V-Bucks fictícios, gerenciar inventário e realizar reembolsos.

## 🚀 Tecnologias Utilizadas

*   **Frontend:** React 19, Tailwind CSS
*   **Framework:** Next.js 16 (Compatible)
*   **Banco de Dados:** PostgreSQL (via Neon Tech)
*   **ORM:** Prisma
*   **API Externa:** Fortnite-API.com

## ✨ Funcionalidades

### 🛍️ Catálogo e Loja
*   **Sincronização Automática:** Os dados são atualizados em tempo real com a API oficial do jogo.
*   **Filtros Avançados:** Busque por nome, tipo (traje, mochila, etc.), raridade e datas.
*   **Destaques:** Identificação visual de itens "Novos", "Em Promoção" ou "Na Loja Hoje".

### 👤 Usuário e Economia
*   **Sistema de V-Bucks:** Todo usuário começa com 10.000 V-Bucks.
*   **Compra de Pacotes (Bundles):** Ao comprar um pacote, todos os itens inclusos são adicionados ao inventário.
*   **Reembolso (Refund):** Botão de devolução acessível direto na página do item ou no histórico. Devolve o valor integral.

### 🔐 Autenticação e Perfil
*   Login e Cadastro (Simulado no Front / Pronto para Backend).
*   Histórico detalhado de transações.
*   Página pública de comunidade listando todos os usuários.

## 🛠️ Como rodar o projeto localmente

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/LEBEATO/fortinate-shopp.git
    cd fortinat-shop
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure o Banco de Dados (Neon):**
    Crie um arquivo `.env` na raiz:
    ```env
    DATABASE_URL="postgresql://user:pass@endpoint.neon.tech/neondb"
    ```

4.  **Rode a aplicação:**
    ```bash
    npm run dev
    ```

## 📂 Estrutura do Banco de Dados (Prisma)

O projeto utiliza o seguinte schema para persistência no Neon:

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  balance   Int      @default(10000)
  inventory String[] // IDs dos cosméticos
}
```

---
Desenvolvido como projeto de portfólio focado em usabilidade e integração de APIs.