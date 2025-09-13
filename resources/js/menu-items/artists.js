// assets
import { IconPalette, IconBrush, IconPhoto, IconPlus } from '@tabler/icons-react';

// constant
const icons = { IconPalette, IconBrush, IconPhoto, IconPlus };

// ==============================|| ARTISTS MENU ITEMS ||============================== //

const artists = {
  id: 'artists',
  title: 'Artists',
  type: 'item',
  url: '/admin/artists',
  icon: icons.IconPalette,
  breadcrumbs: false
};

export default artists;
