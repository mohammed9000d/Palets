// assets
import { IconShoppingCart, IconPlus, IconPackage, IconTag } from '@tabler/icons-react';

// constant
const icons = { IconShoppingCart, IconPlus, IconPackage, IconTag };

// ==============================|| PRODUCTS MENU ITEMS ||============================== //

const products = {
  id: 'products',
  title: 'Products',
  type: 'item',
  url: '/admin/products',
  icon: icons.IconShoppingCart,
  breadcrumbs: false
};

export default products;
