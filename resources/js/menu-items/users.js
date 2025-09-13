// assets
import { IconUsers, IconUserPlus, IconUser } from '@tabler/icons-react';

// constant
const icons = { IconUsers, IconUserPlus, IconUser };

// ==============================|| USERS MENU ITEMS ||============================== //

const users = {
  id: 'users',
  title: 'Users',
  type: 'item',
  url: '/admin/users',
  icon: icons.IconUsers,
  breadcrumbs: false
};

export default users;


