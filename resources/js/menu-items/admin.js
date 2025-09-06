// assets
import { IconUsers, IconUserPlus, IconSettings } from '@tabler/icons-react';

// constant
const icons = { IconUsers, IconUserPlus, IconSettings };

// ==============================|| ADMIN MENU ITEMS ||============================== //

const admin = {
  id: 'admin',
  title: 'Admin Management',
  type: 'group',
  children: [
    {
      id: 'admin-list',
      title: 'Admin List',
      type: 'item',
      url: '/admin/list',
      icon: icons.IconUsers,
      breadcrumbs: false
    },
    {
      id: 'admin-create',
      title: 'Create Admin',
      type: 'item',
      url: '/admin/create',
      icon: icons.IconUserPlus,
      breadcrumbs: false
    }
  ]
};

export default admin;
