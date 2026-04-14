import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';

export default function Cart() {
  const { items, removeItem, updateQuantity, subtotal, shippingCost, total, discount, coupon, removeCoupon, itemCount } = useCart();
  const { formatPrice } = useSettings();
  const navigate = useNavigate();

  if (items.length === 0) return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', padding: '60px 20px' }}>
      <ShoppingBag size={80} style={{ color: 'var(--cream-dark)', opacity: 0.5 }} />
      <h2 style={{ fontFamily: "Nunito, sans-serif", fontSize: '28px', fontWeight: '700' }}>Votre panier est vide</h2>
      <p style={{ color: 'var(--text-secondary)' }}>Découvrez nos produits et commencez vos achats !</p>
      <Link to="/produits" className="btn btn-gold btn-lg">Explorer la boutique</Link>
    </div>
  );

  return (
    <div className="container" style={{ padding: '40px 24px', minHeight: '70vh' }}>
      <h1 style={{ fontFamily: "Nunito, sans-serif", fontSize: '32px', fontWeight: '700', marginBottom: '32px' }}>
        Mon Panier <span style={{ fontSize: '18px', color: 'var(--text-muted)', fontFamily: 'Nunito' }}>({itemCount} article{itemCount > 1 ? 's' : ''})</span>
      </h1>
      <div className="layout-2col">
        {/* Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {items.map(item => (
            <div key={item.key} style={{ display: 'flex', gap: '16px', background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: '16px', boxShadow: 'var(--shadow-sm)' }}>
              <img src={item.product.mainImage} alt={item.product.name} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: 'var(--radius-md)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <Link to={`/produits/${item.product.slug}`} style={{ fontWeight: '600', fontSize: '16px', color: 'var(--charcoal)' }}>{item.product.name}</Link>
                {item.color && <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>Couleur: {item.color}</p>}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', border: '1.5px solid var(--cream-dark)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                    <button onClick={() => updateQuantity(item.key, item.quantity - 1)} style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)', border: 'none', cursor: 'pointer' }}><Minus size={13} /></button>
                    <span style={{ width: '40px', textAlign: 'center', fontWeight: '700', fontSize: '15px' }}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.key, item.quantity + 1)} style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)', border: 'none', cursor: 'pointer' }}><Plus size={13} /></button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontWeight: '700', fontSize: '18px' }}>{formatPrice(item.product.price * item.quantity)}</span>
                    <button onClick={() => removeItem(item.key)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', transition: 'var(--transition)' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--error)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-xl)', padding: '28px', boxShadow: 'var(--shadow-md)', position: 'sticky', top: '90px' }}>
          <h2 style={{ fontFamily: "Nunito, sans-serif", fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>Récapitulatif</h2>
          {coupon && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#e8f5e9', padding: '10px 12px', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2e7d32', fontSize: '13px' }}>
                <Tag size={13} /> Code: <b>{coupon.couponCode}</b>
              </div>
              <button onClick={removeCoupon} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2e7d32', fontSize: '18px' }}>×</button>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            {[
              { label: 'Sous-total', val: formatPrice(subtotal) },
              discount > 0 ? { label: 'Réduction', val: `-${formatPrice(discount)}`, color: '#22c55e' } : null,
              { label: 'Livraison', val: shippingCost === 0 ? 'Gratuite' : formatPrice(shippingCost), color: shippingCost === 0 ? '#22c55e' : undefined },
            ].filter(Boolean).map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: row.color || 'var(--text-secondary)' }}>
                <span>{row.label}</span><span>{row.val}</span>
              </div>
            ))}
            <div style={{ height: '1px', background: 'var(--cream-dark)', margin: '4px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: '700' }}>
              <span>Total</span><span style={{ color: 'var(--gold)' }}>{formatPrice(total)}</span>
            </div>
          </div>
          <button className="btn btn-gold" style={{ width: '100%', justifyContent: 'center', padding: '15px', fontSize: '16px' }} onClick={() => navigate('/commander')}>
            Commander <ArrowRight size={18} />
          </button>
          <Link to="/produits" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>
            ← Continuer mes achats
          </Link>
        </div>
      </div>
    </div>
  );
}
