import React from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowDownWideNarrow,
  ArrowRight,
  BadgePercent,
  ChevronDown,
  Clock3,
  Heart,
  Leaf,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Truck,
} from 'lucide-react';
import { categories } from '../data/demoData.js';
import { money } from '../utils/format.js';
import Image from '../components/common/Image.jsx';

function Home({ restaurants, loading, search, setSearch, filters, setFilters, add, navigate }) {
  const [favorite, setFavorite] = useState([]);
  const chooseCat = (c) => {
    setFilters((f) => ({ ...f, category: c, promoted: false }));
  };
  return (
    <motion.main
      className="home page-container"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <Sparkles size={14} /> GOOD FOOD, GOOD MOOD
          </div>
          <h1>
            Your next
            <br />
            <em>happy meal.</em>
          </h1>
          <p>Little moments, big flavors. Find something wonderful around the corner.</p>
          <div className="hero-search">
            <Search size={18} />
            <input
              value={search}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  document
                    .querySelector('.restaurant-heading')
                    ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Craving something? Try ‘pizza’"
            />
            <button
              type="button"
              onClick={() =>
                document.querySelector('.restaurant-grid')?.scrollIntoView({ behavior: 'smooth' })
              }
            >
              Find food <ArrowRight size={15} />
            </button>
          </div>
          <div className="hero-social">
            <div className="avatar-stack">
              <span>👩🏽</span>
              <span>👨🏻</span>
              <span>👩🏾</span>
              <span>🧑🏼</span>
            </div>
            <div>
              <div className="social-stars">
                ★★★★★ <b>4.9</b>
              </div>
              <small>Loved by 20k+ happy eaters</small>
            </div>
            <span className="social-divider" />
            <span className="hero-free">
              <Truck size={15} /> Free delivery over ₹499
            </span>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-photo-frame">
            <Image
              src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1100&q=90"
              alt="A colorful table of fresh food"
            />
          </div>
          <div className="hero-sticker">
            <span>✳</span>
            <b>
              made
              <br />
              with love
            </b>
          </div>
          <div className="hero-note">
            <span className="note-emoji">🥑</span>
            <div>
              <b>Fresh picks</b>
              <small>Just around the corner</small>
            </div>
            <span className="note-arrow">
              <ArrowRight size={15} />
            </span>
          </div>
          <div className="hero-scribble">yum!</div>
        </div>
      </section>
      <section className="perks">
        <div>
          <span className="perk-icon coral">
            <Truck size={18} />
          </span>
          <span>
            <b>Fast delivery</b>
            <small>At your doorstep in 30 min</small>
          </span>
        </div>
        <i />
        <div>
          <span className="perk-icon green">
            <Leaf size={18} />
          </span>
          <span>
            <b>Fresh & local</b>
            <small>Supporting neighborhood gems</small>
          </span>
        </div>
        <i />
        <div>
          <span className="perk-icon yellow">
            <BadgePercent size={18} />
          </span>
          <span>
            <b>Good deals</b>
            <small>Tasty food, happy prices</small>
          </span>
        </div>
        <i />
        <div className="perk-promo">
          <b>Hungry for a favorite?</b>
          <small>Browse our handpicked spots</small>
          <button
            className="perk-promo-button"
            type="button"
            onClick={() => {
              setFilters((current) => ({ ...current, category: 'All', promoted: true }));
              document
                .querySelector('.restaurants-section')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
          >
            Explore handpicked spots <ArrowRight size={13} />
          </button>
        </div>
      </section>
      <section className="category-section">
        <div className="section-title">
          <div>
            <span className="section-kicker">WHAT SOUNDS GOOD?</span>
            <h2>
              {filters.promoted ? 'Handpicked favorites' : 'Pick your mood'}
              <span>.</span>
            </h2>
          </div>
          <button className="text-button" onClick={() => chooseCat('All')}>
            See all <ArrowRight size={15} />
          </button>
        </div>
        <div className="category-row">
          {categories.map(([name, emoji], i) => (
            <button
              key={name}
              onClick={() => chooseCat(name)}
              className={`category-card ${(filters.category || 'All') === name ? 'active' : ''}`}
              aria-pressed={(filters.category || 'All') === name}
            >
              <span className="category-emoji">{emoji}</span>
              <b>{name}</b>
              {i === 0 && <small>everything</small>}
            </button>
          ))}
        </div>
      </section>
      <section className="restaurants-section">
        <div className="section-title restaurant-heading">
          <div>
            <span className="section-kicker">CURATED FOR YOU</span>
            <h2>
              {search
                ? `Good eats for “${search}”`
                : filters.promoted
                  ? 'Handpicked for you'
                  : 'Neighborhood favorites'}
              <span>.</span>
            </h2>
            <p>Real good food, from places you’ll want to come back to.</p>
          </div>
          <div className="filters">
            <label>
              <SlidersHorizontal size={15} />
              <select
                value={filters.sort}
                onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value }))}
              >
                <option value="">Recommended</option>
                <option value="rating">Top rated</option>
                <option value="delivery">Fastest delivery</option>
                <option value="price">Price: low to high</option>
              </select>
              <ChevronDown size={13} />
            </label>
            <button
              className={`filter-chip ${filters.veg ? 'on' : ''}`}
              aria-pressed={filters.veg}
              onClick={() => setFilters((f) => ({ ...f, veg: !f.veg }))}
            >
              <Leaf size={14} /> Pure veg
            </button>
            <button
              className={`filter-chip ${filters.promoted ? 'on' : ''}`}
              aria-pressed={Boolean(filters.promoted)}
              onClick={() => setFilters((f) => ({ ...f, promoted: !f.promoted }))}
            >
              <Sparkles size={14} /> Handpicked
            </button>
          </div>
        </div>
        {loading ? (
          <div className="restaurant-grid">
            {[1, 2, 3, 4].map((x) => (
              <RestaurantSkeleton key={x} />
            ))}
          </div>
        ) : restaurants.length ? (
          <div className="restaurant-grid">
            {restaurants.map((r, i) => (
              <RestaurantCard
                key={r._id || r.slug}
                r={r}
                i={i}
                favorite={favorite.includes(r._id)}
                toggle={() =>
                  setFavorite((f) =>
                    f.includes(r._id) ? f.filter((x) => x !== r._id) : [...f, r._id],
                  )
                }
                onOpen={() => navigate(`/restaurant/${r.slug || r._id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state compact">
            <div className="empty-emoji">🍽️</div>
            <h3>No bites found just yet</h3>
            <p>Try a different search or pick another category.</p>
            <button
              className="btn subtle"
              onClick={() => {
                setSearch('');
                setFilters({ category: 'All', sort: '', veg: false, promoted: false });
              }}
            >
              Clear filters
            </button>
          </div>
        )}
        <div className="see-more">
          <span>Good things are never far away</span>
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            Back to top <ArrowDownWideNarrow size={14} />
          </button>
        </div>
      </section>
      <section className="app-banner">
        <div className="app-banner-icon">🥡</div>
        <div>
          <span className="section-kicker">YOUR FAVORITE FOOD, CLOSER</span>
          <h2>
            Good things come
            <br />
            <em>to those who order.</em>
          </h2>
          <p>Quick checkout, easy tracking, and your comfort food on repeat.</p>
          <div className="app-badges">
            <span>✦ Curated local spots</span>
            <span>✦ Live order updates</span>
          </div>
        </div>
        <div className="banner-illustration">
          <div className="delivery-circle">🛵</div>
          <div className="delivery-path" />
          <span className="float-spark">✳</span>
          <span className="float-heart">♡</span>
        </div>
      </section>
    </motion.main>
  );
}

function RestaurantSkeleton() {
  return (
    <div className="restaurant-card skeleton-card">
      <div className="skeleton skeleton-image" />
      <div className="skeleton-line wide" />
      <div className="skeleton-line" />
      <div className="skeleton-line short" />
    </div>
  );
}

function RestaurantCard({ r, i, favorite, toggle, onOpen }) {
  return (
    <motion.article
      className="restaurant-card"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.05, duration: 0.32 }}
      whileHover={{ y: -5, transition: { type: 'spring', stiffness: 350, damping: 22 } }}
      onClick={onOpen}
      onKeyDown={(event) => {
        if ((event.key === 'Enter' || event.key === ' ') && !event.target.closest('button')) {
          event.preventDefault();
          onOpen();
        }
      }}
      role="link"
      tabIndex={0}
      aria-label={`View ${r.name}`}
    >
      <div className="restaurant-image">
        <Image src={r.image} alt={r.name} />
        <div className="image-scrim" />
        {r.promoted && (
          <span className="promoted">
            <Sparkles size={11} /> HANDPICKED
          </span>
        )}
        <button
          className={`favorite ${favorite ? 'liked' : ''}`}
          type="button"
          aria-label={favorite ? `Remove ${r.name} from favorites` : `Add ${r.name} to favorites`}
          aria-pressed={favorite}
          onClick={(e) => {
            e.stopPropagation();
            toggle();
          }}
        >
          <Heart size={17} fill={favorite ? 'currentColor' : 'none'} />
        </button>
        <span className="delivery-tag">
          <Clock3 size={12} />
          {r.deliveryTime || '25–35 min'}
        </span>
      </div>
      <div className="restaurant-content">
        <div className="restaurant-name-row">
          <h3>{r.name}</h3>
          <span className="rating">
            <Star size={13} fill="currentColor" /> {Number(r.rating || 4.5).toFixed(1)}
          </span>
        </div>
        <p className="cuisine-line">{(r.cuisine || []).slice(0, 3).join(' · ')}</p>
        <div className="card-divider" />
        <div className="restaurant-meta">
          <span>{money(r.priceForTwo || 450)} for two</span>
          <span className="meta-dot">•</span>
          <span>{r.deliveryFee === 0 ? 'Free delivery' : `${money(r.deliveryFee)} delivery`}</span>
        </div>
      </div>
    </motion.article>
  );
}

export default Home;
