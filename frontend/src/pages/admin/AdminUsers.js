import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, ShieldCheck, User } from 'lucide-react';
import { userAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const ROLES = ['client','editor','moderator','admin','superadmin'];
const ROLE_COLORS = {
  client:      { bg: '#f5f5f5',  color: '#555' },
  editor:      { bg: '#e3f2fd',  color: '#1565c0' },
  moderator:   { bg: '#f3e5f5',  color: '#6a1b9a' },
  admin:       { bg: '#fff3e0',  color: '#e65100' },
  superadmin:  { bg: '#fce4ec',  color: '#c62828' },
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'editor', phone: '' });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const load = async (p = 1, s = search, r = roleFilter) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 15 };
      if (s) params.search = s;
      if (r) params.role = r;
      const { data } = await userAPI.getAll(params);
      setUsers(data.users || []);
      setPagination(data.pagination || {});
    } catch { setUsers([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(page, search, roleFilter); }, [page, roleFilter]);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); load(1, search, roleFilter); };

  const openNew = () => { setEditing(null); setForm({ name: '', email: '', password: '', role: 'editor', phone: '' }); setShowModal(true); };
  const openEdit = (u) => { setEditing(u); setForm({ name: u.name, email: u.email, password: '', role: u.role, phone: u.phone || '' }); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const payload = { name: form.name, role: form.role, phone: form.phone };
        await userAPI.update(editing._id, payload);
        toast.success('Utilisateur mis à jour.');
      } else {
        if (!form.password) { toast.error('Mot de passe requis.'); setSaving(false); return; }
        await userAPI.create(form);
        toast.success('Utilisateur créé.');
      }
      setShowModal(false);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await userAPI.delete(id);
      toast.success('Utilisateur supprimé.');
      setDeleteId(null);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur.'); }
  };

  const toggleActive = async (user) => {
    try {
      await userAPI.update(user._id, { isActive: !user.isActive });
      toast.success(user.isActive ? 'Compte désactivé.' : 'Compte activé.');
      load();
    } catch { toast.error('Erreur.'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h1 style={{ fontFamily: "Nunito, sans-serif", fontSize: '24px', fontWeight: '700' }}>
          Utilisateurs <span style={{ fontSize: '16px', color: 'var(--text-muted)', fontFamily: 'Nunito' }}>({pagination.total || 0})</span>
        </h1>
        <button className="btn btn-gold btn-sm" onClick={openNew} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={15} /> Ajouter un membre
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
          <input className="form-input" placeholder="Nom, email..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: '260px' }} />
          <button type="submit" className="btn btn-outline btn-sm"><Search size={14} /></button>
        </form>
        <select className="form-input form-select" value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }} style={{ width: 'auto', padding: '8px 36px 8px 12px' }}>
          <option value="">Tous les rôles</option>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px', display: 'flex', justifyContent: 'center' }}><div className="spinner" /></div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: 'var(--cream)', borderBottom: '1px solid var(--cream-dark)' }}>
                  {['Utilisateur', 'Rôle', 'Tél.', 'Statut', 'Inscrit le', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const rc = ROLE_COLORS[u.role] || ROLE_COLORS.client;
                  return (
                    <tr key={u._id} style={{ borderBottom: '1px solid var(--cream-dark)', transition: 'var(--transition)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--cream)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--charcoal)', color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', flexShrink: 0 }}>
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: '600', fontSize: '13px' }}>{u.name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '11px', fontWeight: '700', background: rc.bg, color: rc.color }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '12px' }}>{u.phone || '—'}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <button onClick={() => toggleActive(u)}
                          style={{ padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '11px', fontWeight: '700', background: u.isActive !== false ? '#e8f5e9' : '#fce4ec', color: u.isActive !== false ? '#22c55e' : '#c62828', border: 'none', cursor: 'pointer' }}>
                          {u.isActive !== false ? '● Actif' : '○ Inactif'}
                        </button>
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '12px', whiteSpace: 'nowrap' }}>
                        {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => openEdit(u)} style={{ padding: '6px', borderRadius: 'var(--radius-sm)', background: '#e3f2fd', color: '#1565c0', border: 'none', cursor: 'pointer' }}>
                            <Edit size={13} />
                          </button>
                          {u.role !== 'superadmin' && (
                            <button onClick={() => setDeleteId(u._id)} style={{ padding: '6px', borderRadius: 'var(--radius-sm)', background: '#fce4ec', color: '#c62828', border: 'none', cursor: 'pointer' }}>
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pagination.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '20px', flexWrap: 'wrap' }}>
          {[...Array(pagination.pages)].map((_, i) => (
            <button key={i} onClick={() => setPage(i + 1)}
              style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', border: i + 1 === page ? 'none' : '1.5px solid var(--cream-dark)', background: i + 1 === page ? 'var(--charcoal)' : 'var(--white)', color: i + 1 === page ? 'var(--white)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px' }}>
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <>
          <div className="overlay" onClick={() => setShowModal(false)} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'var(--white)', borderRadius: 'var(--radius-xl)', padding: '32px', width: 'min(460px, 95vw)', zIndex: 1000, boxShadow: 'var(--shadow-xl)', animation: 'slideUp 0.2s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontFamily: "Nunito, sans-serif", fontSize: '18px', fontWeight: '700' }}>
                {editing ? 'Modifier' : 'Nouveau membre d\'équipe'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
            </div>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Nom *</label>
                <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input className="form-input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required disabled={!!editing} style={editing ? { background: 'var(--cream)', cursor: 'not-allowed' } : {}} />
              </div>
              {!editing && (
                <div className="form-group">
                  <label className="form-label">Mot de passe *</label>
                  <input className="form-input" type="password" placeholder="Min. 6 caractères" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
                </div>
              )}
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Rôle</label>
                  <select className="form-input form-select" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                    {ROLES.filter(r => r !== 'superadmin').map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Téléphone</label>
                  <input className="form-input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button type="submit" className="btn btn-gold" disabled={saving} style={{ flex: 1, justifyContent: 'center' }}>
                  {saving ? 'Sauvegarde...' : editing ? 'Mettre à jour' : 'Créer le compte'}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Annuler</button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <>
          <div className="overlay" onClick={() => setDeleteId(null)} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'var(--white)', borderRadius: 'var(--radius-xl)', padding: '32px', width: 'min(380px, 95vw)', zIndex: 1000, boxShadow: 'var(--shadow-xl)', textAlign: 'center', animation: 'slideUp 0.2s ease' }}>
            <div style={{ fontSize: '44px', marginBottom: '12px' }}>⚠️</div>
            <h3 style={{ fontFamily: "Nunito, sans-serif", fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>Supprimer cet utilisateur ?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>Cette action est irréversible.</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button className="btn btn-outline" onClick={() => setDeleteId(null)}>Annuler</button>
              <button className="btn" style={{ background: 'var(--error)', color: 'var(--white)' }} onClick={() => handleDelete(deleteId)}>Supprimer</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
