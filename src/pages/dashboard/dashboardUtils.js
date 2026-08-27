import moment from 'moment';

// project import
import { STATUS_ORDER, statusMeta } from 'helper/bookingStatus';

// ==============================|| DASHBOARD - DATA HELPERS ||============================== //

// Status labels and colours are shared with the orders list.
export { statusMeta } from 'helper/bookingStatus';

// Bookings the business actually accepted: still confirmed, or already checked
// out. Rejected and refunded bookings never stay in the account, so they are
// left out of revenue and out of the latest-bookings list.
const ACCEPTED_STATUSES = ['confirmed', 'checkout'];

export const isAcceptedBooking = (order) => ACCEPTED_STATUSES.indexOf(order.lastStatus) > -1;

export const RANGE_OPTIONS = [
  { value: '7d', label: 'Last 7 days', days: 7 },
  { value: '30d', label: 'Last 30 days', days: 30 },
  { value: '90d', label: 'Last 90 days', days: 90 },
  { value: '12m', label: 'Last 12 months', days: 365 },
  { value: 'all', label: 'All time', days: null }
];

const orderDate = (order) => moment(order.createdDate);

/**
 * Current window for a range slot. "all" starts at the oldest booking so the
 * charts never render a long empty runway.
 */
export const getRange = (slot, orders = []) => {
  const end = moment().endOf('day');
  const option = RANGE_OPTIONS.find((item) => item.value === slot) || RANGE_OPTIONS[1];

  if (!option.days) {
    const oldest = orders.reduce((acc, order) => {
      const date = orderDate(order);
      return !acc || date.isBefore(acc) ? date : acc;
    }, null);
    return { start: (oldest ? oldest.clone() : end.clone().subtract(29, 'days')).startOf('day'), end };
  }

  return { start: end.clone().subtract(option.days - 1, 'days').startOf('day'), end };
};

/** The equally long window sitting right before the current one. */
export const getPreviousRange = ({ start, end }) => {
  const length = end.diff(start, 'days') + 1;
  const previousEnd = start.clone().subtract(1, 'day').endOf('day');
  return { start: previousEnd.clone().subtract(length - 1, 'days').startOf('day'), end: previousEnd };
};

export const filterByRange = (orders, { start, end }) =>
  orders.filter((order) => {
    const date = orderDate(order);
    return date.isValid() && date.isSameOrAfter(start) && date.isSameOrBefore(end);
  });

export const summarize = (orders) => {
  const accepted = orders.filter(isAcceptedBooking);
  const revenue = accepted.reduce((total, order) => total + (Number(order.totalPrice) || 0), 0);
  const guests = new Set(orders.map((order) => (order.user ? order.user._id || order.user.email : null)).filter(Boolean));
  const nights = accepted.reduce((total, order) => total + (order.dates ? order.dates.length : 0), 0);

  return {
    bookings: orders.length,
    revenue,
    guests: guests.size,
    nights,
    pending: orders.filter((order) => order.lastStatus === 'waiting_confirmation').length,
    averageValue: accepted.length ? revenue / accepted.length : 0
  };
};

/** null when there is nothing to compare against, so the UI can hide the delta. */
export const percentChange = (current, previous) => {
  if (!previous) return null;
  return ((current - previous) / previous) * 100;
};

/**
 * Bookings and revenue bucketed over the range - by day for short windows,
 * by month once a daily axis would be unreadable.
 */
export const buildSeries = (orders, { start, end }) => {
  const days = end.diff(start, 'days') + 1;
  const byDay = days <= 62;
  const unit = byDay ? 'day' : 'month';
  const keyFormat = byDay ? 'YYYY-MM-DD' : 'YYYY-MM';
  const labelFormat = byDay ? 'DD MMM' : 'MMM YY';

  const buckets = [];
  const index = {};
  const cursor = start.clone().startOf(unit);
  const last = end.clone().startOf(unit);

  while (cursor.isSameOrBefore(last)) {
    const bucket = { key: cursor.format(keyFormat), label: cursor.format(labelFormat), bookings: 0, revenue: 0 };
    index[bucket.key] = bucket;
    buckets.push(bucket);
    cursor.add(1, unit);
  }

  orders.forEach((order) => {
    const bucket = index[orderDate(order).format(keyFormat)];
    if (!bucket) return;
    bucket.bookings += 1;
    if (isAcceptedBooking(order)) bucket.revenue += Number(order.totalPrice) || 0;
  });

  return {
    categories: buckets.map((bucket) => bucket.label),
    bookings: buckets.map((bucket) => bucket.bookings),
    revenue: buckets.map((bucket) => bucket.revenue)
  };
};

export const statusBreakdown = (orders) =>
  STATUS_ORDER.map((key) => {
    const count = orders.filter((order) => order.lastStatus === key).length;
    return {
      key,
      count,
      label: statusMeta(key).label,
      color: statusMeta(key).color,
      percent: orders.length ? (count / orders.length) * 100 : 0
    };
  }).filter((entry) => entry.count > 0);

export const topProperties = (orders, limit = 5) => {
  const grouped = {};

  orders.forEach((order) => {
    const info = order.propertiesInfo || {};
    const name = info.propertiesName || 'Unknown property';
    if (!grouped[name]) {
      grouped[name] = { name, bookings: 0, revenue: 0, image: (info.roomImage || info.placeImage || [])[0] || null };
    }
    grouped[name].bookings += 1;
    if (isAcceptedBooking(order)) grouped[name].revenue += Number(order.totalPrice) || 0;
  });

  return Object.values(grouped)
    .sort((a, b) => b.bookings - a.bookings)
    .slice(0, limit);
};

export const recentBookings = (orders, limit = 5) =>
  [...orders].sort((a, b) => orderDate(b).valueOf() - orderDate(a).valueOf()).slice(0, limit);

/** Short form for chart axes and tight card space, e.g. 356.8M. */
export const compactNumber = (value) => {
  const number = Number(value) || 0;
  const abs = Math.abs(number);
  if (abs >= 1e9) return `${(number / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `${(number / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${(number / 1e3).toFixed(1)}K`;
  return `${number}`;
};

const csvCell = (value) => `"${String(value === undefined || value === null ? '' : value).replace(/"/g, '""')}"`;

export const bookingsToCsv = (orders) => {
  const header = ['Booking Date', 'Booking ID', 'Guest', 'Email', 'Property', 'Room', 'Check In', 'Check Out', 'Nights', 'Total (IDR)', 'Status'];

  const rows = orders.map((order) => {
    const dates = order.dates || [];
    const info = order.propertiesInfo || {};
    const user = order.user || {};
    return [
      moment(order.createdDate).format('YYYY-MM-DD HH:mm'),
      order.bookingId,
      user.name,
      user.email,
      info.propertiesName,
      info.roomName,
      dates[0],
      dates[dates.length - 1],
      dates.length,
      order.totalPrice,
      statusMeta(order.lastStatus).label
    ];
  });

  return [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\n');
};
