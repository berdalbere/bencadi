import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('bencadi_token');
    if (!token) { setLoading(false); setInitialized(true); return; }
    try {
      const { data } = await authAPI.getMe();
      setUser(data.user);
    } catch {
      localStorage.removeItem('bencadi_token');
      localStorage.removeItem('bencadi_user');
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('bencadi_token', data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (name, email, password, phone) => {
    const { data } = await authAPI.register({ name, email, password, phone });
    localStorage.setItem('bencadi_token', data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('bencadi_token');
    setUser(null);
    toast.success('Déconnexion réussie.');
  };

  const updateUser = (updatedUser) => setUser(updatedUser);

  const toggleWishlist = async (productId) => {
    if (!user) { toast.error('Connectez-vous pour gérer votre liste de souhaits.'); return false; }
    try {
      const { data } = await authAPI.toggleWishlist(productId);
      await loadUser(); // Refresh user
      return data.inWishlist;
    } catch {
      return false;
    }
  };

  const isInWishlist = (productId) => {
    if (!user?.wishlist) return false;
    return user.wishlist.some(item =>
      (typeof item === 'string' ? item : item._id) === productId
    );
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const isStaff = user && user.role !== 'client';
  const hasPermission = (perm) =>
    isAdmin || (user?.permissions && user.permissions[perm]);

  return (
    <AuthContext.Provider value={{
      user, loading, initialized,
      login, register, logout, updateUser,
      toggleWishlist, isInWishlist,
      isAdmin, isStaff, hasPermission,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
