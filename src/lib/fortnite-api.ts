import "server-only";

const API_URL = "https://fortnite-api.com/v2";

type ApiLabel = { value?: string; displayValue?: string };
type ApiImages = {
  icon?: string;
  smallIcon?: string;
  featured?: string;
  large?: string;
  small?: string;
  background?: string;
  other?: Record<string, string>;
};

export type ApiCosmetic = {
  id: string;
  name?: string;
  description?: string;
  type?: ApiLabel;
  rarity?: ApiLabel;
  images?: ApiImages;
  added?: string;
};

export type ApiShopEntry = {
  offerId?: string;
  devName?: string;
  regularPrice?: number;
  finalPrice?: number;
  inDate?: string;
  outDate?: string;
  brItems?: ApiCosmetic[];
  bundle?: { name?: string; image?: string };
  layout?: { name?: string };
  newDisplayAsset?: { renderImages?: Array<{ image?: string }> };
};

type ApiEnvelope<T> = { status: number; data: T };

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`Fortnite API respondeu com status ${response.status} em ${path}.`);
  const payload = (await response.json()) as ApiEnvelope<T>;
  return payload.data;
}

function flattenNewItems(data: unknown): ApiCosmetic[] {
  if (!data || typeof data !== "object") return [];
  const items = (data as { items?: unknown }).items;
  if (Array.isArray(items)) return items as ApiCosmetic[];
  if (!items || typeof items !== "object") return [];
  return Object.values(items).flatMap((group) => (Array.isArray(group) ? (group as ApiCosmetic[]) : []));
}

export async function fetchFortniteSnapshot() {
  const [cosmetics, newData, shopData] = await Promise.all([
    request<ApiCosmetic[]>("/cosmetics/br?lang=pt-BR"),
    request<unknown>("/cosmetics/new?lang=pt-BR"),
    request<{ entries?: ApiShopEntry[] }>("/shop?lang=pt-BR"),
  ]);

  return {
    cosmetics: Array.isArray(cosmetics) ? cosmetics : [],
    newCosmetics: flattenNewItems(newData),
    shopEntries: Array.isArray(shopData?.entries) ? shopData.entries : [],
  };
}
