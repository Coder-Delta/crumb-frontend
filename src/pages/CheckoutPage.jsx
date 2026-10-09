import React from 'react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CreditCard,
  MapPin,
  Minus,
  PackageCheck,
  Plus,
  Truck,
  LocateFixed,
} from 'lucide-react';
import { api } from '../services/api.js';
import { money } from '../utils/format.js';
import { useToast } from '../components/common/ToastProvider.jsx';
import { useCurrentLocation } from '../hooks/useCurrentLocation.js';

function Checkout({ user, cart, setCart, refreshUser, onAuth }) {
  const toast = useToast();
  const navigate = useNavigate(),
    [address, setAddress] = useState(user?.addresses?.[0]?.line || ''),
    [deliveryLocation, setDeliveryLocation] = useState(
      user?.addresses?.[0]?.latitude != null && user?.addresses?.[0]?.longitude != null
        ? { latitude: user.addresses[0].latitude, longitude: user.addresses[0].longitude }
        : null,
    ),
    [locationDetails, setLocationDetails] = useState({}),
    [payment, setPayment] = useState('card'),
    [placing, setPlacing] = useState(false),
    [success, setSuccess] = useState(null);
  useEffect(() => {
    if (user?.addresses?.[0]?.line && !address) setAddress(user.addresses[0].line);
  }, [user]);
  const { locateMe, locating, locationAccuracy, resetAccuracy } = useCurrentLocation(
    ({ address: foundAddress, coordinates, details }) => {
      setAddress(foundAddress);
      setDeliveryLocation(coordinates);
      setLocationDetails(details);
    },
  );
  const subtotal = cart.reduce((n, i) => n + i.price * i.quantity, 0),
    restaurantId = cart[0]?.restaurantId,
    fee = subtotal >= 499 ? 0 : cart[0]?.restaurantFee || 0,
    tax = Math.round(subtotal * 0.05),
    total = subtotal + fee + tax;
  const place = async () => {
    if (!user) {
      onAuth();
      return;
    }
    if (!cart.length) return;
    if (!restaurantId || cart.some((i) => i.restaurantId !== restaurantId)) {
      toast('Please order from one restaurant at a time.', 'error');
      return;
    }
    if (address.trim().length < 8) {
      toast('Add a complete delivery address.', 'error');
      return;
    }
    setPlacing(true);
    try {
      const { data } = await api.post('/orders', {
        restaurantId,
        items: cart.map((i) => ({ foodId: i._id, quantity: i.quantity })),
        address: address.trim(),
        deliveryLocation: deliveryLocation || undefined,
        paymentMethod: payment,
      });
      setCart([]);
      setSuccess(data.order);
      toast('Order placed! Good choice.');
    } catch (e) {
      toast(e.response?.data?.message || 'Could not place your order.', 'error');
    } finally {
      setPlacing(false);
    }
  };
  if (success)
    return (
      <motion.main
        className="page-container success-page"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="success-card">
          <div className="success-illustration">
            🥳<span>✳</span>
            <i>✦</i>
          </div>
          <span className="section-kicker">IT’S OFFICIAL</span>
          <h1>
            Your good food
            <br />
            <em>is on its way.</em>
          </h1>
          <p>
            Order <b>#{String(success._id).slice(-7).toUpperCase()}</b> is being sent to the
            kitchen. We’ll keep you posted.
          </p>
          <div className="success-tracker">
            <span className="tracker-icon">
              <PackageCheck size={20} />
            </span>
            <div>
              <b>Arriving in about 35 minutes</b>
              <small>
                {success.restaurant?.name || 'Your restaurant'} is getting everything ready.
              </small>
            </div>
            <ArrowRight size={17} />
          </div>
          <div className="success-actions">
            <Link className="btn primary" to={`/orders/${success._id}`}>
              Track your order <ArrowRight size={16} />
            </Link>
            <Link className="btn subtle" to="/">
              Back to the good stuff
            </Link>
          </div>
        </div>
      </motion.main>
    );
  return (
    <motion.main
      className="page-container checkout-page"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Link to="/" className="back-link">
        <ArrowLeft size={15} /> Keep exploring
      </Link>
      <div className="page-title">
        <span className="section-kicker">ALMOST THERE</span>
        <h1>
          Checkout<span>.</span>
        </h1>
        <p>A few little details, then the good part.</p>
      </div>
      {!cart.length ? (
        <div className="empty-state">
          <div className="empty-emoji">🛍️</div>
          <h2>Your bag is taking a little break</h2>
          <p>Find your next favorite thing and it’ll be waiting here.</p>
          <Link to="/" className="btn primary">
            Find something tasty <ArrowRight size={15} />
          </Link>
        </div>
      ) : (
        <div className="checkout-layout">
          <div className="checkout-left">
            <section className="checkout-card">
              <div className="checkout-section-title">
                <span className="step-number">01</span>
                <div>
                  <h2>Where should we bring it?</h2>
                  <p>Your food needs a little direction.</p>
                </div>
                {user && (
                  <span className="saved-label">
                    <Check size={13} /> Safe & secure
                  </span>
                )}
              </div>
              {user?.addresses?.length > 0 && (
                <div className="saved-addresses">
                  {user.addresses.map((a, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setAddress(a.line);
                        setDeliveryLocation(
                          a.latitude != null && a.longitude != null
                            ? { latitude: a.latitude, longitude: a.longitude }
                            : null,
                        );
                        setLocationDetails({ city: a.city, postcode: a.postalCode });
                        resetAccuracy();
                      }}
                      className={address === a.line ? 'selected' : ''}
                    >
                      <MapPin size={16} />
                      <span>
                        <b>{a.label || `Address ${i + 1}`}</b>
                        <small>
                          {a.line}, {a.city} {a.postalCode}
                        </small>
                      </span>
                      {address === a.line && <Check size={15} />}
                    </button>
                  ))}
                </div>
              )}
              <label className="field-label">
                Delivery address
                <textarea
                  placeholder="Flat / house number, street, landmark…"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    setDeliveryLocation(null);
                    setLocationDetails({});
                    resetAccuracy();
                    setSaved(false);
                  }}
                  rows="3"
                  maxLength="300"
                />
              </label>
              <div className="location-actions">
                <button
                  type="button"
                  className="location-button"
                  onClick={locateMe}
                  disabled={locating}
                >
                  {locating ? (
                    <span className="spinner coral-spinner" />
                  ) : (
                    <LocateFixed size={16} />
                  )}{' '}
                  {locating ? 'Finding your location…' : 'Use my current location'}
                </button>
                {deliveryLocation && (
                  <>
                    <span className="location-found">
                      <Check size={13} /> GPS accuracy ±
                      {locationAccuracy == null ? '—' : `${locationAccuracy} m`}
                    </span>
                    <a
                      className="location-pin-link"
                      href={`https://www.openstreetmap.org/?mlat=${deliveryLocation.latitude}&mlon=${deliveryLocation.longitude}#map=17/${deliveryLocation.latitude}/${deliveryLocation.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Check pin
                    </a>
                  </>
                )}
              </div>
              <small className="location-attribution">
                Address lookup by{' '}
                <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">
                  © OpenStreetMap contributors
                </a>
              </small>
              {user && !user.addresses?.some((savedAddress) => savedAddress.line === address) && (
                <button
                  className="save-address"
                  onClick={async () => {
                    if (address.trim().length < 8)
                      return toast('Add a complete address first.', 'error');
                    try {
                      await api.patch('/auth/me', {
                        addresses: [
                          ...(user.addresses || []),
                          {
                            label: 'Home',
                            line: address,
                            city:
                              locationDetails.city ||
                              locationDetails.town ||
                              locationDetails.village ||
                              locationDetails.state_district ||
                              '',
                            postalCode: locationDetails.postcode || '',
                            latitude: deliveryLocation?.latitude,
                            longitude: deliveryLocation?.longitude,
                          },
                        ],
                      });
                      await refreshUser();
                      toast('Address saved for next time');
                    } catch {
                      toast('Could not save address.', 'error');
                    }
                  }}
                >
                  <Plus size={14} /> Save this address for next time
                </button>
              )}
            </section>
            <section className="checkout-card">
              <div className="checkout-section-title">
                <span className="step-number">02</span>
                <div>
                  <h2>How would you like to pay?</h2>
                  <p>Choose what works for you.</p>
                </div>
              </div>
              <div className="payment-options">
                <button
                  type="button"
                  onClick={() => setPayment('card')}
                  className={payment === 'card' ? 'selected' : ''}
                  aria-pressed={payment === 'card'}
                >
                  <span className="payment-icon">
                    <CreditCard size={18} />
                  </span>
                  <span>
                    <b>Online payment · demo mode</b>
                    <small>Payment gateway not connected</small>
                  </span>
                  {payment === 'card' ? <span className="radio on" /> : <span className="radio" />}
                </button>
                <button
                  type="button"
                  onClick={() => setPayment('cash')}
                  className={payment === 'cash' ? 'selected' : ''}
                  aria-pressed={payment === 'cash'}
                >
                  <span className="payment-icon">₹</span>
                  <span>
                    <b>Cash on delivery</b>
                    <small>Pay when it arrives</small>
                  </span>
                  {payment === 'cash' ? <span className="radio on" /> : <span className="radio" />}
                </button>
              </div>
              <div className="secure-note">
                <span>🔒</span> Your payment information is encrypted and secure.
              </div>
            </section>
          </div>
          <aside className="checkout-summary">
            <div className="summary-title">
              <div>
                <span className="section-kicker">THE GOOD STUFF</span>
                <h2>
                  Your bag<span>.</span>
                </h2>
              </div>
              <span className="cart-count-pill">
                {cart.reduce((n, i) => n + i.quantity, 0)} items
              </span>
            </div>
            <div className="summary-restaurant">
              <Image src={cart[0].restaurantImage} alt="" />
              <span>
                <b>{cart[0].restaurantName}</b>
                <small>Made fresh, just for you</small>
              </span>
              <Link to={`/restaurant/${cart[0].restaurantId}`} aria-label="Edit bag">
                <ArrowRight size={16} />
              </Link>
            </div>
            <div className="summary-items">
              {cart.map((i) => (
                <div className="summary-item" key={i._id}>
                  <div className={`veg-mark ${i.veg ? 'veg' : 'nonveg'}`}>
                    <span />
                  </div>
                  <span className="summary-item-name">
                    {i.name}
                    <small>{money(i.price)} each</small>
                  </span>
                  <div className="quantity-control tiny">
                    <button
                      onClick={() =>
                        setCart((c) =>
                          c
                            .map((x) => (x._id === i._id ? { ...x, quantity: x.quantity - 1 } : x))
                            .filter((x) => x.quantity > 0),
                        )
                      }
                    >
                      <Minus size={10} />
                    </button>
                    <b>{i.quantity}</b>
                    <button
                      onClick={() =>
                        setCart((c) =>
                          c.map((x) => (x._id === i._id ? { ...x, quantity: x.quantity + 1 } : x)),
                        )
                      }
                    >
                      <Plus size={10} />
                    </button>
                  </div>
                  <b className="summary-line-price">{money(i.price * i.quantity)}</b>
                </div>
              ))}
            </div>
            <div className="bill-lines">
              <div>
                <span>Item total</span>
                <b>{money(subtotal)}</b>
              </div>
              <div>
                <span>Delivery fee</span>
                <b className={fee === 0 ? 'green-text' : ''}>{fee === 0 ? 'FREE' : money(fee)}</b>
              </div>
              <div>
                <span>Taxes & charges</span>
                <b>{money(tax)}</b>
              </div>
            </div>
            <div className="bill-total">
              <span>Total to pay</span>
              <b>{money(total)}</b>
            </div>
            {subtotal < 499 && (
              <div className="free-delivery-hint">
                <Truck size={14} />
                <span>
                  Add <b>{money(499 - subtotal)}</b> more to unlock free delivery
                </span>
              </div>
            )}
            <button className="btn primary full place-order" onClick={place} disabled={placing}>
              {placing ? (
                <>
                  <span className="spinner" /> Placing your order…
                </>
              ) : user ? (
                <>
                  Place order · {money(total)} <ArrowRight size={16} />
                </>
              ) : (
                <>
                  Sign in to place order <ArrowRight size={16} />
                </>
              )}
            </button>
            <div className="summary-reassurance">
              <span>✦</span> 100% secure checkout <i /> Made with care
            </div>
          </aside>
        </div>
      )}
    </motion.main>
  );
}

export default Checkout;
