
// Cosmetic Types from External API
export interface CosmeticImage {
  smallIcon: string;
  icon: string;
  featured: string;
  background: string;
}

export interface CosmeticType {
  value: string;
  displayValue: string;
  backendValue: string;
}

export interface CosmeticRarity {
  value: string;
  displayValue: string;
  backendValue: string;
}

export interface Cosmetic {
  id: string;
  name: string;
  description: string;
  type: CosmeticType;
  rarity: CosmeticRarity;
  images: CosmeticImage;
  added: string; // ISO Date
  price?: number; // Injected price for simulation if API lacks it
  regularPrice?: number; // For promotion calculation
  isNew?: boolean;
  isOnSale?: boolean;
  isPromotional?: boolean;
  bundleIds?: string[]; // IDs of items included if this is a bundle
}

// User & Database Types
export interface Transaction {
  id: string;
  cosmeticId: string;
  cosmeticName: string;
  cosmeticImage: string;
  amount: number;
  type: 'PURCHASE' | 'REFUND';
  date: string;
  relatedItems?: string[]; // IDs of other items added/removed in this transaction (e.g. bundle contents)
}

export interface User {
  id: string;
  email: string;
  name: string;
  password?: string; // Simple storage for demo
  balance: number;
  inventory: string[]; // Array of Cosmetic IDs
  history: Transaction[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => void;
}