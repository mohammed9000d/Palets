import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Chip,
  LinearProgress,
  useTheme
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  IconClock,
  IconTruck,
  IconCheck,
  IconX,
  IconPackage
} from '@tabler/icons-react';

const OrdersAnalytics = ({ data, isLoading = false }) => {
  const theme = useTheme();

  const statusColors = {
    pending: theme.palette.warning.main,
    processing: theme.palette.info.main,
    shipped: theme.palette.primary.main,
    delivered: theme.palette.success.main,
    cancelled: theme.palette.error.main,
  };

  const statusIcons = {
    pending: IconClock,
    processing: IconPackage,
    shipped: IconTruck,
    delivered: IconCheck,
    cancelled: IconX,
  };

  const getStatusData = () => {
    if (!data?.orders_by_status) return [];
    
    return data.orders_by_status.map(item => ({
      name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
      value: item.count,
      color: statusColors[item.status] || theme.palette.grey[500]
    }));
  };

  const getPaymentStatusData = () => {
    if (!data?.orders_by_payment_status) return [];
    
    return data.orders_by_payment_status.map(item => ({
      name: item.payment_status.charAt(0).toUpperCase() + item.payment_status.slice(1),
      value: item.count,
      color: item.payment_status === 'paid' ? theme.palette.success.main :
             item.payment_status === 'pending' ? theme.palette.warning.main :
             item.payment_status === 'failed' ? theme.palette.error.main :
             theme.palette.info.main
    }));
  };

  const getTrendData = () => {
    if (!data?.orders_trend) return [];
    
    return data.orders_trend.map(item => ({
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      orders: item.orders
    }));
  };

  const statusData = getStatusData();
  const paymentStatusData = getPaymentStatusData();
  const trendData = getTrendData();

  const totalOrders = statusData.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            bgcolor: 'background.paper',
            p: 1.5,
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            boxShadow: 2
          }}
        >
          <Typography variant="body2">
            {payload[0].name}: {payload[0].value}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
            <Typography>Loading...</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Orders Analytics
        </Typography>
        
        <Box 
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 3,
            mt: 2
          }}
        >
          {/* Left Column - Order Status Distribution and Payment Status */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Order Status Distribution */}
            <Card sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Order Status Distribution
                </Typography>
                
                <Box height={200}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>

                <Box mt={2}>
                  {statusData.map((item, index) => {
                    const IconComponent = statusIcons[item.name.toLowerCase()];
                    const percentage = totalOrders > 0 ? ((item.value / totalOrders) * 100).toFixed(1) : 0;
                    
                    return (
                      <Box key={index} display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                        <Box display="flex" alignItems="center" gap={1}>
                          {IconComponent && <IconComponent size={14} color={item.color} />}
                          <Typography variant="body2" fontSize="0.85rem">{item.name}</Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2" fontWeight="bold" fontSize="0.85rem">
                            {item.value}
                          </Typography>
                          <Chip
                            label={`${percentage}%`}
                            size="small"
                            sx={{ bgcolor: item.color, color: 'white', minWidth: '45px', fontSize: '0.7rem', height: '20px' }}
                          />
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </CardContent>
            </Card>

            {/* Payment Status */}
            <Card sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Payment Status
                </Typography>
                
                <Box height={200}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {paymentStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>

                <Box mt={2}>
                  {paymentStatusData.map((item, index) => {
                    const totalPayments = paymentStatusData.reduce((sum, p) => sum + p.value, 0);
                    const percentage = totalPayments > 0 ? ((item.value / totalPayments) * 100).toFixed(1) : 0;
                    
                    return (
                      <Box key={index} display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                        <Typography variant="body2" fontSize="0.85rem">{item.name}</Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2" fontWeight="bold" fontSize="0.85rem">
                            {item.value}
                          </Typography>
                          <Chip
                            label={`${percentage}%`}
                            size="small"
                            sx={{ bgcolor: item.color, color: 'white', minWidth: '45px', fontSize: '0.7rem', height: '20px' }}
                          />
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Right Column - Orders Trend */}
          <Card sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Orders Trend (Last 30 Days)
              </Typography>
              
              <Box height={450}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis 
                      dataKey="date" 
                      stroke={theme.palette.text.secondary}
                      fontSize={11}
                    />
                    <YAxis 
                      stroke={theme.palette.text.secondary}
                      fontSize={11}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: theme.shape.borderRadius
                      }}
                    />
                    <Bar 
                      dataKey="orders" 
                      fill={theme.palette.primary.main}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </CardContent>
    </Card>
  );
};

export default OrdersAnalytics;
