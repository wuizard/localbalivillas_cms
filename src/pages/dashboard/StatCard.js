import PropTypes from 'prop-types';

// material-ui
import { Box, Skeleton, Stack, Typography } from '@mui/material';

// assets
import { RiseOutlined, FallOutlined } from '@ant-design/icons';

// project import
import MainCard from 'components/MainCard';

// ==============================|| DASHBOARD - STAT CARD ||============================== //

const StatCard = ({ title, value, icon, change, caption, color = 'primary', loading = false }) => {
  const hasChange = change !== null && change !== undefined && isFinite(change);
  const isLoss = hasChange && change < 0;

  return (
    <MainCard contentSX={{ p: 2.25 }}>
      {/* The icon sits in the corner rather than beside the text: five of these
          fit a row on a 1440 screen, and a figure like IDR 980,180,000 needs
          the full width of the card to print in full. */}
      <Stack spacing={0.5} sx={{ minWidth: 0 }}>
        <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="flex-start">
          <Typography variant="h6" color="textSecondary" noWrap sx={{ minWidth: 0 }}>
            {title}
          </Typography>
          {icon && (
            <Box
              sx={{
                width: 36,
                height: 36,
                mt: -0.5,
                flexShrink: 0,
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: `${color}.lighter`,
                color: `${color}.main`,
                fontSize: '1rem'
              }}
            >
              {icon}
            </Box>
          )}
        </Stack>
        {loading ? (
          <Skeleton width={110} height={32} />
        ) : (
          // Formatted currency is long enough to wrap mid-number in a narrow
          // card, so long values step down a size instead.
          <Typography
            variant="h4"
            color="inherit"
            noWrap
            title={String(value)}
            sx={{ fontSize: String(value).length > 12 ? '1.25rem' : undefined }}
          >
            {value}
          </Typography>
        )}
        {/* minWidth 0 lets the caption ellipsis instead of widening the card */}
        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ minWidth: 0 }}>
          {hasChange && !loading && (
            <Stack direction="row" spacing={0.25} alignItems="center" sx={{ color: isLoss ? 'error.main' : 'success.main', flexShrink: 0 }}>
              {isLoss ? <FallOutlined style={{ fontSize: '0.7rem' }} /> : <RiseOutlined style={{ fontSize: '0.7rem' }} />}
              <Typography variant="caption" sx={{ color: 'inherit', fontWeight: 500 }}>
                {`${Math.abs(change).toFixed(1)}%`}
              </Typography>
            </Stack>
          )}
          {caption && (
            <Typography variant="caption" color="textSecondary" noWrap>
              {caption}
            </Typography>
          )}
        </Stack>
      </Stack>
    </MainCard>
  );
};

StatCard.propTypes = {
  title: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  icon: PropTypes.node,
  change: PropTypes.number,
  caption: PropTypes.string,
  color: PropTypes.string,
  loading: PropTypes.bool
};

export default StatCard;
