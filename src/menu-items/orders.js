// assets
import { CalendarOutlined, ScheduleOutlined, MailOutlined } from '@ant-design/icons';

// icons
const icons = {
  CalendarOutlined,
  ScheduleOutlined,
  MailOutlined
};

// ==============================|| MENU ITEMS - ORDERS ||============================== //

/**
 * What came in and needs working. Enquiries sits here rather than with the
 * catalogue because whoever works the booking queue works this one, and all
 * three are visible to every role.
 */
const orders = {
  id: 'group-orders',
  title: 'Orders',
  type: 'group',
  children: [
    {
      id: 'orders',
      title: 'Bookings',
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

export default orders;
