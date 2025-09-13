// assets
import { IconUsers, IconUserPlus, IconSettings } from '@tabler/icons-react';

// constant
const icons = { IconUsers, IconUserPlus, IconSettings };

// ==============================|| ADMIN MENU ITEMS ||============================== //

const admin = {
  id: 'admin',
  title: 'Admins',
  type: 'item',
  url: '/admin/list',
  icon: icons.IconUsers,
  breadcrumbs: false
};

export default admin;
