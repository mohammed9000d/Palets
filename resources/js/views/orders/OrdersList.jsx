import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  TextField,
  InputAdornment,
  Tooltip
} from '@mui/material';
import { 
  IconEye, 
  IconTrash, 
  IconSearch, 
  IconShoppingCart,
  IconCalendar,
  IconCurrencyDollar,
  IconTruck,
  IconCheck,
  IconX,
  IconClock
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { ordersAPI } from '../../services/api';
import MainCard from '../../ui-component/cards/MainCard';
import TablePagination from '../../components/shared/TablePagination';
import TableSearch from '../../components/shared/TableSearch';

const OrdersList = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, order: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 15,
    total: 0,
    last_page: 1
  });

  useEffect(() => {
    fetchOrders();
  }, [searchTerm, statusFilter, paymentStatusFilter]);

  const fetchOrders = async (page = 1) => {
    try {
      if (orders.length === 0) setLoading(true);
      const params = {
        page,
        per_page: pagination.per_page,
        search: searchTerm || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
        payment_status: paymentStatusFilter === 'all' ? undefined : paymentStatusFilter,
        sort_by: 'created_at',
        sort_direction: 'desc'
      };
      const response = await ordersAPI.getAll(params);
      const data = response.data.success ? response.data.data : response.data;
      
      setOrders(data.data || data);
      setPagination({
        current_page: data.current_page || 1,
        per_page: data.per_page || 15,
        total: data.total || (data.length || 0),
        last_page: data.last_page || 1
      });
      setError('');
    } catch (err) {
      setError('Failed to fetch orders. Please check if the backend server is running.');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (order) => {
    try {
      await ordersAPI.delete(order.id);
      fetchOrders(pagination.current_page);
      setDeleteDialog({ open: false, order: null });
    } catch (err) {
      setError('Failed to delete order');
      console.error('Error deleting order:', err);
    }
  };

  const handlePageChange = (newPage) => {
    fetchOrders(newPage);
  };

  const handleView = (order) => {
    navigate(`/admin/orders/${order.id}`);
  };

  const openDeleteDialog = (order) => {
    setDeleteDialog({ open: true, order });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, order: null });
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
      case 'pending': return <IconClock size={16} />;
      case 'processing': return <IconClock size={16} />;
      case 'shipped': return <IconTruck size={16} />;
      case 'delivered': return <IconCheck size={16} />;
      case 'cancelled': return <IconX size={16} />;
      default: return <IconClock size={16} />;
    }
  };

  if (loading) {
    return (
      <MainCard title="Orders Management">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </MainCard>
    );
  }

  return (
    <MainCard
      title="Orders Management"
      secondary={
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="body2" color="textSecondary">
            Total: {pagination.total} orders
          </Typography>
        </Box>
      }
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <TableSearch
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Search by order number, customer name, or email..."
        filters={[
          {
            label: "Status",
            value: statusFilter,
            onChange: (e) => setStatusFilter(e.target.value),
            options: [
              { value: "all", label: "All Statuses" },
              { value: "pending", label: "Pending" },
              { value: "processing", label: "Processing" },
              { value: "shipped", label: "Shipped" },
              { value: "delivered", label: "Delivered" },
              { value: "cancelled", label: "Cancelled" }
            ]
          },
          {
            label: "Payment Status",
            value: paymentStatusFilter,
            onChange: (e) => setPaymentStatusFilter(e.target.value),
            options: [
              { value: "all", label: "All Payment Statuses" },
              { value: "pending", label: "Pending" },
              { value: "paid", label: "Paid" },
              { value: "failed", label: "Failed" },
              { value: "refunded", label: "Refunded" }
            ]
          }
        ]}
      />
      
      <TableContainer component={Paper} sx={{ overflow: 'auto', maxWidth: '100%' }}>
        <Table sx={{ minWidth: 1000 }}>
          <TableHead>
            <TableRow>
              <TableCell>Order #</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Items</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Payment</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
                <TableRow key={order.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {order.order_number || `ORD-${order.id}`}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {order.billing_full_name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {order.billing_email}
                      </Typography>
                      {order.user && (
                        <Typography variant="caption" color="primary" display="block">
                          User: {order.user.name}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <IconShoppingCart size={16} />
                      <Typography variant="body2">
                        {order.order_items?.length || 0} items
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <IconCurrencyDollar size={16} />
                      <Typography variant="body2" fontWeight="bold">
                        ${parseFloat(order.total_amount || 0).toFixed(2)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(order.status)}
                      label={order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                      color={getStatusColor(order.status)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={order.payment_status?.charAt(0).toUpperCase() + order.payment_status?.slice(1)}
                      color={getPaymentStatusColor(order.payment_status)}
                      size="small"
                    />
                    {order.payment_method && (
                      <Typography variant="caption" color="textSecondary" display="block">
                        via {order.payment_method}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <IconCalendar size={16} />
                      <Typography variant="body2">
                        {new Date(order.created_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="textSecondary">
                      {new Date(order.created_at).toLocaleTimeString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="View Details">
                      <IconButton
                        color="primary"
                        onClick={() => handleView(order)}
                        size="small"
                      >
                        <IconEye />
                      </IconButton>
                    </Tooltip>
                    {(order.status === 'pending' || order.status === 'cancelled') && (
                      <Tooltip title="Delete Order">
                        <IconButton
                          color="error"
                          onClick={() => openDeleteDialog(order)}
                          size="small"
                        >
                          <IconTrash />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            
            {orders.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Box py={4}>
                    <IconShoppingCart size={48} style={{ opacity: 0.3 }} />
                    <Typography variant="h6" color="textSecondary" mt={2}>
                      No orders found
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {searchTerm || (statusFilter !== 'all') || (paymentStatusFilter !== 'all')
                        ? 'Try adjusting your filters'
                        : 'Orders will appear here when customers place them'
                      }
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        pagination={pagination}
        onPageChange={handlePageChange}
        itemName="orders"
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={closeDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete order "{deleteDialog.order?.order_number || `#${deleteDialog.order?.id}`}"?
            This action cannot be undone.
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Only pending or cancelled orders can be deleted.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Cancel</Button>
          <Button
            onClick={() => handleDelete(deleteDialog.order)}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
};

export default OrdersList;
