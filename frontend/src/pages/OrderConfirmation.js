// OrderConfirmation.js
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Package, Home } from 'lucide-react';
import { orderAPI } from '../utils/api';
import { useSettings } from '../context/SettingsContext';

export default function OrderConfirmation() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const { formatPrice } = useSettings();

  useEffect(() => {
    orderAPI.getOne(id).then(({ data }) => setOrder(data.order)).catch(() => {});
  }, [id]);

  return (
    <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px', textAlign: 'center' }}>
      <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-xl)', padding: '48px', maxWidth: '540px', width: '100%', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <CheckCircle size={44} style={{ color: '#22c55e' }} />
        </div>
        <h1 style={{ fontFamily: "Nunito, sans-serif", fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>Commande confirmée !</h1>
        {order && (
          <>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Commande <b>#{order.orderNumber}</b> passée avec succès.</p>
            <div style={{ background: 'var(--cream)', borderRadius: 'var(--radius-lg)', padding: '20px', marginBottom: '24px', textAlign: 'left' }}>
              {order.items?.map(item => (
                <div key={item._id} style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '10px' }}>
                  <img src={item.image} alt={item.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '14px', fontWeight: '500' }}>{item.name}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>×{item.quantity} — {formatPrice(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
              <div style={{ borderTop: '1px solid var(--cream-dark)', paddingTop: '10px', marginTop: '10px', display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '16px' }}>
                <span>Total</span><span style={{ color: 'var(--gold)' }}>{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </>
        )}
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
          Un email de confirmation vous a été envoyé. Nous traiterons votre commande dans les plus brefs délais.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/profil?tab=orders" className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Package size={15} /> Mes commandes
          </Link>
          <Link to="/" className="btn btn-gold btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Home size={15} /> Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
