import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Tag, ShoppingBag, Users, Percent, Settings, LogOut, Menu, X, ChevronRight, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Tableau de bord', exact: true },
  { to: '/admin/produits', icon: Package, label: 'Produits', perm: 'manageProducts' },
  { to: '/admin/categories', icon: Tag, label: 'Catégories', perm: 'manageProducts' },
  { to: '/admin/commandes', icon: ShoppingBag, label: 'Commandes', perm: 'manageOrders' },
  { to: '/admin/utilisateurs', icon: Users, label: 'Utilisateurs', perm: 'manageUsers' },
  { to: '/admin/promos', icon: Percent, label: 'Promotions', perm: 'managePromos' },
  { to: '/admin/parametres', icon: Settings, label: 'Paramètres', perm: 'manageSettings' },
];

export default function AdminLayout() {
  const { user, logout, hasPermission } = useAuth();
  const { settings } = useSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (to, exact) => exact ? location.pathname === to : location.pathname.startsWith(to);

  const handleLogout = () => { logout(); navigate('/'); };

  const visibleNav = navItems.filter(item => !item.perm || hasPermission(item.perm) || user?.role === 'admin' || user?.role === 'superadmin');

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div style={{ padding: collapsed ? '20px 16px' : '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {!collapsed && (
          <Link to="/admin" style={{ fontFamily: "Nunito, sans-serif", fontSize: '22px', fontWeight: '800', background: 'linear-gradient(135deg, #fff, var(--gold))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {settings.siteName || 'BENCADİ'}
          </Link>
        )}
        <button onClick={() => setCollapsed(!collapsed)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 'var(--radius-sm)', padding: '6px', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center' }} className="desktop-collapse">
          {collapsed ? <ChevronRight size={16} /> : <Menu size={16} />}
        </button>
        <button onClick={() => setSidebarOpen(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 'var(--radius-sm)', padding: '6px', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center' }} className="mobile-close">
          <X size={16} />
        </button>
      </div>

      {/* Nav */}
      <nav style={{ padding: '12px 10px', flex: 1 }}>
        {visibleNav.map(item => (
          <Link key={item.to} to={item.to} onClick={() => setSidebarOpen(false)}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: collapsed ? '12px 14px' : '11px 14px',
              borderRadius: 'var(--radius-md)', marginBottom: '2px',
              fontSize: '14px', fontWeight: isActive(item.to, item.exact) ? '600' : '400',
              color: isActive(item.to, item.exact) ? 'var(--white)' : 'rgba(255,255,255,0.6)',
              background: isActive(item.to, item.exact) ? 'rgba(201,168,76,0.25)' : 'transparent',
              borderLeft: isActive(item.to, item.exact) ? '3px solid var(--gold)' : '3px solid transparent',
              transition: 'var(--transition)',
              textDecoration: 'none',
              justifyContent: collapsed ? 'center' : 'flex-start',
              title: collapsed ? item.label : undefined,
            }}
            onMouseEnter={e => { if (!isActive(item.to, item.exact)) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'var(--white)'; } }}
            onMouseLeave={e => { if (!isActive(item.to, item.exact)) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; } }}>
            <item.icon size={18} style={{ flexShrink: 0 }} />
            {!collapsed && item.label}
          </Link>
        ))}
      </nav>

      {/* User */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: 'var(--radius-md)', color: 'rgba(255,255,255,0.6)', fontSize: '13px', transition: 'var(--transition)', marginBottom: '4px', justifyContent: collapsed ? 'center' : 'flex-start', textDecoration: 'none' }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--white)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.background = 'transparent'; }}>
          {!collapsed && '← Voir la boutique'}
        </Link>
        <button onClick={handleLogout}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: 'var(--radius-md)', color: 'rgba(255,100,100,0.8)', fontSize: '13px', width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', transition: 'var(--transition)', justifyContent: collapsed ? 'center' : 'flex-start' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.color = '#ef4444'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,100,100,0.8)'; }}>
          <LogOut size={16} /> {!collapsed && 'Déconnexion'}
        </button>
      </div>
    </>
  );

  return (
    <div className="admin-layout">
      {/* Desktop Sidebar */}
      <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''} ${sidebarOpen ? 'open' : ''}`} style={{ display: 'flex', flexDirection: 'column' }}>
        <SidebarContent />
      </aside>
      {sidebarOpen && <div className="overlay" onClick={() => setSidebarOpen(false)} style={{ zIndex: 999 }} />}

      {/* Main */}
      <div className="admin-main">
        {/* Topbar */}
        <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--cream-dark)', padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50, boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => setSidebarOpen(true)} style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', padding: '6px' }} className="mobile-menu-btn">
              <Menu size={22} />
            </button>
            <span className="hide-mobile" style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              Administration — <span style={{ color: 'var(--charcoal)', fontWeight: '600' }}>{settings.siteName || 'BENCADİ'}</span>
            </span>
            <span className="show-mobile" style={{ fontSize: '14px', fontWeight: '700', color: 'var(--charcoal)' }}>
              Admin
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '6px', position: 'relative' }}>
              <Bell size={18} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', background: 'var(--cream)', borderRadius: 'var(--radius-full)' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--charcoal)', color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', flexShrink: 0 }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="hide-mobile" style={{ fontSize: '13px', fontWeight: '500' }}>{user?.name?.split(' ')[0]}</span>
              <span className="hide-mobile" style={{ fontSize: '11px', padding: '2px 7px', background: 'var(--charcoal)', color: 'var(--gold)', borderRadius: 'var(--radius-full)', fontWeight: '700' }}>
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div style={{ padding: 'clamp(16px, 3vw, 28px)', minHeight: 'calc(100vh - 60px)' }}>
          <Outlet />
        </div>
      </div>

    </div>
  );
}
