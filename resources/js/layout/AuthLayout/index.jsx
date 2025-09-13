import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';

// ==============================|| AUTH LAYOUT ||============================== //

export default function AuthLayout() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Outlet />
    </Box>
  );
}
