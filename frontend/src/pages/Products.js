import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import { SlidersHorizontal, Grid, List, ChevronDown, X, Search, Flame, Sparkles } from 'lucide-react';
import { productAPI, categoryAPI } from '../utils/api';
import { useSettings } from '../context/SettingsContext';
import ProductCard from '../components/ui/ProductCard';
import { CategoryIcon } from '../utils/categoryIcons';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { slug: categorySlug } = useParams();

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  const search = searchParams.get('search') || '';
  const category = categorySlug || searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1');
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const isNew = searchParams.get('isNew') || '';
  const isPromo = searchParams.get('isPromo') || '';

  const [priceMin, setPriceMin] = useState(minPrice);
  const [priceMax, setPriceMax] = useState(maxPrice);

  const { formatPrice } = useSettings();

  useEffect(() => {
    categoryAPI.getAll().then(({ data }) => setCategories(data.categories || []));
  }, []);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12, sort };
      if (search) params.search = search;
      if (category) params.category = category;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (isNew) params.isNew = isNew;
      if (isPromo) params.isPromo = isPromo;
      const { data } = await productAPI.getAll(params);
      setProducts(data.products || []);
      setPagination(data.pagination || {});
    } catch { setProducts([]); }
    finally { setLoading(false); }
  }, [search, category, sort, page, minPrice, maxPrice, isNew, isPromo]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const setParam = (key, val) => {
    const p = new URLSearchParams(searchParams);
    if (val) p.set(key, val); else p.delete(key);
    p.delete('page');
    setSearchParams(p);
  };

  const applyPrice = () => {
    const p = new URLSearchParams(searchParams);
    if (priceMin) p.set('minPrice', priceMin); else p.delete('minPrice');
    if (priceMax) p.set('maxPrice', priceMax); else p.delete('maxPrice');
    p.delete('page');
    setSearchParams(p);
  };

  const clearAll = () => {
    setSearchParams({});
    setPriceMin(''); setPriceMax('');
  };

  const currentCat = categories.find(c => c.slug === category);
  const hasFilters = search || category || minPrice || maxPrice || isNew || isPromo;

  const sortOptions = [
    { value: 'newest', label: 'Plus récents' },
    { value: 'price_asc', label: 'Prix croissant' },
    { value: 'price_desc', label: 'Prix décroissant' },
    { value: 'rating', label: 'Mieux notés' },
    { value: 'popular', label: 'Plus populaires' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
      {/* Header bar */}
      <div style={{ background: 'var(--cream-dark)', borderBottom: '1px solid rgba(0,0,0,0.06)', padding: '16px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h1 style={{ fontFamily: "Nunito, sans-serif", fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {currentCat
                  ? <><CategoryIcon name={currentCat.icon} size={22} /> {currentCat.name}</>
                  : search
                    ? `Résultats: "${search}"`
                    : 'Tous les produits'}
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '2px' }}>
                {pagination.total !== undefined ? `${pagination.total} produit${pagination.total > 1 ? 's' : ''}` : 'Chargement...'}
              </p>
            </div>
            <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
              <Link to="/" style={{ color: 'var(--text-muted)' }}>Accueil</Link>
              <span>/</span>
              {currentCat ? (
                <><Link to="/produits" style={{ color: 'var(--text-muted)' }}>Produits</Link><span>/</span><span style={{ color: 'var(--charcoal)', fontWeight: '500' }}>{currentCat.name}</span></>
              ) : (
                <span style={{ color: 'var(--charcoal)', fontWeight: '500' }}>Produits</span>
              )}
            </nav>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '32px 24px' }}>
        <div style={{ display: 'flex', gap: '28px', alignItems: 'flex-start' }}>
          {/* Sidebar Filters */}
          <>
            {/* Overlay mobile */}
            {filtersOpen && <div className="overlay" style={{ zIndex: 200 }} onClick={() => setFiltersOpen(false)} />}
            <aside style={{
              width: '260px', flexShrink: 0,
              position: filtersOpen ? 'fixed' : 'sticky',
              top: filtersOpen ? 0 : '90px',
              left: filtersOpen ? 0 : 'auto',
              bottom: filtersOpen ? 0 : 'auto',
              zIndex: filtersOpen ? 300 : 1,
              background: 'var(--white)',
              borderRadius: filtersOpen ? 0 : 'var(--radius-lg)',
              boxShadow: 'var(--shadow-md)',
              padding: '24px',
              maxHeight: filtersOpen ? '100vh' : 'calc(100vh - 110px)',
              overflowY: 'auto',
              transition: 'var(--transition)',
            }} className={`filters-sidebar${filtersOpen ? ' filters-sidebar-open' : ''}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Filtres</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {hasFilters && (
                    <button onClick={clearAll} style={{ fontSize: '12px', color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' }}>
                      Tout effacer
                    </button>
                  )}
                  <button onClick={() => setFiltersOpen(false)} className="btn-icon" style={{ display: filtersOpen ? 'flex' : 'none' }}>
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Categories */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: '12px' }}>Catégorie</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <button onClick={() => setParam('category', '')}
                    style={{ textAlign: 'left', padding: '7px 10px', borderRadius: 'var(--radius-sm)', fontSize: '14px', fontWeight: !category ? '600' : '400', color: !category ? 'var(--gold)' : 'var(--text-secondary)', background: !category ? 'rgba(201,168,76,0.1)' : 'none', border: 'none', cursor: 'pointer', transition: 'var(--transition)' }}>
                    Toutes les catégories
                  </button>
                  {categories.map(cat => (
                    <button key={cat._id} onClick={() => setParam('category', cat.slug)}
                      style={{ textAlign: 'left', padding: '7px 10px', borderRadius: 'var(--radius-sm)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: category === cat.slug ? '600' : '400', color: category === cat.slug ? 'var(--gold)' : 'var(--text-secondary)', background: category === cat.slug ? 'rgba(201,168,76,0.1)' : 'none', border: 'none', cursor: 'pointer', transition: 'var(--transition)' }}>
                      <CategoryIcon name={cat.icon} size={14} style={{ color: cat.color, flexShrink: 0 }} /> {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: '12px' }}>Prix (FCFA)</h4>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input className="form-input" type="number" placeholder="Min" value={priceMin} onChange={e => setPriceMin(e.target.value)} style={{ fontSize: '13px', padding: '8px 10px' }} />
                  <input className="form-input" type="number" placeholder="Max" value={priceMax} onChange={e => setPriceMax(e.target.value)} style={{ fontSize: '13px', padding: '8px 10px' }} />
                </div>
                <button className="btn btn-outline btn-sm" style={{ width: '100%', justifyContent: 'center' }} onClick={applyPrice}>
                  Appliquer
                </button>
              </div>

              {/* Tags */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: '12px' }}>Type</h4>
                {[
                  { label: 'Nouveautés', key: 'isNew', val: 'true', Icon: Sparkles },
                  { label: 'En promotion', key: 'isPromo', val: 'true', Icon: Flame },
                ].map(f => (
                  <label key={f.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', cursor: 'pointer', fontSize: '14px', color: 'var(--text-secondary)' }}>
                    <input type="checkbox"
                      checked={searchParams.get(f.key) === f.val}
                      onChange={e => setParam(f.key, e.target.checked ? f.val : '')}
                      style={{ accentColor: 'var(--gold)', width: '15px', height: '15px' }}
                    />
                    <f.Icon size={13} style={{ color: 'var(--gold)' }} /> {f.label}
                  </label>
                ))}
              </div>
            </aside>
          </>

          {/* Main */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <button className="btn btn-outline btn-sm filters-toggle"
                onClick={() => setFiltersOpen(true)}
                style={{ display: 'none', alignItems: 'center', gap: '6px' }}>
                <SlidersHorizontal size={15} /> Filtres {hasFilters && <span style={{ background: 'var(--gold)', color: 'var(--white)', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>!</span>}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                {/* Active filters chips */}
                {search && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--cream-dark)', borderRadius: 'var(--radius-full)', padding: '4px 10px', fontSize: '13px' }}>
                    <Search size={12} /> "{search}"
                    <button onClick={() => setParam('search', '')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', lineHeight: 1, marginLeft: '2px' }}>×</button>
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' }}>
                <select className="form-input form-select" value={sort} onChange={e => setParam('sort', e.target.value)}
                  style={{ padding: '8px 36px 8px 12px', fontSize: '13px', width: 'auto' }}>
                  {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[{ mode: 'grid', Icon: Grid }, { mode: 'list', Icon: List }].map(({ mode, Icon }) => (
                    <button key={mode} onClick={() => setViewMode(mode)} className="btn-icon"
                      style={{ background: viewMode === mode ? 'var(--charcoal)' : 'var(--cream-dark)', color: viewMode === mode ? 'var(--white)' : 'var(--text-secondary)' }}>
                      <Icon size={16} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="grid-3">
                {[...Array(9)].map((_, i) => (
                  <div key={i} style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                    <div className="skeleton" style={{ paddingBottom: '80%' }} />
                    <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--white)' }}>
                      <div className="skeleton" style={{ height: '12px', width: '50%' }} />
                      <div className="skeleton" style={{ height: '16px' }} />
                      <div className="skeleton" style={{ height: '20px', width: '40%' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
                <Search size={64} style={{ marginBottom: '16px', opacity: 0.3 }} />
                <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', color: 'var(--charcoal)' }}>Aucun produit trouvé</h3>
                <p style={{ marginBottom: '24px' }}>Essayez de modifier vos critères de recherche.</p>
                <button className="btn btn-gold" onClick={clearAll}>Réinitialiser les filtres</button>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid-3' : ''} style={viewMode === 'list' ? { display: 'flex', flexDirection: 'column', gap: '16px' } : {}}>
                {products.map(p => (
                  viewMode === 'list' ? (
                    <Link key={p._id} to={`/produits/${p.slug}`} style={{ display: 'flex', gap: '16px', background: 'var(--white)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', transition: 'var(--transition)', textDecoration: 'none' }}
                      onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
                      onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}>
                      <img src={p.mainImage} alt={p.name} className="list-item-img" style={{ width: '140px', height: '120px', objectFit: 'cover', flexShrink: 0 }} />
                      <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <span style={{ fontSize: '11px', color: 'var(--gold)', fontWeight: '600', textTransform: 'uppercase' }}>{p.category?.name}</span>
                          <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '4px 0 6px' }}>{p.name}</h3>
                          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.shortDescription}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '18px', fontWeight: '700' }}>{formatPrice(p.price)}</span>
                          <span style={{ background: 'var(--cream)', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '12px', color: p.stock > 0 ? '#22c55e' : 'var(--error)', fontWeight: '600' }}>
                            {p.stock > 0 ? 'En stock' : 'Épuisé'}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <ProductCard key={p._id} product={p} />
                  )
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '40px', flexWrap: 'wrap' }}>
                {[...Array(pagination.pages)].map((_, i) => (
                  <button key={i} onClick={() => setParam('page', String(i + 1))}
                    style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', border: i + 1 === page ? 'none' : '1.5px solid var(--cream-dark)', background: i + 1 === page ? 'var(--charcoal)' : 'var(--white)', color: i + 1 === page ? 'var(--white)' : 'var(--text-secondary)', fontWeight: i + 1 === page ? '700' : '400', cursor: 'pointer', transition: 'var(--transition)', fontSize: '14px' }}>
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
