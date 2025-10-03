// assets
import { IconShoppingCart, IconEye, IconList } from '@tabler/icons-react';

// constant
const icons = { IconShoppingCart, IconEye, IconList };

// ==============================|| ORDERS MENU ITEMS ||============================== //

const orders = {
  id: 'orders',
  title: 'Orders',
  type: 'item',
  url: '/admin/orders',
  icon: icons.IconShoppingCart,
  breadcrumbs: false
};

export default orders;
