import React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
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

export default function SiteHeader({ user, cartCount, search, setSearch, signOut, onSignIn }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const searchInput = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const savedAddress = user?.addresses?.[0];

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
