import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import LoginPage from './pages/LoginPage';
import AboutPage from './pages/AboutPage';
import ProfilePage from './pages/ProfilePage';
import CartPage from './pages/CartPage';
import ContactPage from './pages/ContactPage';
import WishlistPage from './pages/WishlistPage';
import OrdersPage from './pages/OrdersPage';
import VendorDashboard from './pages/VendorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import NotFoundPage from './pages/NotFoundPage';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CommerceProvider } from './contexts/CommerceContext';
import NotificationHandler from './components/NotificationHandler';
import Chatbot from './components/Chatbot';
import Breadcrumbs from './components/Breadcrumbs';
import SmartSearchPalette from './components/SmartSearchPalette';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

function AppContent() {
  const location = useLocation();
  const { theme } = useTheme();
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--foreground)] selection:bg-emerald-500 selection:text-black transition-colors">
      <Toaster position="top-center" expand={false} richColors theme={theme === 'dark' ? 'dark' : 'light'} />
      <NotificationHandler />
      <Navbar />
      <Breadcrumbs />
      <SmartSearchPalette />

      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductPage />} />
            <Route path="/category/:category" element={<ProductPage />} />
            <Route path="/product/:id" element={<ProductDetailsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/profile" element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" replace />} />
            <Route path="/cart" element={isAuthenticated ? <CartPage /> : <Navigate to="/login" replace />} />
            <Route path="/wishlist" element={isAuthenticated ? <WishlistPage /> : <Navigate to="/login" replace />} />
            <Route path="/orders" element={isAuthenticated ? <OrdersPage /> : <Navigate to="/login" replace />} />
            <Route path="/vendor/dashboard" element={isAuthenticated && user?.role === 'vendor' ? <VendorDashboard /> : <Navigate to="/" replace />} />
            <Route path="/admin/dashboard" element={isAuthenticated && user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </motion.main>
      </AnimatePresence>

      <Chatbot />
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CommerceProvider>
          <AppContent />
        </CommerceProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
