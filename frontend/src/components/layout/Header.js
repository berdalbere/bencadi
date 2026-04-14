import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, User, Heart, Menu, X, ChevronDown, LogOut, Settings, Package, Flame, Sparkles, Info, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useSettings } from '../../context/SettingsContext';
import { categoryAPI, productAPI } from '../../utils/api';
import { CategoryIcon } from '../../utils/categoryIcons';

export default function Header() {
  const { user, logout, isAdmin } = useAuth();
  const { itemCount, setIsOpen: openCart } = useCart();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [catOpen, setCatOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const searchRef = useRef(null);
  const catRef = useRef(null);
  const userRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    categoryAPI.getAll().then(({ data }) => setCategories(data.categories || []));
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setCatOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  // Click outside close
  useEffect(() => {
    const handler = (e) => {
      if (catRef.current && !catRef.current.contains(e.target)) setCatOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserMenuOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
        setSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (q) => {
    setSearchQuery(q);
    clearTimeout(debounceRef.current);
    if (q.length < 2) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await productAPI.getSuggestions(q);
        setSuggestions(data.suggestions || []);
      } catch { setSuggestions([]); }
    }, 300);
  };

  const submitSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/produits?search=${encodeURIComponent(searchQuery.trim())}`);
    setSearchOpen(false);
    setSuggestions([]);
    setSearchQuery('');
  };

  const handleSuggestionClick = (slug) => {
    navigate(`/produits/${slug}`);
    setSearchQuery('');
    setSuggestions([]);
    setSearchOpen(false);
  };

  return (
    <>
      {/* Top bar */}
      <div style={{ background: 'var(--charcoal)', color: 'var(--cream)', fontSize: '13px', padding: '6px 0' }} className="topbar">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Package size={13} style={{ color: 'var(--gold)' }} /> Livraison gratuite à partir de 100 000 FCFA
          </span>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            {settings.socialLinks?.whatsapp && (
              <a href={settings.socialLinks.whatsapp} target="_blank" rel="noreferrer" style={{ color: '#22c55e', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShoppingBag size={12} /> WhatsApp
              </a>
            )}
            <span className="hide-mobile">{settings.email || 'contact@bencadi.com'}</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: scrolled ? 'rgba(250,248,245,0.97)' : 'var(--cream)',
        backdropFilter: scrolled ? 'blur(10px)' : 'none',
        boxShadow: scrolled ? 'var(--shadow-md)' : 'none',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        transition: 'var(--transition)',
      }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', height: 'var(--header-h)', gap: '24px' }}>
            {/* Logo */}
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
              {settings.logo
                ? <img src={settings.logo} alt={settings.siteName} style={{ height: '56px', objectFit: 'contain' }} />
                : (
                  <div style={{
                    fontFamily: "Nunito, sans-serif",
                    fontSize: '36px',
                    fontWeight: '800',
                    background: 'linear-gradient(135deg, var(--charcoal), var(--gold))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-0.5px',
                  }}>
                    {settings.siteName || 'BENCADİ'}
                  </div>
                )}
            </Link>

            {/* Desktop Nav */}
            <nav style={{ flex: 1, alignItems: 'center', gap: '4px' }} className="desktop-nav">
              <Link to="/" style={{ padding: '8px 14px', borderRadius: 'var(--radius-md)', fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)', transition: 'var(--transition)' }}
                onMouseEnter={e => { e.target.style.background = 'var(--cream-dark)'; e.target.style.color = 'var(--charcoal)'; }}
                onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--text-secondary)'; }}>
                Accueil
              </Link>

              {/* Categories Dropdown */}
              <div ref={catRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setCatOpen(!catOpen)}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 14px', borderRadius: 'var(--radius-md)', fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)', background: catOpen ? 'var(--cream-dark)' : 'transparent', transition: 'var(--transition)', cursor: 'pointer' }}
                >
                  Catégories <ChevronDown size={15} style={{ transform: catOpen ? 'rotate(180deg)' : 'none', transition: 'var(--transition)' }} />
                </button>
                {catOpen && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    left: 0,
                    width: 'min(720px, calc(100vw - 48px))',
                    background: 'var(--white)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-xl)',
                    padding: '20px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                    gap: '8px',
                    animation: 'slideUp 0.2s ease',
                    zIndex: 200,
                  }}>
                    {categories.map(cat => (
                      <Link key={cat._id} to={`/categorie/${cat.slug}`}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', borderRadius: 'var(--radius-md)', transition: 'var(--transition)', fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--cream)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <CategoryIcon name={cat.icon} size={16} style={{ color: cat.color, flexShrink: 0 }} />
                        <span>{cat.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link to="/promos" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 14px', borderRadius: 'var(--radius-md)', fontSize: '14px', fontWeight: '500', color: '#e65100', transition: 'var(--transition)' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#fff3e0'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                <Flame size={14} /> Promos
              </Link>
              <Link to="/nouveautes" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 14px', borderRadius: 'var(--radius-md)', fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)', transition: 'var(--transition)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--cream-dark)'; e.currentTarget.style.color = 'var(--charcoal)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                <Sparkles size={14} /> Nouveautés
              </Link>
              <Link to="/a-propos" style={{ padding: '8px 14px', borderRadius: 'var(--radius-md)', fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)', transition: 'var(--transition)' }}
                onMouseEnter={e => { e.target.style.background = 'var(--cream-dark)'; e.target.style.color = 'var(--charcoal)'; }}
                onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--text-secondary)'; }}>
                À propos
              </Link>
              <Link to="/contact" style={{ padding: '8px 14px', borderRadius: 'var(--radius-md)', fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)', transition: 'var(--transition)' }}
                onMouseEnter={e => { e.target.style.background = 'var(--cream-dark)'; e.target.style.color = 'var(--charcoal)'; }}
                onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--text-secondary)'; }}>
                Contact
              </Link>
            </nav>

            {/* Right Icons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
              {/* Search */}
              <div ref={searchRef} style={{ position: 'relative' }}>
                <button className="btn-icon" onClick={() => setSearchOpen(!searchOpen)}
                  style={{ background: searchOpen ? 'var(--cream-dark)' : 'transparent', color: 'var(--text-primary)', transition: 'var(--transition)' }}>
                  <Search size={20} />
                </button>
                {searchOpen && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: 'min(420px, 90vw)',
                    background: 'var(--white)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-xl)',
                    padding: '16px',
                    animation: 'slideUp 0.2s ease',
                    zIndex: 200,
                  }}>
                    <form onSubmit={submitSearch} style={{ display: 'flex', gap: '8px' }}>
                      <input
                        autoFocus
                        className="form-input"
                        placeholder="Rechercher un produit..."
                        value={searchQuery}
                        onChange={e => handleSearch(e.target.value)}
                        style={{ flex: 1 }}
                      />
                      <button type="submit" className="btn btn-gold btn-sm">
                        <Search size={16} />
                      </button>
                    </form>
                    {suggestions.length > 0 && (
                      <div style={{ marginTop: '8px', borderTop: '1px solid var(--cream-dark)', paddingTop: '8px' }}>
                        {suggestions.map(p => (
                          <div key={p._id} onClick={() => handleSuggestionClick(p.slug)}
                            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'var(--transition)' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--cream)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <img src={p.mainImage || '/placeholder.png'} alt={p.name}
                              style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: '500' }}>{p.name}</div>
                              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{p.category?.name}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Wishlist — masqué sur mobile (disponible via menu) */}
              {user && (
                <Link to="/favoris" className="btn-icon header-desktop-only" style={{ color: 'var(--text-primary)', position: 'relative' }}>
                  <Heart size={20} />
                </Link>
              )}

              {/* Cart */}
              <button className="btn-icon" onClick={() => openCart(true)}
                style={{ color: 'var(--text-primary)', position: 'relative' }}>
                <ShoppingBag size={20} />
                {itemCount > 0 && (
                  <span style={{
                    position: 'absolute', top: '-2px', right: '-2px',
                    background: 'var(--gold)', color: 'var(--white)',
                    fontSize: '10px', fontWeight: '700',
                    width: '18px', height: '18px',
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{itemCount > 99 ? '99+' : itemCount}</span>
                )}
              </button>

              {/* User — masqué sur mobile (disponible via menu hamburger) */}
              {user ? (
                <div ref={userRef} style={{ position: 'relative' }} className="header-desktop-only">
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: 'var(--radius-full)', background: 'var(--cream-dark)', border: 'none', cursor: 'pointer', transition: 'var(--transition)' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#e4dfd5'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--cream-dark)'}
                  >
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--charcoal)', color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700' }}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '500', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.name.split(' ')[0]}
                    </span>
                    <ChevronDown size={14} />
                  </button>
                  {userMenuOpen && (
                    <div style={{
                      position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                      width: '200px', background: 'var(--white)',
                      borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)',
                      padding: '8px', animation: 'slideUp 0.2s ease', zIndex: 200,
                    }}>
                      <Link to="/profil" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: 'var(--radius-md)', fontSize: '14px', color: 'var(--text-primary)', transition: 'var(--transition)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--cream)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <User size={16} /> Mon profil
                      </Link>
                      <Link to="/profil?tab=orders" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: 'var(--radius-md)', fontSize: '14px', color: 'var(--text-primary)', transition: 'var(--transition)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--cream)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <Package size={16} /> Mes commandes
                      </Link>
                      <Link to="/favoris" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: 'var(--radius-md)', fontSize: '14px', color: 'var(--text-primary)', transition: 'var(--transition)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--cream)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <Heart size={16} /> Mes favoris
                      </Link>
                      {isAdmin && (
                        <>
                          <div style={{ height: '1px', background: 'var(--cream-dark)', margin: '4px 0' }} />
                          <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: 'var(--radius-md)', fontSize: '14px', color: 'var(--gold-dark)', fontWeight: '600', transition: 'var(--transition)' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--cream)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <Settings size={16} /> Administration
                          </Link>
                        </>
                      )}
                      <div style={{ height: '1px', background: 'var(--cream-dark)', margin: '4px 0' }} />
                      <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: 'var(--radius-md)', fontSize: '14px', color: 'var(--error)', width: '100%', transition: 'var(--transition)', background: 'none', border: 'none', cursor: 'pointer' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#fce4ec'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <LogOut size={16} /> Déconnexion
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="btn btn-primary btn-sm header-desktop-only" style={{ gap: '6px' }}>
                  <User size={15} /> Connexion
                </Link>
              )}

              {/* Mobile Burger */}
              <button className="btn-icon mobile-menu-btn"
                onClick={() => setMobileOpen(!mobileOpen)}
                style={{ color: 'var(--text-primary)' }}>
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileOpen && (
        <>
          <div className="overlay" onClick={() => setMobileOpen(false)} />
          <div style={{
            position: 'fixed', top: 0, left: 0, bottom: 0,
            width: '280px', background: 'var(--white)',
            zIndex: 1000, padding: '20px', overflowY: 'auto',
            animation: 'slideRight 0.3s ease',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <span style={{ fontFamily: "Nunito, sans-serif", fontSize: '22px', fontWeight: '800', background: 'linear-gradient(135deg, var(--charcoal), var(--gold))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {settings.siteName || 'BENCADİ'}
              </span>
              <button onClick={() => setMobileOpen(false)} className="btn-icon"><X size={20} /></button>
            </div>

            <form onSubmit={submitSearch} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              <input className="form-input" placeholder="Rechercher..." value={searchQuery} onChange={e => handleSearch(e.target.value)} style={{ flex: 1, fontSize: '14px' }} />
              <button type="submit" className="btn btn-gold btn-sm"><Search size={15} /></button>
            </form>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {[
                { to: '/', label: 'Accueil',           Icon: Package },
                { to: '/produits', label: 'Tous les produits', Icon: ShoppingBag },
                { to: '/promos', label: 'Promos',       Icon: Flame },
                { to: '/nouveautes', label: 'Nouveautés', Icon: Sparkles },
                { to: '/a-propos', label: 'À propos',   Icon: Info },
                { to: '/contact', label: 'Contact',     Icon: Mail },
              ].map(link => (
                <Link key={link.to} to={link.to}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: 'var(--radius-md)', fontSize: '15px', fontWeight: '500', color: 'var(--text-primary)', transition: 'var(--transition)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--cream)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <link.Icon size={16} style={{ color: 'var(--gold)', flexShrink: 0 }} />
                  {link.label}
                </Link>
              ))}

              <div style={{ marginTop: '8px', borderTop: '1px solid var(--cream-dark)', paddingTop: '8px' }}>
                <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', padding: '8px 16px' }}>Catégories</div>
                {categories.slice(0, 8).map(cat => (
                  <Link key={cat._id} to={`/categorie/${cat.slug}`}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', borderRadius: 'var(--radius-md)', fontSize: '14px', color: 'var(--text-secondary)', transition: 'var(--transition)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--cream)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <CategoryIcon name={cat.icon} size={15} style={{ color: cat.color, flexShrink: 0 }} /> {cat.name}
                  </Link>
                ))}
              </div>

              {/* Compte utilisateur dans le menu mobile */}
              <div style={{ marginTop: '8px', borderTop: '1px solid var(--cream-dark)', paddingTop: '8px' }}>
                {user ? (
                  <>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', padding: '8px 16px' }}>Mon compte</div>
                    <Link to="/profil" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: 'var(--radius-md)', fontSize: '15px', fontWeight: '500', color: 'var(--text-primary)', transition: 'var(--transition)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--cream)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <User size={16} style={{ color: 'var(--gold)', flexShrink: 0 }} /> Mon profil
                    </Link>
                    <Link to="/profil?tab=orders" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: 'var(--radius-md)', fontSize: '15px', fontWeight: '500', color: 'var(--text-primary)', transition: 'var(--transition)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--cream)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <Package size={16} style={{ color: 'var(--gold)', flexShrink: 0 }} /> Mes commandes
                    </Link>
                    <Link to="/favoris" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: 'var(--radius-md)', fontSize: '15px', fontWeight: '500', color: 'var(--text-primary)', transition: 'var(--transition)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--cream)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <Heart size={16} style={{ color: 'var(--gold)', flexShrink: 0 }} /> Mes favoris
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: 'var(--radius-md)', fontSize: '15px', fontWeight: '600', color: 'var(--gold-dark)', transition: 'var(--transition)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--cream)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <Settings size={16} style={{ color: 'var(--gold)', flexShrink: 0 }} /> Administration
                      </Link>
                    )}
                    <button onClick={() => { logout(); setMobileOpen(false); }}
                      style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: 'var(--radius-md)', fontSize: '15px', fontWeight: '500', color: 'var(--error)', width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', transition: 'var(--transition)' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fce4ec'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <LogOut size={16} style={{ flexShrink: 0 }} /> Déconnexion
                    </button>
                  </>
                ) : (
                  <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: 'var(--radius-md)', fontSize: '15px', fontWeight: '600', color: 'var(--charcoal)', transition: 'var(--transition)', background: 'var(--cream-dark)', margin: '4px 0' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#e4dfd5'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--cream-dark)'}>
                    <User size={16} style={{ color: 'var(--gold)', flexShrink: 0 }} /> Se connecter / S'inscrire
                  </Link>
                )}
              </div>
            </nav>
          </div>
        </>
      )}

    </>
  );
}
