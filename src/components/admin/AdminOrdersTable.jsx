import React from 'react';
import { money } from '../../utils/format.js';

function AdminOrdersTable({ orders, update }) {
  if (!orders.length)
    return <div className="admin-empty">No orders yet. They’ll show up right here.</div>;
  return (
    <div className="admin-table">
      <div className="table-header order-cols">
        <span>Order</span>
        <span>Customer</span>
        <span>Amount</span>
        <span>Status</span>
        <span>Update</span>
      </div>
      {orders.map((o) => (
        <div className="table-row order-cols" key={o._id}>
          <span>
            <b>#{String(o._id).slice(-6).toUpperCase()}</b>
            <small>{new Date(o.createdAt).toLocaleDateString('en-IN')}</small>
          </span>
          <span>{o.user?.name || 'Customer'}</span>
          <span>{money(o.total)}</span>
          <span className={`order-status ${o.status}`}>{o.status?.replaceAll('_', ' ')}</span>
          <select
            value={o.status}
            onChange={(e) => update(o._id, e.target.value)}
            aria-label="Update order status"
          >
            <option value="placed">Placed</option>
            <option value="confirmed">Confirmed</option>
            <option value="preparing">Preparing</option>
            <option value="on_the_way">On the way</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      ))}
    </div>
  );
}

export default AdminOrdersTable;
