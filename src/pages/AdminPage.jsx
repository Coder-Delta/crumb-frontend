import React from 'react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowDownWideNarrow,
  ArrowLeft,
  ArrowRight,
  Check,
  Star,
  Store,
  Trash2,
  X,
  LayoutDashboard,
  Users,
  ClipboardList,
  Pizza,
} from 'lucide-react';
import { api } from '../services/api.js';
import { money } from '../utils/format.js';
import Image from '../components/common/Image.jsx';
import { useToast } from '../components/common/ToastProvider.jsx';
import AdminCreateModal from '../components/admin/AdminCreateModal.jsx';
import AdminOrdersTable from '../components/admin/AdminOrdersTable.jsx';

function Admin() {
  const toast = useToast();
  const [tab, setTab] = useState('overview'),
    [stats, setStats] = useState(null),
    [orders, setOrders] = useState([]),
    [users, setUsers] = useState([]),
    [restaurants, setRestaurants] = useState([]),
    [foods, setFoods] = useState([]),
    [busy, setBusy] = useState(true),
    [modal, setModal] = useState('');
  const reload = async () => {
    setBusy(true);
    try {
      const [s, o, u, r, f] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/orders'),
        api.get('/admin/users'),
        api.get('/admin/restaurants'),
        api.get('/admin/foods'),
      ]);
      setStats(s.data.stats);
      setOrders(o.data.orders);
      setUsers(u.data.users);
      setRestaurants(r.data.restaurants);
      setFoods(f.data.foods);
    } catch (e) {
      toast(e.response?.data?.message || 'Could not load dashboard', 'error');
    } finally {
      setBusy(false);
    }
  };
  useEffect(() => {
    reload();
  }, []);
  const statusUpdate = async (id, status) => {
    try {
      await api.patch(`/admin/orders/${id}`, { status });
      toast('Order status updated');
      reload();
    } catch (e) {
      toast(e.response?.data?.message || 'Update failed', 'error');
    }
  };
  const setRestaurantOpen = async (restaurant) => {
    try {
      await api.patch(`/admin/restaurants/${restaurant._id}`, { isOpen: !restaurant.isOpen });
      toast(restaurant.isOpen ? 'Restaurant paused' : 'Restaurant is open');
      await reload();
    } catch (error) {
      toast(error.response?.data?.message || 'Could not update restaurant availability', 'error');
    }
  };
  const setFoodAvailable = async (food) => {
    try {
      await api.patch(`/admin/foods/${food._id}`, { available: !food.available });
      toast(food.available ? 'Food item hidden' : 'Food item is available');
      await reload();
    } catch (error) {
      toast(error.response?.data?.message || 'Could not update food availability', 'error');
    }
  };
  const removeRestaurant = async (restaurant) => {
    if (!window.confirm(`Remove ${restaurant.name} and its menu?`)) return;
    try {
      await api.delete(`/admin/restaurants/${restaurant._id}`);
      toast('Restaurant removed');
      await reload();
    } catch (error) {
      toast(error.response?.data?.message || 'Could not remove restaurant', 'error');
    }
  };
  const removeFood = async (food) => {
    if (!window.confirm(`Remove ${food.name}?`)) return;
    try {
      await api.delete(`/admin/foods/${food._id}`);
      toast('Food item removed');
      await reload();
    } catch (error) {
      toast(error.response?.data?.message || 'Could not remove food item', 'error');
    }
  };
  const tabs = [
    ['overview', 'Overview', LayoutDashboard],
    ['orders', 'Orders', ClipboardList],
    ['restaurants', 'Restaurants', Store],
    ['foods', 'Food items', Pizza],
    ['users', 'Customers', Users],
  ];
  return (
    <motion.main
      className="page-container admin-page"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="admin-welcome">
        <div>
          <span className="section-kicker">THE CRUMB KITCHEN</span>
          <h1>
            Dashboard<span>.</span>
          </h1>
          <p>Your little corner of the operation.</p>
        </div>
        <button className="btn subtle" onClick={reload}>
          <ArrowDownWideNarrow size={15} /> Refresh data
        </button>
      </div>
      <div className="admin-layout">
        <aside className="admin-sidebar">
          {tabs.map(([id, label, Icon]) => (
            <button key={id} onClick={() => setTab(id)} className={tab === id ? 'active' : ''}>
              <Icon size={17} />
              {label}
              {id === 'orders' && orders.filter((o) => o.status === 'placed').length > 0 && (
                <i>{orders.filter((o) => o.status === 'placed').length}</i>
              )}
            </button>
          ))}
          <Link to="/" className="admin-back">
            <ArrowLeft size={15} /> Back to storefront
          </Link>
        </aside>
        <section className="admin-content">
          {busy && !stats ? (
            <div className="admin-loading">
              <span className="spinner" /> Gathering the good stuff…
            </div>
          ) : (
            <>
              {tab === 'overview' && (
                <>
                  <div className="admin-section-title">
                    <div>
                      <span className="section-kicker">AT A GLANCE</span>
                      <h2>
                        Looking good<span>.</span>
                      </h2>
                    </div>
                    <span className="live-chip">
                      <i /> LIVE DATA
                    </span>
                  </div>
                  <div className="stat-grid">
                    {[
                      ['Revenue', money(stats?.revenue), '↗', 'coral'],
                      ['Orders', stats?.orders, '↗', 'purple'],
                      ['Restaurants', stats?.restaurants, '✳', 'green'],
                      ['Customers', stats?.users, '♡', 'yellow'],
                    ].map(([label, value, icon, color]) => (
                      <div className="stat-card" key={label}>
                        <span className={`stat-icon ${color}`}>{icon}</span>
                        <small>{label}</small>
                        <b>{value}</b>
                        <span className="stat-foot">All time · from your API</span>
                      </div>
                    ))}
                  </div>
                  <div className="admin-panel">
                    <div className="panel-title">
                      <div>
                        <h3>Recent orders</h3>
                        <small>The latest from your customers</small>
                      </div>
                      <button onClick={() => setTab('orders')}>
                        See all <ArrowRight size={14} />
                      </button>
                    </div>
                    <AdminOrdersTable orders={orders.slice(0, 5)} update={statusUpdate} />
                  </div>
                </>
              )}
              {tab === 'orders' && (
                <div className="admin-panel">
                  <div className="panel-title">
                    <div>
                      <h3>All orders</h3>
                      <small>{orders.length} orders across Crumb</small>
                    </div>
                    <span className="live-chip">
                      <i /> LIVE DATA
                    </span>
                  </div>
                  <AdminOrdersTable orders={orders} update={statusUpdate} />
                </div>
              )}
              {tab === 'restaurants' && (
                <div className="admin-panel">
                  <div className="panel-title">
                    <div>
                      <h3>Restaurants</h3>
                      <small>{restaurants.length} partners, all the good stuff</small>
                    </div>
                    <button
                      className="btn primary small-btn"
                      onClick={() => setModal('restaurant')}
                    >
                      + Add restaurant
                    </button>
                  </div>
                  <div className="admin-table">
                    <div className="table-header restaurant-cols">
                      <span>Restaurant</span>
                      <span>Cuisine</span>
                      <span>Rating</span>
                      <span>Visibility</span>
                      <span />
                    </div>
                    {restaurants.map((r) => (
                      <div className="table-row restaurant-cols" key={r._id}>
                        <span className="table-restaurant">
                          <Image src={r.image} />
                          <b>{r.name}</b>
                        </span>
                        <span>{r.cuisine.join(' · ')}</span>
                        <span className="rating">
                          <Star size={12} fill="currentColor" /> {r.rating}
                        </span>
                        <button
                          className={`visibility-toggle ${r.isOpen ? 'open' : 'closed'}`}
                          title="Toggle delivery availability"
                          role="switch"
                          aria-checked={r.isOpen}
                          onClick={() => setRestaurantOpen(r)}
                        >
                          {r.isOpen ? 'Open' : 'Closed'}
                        </button>
                        <button
                          className="row-action"
                          title="Remove restaurant"
                          aria-label={`Remove ${r.name}`}
                          onClick={() => removeRestaurant(r)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {tab === 'foods' && (
                <div className="admin-panel">
                  <div className="panel-title">
                    <div>
                      <h3>Food items</h3>
                      <small>{foods.length} things to love</small>
                    </div>
                    <button className="btn primary small-btn" onClick={() => setModal('food')}>
                      + Add food item
                    </button>
                  </div>
                  <div className="admin-table">
                    <div className="table-header food-cols">
                      <span>Food item</span>
                      <span>Restaurant</span>
                      <span>Price</span>
                      <span>Type</span>
                      <span />
                    </div>
                    {foods.map((f) => (
                      <div className="table-row food-cols" key={f._id}>
                        <span className="table-restaurant">
                          <Image src={f.image} />
                          <b>{f.name}</b>
                        </span>
                        <span>{f.restaurant?.name}</span>
                        <span>{money(f.price)}</span>
                        <button
                          className={`visibility-toggle ${f.available ? 'open' : 'closed'}`}
                          title="Toggle food availability"
                          role="switch"
                          aria-checked={f.available}
                          onClick={() => setFoodAvailable(f)}
                        >
                          {f.available ? 'Available' : 'Hidden'}
                        </button>
                        <button
                          className="row-action"
                          title="Remove item"
                          aria-label={`Remove ${f.name}`}
                          onClick={() => removeFood(f)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {tab === 'users' && (
                <div className="admin-panel">
                  <div className="panel-title">
                    <div>
                      <h3>Your customers</h3>
                      <small>{users.length} Crumb accounts</small>
                    </div>
                  </div>
                  <div className="admin-table">
                    <div className="table-header user-cols">
                      <span>Customer</span>
                      <span>Email</span>
                      <span>Role</span>
                      <span>Joined</span>
                      <span>Access</span>
                    </div>
                    {users.map((u) => (
                      <div className="table-row user-cols" key={u._id}>
                        <span className="table-user">
                          <i>{u.name?.[0]}</i>
                          <b>{u.name}</b>
                        </span>
                        <span>{u.email}</span>
                        <span>{u.role}</span>
                        <span>{new Date(u.createdAt).toLocaleDateString('en-IN')}</span>
                        <button
                          className="access-toggle"
                          disabled={u.role === 'admin'}
                          role="switch"
                          aria-checked={u.active}
                          aria-label={`${u.active ? 'Disable' : 'Restore'} ${u.name}'s account access`}
                          onClick={async () => {
                            try {
                              await api.patch(`/admin/users/${u._id}`, { active: !u.active });
                              toast(
                                u.active ? 'Account access disabled' : 'Account access restored',
                              );
                              reload();
                            } catch (e) {
                              toast(
                                e.response?.data?.message || 'Could not update access',
                                'error',
                              );
                            }
                          }}
                        >
                          {u.role === 'admin' ? 'Admin' : u.active ? 'Disable' : 'Restore'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>
      {modal && (
        <AdminCreateModal
          type={modal}
          restaurants={restaurants}
          close={() => setModal('')}
          done={() => {
            setModal('');
            reload();
          }}
        />
      )}
    </motion.main>
  );
}

export default Admin;
