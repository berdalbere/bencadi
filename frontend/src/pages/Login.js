import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone, Sofa, Wind, Sun, BedDouble } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import toast from 'react-hot-toast';

function AuthInput({ icon: Icon, ...props }) {
  return (
    <div style={{ position: 'relative' }}>
      <Icon size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
      <input className="form-input" {...props} style={{ paddingLeft: '42px', ...props.style }} />
    </div>
  );
}

export function Login() {
  const { login } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Bienvenue, ${user.name.split(' ')[0]} !`);
      if (user.role !== 'client') navigate('/admin');
      else navigate(from);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur de connexion.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--cream)' }}>
      {/* Left decorative panel */}
      <div style={{ flex: 1, background: 'linear-gradient(135deg, var(--charcoal) 0%, #2d2d3e 50%, #3a2a1a 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px', position: 'relative', overflow: 'hidden' }} className="auth-panel">
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(201,168,76,0.1)' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '250px', height: '250px', borderRadius: '50%', background: 'rgba(201,168,76,0.06)' }} />
        <Link to="/" style={{ fontFamily: "Nunito, sans-serif", fontSize: '40px', fontWeight: '800', background: 'linear-gradient(135deg, var(--white), var(--gold))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'block', marginBottom: '20px', position: 'relative', zIndex: 1 }}>
          {settings.siteName || 'BENCADİ'}
        </Link>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '18px', textAlign: 'center', position: 'relative', zIndex: 1, maxWidth: '300px', lineHeight: 1.6 }}>
          {settings.siteTagline || 'Votre maison, notre passion.'}
        </p>
        <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '280px', position: 'relative', zIndex: 1 }}>
          {[
            { label: 'Canapés & Salon', Icon: Sofa },
            { label: 'Climatisation', Icon: Wind },
            { label: 'Énergie solaire', Icon: Sun },
            { label: 'Literie & Chambre', Icon: BedDouble },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
              <item.Icon size={16} style={{ color: 'var(--gold)', flexShrink: 0 }} />
              {item.label}
            </div>
          ))}
        </div>
      </div>

      {/* Right form */}
      <div style={{ width: 'min(480px, 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'clamp(24px, 5vw, 48px)', background: 'var(--white)' }}>
        <div style={{ width: '100%', maxWidth: '360px' }}>
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontFamily: "Nunito, sans-serif", fontSize: '28px', fontWeight: '700', marginBottom: '6px' }}>Connexion</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Bon retour ! Entrez vos identifiants.</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <AuthInput icon={Mail} type="email" placeholder="votre@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                Mot de passe
                <Link to="/contact" style={{ fontSize: '13px', color: 'var(--gold)' }}>Oublié ?</Link>
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                <input className="form-input" type={showPwd ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required style={{ paddingLeft: '42px', paddingRight: '42px' }} />
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px' }}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-gold" style={{ width: '100%', justifyContent: 'center', padding: '14px', marginTop: '4px' }} disabled={loading}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-secondary)' }}>
            Pas encore de compte ?{' '}
            <Link to="/register" style={{ color: 'var(--gold)', fontWeight: '600' }}>Créer un compte</Link>
          </div>

          <Link to="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text-muted)', gap: '4px' }}>
            ← Retour à la boutique
          </Link>
        </div>
      </div>

    </div>
  );
}

export function Register() {
  const { register } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error('Les mots de passe ne correspondent pas.'); return; }
    if (form.password.length < 6) { toast.error('Le mot de passe doit contenir au moins 6 caractères.'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.phone);
      toast.success('Compte créé avec succès ! Bienvenue !');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'inscription.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--cream)' }}>
      <div style={{ flex: 1, background: 'linear-gradient(135deg, var(--charcoal) 0%, #2d2d3e 50%, #3a2a1a 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px', position: 'relative', overflow: 'hidden' }} className="auth-panel">
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(201,168,76,0.1)' }} />
        <Link to="/" style={{ fontFamily: "Nunito, sans-serif", fontSize: '40px', fontWeight: '800', background: 'linear-gradient(135deg, var(--white), var(--gold))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'block', marginBottom: '20px', position: 'relative', zIndex: 1 }}>
          {settings.siteName || 'BENCADİ'}
        </Link>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '16px', textAlign: 'center', position: 'relative', zIndex: 1, maxWidth: '300px', lineHeight: 1.7 }}>
          Rejoignez notre communauté et bénéficiez d'offres exclusives sur l'équipement maison.
        </p>
      </div>

      <div style={{ width: 'min(520px, 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'clamp(24px, 5vw, 48px)', background: 'var(--white)' }}>
        <div style={{ width: '100%', maxWidth: '380px' }}>
          <div style={{ marginBottom: '28px' }}>
            <h1 style={{ fontFamily: "Nunito, sans-serif", fontSize: '28px', fontWeight: '700', marginBottom: '6px' }}>Créer un compte</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Inscription rapide et gratuite.</p>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Nom complet</label>
              <AuthInput icon={User} type="text" placeholder="Votre nom" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <AuthInput icon={Mail} type="email" placeholder="votre@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Téléphone <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>(optionnel)</span></label>
              <AuthInput icon={Phone} type="tel" placeholder="+237 6XX XXX XXX" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Mot de passe</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                <input className="form-input" type={showPwd ? 'text' : 'password'} placeholder="Min. 6 caractères" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required style={{ paddingLeft: '42px', paddingRight: '42px' }} />
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Confirmer le mot de passe</label>
              <AuthInput icon={Lock} type="password" placeholder="Répétez le mot de passe" value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} required />
            </div>
            <button type="submit" className="btn btn-gold" style={{ width: '100%', justifyContent: 'center', padding: '14px', marginTop: '4px' }} disabled={loading}>
              {loading ? 'Création...' : 'Créer mon compte'}
            </button>
          </form>
          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--text-secondary)' }}>
            Déjà un compte ?{' '}
            <Link to="/login" style={{ color: 'var(--gold)', fontWeight: '600' }}>Se connecter</Link>
          </div>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
            ← Retour à la boutique
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
