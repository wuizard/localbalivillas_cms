import PropTypes from 'prop-types';
import { useMemo } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';

// third-party
import ReactApexChart from 'react-apexcharts';

// project import
import { compactNumber } from './dashboardUtils';
import { currencyFormat } from 'helper/numberHelper';

// ==============================|| DASHBOARD - BOOKINGS OVERVIEW CHART ||============================== //

const BookingsOverviewChart = ({ series, height = 380 }) => {
  const theme = useTheme();
  const { secondary } = theme.palette.text;
  const line = theme.palette.divider;

  // Apex's own `responsive` option merges by key and skips undefined, so the
  // phone layout is decided here and baked into one options object instead.
  const isPhone = useMediaQuery(theme.breakpoints.down('sm'));

  const bookingsColor = theme.palette.primary.main;
  const revenueColor = theme.palette.warning.main;

  // Bookings are whole numbers - without a tick cap Apex repeats "1, 1, 1" on
  // quiet periods.
  const bookingTicks = Math.min(5, Math.max(1, ...series.bookings, 1));

  const options = useMemo(
    () => ({
      chart: {
        type: 'area',
        height,
        toolbar: { show: false },
        zoom: { enabled: false }
      },
      colors: [bookingsColor, revenueColor],
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 2 },
      fill: {
        type: 'gradient',
        gradient: { shadeIntensity: 1, opacityFrom: 0.25, opacityTo: 0, stops: [0, 90, 100] }
      },
      legend: { position: 'top', horizontalAlign: isPhone ? 'center' : 'right', markers: { radius: 8 } },
      grid: { borderColor: line, strokeDashArray: 4 },
      xaxis: {
        categories: series.categories,
        // A dense axis is unreadable - fewer ticks still, and angled, on a phone.
        tickAmount: Math.min(series.categories.length, isPhone ? 4 : 10),
        labels: {
          style: { colors: secondary, fontSize: isPhone ? '10px' : '12px' },
          rotate: isPhone ? -40 : 0,
          rotateAlways: isPhone,
          hideOverlappingLabels: true
        },
        axisBorder: { show: true, color: line },
        axisTicks: { show: false }
      },
      yaxis: [
        {
          seriesName: 'Bookings',
          min: 0,
          tickAmount: bookingTicks,
          forceNiceScale: true,
          labels: { style: { colors: secondary }, formatter: (value) => Math.round(value) },
          // Rotated axis titles would eat most of a phone's plotting width.
          ...(!isPhone && { title: { text: 'Bookings', style: { color: secondary, fontWeight: 500 } } })
        },
        {
          seriesName: 'Revenue',
          opposite: true,
          min: 0,
          forceNiceScale: true,
          labels: { style: { colors: secondary }, formatter: (value) => compactNumber(value) },
          ...(!isPhone && { title: { text: 'Revenue (IDR)', style: { color: secondary, fontWeight: 500 } } })
        }
      ],
      tooltip: {
        theme: 'light',
        shared: true,
        intersect: false,
        y: {
          formatter: (value, { seriesIndex }) => (seriesIndex === 1 ? currencyFormat(value) : `${value} booking${value === 1 ? '' : 's'}`)
        }
      }
    }),
    [series.categories, bookingTicks, bookingsColor, revenueColor, secondary, line, height, isPhone]
  );

  const chartSeries = [
    { name: 'Bookings', data: series.bookings },
    { name: 'Revenue', data: series.revenue }
  ];

  return <ReactApexChart options={options} series={chartSeries} type="area" height={height} />;
};

BookingsOverviewChart.propTypes = {
  series: PropTypes.shape({
    categories: PropTypes.array,
    bookings: PropTypes.array,
    revenue: PropTypes.array
  }).isRequired,
  height: PropTypes.number
};

export default BookingsOverviewChart;
