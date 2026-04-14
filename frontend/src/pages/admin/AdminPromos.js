import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';
import { promoAPI } from '../../utils/api';
import { useSettings } from '../../context/SettingsContext';
import toast from 'react-hot-toast';

const init = { type: 'coupon', title: '', couponCode: '', discountType: 'percentage', discountValue: '', minPurchase: 0, maxUsage: 0, startDate: '', endDate: '', isActive: true, order: 0 };

export default function AdminPromos() {
  const { formatPrice } = useSettings();
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(init);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try { const { data } = await promoAPI.getAll(); setPromos(data.promos || []); } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(init); setShowModal(true); };
  const openEdit = (p) => {
    setEditing(p);
    const toDate = (d) => d ? new Date(d).toISOString().slice(0, 10) : '';
    setForm({ ...p, startDate: toDate(p.startDate), endDate: toDate(p.endDate) });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title || !form.startDate || !form.endDate || !form.discountValue) { toast.error('Remplissez tous les champs requis.'); return; }
    setSaving(true);
    try {
      const payload = { ...form, discountValue: Number(form.discountValue), minPurchase: Number(form.minPurchase), maxUsage: Number(form.maxUsage) };
      if (editing) { await promoAPI.update(editing._id, payload); toast.success('Promotion mise à jour.'); }
      else { await promoAPI.create(payload); toast.success('Promotion créée.'); }
      setShowModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette promotion ?')) return;
    await promoAPI.delete(id); toast.success('Promotion supprimée.'); load();
  };

  const isLive = (p) => {
    const now = new Date();
    return p.isActive && new Date(p.startDate) <= now && new Date(p.endDate) >= now;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontFamily: "Nunito, sans-serif", fontSize: '24px', fontWeight: '700' }}>Promotions</h1>
        <button className="btn btn-gold btn-sm" onClick={openNew} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={15} /> Nouvelle promotion
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="spinner" /></div>
      ) : promos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)', background: 'var(--white)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)' }}>
          <Tag size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
          <p style={{ marginBottom: '16px' }}>Aucune promotion créée.</p>
          <button className="btn btn-gold btn-sm" onClick={openNew}>Créer une promotion</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {promos.map(p => {
            const live = isLive(p);
            return (
              <div key={p._id} style={{ background: 'var(--white)', borderRadius: 'var(--radius-xl)', padding: '20px', boxShadow: 'var(--shadow-sm)', borderTop: `4px solid ${live ? '#22c55e' : 'var(--cream-dark)'}`, position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '15px' }}>{p.title}</div>
                    {p.couponCode && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '4px', padding: '3px 10px', background: 'var(--cream)', borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: '700', letterSpacing: '1px', color: 'var(--charcoal)' }}>
                        <Tag size={11} /> {p.couponCode}
                      </div>
                    )}
                  </div>
                  <span style={{ padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '11px', fontWeight: '700', background: live ? '#e8f5e9' : '#f5f5f5', color: live ? '#22c55e' : '#999', flexShrink: 0 }}>
                    {live ? '● Actif' : '○ Inactif'}
                  </span>
                </div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--gold)', marginBottom: '6px' }}>
                  {p.discountType === 'percentage' ? `−${p.discountValue}%` : `−${formatPrice(p.discountValue)}`}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  <span>Du {new Date(p.startDate).toLocaleDateString('fr-FR')}</span>
                  <span>au {new Date(p.endDate).toLocaleDateString('fr-FR')}</span>
                  {p.minPurchase > 0 && <span>Min: {formatPrice(p.minPurchase)}</span>}
                  {p.maxUsage > 0 && <span>Limité: {p.usageCount || 0}/{p.maxUsage}</span>}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => openEdit(p)} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1, justifyContent: 'center' }}>
                    <Edit size={13} /> Modifier
                  </button>
                  <button onClick={() => handleDelete(p._id)} style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', background: '#fce4ec', color: '#c62828', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <>
          <div className="overlay" onClick={() => setShowModal(false)} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: 'var(--white)', borderRadius: 'var(--radius-xl)', padding: '32px', width: 'min(540px, 95vw)', zIndex: 1000, boxShadow: 'var(--shadow-xl)', animation: 'slideUp 0.2s ease', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontFamily: "Nunito, sans-serif", fontSize: '18px', fontWeight: '700' }}>
                {editing ? 'Modifier la promotion' : 'Nouvelle promotion'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '20px' }}>✕</button>
            </div>
            <form onSubmit={handleSave} className="form-grid-2" style={{ gap: '14px' }}>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Titre *</label>
                <input className="form-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required placeholder="Soldes d'été, Black Friday..." />
              </div>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-input form-select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  <option value="coupon">Code promo</option>
                  <option value="banner">Bannière promo</option>
                  <option value="flash">Vente flash</option>
                </select>
              </div>
              {form.type === 'coupon' && (
                <div className="form-group">
                  <label className="form-label">Code coupon</label>
                  <input className="form-input" value={form.couponCode} onChange={e => setForm(f => ({ ...f, couponCode: e.target.value.toUpperCase() }))} placeholder="SUMMER20" style={{ letterSpacing: '1px', fontWeight: '700' }} />
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Type de réduction *</label>
                <select className="form-input form-select" value={form.discountType} onChange={e => setForm(f => ({ ...f, discountType: e.target.value }))}>
                  <option value="percentage">Pourcentage (%)</option>
                  <option value="fixed">Montant fixe (FCFA)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Valeur *</label>
                <input className="form-input" type="number" min="0" value={form.discountValue} onChange={e => setForm(f => ({ ...f, discountValue: e.target.value }))} required placeholder={form.discountType === 'percentage' ? '20' : '5000'} />
              </div>
              <div className="form-group">
                <label className="form-label">Achat minimum (FCFA)</label>
                <input className="form-input" type="number" min="0" value={form.minPurchase} onChange={e => setForm(f => ({ ...f, minPurchase: e.target.value }))} placeholder="0" />
              </div>
              <div className="form-group">
                <label className="form-label">Limite d'utilisation</label>
                <input className="form-input" type="number" min="0" value={form.maxUsage} onChange={e => setForm(f => ({ ...f, maxUsage: e.target.value }))} placeholder="0 = illimité" />
              </div>
              <div className="form-group">
                <label className="form-label">Début *</label>
                <input className="form-input" type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Fin *</label>
                <input className="form-input" type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} required />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} style={{ accentColor: 'var(--gold)', width: '16px', height: '16px' }} />
                  <span className="form-label" style={{ margin: 0 }}>Promotion active</span>
                </label>
              </div>
              <div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-gold" disabled={saving} style={{ flex: 1, justifyContent: 'center' }}>
                  {saving ? 'Sauvegarde...' : editing ? 'Mettre à jour' : 'Créer'}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Annuler</button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
