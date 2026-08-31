// project import
import pages from './pages';
import dashboard from './dashboard';
import { isSuperAdmin } from 'helper/role';

import setting from './settings';

// ==============================|| MENU ITEMS ||============================== //

let items = [dashboard, pages]

if (isSuperAdmin()) {
  items.push(setting)
}

const menuItems = {
  items: items
};

export default menuItems;
