// material-ui
import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';

// project import
import sidebarColors from 'themes/sidebar';

// ==============================|| DRAWER HEADER - STYLED ||============================== //

// The logo lock-up needs more room than the toolbar mixin gives, so the header
// gets its own padding and always centres its content.
const DrawerHeaderStyled = styled(Box, { shouldForwardProp: (prop) => prop !== 'open' })(({ theme, open }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: sidebarColors.background,
  borderBottom: `1px solid ${sidebarColors.border}`,
  padding: theme.spacing(open ? 3 : 2, 2),
  minHeight: open ? 104 : 60
}));

export default DrawerHeaderStyled;
