import { useEffect, useState } from 'react';

// material-ui
import Grid from '@mui/material/Grid';
import { Alert, CircularProgress, Box } from '@mui/material';

// project imports

// New dashboard components
import StatCard from '../../../components/dashboard/StatCard';
import RevenueChart from '../../../components/dashboard/RevenueChart';
import OrdersAnalytics from '../../../components/dashboard/OrdersAnalytics';
import RecentOrders from '../../../components/dashboard/RecentActivity';

import { gridSpacing } from 'store/constant';
import { dashboardAPI } from '../../../services/api';

// assets
import {
  IconCurrencyDollar,
  IconShoppingCart,
  IconUsers,
  IconPackage
} from '@tabler/icons-react';

// ==============================|| DEFAULT DASHBOARD ||============================== //

export default function Dashboard() {
  const [isLoading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getStatistics();
      const data = response.data.success ? response.data.data : response.data;
      setDashboardData(data);
      setError('');
    } catch (err) {
      setError('Failed to fetch dashboard data. Please check if the backend server is running.');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Grid container spacing={gridSpacing}>
      {/* Overview Statistics Cards */}
      <Grid size={12}>
        <Grid container spacing={gridSpacing}>
          <Grid size={{ lg: 3, md: 6, sm: 6, xs: 12 }}>
            <StatCard
              title="Total Revenue"
              value={dashboardData?.overview?.total_revenue || 0}
              prefix="$"
              icon={IconCurrencyDollar}
              color="success"
              trend={dashboardData?.overview?.revenue_growth > 0 ? 'up' : dashboardData?.overview?.revenue_growth < 0 ? 'down' : 'neutral'}
              trendValue={Math.abs(parseFloat(dashboardData?.overview?.revenue_growth || 0))}
              subtitle="All time revenue"
              variant="gradient"
              isLoading={isLoading}
            />
          </Grid>
          <Grid size={{ lg: 3, md: 6, sm: 6, xs: 12 }}>
            <StatCard
              title="Total Orders"
              value={dashboardData?.overview?.total_orders || 0}
              icon={IconShoppingCart}
              color="primary"
              subtitle={`${dashboardData?.overview?.monthly_orders || 0} this month`}
              isLoading={isLoading}
            />
          </Grid>
          <Grid size={{ lg: 3, md: 6, sm: 6, xs: 12 }}>
            <StatCard
              title="Total Users"
              value={dashboardData?.overview?.total_users || 0}
              icon={IconUsers}
              color="info"
              subtitle={`${dashboardData?.overview?.new_users_this_month || 0} new this month`}
              isLoading={isLoading}
            />
          </Grid>
          <Grid size={{ lg: 3, md: 6, sm: 6, xs: 12 }}>
            <StatCard
              title="Active Products"
              value={dashboardData?.overview?.active_products || 0}
              icon={IconPackage}
              color="secondary"
              subtitle={`${dashboardData?.overview?.total_products || 0} total products`}
              isLoading={isLoading}
            />
          </Grid>
        </Grid>
      </Grid>

      {/* Revenue Chart */}
      <Grid size={12}>
        <RevenueChart data={dashboardData?.revenue} isLoading={isLoading} />
      </Grid>

      {/* Orders Analytics */}
      <Grid size={12}>
        <OrdersAnalytics data={dashboardData?.orders} isLoading={isLoading} />
      </Grid>

      {/* Recent Orders */}
      <Grid size={12}>
        <RecentOrders data={dashboardData} isLoading={isLoading} />
      </Grid>
    </Grid>
  );
}
