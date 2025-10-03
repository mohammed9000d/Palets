import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  useTheme
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { format, parseISO } from 'date-fns';

const RevenueChart = ({ data, isLoading = false }) => {
  const theme = useTheme();
  const [chartType, setChartType] = useState('area');
  const [timeRange, setTimeRange] = useState('daily');

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'Invalid Date';
      const date = parseISO(dateString);
      if (isNaN(date.getTime())) return dateString;
      return timeRange === 'daily' 
        ? format(date, 'MMM dd')
        : format(date, 'MMM yyyy');
    } catch (error) {
      console.warn('Error formatting date:', error);
      return dateString || 'Invalid Date';
    }
  };

  const getChartData = () => {
    if (!data) return [];
    
    const sourceData = timeRange === 'daily' ? data.daily_revenue : data.monthly_revenue;
    
    return sourceData?.map(item => ({
      ...item,
      formattedDate: timeRange === 'daily' 
        ? formatDate(item.date)
        : `${item.month}/${item.year}`,
      revenue: parseFloat(item.revenue || 0)
    })) || [];
  };

  const chartData = getChartData();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            bgcolor: 'background.paper',
            p: 2,
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            boxShadow: 2
          }}
        >
          <Typography variant="body2" color="textSecondary">
            {label}
          </Typography>
          <Typography variant="h6" color="primary">
            {formatCurrency(payload[0].value)}
          </Typography>
          {payload[0].payload.orders && (
            <Typography variant="caption" color="textSecondary">
              {payload[0].payload.orders} orders
            </Typography>
          )}
        </Box>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" fontWeight="bold">Revenue Analytics</Typography>
          <Box display="flex" gap={2}>
            <ToggleButtonGroup
              value={timeRange}
              exclusive
              onChange={(e, newValue) => newValue && setTimeRange(newValue)}
              size="small"
              sx={{
                '& .MuiToggleButton-root': {
                  borderRadius: 2,
                  px: 2,
                  py: 0.5
                }
              }}
            >
              <ToggleButton value="daily">Daily</ToggleButton>
              <ToggleButton value="monthly">Monthly</ToggleButton>
            </ToggleButtonGroup>
            
            <ToggleButtonGroup
              value={chartType}
              exclusive
              onChange={(e, newValue) => newValue && setChartType(newValue)}
              size="small"
              sx={{
                '& .MuiToggleButton-root': {
                  borderRadius: 2,
                  px: 2,
                  py: 0.5
                }
              }}
            >
              <ToggleButton value="area">Area</ToggleButton>
              <ToggleButton value="line">Line</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>

        <Box height={400}>
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis 
                  dataKey="formattedDate" 
                  stroke={theme.palette.text.secondary}
                  fontSize={12}
                />
                <YAxis 
                  stroke={theme.palette.text.secondary}
                  fontSize={12}
                  tickFormatter={formatCurrency}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke={theme.palette.primary.main}
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            ) : (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis 
                  dataKey="formattedDate" 
                  stroke={theme.palette.text.secondary}
                  fontSize={12}
                />
                <YAxis 
                  stroke={theme.palette.text.secondary}
                  fontSize={12}
                  tickFormatter={formatCurrency}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke={theme.palette.primary.main}
                  strokeWidth={3}
                  dot={{ fill: theme.palette.primary.main, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: theme.palette.primary.main, strokeWidth: 2 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </Box>

        {data && (
          <Box mt={2} display="flex" justifyContent="space-around" textAlign="center">
            <Box>
              <Typography variant="h6" color="primary">
                {formatCurrency(data.revenue_by_payment_method?.reduce((sum, item) => sum + parseFloat(item.revenue || 0), 0) || 0)}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Total Revenue
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" color="secondary">
                {formatCurrency(parseFloat(data.average_order_value || 0))}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Avg Order Value
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" color="success.main">
                {formatCurrency(parseFloat(data.highest_order_value || 0))}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Highest Order
              </Typography>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default RevenueChart;
