import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Store,
  X,
} from 'lucide-react';
import { FortniteAPI } from '../../services/fortniteApi';
import { Cosmetic } from '../../../types';

const ITEMS_PER_PAGE = 20;

const rarityClass: Record<string, string> = {
  legendary: 'rarity-legendary',
  epic: 'rarity-epic',
  rare: 'rarity-rare',
  uncommon: 'rarity-uncommon',
};

const priceLabel = (item: Cosmetic) =>
  item.isOnSale && Number.isFinite(item.price) ? item.price!.toLocaleString('pt-BR') : null;

const CardSkeleton = () => (
  <div className="store-card skeleton-card" aria-hidden="true">
    <div className="skeleton-media" />
    <div className="skeleton-copy"><span /><span /><span /></div>
  </div>
);

const CosmeticCard = ({ item, owned, index }: { item: Cosmetic; owned: boolean; index: number }) => {
  const image = item.images?.featured || item.images?.icon || item.images?.smallIcon;
  const price = priceLabel(item);

  return (
    <motion.article
      className={`store-card ${rarityClass[item.rarity?.value] || 'rarity-default'}`}
      initial={{ opacity: 0, y: 28, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: Math.min(index % ITEMS_PER_PAGE, 8) * 0.045 }}
      whileHover={{ y: -8 }}
    >
      <Link to={`/cosmetic/${item.id}`} className="card-link" aria-label={`Ver detalhes de ${item.name}`}>
        <div className="card-media">
          <div className="card-glow" />
          {image ? <img src={image} alt={item.name} loading="lazy" /> : <ShoppingBag aria-hidden="true" />}
          <div className="card-badges">
            {item.isNew && <span className="tag tag-new">Novo</span>}
            {item.isOnSale && <span className="tag tag-shop">Na loja</span>}
          </div>
          {owned && <span className="owned-badge">Adquirido</span>}
          <span className="detail-cta">Ver detalhes <ArrowRight size={15} /></span>
        </div>
        <div className="card-copy">
          <p>{item.rarity?.displayValue || 'Cosmético'} · {item.type?.displayValue || 'Item'}</p>
          <h3 title={item.name}>{item.name}</h3>
          <div className="card-footer">
            {price ? (
              <span className="price"><i />{price}</span>
            ) : (
              <span className="catalog-only">Ver no catálogo</span>
            )}
            {item.isPromotional && item.regularPrice ? <del>{item.regularPrice.toLocaleString('pt-BR')}</del> : null}
            <ArrowRight className="card-arrow" size={18} />
          </div>
        </div>
      </Link>
    </motion.article>
  );
};

