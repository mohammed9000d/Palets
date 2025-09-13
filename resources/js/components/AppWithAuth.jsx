import React from 'react';
import { Outlet } from 'react-router-dom';
import { AuthProvider } from 'contexts/AuthContext';
import { AdminAuthProvider } from 'contexts/AdminAuthContext';
import { CartProvider } from 'contexts/CartContext';

// ==============================|| APP WITH AUTH PROVIDER ||============================== //

export default function AppWithAuth() {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <CartProvider>
          <Outlet />
        </CartProvider>
      </AdminAuthProvider>
    </AuthProvider>
  );
}
