// ==============================|| BOOKING STATUS - LABELS & COLOURS ||============================== //

// The API stores the raw status on the order. Every screen that shows one goes
// through this map so a booking reads the same in the orders list, the booking
// detail and the dashboard.
export const STATUS_META = {
  confirmed: { label: 'Confirmed', color: 'success' },
  checkout: { label: 'Completed', color: 'info' },
  waiting_confirmation: { label: 'Pending', color: 'warning' },
  reject: { label: 'Cancelled', color: 'error' },
  refund: { label: 'Refunded', color: 'secondary' }
};

export const STATUS_ORDER = ['confirmed', 'checkout', 'waiting_confirmation', 'reject', 'refund'];

export const statusMeta = (status) => STATUS_META[status] || { label: status || 'Unknown', color: 'secondary' };

// Chip styling for a status, kept here so the same pill renders everywhere.
export const statusChipSx = (status) => {
  const { color } = statusMeta(status);
  return { bgcolor: `${color}.lighter`, color: color === 'secondary' ? 'text.secondary' : `${color}.main`, fontWeight: 500 };
};
