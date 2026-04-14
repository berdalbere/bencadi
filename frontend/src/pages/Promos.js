import { useState, useEffect } from 'react';
import { productAPI } from '../utils/api';
import ProductCard from '../components/ui/ProductCard';
import { Flame, ShoppingBag } from 'lucide-react';

export default function Promos() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productAPI.getAll({ isPromo: true, limit: 24 }).then(({ data }) => {
      setProducts(data.products || []);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: '80vh' }}>
      <div style={{ background: 'linear-gradient(135deg, #e65100, #f57c00)', padding: '60px 0', textAlign: 'center', color: 'var(--white)' }}>
        <Flame size={48} style={{ display: 'block', margin: '0 auto 12px', color: 'var(--white)' }} />
        <h1 style={{ fontFamily: "Nunito, sans-serif", fontSize: 'clamp(28px,5vw,48px)', fontWeight: '800', marginBottom: '12px' }}>Promotions en cours</h1>
        <p style={{ fontSize: '18px', opacity: 0.9 }}>Des offres exceptionnelles sur une sélection de produits</p>
      </div>
      <div className="container" style={{ padding: '48px 24px' }}>
        {loading ? (
          <div className="grid-4">{[...Array(8)].map((_, i) => <div key={i} className="skeleton" style={{ aspectRatio: '0.8', borderRadius: 'var(--radius-lg)' }} />)}</div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
            <ShoppingBag size={64} style={{ opacity: 0.3, marginBottom: '16px' }} />
            <h2 style={{ fontSize: '22px', marginBottom: '8px', color: 'var(--charcoal)' }}>Aucune promo disponible</h2>
            <p>Revenez bientôt pour découvrir nos offres.</p>
          </div>
        ) : (
          <div className="grid-4">{products.map(p => <ProductCard key={p._id} product={p} />)}</div>
        )}
      </div>
    </div>
  );
}
