// assets
import { PercentageOutlined } from '@ant-design/icons';
import { isSuperAdmin } from 'helper/role';

// icons
const icons = {
  PercentageOutlined
};

// ==============================|| MENU ITEMS - MARKETING ||============================== //

/**
 * How the catalogue is promoted, as opposed to what is in it. One entry today;
 * anything else that sells rather than lists - promotions, campaigns - belongs
 * here rather than beside Places and Activities.
 *
 * Superadmin-only, so the group is left out entirely for other roles.
 */
const marketing = {
  id: 'group-marketing',
  title: 'Marketing',
  type: 'group',
  children: []
};

if (isSuperAdmin()) {
  marketing.children.push({
    id: 'coupons',
    title: 'Coupons',
    type: 'item',
    url: '/coupons',
    icon: icons.PercentageOutlined,
    breadcrumbs: true
  })
}

export default marketing;
