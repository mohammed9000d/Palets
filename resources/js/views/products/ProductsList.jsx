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
  Avatar,
  TextField,
  InputAdornment,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Stack
} from '@mui/material';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-markdown-preview/markdown.css';
import { 
  IconEdit, 
  IconTrash, 
  IconPlus, 
  IconSearch,
  IconEye,
  IconShoppingCart,
  IconPackage,
  IconPackageOff,
  IconTag
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { productsAPI } from '../../services/api';
import MainCard from '../../ui-component/cards/MainCard';

const ProductsList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, product: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 15,
    total: 0,
    last_page: 1
  });

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, statusFilter, stockFilter]);

  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        per_page: pagination.per_page,
        search: searchTerm || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
        in_stock: stockFilter === 'all' ? undefined : stockFilter === 'in_stock'
      };
      
      const response = await productsAPI.getAll(params);
      setProducts(response.data.data);
      setPagination({
        current_page: response.data.current_page,
        per_page: response.data.per_page,
        total: response.data.total,
        last_page: response.data.last_page
      });
      setError('');
    } catch (err) {
      setError('Failed to fetch products. Please check if the backend server is running.');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (product) => {
    try {
      await productsAPI.delete(product.slug);
      fetchProducts(pagination.current_page);
      setDeleteDialog({ open: false, product: null });
    } catch (err) {
      setError('Failed to delete product');
      console.error('Error deleting product:', err);
    }
  };

  const handleEdit = (product) => {
    navigate(`/admin/products/edit/${product.slug}`);
  };

  const handleView = (product) => {
    navigate(`/admin/products/view/${product.slug}`);
  };

  const handleToggleStock = async (product) => {
    try {
      await productsAPI.toggleStock(product.slug);
      fetchProducts(pagination.current_page);
    } catch (err) {
      setError('Failed to update stock status');
      console.error('Error toggling stock status:', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'success';
      case 'draft': return 'warning';
      case 'archived': return 'error';
      default: return 'default';
    }
  };

  const formatPrice = (price, discountPrice = null) => {
    const regularPrice = `$${parseFloat(price).toFixed(2)}`;
    if (discountPrice && parseFloat(discountPrice) < parseFloat(price)) {
      return (
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography 
            variant="body2" 
            sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
          >
            {regularPrice}
          </Typography>
          <Typography variant="body2" color="error.main" fontWeight="bold">
            ${parseFloat(discountPrice).toFixed(2)}
          </Typography>
        </Stack>
      );
    }
    return <Typography variant="body2">{regularPrice}</Typography>;
  };

  if (loading && products.length === 0) {
    return (
      <MainCard title="Products">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </MainCard>
    );
  }

  return (
    <MainCard 
      title="Products Management" 
      secondary={
        <Button
          variant="contained"
          startIcon={<IconPlus />}
          onClick={() => navigate('/admin/products/create')}
        >
          Add Product
        </Button>
      }
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconSearch />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="published">Published</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Stock</InputLabel>
              <Select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                label="Stock"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="in_stock">In Stock</MenuItem>
                <MenuItem value="out_of_stock">Out of Stock</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Card>

      {/* Products Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell>Artist</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Custom Dimensions</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id} hover>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar
                      src={product.cover_photo_thumb_url}
                      sx={{ width: 60, height: 60 }}
                      variant="rounded"
                    >
                      <IconShoppingCart />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {product.main_title}
                      </Typography>
                      {product.sub_title && (
                        <Typography variant="caption" color="textSecondary">
                          {product.sub_title}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </TableCell>
                
                <TableCell>
                  {product.artist ? (
                    <Chip 
                      label={product.artist.artist_name} 
                      size="small" 
                      variant="outlined"
                      color="primary"
                    />
                  ) : (
                    <Typography variant="caption" color="textSecondary">
                      No Artist
                    </Typography>
                  )}
                </TableCell>
                
                <TableCell>
                  {formatPrice(product.price, product.discount_price)}
                  {product.is_on_sale && (
                    <Chip 
                      label={`${product.discount_percentage}% OFF`}
                      size="small"
                      color="error"
                      sx={{ ml: 1 }}
                    />
                  )}
                </TableCell>
                
                <TableCell>
                  <Tooltip title={product.in_stock ? "In Stock" : "Out of Stock"}>
                    <IconButton 
                      onClick={() => handleToggleStock(product)}
                      color={product.in_stock ? "success" : "error"}
                      size="small"
                    >
                      {product.in_stock ? <IconPackage /> : <IconPackageOff />}
                    </IconButton>
                  </Tooltip>
                </TableCell>
                
                <TableCell>
                  <Chip 
                    label={product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                    color={getStatusColor(product.status)}
                    size="small"
                  />
                </TableCell>
                
                <TableCell>
                  {product.is_custom_dimension ? (
                    <Chip 
                      label="Available" 
                      color="info" 
                      size="small"
                      icon={<IconTag />}
                    />
                  ) : (
                    <Typography variant="caption" color="textSecondary">
                      Standard
                    </Typography>
                  )}
                </TableCell>
                
                <TableCell>
                  <Box display="flex" gap={1}>
                    <Tooltip title="Edit Product">
                      <IconButton 
                        onClick={() => handleEdit(product)}
                        color="primary"
                        size="small"
                      >
                        <IconEdit />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Delete Product">
                      <IconButton 
                        onClick={() => setDeleteDialog({ open: true, product })}
                        color="error"
                        size="small"
                      >
                        <IconTrash />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            
            {products.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Box py={4}>
                    <IconShoppingCart size={48} style={{ opacity: 0.3 }} />
                    <Typography variant="h6" color="textSecondary" mt={2}>
                      No products found
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {searchTerm || statusFilter !== 'all' || stockFilter !== 'all'
                        ? 'Try adjusting your filters'
                        : 'Start by creating your first product'
                      }
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<IconPlus />}
                      onClick={() => navigate('/admin/products/create')}
                      sx={{ mt: 2 }}
                    >
                      Create Product
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {pagination.last_page > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Button
            onClick={() => fetchProducts(pagination.current_page - 1)}
            disabled={pagination.current_page === 1}
            sx={{ mr: 1 }}
          >
            Previous
          </Button>
          
          <Typography variant="body2" sx={{ mx: 2, alignSelf: 'center' }}>
            Page {pagination.current_page} of {pagination.last_page} 
            ({pagination.total} total products)
          </Typography>
          
          <Button
            onClick={() => fetchProducts(pagination.current_page + 1)}
            disabled={pagination.current_page === pagination.last_page}
            sx={{ ml: 1 }}
          >
            Next
          </Button>
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, product: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography mb={2}>
            Are you sure you want to delete the product "{deleteDialog.product?.main_title}"? 
            This action cannot be undone.
          </Typography>
          
          {deleteDialog.product?.product_details && (
            <Box mt={2}>
              <Typography variant="subtitle2" gutterBottom>
                Product Details Preview:
              </Typography>
              <Box 
                sx={{ 
                  maxHeight: 200, 
                  overflow: 'auto', 
                  border: 1, 
                  borderColor: 'divider', 
                  borderRadius: 1, 
                  p: 1,
                  bgcolor: 'grey.50'
                }}
              >
                <MDEditor.Markdown 
                  source={deleteDialog.product.product_details} 
                  style={{ whiteSpace: 'pre-wrap' }}
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialog({ open: false, product: null })}
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            onClick={() => handleDelete(deleteDialog.product)}
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

export default ProductsList;