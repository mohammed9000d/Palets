import dashboard from './dashboard';
import admin from './admin';
import users from './users';
import artists from './artists';
import products from './products';
import galleries from './galleries';
import news from './news';

// ==============================|| MENU ITEMS ||============================== //

const menuItems = {
  items: [dashboard, artists, products, galleries, news, users, admin]
};

export default menuItems;
