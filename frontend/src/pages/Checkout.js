import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { orderAPI } from '../utils/api';
import { Check, Truck, CreditCard, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Checkout() {
  const { items, subtotal, shippingCost, total, discount, clearCart, coupon } = useCart();
  const { user } = useAuth();
  const { formatPrice } = useSettings();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [shipping, setShipping] = useState({
    name: user?.name || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    country: user?.address?.country || 'Cameroun',
    zip: user?.address?.zip || '',
    phone: user?.phone || '',
  });
  const [guestEmail, setGuestEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  const [notes, setNotes] = useState('');

  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <p style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>Votre panier est vide.</p>
        <Link to="/produits" className="btn btn-gold">Voir les produits</Link>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    if (!shipping.name || !shipping.street || !shipping.city || !shipping.phone) {
      toast.error('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    if (!user && !guestEmail) {
      toast.error('Veuillez entrer votre email.');
      return;
    }
    setLoading(true);
    try {
      const orderData = {
        items: items.map(i => ({ product: i.product._id, quantity: i.quantity })),
        shippingAddress: shipping,
        paymentMethod,
        notes,
      };
      if (!user) { orderData.guestEmail = guestEmail; orderData.guestName = shipping.name; }
      const { data } = await orderAPI.create(orderData);
      clearCart();
      toast.success('Commande passée avec succès !');
      navigate(`/commande-confirmee/${data.order._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la commande.');
    } finally { setLoading(false); }
  };

  const stepStyle = (n) => ({
    width: '32px', height: '32px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '14px', fontWeight: '700',
    background: step >= n ? 'var(--charcoal)' : 'var(--cream-dark)',
    color: step >= n ? 'var(--white)' : 'var(--text-muted)',
    flexShrink: 0,
  });

  const payMethods = [
    { key: 'cash_on_delivery', label: 'Paiement à la livraison', Icon: Truck, desc: 'Payez en espèces à la réception' },
    { key: 'mobile_money', label: 'Mobile Money', Icon: Smartphone, desc: 'MTN Money, Orange Money, etc.' },
    { key: 'bank_transfer', label: 'Virement bancaire', Icon: CreditCard, desc: 'Paiement par virement' },
  ];

  return (
    <div className="container" style={{ padding: '40px 24px', minHeight: '80vh' }}>
      <h1 style={{ fontFamily: "Nunito, sans-serif", fontSize: '28px', fontWeight: '700', marginBottom: '32px' }}>Passer la commande</h1>

      {/* Steps */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '36px', overflowX: 'auto' }}>
        {[{ n: 1, label: 'Livraison' }, { n: 2, label: 'Paiement' }, { n: 3, label: 'Confirmation' }].map(({ n, label }, i) => (
          <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={stepStyle(n)}>{step > n ? <Check size={14} /> : n}</div>
              <span style={{ fontSize: '14px', fontWeight: '500', color: step >= n ? 'var(--charcoal)' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>{label}</span>
            </div>
            {i < 2 && <div style={{ flex: 1, height: '2px', background: step > n ? 'var(--gold)' : 'var(--cream-dark)', minWidth: '32px', transition: 'var(--transition)' }} />}
          </div>
        ))}
      </div>

      <div className="layout-2col">
        {/* Form */}
        <div>
          {step === 1 && (
            <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-xl)', padding: '28px', boxShadow: 'var(--shadow-sm)' }}>
              <h2 style={{ fontFamily: "Nunito, sans-serif", fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>Adresse de livraison</h2>
              {!user && (
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">Email <span style={{ color: 'var(--error)' }}>*</span></label>
                  <input className="form-input" type="email" placeholder="Pour le suivi de commande" value={guestEmail} onChange={e => setGuestEmail(e.target.value)} />
                </div>
              )}
              <div className="form-grid-2">
                {[
                  { key: 'name', label: 'Nom complet *', ph: 'Votre nom', full: true },
                  { key: 'phone', label: 'Téléphone *', ph: '+237 6XX XXX XXX', full: true },
                  { key: 'street', label: 'Adresse *', ph: 'Rue, quartier...', full: true },
                  { key: 'city', label: 'Ville *', ph: 'Votre ville' },
                  { key: 'state', label: 'Région', ph: 'Centre, Littoral...' },
                  { key: 'country', label: 'Pays', ph: 'Cameroun' },
                ].map(f => (
                  <div key={f.key} className="form-group" style={f.full ? { gridColumn: 'span 2' } : {}}>
                    <label className="form-label">{f.label}</label>
                    <input className="form-input" placeholder={f.ph} value={shipping[f.key]} onChange={e => setShipping(s => ({ ...s, [f.key]: e.target.value }))} />
                  </div>
                ))}
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Notes de commande <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optionnel)</span></label>
                  <textarea className="form-input" placeholder="Instructions de livraison, étage, code..." value={notes} onChange={e => setNotes(e.target.value)} style={{ minHeight: '80px', resize: 'vertical' }} />
                </div>
              </div>
              <button className="btn btn-gold" style={{ marginTop: '20px', padding: '14px 32px' }} onClick={() => setStep(2)}>
                Continuer vers le paiement →
              </button>
            </div>
          )}

          {step === 2 && (
            <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-xl)', padding: '28px', boxShadow: 'var(--shadow-sm)' }}>
              <h2 style={{ fontFamily: "Nunito, sans-serif", fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>Mode de paiement</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                {payMethods.map(m => (
                  <label key={m.key} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', borderRadius: 'var(--radius-lg)', border: `2px solid ${paymentMethod === m.key ? 'var(--gold)' : 'var(--cream-dark)'}`, background: paymentMethod === m.key ? 'rgba(201,168,76,0.06)' : 'transparent', cursor: 'pointer', transition: 'var(--transition)' }}>
                    <input type="radio" name="payment" value={m.key} checked={paymentMethod === m.key} onChange={e => setPaymentMethod(e.target.value)} style={{ accentColor: 'var(--gold)' }} />
                    <m.Icon size={22} style={{ color: 'var(--gold)', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '15px' }}>{m.label}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{m.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn btn-outline" onClick={() => setStep(1)}>← Retour</button>
                <button className="btn btn-gold" style={{ padding: '14px 32px' }} onClick={() => setStep(3)}>Vérifier la commande →</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-xl)', padding: '28px', boxShadow: 'var(--shadow-sm)' }}>
              <h2 style={{ fontFamily: "Nunito, sans-serif", fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>Vérification</h2>
              <div className="form-grid-2" style={{ marginBottom: '24px' }}>
                <div style={{ background: 'var(--cream)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
                  <h4 style={{ fontWeight: '700', fontSize: '14px', marginBottom: '8px' }}>Livraison</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {shipping.name}<br />{shipping.street}<br />{shipping.city}, {shipping.state}<br />{shipping.country}<br />{shipping.phone}
                  </p>
                </div>
                <div style={{ background: 'var(--cream)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
                  <h4 style={{ fontWeight: '700', fontSize: '14px', marginBottom: '8px' }}>Paiement</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {payMethods.find(m => m.key === paymentMethod)?.label}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn btn-outline" onClick={() => setStep(2)}>← Retour</button>
                <button className="btn btn-gold" style={{ padding: '14px 32px', flex: 1, justifyContent: 'center' }} onClick={handlePlaceOrder} disabled={loading}>
                  {loading ? 'Traitement...' : '✓ Confirmer la commande'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-xl)', padding: '24px', boxShadow: 'var(--shadow-md)', position: 'sticky', top: '90px' }}>
          <h3 style={{ fontFamily: "Nunito, sans-serif", fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Votre commande</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
            {items.map(item => (
              <div key={item.key} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <img src={item.product.mainImage} alt={item.product.name} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '13px', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.product.name}</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>×{item.quantity}</p>
                </div>
                <span style={{ fontSize: '13px', fontWeight: '600', flexShrink: 0 }}>{formatPrice(item.product.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid var(--cream-dark)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <span>Sous-total</span><span>{formatPrice(subtotal)}</span>
            </div>
            {discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#22c55e' }}><span>Réduction</span><span>-{formatPrice(discount)}</span></div>}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <span>Livraison</span><span style={{ color: shippingCost === 0 ? '#22c55e' : undefined }}>{shippingCost === 0 ? 'Gratuite' : formatPrice(shippingCost)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '700', paddingTop: '8px', borderTop: '1px solid var(--cream-dark)' }}>
              <span>Total</span><span style={{ color: 'var(--gold)' }}>{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
