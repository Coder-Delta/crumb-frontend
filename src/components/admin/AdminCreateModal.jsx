import React from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, X } from 'lucide-react';
import { api } from '../../services/api.js';
import { useToast } from '../common/ToastProvider.jsx';

function AdminCreate({ type, restaurants, close, done }) {
  const toast = useToast();
  const isRestaurant = type === 'restaurant',
    [form, setForm] = useState(
      isRestaurant
        ? {
            name: '',
            slug: '',
            cuisine: '',
            description: '',
            image: '',
            deliveryTime: '25–35 min',
            deliveryFee: 0,
            priceForTwo: 400,
          }
        : {
            restaurant: restaurants[0]?._id || '',
            name: '',
            description: '',
            category: 'Popular',
            image: '',
            price: 0,
            veg: true,
            bestseller: false,
          },
    ),
    [err, setErr] = useState(''),
    [busy, setBusy] = useState(false);
  const change = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      const payload = isRestaurant
        ? {
            ...form,
            cuisine: form.cuisine
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean),
            deliveryFee: Number(form.deliveryFee),
            priceForTwo: Number(form.priceForTwo),
          }
        : { ...form, price: Number(form.price) };
      await api.post(`/admin/${isRestaurant ? 'restaurants' : 'foods'}`, payload);
      toast(`${isRestaurant ? 'Restaurant' : 'Food item'} added`);
      done();
    } catch (e) {
      setErr(e.response?.data?.message || 'Could not save. Check the fields and try again.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="modal-scrim" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <motion.div
        className="admin-modal"
        initial={{ opacity: 0, y: 12, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
      >
        <button className="modal-close" onClick={close}>
          <X size={18} />
        </button>
        <span className="section-kicker">GROWING THE GOOD STUFF</span>
        <h2>
          Add {isRestaurant ? 'a restaurant' : 'a food item'}
          <span>.</span>
        </h2>
        <form className="admin-create-form" onSubmit={submit}>
          {isRestaurant ? (
            <>
              <label>
                Name
                <input
                  required
                  minLength="2"
                  value={form.name}
                  onChange={(e) => change('name', e.target.value)}
                />
              </label>
              <label>
                URL slug
                <input
                  required
                  pattern="[a-z0-9-]+"
                  placeholder="little-sicily"
                  value={form.slug}
                  onChange={(e) => change('slug', e.target.value)}
                />
              </label>
              <label>
                Cuisine (comma separated)
                <input
                  required
                  placeholder="Italian, Pizza"
                  value={form.cuisine}
                  onChange={(e) => change('cuisine', e.target.value)}
                />
              </label>
              <label>
                Image URL
                <input
                  required
                  type="url"
                  value={form.image}
                  onChange={(e) => change('image', e.target.value)}
                  placeholder="https://…"
                />
              </label>
              <label>
                Description
                <textarea
                  value={form.description}
                  onChange={(e) => change('description', e.target.value)}
                />
              </label>
              <div className="two-fields">
                <label>
                  Delivery fee
                  <input
                    type="number"
                    min="0"
                    value={form.deliveryFee}
                    onChange={(e) => change('deliveryFee', e.target.value)}
                  />
                </label>
                <label>
                  Price for two
                  <input
                    type="number"
                    min="0"
                    value={form.priceForTwo}
                    onChange={(e) => change('priceForTwo', e.target.value)}
                  />
                </label>
              </div>
            </>
          ) : (
            <>
              <label>
                Restaurant
                <select
                  required
                  value={form.restaurant}
                  onChange={(e) => change('restaurant', e.target.value)}
                >
                  {restaurants.map((r) => (
                    <option value={r._id} key={r._id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Food name
                <input
                  required
                  minLength="2"
                  value={form.name}
                  onChange={(e) => change('name', e.target.value)}
                />
              </label>
              <label>
                Image URL
                <input
                  required
                  type="url"
                  value={form.image}
                  onChange={(e) => change('image', e.target.value)}
                  placeholder="https://…"
                />
              </label>
              <label>
                Description
                <textarea
                  value={form.description}
                  onChange={(e) => change('description', e.target.value)}
                />
              </label>
              <div className="two-fields">
                <label>
                  Price
                  <input
                    required
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(e) => change('price', e.target.value)}
                  />
                </label>
                <label>
                  Category
                  <input
                    value={form.category}
                    onChange={(e) => change('category', e.target.value)}
                  />
                </label>
              </div>
              <label className="check-field">
                <input
                  type="checkbox"
                  checked={form.veg}
                  onChange={(e) => change('veg', e.target.checked)}
                />{' '}
                Vegetarian
              </label>
            </>
          )}
          {err && <div className="form-error">{err}</div>}
          <button className="btn primary full" disabled={busy}>
            {busy ? 'Saving…' : `Add ${isRestaurant ? 'restaurant' : 'food item'}`}{' '}
            <ArrowRight size={15} />
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default AdminCreate;
