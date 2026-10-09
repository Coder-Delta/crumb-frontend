import React from 'react';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, X, Utensils } from 'lucide-react';
import { api } from '../services/api.js';

function AuthModal({ close, complete }) {
  const googleButton = useRef(null);
  const completeRef = useRef(complete);
  const [mode, setMode] = useState('login'),
    [form, setForm] = useState({ name: '', email: '', password: '' }),
    [busy, setBusy] = useState(false),
    [err, setErr] = useState('');
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  completeRef.current = complete;

  useEffect(() => {
    if (!googleClientId || !googleButton.current) return undefined;

    let active = true;
    const renderGoogleButton = () => {
      if (!active || !window.google?.accounts?.id || !googleButton.current) return;
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async ({ credential }) => {
          setBusy(true);
          setErr('');
          try {
            const { data } = await api.post('/auth/google', { credential });
            completeRef.current(data);
          } catch (error) {
            setErr(error.response?.data?.message || 'Google sign-in failed. Please try again.');
          } finally {
            setBusy(false);
          }
        },
      });
      window.google.accounts.id.renderButton(googleButton.current, {
        theme: 'outline',
        size: 'large',
        shape: 'pill',
        text: 'continue_with',
        width: Math.min(360, googleButton.current.clientWidth || 360),
      });
    };

    let script = document.querySelector('script[data-google-identity]');
    if (!script) {
      script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.dataset.googleIdentity = 'true';
      document.head.appendChild(script);
    }
    if (window.google?.accounts?.id) renderGoogleButton();
    else script.addEventListener('load', renderGoogleButton, { once: true });

    return () => {
      active = false;
      script?.removeEventListener('load', renderGoogleButton);
    };
  }, [googleClientId]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      const { data } = await api.post(`/auth/${mode === 'login' ? 'login' : 'register'}`, form);
      complete(data);
    } catch (e) {
      setErr(
        e.response?.data?.message ||
          'Could not connect to Crumb API. Start the backend and try again.',
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <div
      className="modal-scrim"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <motion.section
        className="auth-modal"
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
      >
        <button className="modal-close" onClick={close}>
          <X size={18} />
        </button>
        <div className="auth-art">
          <div className="auth-art-plate">🥑</div>
          <span className="auth-spark one">✳</span>
          <span className="auth-spark two">✦</span>
          <span className="auth-art-label">
            GOOD FOOD
            <br />
            IS BETTER
            <br />
            SHARED.
          </span>
        </div>
        <div className="auth-form-side">
          <div className="brand auth-brand">
            <span className="brand-mark">
              <Utensils size={17} />
            </span>
            crumb<span className="brand-dot">.</span>
          </div>
          <span className="section-kicker">
            {mode === 'login' ? 'WELCOME BACK' : 'YOUR TABLE IS READY'}
          </span>
          <h2>{mode === 'login' ? 'Good to see you.' : 'Come on in.'}</h2>
          <p className="auth-subtitle">
            {mode === 'login'
              ? 'Sign in to get back to the good stuff.'
              : 'A little account makes ordering a lot easier.'}
          </p>
          <form onSubmit={submit}>
            {mode === 'register' && (
              <label>
                Your name
                <input
                  required
                  minLength="2"
                  maxLength="80"
                  autoComplete="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Alex Morgan"
                />
              </label>
            )}
            <label>
              Email address
              <input
                required
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
              />
            </label>
            <label>
              Password
              <input
                required
                minLength={mode === 'register' ? 8 : 1}
                maxLength="72"
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder={mode === 'register' ? 'At least 8 characters' : 'Your password'}
              />
            </label>
            {err && <div className="form-error">{err}</div>}
            <button className="btn primary full auth-submit" disabled={busy}>
              {busy ? (
                <>
                  <span className="spinner" /> One sec…
                </>
              ) : mode === 'login' ? (
                'Sign in & get hungry'
              ) : (
                'Create my account'
              )}{' '}
              <ArrowRight size={15} />
            </button>
          </form>
          <div className="auth-divider">
            <span>or continue with</span>
          </div>
          {googleClientId ? (
            <div className="google-signin" ref={googleButton} aria-label="Continue with Google" />
          ) : (
            <p className="google-setup-note">Google sign-in will be available after OAuth setup.</p>
          )}
          <div className="auth-switch">
            {mode === 'login' ? (
              <>
                New around here?{' '}
                <button
                  onClick={() => {
                    setMode('register');
                    setErr('');
                  }}
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => {
                    setMode('login');
                    setErr('');
                  }}
                >
                  Sign in
                </button>
              </>
            )}
          </div>
          <small className="auth-fineprint">
            By continuing, you agree to our Terms & Privacy Policy.
          </small>
        </div>
      </motion.section>
    </div>
  );
}

export default AuthModal;
