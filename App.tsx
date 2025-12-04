
import React, { useState, useEffect, createContext, useContext, useMemo } from 'react';
import { HashRouter, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { FortniteAPI } from './src/services/fortniteApi';
import { MockPrisma } from './src/services/mockDb';
import { FaBars, FaTimes } from 'react-icons/fa';
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
      <div className="absolute z-10 flex flex-col gap-1 top-2 left-2">
        {item.isNew && <Badge color="bg-fortnite-yellow text-black" text="NOVO" />}
        {item.isOnSale && <Badge color="bg-red-500 text-white" text="LOJA" />}
        {item.isPromotional && <Badge color="bg-green-500 text-white" text="PROMO" />}
      </div>
      
      {isOwned && (
        <div className="absolute z-10 p-1 text-white rounded-full shadow-lg top-2 right-2 bg-fortnite-blue" title="Adquirido">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
        </div>
      )}

      <div className="relative overflow-hidden bg-gray-900 aspect-square">
        <img 
          src={item.images?.featured || item.images?.icon || item.images?.smallIcon} 
          alt={item.name} 
          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
        />
        {/* Hover Overlay */}
        <div className="absolute inset-0 flex items-center justify-center transition-opacity opacity-0 bg-black/60 group-hover:opacity-100">
          <span className="px-4 py-2 text-sm font-bold tracking-widest text-white uppercase border border-white">Ver Detalhes</span>
        </div>
      </div>
      
      <div className="flex flex-col flex-grow p-3 bg-slate-800/90 backdrop-blur-sm">
        <h3 className="text-sm font-bold text-white truncate">{item.name}</h3>
        <p className="text-xs text-gray-400 truncate">{item.rarity?.displayValue || 'Comum'} &bull; {item.type?.displayValue}</p>
        <div className="flex items-center justify-between pt-2 mt-auto">
          {item.price ? (
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded-full bg-fortnite-yellow"></div>
              <span className="text-sm font-bold text-white">{item.price}</span>
              {item.regularPrice && item.regularPrice > item.price && (
                <span className="ml-1 text-xs text-gray-500 line-through">{item.regularPrice}</span>
              )}
            </div>
          ) : (
            <span className="text-xs text-gray-500">Indisponível</span>
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
    <div className="flex justify-center gap-2 pb-8 mt-8">
      <button disabled={current === 1} onClick={() => onPageChange(current - 1)} className="px-3 py-1 text-white rounded bg-slate-800 disabled:opacity-50 hover:bg-slate-700">&lt;</button>
      {current > 3 && <span className="self-end text-gray-500">...</span>}
      {pages.map(p => (
        <button key={p} onClick={() => onPageChange(p)} className={`px-3 py-1 rounded font-bold ${current === p ? 'bg-fortnite-blue text-white' : 'bg-slate-800 text-gray-300 hover:bg-slate-700'}`}>
          {p}
        </button>
      ))}
      {current < total - 2 && <span className="self-end text-gray-500">...</span>}
      <button disabled={current === total} onClick={() => onPageChange(current + 1)} className="px-3 py-1 text-white rounded bg-slate-800 disabled:opacity-50 hover:bg-slate-700">&gt;</button>
    </div>
  );
};

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <nav className="sticky top-0 z-50 border-b shadow-lg bg-slate-900 border-slate-800">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between py-3 md:py-0 md:h-16">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-1 text-2xl italic font-black tracking-tighter text-white">
                <span className="text-fortnite-yellow">Fortinat</span>-shop
              </Link>
              {/* Desktop Navigation Links */}
              <div className="items-baseline hidden space-x-2 md:flex">
                <Link to="/" className="px-3 py-2 text-sm font-medium text-gray-300 transition-all rounded-md hover:text-white hover:bg-slate-800 whitespace-nowrap">Catálogo</Link>
                {isAuthenticated && (
                   <Link to="/my-items" className="px-3 py-2 text-sm font-medium transition-all rounded-md hover:text-white hover:bg-slate-800 whitespace-nowrap text-fortnite-yellow">Meus Itens</Link>
                )}
                <Link to="/users" className="px-3 py-2 text-sm font-medium text-gray-300 transition-all rounded-md hover:text-white hover:bg-slate-800 whitespace-nowrap">Comunidade</Link>
              </div>
            </div>

            {/* Hamburger Icon for Mobile */}
            <div className="text-2xl text-white cursor-pointer md:hidden" onClick={toggleMenu}>
              {isOpen ? <FaTimes /> : <FaBars />}
            </div>

            {/* Desktop User Info / Login */}
            <div className="items-center hidden gap-4 ml-auto md:flex">
              {isAuthenticated && user ? (
                <>
                  <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700 shadow-inner">
                    <div className="w-4 h-4 rounded-full bg-fortnite-yellow shadow-[0_0_10px_rgba(255,230,0,0.6)] animate-pulse"></div>
                    <span className="font-mono text-sm font-bold text-fortnite-yellow">{user.balance.toLocaleString()}</span>
                  </div>
                  <Link to="/profile" className="flex items-center gap-2 text-sm font-bold text-white transition-colors hover:text-fortnite-blue">
                    <div className="flex items-center justify-center w-8 h-8 text-xs rounded bg-fortnite-purple">
                      {user.name.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="hidden sm:inline">{user.name}</span>
                  </Link>
                  <button onClick={() => { logout(); navigate('/'); }} className="text-xs font-bold tracking-wide text-gray-400 uppercase hover:text-red-400">Sair</button>
                </>
              ) : (
                <Link to="/login" className="px-5 py-2 text-sm font-bold text-white transition-all rounded shadow-lg bg-fortnite-blue hover:bg-blue-600 shadow-blue-500/20 hover:shadow-blue-500/40">
                  ENTRAR
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <ul
        className={
          `md:hidden flex flex-col w-4/5 max-w-sm h-[calc(100vh-4rem)] fixed top-16 bg-gray-800 transition-transform duration-300 ease-in-out z-40 ${isOpen ? 'left-0' : 'left-[-100%]'}`
        }
      >
        <li className="w-full border-b border-gray-600"><Link to="/" className="block py-6 text-xl text-center text-white no-underline hover:bg-gray-700" onClick={toggleMenu}>Catálogo</Link></li>
        {isAuthenticated && (
          <li className="w-full border-b border-gray-600"><Link to="/my-items" className="block py-6 text-xl text-center no-underline text-fortnite-yellow hover:bg-gray-700" onClick={toggleMenu}>Meus Itens</Link></li>
        )}
        <li className="w-full border-b border-gray-600"><Link to="/users" className="block py-6 text-xl text-center text-white no-underline hover:bg-gray-700" onClick={toggleMenu}>Comunidade</Link></li>
        
        <li className="w-full px-8 mt-auto mb-8">
          {isAuthenticated && user ? (
            <div className='flex flex-col gap-4'>
              <Link to="/profile" className="block py-4 text-xl text-center text-white no-underline rounded-md bg-fortnite-purple hover:bg-purple-700" onClick={toggleMenu}>
                Ver Perfil ({user.name})
              </Link>
              <button onClick={() => { toggleMenu(); logout(); navigate('/'); }} className="block w-full py-3 text-lg text-center text-red-400 no-underline rounded-md hover:bg-red-500/20">
                Sair
              </button>
            </div>
          ) : (
            <Link to="/login" className="block py-4 text-xl font-bold text-center text-black no-underline rounded-md bg-fortnite-yellow hover:bg-yellow-500" onClick={toggleMenu}>
              Entrar / Criar Conta
            </Link>
          )}
        </li>
      </ul>
    </>
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
    <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div className="flex flex-col items-center justify-between gap-4 mb-6 md:flex-row">
        <h1 className="text-3xl italic font-black text-white">CATÁLOGO DE ITENS</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-gray-400">Encontrados: {filteredItems.length}</span>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded font-bold text-sm flex items-center gap-2 transition-colors ${showFilters ? 'bg-fortnite-yellow text-black' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
            </svg>
            {showFilters ? 'Fechar Filtros' : 'Filtrar Itens'}
          </button>
        </div>
      </div>

      {/* Collapsible Filter Panel */}
      {showFilters && (
        <div className="p-6 mb-8 border shadow-xl bg-slate-800 rounded-xl border-slate-700 animate-in fade-in slide-in-from-top-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <label htmlFor="search-input" className="text-xs font-bold text-gray-400 uppercase">Buscar</label>
              <input id="search-input" type="text" placeholder="Nome do cosmético..." value={search} onChange={e => setSearch(e.target.value)} className="w-full p-2 text-white border rounded outline-none bg-slate-900 border-slate-600 focus:border-fortnite-blue" />
            </div>
            <div className="space-y-1">
              <label htmlFor="type-select" className="text-xs font-bold text-gray-400 uppercase">Tipo</label>
              <select id="type-select" value={type} onChange={e => setType(e.target.value)} className="w-full p-2 text-white border rounded outline-none bg-slate-900 border-slate-600 focus:border-fortnite-blue">
                <option value="">Todos</option>
                {uniqueTypes.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="rarity-select" className="text-xs font-bold text-gray-400 uppercase">Raridade</label>
              <select id="rarity-select" value={rarity} onChange={e => setRarity(e.target.value)} className="w-full p-2 text-white border rounded outline-none bg-slate-900 border-slate-600 focus:border-fortnite-blue">
                <option value="">Todas</option>
                {uniqueRarities.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label id="period-label" className="text-xs font-bold text-gray-400 uppercase">Período</label>
              <div className="flex gap-2">
                <input aria-label="Data de início" type="date" value={dateStart} onChange={e => setDateStart(e.target.value)} className="w-full p-2 text-xs text-white border rounded bg-slate-900 border-slate-600" />
                <input aria-label="Data de fim" type="date" value={dateEnd} onChange={e => setDateEnd(e.target.value)} className="w-full p-2 text-xs text-white border rounded bg-slate-900 border-slate-600" />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 mt-4 border-t border-slate-700">
             <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 transition-colors cursor-pointer hover:text-fortnite-yellow">
                  <input type="checkbox" checked={isNew} onChange={e => setIsNew(e.target.checked)} className="w-4 h-4 accent-fortnite-yellow" />
                  <span className="text-sm font-bold text-gray-300">Apenas Novos</span>
                </label>
                <label className="flex items-center gap-2 transition-colors cursor-pointer hover:text-red-400">
                  <input type="checkbox" checked={isSale} onChange={e => setIsSale(e.target.checked)} className="w-4 h-4 accent-red-500" />
                  <span className="text-sm font-bold text-gray-300">Loja Atual</span>
                </label>
                <label className="flex items-center gap-2 transition-colors cursor-pointer hover:text-green-400">
                  <input type="checkbox" checked={isPromo} onChange={e => setIsPromo(e.target.checked)} className="w-4 h-4 accent-green-500" />
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
          <div className="w-12 h-12 border-t-2 border-b-2 rounded-full animate-spin border-fortnite-yellow"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
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

  if (loading) return <div className="flex justify-center py-20"><div className="w-12 h-12 border-t-2 border-b-2 rounded-full animate-spin border-fortnite-yellow"></div></div>;

  return (
    <div className="px-4 py-8 mx-auto max-w-7xl">
      <div className="flex items-center gap-4 mb-8">
        <div className="flex items-center justify-center w-12 h-12 text-xl font-black text-black rounded-full bg-fortnite-yellow">
          {items.length}
        </div>
        <h1 className="text-3xl italic font-black text-white">MEUS ITENS</h1>
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {items.map(item => <CosmeticCard key={item.id} item={item} />)}
        </div>
      ) : (
        <div className="py-20 text-center border bg-slate-800 rounded-xl border-slate-700">
          <p className="mb-4 text-lg text-gray-400">Você ainda não comprou nenhum cosmético.</p>
          <Link to="/" className="inline-block px-6 py-3 font-bold text-white transition-colors rounded-lg bg-fortnite-blue hover:bg-blue-600">
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

  if (loading) return <div className="py-20 text-center text-white">Carregando...</div>;
  if (!item) return <div className="py-20 text-center text-white">Item não encontrado.</div>;

  const isOwned = user?.inventory.includes(item.id);
  const canAfford = (user?.balance || 0) >= (item.price || 0);

  return (
    <div className="max-w-5xl p-4 mx-auto md:p-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-6 text-gray-400 hover:text-white">
        &larr; Voltar
      </button>
      
      <div className="flex flex-col overflow-hidden border shadow-2xl bg-slate-800 rounded-2xl border-slate-700 md:flex-row">
        <div className="relative md:w-1/2 bg-slate-900">
          <img src={item.images.featured || item.images.icon} alt={item.name} className="object-contain w-full h-full p-8" />
          {isOwned && (
             <div className="absolute px-4 py-2 font-bold text-white rounded-full shadow-lg top-4 right-4 bg-fortnite-blue">
               ADQUIRIDO
             </div>
          )}
        </div>
        
        <div className="flex flex-col p-8 md:w-1/2">
          <div className="mb-auto">
            <div className="flex gap-2 mb-2">
              <Badge color="bg-gray-700 text-gray-300" text={item.type?.displayValue} />
              <Badge color="bg-gray-700 text-gray-300" text={item.rarity?.displayValue} />
            </div>
            <h1 className="mb-4 text-4xl italic font-black text-white">{item.name}</h1>
            <p className="mb-6 text-lg leading-relaxed text-gray-300">{item.description}</p>
            
            {item.bundleIds && item.bundleIds.length > 0 && (
              <div className="p-4 mb-6 rounded-lg bg-slate-900/50">
                <p className="mb-2 text-sm font-bold text-gray-400 uppercase">Inclui neste pacote:</p>
                <p className="text-sm text-white">{item.bundleIds.length} itens adicionais</p>
              </div>
            )}
            
            <div className="flex items-center gap-2 mb-6">
               <span className="text-sm text-gray-400">Adicionado em:</span>
               <span className="font-mono text-white">{new Date(item.added).toLocaleDateString('pt-BR')}</span>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-700">
            {!isOwned ? (
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-400 uppercase">Preço</span>
                  <div className="flex items-center gap-2">
                     <div className="w-6 h-6 rounded-full bg-fortnite-yellow"></div>
                     <span className="text-3xl font-black text-white">{item.price}</span>
                  </div>
                </div>
                <button 
                  onClick={handleBuy}
                  disabled={!canAfford}
                  className={`px-6 py-3 text-base md:px-8 md:py-4 md:text-lg rounded-lg font-black uppercase tracking-wide transition-all shadow-lg ${canAfford ? 'bg-fortnite-yellow hover:bg-yellow-400 text-black hover:scale-105' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}
                >
                  {canAfford ? 'Comprar Agora' : 'Saldo Insuficiente'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 text-center border rounded-lg bg-green-500/10 border-green-500/50">
                  <p className="font-bold text-green-400">Você possui este item.</p>
                </div>
                <button 
                  onClick={handleRefund}
                  className="w-full px-6 py-3 font-bold tracking-wide text-red-400 uppercase transition-colors border rounded-lg border-red-500/50 hover:bg-red-500/20"
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
    <div className="px-4 py-8 mx-auto max-w-7xl">
      <div className="flex flex-col items-center gap-6 p-6 mb-8 border bg-slate-800 rounded-xl border-slate-700 sm:flex-row">
        <div className="flex items-center justify-center w-24 h-24 text-4xl font-bold text-white rounded-full shadow-lg bg-fortnite-purple">
          {user.name.substring(0, 2).toUpperCase()}
        </div>
        <div className="text-center sm:text-left">
          <h1 className="mb-2 text-3xl font-bold text-white">{user.name}</h1>
          <p className="text-gray-400">{user.email}</p>
          <div className="inline-flex items-center gap-3 px-4 py-2 mt-4 border rounded-lg bg-slate-900 border-slate-700">
            <span className="text-sm font-bold text-gray-400 uppercase">Saldo V-Bucks:</span>
            <div className="w-5 h-5 rounded-full bg-fortnite-yellow"></div>
            <span className="text-xl font-black text-white">{user.balance.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mb-6 border-b border-slate-700">
        <button onClick={() => setActiveTab('inventory')} className={`pb-3 px-4 font-bold text-sm uppercase tracking-wide transition-colors ${activeTab === 'inventory' ? 'text-fortnite-blue border-b-2 border-fortnite-blue' : 'text-gray-400 hover:text-white'}`}>
          Meus Cosméticos
        </button>
        <button onClick={() => setActiveTab('history')} className={`pb-3 px-4 font-bold text-sm uppercase tracking-wide transition-colors ${activeTab === 'history' ? 'text-fortnite-blue border-b-2 border-fortnite-blue' : 'text-gray-400 hover:text-white'}`}>
          Histórico e Devoluções
        </button>
      </div>

      {activeTab === 'inventory' && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {inventoryItems.length > 0 ? (
            inventoryItems.map(item => <CosmeticCard key={item.id} item={item} />)
          ) : (
            <p className="py-10 text-center text-gray-500 col-span-full">Nenhum item adquirido.</p>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="overflow-x-auto border rounded-lg border-slate-700">
          <table className="w-full text-sm text-left text-gray-300">
            <thead className="text-xs font-bold text-gray-400 uppercase bg-slate-900">
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
                    <td className="flex items-center gap-3 px-6 py-4 font-medium text-white">
                      {tx.cosmeticImage && <img src={tx.cosmeticImage} alt={tx.cosmeticName} className="w-8 h-8 bg-gray-900 rounded" />}
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
                        <button onClick={() => handleRefund(tx.cosmeticId)} className="px-3 py-1 text-xs text-red-500 transition-all border rounded bg-red-500/10 hover:bg-red-500 hover:text-white border-red-500/50">
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
    <div className="px-4 py-8 mx-auto max-w-7xl">
      <h1 className="mb-8 text-3xl italic font-black text-white">COMUNIDADE</h1>
      
      {selectedUser ? (
        <div className="duration-300 animate-in fade-in zoom-in">
          <button onClick={() => setSelectedUser(null)} className="mb-4 font-bold text-fortnite-blue hover:underline">&larr; Voltar para lista</button>
          <div className="p-6 mb-6 border bg-slate-800 rounded-xl border-slate-700">
            <h2 className="text-2xl font-bold text-white">Inventário de {selectedUser.name}</h2>
            <p className="mb-4 text-gray-400">Itens adquiridos: {userItems.length}</p>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
              {userItems.map(item => (
                <Link to={`/cosmetic/${item.id}`} key={item.id} className="block overflow-hidden transition-colors border rounded-lg aspect-square bg-slate-900 border-slate-700 hover:border-fortnite-purple" title={item.name}>
                  <img src={item.images.smallIcon} alt={item.name} className="object-cover w-full h-full" loading="lazy" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {currentUsers.map(u => (
              <div key={u.id} onClick={() => handleUserClick(u)} className="p-4 transition-all border rounded-lg cursor-pointer bg-slate-800 border-slate-700 hover:border-fortnite-blue hover:-translate-y-1">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 font-bold text-white rounded bg-fortnite-purple">
                    {u.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-white truncate">{u.name}</h3>
                    <p className="text-xs text-gray-400">{u.inventory.length} itens</p>
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
      <div className="w-full max-w-md p-8 border shadow-2xl bg-slate-800 rounded-2xl border-slate-700">
        <h2 className="mb-8 text-3xl italic font-black text-center text-white">
          {type === 'login' ? 'LOGIN' : 'CRIAR CONTA'}
        </h2>
        {error && <div className="p-3 mb-4 text-sm text-center text-red-200 border border-red-500 rounded bg-red-500/20">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {type === 'register' && (
            <div>
              <label htmlFor="name-input" className="block mb-1 text-xs font-bold text-gray-400 uppercase">Nome</label>
              <input id="name-input" required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 text-white transition-colors border rounded outline-none bg-slate-900 border-slate-600 focus:border-fortnite-blue" />
            </div>
          )}
          <div>
            <label htmlFor="email-input" className="block mb-1 text-xs font-bold text-gray-400 uppercase">E-mail</label>
            <input id="email-input" required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 text-white transition-colors border rounded outline-none bg-slate-900 border-slate-600 focus:border-fortnite-blue" />
          </div>
          <div>
            <label htmlFor="password-input" className="block mb-1 text-xs font-bold text-gray-400 uppercase">Senha</label>
            <input id="password-input" required type="password" value={pass} onChange={e => setPass(e.target.value)} className="w-full p-3 text-white transition-colors border rounded outline-none bg-slate-900 border-slate-600 focus:border-fortnite-blue" />
          </div>
          <button type="submit" className="w-full bg-fortnite-yellow hover:bg-yellow-400 text-black font-black uppercase py-3 rounded shadow-lg hover:shadow-yellow-500/50 transition-all transform hover:-translate-y-0.5">
            {type === 'login' ? 'Entrar' : 'Cadastrar e Ganhar 10.000 V-Bucks'}
          </button>
        </form>
        <div className="mt-6 text-center">
          {type === 'login' ? (
            <Link to="/register" className="text-sm font-bold text-fortnite-blue hover:text-white">Não tem conta? Cadastre-se</Link>
          ) : (
            <Link to="/login" className="text-sm font-bold text-fortnite-blue hover:text-white">Já tem conta? Faça login</Link>
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
        <div className="flex flex-col min-h-screen font-sans">
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
          <footer className="py-8 text-sm text-center text-gray-500 border-t bg-slate-900 border-slate-800">
            <p>&copy; 2023 Fortinat-shop. Dados fornecidos por Fortnite-API.</p>
            <p className="mt-2 text-xs opacity-50">Este projeto não é afiliado à Epic Games.</p>
          </footer>
        </div>
      </AuthProvider>
    </HashRouter>
  );
};

export default App;
