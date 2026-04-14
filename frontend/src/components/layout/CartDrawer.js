import { Link, useNavigate } from 'react-router-dom';
import { X, Plus, Minus, Trash2, ShoppingBag, Tag } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useSettings } from '../../context/SettingsContext';
import { promoAPI } from '../../utils/api';
import toast from 'react-hot-toast';

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, subtotal, shippingCost, total, discount, itemCount, coupon, applyCoupon, removeCoupon } = useCart();
  const { formatPrice } = useSettings();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const { data } = await promoAPI.validateCoupon({ code: couponCode, cartTotal: subtotal });
      applyCoupon(data.promo, data.discount);
      setCouponCode('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Code promo invalide.');
    } finally {
      setCouponLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="overlay" onClick={() => setIsOpen(false)} />
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(420px, 100vw)',
        background: 'var(--white)', zIndex: 1000, display: 'flex', flexDirection: 'column',
        animation: 'slideRight 0.3s ease',
        boxShadow: '-8px 0 32px rgba(0,0,0,0.15)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--cream-dark)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingBag size={22} style={{ color: 'var(--gold)' }} />
            <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Mon Panier</h2>
            {itemCount > 0 && (
              <span style={{ background: 'var(--gold)', color: 'var(--white)', borderRadius: 'var(--radius-full)', padding: '2px 8px', fontSize: '12px', fontWeight: '700' }}>
                {itemCount}
              </span>
            )}
          </div>
          <button className="btn-icon" onClick={() => setIsOpen(false)}><X size={20} /></button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {items.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60%', gap: '16px', color: 'var(--text-muted)' }}>
              <ShoppingBag size={60} style={{ opacity: 0.3 }} />
              <p style={{ fontSize: '16px', fontWeight: '500' }}>Votre panier est vide</p>
              <button className="btn btn-gold btn-sm" onClick={() => { setIsOpen(false); navigate('/produits'); }}>
                Découvrir nos produits
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {items.map(item => (
                <div key={item.key} style={{ display: 'flex', gap: '12px', padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--cream)', position: 'relative' }}>
                  <img src={item.product.mainImage || '/placeholder.png'} alt={item.product.name}
                    style={{ width: '72px', height: '72px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link to={`/produits/${item.product.slug}`} onClick={() => setIsOpen(false)}
                      style={{ fontSize: '14px', fontWeight: '600', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.product.name}
                    </Link>
                    {item.color && <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{item.color}</p>}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                      <span style={{ fontWeight: '700', fontSize: '15px', color: 'var(--charcoal)' }}>
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <button style={{ width: '26px', height: '26px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--cream-dark)', background: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'var(--transition)' }}
                          onClick={() => updateQuantity(item.key, item.quantity - 1)}>
                          <Minus size={12} />
                        </button>
                        <span style={{ width: '28px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>{item.quantity}</span>
                        <button style={{ width: '26px', height: '26px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--cream-dark)', background: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'var(--transition)' }}
                          onClick={() => updateQuantity(item.key, item.quantity + 1)}>
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => removeItem(item.key)}
                    style={{ position: 'absolute', top: '8px', right: '8px', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', transition: 'var(--transition)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--error)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--cream-dark)' }}>
            {/* Coupon */}
            {coupon ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#e8f5e9', borderRadius: 'var(--radius-md)', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2e7d32', fontSize: '13px' }}>
                  <Tag size={14} /> Code: <b>{coupon.couponCode}</b> — -{formatPrice(discount)}
                </div>
                <button onClick={removeCoupon} style={{ color: '#2e7d32', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>×</button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <input className="form-input" placeholder="Code promo" value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  style={{ flex: 1, fontSize: '13px', padding: '9px 12px' }} />
                <button className="btn btn-outline btn-sm" onClick={handleValidateCoupon} disabled={couponLoading} style={{ flexShrink: 0 }}>
                  {couponLoading ? '...' : 'Appliquer'}
                </button>
              </div>
            )}

            {/* Summary */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--text-secondary)' }}>
                <span>Sous-total</span><span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#22c55e' }}>
                  <span>Réduction</span><span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--text-secondary)' }}>
                <span>Livraison</span>
                <span style={{ color: shippingCost === 0 ? '#22c55e' : undefined }}>
                  {shippingCost === 0 ? 'Gratuite' : formatPrice(shippingCost)}
                </span>
              </div>
              <div style={{ height: '1px', background: 'var(--cream-dark)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '17px', fontWeight: '700' }}>
                <span>Total</span><span style={{ color: 'var(--gold)' }}>{formatPrice(total)}</span>
              </div>
            </div>

            <button className="btn btn-gold" style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
              onClick={() => { setIsOpen(false); navigate('/commander'); }}>
              Commander maintenant →
            </button>
            <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', marginTop: '8px', fontSize: '13px' }}
              onClick={() => { setIsOpen(false); navigate('/panier'); }}>
              Voir le panier détaillé
            </button>
          </div>
        )}
      </div>
    </>
  );
}
