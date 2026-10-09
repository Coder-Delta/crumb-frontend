import React from 'react';
import { Link } from 'react-router-dom';
import { Utensils } from 'lucide-react';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <Link to="/" className="brand">
          <span className="brand-mark">
            <Utensils size={17} />
          </span>
          crumb<span className="brand-dot">.</span>
        </Link>
        <span>
          Good food, good mood. Made with a little extra care{' '}
          <span className="footer-heart">♡</span>
        </span>
        <span>© 2025 Crumb</span>
      </div>
    </footer>
  );
}

export default Footer;
