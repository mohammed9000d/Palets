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
const ArtistProfileMinimalPage = Loadable(lazy(() => import('views/website/ArtistProfileMinimal')));
const ProductsPage = Loadable(lazy(() => import('views/website/Products')));
const ProductDetailPage = Loadable(lazy(() => import('views/website/ProductDetail')));
const GalleriesPage = Loadable(lazy(() => import('views/website/Galleries')));
const GalleryDetailPage = Loadable(lazy(() => import('views/website/GalleryDetail')));
const CartPage = Loadable(lazy(() => import('views/website/Cart')));
const CheckoutPage = Loadable(lazy(() => import('views/website/Checkout')));
const LoginPage = Loadable(lazy(() => import('views/website/Login')));
const RegisterPage = Loadable(lazy(() => import('views/website/Register')));
const ProfilePage = Loadable(lazy(() => import('views/website/Profile')));
const MyOrdersPage = Loadable(lazy(() => import('views/website/MyOrders')));

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
        path: '/artists/:slug/minimal',
        element: <ArtistProfileMinimalPage />
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
        path: '/galleries',
        element: <GalleriesPage />
      },
      {
        path: '/galleries/:slug',
        element: <GalleryDetailPage />
      },
      {
        path: '/cart',
        element: <CartPage />
      },
      {
        path: '/checkout',
        element: <CheckoutPage />
      },
      {
        path: '/profile',
        element: <ProfilePage />
      },
      {
        path: '/my-orders',
        element: <MyOrdersPage />
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
