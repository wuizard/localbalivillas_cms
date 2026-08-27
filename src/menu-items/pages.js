// assets
import { LoginOutlined, ProfileOutlined, HomeOutlined, CalendarOutlined, PercentageOutlined, FileTextOutlined } from '@ant-design/icons';
import { reactLocalStorage } from 'reactjs-localstorage';

// icons
const icons = {
  LoginOutlined,
  ProfileOutlined,
  HomeOutlined,
  CalendarOutlined,
  PercentageOutlined,
  FileTextOutlined
};

// ==============================|| MENU ITEMS - EXTRA PAGES ||============================== //

let getUserInfo = reactLocalStorage.get('user_info')
getUserInfo = getUserInfo ? JSON.parse(getUserInfo) : null

const pages = {
  id: 'places',
  title: '',
  type: 'group',
  children: [
    {
      id: 'orders',
      title: 'Orders',
      type: 'item',
      url: '/order',
      icon: icons.CalendarOutlined,
      breadcrumbs: true
      // target: true
    }
  ]
};

if (getUserInfo && (!getUserInfo.role || getUserInfo.role == "superadmin")) {
  // Drafts are a tab inside Places rather than their own menu entry.
  pages.children.unshift({
    id: 'places',
    title: 'Places',
    type: 'item',
    url: '/places',
    icon: icons.HomeOutlined,
    breadcrumbs: true
    // target: true
  })
  pages.children.push({
    id: 'coupons',
    title: 'Coupons',
    type: 'item',
    url: '/coupons',
    icon: icons.PercentageOutlined,
    breadcrumbs: true
    // target: true
  })
}

export default pages;
