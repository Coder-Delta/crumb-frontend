import React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import AuthModal from './components/AuthModal.jsx';
import Footer from './components/common/Footer.jsx';
import NotFound from './components/common/NotFound.jsx';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';
import SiteHeader from './components/layout/SiteHeader.jsx';
import { useToast } from './components/common/ToastProvider.jsx';
import AdminPage from './pages/AdminPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import HomePage from './pages/HomePage.jsx';
import OrdersPage, { OrderDetail } from './pages/OrdersPage.jsx';
import OwnerPage from './pages/OwnerPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import RestaurantPage from './pages/RestaurantPage.jsx';
import { api } from './services/api.js';
import { filterDemoRestaurants } from './utils/filterDemoRestaurants.js';
import { useNotifications } from './hooks/useNotifications.js';

export default function App() {
  const [user, setUser] = useState(() => readStoredValue('crumb-user'));
  const [cart, setCart] = useState(() => readStoredValue('crumb-cart') || []);
  const [authOpen, setAuthOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [restaurants, setRestaurants] = useState([]);
  const [filters, setFilters] = useState({
    category: 'All',
    sort: '',
    veg: false,
    promoted: false,
  });
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const notificationState = useNotifications(user, toast);
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    localStorage.setItem('crumb-cart', JSON.stringify(cart));
  }, [cart]);

  const loadRestaurants = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/restaurants', {
        params: {
          q: search || undefined,
          category: filters.category === 'All' ? undefined : filters.category,
          sort: filters.sort || undefined,
          veg: filters.veg || undefined,
          promoted: filters.promoted || undefined,
        },
      });
      setRestaurants(
        data.cuisines.length ? data.restaurants : filterDemoRestaurants({ search, filters }),
      );
    } catch {
      setRestaurants(filterDemoRestaurants({ search, filters }));
    } finally {
      setLoading(false);
    }
  }, [filters, search]);

  useEffect(() => {
    const timer = window.setTimeout(loadRestaurants, 250);
    return () => window.clearTimeout(timer);
  }, [loadRestaurants]);

  const addToCart = (food, restaurant) => {
    const switchingRestaurant = cart.length > 0 && cart[0].restaurantId !== restaurant._id;

    setCart((currentCart) => {
      const existingItem = currentCart.find((item) => item._id === food._id);
      if (existingItem) {
        return currentCart.map((item) =>
          item._id === food._id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }

      const cartItem = {
        ...food,
        quantity: 1,
        restaurantId: restaurant._id,
        restaurantName: restaurant.name,
        restaurantImage: restaurant.image,
        restaurantFee: restaurant.deliveryFee || 0,
      };

      return switchingRestaurant ? [cartItem] : [...currentCart, cartItem];
    });

    toast(switchingRestaurant ? `Bag switched to ${restaurant.name}` : `${food.name} added to bag`);
  };

  const updateCartQuantity = (foodId, change) => {
    setCart((currentCart) =>
      currentCart
        .map((item) => (item._id === foodId ? { ...item, quantity: item.quantity + change } : item))
        .filter((item) => item.quantity > 0),
    );
  };

  const signOut = () => {
    localStorage.removeItem('crumb-token');
    localStorage.removeItem('crumb-user');
    setUser(null);
    toast('You’re signed out');
  };

  const completeAuth = (authResponse) => {
    localStorage.setItem('crumb-token', authResponse.token);
    localStorage.setItem('crumb-user', JSON.stringify(authResponse.user));
    setUser(authResponse.user);
    setAuthOpen(false);
    if (authResponse.user.role === 'restaurant_owner') {
      navigate('/owner');
      toast(
        `Welcome, ${authResponse.user.name.split(' ')[0]}! Your restaurant dashboard is ready.`,
      );
    } else {
      toast(`Welcome, ${authResponse.user.name.split(' ')[0]}!`);
    }
  };

  const refreshUser = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
    } catch {
      signOut();
    }
  };

  return (
    <>
      <SiteHeader
        user={user}
        cartCount={cartCount}
        search={search}
        setSearch={setSearch}
        signOut={signOut}
        onSignIn={() => setAuthOpen(true)}
        notifications={notificationState.notifications}
        unreadCount={notificationState.unreadCount}
        onNotificationRead={notificationState.markAsRead}
        onNotificationsRead={notificationState.markAllAsRead}
      />

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <HomePage
                restaurants={restaurants}
                loading={loading}
                search={search}
                setSearch={setSearch}
                filters={filters}
                setFilters={setFilters}
                add={addToCart}
                navigate={navigate}
              />
            }
          />
          <Route
            path="/restaurant/:id"
            element={<RestaurantPage cart={cart} add={addToCart} update={updateCartQuantity} />}
          />
          <Route
            path="/checkout"
            element={
              <CheckoutPage
                user={user}
                cart={cart}
                setCart={setCart}
                refreshUser={refreshUser}
                onAuth={() => setAuthOpen(true)}
              />
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute user={user} onSignIn={() => setAuthOpen(true)}>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute user={user} onSignIn={() => setAuthOpen(true)}>
                <OrderDetail notification={notificationState.lastNotification} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute user={user} onSignIn={() => setAuthOpen(true)}>
                <ProfilePage user={user} onSave={refreshUser} signOut={signOut} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute user={user} adminOnly onSignIn={() => setAuthOpen(true)}>
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner"
            element={
              <ProtectedRoute
                user={user}
                allowedRoles={['restaurant_owner', 'admin']}
                onSignIn={() => setAuthOpen(true)}
              >
                <OwnerPage notification={notificationState.lastNotification} />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>

      <Footer />
      {authOpen && <AuthModal close={() => setAuthOpen(false)} complete={completeAuth} />}
    </>
  );
}

function readStoredValue(key) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}