export const StoreCatalog = ({ ownedIds = [] }: { ownedIds?: string[] }) => {
  const [items, setItems] = useState<Cosmetic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [rarity, setRarity] = useState('');
  const [view, setView] = useState<'shop' | 'new' | 'all'>('shop');
  const [sort, setSort] = useState('featured');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [shop, newest, all] = await Promise.all([
        FortniteAPI.getShop(),
        FortniteAPI.getNewCosmetics(),
        FortniteAPI.getAllCosmetics(),
      ]);
      const newIds = new Set(newest.map(item => item.id));
      const shopById = new Map(shop.map(item => [item.id, item]));
      const enriched = all.map(item => ({
        ...item,
        ...(shopById.get(item.id) || {}),
        isNew: newIds.has(item.id),
      }));
      const missingShopItems = shop.filter(item => !enriched.some(current => current.id === item.id));
      setItems([...missingShopItems, ...enriched]);
    } catch (reason) {
      console.error(reason);
      setError('Não foi possível carregar a Fortnite-API agora. Tente novamente em instantes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const types = useMemo(() => {
    const values = new Map<string, string>();
    items.forEach(item => item.type?.value && values.set(item.type.value, item.type.displayValue));
    return [...values.entries()].sort((a, b) => a[1].localeCompare(b[1], 'pt-BR'));
  }, [items]);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('pt-BR');
    const result = items.filter(item => {
      if (view === 'shop' && !item.isOnSale) return false;
      if (view === 'new' && !item.isNew) return false;
      if (type && item.type?.value !== type) return false;
      if (rarity && item.rarity?.value !== rarity) return false;
      if (normalizedQuery && !`${item.name} ${item.description}`.toLocaleLowerCase('pt-BR').includes(normalizedQuery)) return false;
      return true;
    });

    return result.sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name, 'pt-BR');
      if (sort === 'price-low') return (a.price ?? Infinity) - (b.price ?? Infinity);
      if (sort === 'price-high') return (b.price ?? -1) - (a.price ?? -1);
      if (a.isOnSale !== b.isOnSale) return a.isOnSale ? -1 : 1;
      if (a.isNew !== b.isNew) return a.isNew ? -1 : 1;
      return 0;
    });
  }, [items, query, type, rarity, view, sort]);

  useEffect(() => { setPage(1); }, [query, type, rarity, view, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const visible = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const shopCount = items.filter(item => item.isOnSale).length;
  const newCount = items.filter(item => item.isNew).length;
  const heroItem = items.find(item => item.isOnSale && item.images?.featured) || items[0];
  const clearFilters = () => { setQuery(''); setType(''); setRarity(''); setSort('featured'); };
  const hasFilters = Boolean(query || type || rarity || sort !== 'featured');

  return (
    <div className="storefront">
      <section className="store-hero">
        <div className="hero-orb hero-orb-one" /><div className="hero-orb hero-orb-two" />
        <motion.div className="hero-copy" initial={{ opacity: 0, x: -45 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.65 }}>
          <span className="eyebrow"><Sparkles size={15} /> Atualizada diretamente pela API</span>
          <h1>Descubra a<br/><em>loja de hoje.</em></h1>
          <p>Cosméticos, novidades e ofertas do Fortnite em uma experiência rápida, organizada e totalmente em português.</p>
          <div className="hero-actions">
            <button onClick={() => { setView('shop'); document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' }); }}>
              Explorar loja <ArrowRight size={18} />
            </button>
            <span><strong>{shopCount || '—'}</strong> itens disponíveis hoje</span>
          </div>
        </motion.div>
        {heroItem && (
          <motion.div className="hero-art" initial={{ opacity: 0, x: 45, rotate: 4 }} animate={{ opacity: 1, x: 0, rotate: 0 }} transition={{ duration: 0.75, delay: 0.1 }}>
            <div className="hero-ring" />
            <img src={heroItem.images.featured || heroItem.images.icon} alt={heroItem.name} />
            <div className="hero-item-label"><span>Destaque de hoje</span><strong>{heroItem.name}</strong></div>
          </motion.div>
        )}
      </section>

      <section className="catalog-shell" id="catalogo">
        <div className="catalog-heading">
          <div><span className="section-kicker">Explore o universo</span><h2>Catálogo de cosméticos</h2></div>
          <p>{loading ? 'Sincronizando dados…' : `${filtered.length.toLocaleString('pt-BR')} itens encontrados`}</p>
        </div>

        <div className="view-tabs" role="tablist" aria-label="Visualização do catálogo">
          <button className={view === 'shop' ? 'active' : ''} onClick={() => setView('shop')}><Store size={18}/><span>Loja de hoje</span><b>{shopCount}</b></button>
          <button className={view === 'new' ? 'active' : ''} onClick={() => setView('new')}><Sparkles size={18}/><span>Novidades</span><b>{newCount}</b></button>
          <button className={view === 'all' ? 'active' : ''} onClick={() => setView('all')}><ShoppingBag size={18}/><span>Todos</span><b>{items.length}</b></button>
        </div>

        <div className="toolbar">
          <label className="search-box"><Search size={19}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar skin, picareta, gesto…" />{query && <button onClick={() => setQuery('')} aria-label="Limpar busca"><X size={16}/></button>}</label>
          <button className={`filter-toggle ${filtersOpen ? 'active' : ''}`} onClick={() => setFiltersOpen(value => !value)}><SlidersHorizontal size={18}/> Filtros {hasFilters && <i/>}</button>
          <select aria-label="Ordenar itens" value={sort} onChange={event => setSort(event.target.value)}>
            <option value="featured">Em destaque</option><option value="name">Nome A–Z</option><option value="price-low">Menor preço</option><option value="price-high">Maior preço</option>
          </select>
        </div>

        <AnimatePresence>
          {filtersOpen && <motion.div className="filter-panel" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <label>Tipo<select value={type} onChange={event => setType(event.target.value)}><option value="">Todos os tipos</option>{types.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label>Raridade<select value={rarity} onChange={event => setRarity(event.target.value)}><option value="">Todas as raridades</option><option value="legendary">Lendário</option><option value="epic">Épico</option><option value="rare">Raro</option><option value="uncommon">Incomum</option></select></label>
            <button onClick={clearFilters} disabled={!hasFilters}><RotateCcw size={16}/> Limpar filtros</button>
          </motion.div>}
        </AnimatePresence>

        {error ? (
          <div className="state-card"><ShoppingBag size={38}/><h3>A loja não carregou</h3><p>{error}</p><button onClick={load}><RotateCcw size={17}/> Tentar novamente</button></div>
        ) : loading ? (
          <div className="catalog-grid">{Array.from({length: 10}, (_, index) => <CardSkeleton key={index}/>)}</div>
        ) : visible.length ? (
          <motion.div className="catalog-grid" key={`${view}-${page}-${type}-${rarity}`}>
            {visible.map((item, index) => <CosmeticCard key={item.id} item={item} owned={ownedIds.includes(item.id)} index={index}/>) }
          </motion.div>
        ) : (
          <div className="state-card"><Search size={38}/><h3>Nenhum item encontrado</h3><p>Tente mudar a busca ou remover algum filtro.</p><button onClick={clearFilters}><RotateCcw size={17}/> Limpar filtros</button></div>
        )}

        {!loading && !error && pages > 1 && (
          <nav className="pagination" aria-label="Paginação">
            <button disabled={page === 1} onClick={() => setPage(value => Math.max(1, value - 1))}><ChevronLeft size={19}/><span>Anterior</span></button>
            <span>Página <strong>{page}</strong> de {pages}</span>
            <button disabled={page === pages} onClick={() => setPage(value => Math.min(pages, value + 1))}><span>Próxima</span><ChevronRight size={19}/></button>
          </nav>
        )}
      </section>
    </div>
  );
};
