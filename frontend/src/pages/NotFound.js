import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
export default function NotFound() {
  return (
    <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center' }}>
      <Home size={80} style={{ color: 'var(--cream-dark)', marginBottom: '20px', opacity: 0.6 }} />
      <h1 style={{ fontFamily: "Nunito, sans-serif", fontSize: '80px', fontWeight: '800', color: 'var(--cream-dark)', marginBottom: '0', lineHeight: 1 }}>404</h1>
      <h2 style={{ fontFamily: "Nunito, sans-serif", fontSize: '24px', fontWeight: '700', marginBottom: '12px' }}>Page introuvable</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', maxWidth: '400px' }}>La page que vous cherchez n'existe pas ou a été déplacée.</p>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link to="/" className="btn btn-gold">← Retour à l'accueil</Link>
        <Link to="/produits" className="btn btn-outline">Voir les produits</Link>
      </div>
    </div>
  );
}
