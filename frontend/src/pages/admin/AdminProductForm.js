import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Save, ArrowLeft, Plus, X, Upload } from 'lucide-react';
import { productAPI, categoryAPI, uploadAPI } from '../../utils/api';
import { useSettings } from '../../context/SettingsContext';
import toast from 'react-hot-toast';

const init = { name: '', description: '', shortDescription: '', price: '', comparePrice: '', category: '', brand: '', stock: '', sku: '', mainImage: '', images: [], colors: [], tags: [], features: [], isPublished: true, isNew: false, isFeatured: false, isPromo: false, promoLabel: '', weight: '' };

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { formatPrice } = useSettings();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(init);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Temp input states
  const [colorInput, setColorInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [featureInput, setFeatureInput] = useState('');

  useEffect(() => {
    categoryAPI.getAll().then(({ data }) => setCategories(data.categories || []));
    if (isEdit) {
      productAPI.getOne(id).then(({ data }) => {
        const p = data.product;
        setForm({
          name: p.name || '', description: p.description || '', shortDescription: p.shortDescription || '',
          price: p.price || '', comparePrice: p.comparePrice || '', category: p.category?._id || '',
          brand: p.brand || '', stock: p.stock || '', sku: p.sku || '', mainImage: p.mainImage || '',
          images: p.images || [], colors: p.colors || [], tags: p.tags || [], features: p.features || [],
          isPublished: p.isPublished, isNew: p.isNew, isFeatured: p.isFeatured, isPromo: p.isPromo,
          promoLabel: p.promoLabel || '', weight: p.weight || '',
        });
      }).catch(() => navigate('/admin/produits'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleImageUpload = async (e, isMain = false) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('image', file);
    setUploading(true);
    try {
      const { data } = await uploadAPI.uploadImage(fd);
      if (isMain) set('mainImage', data.url);
      else set('images', [...form.images, data.url]);
      toast.success('Image téléchargée.');
    } catch { toast.error('Erreur upload.'); }
    finally { setUploading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category || !form.stock) {
      toast.error('Champs obligatoires: nom, prix, catégorie, stock.');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, price: Number(form.price), comparePrice: Number(form.comparePrice) || 0, stock: Number(form.stock), weight: Number(form.weight) || 0 };
      if (isEdit) { await productAPI.update(id, payload); toast.success('Produit mis à jour !'); }
      else { await productAPI.create(payload); toast.success('Produit créé !'); }
      navigate('/admin/produits');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la sauvegarde.');
    } finally { setSaving(false); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="spinner" /></div>;

  const addItem = (field, input, setInput) => {
    if (!input.trim()) return;
    if (!form[field].includes(input.trim())) set(field, [...form[field], input.trim()]);
    setInput('');
  };

  const removeItem = (field, val) => set(field, form[field].filter(v => v !== val));

  const TagInput = ({ field, placeholder, input, setInput }) => (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <input className="form-input" placeholder={placeholder} value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addItem(field, input, setInput))}
          style={{ flex: 1 }} />
        <button type="button" className="btn btn-outline btn-sm" onClick={() => addItem(field, input, setInput)}>
          <Plus size={14} />
        </button>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {form[field].map(v => (
          <span key={v} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', background: 'var(--cream)', borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: '500' }}>
            {v}
            <button type="button" onClick={() => removeItem(field, v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', lineHeight: 1 }}>
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <Link to="/admin/produits" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '13px' }}>
          <ArrowLeft size={16} /> Retour
        </Link>
        <h1 style={{ fontFamily: "Nunito, sans-serif", fontSize: '24px', fontWeight: '700' }}>
          {isEdit ? 'Modifier le produit' : 'Nouveau produit'}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="layout-admin-form">
          {/* Main form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Basic info */}
            <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-xl)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontFamily: "Nunito, sans-serif", fontSize: '16px', fontWeight: '700', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--cream-dark)' }}>Informations de base</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Nom du produit <span style={{ color: 'var(--error)' }}>*</span></label>
                  <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Ex: Canapé d'angle 5 places" />
                </div>
                <div className="form-group">
                  <label className="form-label">Description courte</label>
                  <input className="form-input" value={form.shortDescription} onChange={e => set('shortDescription', e.target.value)} placeholder="Une ligne résumant le produit" />
                </div>
                <div className="form-group">
                  <label className="form-label">Description complète <span style={{ color: 'var(--error)' }}>*</span></label>
                  <textarea className="form-input" value={form.description} onChange={e => set('description', e.target.value)} required placeholder="Description détaillée du produit..." style={{ minHeight: '120px' }} />
                </div>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Marque</label>
                    <input className="form-input" value={form.brand} onChange={e => set('brand', e.target.value)} placeholder="BENCADİ Home, Samsung..." />
                  </div>
                  <div className="form-group">
                    <label className="form-label">SKU</label>
                    <input className="form-input" value={form.sku} onChange={e => set('sku', e.target.value)} placeholder="Code unique" />
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing & Stock */}
            <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-xl)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontFamily: "Nunito, sans-serif", fontSize: '16px', fontWeight: '700', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--cream-dark)' }}>Prix & Stock</h3>
              <div className="form-grid-3">
                <div className="form-group">
                  <label className="form-label">Prix de vente <span style={{ color: 'var(--error)' }}>*</span></label>
                  <input className="form-input" type="number" min="0" value={form.price} onChange={e => set('price', e.target.value)} required placeholder="25000" />
                </div>
                <div className="form-group">
                  <label className="form-label">Prix barré (avant promo)</label>
                  <input className="form-input" type="number" min="0" value={form.comparePrice} onChange={e => set('comparePrice', e.target.value)} placeholder="30000" />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock <span style={{ color: 'var(--error)' }}>*</span></label>
                  <input className="form-input" type="number" min="0" value={form.stock} onChange={e => set('stock', e.target.value)} required placeholder="10" />
                </div>
              </div>
              {form.price && form.comparePrice && Number(form.comparePrice) > Number(form.price) && (
                <div style={{ marginTop: '10px', padding: '8px 12px', background: '#fff3e0', borderRadius: 'var(--radius-md)', fontSize: '13px', color: '#e65100' }}>
                  ✓ Réduction: {Math.round(((form.comparePrice - form.price) / form.comparePrice) * 100)}% — Économie: {Number(form.comparePrice - form.price).toLocaleString()} FCFA
                </div>
              )}
            </div>

            {/* Features, Colors, Tags */}
            <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-xl)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontFamily: "Nunito, sans-serif", fontSize: '16px', fontWeight: '700', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--cream-dark)' }}>Attributs</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Caractéristiques</label>
                  <TagInput field="features" placeholder="Ex: Structure bois massif" input={featureInput} setInput={setFeatureInput} />
                </div>
                <div className="form-group">
                  <label className="form-label">Couleurs disponibles</label>
                  <TagInput field="colors" placeholder="Ex: Gris, Beige..." input={colorInput} setInput={setColorInput} />
                </div>
                <div className="form-group">
                  <label className="form-label">Tags / Mots-clés</label>
                  <TagInput field="tags" placeholder="Ex: canapé, salon..." input={tagInput} setInput={setTagInput} />
                </div>
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Category & Status */}
            <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-xl)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontFamily: "Nunito, sans-serif", fontSize: '16px', fontWeight: '700', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--cream-dark)' }}>Organisation</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Catégorie <span style={{ color: 'var(--error)' }}>*</span></label>
                  <select className="form-input form-select" value={form.category} onChange={e => set('category', e.target.value)} required>
                    <option value="">Choisir une catégorie</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.icon} {c.name}</option>)}
                  </select>
                </div>

                {/* Toggles */}
                {[
                  { key: 'isPublished', label: 'Produit publié', desc: 'Visible dans la boutique' },
                  { key: 'isNew', label: 'Nouveauté', desc: 'Badge NEW affiché' },
                  { key: 'isFeatured', label: 'Mis en avant', desc: 'Affiché sur la home page' },
                  { key: 'isPromo', label: 'En promotion', desc: 'Badge PROMO affiché' },
                ].map(toggle => (
                  <label key={toggle.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--cream)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '600' }}>{toggle.label}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{toggle.desc}</div>
                    </div>
                    <div style={{ position: 'relative', width: '42px', height: '24px' }}>
                      <input type="checkbox" checked={form[toggle.key]} onChange={e => set(toggle.key, e.target.checked)} style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }} />
                      <div style={{ position: 'absolute', inset: 0, background: form[toggle.key] ? 'var(--gold)' : '#ccc', borderRadius: '12px', transition: 'var(--transition)', cursor: 'pointer' }} onClick={() => set(toggle.key, !form[toggle.key])}>
                        <div style={{ position: 'absolute', top: '3px', left: form[toggle.key] ? '21px' : '3px', width: '18px', height: '18px', borderRadius: '50%', background: 'var(--white)', transition: 'var(--transition)', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                      </div>
                    </div>
                  </label>
                ))}

                {form.isPromo && (
                  <div className="form-group">
                    <label className="form-label">Label promo</label>
                    <input className="form-input" value={form.promoLabel} onChange={e => set('promoLabel', e.target.value)} placeholder="Ex: -20%, SOLDE..." />
                  </div>
                )}
              </div>
            </div>

            {/* Image upload */}
            <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-xl)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontFamily: "Nunito, sans-serif", fontSize: '16px', fontWeight: '700', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--cream-dark)' }}>Images</h3>

              {/* Main image */}
              <div style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>Image principale</label>
                <div style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '2px dashed var(--cream-dark)', aspectRatio: '1', background: 'var(--cream)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  {form.mainImage ? (
                    <>
                      <img src={form.mainImage} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button type="button" onClick={() => set('mainImage', '')} style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', color: 'var(--white)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <>
                      <Upload size={28} style={{ color: 'var(--text-muted)' }} />
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Cliquer pour uploader</span>
                    </>
                  )}
                  <input type="file" accept="image/*" onChange={e => handleImageUpload(e, true)} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} disabled={uploading} />
                </div>
                <div style={{ marginTop: '8px' }}>
                  <label className="form-label" style={{ marginBottom: '4px', display: 'block', fontSize: '12px' }}>ou URL directe</label>
                  <input className="form-input" placeholder="https://..." value={form.mainImage} onChange={e => set('mainImage', e.target.value)} style={{ fontSize: '12px' }} />
                </div>
              </div>
            </div>

            {/* Save button */}
            <button type="submit" className="btn btn-gold" style={{ width: '100%', justifyContent: 'center', padding: '15px', fontSize: '16px' }} disabled={saving || uploading}>
              <Save size={18} /> {saving ? 'Sauvegarde...' : isEdit ? 'Mettre à jour' : 'Créer le produit'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
