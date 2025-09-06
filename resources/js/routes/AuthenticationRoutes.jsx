import { lazy } from 'react';

// project imports
import Loadable from 'ui-component/Loadable';
import AuthLayout from 'layout/AuthLayout';

// maintenance routing
const LoginPage = Loadable(lazy(() => import('views/pages/authentication/Login')));
const RegisterPage = Loadable(lazy(() => import('views/pages/authentication/Register')));

// ==============================|| AUTHENTICATION ROUTING ||============================== //

const AuthenticationRoutes = {
  path: '/',
  element: <AuthLayout />,
  children: [
    {
      path: '/admin/login',
      element: <LoginPage />
    }
  ]
};

export default AuthenticationRoutes;
