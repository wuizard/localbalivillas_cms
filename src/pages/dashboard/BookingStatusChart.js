import PropTypes from 'prop-types';
import { useMemo } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Box, Grid, Stack, Typography } from '@mui/material';

// third-party
import ReactApexChart from 'react-apexcharts';

// ==============================|| DASHBOARD - BOOKING STATUS DONUT ||============================== //

const BookingStatusChart = ({ breakdown, total, height = 260 }) => {
  const theme = useTheme();

  const colors = breakdown.map((entry) => theme.palette[entry.color].main);

  const options = useMemo(
    () => ({
      chart: { type: 'donut', height },
      labels: breakdown.map((entry) => entry.label),
      colors,
      legend: { show: false },
      dataLabels: { enabled: false },
      stroke: { width: 0 },
      plotOptions: {
        pie: {
          donut: {
            size: '72%',
            labels: {
              show: true,
              value: { fontSize: '1.5rem', fontWeight: 600, color: theme.palette.text.primary, offsetY: 4 },
              total: {
                show: true,
                label: 'Total',
                color: theme.palette.text.secondary,
                formatter: () => `${total}`
              }
            }
          }
        }
      },
      tooltip: { theme: 'light', y: { formatter: (value) => `${value} booking${value === 1 ? '' : 's'}` } }
    }),
    [breakdown, colors, total, theme, height]
  );

  if (!breakdown.length) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ height }}>
        <Typography variant="body2" color="textSecondary">
          No bookings in this period
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <ReactApexChart options={options} series={breakdown.map((entry) => entry.count)} type="donut" height={height} />
      <Grid container spacing={1.25}>
        {breakdown.map((entry) => (
          <Grid item xs={6} key={entry.key}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: `${entry.color}.main`, flexShrink: 0 }} />
              <Stack sx={{ minWidth: 0 }}>
                <Typography variant="body2" noWrap>
                  {entry.label}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {`${entry.count} (${entry.percent.toFixed(0)}%)`}
                </Typography>
              </Stack>
            </Stack>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
};

BookingStatusChart.propTypes = {
  breakdown: PropTypes.array.isRequired,
  total: PropTypes.number,
  height: PropTypes.number
};

export default BookingStatusChart;
