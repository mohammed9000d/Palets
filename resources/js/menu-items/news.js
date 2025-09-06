// assets
import { IconNews, IconPlus, IconArticle } from '@tabler/icons-react';

// constant
const icons = { IconNews, IconPlus, IconArticle };

// ==============================|| NEWS MENU ITEMS ||============================== //

const news = {
  id: 'news',
  title: 'News Management',
  type: 'group',
  children: [
    {
      id: 'news-list',
      title: 'News Articles',
      type: 'item',
      url: '/admin/news',
      icon: icons.IconNews,
      breadcrumbs: false
    },
    {
      id: 'news-create',
      title: 'Add News',
      type: 'item',
      url: '/admin/news/create',
      icon: icons.IconPlus,
      breadcrumbs: false
    }
  ]
};

export default news;
