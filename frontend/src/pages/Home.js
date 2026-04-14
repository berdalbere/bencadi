import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Truck, Shield, RotateCcw, Headphones, ChevronRight, Flame, Sparkles, Award, BadgePercent, Rocket } from 'lucide-react';
import { CategoryIcon } from '../utils/categoryIcons';
import { productAPI, categoryAPI, promoAPI } from '../utils/api';
import { useSettings } from '../context/SettingsContext';
import ProductCard from '../components/ui/ProductCard';

export default function Home() {
  const { settings, formatPrice } = useSettings();
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [promos, setPromos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  const heroSlides = [
    {
      title: 'Transformez votre intérieur',
      subtitle: 'Découvrez notre collection exclusive de meubles et décoration',
      bg: 'linear-gradient(135deg, #1e1e2e 0%, #2d2d3e 50%, #3a2a1a 100%)',
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
      btn: 'Explorer la collection',
      link: '/produits',
    },
    {
      title: 'Nos meilleures promos',
      subtitle: 'Jusqu\'à -40% sur une sélection de produits',
      bg: 'linear-gradient(135deg, #5c3d2e 0%, #8B4513 50%, #c9a84c 100%)',
      image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
      btn: 'Voir les promos',
      link: '/promos',
    },
    {
      title: 'Énergie & Confort',
      subtitle: 'Panneaux solaires, climatiseurs et groupes électrogènes',
      bg: 'linear-gradient(135deg, #1a2e1a 0%, #2d4a2d 50%, #4a7c4a 100%)',
      image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80',
      btn: 'Découvrir',
      link: '/categorie/energie-solaire',
    },
  ];

  useEffect(() => {
    const load = async () => {
      try {
        const [featRes, newRes, catRes] = await Promise.all([
          productAPI.getAll({ isFeatured: true, limit: 8 }),
          productAPI.getAll({ isNew: true, limit: 4 }),
          categoryAPI.getAll(),
        ]);
        setFeatured(featRes.data.products || []);
        setNewArrivals(newRes.data.products || []);
        setCategories(catRes.data.categories || []);
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  // Auto-rotate hero
  useEffect(() => {
    const t = setInterval(() => setActiveSlide(p => (p + 1) % heroSlides.length), 5000);
    return () => clearInterval(t);
  }, []);

  const slide = heroSlides[activeSlide];

  return (
    <div>
      {/* HERO */}
      <section style={{ position: 'relative', minHeight: 'clamp(60vh, 85vh, 95vh)', display: 'flex', alignItems: 'center', overflow: 'hidden', background: slide.bg, transition: 'background 0.8s ease' }}>
        {/* Background image */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          <img src={slide.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.25, transition: 'opacity 0.5s ease' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.7) 40%, transparent)' }} />
        </div>

        {/* Content */}
        <div className="container hero-content">
          <div style={{ maxWidth: '560px' }}>
            <span className="hero-badge">
              {settings.siteName || 'BENCADİ'}
            </span>
            <h1 className="hero-title">
              {slide.title}
            </h1>
            <p className="hero-subtitle">
              {slide.subtitle}
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link to={slide.link} className="btn btn-gold btn-lg">
                {slide.btn} <ArrowRight size={18} />
              </Link>
              <Link to="/produits" className="btn hero-btn-secondary">
                Voir tout
              </Link>
            </div>
          </div>
        </div>

        {/* Slide dots */}
        <div style={{ position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px' }}>
          {heroSlides.map((_, i) => (
            <button key={i} onClick={() => setActiveSlide(i)}
              style={{ width: i === activeSlide ? '24px' : '8px', height: '8px', borderRadius: '4px', background: i === activeSlide ? 'var(--gold)' : 'rgba(255,255,255,0.4)', border: 'none', cursor: 'pointer', transition: 'var(--transition)' }} />
          ))}
        </div>
      </section>

      {/* TRUST BADGES */}
      <section style={{ background: 'var(--charcoal)', padding: '20px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '32px' }}>
            {[
              { Icon: Truck, label: 'Livraison rapide', desc: 'Gratuite dès 100 000 FCFA' },
              { Icon: Shield, label: 'Paiement sécurisé', desc: 'Transactions protégées' },
              { Icon: RotateCcw, label: 'Retour 30 jours', desc: 'Satisfait ou remboursé' },
              { Icon: Headphones, label: 'Support 7j/7', desc: 'À votre service' },
            ].map(({ Icon, label, desc }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--white)' }}>
                <Icon size={28} style={{ color: 'var(--gold)', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600' }}>{label}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section style={{ padding: 'clamp(40px,8vw,80px) 0 clamp(20px,4vw,40px)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 className="section-title">Nos catégories</h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: '16px', fontSize: '16px' }}>Explorez notre large sélection d'équipements</p>
            </div>
            <Link to="/produits" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--gold)', fontWeight: '600', fontSize: '14px', transition: 'var(--transition)' }}
              onMouseEnter={e => e.currentTarget.style.gap = '8px'}
              onMouseLeave={e => e.currentTarget.style.gap = '4px'}>
              Voir tout <ChevronRight size={16} />
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '16px' }}>
            {categories.map(cat => (
              <Link key={cat._id} to={`/categorie/${cat.slug}`}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
                  padding: '20px 12px',
                  background: 'var(--white)', borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-sm)', textAlign: 'center',
                  transition: 'var(--transition)', textDecoration: 'none',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.borderColor = 'var(--gold)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}>
                <div style={{ width: '52px', height: '52px', borderRadius: 'var(--radius-md)', background: `${cat.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CategoryIcon name={cat.icon} size={28} style={{ color: cat.color }} />
                </div>
                <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', lineHeight: 1.3 }}>{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section style={{ padding: 'clamp(32px,6vw,60px) 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 className="section-title">Produits vedettes</h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: '16px', fontSize: '16px' }}>Une sélection de nos meilleurs articles</p>
            </div>
            <Link to="/produits?isFeatured=true" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--gold)', fontWeight: '600', fontSize: '14px' }}>
              Voir tout <ChevronRight size={16} />
            </Link>
          </div>
          {loading ? (
            <div className="grid-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                  <div className="skeleton" style={{ paddingBottom: '80%' }} />
                  <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div className="skeleton" style={{ height: '14px', width: '60%' }} />
                    <div className="skeleton" style={{ height: '16px' }} />
                    <div className="skeleton" style={{ height: '20px', width: '40%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid-4">
              {featured.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* PROMO BANNER */}
      <section style={{ padding: '20px 0 60px' }}>
        <div className="container">
          <div style={{
            background: 'linear-gradient(135deg, var(--charcoal) 0%, #2d2d3e 40%, #3a2a1a 100%)',
            borderRadius: 'var(--radius-xl)',
            padding: 'clamp(32px, 5vw, 60px)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '24px',
            overflow: 'hidden', position: 'relative',
          }}>
            <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(201,168,76,0.12)' }} />
            <div style={{ position: 'absolute', bottom: '-60px', right: '200px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(201,168,76,0.06)' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(201,168,76,0.2)', color: 'var(--gold-light)', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                <Flame size={13} /> Offre limitée
              </span>
              <h2 style={{ fontFamily: "Nunito, sans-serif", fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: '800', color: 'var(--white)', marginBottom: '8px' }}>
                Jusqu'à <span style={{ color: 'var(--gold)' }}>40% de réduction</span>
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '16px' }}>Sur une sélection exclusive de produits — offre valable cette semaine</p>
            </div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <Link to="/promos" className="btn btn-gold btn-lg">
                Profiter des promos <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS */}
      {newArrivals.length > 0 && (
        <section style={{ padding: '0 0 clamp(40px,8vw,80px)' }}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Sparkles size={22} style={{ color: 'var(--gold)' }} /> Nouveautés</h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: '16px', fontSize: '16px' }}>Les derniers arrivages dans notre boutique</p>
              </div>
              <Link to="/nouveautes" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--gold)', fontWeight: '600', fontSize: '14px' }}>
                Voir tout <ChevronRight size={16} />
              </Link>
            </div>
            <div className="grid-4">
              {newArrivals.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* WHY US */}
      <section style={{ background: 'var(--cream-dark)', padding: 'clamp(40px,8vw,80px) 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 className="section-title" style={{ display: 'block', textAlign: 'center' }}>Pourquoi choisir {settings.siteName || 'BENCADİ'} ?</h2>
            <div style={{ width: '60px', height: '3px', background: 'var(--gold)', margin: '16px auto 0', borderRadius: '2px' }} />
          </div>
          <div className="grid-4">
            {[
              { Icon: Award,        title: 'Qualité garantie', desc: 'Tous nos produits sont soigneusement sélectionnés pour leur durabilité et leur qualité.' },
              { Icon: BadgePercent, title: 'Prix compétitifs', desc: 'Des tarifs transparents et compétitifs, sans frais cachés.' },
              { Icon: Rocket,       title: 'Livraison rapide', desc: 'Expédition sous 24h, livraison à domicile sur tout le territoire.' },
              { Icon: Headphones,   title: 'SAV réactif',      desc: 'Une équipe dédiée disponible 7j/7 pour vous accompagner.' },
            ].map(item => (
              <div key={item.title} style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: '32px 24px', textAlign: 'center', boxShadow: 'var(--shadow-sm)', transition: 'var(--transition)' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}>
                <div style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-lg)', background: 'rgba(201,168,76,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <item.Icon size={32} style={{ color: 'var(--gold)' }} />
                </div>
                <h3 style={{ fontFamily: "Nunito, sans-serif", fontSize: '18px', fontWeight: '700', marginBottom: '10px' }}>{item.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
