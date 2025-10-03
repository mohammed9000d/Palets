import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import {
  IconShoppingCart,
  IconCurrencyDollar,
  IconTruck,
  IconCheck,
  IconClock,
  IconX,
  IconArrowRight
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { ordersAPI } from '../../services/api';

const OrdersWidget = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrderStats();
  }, []);

  const fetchOrderStats = async () => {
    try {
      const response = await ordersAPI.getStatistics();
      const data = response.data.success ? response.data.data : response.data;
      setStats(data);
      setError('');
    } catch (err) {
      setError('Failed to fetch order statistics');
      console.error('Error fetching order stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">{error}</Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" display="flex" alignItems="center" gap={1}>
            <IconShoppingCart size={20} />
            Orders Overview
          </Typography>
          <Button
            size="small"
            endIcon={<IconArrowRight size={16} />}
            onClick={() => navigate('/admin/orders')}
          >
            View All
          </Button>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Box textAlign="center" p={1}>
              <Box display="flex" alignItems="center" justifyContent="center" gap={1} mb={1}>
                <IconShoppingCart size={16} color="#1976d2" />
                <Typography variant="h4" color="primary">
                  {stats?.total_orders || 0}
                </Typography>
              </Box>
              <Typography variant="caption" color="textSecondary">
                Total Orders
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Box textAlign="center" p={1}>
              <Box display="flex" alignItems="center" justifyContent="center" gap={1} mb={1}>
                <IconCurrencyDollar size={16} color="#2e7d32" />
                <Typography variant="h4" color="success.main">
                  ${parseFloat(stats?.total_revenue || 0).toFixed(0)}
                </Typography>
              </Box>
              <Typography variant="caption" color="textSecondary">
                Total Revenue
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Box textAlign="center" p={1}>
              <Box display="flex" alignItems="center" justifyContent="center" gap={1} mb={1}>
                <IconClock size={16} color="#ed6c02" />
                <Typography variant="h4" color="warning.main">
                  {stats?.pending_orders || 0}
                </Typography>
              </Box>
              <Typography variant="caption" color="textSecondary">
                Pending Orders
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Box textAlign="center" p={1}>
              <Box display="flex" alignItems="center" justifyContent="center" gap={1} mb={1}>
                <IconCheck size={16} color="#2e7d32" />
                <Typography variant="h4" color="success.main">
                  {stats?.delivered_orders || 0}
                </Typography>
              </Box>
              <Typography variant="caption" color="textSecondary">
                Delivered
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Box mt={2}>
          <Typography variant="body2" color="textSecondary" mb={1}>
            Quick Stats
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            <Chip
              icon={<IconTruck size={14} />}
              label={`${stats?.shipped_orders || 0} Shipped`}
              size="small"
              color="primary"
              variant="outlined"
            />
            <Chip
              icon={<IconClock size={14} />}
              label={`${stats?.processing_orders || 0} Processing`}
              size="small"
              color="info"
              variant="outlined"
            />
            <Chip
              icon={<IconX size={14} />}
              label={`${stats?.cancelled_orders || 0} Cancelled`}
              size="small"
              color="error"
              variant="outlined"
            />
          </Box>
        </Box>

        {stats?.recent_orders && stats.recent_orders.length > 0 && (
          <Box mt={2}>
            <Typography variant="body2" color="textSecondary" mb={1}>
              Recent Orders
            </Typography>
            {stats.recent_orders.slice(0, 3).map((order) => (
              <Box
                key={order.id}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                py={0.5}
                sx={{
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  '&:last-child': { borderBottom: 'none' }
                }}
              >
                <Box>
                  <Typography variant="body2" fontWeight="medium">
                    {order.order_number || `#${order.id}`}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {order.billing_full_name}
                  </Typography>
                </Box>
                <Box textAlign="right">
                  <Typography variant="body2" fontWeight="medium">
                    ${parseFloat(order.total_amount || 0).toFixed(2)}
                  </Typography>
                  <Chip
                    label={order.status}
                    size="small"
                    color={
                      order.status === 'delivered' ? 'success' :
                      order.status === 'shipped' ? 'primary' :
                      order.status === 'cancelled' ? 'error' : 'warning'
                    }
                    sx={{ fontSize: '0.6rem', height: '16px' }}
                  />
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default OrdersWidget;
