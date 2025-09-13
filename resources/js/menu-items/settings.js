// assets
import { IconSettings } from '@tabler/icons-react';

// constant
const icons = { IconSettings };

// ==============================|| SETTINGS MENU ITEMS ||============================== //

const settings = {
  id: 'settings',
  title: 'Settings',
  type: 'item',
  url: '/admin/settings',
  icon: icons.IconSettings,
  breadcrumbs: false
};

export default settings;
