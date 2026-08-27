import PropTypes from 'prop-types';

// material-ui
import { Box } from '@mui/material';

// assets - the same brand files the storefront ships
import logoPrimary from 'assets/images/brand/lbv_primary.png';
import logoWhite from 'assets/images/brand/lbv_white_landscape.png';

// ==============================|| LOGO - LOCAL BALI VILLAS ||============================== //

const Logo = ({ dark = false, width = 160 }) => (
  <Box
    component="img"
    src={dark ? logoWhite : logoPrimary}
    alt="Local Bali Villas"
    sx={{ width, height: 'auto', display: 'block' }}
  />
);

Logo.propTypes = {
  // the white lock-up, for dark grounds such as the sidebar
  dark: PropTypes.bool,
  width: PropTypes.number
};

export default Logo;
