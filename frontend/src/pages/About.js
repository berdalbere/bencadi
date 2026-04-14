import { useSettings } from '../context/SettingsContext';
import { Facebook, Instagram, Youtube, Twitter, MessageCircle, Target, Orbit, CalendarDays } from 'lucide-react';

export default function About() {
  const { settings } = useSettings();
  const about = settings.aboutUs || {};

  const values = about.values || ['Qualité', 'Accessibilité', 'Service client', 'Innovation'];

  return (
    <div style={{ minHeight: '80vh' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, var(--charcoal) 0%, #2d2d3e 60%, #3a2a1a 100%)', padding: '80px 0', color: 'var(--white)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(201,168,76,0.08)' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontFamily: "Nunito, sans-serif", fontSize: 'clamp(32px,5vw,56px)', fontWeight: '800', marginBottom: '16px' }}>
            {about.title || `À propos de ${settings.siteName || 'BENCADİ'}`}
          </h1>
          <p style={{ fontSize: '18px', opacity: 0.8, maxWidth: '600px', margin: '0 auto', lineHeight: 1.7 }}>
            {about.content || `${settings.siteName || 'BENCADİ'} est votre destination pour l'équipement et la décoration de maison.`}
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '80px 24px' }}>
        {/* Mission & Vision */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '28px', marginBottom: '80px' }}>
          {[
            { Icon: Target, title: 'Notre Mission', content: about.mission || 'Rendre chaque maison plus belle et plus confortable avec des produits de qualité accessibles à tous.' },
            { Icon: Orbit, title: 'Notre Vision', content: about.vision || 'Devenir la référence africaine de l\'équipement maison en ligne, reconnue pour la qualité et le service.' },
            { Icon: CalendarDays, title: 'Fondée en', content: about.founded || '2024' },
          ].map(item => (
            <div key={item.title} style={{ background: 'var(--white)', borderRadius: 'var(--radius-xl)', padding: '32px', boxShadow: 'var(--shadow-sm)', textAlign: 'center', transition: 'var(--transition)' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(201,168,76,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <item.Icon size={28} style={{ color: 'var(--gold)' }} />
              </div>
              <h3 style={{ fontFamily: "Nunito, sans-serif", fontSize: '20px', fontWeight: '700', marginBottom: '10px' }}>{item.title}</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '15px' }}>{item.content}</p>
            </div>
          ))}
        </div>

        {/* Values */}
        <div style={{ marginBottom: '80px' }}>
          <h2 className="section-title" style={{ marginBottom: '40px' }}>Nos valeurs</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {values.map((v, i) => (
              <span key={i} style={{ padding: '10px 24px', background: 'var(--charcoal)', color: 'var(--white)', borderRadius: 'var(--radius-full)', fontSize: '15px', fontWeight: '500' }}>
                {v}
              </span>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div style={{ background: 'linear-gradient(135deg, var(--charcoal), #3a2a1a)', borderRadius: 'var(--radius-xl)', padding: 'clamp(32px, 6vw, 60px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '32px', textAlign: 'center', color: 'var(--white)', marginBottom: '80px' }}>
          {[
            { val: '500+', label: 'Produits' },
            { val: '1000+', label: 'Clients satisfaits' },
            { val: '18', label: 'Catégories' },
            { val: '7j/7', label: 'Support' },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontFamily: "Nunito, sans-serif", fontSize: '40px', fontWeight: '800', color: 'var(--gold)', marginBottom: '6px' }}>{s.val}</div>
              <div style={{ fontSize: '14px', opacity: 0.8 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Socials */}
        {settings.socialLinks && Object.values(settings.socialLinks).some(Boolean) && (
          <div style={{ textAlign: 'center' }}>
            <h2 className="section-title" style={{ display: 'block', textAlign: 'center', marginBottom: '32px' }}>Suivez-nous</h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
              {[
                { key: 'facebook', Icon: Facebook, label: 'Facebook', color: '#1877f2' },
                { key: 'instagram', Icon: Instagram, label: 'Instagram', color: '#e4405f' },
                { key: 'twitter', Icon: Twitter, label: 'Twitter', color: '#1da1f2' },
                { key: 'youtube', Icon: Youtube, label: 'YouTube', color: '#ff0000' },
              ].filter(s => settings.socialLinks[s.key]).map(s => (
                <a key={s.key} href={settings.socialLinks[s.key]} target="_blank" rel="noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--cream-dark)', background: 'var(--white)', color: s.color, fontWeight: '600', fontSize: '14px', transition: 'var(--transition)', textDecoration: 'none' }}
                  onMouseEnter={e => { e.currentTarget.style.background = s.color; e.currentTarget.style.color = 'var(--white)'; e.currentTarget.style.borderColor = s.color; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--white)'; e.currentTarget.style.color = s.color; e.currentTarget.style.borderColor = 'var(--cream-dark)'; e.currentTarget.style.transform = 'none'; }}>
                  <s.Icon size={18} /> {s.label}
                </a>
              ))}
              {settings.socialLinks?.whatsapp && (
                <a href={settings.socialLinks.whatsapp} target="_blank" rel="noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--cream-dark)', background: 'var(--white)', color: '#25D366', fontWeight: '600', fontSize: '14px', transition: 'var(--transition)', textDecoration: 'none' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#25D366'; e.currentTarget.style.color = 'var(--white)'; e.currentTarget.style.borderColor = '#25D366'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--white)'; e.currentTarget.style.color = '#25D366'; e.currentTarget.style.borderColor = 'var(--cream-dark)'; }}>
                  <MessageCircle size={18} /> WhatsApp
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
