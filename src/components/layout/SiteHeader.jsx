import React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bell,
  CheckCheck,
  ClipboardList,
  ChevronDown,
  MapPin,
  Menu as MenuIcon,
  Search,
  ShoppingBag,
  Store,
  Utensils,
  UserRound,
} from 'lucide-react';

export default function SiteHeader({
  user,
  cartCount,
  search,
  setSearch,
  signOut,
  onSignIn,
  notifications = [],
  unreadCount = 0,
  onNotificationRead,
  onNotificationsRead,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const searchInput = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const savedAddress = user?.addresses?.[0];

  useEffect(() => {
    setNotificationsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleShortcut = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchInput.current?.focus();
      }
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link to="/" className="brand">
          <span className="brand-mark">
            <Utensils size={19} />
          </span>
          <span>
            crumb<span className="brand-dot">.</span>
          </span>
        </Link>
        <button
          className="location-pill"
          type="button"
          title="Set your delivery address"
          onClick={() => navigate('/checkout')}
        >
          <MapPin size={16} />
          <span>
            <b>Delivering to</b>{' '}
            <span className="location-address">
              {savedAddress
                ? [savedAddress.label || 'Home', savedAddress.city].filter(Boolean).join(' · ')
                : 'Set your location'}
            </span>
          </span>
          <ChevronDown size={14} />
        </button>
        <div className="nav-search">
          <Search size={18} />
          <input
            ref={searchInput}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              if (location.pathname !== '/') navigate('/');
            }}
            placeholder="Dishes, restaurants, cuisines…"
          />
          <kbd>{navigator.platform?.includes('Mac') ? '⌘ K' : 'Ctrl K'}</kbd>
        </div>
        <nav className="top-actions">
          {user && (
            <div className="notification-menu">
              <button
                className={`notification-toggle ${notificationsOpen ? 'selected' : ''}`}
                type="button"
                aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
                aria-expanded={notificationsOpen}
                onClick={() => setNotificationsOpen((open) => !open)}
              >
                <Bell size={19} />
                {unreadCount > 0 && (
                  <span className="notification-count">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
              </button>
              <AnimatePresence>
                {notificationsOpen && (
                  <motion.section
                    className="notification-panel"
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.16 }}
                    aria-label="Your notifications"
                  >
                    <div className="notification-panel-heading">
                      <div>
                        <b>Notifications</b>
                        <small>
                          {unreadCount ? `${unreadCount} unread` : 'You’re all caught up'}
                        </small>
                      </div>
                      {unreadCount > 0 && (
                        <button type="button" onClick={onNotificationsRead}>
                          <CheckCheck size={15} /> Mark all read
                        </button>
                      )}
                    </div>
                    <div className="notification-list">
                      {notifications.length ? (
                        notifications.map((notification) => (
                          <Link
                            key={notification._id}
                            to={notification.link}
                            className={`notification-item ${notification.readAt ? '' : 'unread'}`}
                            onClick={() => {
                              if (!notification.readAt) onNotificationRead?.(notification._id);
                              setNotificationsOpen(false);
                            }}
                          >
                            <span className="notification-item-icon">
                              {notification.type === 'new_order' ? (
                                <Store size={17} />
                              ) : (
                                <ClipboardList size={17} />
                              )}
                            </span>
                            <span className="notification-item-copy">
                              <b>{notification.title}</b>
                              <span>{notification.message}</span>
                              <time dateTime={notification.createdAt}>
                                {new Date(notification.createdAt).toLocaleString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: 'numeric',
                                  minute: '2-digit',
                                })}
                              </time>
                            </span>
                            {!notification.readAt && <i aria-label="Unread" />}
                          </Link>
                        ))
                      ) : (
                        <div className="notification-empty">
                          <Bell size={20} />
                          <span>No notifications yet</span>
                          <small>Order updates will show up here.</small>
                        </div>
                      )}
                    </div>
                  </motion.section>
                )}
              </AnimatePresence>
            </div>
          )}
          {['restaurant_owner', 'admin'].includes(user?.role) && (
            <Link
              className={`nav-link ${location.pathname === '/owner' ? 'selected' : ''}`}
              to="/owner"
            >
              <Store size={17} />
              <span>Order desk</span>
            </Link>
          )}
          <Link
            className={`nav-link ${location.pathname === '/orders' ? 'selected' : ''}`}
            to="/orders"
          >
            <ClipboardList size={17} />
            <span>Orders</span>
          </Link>
          <button className="nav-link" onClick={() => (user ? navigate('/profile') : onSignIn())}>
            <UserRound size={17} />
            <span>{user ? user.name.split(' ')[0] : 'Sign in'}</span>
          </button>
          <Link className="bag-button" to="/checkout">
            <ShoppingBag size={18} />
            <span>Bag</span>
            {cartCount > 0 && <i>{cartCount}</i>}
          </Link>
          <button
            className="mobile-menu"
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <MenuIcon />
          </button>
        </nav>
      </div>
      {menuOpen && (
        <div className="mobile-dropdown">
          <Link to="/orders" onClick={() => setMenuOpen(false)}>
            Orders
          </Link>
          <Link to="/profile" onClick={() => setMenuOpen(false)}>
            Profile
          </Link>
          <Link to="/checkout" onClick={() => setMenuOpen(false)}>
            Your bag · {cartCount}
          </Link>
          {user?.role === 'admin' && (
            <Link to="/admin" onClick={() => setMenuOpen(false)}>
              Admin dashboard
            </Link>
          )}
          {user?.role === 'restaurant_owner' && (
            <Link to="/owner" onClick={() => setMenuOpen(false)}>
              Restaurant order desk
            </Link>
          )}
          {user && (
            <button
              onClick={() => {
                setMenuOpen(false);
                signOut();
              }}
            >
              Sign out
            </button>
          )}
        </div>
      )}
    </header>
  );
}
