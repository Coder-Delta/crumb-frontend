import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDownWideNarrow, MapPin, Plus, Store } from 'lucide-react';
import { api } from '../services/api.js';
import { money } from '../utils/format.js';
import { useToast } from '../components/common/ToastProvider.jsx';
import FoodImageOptions, { FOOD_IMAGE_LIST_ID } from '../components/common/FoodImageOptions.jsx';

const nextSteps = {
  placed: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['on_the_way', 'cancelled'],
  on_the_way: ['delivered'],
  delivered: [],
  cancelled: [],
};

function OwnerPage() {
  const toast = useToast();
  const [restaurants, setRestaurants] = useState([]);
  const [orders, setOrders] = useState([]);
  const [foods, setFoods] = useState([]);
  const [tab, setTab] = useState('orders');
  const [foodForm, setFoodForm] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    image: '',
    veg: false,
  });
  const [loading, setLoading] = useState(true);

  const reload = useCallback(
    async (quiet = false) => {
      if (!quiet) setLoading(true);
      try {
        const [orderResponse, menuResponse] = await Promise.all([
          api.get('/owner/orders'),
          api.get('/owner/menu'),
        ]);
        setRestaurants(orderResponse.data.restaurants);
        setOrders(orderResponse.data.orders);
        setFoods(menuResponse.data.foods);
      } catch (error) {
        toast(error.response?.data?.message || 'Could not load your restaurant orders.', 'error');
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    reload();
    const interval = window.setInterval(() => reload(true), 15000);
    return () => window.clearInterval(interval);
  }, [reload]);

  const updateStatus = async (order, status) => {
    try {
      await api.patch(`/owner/orders/${order._id}`, { status });
      toast(`Order moved to ${status.replaceAll('_', ' ')}.`);
      await reload(true);
    } catch (error) {
      toast(error.response?.data?.message || 'Could not update this order.', 'error');
    }
  };

  const createFood = async (event) => {
    event.preventDefault();
    const restaurantId = foodForm.restaurantId || restaurants[0]?._id;
    if (!restaurantId) return toast('Your restaurant profile is not ready yet.', 'error');
    try {
      await api.post('/owner/menu', {
        ...foodForm,
        restaurantId,
        price: Number(foodForm.price),
        image: foodForm.image || undefined,
      });
      setFoodForm({ name: '', description: '', category: '', price: '', image: '', veg: false });
      toast('Dish added to your menu.');
      await reload(true);
    } catch (error) {
      toast(error.response?.data?.message || 'Could not add this dish.', 'error');
    }
  };

  const toggleFood = async (food) => {
    try {
      await api.patch(`/owner/menu/${food._id}`, { available: !food.available });
      await reload(true);
    } catch (error) {
      toast(error.response?.data?.message || 'Could not update this dish.', 'error');
    }
  };

  return (
    <motion.main
      className="page-container owner-page"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="admin-welcome">
        <div>
          <span className="section-kicker">RESTAURANT PARTNER</span>
          <h1>
            Order desk<span>.</span>
          </h1>
          <p>New paid and cash-on-delivery orders refresh every 15 seconds.</p>
        </div>
        <button className="btn subtle" onClick={() => reload()}>
          <ArrowDownWideNarrow size={15} /> Refresh
        </button>
      </div>

      <div className="owner-restaurants">
        {restaurants.map((restaurant) => (
          <div className="owner-restaurant" key={restaurant._id}>
            <Store size={17} />
            <b>{restaurant.name}</b>
            <span className={`visibility-toggle ${restaurant.isOpen ? 'open' : 'closed'}`}>
              {!restaurant.isApproved ? 'Pending review' : restaurant.isOpen ? 'Open' : 'Closed'}
            </span>
          </div>
        ))}
      </div>

      <section className="admin-panel owner-orders-panel">
        <div className="panel-title">
          <div>
            <h3>{tab === 'orders' ? 'Incoming orders' : 'Your menu'}</h3>
            <small>
              {tab === 'orders'
                ? `${orders.length} orders across your restaurants`
                : `${foods.length} dishes across your restaurants`}
            </small>
          </div>
          <div className="owner-tabs">
            <button className={tab === 'orders' ? 'active' : ''} onClick={() => setTab('orders')}>
              Orders
            </button>
            <button className={tab === 'menu' ? 'active' : ''} onClick={() => setTab('menu')}>
              Menu
            </button>
          </div>
        </div>
        {loading ? (
          <div className="admin-loading">
            <span className="spinner" /> Loading your order desk…
          </div>
        ) : tab === 'menu' ? (
          <div className="owner-menu-content">
            <form className="owner-food-form" onSubmit={createFood}>
              <label>
                Dish name
                <input
                  required
                  minLength="2"
                  maxLength="120"
                  value={foodForm.name}
                  onChange={(event) => setFoodForm({ ...foodForm, name: event.target.value })}
                  placeholder="e.g. House special thali"
                />
              </label>
              <label>
                Category
                <input
                  required
                  minLength="2"
                  maxLength="50"
                  value={foodForm.category}
                  onChange={(event) => setFoodForm({ ...foodForm, category: event.target.value })}
                  placeholder="Mains, drinks…"
                />
              </label>
              <label>
                Price (₹)
                <input
                  required
                  type="number"
                  min="1"
                  max="100000"
                  value={foodForm.price}
                  onChange={(event) => setFoodForm({ ...foodForm, price: event.target.value })}
                  placeholder="299"
                />
              </label>
              {restaurants.length > 1 && (
                <label>
                  Restaurant
                  <select
                    value={foodForm.restaurantId || restaurants[0]._id}
                    onChange={(event) =>
                      setFoodForm({ ...foodForm, restaurantId: event.target.value })
                    }
                  >
                    {restaurants.map((restaurant) => (
                      <option key={restaurant._id} value={restaurant._id}>
                        {restaurant.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <label className="owner-food-description">
                Description
                <input
                  maxLength="500"
                  value={foodForm.description}
                  onChange={(event) =>
                    setFoodForm({ ...foodForm, description: event.target.value })
                  }
                  placeholder="Describe the dish"
                />
              </label>
              <label className="owner-food-description">
                Image path or URL <small>Optional</small>
                <input
                  type="text"
                  list={FOOD_IMAGE_LIST_ID}
                  value={foodForm.image}
                  onChange={(event) => setFoodForm({ ...foodForm, image: event.target.value })}
                  placeholder="/images/food/... or https://..."
                />
                <FoodImageOptions />
              </label>
              <label className="owner-veg-choice">
                <input
                  type="checkbox"
                  checked={foodForm.veg}
                  onChange={(event) => setFoodForm({ ...foodForm, veg: event.target.checked })}
                />{' '}
                Vegetarian
              </label>
              <button className="btn primary small-btn" type="submit">
                <Plus size={15} /> Add dish
              </button>
            </form>
            {foods.length ? (
              <div className="owner-food-list">
                {foods.map((food) => (
                  <article className="owner-food-row" key={food._id}>
                    <div>
                      <b>{food.name}</b>
                      <small>
                        {food.restaurant?.name} · {food.category} · {money(food.price)}
                      </small>
                    </div>
                    <button
                      className={`visibility-toggle ${food.available ? 'open' : 'closed'}`}
                      onClick={() => toggleFood(food)}
                      role="switch"
                      aria-checked={food.available}
                    >
                      {food.available ? 'Available' : 'Hidden'}
                    </button>
                  </article>
                ))}
              </div>
            ) : (
              <div className="admin-empty">Add your first dish to start building your menu.</div>
            )}
          </div>
        ) : !orders.length ? (
          <div className="admin-empty">
            No orders yet. New paid and COD orders will appear here.
          </div>
        ) : (
          <div className="owner-order-list">
            {orders.map((order) => (
              <article className="owner-order-card" key={order._id}>
                <div className="owner-order-heading">
                  <div>
                    <span className="section-kicker">
                      ORDER #{String(order._id).slice(-7).toUpperCase()}
                    </span>
                    <h3>{order.restaurant?.name}</h3>
                  </div>
                  <span className={`order-status ${order.status}`}>
                    {order.status.replaceAll('_', ' ')}
                  </span>
                </div>
                <div className="owner-order-meta">
                  <span>
                    {order.user?.name || 'Customer'} · {order.user?.phone || order.user?.email}
                  </span>
                  <b>
                    {money(order.total)} ·{' '}
                    {order.paymentMethod === 'cash' ? 'Cash on delivery' : 'Paid online'}
                  </b>
                </div>
                <ul>
                  {order.items.map((item, index) => (
                    <li key={`${item.name}-${index}`}>
                      {item.quantity} × {item.name} <b>{money(item.price * item.quantity)}</b>
                    </li>
                  ))}
                </ul>
                <p className="owner-delivery-address">
                  <MapPin size={14} /> {order.address}
                </p>
                <div className="owner-order-footer">
                  <small>
                    {new Date(order.createdAt).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </small>
                  <select
                    value=""
                    onChange={(event) =>
                      event.target.value && updateStatus(order, event.target.value)
                    }
                    disabled={!nextSteps[order.status]?.length}
                    aria-label={`Update order ${String(order._id).slice(-7)} status`}
                  >
                    <option value="">Update status…</option>
                    {(nextSteps[order.status] || []).map((status) => (
                      <option key={status} value={status}>
                        {status.replaceAll('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </motion.main>
  );
}

export default OwnerPage;
