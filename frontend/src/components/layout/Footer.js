import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube, Twitter, Phone, Mail, MapPin, MessageCircle, Music, Flame, Sparkles } from 'lucide-react';
import { CategoryIcon } from '../../utils/categoryIcons';
import { useSettings } from '../../context/SettingsContext';
import { useEffect, useState } from 'react';
import { categoryAPI } from '../../utils/api';

export default function Footer() {
  const { settings } = useSettings();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    categoryAPI.getAll().then(({ data }) => setCategories(data.categories?.slice(0, 8) || []));
  }, []);

  const socialIcons = {
    facebook: { Icon: Facebook, color: '#1877f2' },
    instagram: { Icon: Instagram, color: '#e4405f' },
    twitter: { Icon: Twitter, color: '#1da1f2' },
    youtube: { Icon: Youtube, color: '#ff0000' },
  };

  return (
    <footer style={{ background: 'var(--charcoal)', color: 'var(--cream)', marginTop: '80px' }}>
      {/* Main Footer */}
      <div className="container" style={{ padding: '60px 24px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px' }}>
          {/* Brand */}
          <div style={{ gridColumn: 'span 1' }}>
            <div style={{ fontFamily: "Nunito, sans-serif", fontSize: '28px', fontWeight: '800', background: 'linear-gradient(135deg, var(--cream), var(--gold))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '12px' }}>
              {settings.siteName || 'BENCADİ'}
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.7, marginBottom: '20px' }}>
              {settings.siteTagline || 'Votre maison, notre passion.'}
            </p>
            {/* Social Links */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {Object.entries(socialIcons).map(([key, { Icon, color }]) =>
                settings.socialLinks?.[key] ? (
                  <a key={key} href={settings.socialLinks[key]} target="_blank" rel="noreferrer"
                    style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'var(--transition)', color: 'var(--cream)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = color; e.currentTarget.style.transform = 'scale(1.1)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'scale(1)'; }}>
                    <Icon size={18} />
                  </a>
                ) : null
              )}
              {settings.socialLinks?.whatsapp && (
                <a href={settings.socialLinks.whatsapp} target="_blank" rel="noreferrer"
                  style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'var(--transition)', color: 'var(--cream)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#25D366'; e.currentTarget.style.transform = 'scale(1.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'scale(1)'; }}>
                  <MessageCircle size={18} />
                </a>
              )}
              {settings.socialLinks?.tiktok && (
                <a href={settings.socialLinks.tiktok} target="_blank" rel="noreferrer"
                  style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'var(--transition)', color: 'var(--cream)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#010101'; e.currentTarget.style.transform = 'scale(1.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'scale(1)'; }}>
                  <Music size={18} />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontFamily: "Nunito, sans-serif", fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: 'var(--cream)' }}>Liens rapides</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { to: '/', label: 'Accueil' },
                { to: '/produits', label: 'Tous les produits' },
                { to: '/promos',     label: 'Promotions',  Icon: Flame },
                { to: '/nouveautes', label: 'Nouveautés', Icon: Sparkles },
                { to: '/a-propos', label: 'À propos de nous' },
                { to: '/contact', label: 'Aide & Contact' },
              ].map(l => (
                <li key={l.to}>
                  <Link to={l.to} style={{ color: 'var(--text-muted)', fontSize: '14px', transition: 'var(--transition)', display: 'flex', alignItems: 'center', gap: '6px' }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--gold)'; e.currentTarget.style.paddingLeft = '6px'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.paddingLeft = '0'; }}>
                    {l.Icon && <l.Icon size={13} />}
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 style={{ fontFamily: "Nunito, sans-serif", fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: 'var(--cream)' }}>Catégories</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {categories.map(cat => (
                <li key={cat._id}>
                  <Link to={`/categorie/${cat.slug}`} style={{ color: 'var(--text-muted)', fontSize: '14px', transition: 'var(--transition)', display: 'flex', alignItems: 'center', gap: '6px' }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--gold)'; e.currentTarget.style.paddingLeft = '6px'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.paddingLeft = '0'; }}>
                    <CategoryIcon name={cat.icon} size={13} /> {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontFamily: "Nunito, sans-serif", fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: 'var(--cream)' }}>Nous contacter</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {settings.phone && (
                <a href={`tel:${settings.phone}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', fontSize: '14px', transition: 'var(--transition)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                  <Phone size={16} style={{ color: 'var(--gold)', flexShrink: 0 }} />
                  {settings.phone}
                </a>
              )}
              {settings.email && (
                <a href={`mailto:${settings.email}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', fontSize: '14px', transition: 'var(--transition)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                  <Mail size={16} style={{ color: 'var(--gold)', flexShrink: 0 }} />
                  {settings.email}
                </a>
              )}
              {settings.address && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', color: 'var(--text-muted)', fontSize: '14px' }}>
                  <MapPin size={16} style={{ color: 'var(--gold)', flexShrink: 0, marginTop: '2px' }} />
                  {settings.address}
                </div>
              )}
            </div>

            {/* Newsletter */}
            <div style={{ marginTop: '24px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px' }}>Recevez nos offres exclusives :</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="email" placeholder="Votre email" style={{ flex: 1, padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)', color: 'var(--cream)', fontSize: '13px', outline: 'none' }} />
                <button className="btn btn-gold btn-sm" style={{ flexShrink: 0, fontSize: '12px' }}>OK</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '16px 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
          <span>© {new Date().getFullYear()} {settings.siteName || 'BENCADİ'}. Tous droits réservés.</span>
          <div style={{ display: 'flex', gap: '20px' }}>
            <Link to="/contact" style={{ color: 'var(--text-muted)', transition: 'var(--transition)' }}
              onMouseEnter={e => e.target.style.color = 'var(--gold)'}
              onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>
              Politique de confidentialité
            </Link>
            <Link to="/contact" style={{ color: 'var(--text-muted)', transition: 'var(--transition)' }}
              onMouseEnter={e => e.target.style.color = 'var(--gold)'}
              onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>
              CGV
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
