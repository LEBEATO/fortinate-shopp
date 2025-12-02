
import { User, Transaction } from '../types';

const USERS_KEY = 'fn_users_db';

// Helper to get DB
const getDb = (): User[] => {
  const stored = localStorage.getItem(USERS_KEY);
  return stored ? JSON.parse(stored) : [];
};

// Helper to save DB
const saveDb = (users: User[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

// Robust UUID generator that works in all environments
const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const MockPrisma = {
  user: {
    create: async (email: string, name: string, password?: string) => {
      const users = getDb();
      if (users.find(u => u.email === email)) {
        throw new Error("Usuário já existe.");
      }
      const newUser: User = {
        id: generateId(),
        email,
        name,
        password: password || '123456', // Demo logic
        balance: 10000, // Regra: Recebe 10.000 V-Bucks ao cadastrar
        inventory: [],
        history: []
      };
      users.push(newUser);
      saveDb(users);
      return { ...newUser };
    },

    findUnique: async (email: string) => {
      const users = getDb();
      const user = users.find(u => u.email === email);
      // IMPORTANT: Return a COPY of the object so React detects state changes
      return user ? { ...user } : null;
    },

    findMany: async () => {
      return getDb().map(u => ({
        ...u,
        password: undefined
      }));
    },

    update: async (id: string, data: Partial<User>) => {
      const users = getDb();
      const index = users.findIndex(u => u.id === id);
      if (index === -1) throw new Error("User not found");
      
      users[index] = { ...users[index], ...data };
      saveDb(users);
      return { ...users[index] };
    }
  },

  transactions: {
    buy: async (userId: string, cosmetic: { id: string, price: number, name: string, image: string, bundleIds?: string[] }) => {
      const users = getDb();
      const userIndex = users.findIndex(u => u.id === userId);
      if (userIndex === -1) throw new Error("User not found");

      const user = users[userIndex];

      // Verificação dupla, embora a UI deva controlar isso
      if (user.inventory.includes(cosmetic.id)) {
        throw new Error("Você já possui este item.");
      }

      const price = Number(cosmetic.price);
      if (user.balance < price) {
        throw new Error("Saldo insuficiente.");
      }

      // Regra: Ao comprar bundle, adiciona todos os itens do bundle
      const itemsToAdd = [cosmetic.id, ...(cosmetic.bundleIds || [])];
      
      // Filtra apenas o que o usuário ainda não tem (para não duplicar IDs no inventário e rastrear exatamente o que foi adicionado nesta transação)
      const newItems = itemsToAdd.filter(id => !user.inventory.includes(id));

      const newTransaction: Transaction = {
        id: generateId(),
        cosmeticId: cosmetic.id,
        cosmeticName: cosmetic.name,
        cosmeticImage: cosmetic.image,
        amount: -Math.abs(price), // Garante valor negativo para compra
        type: 'PURCHASE',
        date: new Date().toISOString(),
        relatedItems: newItems // Salva exatamente quais IDs foram concedidos NESTA compra específica
      };

      user.balance = Number(user.balance) - price;
      user.inventory.push(...newItems);
      user.history.push(newTransaction);

      users[userIndex] = user;
      saveDb(users);
      return { ...user };
    },

    refund: async (userId: string, cosmeticId: string, fallbackPrice: number = 0) => {
      const users = getDb();
      const userIndex = users.findIndex(u => u.id === userId);
      if (userIndex === -1) throw new Error("User not found");

      const user = users[userIndex];

      if (!user.inventory.includes(cosmeticId)) {
        throw new Error("Você não possui este item para devolver.");
      }

      // 1. Encontrar a transação de compra (PURCHASE) mais recente que inclua este item.
      const originalTx = [...user.history].reverse().find(tx => 
        tx.type === 'PURCHASE' && (
          tx.cosmeticId === cosmeticId || // Compra direta (ID principal)
          (tx.relatedItems && tx.relatedItems.includes(cosmeticId)) // Item faz parte de um pacote comprado
        )
      );
      
      // FALLBACK ROBUSTO:
      let refundAmount = 0;
      let itemsToRemove: string[] = [];
      let cosmeticName = "Item";
      let cosmeticImage = "";

      if (originalTx) {
        // Cenário Ideal: Encontrou o recibo
        refundAmount = Math.abs(Number(originalTx.amount));
        itemsToRemove = originalTx.relatedItems && originalTx.relatedItems.length > 0 
                              ? originalTx.relatedItems 
                              : [cosmeticId];
        cosmeticName = originalTx.cosmeticName;
        cosmeticImage = originalTx.cosmeticImage;
      } else {
        // Cenário de Recuperação: Dados antigos ou inconsistentes
        // Se não achou histórico, usamos o fallbackPrice (preço atual da API).
        // Se fallbackPrice for 0 ou indefinido, assumimos 0 (o usuário perde o item mas não ganha nada, melhor que travar).
        console.warn("Transação original não encontrada para reembolso. Usando modo de recuperação.");
        refundAmount = Math.abs(Number(fallbackPrice || 0));
        itemsToRemove = [cosmeticId];
        cosmeticName = "Reembolso (Item Recuperado)";
      }

      // 4. Criar transação de reembolso
      const newTransaction: Transaction = {
        id: generateId(),
        cosmeticId: cosmeticId,
        cosmeticName: cosmeticName,
        cosmeticImage: cosmeticImage,
        amount: refundAmount,
        type: 'REFUND',
        date: new Date().toISOString(),
        relatedItems: itemsToRemove
      };

      // 5. Atualizar Estado do Usuário
      // Garante que é uma adição numérica
      user.balance = Number(user.balance) + refundAmount;
      
      // Remove do inventário
      user.inventory = user.inventory.filter(id => !itemsToRemove.includes(id));
      
      user.history.push(newTransaction);

      users[userIndex] = user;
      saveDb(users);
      
      // Retorna uma CÓPIA do usuário atualizada para forçar re-render no React
      return { ...user };
    }
  }
};
