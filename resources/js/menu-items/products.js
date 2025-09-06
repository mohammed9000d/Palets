// assets
import { IconShoppingCart, IconPlus, IconPackage, IconTag } from '@tabler/icons-react';

// constant
const icons = { IconShoppingCart, IconPlus, IconPackage, IconTag };

// ==============================|| PRODUCTS MENU ITEMS ||============================== //

const products = {
  id: 'products',
  title: 'Products',
  type: 'group',
  children: [
    {
      id: 'products-list',
      title: 'All Products',
      type: 'item',
      url: '/admin/products',
      icon: icons.IconShoppingCart,
      breadcrumbs: false
    },
    {
      id: 'products-create',
      title: 'Add Product',
      type: 'item',
      url: '/admin/products/create',
      icon: icons.IconPlus,
      breadcrumbs: false
    }
  ]
};

export default products;
