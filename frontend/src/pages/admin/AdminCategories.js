import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save } from 'lucide-react';
import { categoryAPI } from '../../utils/api';
import { CategoryIcon, ICON_LIST } from '../../utils/categoryIcons';
import toast from 'react-hot-toast';

const COLORS = ['#8B4513','#4A90D9','#E67E22','#27AE60','#9B59B6','#1ABC9C','#E91E63','#2ECC71','#F39C12','#34495E','#E74C3C','#95A5A6','#F1C40F','#3498DB','#5DADE2','#E74C3C','#A0522D','#7F8C8D'];

export default function AdminCategories() {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', icon: 'Package', color: '#c9a84c', description: '', order: 0 });
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    const { data } = await categoryAPI.getAll();
    setCats(data.categories || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await categoryAPI.update(editing, form); toast.success('Catégorie modifiée.'); }
      else { await categoryAPI.create(form); toast.success('Catégorie créée.'); }
      setForm({ name: '', icon: 'Package', color: '#c9a84c', description: '', order: 0 });
      setEditing(null); setShowForm(false);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur.'); }
  };

  const handleEdit = (cat) => {
    setForm({ name: cat.name, icon: cat.icon, color: cat.color, description: cat.description || '', order: cat.order || 0 });
    setEditing(cat._id); setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette catégorie ?')) return;
    await categoryAPI.delete(id); toast.success('Catégorie supprimée.'); load();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontFamily: "Nunito, sans-serif", fontSize: '24px', fontWeight: '700' }}>Catégories</h1>
        <button className="btn btn-gold btn-sm" onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ name: '', icon: 'Package', color: '#c9a84c', description: '', order: 0 }); }}>
          <Plus size={15} /> Nouvelle catégorie
        </button>
      </div>

      {showForm && (
        <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-xl)', padding: '24px', boxShadow: 'var(--shadow-sm)', marginBottom: '24px' }}>
          <h3 style={{ fontFamily: "Nunito, sans-serif", fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>
            {editing ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
          </h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Nom *</label>
              <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="Nom de la catégorie" />
            </div>
            <div className="form-group">
              <label className="form-label">Icône</label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                {ICON_LIST.map(name => (
                  <button key={name} type="button" onClick={() => setForm(f => ({ ...f, icon: name }))}
                    title={name}
                    style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', border: form.icon === name ? '2px solid var(--gold)' : '2px solid transparent', background: form.icon === name ? 'rgba(201,168,76,0.1)' : 'var(--cream)', cursor: 'pointer' }}>
                    <CategoryIcon name={name} size={18} style={{ color: form.icon === name ? 'var(--gold)' : 'var(--text-secondary)' }} />
                  </button>
                ))}
              </div>
              <input className="form-input" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} placeholder="Nom de l'icône (ex: Sofa)" style={{ fontSize: '13px' }} />
            </div>
            <div className="form-group">
              <label className="form-label">Couleur</label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '6px' }}>
                {COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))}
                    style={{ width: '24px', height: '24px', borderRadius: '50%', background: c, border: form.color === c ? '3px solid var(--charcoal)' : '2px solid transparent', cursor: 'pointer' }} />
                ))}
              </div>
              <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} style={{ width: '100%', height: '36px', border: '1.5px solid var(--cream-dark)', borderRadius: 'var(--radius-md)', cursor: 'pointer', padding: '2px' }} />
            </div>
            <div className="form-group">
              <label className="form-label">Ordre d'affichage</label>
              <input className="form-input" type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: Number(e.target.value) }))} />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Description</label>
              <input className="form-input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description courte" />
            </div>
            <div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-gold btn-sm"><Save size={14} /> Sauvegarder</button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setShowForm(false); setEditing(null); }}>Annuler</button>
            </div>
          </form>
        </div>
      )}

      {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><div className="spinner" /></div> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
          {cats.map(cat => (
            <div key={cat._id} style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: '16px', boxShadow: 'var(--shadow-sm)', borderTop: `4px solid ${cat.color}`, transition: 'var(--transition)' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', background: `${cat.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CategoryIcon name={cat.icon} size={24} style={{ color: cat.color }} />
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button onClick={() => handleEdit(cat)} style={{ padding: '5px', borderRadius: 'var(--radius-sm)', background: '#e3f2fd', color: '#1565c0', border: 'none', cursor: 'pointer' }}><Edit size={13} /></button>
                  <button onClick={() => handleDelete(cat._id)} style={{ padding: '5px', borderRadius: 'var(--radius-sm)', background: '#fce4ec', color: '#c62828', border: 'none', cursor: 'pointer' }}><Trash2 size={13} /></button>
                </div>
              </div>
              <div style={{ fontWeight: '700', fontSize: '14px', marginTop: '8px' }}>{cat.name}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{cat.productCount || 0} produits</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
