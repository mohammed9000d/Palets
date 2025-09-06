import { createBrowserRouter } from 'react-router-dom';

// routes
import AuthenticationRoutes from './AuthenticationRoutes';
import MainRoutes from './MainRoutes';
import WebsiteRoutes from './WebsiteRoutes';
import AppWithAuth from 'components/AppWithAuth';

// ==============================|| ROUTING RENDER ||============================== //

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppWithAuth />,
    children: [...WebsiteRoutes, MainRoutes, AuthenticationRoutes]
  }
], {
  basename: '/'
});

export default router;
