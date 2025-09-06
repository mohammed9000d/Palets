import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from 'contexts/AdminAuthContext';
import { Box, CircularProgress } from '@mui/material';
import PropTypes from 'prop-types';

// ==============================|| ADMIN PROTECTED ROUTE ||============================== //

const AdminProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAdminAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    // Redirect to admin login page with return url
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};

AdminProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired
};

export default AdminProtectedRoute;
