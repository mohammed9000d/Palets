// assets
import { IconPalette, IconPlus, IconPhoto, IconCalendar } from '@tabler/icons-react';

// constant
const icons = { IconPalette, IconPlus, IconPhoto, IconCalendar };

// ==============================|| GALLERIES MENU ITEMS ||============================== //

const galleries = {
  id: 'galleries',
  title: 'Art Panel Galleries',
  type: 'group',
  children: [
    {
      id: 'galleries-list',
      title: 'All Galleries',
      type: 'item',
      url: '/admin/galleries',
      icon: icons.IconPalette,
      breadcrumbs: false
    },
    {
      id: 'galleries-create',
      title: 'Create Gallery',
      type: 'item',
      url: '/admin/galleries/create',
      icon: icons.IconPlus,
      breadcrumbs: false
    }
  ]
};

export default galleries;
