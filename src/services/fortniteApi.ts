import { Cosmetic } from '../../types';

const BASE_URL = 'https://fortnite-api.com/v2';
const CACHE_TTL = 5 * 60 * 1000;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

let cachedShop: CacheEntry<Cosmetic[]> | null = null;
let cachedNew: CacheEntry<Cosmetic[]> | null = null;
let cachedAll: CacheEntry<Cosmetic[]> | null = null;

const isFresh = <T,>(cache: CacheEntry<T> | null) =>
  Boolean(cache && Date.now() - cache.timestamp < CACHE_TTL);

const request = async <T,>(path: string): Promise<T> => {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Fortnite-API respondeu com status ${response.status}`);
  }

  return response.json() as Promise<T>;
};

const normalizeCosmetic = (item: any): Cosmetic | null => {
  if (!item?.id) return null;

  return {
    id: item.id,
    name: item.name || 'Item sem nome',
    description: item.description || 'Sem descrição disponível.',
    type: item.type || { value: 'unknown', displayValue: 'Cosmético', backendValue: '' },
    rarity: item.rarity || { value: 'common', displayValue: 'Comum', backendValue: '' },
    images: item.images || { icon: '', smallIcon: '', featured: '', background: '' },
    added: item.added || new Date(0).toISOString(),
  };
};

const normalizeShopEntry = (entry: any): Cosmetic | null => {
  const core = entry?.brItems?.[0] || entry?.tracks?.[0] || entry?.cars?.[0];
  const normalized = normalizeCosmetic(core);
  if (!normalized) return null;

  const bundleIds = Array.isArray(entry.brItems)
    ? entry.brItems.map((item: any) => item?.id).filter(Boolean)
    : [];

  return {
    ...normalized,
    name: entry.bundle?.name || normalized.name,
    images: {
      ...normalized.images,
      featured:
        entry.newDisplayAsset?.renderImages?.[0]?.image ||
        entry.bundle?.image ||
        normalized.images.featured,
    },
    price: Number(entry.finalPrice),
    regularPrice: Number(entry.regularPrice),
    isOnSale: true,
    isPromotional: Number(entry.finalPrice) < Number(entry.regularPrice),
    bundleIds: bundleIds.length > 1 ? bundleIds : undefined,
    shopSection: entry.layout?.name || 'Loja de hoje',
    availableUntil: entry.outDate,
  };
};

export const FortniteAPI = {
  getShop: async (): Promise<Cosmetic[]> => {
    if (isFresh(cachedShop)) return cachedShop!.data;
    const response = await request<{ data?: { entries?: any[] } }>('/shop?lang=pt-BR');
    const entries = Array.isArray(response.data?.entries) ? response.data.entries : [];
    const processed = entries.map(normalizeShopEntry).filter(Boolean) as Cosmetic[];
    cachedShop = { data: processed, timestamp: Date.now() };
    return processed;
  },

  getNewCosmetics: async (): Promise<Cosmetic[]> => {
    if (isFresh(cachedNew)) return cachedNew!.data;
    const response = await request<{ data?: { items?: any[] } }>('/cosmetics/new?lang=pt-BR');
    const items = Array.isArray(response.data?.items) ? response.data.items : [];
    const processed = items
      .map(normalizeCosmetic)
      .filter(Boolean)
      .map(item => ({ ...item!, isNew: true }));
    cachedNew = { data: processed, timestamp: Date.now() };
    return processed;
  },

  getAllCosmetics: async (): Promise<Cosmetic[]> => {
    if (isFresh(cachedAll)) return cachedAll!.data;
    const response = await request<{ data?: any[] }>('/cosmetics/br?lang=pt-BR');
    const items = Array.isArray(response.data) ? response.data : [];
    const processed = items.map(normalizeCosmetic).filter(Boolean) as Cosmetic[];
    cachedAll = { data: processed, timestamp: Date.now() };
    return processed;
  },
};
