// assets
import {
  LoginOutlined,
  ProfileOutlined,
  HomeOutlined,
  CalendarOutlined,
  PercentageOutlined,
  FileTextOutlined,
  CompassOutlined,
  GiftOutlined,
  MailOutlined,
  ScheduleOutlined
} from '@ant-design/icons';
import { isSuperAdmin } from 'helper/role';

// icons
const icons = {
  LoginOutlined,
  ProfileOutlined,
  HomeOutlined,
  CalendarOutlined,
  PercentageOutlined,
  FileTextOutlined,
  CompassOutlined,
  GiftOutlined,
  MailOutlined,
  ScheduleOutlined
};

// ==============================|| MENU ITEMS - EXTRA PAGES ||============================== //

/**
 * The order reads as two pairs: what we publish (Places, Activities, Occasions),
 * then what came in (Orders, Enquiries). That is how the team's day actually splits.
 *
 * Enquiries sits with Orders and is visible to everyone, because whoever works the
 * booking queue works this one. The catalogue entries follow Places and stay
 * superadmin-only.
 */
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
    },
    {
      id: 'activity-orders',
      title: 'Activity orders',
      type: 'item',
      url: '/activity-orders',
      icon: icons.ScheduleOutlined,
      breadcrumbs: true
    },
    {
      id: 'enquiries',
      title: 'Enquiries',
      type: 'item',
      url: '/enquiries',
      icon: icons.MailOutlined,
      breadcrumbs: true
    }
  ]
};

if (isSuperAdmin()) {
  // Catalogue entries go above Orders, in publish order. Drafts stay a tab inside
  // each screen rather than earning their own menu row.
  pages.children.unshift(
    {
      id: 'places',
      title: 'Places',
      type: 'item',
      url: '/places',
      icon: icons.HomeOutlined,
      breadcrumbs: true
    },
    {
      id: 'activities',
      title: 'Activities',
      type: 'item',
      url: '/activities',
      icon: icons.CompassOutlined,
      breadcrumbs: true
    },
    {
      id: 'occasions',
      title: 'Occasions',
      type: 'item',
      url: '/events',
      icon: icons.GiftOutlined,
      breadcrumbs: true
    }
  )
  pages.children.push({
    id: 'coupons',
    title: 'Coupons',
    type: 'item',
    url: '/coupons',
    icon: icons.PercentageOutlined,
    breadcrumbs: true
  })
}

export default pages;
