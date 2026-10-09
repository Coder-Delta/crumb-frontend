export const money = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`;
