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
  Badge
} from '@mui/material';
import {
  IconArrowLeft,
  IconPalette,
  IconShare,
  IconUser,
  IconZoomIn,
  IconX,
  IconInfoCircle
} from '@tabler/icons-react';
import { Modal, Backdrop } from '@mui/material';
import { publicProductsAPI } from '../../services/api';
import AddToCartButton from '../../components/cart/AddToCartButton';

const ProductDetail = () => {
  const theme = useTheme();
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [imageZoomed, setImageZoomed] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
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

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Skeleton variant="text" width={200} height={40} sx={{ mb: 2 }} />
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" height={500} sx={{ borderRadius: 3, mb: 3 }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="text" height={60} sx={{ mb: 2 }} />
            <Skeleton variant="text" height={30} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={200} sx={{ mb: 3 }} />
            <Skeleton variant="rectangular" height={100} />
          </Grid>
        </Grid>
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
              sx={{ mb: 4, color: theme.palette.text.secondary }}
            >
              Back to Products
            </Button>

            {/* Product Details */}
            <Grid container spacing={4}>
              {/* Product Images Gallery */}
              <Grid item xs={12} md={6}>
                <Box sx={{ position: 'sticky', top: 20 }}>
                  {/* Main Image */}
                  <Card sx={{ 
                    borderRadius: 3, 
                    overflow: 'hidden', 
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    mb: 2,
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                  }}>
                    <Box
                      sx={{
                        height: { xs: 400, md: 500 },
                        background: (() => {
                          const images = [
                            product.cover_photo_url,
                            ...(product.product_images || []).map(img => img.url || img)
                          ].filter(Boolean);
                          
                          const currentImage = images[selectedImage];
                          return currentImage
                            ? `url(${currentImage})`
                            : `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`;
                        })(),
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'relative',
                        cursor: 'zoom-in',
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.02)'
                        }
                      }}
                    >
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
                              width: 90,
                              height: 90,
                              minWidth: 90,
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
                            <Box
                              sx={{
                                width: '100%',
                                height: '100%',
                                background: `url(${image})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
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
                      mb: 1,
                      color: theme.palette.text.primary,
                      fontSize: { xs: '1.75rem', md: '2.125rem' },
                      lineHeight: 1.3
                    }}
                  >
                    {product.main_title}
                  </Typography>

                  {product.sub_title && (
                    <Typography
                      variant="h6"
                      sx={{
                        color: theme.palette.text.secondary,
                        mb: 2,
                        fontWeight: 400,
                        fontSize: '1.1rem'
                      }}
                    >
                      {product.sub_title}
                    </Typography>
                  )}

                  {/* Rating and Reviews */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Rating value={4.5} precision={0.5} readOnly size="small" />
                    <Typography variant="body2" color="text.secondary">
                      4.5 out of 5
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="primary.main" 
                      sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                    >
                      (24 reviews)
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
                                fontSize: { xs: '2rem', md: '2.5rem' }
                              }}
                            >
                              ${parseFloat(product.discount_price).toFixed(2)}
                            </Typography>
                            <Typography
                              variant="h5"
                              sx={{
                                textDecoration: 'line-through',
                                color: theme.palette.text.disabled,
                                fontWeight: 400
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
                                fontWeight: 600
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
                              fontSize: { xs: '2rem', md: '2.5rem' }
                            }}
                          >
                            ${parseFloat(product.price).toFixed(2)}
                          </Typography>
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary">
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


                  {/* Add to Cart Button */}
                  <Box sx={{ mb: 4 }}>
                    <AddToCartButton
                      product={product}
                      productType="product"
                      disabled={!product.in_stock}
                      fullWidth
                    />
                  </Box>

                  {/* Buy Now Button */}
                  <Box sx={{ mb: 4 }}>
                    <Button
                      variant="contained"
                      size="large"
                      fullWidth
                      disabled={!product.in_stock}
                      sx={{
                        py: 2,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        borderRadius: 3,
                        textTransform: 'none',
                        background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                        color: 'white',
                        boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.3)}`,
                        '&:hover': {
                          background: `linear-gradient(135deg, ${theme.palette.success.dark} 0%, ${theme.palette.success.main} 100%)`,
                          boxShadow: `0 6px 16px ${alpha(theme.palette.success.main, 0.4)}`,
                          transform: 'translateY(-1px)'
                        },
                        '&:disabled': {
                          background: theme.palette.grey[300],
                          color: theme.palette.grey[500],
                          boxShadow: 'none',
                          transform: 'none'
                        }
                      }}
                    >
                      Buy Now
                    </Button>
                  </Box>


                  {/* Artist Info */}
                  {product.artist && (
                    <Paper sx={{ p: 3, borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.2)}` }}>
                      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: theme.palette.text.secondary }}>
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
                          sx={{ textTransform: 'none' }}
                        >
                          View Profile
                        </Button>
                      </Box>
                    </Paper>
                  )}
                </Box>
              </Grid>
            </Grid>

            {/* Description and Details */}
            <Box sx={{ mt: 6 }}>
              <Divider sx={{ mb: 4 }} />
              
              {/* Tabs for Description and Specifications */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
                  Product Information
                </Typography>
                
                                 {/* Description */}
                 {product.description && (
                   <Paper sx={{ p: 4, borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                     <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                       <IconInfoCircle size={20} color={theme.palette.primary.main} />
                       Product Description
                     </Typography>
                     <Typography
                       variant="body1"
                       sx={{
                         lineHeight: 1.8,
                         fontSize: '1rem',
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
                           color: theme.palette.primary.main
                         }}
                       >
                         {showFullDescription ? 'Show Less' : 'Read More'}
                       </Button>
                     )}
                   </Paper>
                 )}
              </Box>
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
                <Box
                  sx={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    background: `url(${currentImage})`,
                    backgroundSize: 'contain',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    width: '100%',
                    height: '100%',
                    borderRadius: 2
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
