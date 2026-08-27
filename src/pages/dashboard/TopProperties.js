import PropTypes from 'prop-types';

// material-ui
import { Avatar, LinearProgress, Skeleton, Stack, Typography } from '@mui/material';

// project import
import { currencyFormat } from 'helper/numberHelper';

// ==============================|| DASHBOARD - TOP PROPERTIES ||============================== //

const TopProperties = ({ properties = [], loading = false }) => {
  const max = properties.reduce((highest, property) => Math.max(highest, property.bookings), 0);

  if (loading) {
    return (
      <Stack spacing={2.5} sx={{ p: 2.5 }}>
        {[0, 1, 2, 3, 4].map((row) => (
          <Skeleton key={row} height={44} />
        ))}
      </Stack>
    );
  }

  if (!properties.length) {
    return (
      <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 4 }}>
        No bookings in this period
      </Typography>
    );
  }

  return (
    <Stack spacing={2.5} sx={{ p: 2.5 }}>
      {properties.map((property) => (
        <Stack key={property.name} direction="row" spacing={1.5} alignItems="center">
          <Avatar variant="rounded" src={property.image || undefined} alt={property.name} sx={{ width: 40, height: 40 }}>
            {property.name.charAt(0)}
          </Avatar>
          <Stack spacing={0.75} sx={{ flexGrow: 1, minWidth: 0 }}>
            <Stack direction="row" justifyContent="space-between" spacing={1}>
              <Typography variant="subtitle2" noWrap>
                {property.name}
              </Typography>
              <Typography variant="caption" color="textSecondary" noWrap>
                {`${property.bookings} booking${property.bookings === 1 ? '' : 's'}`}
              </Typography>
            </Stack>
            <LinearProgress variant="determinate" color="warning" value={max ? (property.bookings / max) * 100 : 0} />
            <Typography variant="caption" color="textSecondary">
              {currencyFormat(property.revenue)}
            </Typography>
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
};

TopProperties.propTypes = {
  properties: PropTypes.array,
  loading: PropTypes.bool
};

export default TopProperties;
