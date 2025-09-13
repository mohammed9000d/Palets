// assets
import { IconPalette, IconPlus, IconPhoto, IconCalendar } from '@tabler/icons-react';

// constant
const icons = { IconPalette, IconPlus, IconPhoto, IconCalendar };

// ==============================|| GALLERIES MENU ITEMS ||============================== //

const galleries = {
  id: 'galleries',
  title: 'Galleries',
  type: 'item',
  url: '/admin/galleries',
  icon: icons.IconPalette,
  breadcrumbs: false
};

export default galleries;
