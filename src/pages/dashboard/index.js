import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import { Box, Button, Grid, MenuItem, Skeleton, Stack, TextField, Typography } from '@mui/material';

// third-party
import { toast } from 'react-toastify';
import { reactLocalStorage } from 'reactjs-localstorage';

// assets
import {
  CalendarOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  DownloadOutlined,
  HomeOutlined,
  TeamOutlined
} from '@ant-design/icons';

// project import
import MainCard from 'components/MainCard';
import StatCard from './StatCard';
import BookingsOverviewChart from './BookingsOverviewChart';
import BookingStatusChart from './BookingStatusChart';
import LatestBookings from './LatestBookings';
import TopProperties from './TopProperties';
import { getBookings } from 'services/bookingService';
import { getProperties } from 'services/propertiesService';
import { currencyFormat } from 'helper/numberHelper';
import {
  RANGE_OPTIONS,
  bookingsToCsv,
  buildSeries,
  filterByRange,
  getPreviousRange,
  getRange,
  isAcceptedBooking,
  percentChange,
  recentBookings,
  statusBreakdown,
  summarize,
  topProperties
} from './dashboardUtils';

// ==============================|| DASHBOARD ||============================== //

const DashboardDefault = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [propertyCount, setPropertyCount] = useState(null);
  // Volumes are still small, so the dashboard opens on the full history rather
  // than a window that can read as empty.
  const [slot, setSlot] = useState('all');

  const userInfo = useMemo(() => {
    try {
      const stored = reactLocalStorage.get('user_info');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  }, []);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    setLoading(true);

    // The orders endpoint returns the full history, so every figure below is
    // aggregated on the client against the selected range.
    const [bookingResult, propertyResult] = await Promise.all([getBookings({}), getProperties({ page: 0 })]);

    if (bookingResult.error) toast.error(bookingResult.error);
    if (bookingResult.data) setOrders(bookingResult.data);
    if (propertyResult.data) setPropertyCount(propertyResult.data.totalData);

    setLoading(false);
  };

  const range = useMemo(() => getRange(slot, orders), [slot, orders]);
  const currentOrders = useMemo(() => filterByRange(orders, range), [orders, range]);
  const previousOrders = useMemo(() => filterByRange(orders, getPreviousRange(range)), [orders, range]);

  const current = useMemo(() => summarize(currentOrders), [currentOrders]);
  const previous = useMemo(() => summarize(previousOrders), [previousOrders]);

  const series = useMemo(() => buildSeries(currentOrders, range), [currentOrders, range]);
  const breakdown = useMemo(() => statusBreakdown(currentOrders), [currentOrders]);
  const properties = useMemo(() => topProperties(currentOrders), [currentOrders]);
  // Only bookings that were accepted - cancelled and refunded ones are noise in
  // a "latest" list.
  const latest = useMemo(() => recentBookings(currentOrders.filter(isAcceptedBooking), 5), [currentOrders]);

  const rangeLabel = `${range.start.format('DD MMM YYYY')} - ${range.end.format('DD MMM YYYY')}`;
  const comparisonCaption = slot === 'all' ? 'all time' : 'vs previous period';

  const exportReport = () => {
    const csv = bookingsToCsv(recentBookings(currentOrders, currentOrders.length));
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `lbv-bookings-${range.start.format('YYYYMMDD')}-${range.end.format('YYYYMMDD')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Grid container rowSpacing={3} columnSpacing={2.75}>
      {/* row 1 - greeting & range */}
      <Grid item xs={12}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
          spacing={2}
        >
          <Stack spacing={0.5}>
            <Typography variant="h4">{`Welcome back, ${userInfo?.name || userInfo?.username || 'Admin'}`}</Typography>
            <Typography variant="body2" color="textSecondary">
              {`Here's what's happening with your business - ${rangeLabel}`}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <TextField
              select
              size="small"
              value={slot}
              onChange={(event) => setSlot(event.target.value)}
              sx={{ minWidth: 170, '& .MuiInputBase-input': { py: 1, fontSize: '0.875rem' } }}
            >
              {RANGE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<DownloadOutlined />}
              onClick={exportReport}
              disabled={loading || !currentOrders.length}
            >
              Export Report
            </Button>
          </Stack>
        </Stack>
      </Grid>

      {/* row 2 - key figures */}
      {/* An explicit grid, not five flex Grid items: a card's own text sets a
          min-content width that made the fifth one wrap onto its own row. */}
      <Grid item xs={12}>
        <Box
          sx={{
            display: 'grid',
            gap: 2.75,
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              md: 'repeat(3, minmax(0, 1fr))',
              lg: 'repeat(5, minmax(0, 1fr))'
            }
          }}
        >
          <StatCard
            title="Total Bookings"
            value={current.bookings}
            icon={<CalendarOutlined />}
            change={percentChange(current.bookings, previous.bookings)}
            caption={comparisonCaption}
            loading={loading}
          />
          <StatCard
            title="Total Revenue"
            value={currencyFormat(current.revenue)}
            icon={<DollarOutlined />}
            color="success"
            change={percentChange(current.revenue, previous.revenue)}
            caption={comparisonCaption}
            loading={loading}
          />
          <StatCard
            title="Guests"
            value={current.guests}
            icon={<TeamOutlined />}
            color="info"
            change={percentChange(current.guests, previous.guests)}
            caption={comparisonCaption}
            loading={loading}
          />
          <StatCard
            title="Room Nights Sold"
            value={current.nights}
            icon={<HomeOutlined />}
            color="warning"
            change={percentChange(current.nights, previous.nights)}
            caption={propertyCount ? `across ${propertyCount} properties` : comparisonCaption}
            loading={loading}
          />
          <StatCard
            title="Pending Bookings"
            value={current.pending}
            icon={<ClockCircleOutlined />}
            color="error"
            caption={current.pending ? 'requires attention' : 'nothing waiting'}
            loading={loading}
          />
        </Box>
      </Grid>

      {/* row 3 - trends */}
      <Grid item xs={12} md={7} lg={8}>
        <MainCard
          title="Bookings Overview"
          content={false}
          secondary={
            <Typography variant="caption" color="textSecondary">
              {`Avg. booking value ${currencyFormat(current.averageValue)}`}
            </Typography>
          }
        >
          <Box sx={{ pt: 1, pr: 2, pb: 1 }}>
            {loading ? <Skeleton variant="rectangular" height={380} /> : <BookingsOverviewChart series={series} />}
          </Box>
        </MainCard>
      </Grid>
      <Grid item xs={12} md={5} lg={4}>
        <MainCard title="Booking Status">
          {loading ? <Skeleton variant="rectangular" height={340} /> : <BookingStatusChart breakdown={breakdown} total={current.bookings} />}
        </MainCard>
      </Grid>

      {/* row 4 - detail */}
      <Grid item xs={12} md={7} lg={8}>
        <MainCard
          title="Latest Confirmed Bookings"
          content={false}
          secondary={
            <Button size="small" color="primary" onClick={() => navigate('/order')}>
              View All Bookings
            </Button>
          }
          sx={{ '& .MuiCardHeader-root': { pb: 1 } }}
        >
          <Box sx={{ overflowX: 'auto' }}>
            <LatestBookings bookings={latest} loading={loading} />
          </Box>
        </MainCard>
      </Grid>
      <Grid item xs={12} md={5} lg={4}>
        <MainCard title="Top Properties" content={false}>
          <TopProperties properties={properties} loading={loading} />
        </MainCard>
      </Grid>
    </Grid>
  );
};

export default DashboardDefault;
