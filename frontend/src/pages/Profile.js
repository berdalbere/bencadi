import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { User, Package, Heart, Lock, Edit3, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { authAPI, orderAPI } from '../utils/api';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { formatPrice } = useSettings();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profile';

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (activeTab === 'orders') {
      setOrdersLoading(true);
      orderAPI.getMyOrders().then(({ data }) => setOrders(data.orders || [])).finally(() => setOrdersLoading(false));
    }
  }, [activeTab]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await authAPI.updateProfile(profileForm);
      updateUser(data.user);
      toast.success('Profil mis à jour !');
    } catch { toast.error('Erreur lors de la mise à jour.'); }
    finally { setSaving(false); }
  };

  const handleChangePwd = async (e) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirm) { toast.error('Les mots de passe ne correspondent pas.'); return; }
    setSaving(true);
    try {
      await authAPI.changePassword({ currentPassword: pwdForm.currentPassword, newPassword: pwdForm.newPassword });
      toast.success('Mot de passe modifié !');
      setPwdForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur.'); }
    finally { setSaving(false); }
  };

  const tabs = [
    { key: 'profile', Icon: User, label: 'Mon profil' },
    { key: 'orders', Icon: Package, label: 'Mes commandes' },
    { key: 'security', Icon: Lock, label: 'Sécurité' },
  ];

  const statusColors = {
    pending: { bg: '#fff3e0', color: '#e65100', label: 'En attente' },
    confirmed: { bg: '#e3f2fd', color: '#1565c0', label: 'Confirmée' },
    processing: { bg: '#f3e5f5', color: '#6a1b9a', label: 'En cours' },
    shipped: { bg: '#e8f5e9', color: '#2e7d32', label: 'Expédiée' },
    delivered: { bg: '#e8f5e9', color: '#1b5e20', label: 'Livrée' },
    cancelled: { bg: '#fce4ec', color: '#c62828', label: 'Annulée' },
  };

  return (
    <div className="container" style={{ padding: '40px 24px', minHeight: '70vh' }}>
      <h1 style={{ fontFamily: "Nunito, sans-serif", fontSize: '28px', fontWeight: '700', marginBottom: '32px' }}>Mon Espace</h1>

      <div className="layout-sidebar">
        {/* Sidebar */}
        <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-xl)', padding: '24px', boxShadow: 'var(--shadow-sm)', position: 'sticky', top: '90px' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'var(--charcoal)', color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '700', margin: '0 auto 10px' }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ fontWeight: '600', fontSize: '15px' }}>{user?.name}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{user?.email}</div>
            <span style={{ display: 'inline-block', marginTop: '6px', padding: '3px 10px', borderRadius: 'var(--radius-full)', background: 'rgba(201,168,76,0.15)', color: 'var(--gold)', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>
              {user?.role === 'client' ? 'Client' : user?.role}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {tabs.map(t => (
              <button key={t.key} onClick={() => setSearchParams({ tab: t.key })}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '14px', fontWeight: activeTab === t.key ? '600' : '400', color: activeTab === t.key ? 'var(--white)' : 'var(--text-secondary)', background: activeTab === t.key ? 'var(--charcoal)' : 'transparent', border: 'none', cursor: 'pointer', width: '100%', transition: 'var(--transition)', textAlign: 'left' }}>
                <t.Icon size={16} /> {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div>
          {activeTab === 'profile' && (
            <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-xl)', padding: '32px', boxShadow: 'var(--shadow-sm)' }}>
              <h2 style={{ fontFamily: "Nunito, sans-serif", fontSize: '20px', fontWeight: '700', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit3 size={20} style={{ color: 'var(--gold)' }} /> Modifier mon profil
              </h2>
              <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
                <div className="form-group">
                  <label className="form-label">Nom complet</label>
                  <input className="form-input" value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(non modifiable)</span></label>
                  <input className="form-input" value={user?.email} disabled style={{ background: 'var(--cream)', color: 'var(--text-muted)', cursor: 'not-allowed' }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Téléphone</label>
                  <input className="form-input" placeholder="+237..." value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <button type="submit" className="btn btn-gold" disabled={saving} style={{ alignSelf: 'flex-start', gap: '6px' }}>
                  <Check size={16} /> {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'orders' && (
            <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-xl)', padding: '32px', boxShadow: 'var(--shadow-sm)' }}>
              <h2 style={{ fontFamily: "Nunito, sans-serif", fontSize: '20px', fontWeight: '700', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Package size={20} style={{ color: 'var(--gold)' }} /> Mes commandes
              </h2>
              {ordersLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><div className="spinner" /></div>
              ) : orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  <Package size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
                  <p>Aucune commande pour l'instant.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {orders.map(order => {
                    const st = statusColors[order.status] || { bg: 'var(--cream)', color: 'var(--text-muted)', label: order.status };
                    return (
                      <div key={order._id} style={{ border: '1.5px solid var(--cream-dark)', borderRadius: 'var(--radius-lg)', padding: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                          <div>
                            <div style={{ fontWeight: '700', fontSize: '15px' }}>Commande #{order.orderNumber}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(order.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: '700', background: st.bg, color: st.color }}>{st.label}</span>
                            <span style={{ fontWeight: '700', fontSize: '16px', color: 'var(--gold)' }}>{formatPrice(order.totalAmount)}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
                          {order.items?.slice(0, 4).map((item, i) => (
                            <div key={i} style={{ position: 'relative' }}>
                              <img src={item.image} alt={item.name} style={{ width: '52px', height: '52px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', flexShrink: 0 }} />
                              {item.quantity > 1 && <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: 'var(--charcoal)', color: 'var(--white)', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>×{item.quantity}</span>}
                            </div>
                          ))}
                          {order.items?.length > 4 && <div style={{ width: '52px', height: '52px', borderRadius: 'var(--radius-sm)', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>+{order.items.length - 4}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'security' && (
            <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-xl)', padding: '32px', boxShadow: 'var(--shadow-sm)' }}>
              <h2 style={{ fontFamily: "Nunito, sans-serif", fontSize: '20px', fontWeight: '700', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lock size={20} style={{ color: 'var(--gold)' }} /> Changer le mot de passe
              </h2>
              <form onSubmit={handleChangePwd} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '360px' }}>
                {[
                  { key: 'currentPassword', label: 'Mot de passe actuel', ph: '••••••••' },
                  { key: 'newPassword', label: 'Nouveau mot de passe', ph: 'Min. 6 caractères' },
                  { key: 'confirm', label: 'Confirmer', ph: 'Répéter le nouveau' },
                ].map(f => (
                  <div key={f.key} className="form-group">
                    <label className="form-label">{f.label}</label>
                    <input className="form-input" type="password" placeholder={f.ph} value={pwdForm[f.key]} onChange={e => setPwdForm(p => ({ ...p, [f.key]: e.target.value }))} required />
                  </div>
                ))}
                <button type="submit" className="btn btn-gold" disabled={saving} style={{ alignSelf: 'flex-start' }}>
                  {saving ? 'Modification...' : 'Changer le mot de passe'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
