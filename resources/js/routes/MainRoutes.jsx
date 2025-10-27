import { lazy } from 'react';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';
import AdminProtectedRoute from 'components/AdminProtectedRoute';

// dashboard routing
const DashboardDefault = Loadable(lazy(() => import('views/dashboard/Default')));

// utilities routing
const UtilsTypography = Loadable(lazy(() => import('views/utilities/Typography')));
const UtilsColor = Loadable(lazy(() => import('views/utilities/Color')));
const UtilsShadow = Loadable(lazy(() => import('views/utilities/Shadow')));

// sample page routing
const SamplePage = Loadable(lazy(() => import('views/sample-page')));

// admin routing
const AdminList = Loadable(lazy(() => import('views/admin/AdminList')));
const AdminForm = Loadable(lazy(() => import('views/admin/AdminForm')));

// users routing
const UsersList = Loadable(lazy(() => import('views/users/UsersList')));
const UsersForm = Loadable(lazy(() => import('views/users/UsersForm')));

// artists routing
const ArtistsList = Loadable(lazy(() => import('views/artists/ArtistsList')));
const ArtistsForm = Loadable(lazy(() => import('views/artists/ArtistsForm')));
const ArtistView = Loadable(lazy(() => import('views/artists/ArtistView')));


// news routing
const NewsList = Loadable(lazy(() => import('views/news/NewsList')));
const NewsForm = Loadable(lazy(() => import('views/news/NewsForm')));
const NewsView = Loadable(lazy(() => import('views/news/NewsView')));

// products routing
const ProductsList = Loadable(lazy(() => import('views/products/ProductsList')));
const ProductsForm = Loadable(lazy(() => import('views/products/ProductsForm')));

// galleries routing
const GalleriesList = Loadable(lazy(() => import('views/galleries/GalleriesList')));
const GalleriesForm = Loadable(lazy(() => import('views/galleries/GalleriesForm')));

// settings routing
const Settings = Loadable(lazy(() => import('views/settings/Settings')));

// orders routing
const OrdersList = Loadable(lazy(() => import('views/orders/OrdersList')));
const OrderView = Loadable(lazy(() => import('views/orders/OrderView')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/admin',
  element: (
    <AdminProtectedRoute>
      <MainLayout />
    </AdminProtectedRoute>
  ),
  children: [
    {
      path: '/admin',
      element: <DashboardDefault />
    },
    {
      path: '/admin/dashboard',
      children: [
        {
          path: 'default',
          element: <DashboardDefault />
        }
      ]
    },
    {
      path: '/admin/list',
      element: <AdminList />
    },
    {
      path: '/admin/create',
      element: <AdminForm />
    },
    {
      path: '/admin/edit/:id',
      element: <AdminForm />
    },
    {
      path: '/admin/users',
      element: <UsersList />
    },
    {
      path: '/admin/users/create',
      element: <UsersForm />
    },
    {
      path: '/admin/users/edit/:id',
      element: <UsersForm />
    },
    {
      path: '/admin/artists',
      element: <ArtistsList />
    },
    {
      path: '/admin/artists/create',
      element: <ArtistsForm />
    },
    {
      path: '/admin/artists/edit/:slug',
      element: <ArtistsForm />
    },
    {
      path: '/admin/artists/view/:slug',
      element: <ArtistView />
    },
    {
      path: '/admin/articles',
      element: <NewsList />
    },
    {
      path: '/admin/articles/create',
      element: <NewsForm />
    },
    {
      path: '/admin/articles/:id/edit',
      element: <NewsForm />
    },
    {
      path: '/admin/articles/:id',
      element: <NewsView />
    },
    {
      path: '/admin/products',
      element: <ProductsList />
    },
    {
      path: '/admin/products/create',
      element: <ProductsForm />
    },
    {
      path: '/admin/products/edit/:slug',
      element: <ProductsForm />
    },
    {
      path: '/admin/galleries',
      element: <GalleriesList />
    },
    {
      path: '/admin/galleries/create',
      element: <GalleriesForm />
    },
    {
      path: '/admin/galleries/edit/:slug',
      element: <GalleriesForm />
    },
    {
      path: '/admin/orders',
      element: <OrdersList />
    },
    {
      path: '/admin/orders/:id',
      element: <OrderView />
    },
    {
      path: '/admin/settings',
      element: <Settings />
    }
  ]
};

export default MainRoutes;
