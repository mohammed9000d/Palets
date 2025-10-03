import React from 'react';
import { Outlet } from 'react-router-dom';
import { AuthProvider } from 'contexts/AuthContext';
import { AdminAuthProvider } from 'contexts/AdminAuthContext';
import { CartProvider } from 'contexts/CartContext';
import PageTitleUpdater from './PageTitleUpdater';

// ==============================|| APP WITH AUTH PROVIDER ||============================== //

export default function AppWithAuth() {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <CartProvider>
          <PageTitleUpdater />
          <Outlet />
        </CartProvider>
      </AdminAuthProvider>
    </AuthProvider>
  );
}
