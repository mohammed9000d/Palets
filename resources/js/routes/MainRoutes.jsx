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

// artworks routing
const ArtworksList = Loadable(lazy(() => import('views/artworks/ArtworksList')));
const ArtworksForm = Loadable(lazy(() => import('views/artworks/ArtworksForm')));
const ArtworkView = Loadable(lazy(() => import('views/artworks/ArtworkView')));

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
      path: '/admin/artworks',
      element: <ArtworksList />
    },
    {
      path: '/admin/artworks/create',
      element: <ArtworksForm />
    },
    {
      path: '/admin/artworks/edit/:slug',
      element: <ArtworksForm />
    },
    {
      path: '/admin/artworks/view/:slug',
      element: <ArtworkView />
    },
    {
      path: 'news',
      element: <NewsList />
    },
    {
      path: 'news/create',
      element: <NewsForm />
    },
    {
      path: 'news/:id',
      element: <NewsView />
    },
    {
      path: 'news/:id/edit',
      element: <NewsForm />
    },
    {
      path: 'products',
      element: <ProductsList />
    },
    {
      path: 'products/create',
      element: <ProductsForm />
    },
    {
      path: 'products/edit/:slug',
      element: <ProductsForm />
    },
    {
      path: 'galleries',
      element: <GalleriesList />
    },
    {
      path: 'galleries/create',
      element: <GalleriesForm />
    },
    {
      path: 'galleries/edit/:slug',
      element: <GalleriesForm />
    }
  ]
};

export default MainRoutes;
