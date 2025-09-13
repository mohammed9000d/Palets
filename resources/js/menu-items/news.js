// assets
import { IconNews, IconPlus, IconArticle } from '@tabler/icons-react';

// constant
const icons = { IconNews, IconPlus, IconArticle };

// ==============================|| NEWS MENU ITEMS ||============================== //

const news = {
  id: 'articles',
  title: 'Articles',
  type: 'item',
  url: '/admin/articles',
  icon: icons.IconArticle,
  breadcrumbs: false
};

export default news;
