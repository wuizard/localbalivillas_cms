import PropTypes from 'prop-types';
import { useMemo } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Box, Drawer, ListItemButton, ListItemIcon, ListItemText, Typography, useMediaQuery } from '@mui/material';

// assets
import { LogoutOutlined } from '@ant-design/icons';

// project import
import DrawerHeader from './DrawerHeader';
import DrawerContent from './DrawerContent';
import MiniDrawerStyled from './MiniDrawerStyled';
import { drawerWidth } from 'config';
import sidebarColors from 'themes/sidebar';
import { reactLocalStorage } from 'reactjs-localstorage';

// ==============================|| MAIN LAYOUT - DRAWER ||============================== //

const currWindow = window

const LogoutButton = () => (
  <ListItemButton
    onClick={() => {
      reactLocalStorage.clear()
      currWindow.location.href = "/"
    }}
    sx={{
      m: 2,
      borderRadius: 1.5,
      color: sidebarColors.text,
      borderTop: 'none',
      '&:hover': {
        bgcolor: sidebarColors.hover,
        color: sidebarColors.textActive
      }
    }}
  >
    <ListItemIcon sx={{ minWidth: 28, color: 'inherit' }}>
      <LogoutOutlined style={{ fontSize: '1rem' }} />
    </ListItemIcon>
    <ListItemText primary={<Typography variant="h6" sx={{ color: 'inherit' }}>Logout</Typography>} />
  </ListItemButton>
);

const MainDrawer = ({ open, handleDrawerToggle, window }) => {
  const theme = useTheme();
  const matchDownMD = useMediaQuery(theme.breakpoints.down('lg'));

  // responsive drawer container
  const container = window !== undefined ? () => window().document.body : undefined;

  // header content
  const drawerContent = useMemo(() => <DrawerContent />, []);
  const drawerHeader = useMemo(() => <DrawerHeader open={open} />, [open]);

  return (
    <Box component="nav" sx={{ flexShrink: { md: 0 }, zIndex: 1300 }} aria-label="mailbox folders">
      {!matchDownMD ? (
        <MiniDrawerStyled variant="permanent" open={open}>
          {drawerHeader}
          {drawerContent}
          <LogoutButton />
        </MiniDrawerStyled>
      ) : (
        <Drawer
          container={container}
          variant="temporary"
          open={open}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', lg: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: `1px solid ${sidebarColors.border}`,
              bgcolor: sidebarColors.background,
              color: sidebarColors.text,
              backgroundImage: 'none',
              boxShadow: 'inherit'
            }
          }}
        >
          {open && drawerHeader}
          {open && drawerContent}
          <LogoutButton />
        </Drawer>
      )}
    </Box>
  );
};

MainDrawer.propTypes = {
  open: PropTypes.bool,
  handleDrawerToggle: PropTypes.func,
  window: PropTypes.object
};

export default MainDrawer;
