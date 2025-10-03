import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Grid,
  Avatar,
  Divider,
  Stack,
  Paper,
  Breadcrumbs,
  useTheme,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tab,
  Tabs,
  Badge
} from '@mui/material';
import {
  IconPackage,
  IconCalendar,
  IconCurrencyDollar,
  IconTruck,
  IconCheck,
  IconX,
  IconArrowLeft,
  IconShoppingBag,
  IconEye,
  IconChevronDown,
  IconRuler,
  IconClock,
  IconMapPin,
  IconCreditCard,
  IconBrandPaypal,
  IconBrandStripe
} from '@tabler/icons-react';
import { useAuth } from '../../contexts/AuthContext';
import configService from '../../services/configService';

const MyOrders = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/my-orders' } } });
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Load orders
  useEffect(() => {
    if (isAuthenticated && user) {
      loadOrders();
    }
  }, [isAuthenticated, user]);

  const getApiUrl = (endpoint = '') => {
    if (configService.isInitialized()) {
      return configService.getApiEndpointUrl(endpoint);
    }
    return `/api/${endpoint}`.replace(/\/+/g, '/').replace(/\/$/, '');
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(getApiUrl('orders'), {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders.data || []);
      } else {
        setError('Failed to load orders');
      }
    } catch (err) {
      setError('Failed to load orders');
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadOrderDetails = async (orderId) => {
    try {
      const response = await fetch(getApiUrl(`orders/${orderId}`), {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedOrder(data.order);
        setShowOrderDetails(true);
      } else {
        setError('Failed to load order details');
      }
    } catch (err) {
      setError('Failed to load order details');
      console.error('Error loading order details:', err);
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      setCancellingOrderId(orderId);
      const response = await fetch(getApiUrl(`orders/${orderId}/cancel`), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        await loadOrders();
        setError('');
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to cancel order');
      }
    } catch (err) {
      setError('Failed to cancel order');
      console.error('Error cancelling order:', err);
    } finally {
      setCancellingOrderId(null);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'processing': return '#3b82f6';
      case 'shipped': return '#8b5cf6';
      case 'delivered': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'paid': return '#10b981';
      case 'failed': return '#ef4444';
      case 'refunded': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <IconClock size={16} />;
      case 'processing': return <IconPackage size={16} />;
      case 'shipped': return <IconTruck size={16} />;
      case 'delivered': return <IconCheck size={16} />;
      case 'cancelled': return <IconX size={16} />;
      default: return <IconPackage size={16} />;
    }
  };

  const getPaymentIcon = (method) => {
    switch (method) {
      case 'stripe': return <IconBrandStripe size={16} />;
      case 'paypal': return <IconBrandPaypal size={16} />;
      default: return <IconCreditCard size={16} />;
    }
  };

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === statusFilter);

  const orderCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress size={40} />
        </Box>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      {/* Header Section */}
      <Box sx={{ 
        bgcolor: 'white', 
        borderBottom: '1px solid #e2e8f0',
        py: 4
      }}>
        <Container maxWidth="xl">
          {/* Breadcrumbs */}
          <Breadcrumbs sx={{ mb: 4 }}>
            <Link 
              to="/" 
              style={{ 
                textDecoration: 'none', 
                color: theme.palette.text.secondary, 
                fontSize: '0.875rem'
              }}
            >
              Home
            </Link>
            <Link 
              to="/profile" 
              style={{ 
                textDecoration: 'none', 
                color: theme.palette.text.secondary, 
                fontSize: '0.875rem'
              }}
            >
              Profile
            </Link>
            <Typography color="text.primary" sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
              My Orders
            </Typography>
          </Breadcrumbs>

          {/* Header */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            mb: 6
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '12px',
                  bgcolor: theme.palette.primary.main,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <IconPackage size={32} color="white" />
              </Box>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#1a202c', mb: 1 }}>
                  My Orders
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Track and manage your orders
                </Typography>
              </Box>
            </Box>
            
            <Button
              component={Link}
              to="/profile"
              startIcon={<IconArrowLeft size={18} />}
              variant="outlined"
              sx={{ 
                textTransform: 'none',
                fontWeight: 500,
                px: 3,
                py: 1.5
              }}
            >
              Back to Profile
            </Button>
          </Box>

          {/* Status Filter Tabs */}
          <Box sx={{ borderBottom: '1px solid #e2e8f0' }}>
            <Tabs
              value={statusFilter}
              onChange={(e, newValue) => setStatusFilter(newValue)}
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  minHeight: 56,
                  px: 3
                }
              }}
            >
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    All Orders
                    <Badge badgeContent={orderCounts.all} color="primary" />
                  </Box>
                } 
                value="all" 
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    Processing
                    <Badge badgeContent={orderCounts.processing} color="info" />
                  </Box>
                } 
                value="processing" 
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    Shipped
                    <Badge badgeContent={orderCounts.shipped} color="primary" />
                  </Box>
                } 
                value="shipped" 
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    Delivered
                    <Badge badgeContent={orderCounts.delivered} color="success" />
                  </Box>
                } 
                value="delivered" 
              />
            </Tabs>
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ py: 6 }}>
        {/* Error Alert */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 4 }} 
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <Paper sx={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center', 
            py: 16, 
            px: 8, 
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            bgcolor: 'white'
          }}>
            <Box
              sx={{
                width: 140,
                height: 140,
                borderRadius: '50%',
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 6
              }}
            >
              <IconShoppingBag size={70} color={theme.palette.primary.main} />
            </Box>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 700, color: '#1a202c' }}>
              {statusFilter === 'all' ? 'No orders yet' : `No ${statusFilter} orders`}
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 8, maxWidth: 500, lineHeight: 1.6 }}>
              {statusFilter === 'all' 
                ? "You haven't placed any orders yet. Start shopping to see your orders here."
                : `You don't have any ${statusFilter} orders at the moment.`
              }
            </Typography>
            {statusFilter === 'all' && (
              <Button
                component={Link}
                to="/products"
                variant="contained"
                size="large"
                startIcon={<IconShoppingBag size={24} />}
                sx={{
                  py: 3,
                  px: 8,
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontSize: '1.2rem',
                  fontWeight: 600
                }}
              >
                Start Shopping
              </Button>
            )}
          </Paper>
        ) : (
          <Stack spacing={4}>
            {filteredOrders.map((order) => (
              <Paper 
                key={order.id}
                sx={{ 
                  borderRadius: '16px', 
                  border: '1px solid #e2e8f0',
                  bgcolor: 'white',
                  overflow: 'hidden'
                }}
              >
                {/* Order Header */}
                <Box sx={{ 
                  p: 6, 
                  bgcolor: alpha(getStatusColor(order.status), 0.04),
                  borderBottom: '1px solid #e2e8f0'
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 4
                  }}>
                    {/* Left Side - Order Info */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      {/* Order Number & Date */}
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a202c', mb: 2 }}>
                          {order.order_number}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <IconCalendar size={18} color={theme.palette.text.secondary} />
                          <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                            {formatDate(order.created_at)}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Status */}
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
                          Status
                        </Typography>
                        <Chip
                          icon={getStatusIcon(order.status)}
                          label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          sx={{
                            bgcolor: getStatusColor(order.status),
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            height: 32,
                            '& .MuiChip-icon': {
                              color: 'white'
                            }
                          }}
                        />
                      </Box>

                      {/* Payment */}
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
                          Payment
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          {getPaymentIcon(order.payment_method)}
                          <Chip
                            label={order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                            size="small"
                            sx={{
                              bgcolor: alpha(getPaymentStatusColor(order.payment_status), 0.1),
                              color: getPaymentStatusColor(order.payment_status),
                              fontWeight: 600,
                              fontSize: '0.75rem'
                            }}
                          />
                        </Box>
                      </Box>

                      {/* Items Count */}
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
                          Items
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a202c' }}>
                          {order.order_items?.length || 0}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Right Side - Total & Actions */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
                          Total
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                          {formatPrice(order.total_amount)}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ ml: 3 }}>
                        <Stack direction="row" spacing={2}>
                          <Button
                            variant="contained"
                            size="medium"
                            startIcon={<IconEye size={18} />}
                            onClick={() => loadOrderDetails(order.id)}
                            sx={{ 
                              textTransform: 'none',
                              borderRadius: '12px',
                              fontWeight: 600,
                              px: 3,
                              py: 1.5
                            }}
                          >
                            View Details
                          </Button>
                          {order.status === 'pending' && order.payment_status !== 'refunded' && (
                            <Button
                              variant="outlined"
                              color="error"
                              size="medium"
                              startIcon={<IconX size={18} />}
                              onClick={() => cancelOrder(order.id)}
                              disabled={cancellingOrderId === order.id}
                              sx={{ 
                                textTransform: 'none',
                                borderRadius: '12px',
                                fontWeight: 600,
                                px: 3,
                                py: 1.5
                              }}
                            >
                              {cancellingOrderId === order.id ? 'Cancelling...' : 'Cancel'}
                            </Button>
                          )}
                        </Stack>
                      </Box>
                    </Box>
                  </Box>
                </Box>

                {/* Order Items Preview */}
                <Box sx={{ p: 6 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 4, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
                    Items ({order.order_items?.length || 0})
                  </Typography>
                  <Grid container spacing={3}>
                    {order.order_items?.slice(0, 4).map((item, index) => (
                      <Grid item xs={12} sm={6} md={3} key={index}>
                        <Box sx={{ 
                          display: 'flex', 
                          flexDirection: 'column',
                          gap: 3, 
                          p: 4, 
                          borderRadius: '16px', 
                          bgcolor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          height: '100%'
                        }}>
                          <Avatar
                            src={item.product_image}
                            variant="rounded"
                            sx={{ 
                              width: '100%', 
                              height: 120, 
                              borderRadius: '12px',
                              border: '2px solid white',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}
                          >
                            <IconShoppingBag size={32} />
                          </Avatar>
                          <Box>
                            <Typography 
                              variant="body1" 
                              fontWeight={600} 
                              sx={{ 
                                color: '#1a202c',
                                mb: 1,
                                lineHeight: 1.4,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical'
                              }}
                            >
                              {item.product_title}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                              <Typography variant="body2" color="text.secondary">
                                Qty: {item.quantity}
                              </Typography>
                              {item.custom_options?.custom_dimensions && (
                                <Chip
                                  icon={<IconRuler size={14} />}
                                  label="Custom"
                                  size="small"
                                  sx={{
                                    bgcolor: alpha(theme.palette.warning.main, 0.1),
                                    color: theme.palette.warning.main,
                                    fontWeight: 600,
                                    fontSize: '0.7rem',
                                    height: 24
                                  }}
                                />
                              )}
                            </Box>
                            <Typography 
                              variant="h6" 
                              fontWeight={700}
                              sx={{ color: theme.palette.primary.main }}
                            >
                              {formatPrice(item.total_price)}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    ))}
                    {order.order_items?.length > 4 && (
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          flexDirection: 'column',
                          gap: 2,
                          p: 4, 
                          borderRadius: '16px', 
                          bgcolor: alpha(theme.palette.primary.main, 0.04),
                          border: `2px dashed ${theme.palette.primary.main}`,
                          height: '100%',
                          minHeight: 200
                        }}>
                          <IconPackage size={40} color={theme.palette.primary.main} />
                          <Typography variant="h6" color="primary.main" fontWeight={700}>
                            +{order.order_items.length - 4}
                          </Typography>
                          <Typography variant="body2" color="primary.main" fontWeight={600} textAlign="center">
                            More Items
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              </Paper>
            ))}
          </Stack>
        )}

        {/* Order Details Dialog */}
        <Dialog
          open={showOrderDetails}
          onClose={() => setShowOrderDetails(false)}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '20px',
              maxHeight: '90vh'
            }
          }}
        >
          <DialogTitle sx={{ pb: 3, borderBottom: '1px solid #e2e8f0' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '12px',
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <IconPackage size={24} color={theme.palette.primary.main} />
              </Box>
              Order Details
            </Typography>
          </DialogTitle>
          
          <DialogContent dividers sx={{ p: 0 }}>
            {selectedOrder && (
              <Stack spacing={0}>
                {/* Order Summary */}
                <Box sx={{ p: 6, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                  <Grid container spacing={4}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Order Number</Typography>
                      <Typography variant="h5" fontWeight={700}>{selectedOrder.order_number}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Order Date</Typography>
                      <Typography variant="h6">{formatDate(selectedOrder.created_at)}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Status</Typography>
                      <Chip
                        icon={getStatusIcon(selectedOrder.status)}
                        label={selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                        sx={{
                          bgcolor: getStatusColor(selectedOrder.status),
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          height: 36,
                          '& .MuiChip-icon': {
                            color: 'white'
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Payment</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {getPaymentIcon(selectedOrder.payment_method)}
                        <Chip
                          label={selectedOrder.payment_status.charAt(0).toUpperCase() + selectedOrder.payment_status.slice(1)}
                          sx={{
                            bgcolor: alpha(getPaymentStatusColor(selectedOrder.payment_status), 0.1),
                            color: getPaymentStatusColor(selectedOrder.payment_status),
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            height: 32
                          }}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </Box>

                {/* Order Items */}
                <Box sx={{ p: 6 }}>
                  <Typography variant="h5" sx={{ mb: 4, fontWeight: 600 }}>
                    Items ({selectedOrder.order_items?.length || 0})
                  </Typography>
                  <Stack spacing={4}>
                    {selectedOrder.order_items?.map((item, index) => (
                      <Paper key={index} sx={{ p: 4, borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        <Grid container spacing={4} alignItems="center">
                          <Grid item xs={12} sm={2}>
                            <Avatar
                              src={item.product_image}
                              variant="rounded"
                              sx={{ width: 80, height: 80, borderRadius: '12px' }}
                            >
                              <IconShoppingBag size={32} />
                            </Avatar>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                              {item.product_title}
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                              Quantity: {item.quantity}
                            </Typography>
                            {item.custom_options?.custom_dimensions && (
                              <Chip
                                icon={<IconRuler size={16} />}
                                label={`${item.custom_options.custom_dimensions.width}×${item.custom_options.custom_dimensions.height}cm`}
                                variant="outlined"
                                sx={{ mt: 1 }}
                              />
                            )}
                          </Grid>
                          <Grid item xs={12} sm={2}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Unit Price</Typography>
                            <Typography variant="h6" fontWeight={600}>
                              {formatPrice(item.unit_price)}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={2}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Total</Typography>
                            <Typography variant="h5" fontWeight={700} color="primary.main">
                              {formatPrice(item.total_price)}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Paper>
                    ))}
                  </Stack>
                </Box>

                {/* Billing Information */}
                <Accordion>
                  <AccordionSummary 
                    expandIcon={<IconChevronDown size={20} />}
                    sx={{ bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0', p: 3 }}
                  >
                    <Typography variant="h6" fontWeight={600}>Billing Information</Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 6 }}>
                    <Grid container spacing={4}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Name</Typography>
                        <Typography variant="h6" fontWeight={600}>
                          {selectedOrder.billing_full_name}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Email</Typography>
                        <Typography variant="body1">{selectedOrder.billing_email}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Phone</Typography>
                        <Typography variant="body1">{selectedOrder.billing_phone}</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Address</Typography>
                        <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                          {selectedOrder.billing_address}<br />
                          {selectedOrder.billing_city}, {selectedOrder.billing_state} {selectedOrder.billing_postal_code}<br />
                          {selectedOrder.billing_country}
                        </Typography>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>

                {/* Order Total */}
                <Box sx={{ 
                  p: 6, 
                  bgcolor: alpha(theme.palette.primary.main, 0.02), 
                  borderTop: '1px solid #e2e8f0',
                  borderRadius: '0 0 20px 20px'
                }}>
                  <Typography variant="h5" sx={{ mb: 4, fontWeight: 700, color: '#1a202c' }}>
                    Order Summary
                  </Typography>
                  
                  <Box sx={{ 
                    bgcolor: 'white', 
                    borderRadius: '16px', 
                    p: 4, 
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                  }}>
                    <Stack spacing={3}>
                      {/* Subtotal */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body1" sx={{ fontWeight: 500, color: '#64748b' }}>
                          Subtotal
                        </Typography>
                        <Typography variant="h6" fontWeight={600} sx={{ color: '#1a202c' }}>
                          {formatPrice(selectedOrder.subtotal)}
                        </Typography>
                      </Box>
                      
                      {/* Tax */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body1" sx={{ fontWeight: 500, color: '#64748b' }}>
                          Tax
                        </Typography>
                        <Typography variant="h6" fontWeight={600} sx={{ color: '#1a202c' }}>
                          {formatPrice(selectedOrder.tax_amount)}
                        </Typography>
                      </Box>
                      
                      {/* Shipping */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body1" sx={{ fontWeight: 500, color: '#64748b' }}>
                          Shipping
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <IconTruck size={16} color={theme.palette.success.main} />
                          <Typography variant="body1" fontWeight={600} color="success.main">
                            Pay on delivery
                          </Typography>
                        </Box>
                      </Box>
                      
                      {/* Divider */}
                      <Divider sx={{ my: 2 }} />
                      
                      {/* Total */}
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                        p: 3,
                        borderRadius: '12px',
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                      }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a202c' }}>
                          Total
                        </Typography>
                        <Typography variant="h4" fontWeight={800} color="primary.main">
                          {formatPrice(selectedOrder.total_amount)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Box>
              </Stack>
            )}
          </DialogContent>
          
          <DialogActions sx={{ p: 4, borderTop: '1px solid #e2e8f0' }}>
            <Button 
              onClick={() => setShowOrderDetails(false)} 
              variant="outlined"
              size="large"
              sx={{ 
                borderRadius: '12px', 
                textTransform: 'none', 
                fontWeight: 600,
                px: 4,
                py: 2
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default MyOrders;