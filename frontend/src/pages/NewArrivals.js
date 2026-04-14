import { useState, useEffect } from 'react';
import { productAPI } from '../utils/api';
import ProductCard from '../components/ui/ProductCard';
import { Sparkles } from 'lucide-react';

export default function NewArrivals() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    productAPI.getAll({ isNew: true, limit: 24 }).then(({ data }) => setProducts(data.products || [])).finally(() => setLoading(false));
  }, []);
  return (
    <div style={{ minHeight: '80vh' }}>
      <div style={{ background: 'linear-gradient(135deg, var(--charcoal), #2d2d3e)', padding: '60px 0', textAlign: 'center', color: 'var(--white)' }}>
        <Sparkles size={48} style={{ display: 'block', margin: '0 auto 12px', color: 'var(--white)' }} />
        <h1 style={{ fontFamily: "Nunito, sans-serif", fontSize: 'clamp(28px,5vw,48px)', fontWeight: '800', marginBottom: '12px' }}>Nouveautés</h1>
        <p style={{ fontSize: '18px', opacity: 0.8 }}>Découvrez les derniers arrivages de notre boutique</p>
      </div>
      <div className="container" style={{ padding: '48px 24px' }}>
        {loading ? (
          <div className="grid-4">{[...Array(8)].map((_, i) => <div key={i} className="skeleton" style={{ aspectRatio: '0.8', borderRadius: 'var(--radius-lg)' }} />)}</div>
        ) : (
          <div className="grid-4">{products.map(p => <ProductCard key={p._id} product={p} />)}</div>
        )}
      </div>
    </div>
  );
}
