import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  IconShoppingCart,
  IconEye
} from '@tabler/icons-react';
import { formatDistanceToNow } from 'date-fns';

const RecentOrders = ({ data, isLoading = false }) => {
  const navigate = useNavigate();

  const formatTimeAgo = (dateString) => {
    try {
      if (!dateString) return 'Unknown time';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Unknown time';
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.warn('Error formatting date:', error);
      return 'Unknown time';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return {
          bg: '#fff3e0',
          color: '#e65100',
          border: '#ffb74d'
        };
      case 'processing':
        return {
          bg: '#e3f2fd',
          color: '#0d47a1',
          border: '#64b5f6'
        };
      case 'shipped':
        return {
          bg: '#f3e5f5',
          color: '#4a148c',
          border: '#ba68c8'
        };
      case 'delivered':
        return {
          bg: '#e8f5e8',
          color: '#1b5e20',
          border: '#81c784'
        };
      case 'cancelled':
        return {
          bg: '#ffebee',
          color: '#c62828',
          border: '#ef5350'
        };
      default:
        return {
          bg: '#f5f5f5',
          color: '#424242',
          border: '#bdbdbd'
        };
    }
  };

  const handleViewOrder = (orderId) => {
    navigate(`/admin/orders/${orderId}`);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Orders
          </Typography>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
            <Typography>Loading recent orders...</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  const recentOrders = data?.recent_activity?.recent_orders || [];
  
  // Debug logging
  console.log('Recent Orders Data:', {
    fullData: data,
    recentActivity: data?.recent_activity,
    recentOrders: recentOrders,
    ordersLength: recentOrders.length
  });

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Recent Orders
        </Typography>
        
        {recentOrders.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography variant="body2" color="textSecondary">
              No recent orders
            </Typography>
          </Box>
        ) : (
          <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
            <List>
              {recentOrders.slice(0, 8).map((order, index) => {
                const statusColors = getStatusColor(order.status);
                
                return (
                  <React.Fragment key={order.id}>
                    <ListItem
                      sx={{
                        px: 0,
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: 'action.hover',
                          borderRadius: 1
                        }
                      }}
                      onClick={() => handleViewOrder(order.id)}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <IconShoppingCart size={20} />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" justifyContent="space-between">
                            <Typography variant="body2" fontWeight="medium">
                              {order.order_number || `Order #${order.id}`}
                            </Typography>
                            <Typography variant="body2" fontWeight="bold" color="primary">
                              ${parseFloat(order.total_amount || 0).toFixed(2)}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box mt={0.5} component="div">
                            <Typography variant="caption" color="textSecondary" display="block" component="span">
                              {order.billing_full_name || order.user?.name || 'Guest'} • {formatTimeAgo(order.created_at)}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={1} mt={0.5} component="div">
                              <Chip
                                label={order.status}
                                size="small"
                                sx={{
                                  backgroundColor: statusColors.bg,
                                  color: statusColors.color,
                                  border: `1px solid ${statusColors.border}`,
                                  fontWeight: 'medium',
                                  fontSize: '0.7rem',
                                  height: '22px'
                                }}
                              />
                              <Typography variant="caption" color="textSecondary" component="span">
                                {order.items_count || 0} item{(order.items_count || 0) !== 1 ? 's' : ''}
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                      <Tooltip title="View Order Details">
                        <IconButton 
                          size="small"
                          sx={{
                            '&:hover': {
                              backgroundColor: 'primary.light',
                              color: 'white'
                            }
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewOrder(order.id);
                          }}
                        >
                          <IconEye size={16} />
                        </IconButton>
                      </Tooltip>
                    </ListItem>
                    {index < recentOrders.slice(0, 8).length - 1 && <Divider />}
                  </React.Fragment>
                );
              })}
            </List>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentOrders;
