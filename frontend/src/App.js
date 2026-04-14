import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SettingsProvider } from './context/SettingsContext';

// Layouts
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import CartDrawer from './components/layout/CartDrawer';
import ScrollToTop from './components/ui/ScrollToTop';

// Public Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';
import Promos from './pages/Promos';
import NewArrivals from './pages/NewArrivals';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

// Admin Pages
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminProductForm from './pages/admin/AdminProductForm';
import AdminCategories from './pages/admin/AdminCategories';
import AdminOrders from './pages/admin/AdminOrders';
import AdminOrderDetail from './pages/admin/AdminOrderDetail';
import AdminUsers from './pages/admin/AdminUsers';
import AdminPromos from './pages/admin/AdminPromos';
import AdminSettings from './pages/admin/AdminSettings';

// Guards
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="spinner" /></div>;
  return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user, loading, isStaff } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!isStaff) return <Navigate to="/" replace />;
  return children;
};

const PublicLayout = ({ children }) => (
  <>
    <Header />
    <main style={{ minHeight: '100vh' }}>
      {children}
    </main>
    <Footer />
    <CartDrawer />
  </>
);

function App() {
  return (
    <Router>
      <SettingsProvider>
        <AuthProvider>
          <CartProvider>
            <ScrollToTop />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  fontFamily: 'Nunito, sans-serif',
                  fontSize: '14px',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                },
                success: { iconTheme: { primary: '#c9a84c', secondary: '#fff' } },
              }}
            />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
              <Route path="/produits" element={<PublicLayout><Products /></PublicLayout>} />
              <Route path="/produits/:slug" element={<PublicLayout><ProductDetail /></PublicLayout>} />
              <Route path="/categorie/:slug" element={<PublicLayout><Products /></PublicLayout>} />
              <Route path="/panier" element={<PublicLayout><Cart /></PublicLayout>} />
              <Route path="/commander" element={<PublicLayout><Checkout /></PublicLayout>} />
              <Route path="/commande-confirmee/:id" element={<PublicLayout><OrderConfirmation /></PublicLayout>} />
              <Route path="/promos" element={<PublicLayout><Promos /></PublicLayout>} />
              <Route path="/nouveautes" element={<PublicLayout><NewArrivals /></PublicLayout>} />
              <Route path="/a-propos" element={<PublicLayout><About /></PublicLayout>} />
              <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profil" element={<PrivateRoute><PublicLayout><Profile /></PublicLayout></PrivateRoute>} />
              <Route path="/favoris" element={<PrivateRoute><PublicLayout><Wishlist /></PublicLayout></PrivateRoute>} />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                <Route index element={<AdminDashboard />} />
                <Route path="produits" element={<AdminProducts />} />
                <Route path="produits/nouveau" element={<AdminProductForm />} />
                <Route path="produits/:id/modifier" element={<AdminProductForm />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="commandes" element={<AdminOrders />} />
                <Route path="commandes/:id" element={<AdminOrderDetail />} />
                <Route path="utilisateurs" element={<AdminUsers />} />
                <Route path="promos" element={<AdminPromos />} />
                <Route path="parametres" element={<AdminSettings />} />
              </Route>

              <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
            </Routes>
          </CartProvider>
        </AuthProvider>
      </SettingsProvider>
    </Router>
  );
}

export default App;
