
import { Cosmetic } from '../types';

const BASE_URL = 'https://fortnite-api.com/v2';
const CACHE_TTL = 60 * 1000 * 2; // 2 minutos de cache para sincronização

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

let cachedShop: CacheEntry<Cosmetic[]> | null = null;
let cachedNew: CacheEntry<Cosmetic[]> | null = null;
let cachedAll: CacheEntry<Cosmetic[]> | null = null;

const isFresh = (cache: CacheEntry<any> | null) => {
  if (!cache) return false;
  return (Date.now() - cache.timestamp) < CACHE_TTL;
};

const normalizeCosmetic = (item: any): Cosmetic => {
  // Proteção contra itens nulos
  if (!item) return {} as Cosmetic;

  const isShopEntry = item.items && Array.isArray(item.items);
  const core = isShopEntry ? item.items[0] : item;
  
  // Se o item core for inválido, retorna um objeto vazio seguro ou ignora
  if (!core) return {} as Cosmetic;

  const bundleIds = isShopEntry && item.items.length > 1 
    ? item.items.map((i: any) => i.id) 
    : [];

  const finalPrice = item.finalPrice || 1200;
  const regularPrice = item.regularPrice || finalPrice;
  const isPromotional = finalPrice < regularPrice;

  return {
    id: core.id,
    name: item.bundleName || core.name || 'Item Desconhecido',
    description: core.description || 'Sem descrição disponível.',
    type: core.type || { value: 'unknown', displayValue: 'Desconhecido' },
    rarity: core.rarity || { value: 'common', displayValue: 'Comum' },
    images: core.images || { icon: '', smallIcon: '', featured: '' },
    added: core.added || new Date().toISOString(),
    price: finalPrice,
    regularPrice: regularPrice,
    isOnSale: !!item.finalPrice,
    isNew: false, 
    isPromotional: isPromotional,
    bundleIds: bundleIds.length > 0 ? bundleIds : undefined
  };
};

export const FortniteAPI = {
  getShop: async (): Promise<Cosmetic[]> => {
    if (isFresh(cachedShop)) return cachedShop!.data;
    try {
      const response = await fetch(`${BASE_URL}/shop/br`);
      const data = await response.json();
      
      // Verifica se data.data existe
      if (!data || !data.data) return [];

      // A API da loja muda frequentemente de estrutura. Tenta acessar featured e daily.
      // Uso de Optional Chaining e Default Arrays para segurança
      const featured = data.data.featured?.entries;
      const daily = data.data.daily?.entries;
      const vbuckStore = data.data.vbuckStore?.entries;

      // Junta tudo que for array válido
      let allEntries: any[] = [];
      if (Array.isArray(featured)) allEntries = [...allEntries, ...featured];
      if (Array.isArray(daily)) allEntries = [...allEntries, ...daily];
      
      // Se não encontrou nas seções padrão, tenta verificar se data.data.entries existe (algumas versões da API)
      if (allEntries.length === 0 && Array.isArray(data.data.entries)) {
        allEntries = data.data.entries;
      }

      const processed = allEntries
        .map(normalizeCosmetic)
        .filter(item => item.id); // Remove itens vazios/inválidos

      cachedShop = { data: processed, timestamp: Date.now() };
      return processed;
    } catch (error) {
      console.error("Failed to fetch shop", error);
      return [];
    }
  },

  getNewCosmetics: async (): Promise<Cosmetic[]> => {
    if (isFresh(cachedNew)) return cachedNew!.data;
    try {
      const response = await fetch(`${BASE_URL}/cosmetics/new`);
      const data = await response.json();
      
      if (!data || !data.data) return [];
      
      // Correção crítica: Verifica se data.data.items é um array antes de fazer map
      const rawItems = data.data.items;
      const items = Array.isArray(rawItems) ? rawItems : [];

      const processed = items.map((item: any) => ({
        ...normalizeCosmetic(item),
        isNew: true
      })).filter((item: Cosmetic) => item.id);
      
      cachedNew = { data: processed, timestamp: Date.now() };
      return processed;
    } catch (error) {
      console.error("Failed to fetch new items", error);
      return [];
    }
  },

  getAllCosmetics: async (): Promise<Cosmetic[]> => {
    if (isFresh(cachedAll)) return cachedAll!.data;
    try {
      const response = await fetch(`${BASE_URL}/cosmetics/br`);
      const data = await response.json();

      // Correção crítica: Verifica se data.data é um array
      if (!data || !data.data || !Array.isArray(data.data)) return [];

      const processed = data.data
        .map(normalizeCosmetic)
        .filter((item: Cosmetic) => item.id);

      cachedAll = { data: processed, timestamp: Date.now() };
      return processed;
    } catch (error) {
      console.error("Failed to fetch all cosmetics", error);
      return [];
    }
  }
};