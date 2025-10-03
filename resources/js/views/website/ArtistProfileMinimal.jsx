import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Avatar,
  Button,
  Skeleton,
  useTheme,
  alpha,
  IconButton,
  Stack,
  Paper,
  Divider,
  Grid,
  Card,
  CardMedia,
  Dialog,
  DialogContent,
  DialogActions,
  Fade,
  Backdrop
} from '@mui/material';
import {
  IconArrowLeft,
  IconMail,
  IconPhone,
  IconWorld,
  IconBrandInstagram,
  IconBrandFacebook,
  IconBrandTwitter,
  IconBrandLinkedin,
  IconShare,
  IconEye,
  IconShoppingCart,
  IconX,
  IconChevronLeft,
  IconChevronRight
} from '@tabler/icons-react';
import { publicArtistsAPI, publicProductsAPI } from '../../services/api';

const ArtistProfileMinimal = () => {
  const theme = useTheme();
  const { slug } = useParams();
  const navigate = useNavigate();
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const PRODUCTS_PER_PAGE = 9;

  useEffect(() => {
    if (slug) {
      loadArtist();
    }
  }, [slug]);

  useEffect(() => {
    if (artist?.id) {
      loadProducts(1, true); // Load first page, reset products
    }
  }, [artist?.id]);

  const loadArtist = async () => {
    try {
      setLoading(true);
      const response = await publicArtistsAPI.getBySlug(slug);
      
      if (response.data && response.data.artist) {
        console.log('Artist loaded:', response.data.artist);
        setArtist(response.data.artist);
      } else {
        navigate('/artists', { replace: true });
      }
    } catch (error) {
      console.error('Error loading artist:', error);
      navigate('/artists', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async (page = 1, reset = false) => {
    if (!artist?.id) {
      console.log('No artist ID available, skipping products load');
      return;
    }
    
    try {
      setProductsLoading(true);
      console.log('Loading products for artist ID:', artist.id, 'page:', page);
      
      const response = await publicProductsAPI.getAll({ 
        artist_id: artist.id,
        page: page,
        per_page: PRODUCTS_PER_PAGE
      });
      
      console.log('Products API response:', response);
      
      if (response.data) {
        // Handle Laravel pagination response
        const productsData = response.data.data || response.data;
        const newProducts = Array.isArray(productsData) ? productsData : [];
        
        console.log('Products loaded:', newProducts.length, newProducts);
        
        if (reset) {
          setProducts(newProducts);
          setCurrentPage(1);
        } else {
          setProducts(prev => [...prev, ...newProducts]);
          setCurrentPage(page);
        }
        
        // Check if there are more products (Laravel pagination)
        const totalProducts = response.data.total || response.data.last_page * PRODUCTS_PER_PAGE || newProducts.length;
        const currentTotal = reset ? newProducts.length : products.length + newProducts.length;
        const hasNext = response.data.next_page_url || (response.data.current_page < response.data.last_page);
        setHasMoreProducts(hasNext && newProducts.length === PRODUCTS_PER_PAGE);
        
        console.log('Pagination info:', {
          total: totalProducts,
          currentTotal,
          hasNext,
          currentPage: response.data.current_page,
          lastPage: response.data.last_page
        });
      }
    } catch (error) {
      console.error('Error loading products:', error);
      console.error('Error details:', error.response?.data);
      if (reset) {
        setProducts([]);
      }
    } finally {
      setProductsLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!productsLoading && hasMoreProducts) {
      loadProducts(currentPage + 1, false);
    }
  };

  const handleViewProduct = (product) => {
    console.log('Viewing product:', product);
    console.log('Product images:', product.product_images);
    setSelectedProduct(product);
    setCurrentImageIndex(0);
    setGalleryOpen(true);
  };

  const handleCloseGallery = () => {
    setGalleryOpen(false);
    setSelectedProduct(null);
    setCurrentImageIndex(0);
  };

  const handleNextImage = () => {
    if (selectedProduct?.product_images && currentImageIndex < selectedProduct.product_images.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    }
  };

  const handlePrevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    }
  };

  const handleOrderProduct = (product) => {
    navigate(`/products/${product.slug}`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: artist?.artist_name,
        text: `Check out ${artist?.artist_name}'s profile`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const getSocialIcon = (platform) => {
    const icons = {
      instagram: IconBrandInstagram,
      facebook: IconBrandFacebook,
      twitter: IconBrandTwitter,
      linkedin: IconBrandLinkedin,
    };
    return icons[platform.toLowerCase()] || IconWorld;
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa' }}>
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 8, 
              borderRadius: 4,
              bgcolor: 'white',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Skeleton variant="circular" width={160} height={160} sx={{ mx: 'auto', mb: 3 }} />
              <Skeleton variant="text" height={48} width={300} sx={{ mx: 'auto', mb: 2 }} />
              <Skeleton variant="text" height={24} width={200} sx={{ mx: 'auto' }} />
            </Box>
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
          </Paper>
        </Container>
      </Box>
    );
  }

  if (!artist) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
            Artist Not Found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            The artist profile you're looking for doesn't exist or has been removed.
          </Typography>
          <Button
            component={Link}
            to="/artists"
            variant="contained"
            startIcon={<IconArrowLeft size={18} />}
            sx={{ borderRadius: 3 }}
          >
            Back to Artists
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa' }}>
      {/* Back Button */}
      <Container maxWidth="md" sx={{ pt: 4 }}>
        <Button
          component={Link}
          to="/artists"
          startIcon={<IconArrowLeft size={18} />}
          sx={{ 
            color: theme.palette.text.secondary,
            '&:hover': { 
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              color: theme.palette.primary.main
            },
            borderRadius: 2,
            px: 2
          }}
        >
          Back to Artists
        </Button>
      </Container>

      {/* Main Profile Card */}
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper 
          elevation={0}
          sx={{ 
            p: { xs: 4, md: 8 }, 
            borderRadius: 4,
            bgcolor: 'white',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)'
          }}
        >
          {/* Artist Photo & Name */}
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Avatar
              src={artist.avatar_url || artist.avatar_thumb_url}
              sx={{
                width: 160,
                height: 160,
                mx: 'auto',
                mb: 3,
                fontSize: '3rem',
                fontWeight: 'bold',
                bgcolor: theme.palette.primary.main,
                border: `4px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
              }}
            >
              {artist.artist_name?.charAt(0)?.toUpperCase()}
            </Avatar>

            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                mb: 2,
                color: theme.palette.text.primary,
                fontSize: { xs: '2rem', md: '2.5rem' }
              }}
            >
              {artist.artist_name}
            </Typography>

            {/* Specialties */}
            {artist.specialties && (
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{
                  fontWeight: 400,
                  mb: 4,
                  fontSize: '1.1rem'
                }}
              >
                {artist.specialties.split(',').slice(0, 3).map(s => s.trim()).join(' • ')}
              </Typography>
            )}

            {/* Share Button */}
            <IconButton
              onClick={handleShare}
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                '&:hover': { 
                  bgcolor: alpha(theme.palette.primary.main, 0.2),
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              <IconShare size={20} />
            </IconButton>
          </Box>

          {/* About Section */}
          <Box sx={{ mb: 6 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                mb: 3,
                color: theme.palette.text.primary,
                textAlign: 'center'
              }}
            >
              About
            </Typography>
            <Typography
              variant="body1"
              sx={{
                lineHeight: 1.8,
                color: theme.palette.text.primary,
                fontSize: '1.1rem',
                textAlign: 'center',
                maxWidth: '600px',
                mx: 'auto'
              }}
            >
              {artist.bio || 'This talented artist creates unique and inspiring works that captivate audiences with their distinctive style and creative vision.'}
            </Typography>
          </Box>

          {/* Contact & Social Links */}
          {(artist.contact_email || artist.phone || artist.link || (artist.social_links && Object.keys(artist.social_links).length > 0)) && (
            <>
              <Divider sx={{ my: 6 }} />
              
              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    mb: 4,
                    color: theme.palette.text.primary
                  }}
                >
                  Get in Touch
                </Typography>

                <Stack 
                  direction={{ xs: 'column', sm: 'row' }} 
                  spacing={2} 
                  justifyContent="center"
                  alignItems="center"
                  sx={{ mb: 4 }}
                >
                  {/* Email */}
                  {artist.contact_email && (
                    <Button
                      href={`mailto:${artist.contact_email}`}
                      startIcon={<IconMail size={20} />}
                      variant="outlined"
                      sx={{
                        borderRadius: 3,
                        px: 3,
                        py: 1.5,
                        textTransform: 'none',
                        fontWeight: 500,
                        borderColor: alpha(theme.palette.primary.main, 0.3),
                        color: theme.palette.primary.main,
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.05),
                          borderColor: theme.palette.primary.main,
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      Email
                    </Button>
                  )}

                  {/* Phone */}
                  {artist.phone && (
                    <Button
                      href={`tel:${artist.phone}`}
                      startIcon={<IconPhone size={20} />}
                      variant="outlined"
                      sx={{
                        borderRadius: 3,
                        px: 3,
                        py: 1.5,
                        textTransform: 'none',
                        fontWeight: 500,
                        borderColor: alpha(theme.palette.success.main, 0.3),
                        color: theme.palette.success.main,
                        '&:hover': {
                          bgcolor: alpha(theme.palette.success.main, 0.05),
                          borderColor: theme.palette.success.main,
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      Call
                    </Button>
                  )}

                  {/* Website */}
                  {artist.link && (
                    <Button
                      href={artist.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      startIcon={<IconWorld size={20} />}
                      variant="outlined"
                      sx={{
                        borderRadius: 3,
                        px: 3,
                        py: 1.5,
                        textTransform: 'none',
                        fontWeight: 500,
                        borderColor: alpha(theme.palette.secondary.main, 0.3),
                        color: theme.palette.secondary.main,
                        '&:hover': {
                          bgcolor: alpha(theme.palette.secondary.main, 0.05),
                          borderColor: theme.palette.secondary.main,
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      Website
                    </Button>
                  )}
                </Stack>

                {/* Social Media Links */}
                {artist.social_links && Object.keys(artist.social_links).length > 0 && (
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 3, fontWeight: 500 }}
                    >
                      Follow on Social Media
                    </Typography>
                    <Stack 
                      direction="row" 
                      spacing={2} 
                      justifyContent="center"
                    >
                      {Object.entries(artist.social_links).map(([platform, url]) => {
                        const IconComponent = getSocialIcon(platform);
                        return url ? (
                          <IconButton
                            key={platform}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: theme.palette.primary.main,
                              width: 48,
                              height: 48,
                              '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.2),
                                transform: 'translateY(-3px)',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <IconComponent size={24} />
                          </IconButton>
                        ) : null;
                      })}
                    </Stack>
                  </Box>
                )}
              </Box>
            </>
          )}
        </Paper>
      </Container>

      {/* Artist Works Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            mb: 2,
            textAlign: 'center',
            color: theme.palette.text.primary
          }}
        >
          Artist Works
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ textAlign: 'center', mb: 6, maxWidth: '600px', mx: 'auto' }}
        >
          Explore {artist?.artist_name}'s collection of unique artworks and creative pieces
        </Typography>



        {/* Loading State */}
        {productsLoading && products.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Loading works...</Typography>
            <Grid container spacing={3}>
              {[...Array(6)].map((_, index) => (
                <Grid item xs={12} sm={6} md={3} key={`skeleton-${index}`}>
                      <Skeleton 
                        variant="rectangular" 
                        sx={{ 
                          width: '100%',
                          height: 0,
                          paddingBottom: '100%', // Same technique for consistent squares
                          borderRadius: 3,
                          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                        }} 
                      />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* No Products Message */}
        {products.length === 0 && !productsLoading && (
          <Paper sx={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            py: 8, 
            px: 4, 
            textAlign: 'center',
            borderRadius: 3,
            bgcolor: 'white'
          }}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
              No Works Available
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This artist hasn't uploaded any works yet. Check back soon!
            </Typography>
          </Paper>
        )}

        {/* Products Grid - Show when we have products */}
        {products.length > 0 && (
          <>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 3,
                width: '100%'
              }}
            >
              {products.map((product, index) => (
                <Fade in timeout={300 + index * 50} key={product.id}>
                  <Box
                    sx={{
                      width: '100%',
                      aspectRatio: '1/1',
                      border: '1px solid #ddd',
                      borderRadius: 1,
                      overflow: 'hidden',
                      position: 'relative',
                      cursor: 'pointer',
                      '&:hover .hover-overlay': {
                        opacity: 1
                      }
                    }}
                  >
                      <img
                        src={product.cover_photo_thumb_url || product.cover_photo_url}
                        alt={product.main_title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain'
                        }}
                      />

                        {/* Hover Overlay */}
                        <Box
                          className="hover-overlay"
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)',
                            opacity: 0,
                            transition: 'opacity 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 2
                          }}
                        >
                        {/* View Button */}
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewProduct(product);
                          }}
                          sx={{
                            bgcolor: alpha(theme.palette.primary.main, 0.9),
                            color: 'white',
                            width: 56,
                            height: 56,
                            '&:hover': {
                              bgcolor: theme.palette.primary.main,
                              transform: 'scale(1.1)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <IconEye size={24} />
                        </IconButton>

                        {/* Order Button */}
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOrderProduct(product);
                          }}
                          sx={{
                            bgcolor: alpha(theme.palette.success.main, 0.9),
                            color: 'white',
                            width: 56,
                            height: 56,
                            '&:hover': {
                              bgcolor: theme.palette.success.main,
                              transform: 'scale(1.1)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <IconShoppingCart size={24} />
                        </IconButton>
                        </Box>
                  </Box>
                </Fade>
              ))}
            </Box>

            {/* Loading Skeletons for pagination */}
            {productsLoading && (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 3,
                  width: '100%'
                }}
              >
                {[...Array(PRODUCTS_PER_PAGE)].map((_, index) => (
                  <Skeleton 
                    key={`skeleton-${index}`}
                    variant="rectangular" 
                    sx={{ 
                      aspectRatio: '1/1',
                      borderRadius: 1,
                      width: '100%',
                      border: '1px solid #ddd'
                    }} 
                  />
                ))}
              </Box>
            )}

            {/* Show More Button */}
            {hasMoreProducts && (
              <Box sx={{ textAlign: 'center', mt: 6 }}>
                <Button
                  onClick={handleLoadMore}
                  disabled={productsLoading}
                  variant="outlined"
                  size="large"
                  sx={{
                    borderRadius: 3,
                    px: 6,
                    py: 1.5,
                    textTransform: 'none',
                    fontWeight: 600,
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                    color: theme.palette.primary.main,
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                      borderColor: theme.palette.primary.main,
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  {productsLoading ? 'Loading...' : 'Show More Works'}
                </Button>
              </Box>
            )}
          </>
        )}
      </Container>

      {/* Full-Screen Gallery Viewer */}
      <Dialog
        open={galleryOpen}
        onClose={handleCloseGallery}
        maxWidth={false}
        fullScreen
        PaperProps={{
          sx: {
            bgcolor: 'rgba(0,0,0,0.95)',
            backdropFilter: 'blur(10px)'
          }
        }}
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 300 }}
      >
        <DialogContent sx={{ p: 0, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Close Button */}
          <IconButton
            onClick={handleCloseGallery}
            sx={{
              position: 'absolute',
              top: 20,
              right: 20,
              bgcolor: alpha('#000', 0.5),
              color: 'white',
              zIndex: 1000,
              '&:hover': {
                bgcolor: alpha('#000', 0.7)
              }
            }}
          >
            <IconX size={24} />
          </IconButton>

          {/* Image Navigation */}
          {selectedProduct?.product_images && selectedProduct.product_images.length > 1 && (
            <>
              {/* Previous Button */}
              <IconButton
                onClick={handlePrevImage}
                disabled={currentImageIndex === 0}
                sx={{
                  position: 'absolute',
                  left: 20,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: alpha('#000', 0.5),
                  color: 'white',
                  zIndex: 1000,
                  '&:hover': {
                    bgcolor: alpha('#000', 0.7)
                  },
                  '&:disabled': {
                    opacity: 0.3
                  }
                }}
              >
                <IconChevronLeft size={32} />
              </IconButton>

              {/* Next Button */}
              <IconButton
                onClick={handleNextImage}
                disabled={currentImageIndex === selectedProduct.product_images.length - 1}
                sx={{
                  position: 'absolute',
                  right: 20,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: alpha('#000', 0.5),
                  color: 'white',
                  zIndex: 1000,
                  '&:hover': {
                    bgcolor: alpha('#000', 0.7)
                  },
                  '&:disabled': {
                    opacity: 0.3
                  }
                }}
              >
                <IconChevronRight size={32} />
              </IconButton>
            </>
          )}

          {/* Main Image */}
          <Box
            component="img"
            src={
              selectedProduct?.product_images && selectedProduct.product_images.length > 0
                ? selectedProduct.product_images[currentImageIndex]?.url || selectedProduct.product_images[currentImageIndex]?.large || selectedProduct.product_images[currentImageIndex]?.preview
                : selectedProduct?.cover_photo_url            }
            alt={selectedProduct?.main_title}
            onError={(e) => {
              if (!e.target.dataset.fallback) {
                e.target.dataset.fallback = 'true';
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjZjVmNWY1Ii8+CjxwYXRoIGQ9Ik0xNTAgMTAwQzE2MS4wNDYgMTAwIDE3MCA5MS4wNDU3IDE3MCA4MEM1NyA2OC45NTQzIDE2MS4wNDYgNjAgMTUwIDYwQzEzOC45NTQgNjAgMTMwIDY4Ljk1NDMgMTMwIDgwQzEzMCA5MS4wNDU3IDEzOC45NTQgMTAwIDE1MCAxMDBaIiBmaWxsPSIjY2NjY2NjIi8+CjxwYXRoIGQ9Ik0yMjAgMjAwSDE4MFYxODBDMTgwIDE2MS4yMjkgMTY4Ljc3MSAxNTAgMTUwIDE1MEMxMzEuMjI5IDE1MCAxMjAgMTYxLjIyOSAxMjAgMTgwVjIwMEg4MEMzNS44MTcyIDIwMCA4MCAyMzUuODE3IDgwIDI4MEgyMjBDMjIwIDIzNS44MTcgMjIwIDIwMCAyMjAgMjAwWiIgZmlsbD0iI2NjY2NjYyIvPgo8L3N2Zz4K';
              }
            }}
            sx={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              objectFit: 'contain',
              borderRadius: 2
            }}
          />

          {/* Image Counter */}
          {selectedProduct?.product_images && selectedProduct.product_images.length > 1 && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 30,
                left: '50%',
                transform: 'translateX(-50%)',
                bgcolor: alpha('#000', 0.7),
                color: 'white',
                px: 3,
                py: 1,
                borderRadius: 3,
                fontSize: '0.9rem',
                fontWeight: 500
              }}
            >
              {currentImageIndex + 1} / {selectedProduct.product_images.length}
            </Box>
          )}
        </DialogContent>

        {/* Gallery Actions */}
        <DialogActions sx={{ position: 'absolute', bottom: 20, right: 20, gap: 2 }}>
          <Button
            onClick={() => handleOrderProduct(selectedProduct)}
            variant="contained"
            startIcon={<IconShoppingCart size={18} />}
            sx={{
              bgcolor: theme.palette.success.main,
              borderRadius: 3,
              px: 3,
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                bgcolor: theme.palette.success.dark
              }
            }}
          >
            Order This Work
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ArtistProfileMinimal;
