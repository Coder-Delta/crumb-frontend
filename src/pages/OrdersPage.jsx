import React from 'react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, MapPin, Store } from 'lucide-react';
import { api } from '../services/api.js';
import { money } from '../utils/format.js';
import Image from '../components/common/Image.jsx';

function OrdersPage() {
  const [orders, setOrders] = useState([]),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    api
      .get('/orders')
      .then(({ data }) => setOrders(data.orders))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);
  return (
    <motion.main
      className="page-container order-history"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="page-title">
        <span className="section-kicker">GOOD TIMES, ON REPEAT</span>
        <h1>
          Your orders<span>.</span>
        </h1>
        <p>Every tasty memory, all in one place.</p>
      </div>
      {loading ? (
        <div className="order-list">
          {[1, 2].map((i) => (
            <div className="order-skeleton skeleton" key={i} />
          ))}
        </div>
      ) : orders.length ? (
        <div className="order-list">
          {orders.map((o) => (
            <OrderCard key={o._id} order={o} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-emoji">🍜</div>
          <h2>No orders yet, but we can fix that</h2>
          <p>Your next favorite meal is just a few taps away.</p>
          <Link className="btn primary" to="/">
            Find a restaurant <ArrowRight size={15} />
          </Link>
        </div>
      )}
    </motion.main>
  );
}

function OrderCard({ order }) {
  return (
    <Link to={`/orders/${order._id}`} className="order-card">
      <div className="order-thumb">
        <Image src={order.restaurant?.image} />
      </div>
      <div className="order-main">
        <div className="order-name">
          <h3>{order.restaurant?.name || 'Local restaurant'}</h3>
          <span className={`order-status ${order.status}`}>
            {order.status?.replaceAll('_', ' ')}
          </span>
        </div>
        <p>{order.items.map((i) => `${i.quantity} × ${i.name}`).join(' · ')}</p>
        <small>
          Ordered{' '}
          {new Date(order.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}{' '}
          · {money(order.total)}
        </small>
      </div>
      <span className="order-arrow">
        <ArrowRight size={18} />
      </span>
    </Link>
  );
}

function OrderDetail({ notification }) {
  const { id } = useParams(),
    [order, setOrder] = useState(null),
    [error, setError] = useState('');
  useEffect(() => {
    let alive = true;
    const load = () =>
      api
        .get(`/orders/${id}`)
        .then(({ data }) => alive && setOrder(data.order))
        .catch((e) => alive && setError(e.response?.data?.message || 'Could not load this order'));
    load();
    const timer = setInterval(load, 20000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [id, notification?._id]);
  const stages = ['placed', 'confirmed', 'preparing', 'on_the_way', 'delivered'];
  if (error)
    return (
      <div className="page-container">
        <div className="empty-state">
          <h2>{error}</h2>
          <Link className="btn primary" to="/orders">
            Back to orders
          </Link>
        </div>
      </div>
    );
  if (!order)
    return (
      <div className="page-container">
        <div className="skeleton skeleton-restaurant-cover" />
      </div>
    );
  const idx = stages.indexOf(order.status);
  return (
    <motion.main
      className="page-container order-detail"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Link className="back-link" to="/orders">
        <ArrowLeft size={15} /> All orders
      </Link>
      <div className="page-title">
        <span className="section-kicker">ORDER #{String(order._id).slice(-7).toUpperCase()}</span>
        <h1>
          {order.status === 'delivered'
            ? 'Hope it was delicious!'
            : order.status === 'cancelled'
              ? 'Order cancelled'
              : 'Good things are happening'}
          <span>.</span>
        </h1>
        <p>
          Placed{' '}
          {new Date(order.createdAt).toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
        </p>
      </div>
      <div className="tracking-card">
        <div className="tracking-head">
          <span className="tracking-symbol">
            {order.status === 'delivered' ? '🎉' : order.status === 'on_the_way' ? '🛵' : '👨‍🍳'}
          </span>
          <div>
            <span className="section-kicker">LIVE ORDER UPDATE</span>
            <h2>
              {order.status === 'delivered'
                ? 'Delivered with love'
                : order.status === 'cancelled'
                  ? 'This order was cancelled'
                  : `Your order is ${order.status.replaceAll('_', ' ')}`}
            </h2>
            <p>
              {order.status === 'delivered'
                ? 'Thanks for ordering with Crumb.'
                : `Estimated arrival ${new Date(order.eta).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}`}
            </p>
          </div>
          <span className={`order-status ${order.status}`}>
            {order.status.replaceAll('_', ' ')}
          </span>
        </div>
        <div className="tracking-steps">
          {stages.map((s, i) => (
            <div className={`tracking-step ${i <= idx ? 'done' : ''}`} key={s}>
              <span className="tracking-dot">
                {i < idx ? <Check size={13} /> : i === idx ? <span /> : null}
              </span>
              <small>
                {['Order placed', 'Confirmed', 'Preparing', 'On the way', 'Delivered'][i]}
              </small>
            </div>
          ))}
        </div>
      </div>
      <div className="detail-grid">
        <section className="checkout-card">
          <div className="checkout-section-title">
            <span className="step-number">
              <Store size={15} />
            </span>
            <div>
              <h2>{order.restaurant?.name}</h2>
              <p>
                {order.items.length} items ·{' '}
                {order.paymentMethod === 'cash' ? 'Cash on delivery' : 'Online payment selected'}
              </p>
            </div>
          </div>
          {order.items.map((i) => (
            <div className="detail-order-item" key={i._id || i.name}>
              <span>
                {i.quantity} × {i.name}
              </span>
              <b>{money(i.price * i.quantity)}</b>
            </div>
          ))}
          <div className="bill-total">
            <span>Total paid</span>
            <b>{money(order.total)}</b>
          </div>
        </section>
        <section className="checkout-card">
          <div className="checkout-section-title">
            <span className="step-number">
              <MapPin size={15} />
            </span>
            <div>
              <h2>Delivered to</h2>
              <p>{order.address}</p>
              {order.deliveryLocation && (
                <a
                  className="order-map-link"
                  href={`https://www.openstreetmap.org/?mlat=${order.deliveryLocation.latitude}&mlon=${order.deliveryLocation.longitude}#map=17/${order.deliveryLocation.latitude}/${order.deliveryLocation.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MapPin size={13} /> View delivery pin
                </a>
              )}
            </div>
          </div>
        </section>
      </div>
    </motion.main>
  );
}

export default OrdersPage;
export { OrderDetail };
