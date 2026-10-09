import React from 'react';
import { Link } from 'react-router-dom';

export default function ProtectedRoute({
  user,
  adminOnly = false,
  allowedRoles,
  onSignIn,
  children,
}) {
  if (!user) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <div className="empty-emoji">👋</div>
          <h2>Let’s get you in</h2>
          <p>Sign in to explore this page.</p>
          <button className="btn primary" onClick={onSignIn}>
            Sign in
          </button>
        </div>
      </div>
    );
  }

  if ((adminOnly && user.role !== 'admin') || (allowedRoles && !allowedRoles.includes(user.role))) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <h2>Admin access only</h2>
          <Link to="/" className="btn primary">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
