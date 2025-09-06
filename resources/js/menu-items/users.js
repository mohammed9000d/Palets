// assets
import { IconUsers, IconUserPlus, IconUser } from '@tabler/icons-react';

// constant
const icons = { IconUsers, IconUserPlus, IconUser };

// ==============================|| USERS MENU ITEMS ||============================== //

const users = {
  id: 'users',
  title: 'User Management',
  type: 'group',
  children: [
    {
      id: 'users-list',
      title: 'Users List',
      type: 'item',
      url: '/admin/users',
      icon: icons.IconUsers,
      breadcrumbs: false
    },
    {
      id: 'users-create',
      title: 'Create User',
      type: 'item',
      url: '/admin/users/create',
      icon: icons.IconUserPlus,
      breadcrumbs: false
    }
  ]
};

export default users;


