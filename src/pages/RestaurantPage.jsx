import React from 'react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Clock3,
  Flame,
  Minus,
  Plus,
  Sparkles,
  Star,
  Truck,
} from 'lucide-react';
import { api } from '../services/api.js';
import { money } from '../utils/format.js';
import Image from '../components/common/Image.jsx';
import NotFound from '../components/common/NotFound.jsx';
import { demoMenu, demoRestaurants } from '../data/demoData.js';

function RestaurantPage({ cart, add, update }) {
  const { id } = useParams(),
    [restaurant, setRestaurant] = useState(null),
    [menu, setMenu] = useState([]),
    [loading, setLoading] = useState(true),
    [active, setActive] = useState('');
  useEffect(() => {
    let alive = true;
    setLoading(true);
    api
      .get(`/restaurants/${id}`)
      .then(({ data }) => {
        if (alive) {
          setRestaurant(data.restaurant);
          setMenu(data.menu);
          setActive(data.menu[0]?.category || '');
        }
      })
      .catch(() => {
        const r = demoRestaurants.find((x) => x.slug === id || x._id === id);
        if (alive) {
          setRestaurant(r);
          setMenu(r ? demoMenu.filter((f) => f.restaurant === r._id) : []);
        }
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [id]);
  if (loading)
    return (
      <main className="page-container loading-page">
        <div className="skeleton skeleton-restaurant-cover" />
        <div className="skeleton-line wide" />
      </main>
    );
  if (!restaurant) return <NotFound />;
  const countById = Object.fromEntries(cart.map((x) => [x._id, x.quantity])),
    categoriesMenu = [...new Set(menu.map((i) => i.category || 'Popular'))];
  return (
    <motion.main
      className="page-container restaurant-page"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Link to="/" className="back-link">
        <ArrowLeft size={15} /> All restaurants
      </Link>
      <div className="restaurant-cover">
        <Image src={restaurant.image} alt={restaurant.name} />
        <div className="cover-shade" />
        <span className="cover-caption">
          <Sparkles size={13} /> LOCAL FAVORITE
        </span>
      </div>
      <div className="restaurant-profile">
        <div>
          <span className="section-kicker">{restaurant.cuisine?.join(' · ')}</span>
          <h1>{restaurant.name}</h1>
          <p>{restaurant.description}</p>
          <div className="restaurant-facts">
            <span className="rating">
              <Star size={14} fill="currentColor" /> {restaurant.rating}{' '}
              <small>({Number(restaurant.ratingCount || 0).toLocaleString()}+ ratings)</small>
            </span>
            <i />
            <span>
              <Clock3 size={14} />
              {restaurant.deliveryTime}
            </span>
            <i />
            <span>
              <Truck size={14} />
              {restaurant.deliveryFee === 0 ? 'Free delivery' : money(restaurant.deliveryFee)}
            </span>
          </div>
        </div>
        <div className="restaurant-profile-badge">
          <span>✦</span>
          <b>
            Crumb
            <br />
            approved
          </b>
        </div>
      </div>
      <div className="menu-layout">
        <div className="menu-main">
          <div className="menu-header">
            <div>
              <span className="section-kicker">MADE FRESH, JUST FOR YOU</span>
              <h2>
                On the menu<span>.</span>
              </h2>
            </div>
            <span className="menu-count">{menu.length} lovely things</span>
          </div>
          <div className="menu-tabs">
            {categoriesMenu.map((c) => (
              <button
                key={c}
                className={active === c ? 'active' : ''}
                onClick={() => {
                  setActive(c);
                  document
                    .getElementById(`cat-${c}`)
                    ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                {c}
              </button>
            ))}
          </div>
          {categoriesMenu.map((c) => (
            <div className="menu-group" id={`cat-${c}`} key={c}>
              <div className="menu-group-title">
                <h3>{c}</h3>
                <span>{menu.filter((x) => x.category === c).length} items</span>
              </div>
              <div className="food-list">
                {menu
                  .filter((x) => x.category === c)
                  .map((food) => (
                    <FoodRow
                      key={food._id}
                      food={food}
                      quantity={countById[food._id] || 0}
                      add={() => add(food, restaurant)}
                      update={update}
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>
        <aside className="cart-preview">
          <div className="cart-preview-title">
            <div>
              <span className="section-kicker">YOUR ORDER</span>
              <h3>
                A little something<span>.</span>
              </h3>
            </div>
            <span className="cart-count-pill">{cart.reduce((n, x) => n + x.quantity, 0)}</span>
          </div>
          {cart.length ? (
            <>
              <div className="mini-cart-items">
                {cart.map((item) => (
                  <div className="mini-cart-item" key={item._id}>
                    <span>{item.name}</span>
                    <div className="quantity-control small">
                      <button onClick={() => update(item._id, -1)}>
                        <Minus size={11} />
                      </button>
                      <b>{item.quantity}</b>
                      <button onClick={() => update(item._id, 1)}>
                        <Plus size={11} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mini-cart-total">
                <span>Subtotal</span>
                <b>{money(cart.reduce((n, i) => n + i.price * i.quantity, 0))}</b>
              </div>
              <Link to="/checkout" className="btn primary full">
                View bag & checkout <ArrowRight size={15} />
              </Link>
            </>
          ) : (
            <div className="cart-empty-mini">
              <span>🛍️</span>
              <b>Your bag is waiting</b>
              <small>Add something delicious to get started.</small>
            </div>
          )}
          <div className="cart-tip">
            <Truck size={14} />
            <span>Free delivery on orders over ₹499</span>
          </div>
        </aside>
      </div>
    </motion.main>
  );
}

function FoodRow({ food, quantity, add, update }) {
  return (
    <article className="food-row">
      <div className="food-copy">
        <div className={`veg-mark ${food.veg ? 'veg' : 'nonveg'}`}>
          <span />
        </div>
        {food.bestseller && (
          <span className="bestseller">
            <Flame size={11} /> BESTSELLER
          </span>
        )}
        <h4>{food.name}</h4>
        <b className="food-price">{money(food.price)}</b>
        <p>{food.description}</p>
      </div>
      <div className="food-photo-wrap">
        <Image src={food.image} alt={food.name} className="food-photo" />
        {quantity ? (
          <div className="quantity-control">
            <button onClick={() => update(food._id, -1)}>
              <Minus size={13} />
            </button>
            <b>{quantity}</b>
            <button onClick={() => update(food._id, 1)}>
              <Plus size={13} />
            </button>
          </div>
        ) : (
          <button className="add-food" onClick={add}>
            ADD <Plus size={12} />
          </button>
        )}
      </div>
    </article>
  );
}

export default RestaurantPage;
