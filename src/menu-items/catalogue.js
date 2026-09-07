// assets
import { HomeOutlined, CompassOutlined, GiftOutlined } from '@ant-design/icons';
import { isSuperAdmin } from 'helper/role';

// icons
const icons = {
  HomeOutlined,
  CompassOutlined,
  GiftOutlined
};

// ==============================|| MENU ITEMS - CATALOGUE ||============================== //

/**
 * What we publish, in publish order. Every entry here is superadmin-only, so the
 * group ends up with no children for other roles - index.js drops it rather than
 * rendering a heading with nothing under it.
 *
 * Drafts stay a tab inside each screen rather than earning their own menu row.
 */
const catalogue = {
  id: 'group-catalogue',
  title: 'Catalogue',
  type: 'group',
  children: []
};

if (isSuperAdmin()) {
  catalogue.children.push(
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
      id: 'events',
      title: 'Events',
      type: 'item',
      url: '/events',
      icon: icons.GiftOutlined,
      breadcrumbs: true
    }
  )
}

export default catalogue;
