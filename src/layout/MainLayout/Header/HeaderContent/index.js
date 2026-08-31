// material-ui
import { Box, IconButton, Link, useMediaQuery } from '@mui/material';
import { GithubOutlined } from '@ant-design/icons';

// project import
import Search from './Search';
import Profile from './Profile';
import Notification from './Notification';
import MobileSection from './MobileSection';

// ==============================|| HEADER - CONTENT ||============================== //

const HeaderContent = () => {
  const matchesXs = useMediaQuery((theme) => theme.breakpoints.down('md'));

  return (
    <>
      {/* {!matchesXs && <Search />} */}
      {matchesXs && <Box sx={{ width: '100%', ml: 1 }} />}

      {/* <IconButton
        component={Link}
        href="https://github.com/codedthemes/mantis-free-react-admin-template"
        target="_blank"
        disableRipple
        color="secondary"
        title="Download Free Version"
        sx={{ color: 'text.primary', bgcolor: 'grey.100' }}
      >
        <GithubOutlined />
      </IconButton> */}

      {/* <Notification /> */}
      {/* {!matchesXs && <Profile />} */}

      {/* MobileSection is the "..." button in the mobile header. Its popper renders a
          Toolbar whose only children - Search and Profile - are commented out, so
          tapping it opened an empty white bar over the page. Hidden until there is
          something to put in it; re-enable this line at that point. */}
      {/* {matchesXs && <MobileSection />} */}
    </>
  );
};

export default HeaderContent;
