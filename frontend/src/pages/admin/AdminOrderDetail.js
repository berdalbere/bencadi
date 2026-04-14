import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Check, Truck, Package, Clock, XCircle } from 'lucide-react';
import { orderAPI } from '../../utils/api';
import { useSettings } from '../../context/SettingsContext';
import toast from 'react-hot-toast';

const STATUS_FLOW = [
  { key: 'pending',    label: 'En attente',  Icon: Clock,    color: '#e65100' },
  { key: 'confirmed',  label: 'Confirmée',   Icon: Check,    color: '#1565c0' },
  { key: 'processing', label: 'En cours',    Icon: Package,  color: '#6a1b9a' },
  { key: 'shipped',    label: 'Expédiée',    Icon: Truck,    color: '#00695c' },
  { key: 'delivered',  label: 'Livrée',      Icon: Check,    color: '#1b5e20' },
];

const STATUS_COLORS = {
  pending:    { bg: '#fff3e0', color: '#e65100' },
  confirmed:  { bg: '#e3f2fd', color: '#1565c0' },
  processing: { bg: '#f3e5f5', color: '#6a1b9a' },
  shipped:    { bg: '#e0f2f1', color: '#00695c' },
  delivered:  { bg: '#e8f5e9', color: '#1b5e20' },
  cancelled:  { bg: '#fce4ec', color: '#c62828' },
};

