import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  CircularProgress,
  Divider,
  Avatar,
  IconButton,
  Tooltip,
  Stack,
  Container
} from '@mui/material';
import {
  IconArrowLeft,
  IconEdit,
  IconCurrencyDollar,
  IconCalendar,
  IconUser,
  IconMail,
  IconPhone,
  IconMapPin,
  IconTruck,
  IconCheck,
  IconX,
  IconClock,
  IconCreditCard,
  IconShoppingCart,
  IconNotes,
  IconPackage
} from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import { ordersAPI } from '../../services/api';
import MainCard from '../../ui-component/cards/MainCard';

const OrderView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusDialog, setStatusDialog] = useState({ open: false, type: '' });
  const [statusForm, setStatusForm] = useState({
    status: '',
    payment_status: '',
    notes: ''
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getById(id);
      const orderData = response.data.success ? response.data.data : response.data;
      setOrder(orderData);
      setStatusForm({
        status: orderData.status || '',
        payment_status: orderData.payment_status || '',
        notes: orderData.notes || ''
      });
      setError('');
    } catch (err) {
      setError('Failed to fetch order details');
      console.error('Error fetching order:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      setUpdating(true);
      if (statusDialog.type === 'status') {
        await ordersAPI.updateStatus(id, {
          status: statusForm.status,
          notes: statusForm.notes
        });
      } else if (statusDialog.type === 'payment') {
        await ordersAPI.updatePaymentStatus(id, {
          payment_status: statusForm.payment_status
        });
      }
      
      await fetchOrder(); // Refresh order data
      setStatusDialog({ open: false, type: '' });
    } catch (err) {
      setError('Failed to update order status');
      console.error('Error updating status:', err);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'processing': return 'info';
      case 'shipped': return 'primary';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getPaymentStatusColor = (paymentStatus) => {
    switch (paymentStatus) {
      case 'pending': return 'warning';
      case 'paid': return 'success';
      case 'failed': return 'error';
      case 'refunded': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <IconClock size={20} />;
      case 'processing': return <IconClock size={20} />;
      case 'shipped': return <IconTruck size={20} />;
      case 'delivered': return <IconCheck size={20} />;
      case 'cancelled': return <IconX size={20} />;
      default: return <IconClock size={20} />;
    }
  };

  const openStatusDialog = (type) => {
    setStatusDialog({ open: true, type });
  };

  const closeStatusDialog = () => {
    setStatusDialog({ open: false, type: '' });
  };

  if (loading) {
    return (
      <MainCard title="Order Details">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </MainCard>
    );
  }

  if (!order) {
    return (
      <MainCard title="Order Details">
        <Alert severity="error">Order not found</Alert>
      </MainCard>
    );
  }

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: 'grey.50', p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3, maxWidth: '1400px', mx: 'auto' }}>
          {error}
        </Alert>
      )}

      {/* Header */}
      <Box sx={{ mb: 4, maxWidth: '1400px', mx: 'auto' }}>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <IconButton 
            onClick={() => navigate('/admin/orders')} 
            sx={{ 
              bgcolor: 'white', 
              '&:hover': { bgcolor: 'grey.100' },
              borderRadius: 2,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <IconArrowLeft size={20} />
          </IconButton>
          <Typography variant="h4" fontWeight="600">
            {order.order_number || `Order #${order.id}`}
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={2} alignItems="center">
          <Chip
            icon={getStatusIcon(order.status)}
            label={order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
            color={getStatusColor(order.status)}
            variant="filled"
            sx={{ fontWeight: 500 }}
          />
          <Chip
            label={order.payment_status?.charAt(0).toUpperCase() + order.payment_status?.slice(1)}
            color={getPaymentStatusColor(order.payment_status)}
            variant="outlined"
            sx={{ fontWeight: 500 }}
          />
          <Button
            variant="outlined"
            size="small"
            startIcon={<IconEdit size={16} />}
            onClick={() => openStatusDialog('status')}
            sx={{ ml: 'auto' }}
          >
            Update Status
          </Button>
        </Stack>
      </Box>

      <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
        <Grid container spacing={4}>
          {/* Main Content */}
          <Grid item xs={12} lg={8}>
          {/* Order Summary */}
          <Card 
            sx={{ 
              mb: 4, 
              border: '1px solid', 
              borderColor: 'grey.200',
              borderRadius: 3,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight="600" mb={4} color="text.primary">
                Order Summary
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} lg={4} xl={3}>
                  <Box 
                    sx={{ 
                      p: 2.5, 
                      bgcolor: 'grey.50', 
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'grey.100'
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <IconCalendar size={18} color="#666" />
                      <Typography variant="body2" color="text.secondary" fontWeight="500">
                        Order Date
                      </Typography>
                    </Box>
                    <Typography variant="body1" fontWeight="600" mb={0.5}>
                      {new Date(order.created_at).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(order.created_at).toLocaleTimeString()}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} lg={4} xl={3}>
                  <Box 
                    sx={{ 
                      p: 2.5, 
                      bgcolor: 'primary.50', 
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'primary.100'
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <IconCurrencyDollar size={18} color="#1976d2" />
                      <Typography variant="body2" color="text.secondary" fontWeight="500">
                        Total Amount
                      </Typography>
                    </Box>
                    <Typography variant="h5" color="primary.main" fontWeight="700">
                      ${parseFloat(order.total_amount || 0).toFixed(2)}
                    </Typography>
                  </Box>
                </Grid>

                {order.shipped_at && (
                  <Grid item xs={12} sm={6} lg={4} xl={3}>
                    <Box 
                      sx={{ 
                        p: 2.5, 
                        bgcolor: 'info.50', 
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'info.100'
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <IconTruck size={18} color="#0288d1" />
                        <Typography variant="body2" color="text.secondary" fontWeight="500">
                          Shipped Date
                        </Typography>
                      </Box>
                      <Typography variant="body1" fontWeight="600">
                        {new Date(order.shipped_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Grid>
                )}

                {order.delivered_at && (
                  <Grid item xs={12} sm={6} lg={4} xl={3}>
                    <Box 
                      sx={{ 
                        p: 2.5, 
                        bgcolor: 'success.50', 
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'success.100'
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <IconCheck size={18} color="#2e7d32" />
                        <Typography variant="body2" color="text.secondary" fontWeight="500">
                          Delivered Date
                        </Typography>
                      </Box>
                      <Typography variant="body1" fontWeight="600">
                        {new Date(order.delivered_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card 
            sx={{ 
              border: '1px solid', 
              borderColor: 'grey.200',
              borderRadius: 3,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ p: 4, pb: 3 }}>
              <Typography variant="h6" fontWeight="600" color="text.primary">
                Order Items
              </Typography>
            </Box>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell sx={{ fontWeight: 600, border: 'none', py: 2, px: 4 }}>Product</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, border: 'none', py: 2 }}>Quantity</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, border: 'none', py: 2 }}>Unit Price</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, border: 'none', py: 2, px: 4 }}>Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.order_items?.map((item, index) => (
                    <TableRow 
                      key={item.id} 
                      sx={{ 
                        '&:last-child td': { border: 0 },
                        '&:hover': { bgcolor: 'grey.25' }
                      }}
                    >
                      <TableCell sx={{ border: 'none', py: 3, px: 4 }}>
                        <Box display="flex" alignItems="center" gap={3}>
                          <Avatar
                            src={item.product_image}
                            alt={item.product_title}
                            variant="rounded"
                            sx={{ 
                              width: 64, 
                              height: 64,
                              bgcolor: 'grey.100',
                              borderRadius: 2
                            }}
                          >
                            <IconPackage size={28} />
                          </Avatar>
                          <Box>
                            <Typography variant="body1" fontWeight="600" mb={0.5} color="text.primary">
                              {item.product_title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" mb={0.5}>
                              Type: {item.product_type}
                            </Typography>
                            {item.custom_options && Object.keys(item.custom_options).length > 0 && (
                              <Chip 
                                label="Custom options" 
                                size="small" 
                                variant="outlined"
                                sx={{ fontSize: '0.7rem', height: '20px' }}
                              />
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="center" sx={{ border: 'none', py: 3 }}>
                        <Box 
                          sx={{ 
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: 32,
                            height: 32,
                            bgcolor: 'primary.50',
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'primary.100'
                          }}
                        >
                          <Typography variant="body1" fontWeight="600" color="primary.main">
                            {item.quantity}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right" sx={{ border: 'none', py: 3 }}>
                        <Typography variant="body1" fontWeight="500">
                          ${parseFloat(item.unit_price || 0).toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ border: 'none', py: 3, px: 4 }}>
                        <Typography variant="body1" fontWeight="600" color="text.primary">
                          ${parseFloat(item.total_price || 0).toFixed(2)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <Box 
              sx={{ 
                p: 4, 
                pt: 3, 
                bgcolor: 'primary.50', 
                borderTop: '1px solid', 
                borderColor: 'primary.100' 
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" fontWeight="600" color="text.primary">
                  Total Amount
                </Typography>
                <Typography variant="h4" color="primary.main" fontWeight="700">
                  ${parseFloat(order.total_amount || 0).toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={4}>
            {/* Customer Information */}
            <Card 
              sx={{ 
                border: '1px solid', 
                borderColor: 'grey.200',
                borderRadius: 3,
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" fontWeight="600" mb={3} color="text.primary">
                  Customer Information
                </Typography>
                
                {order.user && (
                  <Box 
                    mb={3} 
                    sx={{ 
                      p: 2.5, 
                      bgcolor: 'info.50', 
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'info.100'
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1.5} mb={1.5}>
                      <IconUser size={18} color="#0288d1" />
                      <Typography variant="body2" color="text.secondary" fontWeight="500">
                        Registered User
                      </Typography>
                    </Box>
                    <Typography variant="body1" fontWeight="600" mb={0.5}>
                      {order.user.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {order.user.email}
                    </Typography>
                  </Box>
                )}

                <Stack spacing={3}>
                  <Box>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <IconUser size={16} color="#666" />
                      <Typography variant="body2" color="text.secondary" fontWeight="500">
                        Billing Name
                      </Typography>
                    </Box>
                    <Typography variant="body1" fontWeight="600">
                      {order.billing_full_name}
                    </Typography>
                  </Box>

                  <Box>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <IconMail size={16} color="#666" />
                      <Typography variant="body2" color="text.secondary" fontWeight="500">
                        Email
                      </Typography>
                    </Box>
                    <Typography variant="body1">
                      {order.billing_email}
                    </Typography>
                  </Box>

                  {order.billing_phone && (
                    <Box>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <IconPhone size={16} color="#666" />
                        <Typography variant="body2" color="text.secondary" fontWeight="500">
                          Phone
                        </Typography>
                      </Box>
                      <Typography variant="body1">
                        {order.billing_phone}
                      </Typography>
                    </Box>
                  )}

                  <Box>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <IconMapPin size={16} color="#666" />
                      <Typography variant="body2" color="text.secondary" fontWeight="500">
                        Billing Address
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                      {order.billing_address}<br />
                      {order.billing_city}, {order.billing_state} {order.billing_postal_code}<br />
                      {order.billing_country}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card 
              sx={{ 
                border: '1px solid', 
                borderColor: 'grey.200',
                borderRadius: 3,
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h6" fontWeight="600" color="text.primary">
                    Payment Information
                  </Typography>
                  <IconButton 
                    size="small" 
                    onClick={() => openStatusDialog('payment')}
                    sx={{ 
                      bgcolor: 'grey.100', 
                      '&:hover': { bgcolor: 'grey.200' },
                      borderRadius: 2
                    }}
                  >
                    <IconEdit size={16} />
                  </IconButton>
                </Box>

                <Stack spacing={3}>
                  <Box>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <IconCreditCard size={16} color="#666" />
                      <Typography variant="body2" color="text.secondary" fontWeight="500">
                        Payment Method
                      </Typography>
                    </Box>
                    <Typography variant="body1" fontWeight="600" sx={{ textTransform: 'capitalize' }}>
                      {order.payment_method}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight="500" mb={1.5}>
                      Payment Status
                    </Typography>
                    <Chip
                      label={order.payment_status?.charAt(0).toUpperCase() + order.payment_status?.slice(1)}
                      color={getPaymentStatusColor(order.payment_status)}
                      variant="filled"
                      sx={{ fontWeight: 600, fontSize: '0.8rem' }}
                    />
                  </Box>

                  {order.payment_id && (
                    <Box>
                      <Typography variant="body2" color="text.secondary" fontWeight="500" mb={1}>
                        Payment ID
                      </Typography>
                      <Box 
                        sx={{ 
                          bgcolor: 'grey.50', 
                          p: 2, 
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'grey.200'
                        }}
                      >
                        <Typography 
                          variant="body2" 
                          fontFamily="monospace"
                          sx={{ 
                            fontSize: '0.75rem',
                            wordBreak: 'break-all',
                            color: 'text.secondary'
                          }}
                        >
                          {order.payment_id}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>

            {/* Notes */}
            {order.notes && (
              <Card 
                sx={{ 
                  border: '1px solid', 
                  borderColor: 'grey.200',
                  borderRadius: 3,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box display="flex" alignItems="center" gap={1} mb={3}>
                    <IconNotes size={18} color="#666" />
                    <Typography variant="h6" fontWeight="600" color="text.primary">
                      Notes
                    </Typography>
                  </Box>
                  <Box 
                    sx={{ 
                      bgcolor: 'warning.50', 
                      p: 2.5, 
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'warning.100'
                    }}
                  >
                    <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                      {order.notes}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Stack>
        </Grid>
        </Grid>
      </Box>

      {/* Status Update Dialog */}
      <Dialog open={statusDialog.open} onClose={closeStatusDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Update {statusDialog.type === 'status' ? 'Order Status' : 'Payment Status'}
        </DialogTitle>
        <DialogContent>
          {statusDialog.type === 'status' ? (
            <Box sx={{ pt: 1 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Order Status</InputLabel>
                <Select
                  value={statusForm.status}
                  label="Order Status"
                  onChange={(e) => setStatusForm(prev => ({ ...prev, status: e.target.value }))}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="processing">Processing</MenuItem>
                  <MenuItem value="shipped">Shipped</MenuItem>
                  <MenuItem value="delivered">Delivered</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Notes (Optional)"
                multiline
                rows={3}
                value={statusForm.notes}
                onChange={(e) => setStatusForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any notes about this status update..."
              />
            </Box>
          ) : (
            <Box sx={{ pt: 1 }}>
              <FormControl fullWidth>
                <InputLabel>Payment Status</InputLabel>
                <Select
                  value={statusForm.payment_status}
                  label="Payment Status"
                  onChange={(e) => setStatusForm(prev => ({ ...prev, payment_status: e.target.value }))}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                  <MenuItem value="refunded">Refunded</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeStatusDialog}>Cancel</Button>
          <Button
            onClick={handleStatusUpdate}
            variant="contained"
            disabled={updating}
            startIcon={updating ? <CircularProgress size={20} /> : null}
          >
            {updating ? 'Updating...' : 'Update'}
          </Button>
        </DialogActions>
        </Dialog>
    </Box>
    );
  };

export default OrderView;
