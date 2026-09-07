// project import
import dashboard from './dashboard';
import catalogue from './catalogue';
import marketing from './marketing';
import orders from './orders';
import setting from './settings';
import { isSuperAdmin } from 'helper/role';

// ==============================|| MENU ITEMS ||============================== //

// Dashboard stands alone above the labelled sections - a heading over a single
// item reads as noise.
let items = [dashboard]

// Catalogue and Marketing are superadmin-only, so for other roles those groups
// have no children and are left out entirely rather than showing an empty heading.
if (catalogue.children.length) {
  items.push(catalogue)
}

if (marketing.children.length) {
  items.push(marketing)
}

items.push(orders)

if (isSuperAdmin()) {
  items.push(setting)
}

const menuItems = {
  items: items
};

export default menuItems;