export default function AdminOrderDetail() {
  const { id } = useParams();
  const { formatPrice } = useSettings();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    orderAPI.getOne(id)
      .then(({ data }) => { setOrder(data.order); setNewStatus(data.order.status); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdateStatus = async () => {
    if (!newStatus || newStatus === order.status) return;
    setUpdating(true);
    try {
      await orderAPI.updateStatus(id, { status: newStatus, note });
      toast.success('Statut mis à jour !');
      const { data } = await orderAPI.getOne(id);
      setOrder(data.order);
      setNote('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur.');
    } finally { setUpdating(false); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="spinner" /></div>;
  if (!order) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Commande introuvable.</div>;

  const st = STATUS_COLORS[order.status] || { bg: 'var(--cream)', color: 'var(--text-muted)' };
  const currentIdx = STATUS_FLOW.findIndex(s => s.key === order.status);
  const payLabels = { cash_on_delivery: 'Paiement à la livraison', mobile_money: 'Mobile Money', bank_transfer: 'Virement bancaire' };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <Link to="/admin/commandes" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '13px' }}>
          <ArrowLeft size={16} /> Retour
        </Link>
        <h1 style={{ fontFamily: "Nunito, sans-serif", fontSize: '22px', fontWeight: '700' }}>
          Commande #{order.orderNumber}
        </h1>
        <span style={{ padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: '700', background: st.bg, color: st.color }}>
          {STATUS_FLOW.find(s => s.key === order.status)?.label || order.status}
        </span>
      </div>

      {/* Progress bar */}
      {order.status !== 'cancelled' && (
        <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-xl)', padding: '24px', boxShadow: 'var(--shadow-sm)', marginBottom: '24px', overflowX: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', minWidth: '400px' }}>
            {STATUS_FLOW.map((s, i) => {
              const done = i <= currentIdx;
              return (
                <div key={s.key} style={{ display: 'flex', alignItems: 'center', flex: i < STATUS_FLOW.length - 1 ? 1 : 'none' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: done ? s.color : 'var(--cream-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'var(--transition)' }}>
                      <s.Icon size={16} style={{ color: done ? 'var(--white)' : 'var(--text-muted)' }} />
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: done ? '700' : '400', color: done ? s.color : 'var(--text-muted)', whiteSpace: 'nowrap' }}>{s.label}</span>
                  </div>
                  {i < STATUS_FLOW.length - 1 && (
                    <div style={{ flex: 1, height: '3px', background: i < currentIdx ? s.color : 'var(--cream-dark)', margin: '0 4px', marginBottom: '20px', transition: 'var(--transition)', borderRadius: '2px' }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="layout-admin-form">
        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Items */}
          <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-xl)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontFamily: "Nunito, sans-serif", fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Articles commandés</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {order.items?.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '10px', background: 'var(--cream)', borderRadius: 'var(--radius-md)' }}>
                  <img src={item.image || '/placeholder.png'} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '600', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                    {item.color && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Couleur: {item.color}</div>}
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>×{item.quantity} — {formatPrice(item.price)} / unité</div>
                  </div>
                  <div style={{ fontWeight: '700', fontSize: '15px', flexShrink: 0 }}>{formatPrice(item.price * item.quantity)}</div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div style={{ borderTop: '1px solid var(--cream-dark)', marginTop: '16px', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { label: 'Sous-total', val: formatPrice(order.subtotal || order.totalAmount) },
                { label: 'Livraison', val: order.shippingCost === 0 ? 'Gratuite' : formatPrice(order.shippingCost) },
                order.discount > 0 ? { label: 'Réduction', val: `-${formatPrice(order.discount)}`, color: '#22c55e' } : null,
              ].filter(Boolean).map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: row.color || 'var(--text-secondary)' }}>
                  <span>{row.label}</span><span>{row.val}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '17px', fontWeight: '700', paddingTop: '8px', borderTop: '1px solid var(--cream-dark)' }}>
                <span>Total</span><span style={{ color: 'var(--gold)' }}>{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Status history */}
          {order.statusHistory?.length > 0 && (
            <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-xl)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontFamily: "Nunito, sans-serif", fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Historique</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[...order.statusHistory].reverse().map((h, i) => {
                  const sc = STATUS_COLORS[h.status] || { bg: 'var(--cream)', color: 'var(--text-muted)' };
                  return (
                    <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '11px', fontWeight: '700', background: sc.bg, color: sc.color, flexShrink: 0, marginTop: '1px' }}>
                        {STATUS_FLOW.find(s => s.key === h.status)?.label || h.status}
                      </span>
                      <div>
                        {h.note && <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '2px' }}>{h.note}</p>}
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {new Date(h.date).toLocaleString('fr-FR')} · par {h.updatedBy?.name || 'Système'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Update Status */}
          <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-xl)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontFamily: "Nunito, sans-serif", fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Mettre à jour le statut</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <select className="form-input form-select" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                {[...STATUS_FLOW, { key: 'cancelled', label: 'Annulée' }].map(s => (
                  <option key={s.key} value={s.key}>{s.label}</option>
                ))}
              </select>
              <textarea className="form-input" placeholder="Note interne (optionnel)" value={note} onChange={e => setNote(e.target.value)} style={{ minHeight: '70px', resize: 'vertical', fontSize: '13px' }} />
              <button className="btn btn-gold" onClick={handleUpdateStatus} disabled={updating || newStatus === order.status} style={{ justifyContent: 'center' }}>
                {updating ? 'Mise à jour...' : 'Valider le statut'}
              </button>
            </div>
          </div>

          {/* Customer info */}
          <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-xl)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontFamily: "Nunito, sans-serif", fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Client</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
              <div><span style={{ color: 'var(--text-muted)' }}>Nom:</span> <b>{order.user?.name || order.guestName}</b></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Email:</span> {order.user?.email || order.guestEmail || '—'}</div>
              <div><span style={{ color: 'var(--text-muted)' }}>Tél.:</span> {order.shippingAddress?.phone || '—'}</div>
              <div><span style={{ color: 'var(--text-muted)' }}>Paiement:</span> {payLabels[order.paymentMethod] || order.paymentMethod}</div>
            </div>
          </div>

          {/* Shipping */}
          <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-xl)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontFamily: "Nunito, sans-serif", fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Adresse de livraison</h3>
            {order.shippingAddress ? (
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                {order.shippingAddress.street}<br />
                {order.shippingAddress.city}{order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ''}<br />
                {order.shippingAddress.country}
              </div>
            ) : <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>—</p>}
            {order.notes && (
              <div style={{ marginTop: '12px', padding: '10px', background: 'var(--cream)', borderRadius: 'var(--radius-md)', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <b>Note:</b> {order.notes}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
