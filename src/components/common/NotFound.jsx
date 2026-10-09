import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

function NotFound() {
  return (
    <div className="page-container">
      <div className="empty-state">
        <div className="empty-emoji">🫣</div>
        <h2>Looks like this plate is empty</h2>
        <p>That page took a little detour.</p>
        <Link className="btn primary" to="/">
          Back to Crumb <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
