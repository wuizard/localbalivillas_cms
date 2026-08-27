// project import
import pages from './pages';
import dashboard from './dashboard';
import { reactLocalStorage } from 'reactjs-localstorage';

import utilities from './utilities';
import support from './support';
import setting from './settings';

// ==============================|| MENU ITEMS ||============================== //
let getUserInfo = reactLocalStorage.get('user_info')
getUserInfo = getUserInfo ? JSON.parse(getUserInfo) : null

let items = [dashboard, pages]

if (getUserInfo && (!getUserInfo.role || getUserInfo.role == "superadmin")) {
  items.push(setting)
}

const menuItems = {
  items: items
};

export default menuItems;
