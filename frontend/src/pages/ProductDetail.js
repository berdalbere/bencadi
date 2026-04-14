import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, Share2, Star, ChevronRight, Minus, Plus, Check, Truck, Shield, RotateCcw } from 'lucide-react';
import { productAPI } from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import ProductCard from '../components/ui/ProductCard';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user, toggleWishlist, isInWishlist } = useAuth();
  const { formatPrice } = useSettings();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('');
  const [activeTab, setActiveTab] = useState('description');
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [wishLoading, setWishLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await productAPI.getOne(slug);
        setProduct(data.product);
        setRelated(data.related || []);
        if (data.product.colors?.length > 0) setSelectedColor(data.product.colors[0]);
      } catch { navigate('/404'); }
      finally { setLoading(false); }
    };
    load();
  }, [slug]);

  const allImages = product
    ? [product.mainImage, ...(product.images || [])].filter(Boolean)
    : [];

  const discount = product?.comparePrice > product?.price
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100) : 0;

  const handleAddToCart = () => {
    if (!product || product.stock === 0) return;
    addItem(product, quantity, selectedColor);
  };

  const handleBuyNow = () => {
    if (!product || product.stock === 0) return;
    addItem(product, quantity, selectedColor);
    navigate('/commander');
  };

  const handleWishlist = async () => {
    setWishLoading(true);
    await toggleWishlist(product._id);
    setWishLoading(false);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Connectez-vous pour laisser un avis.'); return; }
    if (!reviewForm.comment.trim()) { toast.error('Veuillez écrire un commentaire.'); return; }
    setReviewLoading(true);
    try {
      await productAPI.addReview(product._id, reviewForm);
      toast.success('Avis ajouté avec succès !');
      const { data } = await productAPI.getOne(slug);
      setProduct(data.product);
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'ajout.');
    } finally { setReviewLoading(false); }
  };

  const handleShare = () => {
    navigator.share?.({
      title: product.name,
      url: window.location.href,
    }) || navigator.clipboard.writeText(window.location.href).then(() => toast.success('Lien copié !'));
  };

  if (loading) return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px' }}>
        <div className="skeleton" style={{ aspectRatio: '1', borderRadius: 'var(--radius-lg)' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[100, 70, 50, 80, 60, 40].map((w, i) => (
            <div key={i} className="skeleton" style={{ height: i === 0 ? '32px' : '16px', width: `${w}%`, borderRadius: '8px' }} />
          ))}
        </div>
      </div>
    </div>
  );

  if (!product) return null;

  return (
    <div style={{ background: 'var(--bg-main)', minHeight: '100vh' }}>
      <div className="container" style={{ padding: '24px' }}>
        {/* Breadcrumb */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '28px', flexWrap: 'wrap' }}>
          <Link to="/" style={{ color: 'var(--text-muted)' }}>Accueil</Link>
          <ChevronRight size={14} />
          <Link to="/produits" style={{ color: 'var(--text-muted)' }}>Produits</Link>
          {product.category && <><ChevronRight size={14} /><Link to={`/categorie/${product.category.slug}`} style={{ color: 'var(--text-muted)' }}>{product.category.name}</Link></>}
          <ChevronRight size={14} />
          <span style={{ color: 'var(--charcoal)', fontWeight: '500' }}>{product.name}</span>
        </nav>

        {/* Main content */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', marginBottom: '60px' }}>
          {/* Images */}
          <div>
            <div style={{ position: 'relative', borderRadius: 'var(--radius-xl)', overflow: 'hidden', background: 'var(--cream)', marginBottom: '12px', aspectRatio: '1' }}>
              <img src={allImages[activeImage] || '/placeholder.png'} alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              {discount > 0 && (
                <div style={{ position: 'absolute', top: '16px', left: '16px', background: '#e65100', color: 'var(--white)', padding: '6px 12px', borderRadius: 'var(--radius-full)', fontSize: '13px', fontWeight: '700' }}>
                  -{discount}%
                </div>
              )}
              {product.isNew && (
                <div style={{ position: 'absolute', top: discount > 0 ? '52px' : '16px', left: '16px', background: '#22c55e', color: 'var(--white)', padding: '6px 12px', borderRadius: 'var(--radius-full)', fontSize: '13px', fontWeight: '700' }}>
                  NEW
                </div>
              )}
            </div>
            {allImages.length > 1 && (
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                {allImages.map((img, i) => (
                  <button key={i} onClick={() => setActiveImage(i)}
                    style={{ width: '72px', height: '72px', flexShrink: 0, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: `2px solid ${i === activeImage ? 'var(--gold)' : 'transparent'}`, cursor: 'pointer', transition: 'var(--transition)', padding: 0 }}>
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {product.category && (
              <Link to={`/categorie/${product.category.slug}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--gold)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {product.category.icon} {product.category.name}
              </Link>
            )}
            <h1 style={{ fontFamily: "Nunito, sans-serif", fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: '700', lineHeight: 1.2 }}>{product.name}</h1>

            {/* Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '2px' }}>
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={16} fill={s <= Math.round(product.rating) ? 'var(--gold)' : 'none'} color={s <= Math.round(product.rating) ? 'var(--gold)' : '#ddd'} />
                ))}
              </div>
              <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{product.rating} ({product.numReviews} avis)</span>
              <span style={{ color: 'var(--cream-dark)' }}>|</span>
              <span style={{ fontSize: '14px', color: product.stock > 0 ? '#22c55e' : 'var(--error)', fontWeight: '600' }}>
                {product.stock > 0 ? `✓ En stock (${product.stock})` : '✗ Rupture de stock'}
              </span>
            </div>

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: 'var(--cream)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '28px', fontWeight: '800', color: 'var(--charcoal)' }}>{formatPrice(product.price)}</span>
              {product.comparePrice > product.price && (
                <span style={{ fontSize: '16px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>{formatPrice(product.comparePrice)}</span>
              )}
              {discount > 0 && (
                <span style={{ background: '#fff3e0', color: '#e65100', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '13px', fontWeight: '700' }}>Économie: {formatPrice(product.comparePrice - product.price)}</span>
              )}
            </div>

            {/* Short desc */}
            {product.shortDescription && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.7 }}>{product.shortDescription}</p>
            )}

            {/* Colors */}
            {product.colors?.length > 0 && (
              <div>
                <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Couleur: <span style={{ color: 'var(--gold)' }}>{selectedColor}</span></p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {product.colors.map(c => (
                    <button key={c} onClick={() => setSelectedColor(c)}
                      style={{ padding: '6px 16px', borderRadius: 'var(--radius-full)', border: `2px solid ${selectedColor === c ? 'var(--gold)' : 'var(--cream-dark)'}`, background: selectedColor === c ? 'rgba(201,168,76,0.1)' : 'transparent', fontSize: '13px', fontWeight: '500', cursor: 'pointer', transition: 'var(--transition)', color: selectedColor === c ? 'var(--gold)' : 'var(--text-secondary)' }}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '14px', fontWeight: '600' }}>Quantité:</span>
              <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--cream-dark)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)', border: 'none', cursor: 'pointer', transition: 'var(--transition)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--cream-dark)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--cream)'}>
                  <Minus size={14} />
                </button>
                <span style={{ width: '48px', textAlign: 'center', fontSize: '16px', fontWeight: '700' }}>{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)', border: 'none', cursor: 'pointer', transition: 'var(--transition)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--cream-dark)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--cream)'}>
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button className="btn btn-gold" style={{ flex: 1, justifyContent: 'center', padding: '14px', minWidth: '140px' }}
                onClick={handleBuyNow} disabled={product.stock === 0}>
                <ShoppingBag size={18} /> Commander maintenant
              </button>
              <button className="btn btn-outline" style={{ justifyContent: 'center', padding: '14px 18px' }}
                onClick={handleAddToCart} disabled={product.stock === 0}>
                Ajouter au panier
              </button>
              <button onClick={handleWishlist} disabled={wishLoading}
                style={{ padding: '14px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--cream-dark)', background: 'transparent', cursor: 'pointer', transition: 'var(--transition)', color: isInWishlist(product._id) ? '#e91e63' : 'var(--text-muted)' }}>
                <Heart size={18} fill={isInWishlist(product._id) ? '#e91e63' : 'none'} />
              </button>
              <button onClick={handleShare}
                style={{ padding: '14px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--cream-dark)', background: 'transparent', cursor: 'pointer', transition: 'var(--transition)', color: 'var(--text-muted)' }}>
                <Share2 size={18} />
              </button>
            </div>

            {/* Trust badges */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', padding: '16px', background: 'var(--cream)', borderRadius: 'var(--radius-md)' }}>
              {[
                { Icon: Truck, label: 'Livraison rapide' },
                { Icon: Shield, label: 'Produit authentique' },
                { Icon: RotateCcw, label: 'Retour 30 jours' },
              ].map(({ Icon, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <Icon size={14} style={{ color: 'var(--gold)' }} /> {label}
                </div>
              ))}
            </div>

            {/* Brand / SKU */}
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              {product.brand && <span>Marque: <b style={{ color: 'var(--charcoal)' }}>{product.brand}</b></span>}
              {product.sku && <span>SKU: <b style={{ color: 'var(--charcoal)' }}>{product.sku}</b></span>}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ marginBottom: '60px' }}>
          <div style={{ display: 'flex', gap: '0', borderBottom: '2px solid var(--cream-dark)', marginBottom: '28px', overflowX: 'auto' }}>
            {[
              { key: 'description', label: 'Description' },
              { key: 'features', label: 'Caractéristiques' },
              { key: 'reviews', label: `Avis (${product.numReviews})` },
            ].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                style={{ padding: '12px 24px', fontSize: '15px', fontWeight: activeTab === tab.key ? '700' : '400', color: activeTab === tab.key ? 'var(--charcoal)' : 'var(--text-muted)', borderBottom: activeTab === tab.key ? '2px solid var(--gold)' : '2px solid transparent', marginBottom: '-2px', background: 'none', border: 'none', cursor: 'pointer', transition: 'var(--transition)', whiteSpace: 'nowrap' }}>
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'description' && (
            <div style={{ maxWidth: '720px', lineHeight: 1.8, color: 'var(--text-secondary)', fontSize: '15px' }}>
              {product.description}
            </div>
          )}

          {activeTab === 'features' && (
            <div style={{ maxWidth: '600px' }}>
              {product.features?.length > 0 ? (
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {product.features.map((f, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', background: 'var(--white)', borderRadius: 'var(--radius-md)', fontSize: '14px', boxShadow: 'var(--shadow-sm)' }}>
                      <Check size={16} style={{ color: 'var(--gold)', flexShrink: 0 }} /> {f}
                    </li>
                  ))}
                </ul>
              ) : <p style={{ color: 'var(--text-muted)' }}>Aucune caractéristique renseignée.</p>}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div style={{ maxWidth: '720px' }}>
              {/* Rating summary */}
              {product.numReviews > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', padding: '20px', background: 'var(--cream)', borderRadius: 'var(--radius-lg)', marginBottom: '24px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', fontWeight: '800', color: 'var(--charcoal)' }}>{product.rating}</div>
                    <div style={{ display: 'flex', gap: '2px', justifyContent: 'center' }}>
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} size={14} fill={s <= Math.round(product.rating) ? 'var(--gold)' : 'none'} color={s <= Math.round(product.rating) ? 'var(--gold)' : '#ddd'} />
                      ))}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{product.numReviews} avis</div>
                  </div>
                </div>
              )}

              {/* Reviews list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                {product.reviews?.map(r => (
                  <div key={r._id} style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '15px' }}>{r.name}</div>
                        <div style={{ display: 'flex', gap: '2px', marginTop: '4px' }}>
                          {[1,2,3,4,5].map(s => <Star key={s} size={13} fill={s <= r.rating ? 'var(--gold)' : 'none'} color={s <= r.rating ? 'var(--gold)' : '#ddd'} />)}
                        </div>
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(r.createdAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{r.comment}</p>
                  </div>
                ))}
              </div>

              {/* Review form */}
              {user ? (
                <form onSubmit={handleSubmitReview} style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
                  <h3 style={{ fontFamily: "Nunito, sans-serif", fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Laisser un avis</h3>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '6px' }}>Note</label>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {[1,2,3,4,5].map(s => (
                        <button key={s} type="button" onClick={() => setReviewForm(f => ({ ...f, rating: s }))}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}>
                          <Star size={24} fill={s <= reviewForm.rating ? 'var(--gold)' : 'none'} color={s <= reviewForm.rating ? 'var(--gold)' : '#ddd'} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea className="form-input form-textarea" placeholder="Votre avis sur ce produit..." value={reviewForm.comment}
                    onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                    style={{ marginBottom: '12px', minHeight: '90px' }} />
                  <button type="submit" className="btn btn-gold" disabled={reviewLoading}>
                    {reviewLoading ? 'Envoi...' : 'Publier mon avis'}
                  </button>
                </form>
              ) : (
                <div style={{ textAlign: 'center', padding: '24px', background: 'var(--cream)', borderRadius: 'var(--radius-lg)' }}>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>Connectez-vous pour laisser un avis</p>
                  <Link to="/login" className="btn btn-gold btn-sm">Se connecter</Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div style={{ marginBottom: '60px' }}>
            <h2 className="section-title" style={{ marginBottom: '32px' }}>Produits similaires</h2>
            <div className="grid-4">
              {related.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
