// assets
import { UsergroupDeleteOutlined, EnvironmentOutlined, PushpinOutlined } from '@ant-design/icons';

// icons
const icons = {
  UsergroupDeleteOutlined,
  EnvironmentOutlined,
  PushpinOutlined
};

// ==============================|| MENU ITEMS - SAMPLE PAGE & DOCUMENTATION ||============================== //

const setting = {
    id: 'setting',
    title: '',
    type: 'group',
    children: [
      {
        id: 'admin',
        title: 'Admin',
        type: 'item',
        url: 'setting/admins',
        icon: icons.UsergroupDeleteOutlined,
        breadcrumbs: true
      },
      {
        id: 'region',
        title: 'Region',
        type: 'item',
        url: 'setting/region',
        icon: icons.EnvironmentOutlined,
        breadcrumbs: true
      },
      {
        id: 'location',
        title: 'Location',
        type: 'item',
        url: 'setting/location',
        icon: icons.PushpinOutlined,
        breadcrumbs: true
      },
    ]
  };

export default setting;
