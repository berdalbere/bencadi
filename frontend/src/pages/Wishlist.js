import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import ProductCard from '../components/ui/ProductCard';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

export default function Wishlist() {
  const { user } = useAuth();
  const wishlist = user?.wishlist || [];

  return (
    <div className="container" style={{ padding: '40px 24px', minHeight: '60vh' }}>
      <h1 style={{ fontFamily: "Nunito, sans-serif", fontSize: '32px', fontWeight: '700', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Heart size={28} style={{ color: '#e91e63' }} /> Mes Favoris
        <span style={{ fontSize: '16px', color: 'var(--text-muted)', fontFamily: 'Nunito' }}>({wishlist.length})</span>
      </h1>
      {wishlist.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
          <Heart size={64} style={{ opacity: 0.2, marginBottom: '16px', color: '#e91e63' }} />
          <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', color: 'var(--charcoal)' }}>Aucun favori</h3>
          <p style={{ marginBottom: '24px' }}>Explorez nos produits et ajoutez vos favoris !</p>
          <Link to="/produits" className="btn btn-gold">Découvrir les produits</Link>
        </div>
      ) : (
        <div className="grid-4">
          {wishlist.map(product => (
            <ProductCard key={product._id || product} product={typeof product === 'object' ? product : { _id: product }} />
          ))}
        </div>
      )}
    </div>
  );
}
