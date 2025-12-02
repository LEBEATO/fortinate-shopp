
import React, { useState, useEffect, createContext, useContext, useMemo } from 'react';
import { HashRouter, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { FortniteAPI } from './src/services/fortniteApi';
import { MockPrisma } from './src/services/mockDb';
import { Cosmetic, User, AuthState, Transaction } from './types';

// --- Auth Context ---
const AuthContext = createContext<AuthState>({} as AuthState);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Persist login check
  useEffect(() => {
    const storedEmail = localStorage.getItem('fn_current_user');
    if (storedEmail) {
      MockPrisma.user.findUnique(storedEmail).then(u => setUser(u));
    }
  }, []);

  const login = async (email: string, password?: string) => {
    const u = await MockPrisma.user.findUnique(email);
    if (!u) throw new Error("Usuário não encontrado.");
    if (password && u.password && u.password !== password) throw new Error("Senha incorreta.");
    localStorage.setItem('fn_current_user', email);
    setUser(u);
  };

  const register = async (email: string, password: string, name: string) => {
    const u = await MockPrisma.user.create(email, name, password);
    localStorage.setItem('fn_current_user', email);
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem('fn_current_user');
    setUser(null);
  };

  const refreshUser = async () => {
    if (user) {
      const u = await MockPrisma.user.findUnique(user.email);
      setUser(u);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

// --- Shared Components ---

const Badge = ({ color, text }: { color: string, text: string }) => (
  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${color}`}>
    {text}
  </span>
);

const CosmeticCard: React.FC<{ item: Cosmetic }> = ({ item }) => {
  const { user } = useAuth();
  const isOwned = user?.inventory.includes(item.id);

  let rarityColor = 'border-gray-600 bg-gray-800';
  if (item.rarity?.value === 'legendary') rarityColor = 'border-orange-500 bg-orange-900/20';
  else if (item.rarity?.value === 'epic') rarityColor = 'border-purple-500 bg-purple-900/20';
  else if (item.rarity?.value === 'rare') rarityColor = 'border-blue-500 bg-blue-900/20';
  else if (item.rarity?.value === 'uncommon') rarityColor = 'border-green-500 bg-green-900/20';

  return (
    <Link to={`/cosmetic/${item.id}`} className={`group relative flex flex-col rounded-xl overflow-hidden border-2 ${rarityColor} transition-all hover:scale-105 hover:shadow-2xl hover:shadow-fortnite-purple/50`}>
      {/* Status Badges */}
      <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
        {item.isNew && <Badge color="bg-fortnite-yellow text-black" text="NOVO" />}
        {item.isOnSale && <Badge color="bg-red-500 text-white" text="LOJA" />}
        {item.isPromotional && <Badge color="bg-green-500 text-white" text="PROMO" />}
      </div>
      
      {isOwned && (
        <div className="absolute top-2 right-2 z-10 bg-fortnite-blue text-white p-1 rounded-full shadow-lg" title="Adquirido">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
        </div>
      )}

      <div className="aspect-square overflow-hidden bg-gray-900 relative">
        <img 
          src={item.images?.featured || item.images?.icon || item.images?.smallIcon} 
          alt={item.name} 
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
        />
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="text-white font-bold uppercase tracking-widest text-sm border border-white px-4 py-2">Ver Detalhes</span>
        </div>
      </div>
      
      <div className="p-3 flex flex-col flex-grow bg-slate-800/90 backdrop-blur-sm">
        <h3 className="text-white font-bold text-sm truncate">{item.name}</h3>
        <p className="text-gray-400 text-xs truncate">{item.rarity?.displayValue || 'Comum'} &bull; {item.type?.displayValue}</p>
        <div className="mt-auto pt-2 flex items-center justify-between">
          {item.price ? (
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded-full bg-fortnite-yellow"></div>
              <span className="text-white font-bold text-sm">{item.price}</span>
              {item.regularPrice && item.regularPrice > item.price && (
                <span className="text-gray-500 text-xs line-through ml-1">{item.regularPrice}</span>
              )}
            </div>
          ) : (
            <span className="text-gray-500 text-xs">Indisponível</span>
          )}
        </div>
      </div>
    </Link>
  );
};

const Pagination = ({ current, total, onPageChange }: { current: number, total: number, onPageChange: (p: number) => void }) => {
  if (total <= 1) return null;
  
  // Create array of page numbers around current
  const pages = [];
  for (let i = Math.max(1, current - 2); i <= Math.min(total, current + 2); i++) {
    pages.push(i);
  }

  return (
    <div className="flex justify-center gap-2 mt-8 pb-8">
      <button disabled={current === 1} onClick={() => onPageChange(current - 1)} className="px-3 py-1 rounded bg-slate-800 text-white disabled:opacity-50 hover:bg-slate-700">&lt;</button>
      {current > 3 && <span className="text-gray-500 self-end">...</span>}
      {pages.map(p => (
        <button key={p} onClick={() => onPageChange(p)} className={`px-3 py-1 rounded font-bold ${current === p ? 'bg-fortnite-blue text-white' : 'bg-slate-800 text-gray-300 hover:bg-slate-700'}`}>
          {p}
        </button>
      ))}
      {current < total - 2 && <span className="text-gray-500 self-end">...</span>}
      <button disabled={current === total} onClick={() => onPageChange(current + 1)} className="px-3 py-1 rounded bg-slate-800 text-white disabled:opacity-50 hover:bg-slate-700">&gt;</button>
    </div>
  );
};

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between py-3 md:py-0 md:h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-2xl font-black italic tracking-tighter text-white flex items-center gap-1">
              <span className="text-fortnite-yellow">Fortinat</span>-shop
            </Link>
            <div className="flex items-baseline space-x-2 overflow-x-auto md:overflow-visible pb-1 md:pb-0 scrollbar-hide">
              <Link to="/" className="text-gray-300 hover:text-white hover:bg-slate-800 px-3 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap">Catálogo</Link>
              {isAuthenticated && (
                 <Link to="/my-items" className="text-gray-300 hover:text-white hover:bg-slate-800 px-3 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap text-fortnite-yellow">Meus Itens</Link>
              )}
              <Link to="/users" className="text-gray-300 hover:text-white hover:bg-slate-800 px-3 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap">Comunidade</Link>
            </div>
          </div>
          <div className="flex items-center gap-4 ml-auto mt-2 md:mt-0">
            {isAuthenticated && user ? (
              <>
                <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700 shadow-inner">
                  <div className="w-4 h-4 rounded-full bg-fortnite-yellow shadow-[0_0_10px_rgba(255,230,0,0.6)] animate-pulse"></div>
                  <span className="text-fortnite-yellow font-bold text-sm font-mono">{user.balance.toLocaleString()}</span>
                </div>
                <Link to="/profile" className="text-sm font-bold text-white hover:text-fortnite-blue transition-colors flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-fortnite-purple flex items-center justify-center text-xs">
                    {user.name.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline">{user.name}</span>
                </Link>
                <button onClick={() => { logout(); navigate('/'); }} className="text-xs text-gray-400 hover:text-red-400 uppercase font-bold tracking-wide">Sair</button>
              </>
            ) : (
              <Link to="/login" className="bg-fortnite-blue hover:bg-blue-600 text-white px-5 py-2 rounded font-bold text-sm transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40">
                ENTRAR
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

// --- Pages ---

const CatalogPage = () => {
  const [allItems, setAllItems] = useState<Cosmetic[]>([]);
  const [filteredItems, setFilteredItems] = useState<Cosmetic[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false); 
  const ITEMS_PER_PAGE = 24;

  // Filters State
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [rarity, setRarity] = useState('');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [isNew, setIsNew] = useState(false);
  const [isSale, setIsSale] = useState(false);
  const [isPromo, setIsPromo] = useState(false);

  const loadData = async () => {
    try {
      const [all, newItems, shop] = await Promise.all([
        FortniteAPI.getAllCosmetics(),
        FortniteAPI.getNewCosmetics(),
        FortniteAPI.getShop()
      ]);

      // Merge metadata
      const newIds = new Set(newItems.map(i => i.id));
      const shopMap = new Map(shop.map(i => [i.id, i]));

      const enriched = all.map(item => {
        const shopItem = shopMap.get(item.id);
        return {
          ...item,
          isNew: newIds.has(item.id),
          isOnSale: !!shopItem,
          price: shopItem?.price || item.price,
          isPromotional: shopItem?.isPromotional || false,
          bundleIds: shopItem?.bundleIds || item.bundleIds
        };
      });

      // Sort: Shop items first, then New items
      enriched.sort((a, b) => {
        if (a.isOnSale && !b.isOnSale) return -1;
        if (!a.isOnSale && b.isOnSale) return 1;
        if (a.isNew && !b.isNew) return -1;
        if (!a.isNew && b.isNew) return 1;
        return 0;
      });

      setAllItems(enriched);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 120000); // Auto-refresh every 2 mins
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let result = allItems;

    if (search) result = result.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
    if (type) result = result.filter(i => i.type?.value === type);
    if (rarity) result = result.filter(i => i.rarity?.value === rarity);
    
    if (dateStart) {
      const start = new Date(dateStart).getTime();
      if (!isNaN(start)) {
        result = result.filter(i => new Date(i.added).getTime() >= start);
      }
    }
    if (dateEnd) {
      const end = new Date(dateEnd).getTime();
      if (!isNaN(end)) {
         result = result.filter(i => new Date(i.added).getTime() <= end);
      }
    }

    if (isNew) result = result.filter(i => i.isNew);
    if (isSale) result = result.filter(i => i.isOnSale);
    if (isPromo) result = result.filter(i => i.isPromotional);

    setFilteredItems(result);
    setPage(1);
  }, [search, type, rarity, dateStart, dateEnd, isNew, isSale, isPromo, allItems]);

  // Memoize Unique options for Selects to ensure labels are correct
  const uniqueTypes = useMemo(() => {
    const map = new Map<string, string>();
    allItems.forEach(i => {
      if(i.type?.value) map.set(i.type.value, i.type.displayValue || i.type.value);
    });
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [allItems]);

  const uniqueRarities = useMemo(() => {
    const map = new Map<string, string>();
    allItems.forEach(i => {
       if(i.rarity?.value) map.set(i.rarity.value, i.rarity.displayValue || i.rarity.value);
    });
    return Array.from(map.entries());
  }, [allItems]);

  const clearFilters = () => {
    setSearch('');
    setType('');
    setRarity('');
    setDateStart('');
    setDateEnd('');
    setIsNew(false);
    setIsSale(false);
    setIsPromo(false);
  };

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const currentData = filteredItems.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-black text-white italic">CATÁLOGO DE ITENS</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400 font-bold">Encontrados: {filteredItems.length}</span>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded font-bold text-sm flex items-center gap-2 transition-colors ${showFilters ? 'bg-fortnite-yellow text-black' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
            </svg>
            {showFilters ? 'Fechar Filtros' : 'Filtrar Itens'}
          </button>
        </div>
      </div>

      {/* Collapsible Filter Panel */}
      {showFilters && (
        <div className="mb-8 bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl animate-in fade-in slide-in-from-top-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Buscar</label>
              <input type="text" placeholder="Nome do cosmético..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-slate-900 border border-slate-600 text-white p-2 rounded focus:border-fortnite-blue outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Tipo</label>
              <select value={type} onChange={e => setType(e.target.value)} className="w-full bg-slate-900 border border-slate-600 text-white p-2 rounded focus:border-fortnite-blue outline-none">
                <option value="">Todos</option>
                {uniqueTypes.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Raridade</label>
              <select value={rarity} onChange={e => setRarity(e.target.value)} className="w-full bg-slate-900 border border-slate-600 text-white p-2 rounded focus:border-fortnite-blue outline-none">
                <option value="">Todas</option>
                {uniqueRarities.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Período</label>
              <div className="flex gap-2">
                <input type="date" value={dateStart} onChange={e => setDateStart(e.target.value)} className="w-full bg-slate-900 border border-slate-600 text-white p-2 rounded text-xs" />
                <input type="date" value={dateEnd} onChange={e => setDateEnd(e.target.value)} className="w-full bg-slate-900 border border-slate-600 text-white p-2 rounded text-xs" />
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-4 justify-between items-center border-t border-slate-700 pt-4">
             <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer hover:text-fortnite-yellow transition-colors">
                  <input type="checkbox" checked={isNew} onChange={e => setIsNew(e.target.checked)} className="accent-fortnite-yellow w-4 h-4" />
                  <span className="text-sm font-bold text-gray-300">Apenas Novos</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer hover:text-red-400 transition-colors">
                  <input type="checkbox" checked={isSale} onChange={e => setIsSale(e.target.checked)} className="accent-red-500 w-4 h-4" />
                  <span className="text-sm font-bold text-gray-300">Loja Atual</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer hover:text-green-400 transition-colors">
                  <input type="checkbox" checked={isPromo} onChange={e => setIsPromo(e.target.checked)} className="accent-green-500 w-4 h-4" />
                  <span className="text-sm font-bold text-gray-300">Em Promoção</span>
                </label>
             </div>
             <button onClick={clearFilters} className="text-xs text-gray-400 underline hover:text-white">
                Limpar Filtros
             </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-fortnite-yellow"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {currentData.map(item => <CosmeticCard key={item.id} item={item} />)}
          </div>
          <Pagination current={page} total={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
};

const MyItemsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState<Cosmetic[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchItems = async () => {
      if (user && user.inventory.length > 0) {
        try {
          const all = await FortniteAPI.getAllCosmetics();
          const owned = all.filter(i => user.inventory.includes(i.id));
          setItems(owned);
        } catch (e) {
          console.error("Erro ao carregar meus itens", e);
        }
      } else {
        setItems([]);
      }
      setLoading(false);
    };

    fetchItems();
  }, [user, isAuthenticated, navigate]);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-fortnite-yellow"></div></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-fortnite-yellow rounded-full flex items-center justify-center text-black font-black text-xl">
          {items.length}
        </div>
        <h1 className="text-3xl font-black text-white italic">MEUS ITENS</h1>
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {items.map(item => <CosmeticCard key={item.id} item={item} />)}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-800 rounded-xl border border-slate-700">
          <p className="text-gray-400 text-lg mb-4">Você ainda não comprou nenhum cosmético.</p>
          <Link to="/" className="inline-block bg-fortnite-blue text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-600 transition-colors">
            Ir para o Catálogo
          </Link>
        </div>
      )}
    </div>
  );
};

const CosmeticDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [item, setItem] = useState<Cosmetic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const all = await FortniteAPI.getAllCosmetics();
        const shop = await FortniteAPI.getShop(); // Check for live pricing
        
        const found = all.find(i => i.id === id);
        if (found) {
          const shopItem = shop.find(s => s.id === id);
          setItem({
            ...found,
            price: shopItem?.price || found.price || 1200,
            bundleIds: shopItem?.bundleIds || found.bundleIds,
            isOnSale: !!shopItem
          });
        }
      } catch (e) {
        console.error("Erro ao carregar detalhes", e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleBuy = async () => {
    if (!user) return navigate('/login');
    if (!item) return;
    try {
      await MockPrisma.transactions.buy(user.id, {
        id: item.id,
        name: item.name,
        price: item.price || 0,
        image: item.images.icon,
        bundleIds: item.bundleIds
      });
      await refreshUser();
      alert(`Sucesso! Você comprou ${item.name}.`);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleRefund = async () => {
    if (!user || !item) return;
    if (!confirm("Tem certeza que deseja devolver este item? Você receberá o valor de volta.")) return;
    try {
      await MockPrisma.transactions.refund(user.id, item.id);
      await refreshUser();
      alert("Item devolvido com sucesso!");
    } catch (error: any) {
      alert(error.message);
    }
  };

  if (loading) return <div className="text-center py-20 text-white">Carregando...</div>;
  if (!item) return <div className="text-center py-20 text-white">Item não encontrado.</div>;

  const isOwned = user?.inventory.includes(item.id);
  const canAfford = (user?.balance || 0) >= (item.price || 0);

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <button onClick={() => navigate(-1)} className="mb-6 text-gray-400 hover:text-white flex items-center gap-2">
        &larr; Voltar
      </button>
      
      <div className="bg-slate-800 rounded-2xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col md:flex-row">
        <div className="md:w-1/2 bg-slate-900 relative">
          <img src={item.images.featured || item.images.icon} alt={item.name} className="w-full h-full object-contain p-8" />
          {isOwned && (
             <div className="absolute top-4 right-4 bg-fortnite-blue text-white px-4 py-2 rounded-full font-bold shadow-lg">
               ADQUIRIDO
             </div>
          )}
        </div>
        
        <div className="md:w-1/2 p-8 flex flex-col">
          <div className="mb-auto">
            <div className="flex gap-2 mb-2">
              <Badge color="bg-gray-700 text-gray-300" text={item.type?.displayValue} />
              <Badge color="bg-gray-700 text-gray-300" text={item.rarity?.displayValue} />
            </div>
            <h1 className="text-4xl font-black text-white mb-4 italic">{item.name}</h1>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">{item.description}</p>
            
            {item.bundleIds && item.bundleIds.length > 0 && (
              <div className="bg-slate-900/50 p-4 rounded-lg mb-6">
                <p className="text-sm text-gray-400 uppercase font-bold mb-2">Inclui neste pacote:</p>
                <p className="text-white text-sm">{item.bundleIds.length} itens adicionais</p>
              </div>
            )}
            
            <div className="flex items-center gap-2 mb-6">
               <span className="text-gray-400 text-sm">Adicionado em:</span>
               <span className="text-white font-mono">{new Date(item.added).toLocaleDateString('pt-BR')}</span>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-6 mt-6">
            {!isOwned ? (
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-gray-400 text-xs uppercase font-bold">Preço</span>
                  <div className="flex items-center gap-2">
                     <div className="w-6 h-6 rounded-full bg-fortnite-yellow"></div>
                     <span className="text-3xl font-black text-white">{item.price}</span>
                  </div>
                </div>
                <button 
                  onClick={handleBuy}
                  disabled={!canAfford}
                  className={`px-8 py-4 rounded-lg font-black uppercase tracking-wide text-lg transition-all shadow-lg ${canAfford ? 'bg-fortnite-yellow hover:bg-yellow-400 text-black hover:scale-105' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}
                >
                  {canAfford ? 'Comprar Agora' : 'Saldo Insuficiente'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-500/10 border border-green-500/50 p-4 rounded-lg text-center">
                  <p className="text-green-400 font-bold">Você possui este item.</p>
                </div>
                <button 
                  onClick={handleRefund}
                  className="w-full px-6 py-3 rounded-lg font-bold uppercase tracking-wide text-white border border-red-500/50 hover:bg-red-500/20 text-red-400 transition-colors"
                >
                  Devolver Item (Reembolso)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const UserProfile = () => {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'inventory' | 'history'>('inventory');
  const [inventoryItems, setInventoryItems] = useState<Cosmetic[]>([]);

  useEffect(() => {
    const fetchInv = async () => {
      if (user?.inventory.length) {
        const all = await FortniteAPI.getAllCosmetics();
        const owned = all.filter(i => user.inventory.includes(i.id));
        setInventoryItems(owned);
      } else {
        setInventoryItems([]);
      }
    };
    fetchInv();
  }, [user]);

  const handleRefund = async (id: string) => {
    if (!confirm("Confirmar devolução?")) return;
    try {
      await MockPrisma.transactions.refund(user!.id, id);
      await refreshUser();
      alert("Reembolso realizado.");
    } catch (e: any) {
      alert(e.message);
    }
  };

  if (!user) return <div className="p-8 text-center text-white">Faça login para ver seu perfil.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-slate-800 rounded-xl p-6 mb-8 border border-slate-700 flex flex-col sm:flex-row items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-fortnite-purple flex items-center justify-center text-4xl font-bold text-white shadow-lg">
          {user.name.substring(0, 2).toUpperCase()}
        </div>
        <div className="text-center sm:text-left">
          <h1 className="text-3xl font-bold text-white mb-2">{user.name}</h1>
          <p className="text-gray-400">{user.email}</p>
          <div className="mt-4 inline-flex items-center gap-3 bg-slate-900 px-4 py-2 rounded-lg border border-slate-700">
            <span className="text-gray-400 text-sm uppercase font-bold">Saldo V-Bucks:</span>
            <div className="w-5 h-5 rounded-full bg-fortnite-yellow"></div>
            <span className="text-xl font-black text-white">{user.balance.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-4 border-b border-slate-700 mb-6">
        <button onClick={() => setActiveTab('inventory')} className={`pb-3 px-4 font-bold text-sm uppercase tracking-wide transition-colors ${activeTab === 'inventory' ? 'text-fortnite-blue border-b-2 border-fortnite-blue' : 'text-gray-400 hover:text-white'}`}>
          Meus Cosméticos
        </button>
        <button onClick={() => setActiveTab('history')} className={`pb-3 px-4 font-bold text-sm uppercase tracking-wide transition-colors ${activeTab === 'history' ? 'text-fortnite-blue border-b-2 border-fortnite-blue' : 'text-gray-400 hover:text-white'}`}>
          Histórico e Devoluções
        </button>
      </div>

      {activeTab === 'inventory' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {inventoryItems.length > 0 ? (
            inventoryItems.map(item => <CosmeticCard key={item.id} item={item} />)
          ) : (
            <p className="col-span-full text-center text-gray-500 py-10">Nenhum item adquirido.</p>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="overflow-x-auto rounded-lg border border-slate-700">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-slate-900 text-gray-400 uppercase font-bold text-xs">
              <tr>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Item</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Valor</th>
                <th className="px-6 py-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700 bg-slate-800">
              {[...user.history].reverse().map(tx => {
                const canRefund = tx.type === 'PURCHASE' && user.inventory.includes(tx.cosmeticId);
                return (
                  <tr key={tx.id} className="hover:bg-slate-750">
                    <td className="px-6 py-4">{new Date(tx.date).toLocaleDateString()} {new Date(tx.date).toLocaleTimeString()}</td>
                    <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                      {tx.cosmeticImage && <img src={tx.cosmeticImage} className="w-8 h-8 rounded bg-gray-900" />}
                      {tx.cosmeticName}
                    </td>
                    <td className="px-6 py-4">
                      <Badge color={tx.type === 'PURCHASE' ? 'bg-blue-500/20 text-blue-300' : 'bg-orange-500/20 text-orange-300'} text={tx.type === 'PURCHASE' ? 'Compra' : 'Reembolso'} />
                    </td>
                    <td className={`px-6 py-4 font-bold ${tx.type === 'PURCHASE' ? 'text-red-400' : 'text-green-400'}`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {canRefund && (
                        <button onClick={() => handleRefund(tx.cosmeticId)} className="text-xs bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-3 py-1 rounded border border-red-500/50 transition-all">
                          Devolver
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {user.history.length === 0 && <p className="p-8 text-center text-gray-500">Nenhuma transação encontrada.</p>}
        </div>
      )}
    </div>
  );
};

const UsersDirectory = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userItems, setUserItems] = useState<Cosmetic[]>([]);
  const USERS_PER_PAGE = 12;

  useEffect(() => {
    MockPrisma.user.findMany().then(setUsers);
  }, []);

  const handleUserClick = async (u: User) => {
    setSelectedUser(u);
    const all = await FortniteAPI.getAllCosmetics();
    setUserItems(all.filter(i => u.inventory.includes(i.id)));
  };

  const totalPages = Math.ceil(users.length / USERS_PER_PAGE);
  const currentUsers = users.slice((page - 1) * USERS_PER_PAGE, page * USERS_PER_PAGE);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-black text-white italic mb-8">COMUNIDADE</h1>
      
      {selectedUser ? (
        <div className="animate-in fade-in zoom-in duration-300">
          <button onClick={() => setSelectedUser(null)} className="mb-4 text-fortnite-blue hover:underline font-bold">&larr; Voltar para lista</button>
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6">
            <h2 className="text-2xl font-bold text-white">Inventário de {selectedUser.name}</h2>
            <p className="text-gray-400 mb-4">Itens adquiridos: {userItems.length}</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {userItems.map(item => (
                <Link to={`/cosmetic/${item.id}`} key={item.id} className="block aspect-square bg-slate-900 rounded-lg overflow-hidden border border-slate-700 hover:border-fortnite-purple transition-colors" title={item.name}>
                  <img src={item.images.smallIcon} className="w-full h-full object-cover" loading="lazy" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {currentUsers.map(u => (
              <div key={u.id} onClick={() => handleUserClick(u)} className="bg-slate-800 p-4 rounded-lg border border-slate-700 hover:border-fortnite-blue cursor-pointer transition-all hover:-translate-y-1">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded bg-fortnite-purple flex items-center justify-center text-white font-bold">
                    {u.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-white font-bold truncate">{u.name}</h3>
                    <p className="text-gray-400 text-xs">{u.inventory.length} itens</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Pagination current={page} total={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
};

const AuthPage = ({ type }: { type: 'login' | 'register' }) => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (type === 'login') await login(email, pass);
      else await register(email, pass, name);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-md bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-2xl">
        <h2 className="text-3xl font-black text-white italic text-center mb-8">
          {type === 'login' ? 'LOGIN' : 'CRIAR CONTA'}
        </h2>
        {error && <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded mb-4 text-sm text-center">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {type === 'register' && (
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nome</label>
              <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-900 border border-slate-600 text-white p-3 rounded focus:border-fortnite-blue outline-none transition-colors" />
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">E-mail</label>
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-900 border border-slate-600 text-white p-3 rounded focus:border-fortnite-blue outline-none transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Senha</label>
            <input required type="password" value={pass} onChange={e => setPass(e.target.value)} className="w-full bg-slate-900 border border-slate-600 text-white p-3 rounded focus:border-fortnite-blue outline-none transition-colors" />
          </div>
          <button type="submit" className="w-full bg-fortnite-yellow hover:bg-yellow-400 text-black font-black uppercase py-3 rounded shadow-lg hover:shadow-yellow-500/50 transition-all transform hover:-translate-y-0.5">
            {type === 'login' ? 'Entrar' : 'Cadastrar e Ganhar 10.000 V-Bucks'}
          </button>
        </form>
        <div className="mt-6 text-center">
          {type === 'login' ? (
            <Link to="/register" className="text-fortnite-blue hover:text-white text-sm font-bold">Não tem conta? Cadastre-se</Link>
          ) : (
            <Link to="/login" className="text-fortnite-blue hover:text-white text-sm font-bold">Já tem conta? Faça login</Link>
          )}
        </div>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <HashRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col font-sans">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<CatalogPage />} />
              <Route path="/my-items" element={<MyItemsPage />} />
              <Route path="/cosmetic/:id" element={<CosmeticDetail />} />
              <Route path="/users" element={<UsersDirectory />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/login" element={<AuthPage type="login" />} />
              <Route path="/register" element={<AuthPage type="register" />} />
            </Routes>
          </main>
          <footer className="bg-slate-900 border-t border-slate-800 py-8 text-center text-gray-500 text-sm">
            <p>&copy; 2023 Fortinat-shop. Dados fornecidos por Fortnite-API.</p>
            <p className="mt-2 text-xs opacity-50">Este projeto não é afiliado à Epic Games.</p>
          </footer>
        </div>
      </AuthProvider>
    </HashRouter>
  );
};

export default App;
