import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye, Package, Banknote, Smartphone, Landmark } from 'lucide-react';
import { orderAPI } from '../../utils/api';
import { useSettings } from '../../context/SettingsContext';

const STATUS = {
  pending:    { bg: '#fff3e0', color: '#e65100',  label: 'En attente' },
  confirmed:  { bg: '#e3f2fd', color: '#1565c0',  label: 'Confirmée' },
  processing: { bg: '#f3e5f5', color: '#6a1b9a',  label: 'En cours' },
  shipped:    { bg: '#e0f2f1', color: '#00695c',  label: 'Expédiée' },
  delivered:  { bg: '#e8f5e9', color: '#1b5e20',  label: 'Livrée' },
  cancelled:  { bg: '#fce4ec', color: '#c62828',  label: 'Annulée' },
};

export default function AdminOrders() {
  const { formatPrice } = useSettings();
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const load = async (p = 1, s = search, st = statusFilter) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 15 };
      if (s) params.search = s;
      if (st) params.status = st;
      const { data } = await orderAPI.getAll(params);
      setOrders(data.orders || []);
      setPagination(data.pagination || {});
    } catch { setOrders([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(page, search, statusFilter); }, [page, statusFilter]);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); load(1, search, statusFilter); };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h1 style={{ fontFamily: "Nunito, sans-serif", fontSize: '24px', fontWeight: '700' }}>
          Commandes <span style={{ fontSize: '16px', color: 'var(--text-muted)', fontFamily: 'Nunito' }}>({pagination.total || 0})</span>
        </h1>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', flex: 1, minWidth: '200px' }}>
          <input className="form-input" placeholder="N° commande, client..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, maxWidth: '300px' }} />
          <button type="submit" className="btn btn-outline btn-sm"><Search size={14} /></button>
        </form>
        <select className="form-input form-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          style={{ width: 'auto', padding: '8px 36px 8px 12px', fontSize: '14px' }}>
          <option value="">Tous les statuts</option>
          {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px', display: 'flex', justifyContent: 'center' }}><div className="spinner" /></div>
        ) : orders.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Package size={48} style={{ marginBottom: '12px', opacity: 0.4 }} />
            <p>Aucune commande trouvée.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: 'var(--cream)', borderBottom: '1px solid var(--cream-dark)' }}>
                  {['Commande', 'Client', 'Articles', 'Total', 'Paiement', 'Statut', 'Date', ''].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(order => {
                  const st = STATUS[order.status] || { bg: 'var(--cream)', color: 'var(--text-muted)', label: order.status };
                  const payIcons = { cash_on_delivery: <><Banknote size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />Livraison</>, mobile_money: <><Smartphone size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />Mobile</>, bank_transfer: <><Landmark size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />Virement</> };
                  return (
                    <tr key={order._id} style={{ borderBottom: '1px solid var(--cream-dark)', transition: 'var(--transition)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--cream)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '12px 16px', fontWeight: '700' }}>#{order.orderNumber}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: '500', fontSize: '13px' }}>{order.user?.name || order.guestName || 'Invité'}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{order.user?.email || order.guestEmail || ''}</div>
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                        {order.items?.length || 0} art.
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: '700', color: 'var(--gold)', whiteSpace: 'nowrap' }}>{formatPrice(order.totalAmount)}</td>
                      <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        {payIcons[order.paymentMethod] || order.paymentMethod}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '11px', fontWeight: '700', background: st.bg, color: st.color, whiteSpace: 'nowrap' }}>{st.label}</span>
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '12px', whiteSpace: 'nowrap' }}>
                        {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <Link to={`/admin/commandes/${order._id}`} className="btn btn-sm btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                          <Eye size={13} /> Détail
                        </Link>
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
              style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', border: i + 1 === page ? 'none' : '1.5px solid var(--cream-dark)', background: i + 1 === page ? 'var(--charcoal)' : 'var(--white)', color: i + 1 === page ? 'var(--white)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: i + 1 === page ? '700' : '400', fontSize: '13px' }}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
