import React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, LogOut, LayoutDashboard, ClipboardList } from 'lucide-react';
import { api } from '../services/api.js';
import { useToast } from '../components/common/ToastProvider.jsx';

function Profile({ user, onSave, signOut }) {
  const toast = useToast();
  const [name, setName] = useState(user?.name || ''),
    [phone, setPhone] = useState(user?.phone || ''),
    [busy, setBusy] = useState(false);
  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.patch('/auth/me', { name, phone });
      await onSave();
      toast('Your details are all saved');
    } catch (e) {
      toast(e.response?.data?.message || 'Could not save profile', 'error');
    } finally {
      setBusy(false);
    }
  };
  return (
    <motion.main
      className="page-container profile-page"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="page-title">
        <span className="section-kicker">A LITTLE ABOUT YOU</span>
        <h1>
          Your profile<span>.</span>
        </h1>
        <p>We’ll remember the little things.</p>
      </div>
      <div className="profile-layout">
        <aside className="profile-aside">
          <div className="profile-avatar">{user?.name?.[0]?.toUpperCase() || 'C'}</div>
          <h3>{user?.name}</h3>
          <span>{user?.email}</span>
          {user?.role === 'admin' && <span className="admin-pill">ADMIN</span>}
          {user?.role === 'restaurant_owner' && (
            <span className="admin-pill">RESTAURANT OWNER</span>
          )}
          <Link to="/orders" className="profile-side-link">
            <ClipboardList size={16} /> Your orders <ArrowRight size={14} />
          </Link>
          {user?.role === 'admin' && (
            <Link to="/admin" className="profile-side-link">
              <LayoutDashboard size={16} /> Admin dashboard <ArrowRight size={14} />
            </Link>
          )}
          {user?.role === 'restaurant_owner' && (
            <Link to="/owner" className="profile-side-link">
              <LayoutDashboard size={16} /> Restaurant order desk <ArrowRight size={14} />
            </Link>
          )}
          <button className="profile-signout" onClick={signOut}>
            <LogOut size={15} /> Sign out
          </button>
        </aside>
        <form className="checkout-card profile-form" onSubmit={save}>
          <span className="section-kicker">YOUR DETAILS</span>
          <h2>
            Make yourself at home<span>.</span>
          </h2>
          <label className="field-label">
            Your name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength="2"
              maxLength="80"
            />
          </label>
          <label className="field-label">
            Email address
            <input value={user?.email || ''} disabled />
          </label>
          <label className="field-label">
            Phone number
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength="30"
              placeholder="Add a phone number"
            />
          </label>
          <button className="btn primary" disabled={busy}>
            {busy ? 'Saving…' : 'Save changes'} <ArrowRight size={14} />
          </button>
        </form>
      </div>
    </motion.main>
  );
}

export default Profile;
