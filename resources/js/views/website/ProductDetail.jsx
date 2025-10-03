import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
  Chip,
  Skeleton,
  Fade,
  Breadcrumbs,
  useTheme,
  alpha,
  Divider,
  IconButton,
  Stack,
  Paper,
  Rating,
  Badge,
  TextField,
  FormControlLabel,
  Switch,
  Alert
} from '@mui/material';
import {
  IconArrowLeft,
  IconPalette,
  IconShare,
  IconUser,
  IconZoomIn,
  IconX,
  IconInfoCircle,
  IconRuler,
  IconMinus,
  IconPlus,
  IconList
} from '@tabler/icons-react';
import { Modal, Backdrop } from '@mui/material';
import { publicProductsAPI } from '../../services/api';
import AddToCartButton from '../../components/cart/AddToCartButton';
import ProductReviews from '../../components/reviews/ProductReviews';
import ReactMarkdown from 'react-markdown';

const ProductDetail = () => {
  const theme = useTheme();
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [imageZoomed, setImageZoomed] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [customDimensions, setCustomDimensions] = useState({
    width: '',
    height: '',
    depth: ''
  });
  const [useCustomDimensions, setUseCustomDimensions] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const currentSlugRef = useRef(null);

  const loadProduct = useCallback(async (productSlug) => {
    // Prevent duplicate calls for the same slug
    if (currentSlugRef.current === productSlug) {
      console.log('Skipping duplicate call for:', productSlug);
      return;
    }

    currentSlugRef.current = productSlug;

    try {
      setLoading(true);
      console.log('Loading product:', productSlug); // Debug log
      const response = await publicProductsAPI.getBySlug(productSlug);
      
      if (response.data) {
        // Handle both direct product data and wrapped product data
        const productData = response.data.product || response.data;
        setProduct(productData);
        
        // Load related products
        loadRelatedProducts(productData);
      } else {
        navigate('/products', { replace: true });
      }
    } catch (error) {
      console.error('Error loading product:', error);
      navigate('/products', { replace: true });
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const loadRelatedProducts = useCallback(async (currentProduct) => {
    try {
      setLoadingRelated(true);
      // Fetch products from the same artist or similar category
      const response = await publicProductsAPI.getAll({ 
        limit: 3,
        exclude: currentProduct.slug 
      });
      
      if (response.data && response.data.data) {
        // Filter out the current product and take first 3
        const filtered = response.data.data
          .filter(p => p.slug !== currentProduct.slug)
          .slice(0, 3);
        setRelatedProducts(filtered);
      }
    } catch (error) {
      console.error('Error loading related products:', error);
      setRelatedProducts([]);
    } finally {
      setLoadingRelated(false);
    }
  }, []);

  useEffect(() => {
    if (slug) {
      loadProduct(slug);
    }
    
    // Cleanup function to reset the ref when slug changes
    return () => {
      if (currentSlugRef.current !== slug) {
        currentSlugRef.current = null;
      }
    };
  }, [slug, loadProduct]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.main_title,
        text: product.sub_title || product.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // You could add a toast notification here
    }
  };

  const handleQuantityChange = (newQuantity) => {
    setQuantity(Math.max(1, Math.min(10, newQuantity)));
  };

  const incrementQuantity = () => {
    setQuantity(prev => Math.min(prev + 1, 10));
  };

  const decrementQuantity = () => {
    setQuantity(prev => Math.max(prev - 1, 1));
  };

  const handleCustomDimensionChange = (dimension, value) => {
    setCustomDimensions(prev => ({
      ...prev,
      [dimension]: value
    }));
  };

  const isCustomDimensionsValid = () => {
    if (!useCustomDimensions || !product?.is_custom_dimension) return true;
    return customDimensions.width && customDimensions.height;
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Fade in timeout={300}>
          <Box>
            {/* Breadcrumbs Skeleton */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <Skeleton variant="text" width={60} height={20} sx={{ borderRadius: 1 }} />
              <Typography variant="body2" color="text.disabled">/</Typography>
              <Skeleton variant="text" width={80} height={20} sx={{ borderRadius: 1 }} />
              <Typography variant="body2" color="text.disabled">/</Typography>
              <Skeleton variant="text" width={140} height={20} sx={{ borderRadius: 1 }} />
            </Box>
            
            {/* Back Button Skeleton */}
            <Skeleton 
              variant="rectangular" 
              width={150} 
              height={40} 
              sx={{ mb: 4, borderRadius: 2 }} 
            />
            
            {/* Main Content Layout */}
            <Box sx={{ 
              display: 'flex', 
              gap: 4, 
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexDirection: { xs: 'column', lg: 'row' }
            }}>
              {/* Left Container: Product Photo + Info */}
              <Box sx={{ 
                flex: 1,
                maxWidth: { xs: '100%', lg: 'calc(100% - 270px)' }
              }}>
                <Grid container spacing={6}>
                  {/* Image Gallery Skeleton */}
                  <Grid item xs={12} md={6}>
                    <Box sx={{ 
                      width: { xs: 400, md: 600 },
                      maxWidth: '100%',
                      mx: 'auto'
                    }}>
                      {/* Main Image with enhanced styling */}
                      <Box sx={{ position: 'relative', mb: 2 }}>
                        <Skeleton 
                          variant="rectangular" 
                          sx={{ 
                            aspectRatio: '1/1',
                            borderRadius: 3,
                            width: '100%',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                          }} 
                        />
                        {/* Stock badge placeholder */}
                        <Skeleton 
                          variant="rectangular" 
                          width={80} 
                          height={24} 
                          sx={{ 
                            position: 'absolute', 
                            top: 16, 
                            left: 16, 
                            borderRadius: 3 
                          }} 
                        />
                        {/* Action buttons placeholder */}
                        <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 1 }}>
                          <Skeleton variant="circular" width={40} height={40} />
                          <Skeleton variant="circular" width={40} height={40} />
                        </Box>
                      </Box>
                      
                      {/* Thumbnail Images */}
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        {[1, 2, 3, 4].map((item) => (
                          <Skeleton 
                            key={item}
                            variant="rectangular" 
                            width={80} 
                            height={80} 
                            sx={{ 
                              borderRadius: 2, 
                              minWidth: 80,
                              border: `1px solid ${alpha(theme.palette.divider, 0.3)}`
                            }} 
                          />
                        ))}
                      </Box>
                    </Box>
          </Grid>
                  
                  {/* Product Info Skeleton */}
                  <Grid item xs={12} md={6}>
                    <Box>
                      {/* Title Section */}
                      <Box sx={{ mb: 4 }}>
                        <Skeleton variant="text" width="90%" height={48} sx={{ mb: 1.5, borderRadius: 1 }} />
                        <Skeleton variant="text" width="70%" height={28} sx={{ borderRadius: 1 }} />
                      </Box>
                      
                      {/* Rating Section */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                        <Skeleton variant="rectangular" width={100} height={20} sx={{ borderRadius: 1 }} />
                        <Skeleton variant="text" width={60} height={20} sx={{ borderRadius: 1 }} />
                        <Skeleton variant="text" width={80} height={20} sx={{ borderRadius: 1 }} />
                      </Box>
                      
                      {/* Price Section */}
                      <Box sx={{ mb: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 1 }}>
                          <Skeleton variant="text" width={120} height={48} sx={{ borderRadius: 1 }} />
                          <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 3 }} />
                        </Box>
                        <Skeleton variant="text" width={220} height={20} sx={{ borderRadius: 1 }} />
                      </Box>
                      
                      {/* Stock Status */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 4 }}>
                        <Skeleton variant="circular" width={8} height={8} />
                        <Skeleton variant="text" width={160} height={24} sx={{ borderRadius: 1 }} />
                      </Box>
                      
                      {/* Quantity Section */}
                      <Box sx={{ mb: 4 }}>
                        <Skeleton variant="text" width={80} height={24} sx={{ mb: 2, borderRadius: 1 }} />
                        <Skeleton 
                          variant="rectangular" 
                          width={180} 
                          height={56} 
                          sx={{ 
                            borderRadius: 3,
                            border: `2px solid ${theme.palette.divider}`
                          }} 
                        />
                      </Box>
                      
                      {/* Action Buttons */}
                      <Box sx={{ mb: 4 }}>
                        <Skeleton variant="rectangular" width="100%" height={48} sx={{ borderRadius: 2, mb: 2 }} />
                        <Skeleton variant="rectangular" width="100%" height={48} sx={{ borderRadius: 2 }} />
                      </Box>
                      
                      {/* Artist Info Card */}
                      <Box sx={{ 
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        borderRadius: 3,
                        p: 3,
                        bgcolor: alpha(theme.palette.primary.main, 0.02)
                      }}>
                        <Skeleton variant="text" width={60} height={16} sx={{ mb: 2, borderRadius: 1 }} />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Skeleton variant="circular" width={48} height={48} />
                          <Box sx={{ flex: 1 }}>
                            <Skeleton variant="text" width="70%" height={20} sx={{ mb: 0.5, borderRadius: 1 }} />
                            <Skeleton variant="text" width="50%" height={16} sx={{ borderRadius: 1 }} />
                          </Box>
                          <Skeleton variant="rectangular" width={90} height={32} sx={{ borderRadius: 1.5 }} />
                        </Box>
                      </Box>
                    </Box>
          </Grid>
        </Grid>
              </Box>

            </Box>
            
            
            {/* Description Section Skeleton */}
            <Box sx={{ mt: 8 }}>
              <Box sx={{ width: '100%', height: 1, bgcolor: alpha(theme.palette.divider, 0.1), mb: 6 }} />
              
              <Skeleton variant="text" width={220} height={40} sx={{ mb: 4, borderRadius: 1 }} />
              
              <Box sx={{ 
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                borderRadius: 3,
                p: 4,
                bgcolor: alpha(theme.palette.primary.main, 0.01)
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <Skeleton variant="circular" width={20} height={20} />
                  <Skeleton variant="text" width={180} height={24} sx={{ borderRadius: 1 }} />
                </Box>
                <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1, borderRadius: 1 }} />
                <Skeleton variant="text" width="95%" height={20} sx={{ mb: 1, borderRadius: 1 }} />
                <Skeleton variant="text" width="88%" height={20} sx={{ mb: 1, borderRadius: 1 }} />
                <Skeleton variant="text" width="70%" height={20} sx={{ borderRadius: 1 }} />
              </Box>
            </Box>
          </Box>
        </Fade>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container maxWidth="xl" sx={{ py: 8, textAlign: 'center' }}>
        <IconPalette size={64} color={theme.palette.text.secondary} />
        <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
          Product Not Found
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          The product you're looking for doesn't exist or has been removed.
        </Typography>
        <Button
          component={Link}
          to="/products"
          variant="contained"
          startIcon={<IconArrowLeft size={16} />}
        >
          Back to Products
        </Button>
      </Container>
    );
  }

  return (
    <Box>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Fade in timeout={800}>
          <Box>
            {/* Breadcrumbs */}
            <Breadcrumbs sx={{ mb: 3 }}>
              <Link to="/" style={{ textDecoration: 'none', color: theme.palette.text.secondary }}>
                Home
              </Link>
              <Link to="/products" style={{ textDecoration: 'none', color: theme.palette.text.secondary }}>
                Products
              </Link>
              <Typography color="text.primary">{product.main_title}</Typography>
            </Breadcrumbs>

            {/* Back Button */}
            <Button
              component={Link}
              to="/products"
              startIcon={<IconArrowLeft size={16} />}
              sx={{ 
                mb: 4, 
                color: theme.palette.text.secondary,
                px: 2,
                py: 1,
                fontSize: '0.875rem',
                textTransform: 'none',
                borderRadius: 2
              }}
            >
              Back to Products
            </Button>

            {/* Product Details */}
            <Box sx={{ 
              display: 'flex', 
              gap: 4, 
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexDirection: { xs: 'column', lg: 'row' }
            }}>
              {/* Left Container: Product Photo + Info */}
              <Box sx={{ 
                flex: 1,
                maxWidth: { xs: '100%', lg: 'calc(100% - 320px)' }
              }}>
                <Grid container spacing={6}>
              {/* Product Images Gallery */}
              <Grid item xs={12} md={6}>
                    <Box sx={{ 
                      position: 'sticky', 
                      top: 20,
                      width: { xs: 400, md: 600 },
                      maxWidth: '100%',
                      mx: 'auto'
                    }}>
                  {/* Main Image */}
                  <Card sx={{ 
                    borderRadius: 3, 
                    overflow: 'hidden', 
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    mb: 2,
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        width: '100%',
                        aspectRatio: '1/1'
                  }}>
                    <Box
                      sx={{
                            width: '100%',
                            height: '100%',
                        position: 'relative',
                        cursor: 'zoom-in',
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.02)'
                        }
                      }}
                    >
                          {(() => {
                            const images = [
                              product.cover_photo_url,
                              ...(product.product_images || []).map(img => img.url || img)
                            ].filter(Boolean);
                            
                            const currentImage = images[selectedImage];
                            return currentImage ? (
                              <img
                                src={currentImage}
                                alt={product.main_title}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'contain',
                                  objectPosition: 'center'
                                }}
                              />
                            ) : (
                              <Box
                                sx={{
                                  width: '100%',
                                  height: '100%',
                                  background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                <IconPalette size={48} color="white" />
                              </Box>
                            );
                          })()}
                          
                      {/* Stock Badge */}
                      <Box sx={{ position: 'absolute', top: 16, left: 16 }}>
                        {product.in_stock ? (
                          <Chip
                            label="In Stock"
                            sx={{
                              bgcolor: theme.palette.success.main,
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              height: 24
                            }}
                          />
                        ) : (
                          <Chip
                            label="Out of Stock"
                            sx={{
                              bgcolor: theme.palette.error.main,
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              height: 24
                            }}
                          />
                        )}
                      </Box>

                      {/* Action Buttons */}
                      <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 1 }}>
                        <IconButton
                          onClick={() => setImageZoomed(true)}
                          sx={{
                            bgcolor: 'rgba(255,255,255,0.95)',
                            backdropFilter: 'blur(10px)',
                            '&:hover': { bgcolor: 'rgba(255,255,255,1)' },
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                          }}
                        >
                          <IconZoomIn size={18} />
                        </IconButton>
                        <IconButton
                          onClick={handleShare}
                          sx={{
                            bgcolor: 'rgba(255,255,255,0.95)',
                            backdropFilter: 'blur(10px)',
                            '&:hover': { bgcolor: 'rgba(255,255,255,1)' },
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                          }}
                        >
                          <IconShare size={18} />
                        </IconButton>
                      </Box>
                    </Box>
                  </Card>

                  {/* Image Thumbnails */}
                  {(() => {
                    const images = [
                      product.cover_photo_url,
                      ...(product.product_images || []).map(img => img.url || img)
                    ].filter(Boolean);
                    
                    return images.length > 1 && (
                      <Box sx={{ 
                        display: 'flex', 
                        gap: 1, 
                        overflowX: 'auto', 
                        pb: 1,
                        '&::-webkit-scrollbar': {
                          height: 4
                        },
                        '&::-webkit-scrollbar-track': {
                          backgroundColor: alpha(theme.palette.divider, 0.2)
                        },
                        '&::-webkit-scrollbar-thumb': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.4),
                          borderRadius: 2
                        }
                      }}>
                        {images.map((image, index) => (
                          <Card
                            key={index}
                            onClick={() => setSelectedImage(index)}
                            sx={{
                                  width: 80,
                                  height: 80,
                                  minWidth: 80,
                              cursor: 'pointer',
                              border: selectedImage === index 
                                ? `3px solid ${theme.palette.primary.main}` 
                                : `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                              borderRadius: 2,
                              overflow: 'hidden',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                border: `3px solid ${theme.palette.primary.light}`,
                                transform: 'translateY(-2px)'
                              }
                            }}
                          >
                                <img
                                  src={image}
                                  alt={`Product ${index + 1}`}
                                  style={{
                                width: '100%',
                                height: '100%',
                                    objectFit: 'contain',
                                    objectPosition: 'center'
                              }}
                            />
                          </Card>
                        ))}
                      </Box>
                    );
                  })()}
                </Box>
              </Grid>

              {/* Product Info */}
              <Grid item xs={12} md={6}>
                <Box>
                  {/* Title */}
                  <Typography
                    variant="h4"
                    component="h1"
                    sx={{
                      fontWeight: 700,
                      mb: 1.5,
                      color: theme.palette.text.primary,
                      fontSize: { xs: '1.75rem', md: '2rem' },
                      lineHeight: 1.2,
                      letterSpacing: '-0.02em'
                    }}
                  >
                    {product.main_title}
                  </Typography>

                  {product.sub_title && (
                    <Typography
                      variant="h6"
                      sx={{
                        color: theme.palette.text.secondary,
                        mb: 3,
                        fontWeight: 400,
                        fontSize: '1rem',
                        lineHeight: 1.4
                      }}
                    >
                      {product.sub_title}
                    </Typography>
                  )}

                  {/* Rating and Reviews */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                    <Rating value={parseFloat(product.average_rating) || 0} precision={0.1} readOnly size="small" />
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                      {product.average_rating ? parseFloat(product.average_rating).toFixed(1) : '0.0'} out of 5
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="primary.main" 
                      sx={{ 
                        cursor: 'pointer', 
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        '&:hover': { textDecoration: 'underline' } 
                      }}
                      onClick={() => {
                        const reviewsSection = document.getElementById('product-reviews');
                        if (reviewsSection) {
                          reviewsSection.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                    >
                      ({product.reviews_count || 0} review{(product.reviews_count || 0) !== 1 ? 's' : ''})
                    </Typography>
                  </Box>

                  {/* Price */}
                  {product.price && (
                    <Box sx={{ mb: 4 }}>
                      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 1 }}>
                        {/* Sale Price (if available) */}
                        {product.discount_price && parseFloat(product.discount_price) > 0 ? (
                          <>
                            <Typography
                              variant="h3"
                              sx={{
                                fontWeight: 700,
                                color: theme.palette.error.main,
                                fontSize: { xs: '1.75rem', md: '2rem' },
                                letterSpacing: '-0.02em'
                              }}
                            >
                              ${parseFloat(product.discount_price).toFixed(2)}
                            </Typography>
                            <Typography
                              variant="h6"
                              sx={{
                                textDecoration: 'line-through',
                                color: theme.palette.text.disabled,
                                fontWeight: 400,
                                fontSize: '1.25rem'
                              }}
                            >
                              ${parseFloat(product.price).toFixed(2)}
                            </Typography>
                            <Chip
                              label={`${Math.round(((parseFloat(product.price) - parseFloat(product.discount_price)) / parseFloat(product.price)) * 100)}% OFF`}
                              size="small"
                              sx={{
                                bgcolor: theme.palette.success.main,
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                height: 24
                              }}
                            />
                          </>
                        ) : (
                          /* Regular Price */
                          <Typography
                            variant="h3"
                            sx={{
                              fontWeight: 700,
                              color: theme.palette.primary.main,
                              fontSize: { xs: '1.75rem', md: '2rem' },
                              letterSpacing: '-0.02em'
                            }}
                          >
                            ${parseFloat(product.price).toFixed(2)}
                          </Typography>
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                        Price includes all applicable taxes
                      </Typography>
                    </Box>
                  )}

                  {/* Stock Status */}
                  <Box sx={{ mb: 3 }}>
                    {product.in_stock ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                 <Box sx={{ 
                           width: 8, 
                           height: 8, 
                           borderRadius: '50%', 
                           bgcolor: theme.palette.primary.main 
                         }} />
                         <Typography variant="body1" sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
                           In Stock - Ready to ship
                         </Typography>
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ 
                          width: 8, 
                          height: 8, 
                          borderRadius: '50%', 
                          bgcolor: theme.palette.secondary.main 
                        }} />
                        <Typography variant="body1" sx={{ color: theme.palette.secondary.main, fontWeight: 600 }}>
                          Out of Stock
                        </Typography>
                      </Box>
                    )}
                  </Box>


                  {/* Quantity Selector */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontSize: '1rem' }}>
                      Quantity
                    </Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2,
                      border: `2px solid ${theme.palette.divider}`,
                      borderRadius: 3,
                      p: 1,
                      width: 'fit-content'
                    }}>
                      <IconButton
                        size="small"
                        onClick={decrementQuantity}
                        disabled={quantity <= 1 || !product.in_stock}
                        sx={{
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.2)
                          },
                          '&:disabled': {
                            bgcolor: alpha(theme.palette.grey[400], 0.1)
                          }
                        }}
                      >
                        <IconMinus size={18} />
                      </IconButton>
                      <Typography sx={{ 
                        px: 3, 
                        py: 1, 
                        minWidth: 60, 
                        textAlign: 'center',
                        fontWeight: 600,
                        fontSize: '1.1rem'
                      }}>
                        {quantity}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={incrementQuantity}
                        disabled={quantity >= 10 || !product.in_stock}
                        sx={{
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.2)
                          },
                          '&:disabled': {
                            bgcolor: alpha(theme.palette.grey[400], 0.1)
                          }
                        }}
                      >
                        <IconPlus size={18} />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Custom Dimensions */}
                  {product.is_custom_dimension && (
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1, fontSize: '1rem' }}>
                        <IconRuler size={20} color={theme.palette.primary.main} />
                        Custom Dimensions
                      </Typography>
                      
                      <FormControlLabel
                        control={
                          <Switch
                            checked={useCustomDimensions}
                            onChange={(e) => setUseCustomDimensions(e.target.checked)}
                            color="primary"
                          />
                        }
                        label="I want to specify custom dimensions"
                        sx={{ mb: 2 }}
                      />

                      {useCustomDimensions && (
                        <Paper sx={{ p: 3, borderRadius: 3, border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                              <TextField
                                fullWidth
                                label="Width (cm)"
                                type="number"
                                value={customDimensions.width}
                                onChange={(e) => handleCustomDimensionChange('width', e.target.value)}
                                inputProps={{ min: 1, max: 1000 }}
                                required
                              />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <TextField
                                fullWidth
                                label="Height (cm)"
                                type="number"
                                value={customDimensions.height}
                                onChange={(e) => handleCustomDimensionChange('height', e.target.value)}
                                inputProps={{ min: 1, max: 1000 }}
                                required
                              />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <TextField
                                fullWidth
                                label="Depth (cm)"
                                type="number"
                                value={customDimensions.depth}
                                onChange={(e) => handleCustomDimensionChange('depth', e.target.value)}
                                inputProps={{ min: 0, max: 1000 }}
                                helperText="Optional"
                              />
                            </Grid>
                          </Grid>
                          
                          {!isCustomDimensionsValid() && (
                            <Alert severity="warning" sx={{ mt: 2 }}>
                              Please specify at least width and height for custom dimensions.
                            </Alert>
                          )}
                        </Paper>
                      )}
                    </Box>
                  )}

                  {/* Action Buttons */}
                  <Stack spacing={2} sx={{ mb: 4 }}>
                    <AddToCartButton
                      product={product}
                      productType="product"
                      initialQuantity={quantity}
                      disabled={!product.in_stock || (useCustomDimensions && !isCustomDimensionsValid())}
                      fullWidth
                      customOptions={{
                        ...(useCustomDimensions && product.is_custom_dimension ? {
                          custom_dimensions: customDimensions
                        } : {})
                      }}
                      sx={{
                        py: 1.5,
                        fontSize: '1rem',
                        fontWeight: 600,
                        borderRadius: 2,
                        textTransform: 'none'
                      }}
                    />
                  </Stack>


                  {/* Artist Info */}
                  {product.artist && (
                    <Paper sx={{ p: 3, borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}`, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: theme.palette.text.secondary, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Artist
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          src={product.artist.avatar_url || product.artist.avatar_thumb_url || product.artist.avatar}
                          sx={{ width: 48, height: 48 }}
                        >
                          <IconUser size={24} />
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography
                            component={Link}
                            to={`/artists/${product.artist.slug}`}
                            variant="h6"
                            sx={{
                              fontWeight: 600,
                              color: theme.palette.primary.main,
                              textDecoration: 'none',
                              fontSize: '1rem',
                              '&:hover': { textDecoration: 'underline' }
                            }}
                          >
                            {product.artist.artist_name}
                          </Typography>
                          {product.artist.specialties && (
                            <Typography variant="body2" color="text.secondary">
                              {product.artist.specialties.split(',')[0]?.trim()}
                            </Typography>
                          )}
                        </Box>
                        <Button
                          component={Link}
                          to={`/artists/${product.artist.slug}`}
                          variant="outlined"
                          size="small"
                          sx={{ 
                            textTransform: 'none',
                            px: 2,
                            py: 0.5,
                            fontSize: '0.875rem',
                            borderRadius: 1.5
                          }}
                        >
                          View Profile
                        </Button>
                      </Box>
                    </Paper>
                  )}
                </Box>
              </Grid>
            </Grid>
              </Box>

              {/* Right Container: Related Products */}
              <Box sx={{ 
                width: 250,
                flexShrink: 0,
                display: { xs: 'none', lg: 'block' }
              }}>
                <Box sx={{ position: 'sticky', top: 20 }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, fontSize: '1.125rem', letterSpacing: '-0.01em' }}>
                    You May Also Like
                  </Typography>
                  
                  {loadingRelated ? (
                    <Stack spacing={2}>
                      {[1, 2, 3].map((item) => (
                        <Card key={item} sx={{ borderRadius: 2 }}>
                          <Skeleton variant="rectangular" height={120} />
                          <Box sx={{ p: 1.5 }}>
                            <Skeleton variant="text" height={16} sx={{ mb: 0.5 }} />
                            <Skeleton variant="text" height={14} width="50%" />
                          </Box>
                        </Card>
                      ))}
                    </Stack>
                  ) : (
                    <Stack spacing={2}>
                      {relatedProducts.map((relatedProduct) => (
                        <Card
                          key={relatedProduct.id}
                          component={Link}
                          to={`/products/${relatedProduct.slug}`}
                          sx={{
                            borderRadius: 2,
                            textDecoration: 'none',
                            transition: 'all 0.2s ease',
                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                            '&:hover': {
                              transform: 'translateY(-1px)',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                              borderColor: alpha(theme.palette.primary.main, 0.3)
                            }
                          }}
                        >
                          <Box sx={{ height: 120, position: 'relative' }}>
                            {relatedProduct.cover_photo_url ? (
                              <img
                                src={relatedProduct.cover_photo_url}
                                alt={relatedProduct.main_title}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  objectPosition: 'center'
                                }}
                              />
                            ) : (
                              <Box
                                sx={{
                                  width: '100%',
                                  height: '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`
                                }}
                              >
                                <IconPalette size={32} color="white" />
                              </Box>
                            )}
                          </Box>
                          <CardContent sx={{ p: 1.5 }}>
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontWeight: 600,
                                fontSize: '0.8rem',
                                lineHeight: 1.2,
                                mb: 0.5,
                                color: theme.palette.text.primary,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}
                            >
                              {relatedProduct.main_title}
                            </Typography>
                            {relatedProduct.price && (
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 600,
                                  color: theme.palette.primary.main,
                                  fontSize: '0.8rem'
                                }}
                              >
                                ${parseFloat(relatedProduct.price).toFixed(2)}
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </Stack>
                  )}
                </Box>
              </Box>
            </Box>

            {/* Related Products - Mobile */}
            <Box sx={{ mt: 6, display: { xs: 'block', lg: 'none' } }}>
              <Typography variant="h5" sx={{ mb: 4, fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.02em' }}>
                You May Also Like
              </Typography>
              
              {loadingRelated ? (
                <Grid container spacing={3}>
                  {[1, 2, 3].map((item) => (
                    <Grid item xs={6} sm={4} key={item}>
                      <Card sx={{ borderRadius: 2 }}>
                        <Skeleton variant="rectangular" height={200} />
                        <Box sx={{ p: 2 }}>
                          <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
                          <Skeleton variant="text" height={16} width="60%" />
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Grid container spacing={3}>
                  {relatedProducts.map((relatedProduct) => (
                    <Grid item xs={6} sm={4} key={relatedProduct.id}>
                      <Card
                        component={Link}
                        to={`/products/${relatedProduct.slug}`}
                        sx={{
                          borderRadius: 2,
                          textDecoration: 'none',
                          transition: 'all 0.2s ease',
                          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            borderColor: theme.palette.primary.main
                          }
                        }}
                      >
                        <Box sx={{ height: 200, position: 'relative' }}>
                          {relatedProduct.cover_photo_url ? (
                            <img
                              src={relatedProduct.cover_photo_url}
                              alt={relatedProduct.main_title}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                objectPosition: 'center'
                              }}
                            />
                          ) : (
                            <Box
                              sx={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`
                              }}
                            >
                              <IconPalette size={48} color="white" />
                            </Box>
                          )}
                        </Box>
                        <CardContent sx={{ p: 2 }}>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 600,
                              fontSize: '0.875rem',
                              lineHeight: 1.3,
                              mb: 0.5,
                              color: theme.palette.text.primary,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}
                          >
                            {relatedProduct.main_title}
                          </Typography>
                          {relatedProduct.price && (
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 600,
                                color: theme.palette.primary.main,
                                fontSize: '0.875rem'
                              }}
                            >
                              ${parseFloat(relatedProduct.price).toFixed(2)}
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>

            {/* Description and Details */}
            <Box sx={{ mt: 8 }}>
              <Divider sx={{ mb: 6 }} />
              
              <Typography variant="h5" sx={{ mb: 4, fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.02em' }}>
                  Product Information
                </Typography>
                
                                 {/* Description */}
                 {product.description && (
                <Paper sx={{ p: 4, borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}`, bgcolor: alpha(theme.palette.primary.main, 0.01) }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1, fontSize: '1.125rem' }}>
                       <IconInfoCircle size={20} color={theme.palette.primary.main} />
                       Product Description
                     </Typography>
                     <Typography
                       variant="body1"
                       sx={{
                      lineHeight: 1.7,
                      fontSize: '0.95rem',
                         color: theme.palette.text.primary,
                         whiteSpace: 'pre-line',
                         display: '-webkit-box',
                         WebkitLineClamp: showFullDescription ? 'none' : 4,
                         WebkitBoxOrient: 'vertical',
                         overflow: showFullDescription ? 'visible' : 'hidden',
                         textOverflow: 'ellipsis'
                       }}
                     >
                       {product.description}
                     </Typography>
                     {product.description.length > 200 && (
                       <Button
                         variant="text"
                         onClick={() => setShowFullDescription(!showFullDescription)}
                         sx={{
                           mt: 2,
                           p: 0,
                           minWidth: 'auto',
                           textTransform: 'none',
                           fontWeight: 600,
                        fontSize: '0.875rem',
                           color: theme.palette.primary.main
                         }}
                       >
                         {showFullDescription ? 'Show Less' : 'Read More'}
                       </Button>
                     )}
                </Paper>
              )}

              {/* Product Details */}
              {product.product_details && (
                <Paper sx={{ p: 4, borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}`, bgcolor: alpha(theme.palette.secondary.main, 0.01), mt: 4 }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1, fontSize: '1.125rem' }}>
                    <IconList size={20} color={theme.palette.secondary.main} />
                    Product Details
                  </Typography>
                  <Box
                    sx={{
                      lineHeight: 1.7,
                      fontSize: '0.95rem',
                      color: theme.palette.text.primary,
                      '& h1, & h2, & h3, & h4, & h5, & h6': {
                        fontWeight: 600,
                        marginTop: theme.spacing(3),
                        marginBottom: theme.spacing(2),
                        color: theme.palette.text.primary,
                      },
                      '& h2': {
                        fontSize: '1.25rem',
                        borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                        paddingBottom: theme.spacing(1),
                      },
                      '& h3': {
                        fontSize: '1.1rem',
                      },
                      '& p': {
                        marginBottom: theme.spacing(2),
                        lineHeight: 1.7,
                      },
                      '& ul, & ol': {
                        marginBottom: theme.spacing(2),
                        paddingLeft: theme.spacing(3),
                      },
                      '& li': {
                        marginBottom: theme.spacing(0.5),
                        lineHeight: 1.6,
                      },
                      '& ul li': {
                        listStyleType: 'disc',
                      },
                      '& ol li': {
                        listStyleType: 'decimal',
                      },
                      '& strong': {
                        fontWeight: 600,
                      },
                      '& em': {
                        fontStyle: 'italic',
                      },
                      '& code': {
                        backgroundColor: alpha(theme.palette.grey[500], 0.1),
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '0.875rem',
                        fontFamily: 'monospace',
                      },
                      '& blockquote': {
                        borderLeft: `4px solid ${theme.palette.primary.main}`,
                        paddingLeft: theme.spacing(2),
                        marginLeft: 0,
                        marginRight: 0,
                        fontStyle: 'italic',
                        color: theme.palette.text.secondary,
                      },
                    }}
                  >
                    <ReactMarkdown>{product.product_details}</ReactMarkdown>
                  </Box>
                </Paper>
              )}
            </Box>

            {/* Product Reviews Section */}
            <Box id="product-reviews">
              <ProductReviews product={product} />
            </Box>
          </Box>
        </Fade>
      </Container>

      {/* Image Zoom Modal */}
      <Modal
        open={imageZoomed}
        onClose={() => setImageZoomed(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 300,
          sx: { bgcolor: 'rgba(0, 0, 0, 0.9)' }
        }}
      >
        <Fade in={imageZoomed}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90vw',
              height: '90vh',
              outline: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {(() => {
              const images = [
                product?.cover_photo_url,
                ...(product?.product_images || []).map(img => img.url || img)
              ].filter(Boolean);
              
              const currentImage = images[selectedImage];
              return currentImage && (
                <img
                  src={currentImage}
                  alt={product.main_title}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    objectPosition: 'center',
                    borderRadius: 8
                  }}
                />
              );
            })()}
            
            {/* Close Button */}
            <IconButton
              onClick={() => setImageZoomed(false)}
              sx={{
                position: 'absolute',
                top: 20,
                right: 20,
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 1)' },
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}
            >
              <IconX size={24} />
            </IconButton>
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default ProductDetail;
