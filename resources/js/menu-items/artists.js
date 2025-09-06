// assets
import { IconPalette, IconBrush, IconPhoto, IconPlus } from '@tabler/icons-react';

// constant
const icons = { IconPalette, IconBrush, IconPhoto, IconPlus };

// ==============================|| ARTISTS MENU ITEMS ||============================== //

const artists = {
  id: 'artists',
  title: 'Artists & Artworks',
  type: 'group',
  children: [
    {
      id: 'artists-list',
      title: 'Artists',
      type: 'item',
      url: '/admin/artists',
      icon: icons.IconPalette,
      breadcrumbs: false
    },
    {
      id: 'artists-create',
      title: 'Add Artist',
      type: 'item',
      url: '/admin/artists/create',
      icon: icons.IconPlus,
      breadcrumbs: false
    },
    {
      id: 'artworks-list',
      title: 'Artworks',
      type: 'item',
      url: '/admin/artworks',
      icon: icons.IconPhoto,
      breadcrumbs: false
    },
    {
      id: 'artworks-create',
      title: 'Add Artwork',
      type: 'item',
      url: '/admin/artworks/create',
      icon: icons.IconBrush,
      breadcrumbs: false
    }
  ]
};

export default artists;
