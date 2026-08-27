import { lazy } from 'react';

// project import
import Loadable from 'components/Loadable';
import MinimalLayout from 'layout/MinimalLayout';
import { reactLocalStorage } from 'reactjs-localstorage';
import { Navigate } from 'react-router';

// render - login
const AuthLogin = Loadable(lazy(() => import('pages/authentication/Login')));
const AuthRegister = Loadable(lazy(() => import('pages/authentication/Register')));

// ==============================|| AUTH ROUTING ||============================== //

const isLoggedIn = reactLocalStorage.get('lbv_admin_token');

const LoginRoutes = {
  path: '/',
  element: !isLoggedIn ? <MinimalLayout /> : <Navigate to="/" />,
  children: [
    {
      path: 'login',
      element: <AuthLogin />
    },
    {
      path: 'register',
      element: <AuthRegister />
    }
  ]
};

export default LoginRoutes;
