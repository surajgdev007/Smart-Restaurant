import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Sidebar from './components/admin/Sidebar';

// Customer Pages
import MenuPage from './pages/customer/MenuPage';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import OrderTrackingPage from './pages/customer/OrderTrackingPage';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import MenuManagement from './pages/admin/MenuManagement';
import CategoryManagement from './pages/admin/CategoryManagement';
import TableManagement from './pages/admin/TableManagement';
import OrdersManagement from './pages/admin/OrdersManagement';
import ReportsPage from './pages/admin/ReportsPage';

// Admin Layout Guard
function AdminLayout() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="dot-loading flex gap-2"><span /><span /><span /></div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;

  return (
    <div className="flex min-h-screen bg-dark-950">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

// Home redirect
function HomePage() {
  return (
    <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center text-center px-4">
      <div className="w-24 h-24 bg-gradient-to-br from-brand-500 to-brand-700 rounded-3xl flex items-center justify-center text-5xl mx-auto mb-6 shadow-2xl shadow-brand-500/30">
        🍽️
      </div>
      <h1 className="font-display text-4xl font-bold text-white mb-3">Smart Restaurant</h1>
      <p className="text-dark-400 mb-8 max-w-md">
        Scan the QR code on your table to browse the menu and place your order!
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <a href="/menu?table=1" className="btn-primary">
          🍴 Browse Menu (Demo Table 1)
        </a>
        <a href="/admin/login" className="btn-secondary">
          🔐 Admin Login
        </a>
      </div>
      <p className="text-dark-500 text-xs mt-8">Final Year College Project · Smart Restaurant Digital Menu</p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Toaster position="top-right" />
          <Routes>
            {/* Landing */}
            <Route path="/" element={<HomePage />} />

            {/* Customer Routes */}
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order/:orderId" element={<OrderTrackingPage />} />

            {/* Admin Auth */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Admin Protected Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="orders" element={<OrdersManagement />} />
              <Route path="menu" element={<MenuManagement />} />
              <Route path="categories" element={<CategoryManagement />} />
              <Route path="tables" element={<TableManagement />} />
              <Route path="reports" element={<ReportsPage />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
