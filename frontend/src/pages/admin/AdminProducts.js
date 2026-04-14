import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, Eye, EyeOff, Star } from 'lucide-react';
import { productAPI } from '../../utils/api';
import { useSettings } from '../../context/SettingsContext';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const { formatPrice } = useSettings();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState(null);

  const load = async (p = page, s = search) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 15, sort: 'newest' };
      if (s) params.search = s;
      const { data } = await productAPI.getAll({ ...params, isPublished: undefined });
      setProducts(data.products || []);
      setPagination(data.pagination || {});
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load(1, search);
  };

  const handleDelete = async (id) => {
    try {
      await productAPI.delete(id);
      toast.success('Produit supprimé.');
      setDeleteId(null);
      load();
    } catch { toast.error('Erreur lors de la suppression.'); }
  };

  const togglePublish = async (product) => {
    try {
      await productAPI.update(product._id, { isPublished: !product.isPublished });
      toast.success(product.isPublished ? 'Produit masqué.' : 'Produit publié.');
      load();
    } catch { toast.error('Erreur.'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h1 style={{ fontFamily: "Nunito, sans-serif", fontSize: '24px', fontWeight: '700' }}>
          Produits <span style={{ fontSize: '16px', color: 'var(--text-muted)', fontFamily: 'Nunito' }}>({pagination.total || 0})</span>
        </h1>
        <Link to="/admin/produits/nouveau" className="btn btn-gold btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={16} /> Nouveau produit
        </Link>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input className="form-input" placeholder="Rechercher par nom, marque..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: '380px' }} />
        <button type="submit" className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Search size={15} /> Chercher
        </button>
        {search && <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); load(1, ''); }}>Effacer</button>}
      </form>

      {/* Table */}
      <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px', display: 'flex', justifyContent: 'center' }}><div className="spinner" /></div>
        ) : products.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📦</div>
            <p>Aucun produit trouvé.</p>
            <Link to="/admin/produits/nouveau" className="btn btn-gold btn-sm" style={{ marginTop: '16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={14} /> Ajouter un produit
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: 'var(--cream)', borderBottom: '1px solid var(--cream-dark)' }}>
                  {['Produit', 'Catégorie', 'Prix', 'Stock', 'Statut', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p._id} style={{ borderBottom: '1px solid var(--cream-dark)', transition: 'var(--transition)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--cream)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src={p.mainImage || '/placeholder.png'} alt={p.name} style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', flexShrink: 0, background: 'var(--cream-dark)' }} />
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '13px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
                            {p.isNew && <span style={{ color: '#22c55e' }}>NEW</span>}
                            {p.isPromo && <span style={{ color: '#e65100' }}>PROMO</span>}
                            {p.isFeatured && <span style={{ color: 'var(--gold)' }}>★</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {p.category?.name || '—'}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: '700', whiteSpace: 'nowrap' }}>
                      {formatPrice(p.price)}
                      {p.comparePrice > p.price && (
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>{formatPrice(p.comparePrice)}</div>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontWeight: '600', color: p.stock === 0 ? 'var(--error)' : p.stock < 5 ? '#f59e0b' : '#22c55e', fontSize: '13px' }}>
                        {p.stock === 0 ? '⚠ Épuisé' : p.stock < 5 ? `⚠ ${p.stock}` : p.stock}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '11px', fontWeight: '700', background: p.isPublished ? '#e8f5e9' : '#f5f5f5', color: p.isPublished ? '#22c55e' : 'var(--text-muted)' }}>
                        {p.isPublished ? '● Publié' : '○ Masqué'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <Link to={`/produits/${p.slug}`} target="_blank" style={{ padding: '6px', borderRadius: 'var(--radius-sm)', background: 'var(--cream)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', transition: 'var(--transition)' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--cream-dark)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'var(--cream)'}>
                          <Eye size={14} />
                        </Link>
                        <button onClick={() => togglePublish(p)} style={{ padding: '6px', borderRadius: 'var(--radius-sm)', background: 'var(--cream)', border: 'none', cursor: 'pointer', color: p.isPublished ? '#f59e0b' : '#22c55e', display: 'flex', alignItems: 'center', transition: 'var(--transition)' }}
                          title={p.isPublished ? 'Masquer' : 'Publier'}>
                          {p.isPublished ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <Link to={`/admin/produits/${p._id}/modifier`} style={{ padding: '6px', borderRadius: 'var(--radius-sm)', background: '#e3f2fd', color: '#1565c0', display: 'flex', alignItems: 'center', transition: 'var(--transition)' }}>
                          <Edit size={14} />
                        </Link>
                        <button onClick={() => setDeleteId(p._id)} style={{ padding: '6px', borderRadius: 'var(--radius-sm)', background: '#fce4ec', color: '#c62828', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'var(--transition)' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
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

      {/* Delete confirm modal */}
      {deleteId && (
        <>
          <div className="overlay" onClick={() => setDeleteId(null)} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'var(--white)', borderRadius: 'var(--radius-xl)', padding: '32px', width: 'min(400px, 90vw)', zIndex: 1000, boxShadow: 'var(--shadow-xl)', textAlign: 'center', animation: 'slideUp 0.2s ease' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗑️</div>
            <h3 style={{ fontFamily: "Nunito, sans-serif", fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>Supprimer ce produit ?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>Cette action est irréversible.</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="btn btn-outline" onClick={() => setDeleteId(null)}>Annuler</button>
              <button className="btn" style={{ background: 'var(--error)', color: 'var(--white)' }} onClick={() => handleDelete(deleteId)}>Supprimer</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
