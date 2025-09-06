import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Chip,
  Alert,
  CircularProgress,
  Avatar,
  Grid,
  Stack,
  Card,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  IconEdit, 
  IconArrowLeft,
  IconShoppingCart,
  IconTag,
  IconCurrencyDollar,
  IconPackage,
  IconTruck,
  IconDimensions,
  IconStar,
  IconStarFilled,
  IconEye,
  IconHeart
} from '@tabler/icons-react';
import { productsAPI } from '../../services/api';
import MainCard from '../../ui-component/cards/MainCard';

const ProductView = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (slug) {
      loadProduct();
    }
  }, [slug]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getBySlug(slug);
      setProduct(response.data.product);
      setError('');
    } catch (err) {
      setError('Failed to load product details');
      console.error('Error loading product:', err);
    } finally {
      setLoading(false);
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
            variant="h4" 
            sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
          >
            {regularPrice}
          </Typography>
          <Typography variant="h4" color="error.main" fontWeight="bold">
            ${parseFloat(discountPrice).toFixed(2)}
          </Typography>
          <Chip 
            label={`${product?.discount_percentage}% OFF`}
            size="small"
            color="error"
          />
        </Stack>
      );
    }
    return <Typography variant="h4">{regularPrice}</Typography>;
  };

  if (loading) {
    return (
      <MainCard title="Product Details">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </MainCard>
    );
  }

  if (error || !product) {
    return (
      <MainCard title="Product Details">
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Product not found'}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<IconArrowLeft />}
          onClick={() => navigate('/admin/products')}
        >
          Back to Products
        </Button>
      </MainCard>
    );
  }

  return (
    <MainCard 
      title={product.main_title}
      secondary={
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<IconArrowLeft />}
            onClick={() => navigate('/admin/products')}
          >
            Back
          </Button>
          <Button
            variant="contained"
            startIcon={<IconEdit />}
            onClick={() => navigate(`/admin/products/edit/${product.slug}`)}
          >
            Edit Product
          </Button>
        </Stack>
      }
    >
      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          <Stack spacing={3}>
            {/* Basic Information */}
            <Card>
              <CardHeader 
                title="Product Information" 
                avatar={<IconShoppingCart />}
                sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}
              />
              <CardContent>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="h3" gutterBottom>
                      {product.main_title}
                    </Typography>
                    {product.sub_title && (
                      <Typography variant="h6" color="textSecondary" gutterBottom>
                        {product.sub_title}
                      </Typography>
                    )}
                  </Box>

                  <Box>
                    {formatPrice(product.price, product.discount_price)}
                  </Box>

                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Chip 
                      label={product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                      color={getStatusColor(product.status)}
                    />
                    {product.is_featured && (
                      <Chip 
                        label="Featured" 
                        color="warning"
                        icon={<IconStarFilled />}
                      />
                    )}
                    {product.in_stock ? (
                      <Chip 
                        label="In Stock" 
                        color="success"
                        icon={<IconPackage />}
                      />
                    ) : (
                      <Chip 
                        label="Out of Stock" 
                        color="error"
                        icon={<IconPackage />}
                      />
                    )}
                    {product.is_custom_dimension && (
                      <Chip 
                        label="Custom Dimensions" 
                        color="info"
                        icon={<IconDimensions />}
                      />
                    )}
                  </Stack>

                  {product.description && (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Description
                      </Typography>
                      <Typography variant="body1" paragraph>
                        {product.description}
                      </Typography>
                    </Box>
                  )}

                  {product.product_details && (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Product Details
                      </Typography>
                      <Typography variant="body1" paragraph>
                        {product.product_details}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>

            {/* Product Images */}
            {product.product_images && product.product_images.length > 0 && (
              <Card>
                <CardHeader 
                  title="Product Images" 
                  avatar={<IconTag />}
                  sx={{ bgcolor: 'secondary.light', color: 'secondary.contrastText' }}
                />
                <CardContent>
                  <Grid container spacing={2}>
                    {product.product_images.map((image, index) => (
                      <Grid item xs={6} sm={4} md={3} key={index}>
                        <Avatar
                          src={image.preview || image.url}
                          sx={{ width: '100%', height: 120 }}
                          variant="rounded"
                        />
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            )}

            {/* Dimensions & Shipping */}
            {(product.dimensions || product.shipping_info) && (
              <Card>
                <CardHeader 
                  title="Dimensions & Shipping" 
                  avatar={<IconTruck />}
                  sx={{ bgcolor: 'info.light', color: 'info.contrastText' }}
                />
                <CardContent>
                  <Grid container spacing={3}>
                    {product.dimensions && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="h6" gutterBottom>
                          Dimensions
                        </Typography>
                        <Stack spacing={1}>
                          {product.dimensions.width && (
                            <Typography variant="body2">
                              Width: {product.dimensions.width} cm
                            </Typography>
                          )}
                          {product.dimensions.height && (
                            <Typography variant="body2">
                              Height: {product.dimensions.height} cm
                            </Typography>
                          )}
                          {product.dimensions.depth && (
                            <Typography variant="body2">
                              Depth: {product.dimensions.depth} cm
                            </Typography>
                          )}
                          {product.dimensions.weight && (
                            <Typography variant="body2">
                              Weight: {product.dimensions.weight} kg
                            </Typography>
                          )}
                        </Stack>
                      </Grid>
                    )}
                    
                    {product.shipping_info && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="h6" gutterBottom>
                          Shipping Information
                        </Typography>
                        <Stack spacing={1}>
                          {product.shipping_info.shipping_cost && (
                            <Typography variant="body2">
                              Shipping Cost: ${product.shipping_info.shipping_cost}
                            </Typography>
                          )}
                          {product.shipping_info.shipping_time && (
                            <Typography variant="body2">
                              Shipping Time: {product.shipping_info.shipping_time}
                            </Typography>
                          )}
                          {product.shipping_info.free_shipping_threshold && (
                            <Typography variant="body2">
                              Free Shipping Above: ${product.shipping_info.free_shipping_threshold}
                            </Typography>
                          )}
                        </Stack>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            )}
          </Stack>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            {/* Cover Photo */}
            <Card>
              <CardHeader 
                title="Cover Photo" 
                sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}
              />
              <CardContent>
                <Avatar
                  src={product.cover_photo_preview_url || product.cover_photo_url}
                  sx={{ width: '100%', height: 200, mx: 'auto' }}
                  variant="rounded"
                >
                  <IconShoppingCart size={48} />
                </Avatar>
              </CardContent>
            </Card>

            {/* Product Details */}
            <Card>
              <CardHeader 
                title="Product Details" 
                avatar={<IconTag />}
                sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}
              />
              <CardContent>
                <Stack spacing={2}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="textSecondary">
                      SKU:
                    </Typography>
                    <Typography variant="body2">
                      {product.sku || 'N/A'}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="textSecondary">
                      Category:
                    </Typography>
                    <Typography variant="body2">
                      {product.category || 'Uncategorized'}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="textSecondary">
                      Stock Quantity:
                    </Typography>
                    <Typography variant="body2">
                      {product.stock_quantity}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="textSecondary">
                      Min Order Qty:
                    </Typography>
                    <Typography variant="body2">
                      {product.min_order_quantity}
                    </Typography>
                  </Box>
                  
                  <Divider />
                  
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="textSecondary">
                      Views:
                    </Typography>
                    <Typography variant="body2">
                      {product.view_count}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="textSecondary">
                      Likes:
                    </Typography>
                    <Typography variant="body2">
                      {product.like_count}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <Card>
                <CardHeader 
                  title="Tags" 
                  avatar={<IconTag />}
                  sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}
                />
                <CardContent>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {product.tags.map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            )}
          </Stack>
        </Grid>
      </Grid>
    </MainCard>
  );
};

export default ProductView;
