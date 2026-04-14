import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('bencadi_cart')) || [];
    } catch { return []; }
  });
  const [isOpen, setIsOpen] = useState(false);
  const [coupon, setCoupon] = useState(null);

  // Persist cart
  useEffect(() => {
    localStorage.setItem('bencadi_cart', JSON.stringify(items));
  }, [items]);

  const addItem = (product, quantity = 1, color = '') => {
    setItems(prev => {
      const key = `${product._id}-${color}`;
      const existing = prev.find(i => i.key === key);
      if (existing) {
        const newQty = existing.quantity + quantity;
        if (newQty > product.stock) {
          toast.error(`Stock maximum: ${product.stock} unités.`);
          return prev;
        }
        toast.success('Quantité mise à jour dans le panier.');
        return prev.map(i => i.key === key ? { ...i, quantity: newQty } : i);
      }
      if (quantity > product.stock) {
        toast.error(`Stock insuffisant. Maximum: ${product.stock} unités.`);
        return prev;
      }
      toast.success(`${product.name} ajouté au panier !`);
      return [...prev, {
        key,
        product: {
          _id: product._id,
          name: product.name,
          price: product.price,
          comparePrice: product.comparePrice,
          mainImage: product.mainImage,
          slug: product.slug,
          stock: product.stock,
        },
        quantity,
        color,
      }];
    });
    setIsOpen(true);
  };

  const removeItem = (key) => {
    setItems(prev => prev.filter(i => i.key !== key));
    toast.success('Article retiré du panier.');
  };

  const updateQuantity = (key, quantity) => {
    if (quantity < 1) return removeItem(key);
    setItems(prev =>
      prev.map(i => {
        if (i.key !== key) return i;
        if (quantity > i.product.stock) {
          toast.error(`Stock maximum: ${i.product.stock} unités.`);
          return i;
        }
        return { ...i, quantity };
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    setCoupon(null);
  };

  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const discount = coupon ? (coupon.discountType === 'percentage'
    ? (subtotal * coupon.discountValue) / 100
    : coupon.discountValue) : 0;
  const shippingCost = subtotal >= 100000 ? 0 : 3000;
  const total = subtotal - discount + shippingCost;
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const applyCoupon = (couponData, discountAmount) => {
    setCoupon({ ...couponData, calculatedDiscount: discountAmount });
    toast.success(`Code promo appliqué ! -${discountAmount.toLocaleString()} FCFA`);
  };

  const removeCoupon = () => {
    setCoupon(null);
    toast.success('Code promo retiré.');
  };

  return (
    <CartContext.Provider value={{
      items, isOpen, setIsOpen,
      addItem, removeItem, updateQuantity, clearCart,
      subtotal, discount, shippingCost, total, itemCount,
      coupon, applyCoupon, removeCoupon,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
