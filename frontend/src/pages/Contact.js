import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, MessageCircle, HelpCircle } from 'lucide-react';
import { contactAPI } from '../utils/api';
import { useSettings } from '../context/SettingsContext';
import toast from 'react-hot-toast';

export default function Contact() {
  const { settings } = useSettings();
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await contactAPI.send(form);
      toast.success('Message envoyé ! Nous vous répondrons bientôt.');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'envoi.');
    } finally { setLoading(false); }
  };

  const faqs = [
    { q: 'Quels sont les délais de livraison ?', a: 'Nous livrons généralement sous 24 à 72h selon votre localisation.' },
    { q: 'Puis-je retourner un produit ?', a: 'Oui, vous disposez de 30 jours pour retourner tout produit non satisfaisant.' },
    { q: 'Comment suivre ma commande ?', a: 'Connectez-vous à votre compte et accédez à la section "Mes commandes".' },
    { q: 'Quels modes de paiement acceptez-vous ?', a: 'Paiement à la livraison, Mobile Money (MTN/Orange) et virement bancaire.' },
    { q: 'Livrez-vous partout au Cameroun ?', a: 'Oui, nous couvrons toutes les grandes villes. Contactez-nous pour les zones reculées.' },
  ];

  return (
    <div style={{ minHeight: '80vh' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, var(--charcoal), #2d2d3e)', padding: '60px 0', textAlign: 'center', color: 'var(--white)' }}>
        <h1 style={{ fontFamily: "Nunito, sans-serif", fontSize: 'clamp(28px,5vw,48px)', fontWeight: '800', marginBottom: '12px' }}>Aide & Contact</h1>
        <p style={{ fontSize: '18px', opacity: 0.8 }}>Nous sommes là pour vous aider</p>
      </div>

      <div className="container" style={{ padding: '60px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px', marginBottom: '80px' }}>
          {/* Contact Info */}
          <div>
            <h2 className="section-title" style={{ marginBottom: '28px' }}>Nos coordonnées</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {[
                { Icon: Phone, title: 'Téléphone', val: settings.phone || '+237 6XX XXX XXX', href: `tel:${settings.phone}` },
                { Icon: Mail, title: 'Email', val: settings.email || 'contact@bencadi.com', href: `mailto:${settings.email}` },
                { Icon: MapPin, title: 'Adresse', val: settings.address || 'Yaoundé, Cameroun' },
                { Icon: Clock, title: 'Horaires', val: 'Lun–Sam : 8h–18h\nDimanche : 9h–14h' },
              ].map(item => (
                <div key={item.title} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', background: 'rgba(201,168,76,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <item.Icon size={20} style={{ color: 'var(--gold)' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '15px', marginBottom: '2px' }}>{item.title}</div>
                    {item.href ? (
                      <a href={item.href} style={{ color: 'var(--text-secondary)', fontSize: '14px', transition: 'var(--transition)' }}
                        onMouseEnter={e => e.target.style.color = 'var(--gold)'}
                        onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>
                        {item.val}
                      </a>
                    ) : (
                      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', whiteSpace: 'pre-line' }}>{item.val}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Social quick links */}
            <div style={{ marginTop: '28px', padding: '20px', background: 'var(--cream)', borderRadius: 'var(--radius-lg)' }}>
              <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Contactez-nous aussi sur :</p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {settings.socialLinks?.whatsapp && (
                  <a href={settings.socialLinks.whatsapp} target="_blank" rel="noreferrer" className="btn btn-sm" style={{ background: '#25D366', color: 'var(--white)', borderRadius: 'var(--radius-full)', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <MessageCircle size={14} /> WhatsApp
                  </a>
                )}
                {settings.socialLinks?.facebook && (
                  <a href={settings.socialLinks.facebook} target="_blank" rel="noreferrer" className="btn btn-sm" style={{ background: '#1877f2', color: 'var(--white)', borderRadius: 'var(--radius-full)', fontSize: '13px' }}>
                    Facebook
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="section-title" style={{ marginBottom: '28px' }}>Envoyer un message</h2>
            <form onSubmit={handleSubmit} style={{ background: 'var(--white)', borderRadius: 'var(--radius-xl)', padding: '28px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Nom *</label>
                  <input className="form-input" placeholder="Votre nom" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input className="form-input" type="email" placeholder="votre@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                </div>
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Téléphone</label>
                  <input className="form-input" placeholder="+237..." value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Sujet</label>
                  <select className="form-input form-select" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}>
                    <option value="">Sélectionner...</option>
                    <option>Commande & livraison</option>
                    <option>Retour & remboursement</option>
                    <option>Produit & disponibilité</option>
                    <option>Question générale</option>
                    <option>Autre</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Message *</label>
                <textarea className="form-input" placeholder="Décrivez votre demande en détail..." value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} required style={{ minHeight: '120px', resize: 'vertical' }} />
              </div>
              <button type="submit" className="btn btn-gold" style={{ justifyContent: 'center', padding: '14px' }} disabled={loading}>
                <Send size={16} /> {loading ? 'Envoi...' : 'Envoyer le message'}
              </button>
            </form>
          </div>
        </div>

        {/* FAQ */}
        <div>
          <h2 className="section-title" style={{ marginBottom: '32px' }}>Questions fréquentes</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '760px' }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: '20px 24px', boxShadow: 'var(--shadow-sm)' }}>
                <h4 style={{ fontWeight: '700', fontSize: '15px', marginBottom: '8px', color: 'var(--charcoal)', display: 'flex', alignItems: 'center', gap: '8px' }}><HelpCircle size={16} style={{ color: 'var(--gold)', flexShrink: 0 }} /> {faq.q}</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
