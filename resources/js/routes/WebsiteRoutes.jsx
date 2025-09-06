import { lazy } from 'react';

// project imports
import Loadable from 'ui-component/Loadable';
import MinimalLayout from 'layout/MinimalLayout';
import AuthLayout from 'layout/AuthLayout';

// website routing
const WebsitePage = Loadable(lazy(() => import('views/website/Home')));
const ArticlesPage = Loadable(lazy(() => import('views/website/Articles')));
const ArticleDetailPage = Loadable(lazy(() => import('views/website/ArticleDetail')));
const ArtistsPage = Loadable(lazy(() => import('views/website/Artists')));
const ArtistProfilePage = Loadable(lazy(() => import('views/website/ArtistProfile')));
const ProductsPage = Loadable(lazy(() => import('views/website/Products')));
const ProductDetailPage = Loadable(lazy(() => import('views/website/ProductDetail')));
const CartPage = Loadable(lazy(() => import('views/website/Cart')));
const LoginPage = Loadable(lazy(() => import('views/website/Login')));
const RegisterPage = Loadable(lazy(() => import('views/website/Register')));
const ProfilePage = Loadable(lazy(() => import('views/website/Profile')));

// ==============================|| WEBSITE ROUTING ||============================== //

const WebsiteRoutes = [
  // Main website routes with navbar and footer
  {
    path: '/',
    element: <MinimalLayout />,
    children: [
      {
        path: '/',
        element: <WebsitePage />
      },
      {
        path: '/articles',
        element: <ArticlesPage />
      },
      {
        path: '/articles/:id',
        element: <ArticleDetailPage />
      },
      {
        path: '/artists',
        element: <ArtistsPage />
      },
      {
        path: '/artists/:slug',
        element: <ArtistProfilePage />
      },
      {
        path: '/products',
        element: <ProductsPage />
      },
      {
        path: '/products/:slug',
        element: <ProductDetailPage />
      },
      {
        path: '/cart',
        element: <CartPage />
      },
      {
        path: '/profile',
        element: <ProfilePage />
      }
    ]
  },
  // Authentication routes without navbar and footer
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: <LoginPage />
      },
      {
        path: '/register',
        element: <RegisterPage />
      }
    ]
  }
];

export default WebsiteRoutes;
