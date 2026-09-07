// assets
import { UsergroupDeleteOutlined, EnvironmentOutlined, PushpinOutlined, TagsOutlined } from '@ant-design/icons';

// icons
const icons = {
  UsergroupDeleteOutlined,
  EnvironmentOutlined,
  PushpinOutlined,
  TagsOutlined
};

// ==============================|| MENU ITEMS - SAMPLE PAGE & DOCUMENTATION ||============================== //

const setting = {
    id: 'setting',
    title: 'Settings',
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
      {
        id: 'categories',
        title: 'Categories',
        type: 'item',
        url: 'setting/categories',
        icon: icons.TagsOutlined,
        breadcrumbs: true
      },
    ]
  };

export default setting;
