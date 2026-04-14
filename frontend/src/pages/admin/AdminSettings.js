import { useState, useEffect } from 'react';
import { Save, Globe, Share2, Info, Upload, Facebook, Instagram, Twitter, Youtube, MessageCircle, Music } from 'lucide-react';
import { settingsAPI, uploadAPI } from '../../utils/api';
import { useSettings } from '../../context/SettingsContext';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const { settings, refresh } = useSettings();
  const [tab, setTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [general, setGeneral] = useState({ siteName: '', siteTagline: '', email: '', phone: '', address: '', logo: '', currency: 'XAF', currencySymbol: 'FCFA', shippingCost: 3000, freeShippingThreshold: 100000 });
  const [social, setSocial] = useState({ facebook: '', instagram: '', twitter: '', youtube: '', whatsapp: '', tiktok: '' });
  const [about, setAbout] = useState({ title: '', content: '', mission: '', vision: '', values: '', founded: '' });

  useEffect(() => {
    if (settings) {
      setGeneral({
        siteName: settings.siteName || '', siteTagline: settings.siteTagline || '',
        email: settings.email || '', phone: settings.phone || '', address: settings.address || '',
        logo: settings.logo || '', currency: settings.currency || 'XAF', currencySymbol: settings.currencySymbol || 'FCFA',
        shippingCost: settings.shippingCost || 3000, freeShippingThreshold: settings.freeShippingThreshold || 100000,
      });
      setSocial({ facebook: '', instagram: '', twitter: '', youtube: '', whatsapp: '', tiktok: '', ...settings.socialLinks });
      const ab = settings.aboutUs || {};
      setAbout({ title: ab.title || '', content: ab.content || '', mission: ab.mission || '', vision: ab.vision || '', values: Array.isArray(ab.values) ? ab.values.join(', ') : (ab.values || ''), founded: ab.founded || '' });
    }
  }, [settings]);

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('image', file);
    setUploading(true);
    try {
      const { data } = await uploadAPI.uploadImage(fd);
      setGeneral(g => ({ ...g, logo: data.url }));
      toast.success('Logo uploadé.');
    } catch { toast.error('Erreur upload.'); }
    finally { setUploading(false); }
  };

  const saveGeneral = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await settingsAPI.update(general);
      await refresh();
      toast.success('Paramètres généraux sauvegardés.');
    } catch { toast.error('Erreur.'); }
    finally { setSaving(false); }
  };

  const saveSocial = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await settingsAPI.updateSocial(social);
      await refresh();
      toast.success('Liens sociaux sauvegardés.');
    } catch { toast.error('Erreur.'); }
    finally { setSaving(false); }
  };

  const saveAbout = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...about, values: about.values.split(',').map(v => v.trim()).filter(Boolean) };
      await settingsAPI.updateAbout(payload);
      await refresh();
      toast.success('À propos sauvegardé.');
    } catch { toast.error('Erreur.'); }
    finally { setSaving(false); }
  };

  const tabs = [
    { key: 'general', Icon: Globe, label: 'Général' },
    { key: 'social', Icon: Share2, label: 'Réseaux sociaux' },
    { key: 'about', Icon: Info, label: 'À propos' },
  ];

  return (
    <div>
      <h1 style={{ fontFamily: "Nunito, sans-serif", fontSize: '24px', fontWeight: '700', marginBottom: '24px' }}>Paramètres du site</h1>

      {/* Tab Nav */}
      <div style={{ display: 'flex', gap: '0', borderBottom: '2px solid var(--cream-dark)', marginBottom: '28px', overflowX: 'auto' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '12px 20px', fontSize: '14px', fontWeight: tab === t.key ? '700' : '400', color: tab === t.key ? 'var(--charcoal)' : 'var(--text-muted)', borderBottom: `2px solid ${tab === t.key ? 'var(--gold)' : 'transparent'}`, marginBottom: '-2px', background: 'none', border: 'none', borderBottom: tab === t.key ? '2px solid var(--gold)' : '2px solid transparent', marginBottom: '-2px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            <t.Icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {/* General Tab */}
      {tab === 'general' && (
        <form onSubmit={saveGeneral}>
          <div className="layout-admin-form">
            <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-xl)', padding: '28px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontFamily: "Nunito, sans-serif", fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>Informations générales</h3>
              <div className="form-grid-2">
                {[
                  { key: 'siteName', label: 'Nom du site *', ph: 'BENCADİ' },
                  { key: 'siteTagline', label: 'Slogan', ph: 'Votre maison, notre passion' },
                  { key: 'email', label: 'Email de contact', ph: 'contact@bencadi.com', type: 'email' },
                  { key: 'phone', label: 'Téléphone', ph: '+237 6XX XXX XXX' },
                  { key: 'address', label: 'Adresse', ph: 'Yaoundé, Cameroun', full: true },
                ].map(f => (
                  <div key={f.key} className="form-group" style={f.full ? { gridColumn: 'span 2' } : {}}>
                    <label className="form-label">{f.label}</label>
                    <input className="form-input" type={f.type || 'text'} placeholder={f.ph} value={general[f.key]} onChange={e => setGeneral(g => ({ ...g, [f.key]: e.target.value }))} />
                  </div>
                ))}
              </div>

              <h3 style={{ fontFamily: "Nunito, sans-serif", fontSize: '16px', fontWeight: '700', marginTop: '8px', paddingTop: '16px', borderTop: '1px solid var(--cream-dark)' }}>Livraison & Commerce</h3>
              <div className="form-grid-3">
                {[
                  { key: 'currency', label: 'Devise', ph: 'XAF' },
                  { key: 'currencySymbol', label: 'Symbole', ph: 'FCFA' },
                  { key: 'shippingCost', label: 'Frais de livraison', ph: '3000', type: 'number' },
                  { key: 'freeShippingThreshold', label: 'Gratuit à partir de', ph: '100000', type: 'number', full: true },
                ].map(f => (
                  <div key={f.key} className="form-group" style={f.full ? { gridColumn: 'span 2' } : {}}>
                    <label className="form-label">{f.label}</label>
                    <input className="form-input" type={f.type || 'text'} placeholder={f.ph} value={general[f.key]} onChange={e => setGeneral(g => ({ ...g, [f.key]: e.target.value }))} />
                  </div>
                ))}
              </div>

              <button type="submit" className="btn btn-gold" disabled={saving} style={{ alignSelf: 'flex-start', gap: '6px' }}>
                <Save size={16} /> {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>

            {/* Logo */}
            <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-xl)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontFamily: "Nunito, sans-serif", fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Logo du site</h3>
              <div style={{ position: 'relative', borderRadius: 'var(--radius-lg)', border: '2px dashed var(--cream-dark)', aspectRatio: '2', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'var(--cream)', marginBottom: '12px', overflow: 'hidden', cursor: 'pointer' }}>
                {general.logo ? (
                  <img src={general.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '16px' }} />
                ) : (
                  <>
                    <Upload size={28} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Cliquer pour uploader</span>
                  </>
                )}
                <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} disabled={uploading} />
              </div>
              {general.logo && <button type="button" onClick={() => setGeneral(g => ({ ...g, logo: '' }))} className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center' }}>Supprimer</button>}
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'center' }}>PNG ou SVG recommandé<br />Max 2MB</p>
            </div>
          </div>
        </form>
      )}

      {/* Social Tab */}
      {tab === 'social' && (
        <form onSubmit={saveSocial}>
          <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-xl)', padding: '28px', boxShadow: 'var(--shadow-sm)', maxWidth: '640px' }}>
            <h3 style={{ fontFamily: "Nunito, sans-serif", fontSize: '16px', fontWeight: '700', marginBottom: '20px' }}>Liens des réseaux sociaux</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { key: 'facebook', Icon: Facebook, label: 'Facebook', ph: 'https://facebook.com/votrepage' },
                { key: 'instagram', Icon: Instagram, label: 'Instagram', ph: 'https://instagram.com/votrecompte' },
                { key: 'twitter', Icon: Twitter, label: 'Twitter / X', ph: 'https://twitter.com/votrecompte' },
                { key: 'youtube', Icon: Youtube, label: 'YouTube', ph: 'https://youtube.com/@votrechaine' },
                { key: 'whatsapp', Icon: MessageCircle, label: 'WhatsApp', ph: 'https://wa.me/237600000000' },
                { key: 'tiktok', Icon: Music, label: 'TikTok', ph: 'https://tiktok.com/@votrecompte' },
              ].map(f => (
                <div key={f.key} className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><f.Icon size={14} /> {f.label}</label>
                  <input className="form-input" type="url" placeholder={f.ph} value={social[f.key]} onChange={e => setSocial(s => ({ ...s, [f.key]: e.target.value }))} />
                </div>
              ))}
              <button type="submit" className="btn btn-gold" disabled={saving} style={{ alignSelf: 'flex-start', gap: '6px', marginTop: '8px' }}>
                <Save size={16} /> {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* About Tab */}
      {tab === 'about' && (
        <form onSubmit={saveAbout}>
          <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-xl)', padding: '28px', boxShadow: 'var(--shadow-sm)', maxWidth: '720px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontFamily: "Nunito, sans-serif", fontSize: '16px', fontWeight: '700' }}>Page À propos</h3>
            {[
              { key: 'title', label: 'Titre', ph: 'À propos de BENCADİ' },
              { key: 'founded', label: 'Année de création', ph: '2024' },
            ].map(f => (
              <div key={f.key} className="form-group">
                <label className="form-label">{f.label}</label>
                <input className="form-input" placeholder={f.ph} value={about[f.key]} onChange={e => setAbout(a => ({ ...a, [f.key]: e.target.value }))} />
              </div>
            ))}
            {[
              { key: 'content', label: 'Présentation', ph: 'Décrivez votre entreprise...' },
              { key: 'mission', label: 'Mission', ph: 'Notre mission est de...' },
              { key: 'vision', label: 'Vision', ph: 'Notre vision est de devenir...' },
            ].map(f => (
              <div key={f.key} className="form-group">
                <label className="form-label">{f.label}</label>
                <textarea className="form-input" placeholder={f.ph} value={about[f.key]} onChange={e => setAbout(a => ({ ...a, [f.key]: e.target.value }))} style={{ minHeight: '80px', resize: 'vertical' }} />
              </div>
            ))}
            <div className="form-group">
              <label className="form-label">Valeurs <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(séparées par virgule)</span></label>
              <input className="form-input" placeholder="Qualité, Accessibilité, Service client..." value={about.values} onChange={e => setAbout(a => ({ ...a, values: e.target.value }))} />
            </div>
            <button type="submit" className="btn btn-gold" disabled={saving} style={{ alignSelf: 'flex-start', gap: '6px' }}>
              <Save size={16} /> {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
