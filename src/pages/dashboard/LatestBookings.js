import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

// material-ui
import { Chip, Link, Skeleton, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';

// third-party
import moment from 'moment';

// project import
import { currencyFormat } from 'helper/numberHelper';
import { statusMeta } from './dashboardUtils';

// ==============================|| DASHBOARD - LATEST BOOKINGS ||============================== //

const columns = ['Booking Date', 'Booking ID', 'Guest', 'Property / Room', 'Check In', 'Check Out', 'Total', 'Status'];

const LatestBookings = ({ bookings = [], loading = false }) => {
  const navigate = useNavigate();

  return (
    <Table size="small" sx={{ '& .MuiTableCell-root': { whiteSpace: 'nowrap' } }}>
      <TableHead>
        <TableRow>
          {columns.map((column) => (
            <TableCell key={column}>{column}</TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {loading &&
          [0, 1, 2, 3, 4].map((row) => (
            <TableRow key={row}>
              <TableCell colSpan={columns.length}>
                <Skeleton height={28} />
              </TableCell>
            </TableRow>
          ))}

        {!loading && !bookings.length && (
          <TableRow>
            <TableCell colSpan={columns.length}>
              <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 3 }}>
                No confirmed bookings in this period
              </Typography>
            </TableCell>
          </TableRow>
        )}

        {!loading &&
          bookings.map((booking) => {
            const dates = booking.dates || [];
            const info = booking.propertiesInfo || {};
            const user = booking.user || {};
            const status = statusMeta(booking.lastStatus);

            return (
              <TableRow key={booking._id} hover>
                <TableCell>
                  <Typography variant="body2">{moment(booking.createdDate).format('DD MMM YYYY')}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {moment(booking.createdDate).format('HH:mm')}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Link
                    component="button"
                    variant="body2"
                    underline="always"
                    onClick={() => navigate(`/order/${booking._id}`)}
                  >
                    {booking.bookingId}
                  </Link>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{user.name || '-'}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {user.email || ''}
                  </Typography>
                </TableCell>
                <TableCell sx={{ maxWidth: 240 }}>
                  <Stack sx={{ minWidth: 0 }}>
                    <Typography variant="body2" noWrap>
                      {info.propertiesName || '-'}
                    </Typography>
                    <Typography variant="caption" color="textSecondary" noWrap>
                      {info.roomName || ''}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{dates[0] ? moment(dates[0]).format('DD MMM YYYY') : '-'}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {dates.length ? moment(dates[dates.length - 1]).format('DD MMM YYYY') : '-'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{currencyFormat(booking.totalPrice)}</Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={status.label}
                    sx={{ bgcolor: `${status.color}.lighter`, color: `${status.color}.main`, fontWeight: 500 }}
                  />
                </TableCell>
              </TableRow>
            );
          })}
      </TableBody>
    </Table>
  );
};

LatestBookings.propTypes = {
  bookings: PropTypes.array,
  loading: PropTypes.bool
};

export default LatestBookings;
