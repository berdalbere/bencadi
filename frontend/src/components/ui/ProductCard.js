import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star, Eye } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';

export default function ProductCard({ product, size = 'md' }) {
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist, user } = useAuth();
  const { formatPrice } = useSettings();
  const [hovered, setHovered] = useState(false);
  const [wishloading, setWishloading] = useState(false);

  const inWishlist = isInWishlist(product._id);
  const isSmall = size === 'sm';

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setWishloading(true);
    await toggleWishlist(product._id);
    setWishloading(false);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
  };

  const discount = product.comparePrice && product.comparePrice > product.price
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  return (
    <Link to={`/produits/${product.slug}`}
      style={{ textDecoration: 'none', display: 'block' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        background: 'var(--white)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        boxShadow: hovered ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
        transform: hovered ? 'translateY(-4px)' : 'none',
        transition: 'var(--transition)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Image Container */}
        <div style={{ position: 'relative', paddingBottom: isSmall ? '75%' : '80%', overflow: 'hidden', background: 'var(--cream)' }}>
          <img
            src={product.mainImage || `https://via.placeholder.com/400x320/faf8f5/c9a84c?text=${encodeURIComponent(product.name.slice(0,15))}`}
            alt={product.name}
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              objectFit: 'cover',
              transform: hovered ? 'scale(1.06)' : 'scale(1)',
              transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1)',
            }}
            loading="lazy"
          />

          {/* Badges */}
          <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {product.isNew && <span className="badge badge-new" style={{ fontSize: '10px' }}>NEW</span>}
            {product.isPromo && product.promoLabel && (
              <span className="badge badge-promo" style={{ fontSize: '10px' }}>{product.promoLabel || `−${discount}%`}</span>
            )}
            {product.isFeatured && !product.isNew && !product.isPromo && (
              <span className="badge badge-featured" style={{ fontSize: '10px' }}>⭐</span>
            )}
            {product.stock === 0 && <span className="badge badge-out" style={{ fontSize: '10px' }}>Épuisé</span>}
          </div>

          {/* Actions on hover */}
          <div style={{
            position: 'absolute', top: '10px', right: '10px',
            display: 'flex', flexDirection: 'column', gap: '6px',
            opacity: hovered ? 1 : 0,
            transform: hovered ? 'translateX(0)' : 'translateX(10px)',
            transition: 'var(--transition)',
          }}>
            <button
              onClick={handleWishlist}
              disabled={wishloading}
              style={{
                width: '34px', height: '34px', borderRadius: '50%',
                background: 'var(--white)', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'var(--shadow-md)', transition: 'var(--transition)',
                color: inWishlist ? '#e91e63' : 'var(--text-secondary)',
              }}
              title={inWishlist ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            >
              <Heart size={16} fill={inWishlist ? '#e91e63' : 'none'} />
            </button>
          </div>

          {/* Add to cart overlay */}
          {product.stock > 0 && (
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
              padding: '32px 12px 12px',
              opacity: hovered ? 1 : 0,
              transform: hovered ? 'translateY(0)' : 'translateY(8px)',
              transition: 'var(--transition)',
            }}>
              <button
                onClick={handleAddToCart}
                style={{
                  width: '100%', padding: '9px 16px',
                  background: 'linear-gradient(135deg, var(--gold), var(--gold-dark))',
                  color: 'var(--white)', border: 'none', borderRadius: 'var(--radius-md)',
                  fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  transition: 'var(--transition)',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                <ShoppingBag size={14} />
                Ajouter au panier
              </button>
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: isSmall ? '12px' : '14px', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {product.category && (
            <span style={{ fontSize: '11px', color: 'var(--gold)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {product.category.name || product.category}
            </span>
          )}
          <h3 style={{
            fontSize: isSmall ? '13px' : '14px',
            fontWeight: '600',
            fontFamily: 'Nunito, sans-serif',
            color: 'var(--text-primary)',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            lineHeight: 1.4,
          }}>
            {product.name}
          </h3>

          {/* Rating */}
          {product.numReviews > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ display: 'flex', gap: '1px' }}>
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={12}
                    fill={s <= Math.round(product.rating) ? 'var(--gold)' : 'none'}
                    color={s <= Math.round(product.rating) ? 'var(--gold)' : '#ddd'}
                  />
                ))}
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>({product.numReviews})</span>
            </div>
          )}

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px', marginTop: 'auto', paddingTop: '4px' }}>
            <span style={{ fontSize: isSmall ? '15px' : '17px', fontWeight: '700', color: 'var(--charcoal)' }}>
              {formatPrice(product.price)}
            </span>
            {product.comparePrice > 0 && product.comparePrice > product.price && (
              <>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                  {formatPrice(product.comparePrice)}
                </span>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#e65100', background: '#fff3e0', padding: '1px 5px', borderRadius: 'var(--radius-full)' }}>
                  -{discount}%
                </span>
              </>
            )}
          </div>

          {product.stock === 0 && (
            <span style={{ fontSize: '12px', color: 'var(--error)', fontWeight: '500' }}>Rupture de stock</span>
          )}
        </div>
      </div>
    </Link>
  );
}
