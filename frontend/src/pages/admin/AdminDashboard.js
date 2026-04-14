import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingBag, Users, TrendingUp, AlertCircle, Plus, Eye, Tag, Flame, Settings, Store } from 'lucide-react';
import { productAPI, orderAPI, userAPI } from '../../utils/api';
import { useSettings } from '../../context/SettingsContext';

export default function AdminDashboard() {
  const { formatPrice } = useSettings();
  const [stats, setStats] = useState({ products: {}, orders: {}, users: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [prodStats, ordStats, usersRes, ordersRes] = await Promise.all([
          productAPI.getStats(),
          orderAPI.getStats(),
          userAPI.getAll({ limit: 1 }),
          orderAPI.getAll({ limit: 6 }),
        ]);
        setStats({
          products: prodStats.data.stats,
          orders: ordStats.data.stats,
          users: usersRes.data.pagination?.total || 0,
        });
        setRecentOrders(ordersRes.data.orders || []);
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  const statusColors = {
    pending: { bg: '#fff3e0', color: '#e65100', label: 'En attente' },
    confirmed: { bg: '#e3f2fd', color: '#1565c0', label: 'Confirmée' },
    processing: { bg: '#f3e5f5', color: '#6a1b9a', label: 'En cours' },
    shipped: { bg: '#e0f2f1', color: '#00695c', label: 'Expédiée' },
    delivered: { bg: '#e8f5e9', color: '#1b5e20', label: 'Livrée' },
    cancelled: { bg: '#fce4ec', color: '#c62828', label: 'Annulée' },
  };

  const kpis = [
    { label: 'Produits publiés', val: stats.products.published || 0, icon: Package, color: '#4A90D9', sub: `${stats.products.outOfStock || 0} en rupture`, link: '/admin/produits' },
    { label: 'Commandes totales', val: stats.orders.totalOrders || 0, icon: ShoppingBag, color: '#E67E22', sub: `${stats.orders.pendingOrders || 0} en attente`, link: '/admin/commandes' },
    { label: 'Chiffre d\'affaires', val: formatPrice(stats.orders.totalRevenue || 0), icon: TrendingUp, color: '#c9a84c', sub: 'Commandes payées', link: '/admin/commandes' },
    { label: 'Utilisateurs', val: stats.users, icon: Users, color: '#9B59B6', sub: 'Clients enregistrés', link: '/admin/utilisateurs' },
  ];

  const quickActions = [
    { label: 'Nouveau produit', to: '/admin/produits/nouveau', Icon: Plus, style: 'btn-gold' },
    { label: 'Voir commandes', to: '/admin/commandes', Icon: Eye, style: 'btn-outline' },
    { label: 'Gérer promos', to: '/admin/promos', Icon: Package, style: 'btn-outline' },
    { label: 'Paramètres', to: '/admin/parametres', Icon: Package, style: 'btn-outline' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <h1 style={{ fontFamily: "Nunito, sans-serif", fontSize: '26px', fontWeight: '700' }}>Tableau de bord</h1>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {quickActions.slice(0, 2).map(a => (
            <Link key={a.to} to={a.to} className={`btn ${a.style} btn-sm`} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <a.Icon size={14} /> {a.label}
            </Link>
          ))}
        </div>
      </div>

      {/* KPIs */}
      {loading ? (
        <div className="grid-4" style={{ marginBottom: '28px' }}>
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: '110px', borderRadius: 'var(--radius-lg)' }} />)}
        </div>
      ) : (
        <div className="grid-4" style={{ marginBottom: '28px' }}>
          {kpis.map(kpi => (
            <Link key={kpi.label} to={kpi.link} style={{ textDecoration: 'none', display: 'block' }}>
              <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: '20px', boxShadow: 'var(--shadow-sm)', transition: 'var(--transition)', borderLeft: `4px solid ${kpi.color}` }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', background: `${kpi.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <kpi.icon size={22} style={{ color: kpi.color }} />
                  </div>
                </div>
                <div style={{ fontFamily: "Nunito, sans-serif", fontSize: '24px', fontWeight: '700', color: 'var(--charcoal)', marginBottom: '2px' }}>{kpi.val}</div>
                <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '2px' }}>{kpi.label}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{kpi.sub}</div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Alerts */}
      {stats.products.outOfStock > 0 && (
        <div style={{ background: '#fff3e0', border: '1px solid #ffcc02', borderRadius: 'var(--radius-lg)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
          <AlertCircle size={20} style={{ color: '#e65100', flexShrink: 0 }} />
          <span style={{ fontSize: '14px', color: '#e65100' }}>
            <b>{stats.products.outOfStock}</b> produit{stats.products.outOfStock > 1 ? 's' : ''} en rupture de stock.{' '}
            <Link to="/admin/produits?inStock=false" style={{ fontWeight: '600', textDecoration: 'underline' }}>Gérer le stock</Link>
          </span>
        </div>
      )}

      {/* Recent Orders */}
      <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-xl)', padding: '24px', boxShadow: 'var(--shadow-sm)', marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontFamily: "Nunito, sans-serif", fontSize: '18px', fontWeight: '700' }}>Commandes récentes</h2>
          <Link to="/admin/commandes" style={{ fontSize: '13px', color: 'var(--gold)', fontWeight: '600' }}>Voir tout →</Link>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--cream-dark)' }}>
                {['Commande', 'Client', 'Date', 'Total', 'Statut', ''].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>Aucune commande</td></tr>
              ) : recentOrders.map(order => {
                const st = statusColors[order.status] || { bg: 'var(--cream)', color: 'var(--text-muted)', label: order.status };
                return (
                  <tr key={order._id} style={{ borderBottom: '1px solid var(--cream-dark)' }}>
                    <td style={{ padding: '12px 12px', fontWeight: '600' }}>#{order.orderNumber}</td>
                    <td style={{ padding: '12px 12px', color: 'var(--text-secondary)' }}>{order.user?.name || order.guestName || 'Invité'}</td>
                    <td style={{ padding: '12px 12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{new Date(order.createdAt).toLocaleDateString('fr-FR')}</td>
                    <td style={{ padding: '12px 12px', fontWeight: '700', color: 'var(--gold)' }}>{formatPrice(order.totalAmount)}</td>
                    <td style={{ padding: '12px 12px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '11px', fontWeight: '700', background: st.bg, color: st.color, whiteSpace: 'nowrap' }}>{st.label}</span>
                    </td>
                    <td style={{ padding: '12px 12px' }}>
                      <Link to={`/admin/commandes/${order._id}`} style={{ fontSize: '12px', color: 'var(--gold)', fontWeight: '600' }}>Détail →</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '14px' }}>
        {[
          { label: 'Nouveau produit', to: '/admin/produits/nouveau', color: 'var(--charcoal)', Icon: Plus },
          { label: 'Catégories',      to: '/admin/categories',        color: '#4A90D9',         Icon: Tag },
          { label: 'Créer une promo', to: '/admin/promos',            color: '#e65100',         Icon: Flame },
          { label: 'Gérer équipe',    to: '/admin/utilisateurs',      color: '#9B59B6',         Icon: Users },
          { label: 'Paramètres',      to: '/admin/parametres',        color: '#5c3d2e',         Icon: Settings },
          { label: 'Voir boutique',   to: '/',                        color: '#22c55e',         Icon: Store },
        ].map(a => (
          <Link key={a.to} to={a.to}
            style={{ padding: '16px', background: 'var(--white)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', fontSize: '14px', fontWeight: '600', color: a.color, textDecoration: 'none', transition: 'var(--transition)', textAlign: 'center', borderTop: `3px solid ${a.color}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}>
            <a.Icon size={20} />
            {a.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
