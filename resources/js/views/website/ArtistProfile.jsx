import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Grid,
  Avatar,
  Button,
  Chip,
  Skeleton,
  useTheme,
  alpha,
  IconButton,
  Stack,
  Paper,
  Divider,
  Tabs,
  Tab,
  Dialog,
  DialogContent,
  Fade
} from '@mui/material';
import {
  IconArrowLeft,
  IconShare,
  IconMail,
  IconPhone,
  IconWorld,
  IconBrandInstagram,
  IconBrandFacebook,
  IconBrandTwitter,
  IconBrandLinkedin,
  IconBrandYoutube,
  IconBrandTiktok,
  IconPalette,
  IconEye,
  IconShoppingCart,
  IconX,
  IconChevronLeft,
  IconChevronRight
} from '@tabler/icons-react';
import { publicArtistsAPI, publicProductsAPI } from '../../services/api';

const ArtistProfile = () => {
  const theme = useTheme();
  const { slug } = useParams();
  const navigate = useNavigate();
  const [artist, setArtist] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxImages, setLightboxImages] = useState([]);

  useEffect(() => {
    if (slug) {
      loadArtist();
      loadProducts();
    }
  }, [slug]);

  const loadArtist = async () => {
    try {
      setLoading(true);
      const response = await publicArtistsAPI.getBySlug(slug);
      
      if (response.data && response.data.artist) {
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

  const loadProducts = async () => {
    try {
      setProductsLoading(true);
      const response = await publicArtistsAPI.getBySlug(slug);
      if (response.data && response.data.artist && response.data.artist.id) {
        const productsResponse = await publicProductsAPI.getAll({ artist_id: response.data.artist.id });
        
        if (productsResponse.data) {
          const productsData = productsResponse.data.data || productsResponse.data;
          setProducts(Array.isArray(productsData) ? productsData : []);
        }
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: artist?.artist_name,
        text: artist?.bio,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleViewImage = (product, allProductImages) => {
    // Set images for lightbox
    setLightboxImages(allProductImages);
    // Find index of clicked image
    const index = allProductImages.findIndex(img => img.id === product.id);
    setCurrentImageIndex(index >= 0 ? index : 0);
    setLightboxOpen(true);
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % lightboxImages.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + lightboxImages.length) % lightboxImages.length);
  };

  const handleCloseLightbox = () => {
    setLightboxOpen(false);
    setCurrentImageIndex(0);
    setLightboxImages([]);
  };

  const getSocialIcon = (platform) => {
    const icons = {
      instagram: IconBrandInstagram,
      facebook: IconBrandFacebook,
      twitter: IconBrandTwitter,
      linkedin: IconBrandLinkedin,
      youtube: IconBrandYoutube,
      tiktok: IconBrandTiktok,
    };
    return icons[platform.toLowerCase()] || IconWorld;
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '300px',
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.08)} 100%)`,
            zIndex: 0
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: 4 }}>
          {/* Back Button Skeleton */}
          <Box sx={{ pt: 4, pb: 2 }}>
            <Skeleton variant="rectangular" width={150} height={40} sx={{ borderRadius: 3 }} />
          </Box>

          {/* Profile Header Skeleton */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: 4,
              background: 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
              mb: 4
            }}
          >
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'center', md: 'flex-start' } }}>
                  <Skeleton variant="circular" width={120} height={120} sx={{ mb: 3 }} />
                </Box>
              </Grid>
              <Grid item xs={12} md={8}>
                <Box sx={{ pl: { xs: 0, md: 2 } }}>
                  <Skeleton variant="text" width="60%" height={50} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="40%" height={30} sx={{ mb: 2 }} />
                  <Skeleton variant="text" width="50%" height={20} sx={{ mb: 3 }} />
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Container>
      </Box>
    );
  }

  if (!artist) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <IconPalette size={64} color={theme.palette.text.secondary} />
        <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
          Artist Not Found
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          The artist you're looking for doesn't exist or has been removed.
        </Typography>
        <Button
          component={Link}
          to="/artists"
          variant="contained"
          startIcon={<IconArrowLeft size={16} />}
        >
          Back to Artists
        </Button>
      </Container>
    );
  }

  const forSaleProducts = products.filter(product => product.in_stock);
  const displayProducts = activeTab === 'all' ? products : forSaleProducts;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '300px',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.08)} 100%)`,
          zIndex: 0
        }
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Back Button */}
        <Box sx={{ pt: 4, pb: 2 }}>
          <Button
            component={Link}
            to="/artists"
            startIcon={<IconArrowLeft size={20} />}
            sx={{
              color: theme.palette.text.secondary,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1.5,
              borderRadius: 3,
              bgcolor: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                transform: 'translateX(-4px)',
                boxShadow: '0 6px 25px rgba(0,0,0,0.12)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Back to Artists
          </Button>
        </Box>

        {/* Profile Header */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            background: 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
            position: 'relative',
            overflow: 'hidden',
            mb: 4,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, ${theme.palette.success.main})`,
              borderRadius: '4px 4px 0 0'
            }
          }}
        >
          <Grid container spacing={4} alignItems="center">
            {/* Avatar Section */}
            <Grid item xs={12} md={4}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: { xs: 'center', md: 'flex-start' },
                textAlign: { xs: 'center', md: 'left' }
              }}>
                <Box sx={{ position: 'relative', mb: 3 }}>
                  {/* Animated Ring */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -8,
                      left: -8,
                      right: -8,
                      bottom: -8,
                      borderRadius: '50%',
                      background: `conic-gradient(from 0deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, ${theme.palette.success.main}, ${theme.palette.primary.main})`,
                      animation: 'rotate 8s linear infinite',
                      '@keyframes rotate': {
                        '0%': { transform: 'rotate(0deg)' },
                        '100%': { transform: 'rotate(360deg)' }
                      },
                      opacity: 0.8
                    }}
                  />
                  
                  {/* Avatar */}
                  <Avatar
                    src={artist.avatar_url || artist.avatar_thumb_url}
                    sx={{
                      width: 120,
                      height: 120,
                      border: `6px solid ${theme.palette.background.paper}`,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                      fontSize: '2.5rem',
                      fontWeight: 'bold',
                      bgcolor: theme.palette.primary.main,
                      position: 'relative',
                      zIndex: 1,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: '0 12px 40px rgba(0,0,0,0.2)'
                      }
                    }}
                  >
                    {artist.artist_name?.charAt(0)?.toUpperCase()}
                  </Avatar>
                </Box>
              </Box>
            </Grid>
            
            {/* Info Section */}
            <Grid item xs={12} md={8}>
              <Box sx={{ pl: { xs: 0, md: 2 } }}>
                <Box sx={{ mb: 3 }}>
                  <Typography 
                    variant="h3" 
                    sx={{ 
                      fontWeight: 800,
                      mb: 2,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontSize: { xs: '2rem', md: '2.5rem' }
                    }}
                  >
                    {artist.artist_name}
                  </Typography>
                  
                  {/* Bio */}
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.7 }}>
                    {artist.bio || 'This talented artist creates unique and inspiring works that captivate audiences with their distinctive style and creative vision.'}
                  </Typography>

                  {/* Social Media Links */}
                  {((artist.social_links && Object.keys(artist.social_links).length > 0) || artist.link || artist.phone) && (
                    <Box sx={{ mb: 3 }}>
                      <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                        {/* Website Link */}
                        {artist.link && (
                          <IconButton
                            href={artist.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: theme.palette.primary.main,
                              width: 42,
                              height: 42,
                              border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                              '&:hover': {
                                bgcolor: theme.palette.primary.main,
                                color: theme.palette.common.white,
                                transform: 'translateY(-3px)',
                                boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.3)}`
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <IconWorld size={20} />
                          </IconButton>
                        )}

                        {/* Phone */}
                        {artist.phone && (
                          <IconButton
                            href={`tel:${artist.phone}`}
                            sx={{
                              bgcolor: alpha(theme.palette.success.main, 0.1),
                              color: theme.palette.success.main,
                              width: 42,
                              height: 42,
                              border: `2px solid ${alpha(theme.palette.success.main, 0.2)}`,
                              '&:hover': {
                                bgcolor: theme.palette.success.main,
                                color: theme.palette.common.white,
                                transform: 'translateY(-3px)',
                                boxShadow: `0 6px 20px ${alpha(theme.palette.success.main, 0.3)}`
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <IconPhone size={20} />
                          </IconButton>
                        )}

                        {/* Social Media Links */}
                        {artist.social_links && Object.entries(artist.social_links).map(([platform, url]) => {
                          if (!url) return null;
                          const IconComponent = getSocialIcon(platform);
                          const colors = {
                            instagram: { main: '#E4405F', light: alpha('#E4405F', 0.1) },
                            facebook: { main: '#1877F2', light: alpha('#1877F2', 0.1) },
                            twitter: { main: '#1DA1F2', light: alpha('#1DA1F2', 0.1) },
                            linkedin: { main: '#0A66C2', light: alpha('#0A66C2', 0.1) },
                            youtube: { main: '#FF0000', light: alpha('#FF0000', 0.1) },
                            tiktok: { main: '#000000', light: alpha('#000000', 0.1) },
                          };
                          const platformColor = colors[platform.toLowerCase()] || { 
                            main: theme.palette.secondary.main, 
                            light: alpha(theme.palette.secondary.main, 0.1) 
                          };

                          return (
                            <IconButton
                              key={platform}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{
                                bgcolor: platformColor.light,
                                color: platformColor.main,
                                width: 42,
                                height: 42,
                                border: `2px solid ${alpha(platformColor.main, 0.2)}`,
                                '&:hover': {
                                  bgcolor: platformColor.main,
                                  color: theme.palette.common.white,
                                  transform: 'translateY(-3px)',
                                  boxShadow: `0 6px 20px ${alpha(platformColor.main, 0.3)}`
                                },
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <IconComponent size={20} />
                            </IconButton>
                          );
                        })}
                      </Stack>
                    </Box>
                  )}

                  {/* Action Buttons */}
                  <Stack direction="row" spacing={2}>
                    {artist.contact_email && (
                      <Button
                        href={`mailto:${artist.contact_email}`}
                        variant="contained"
                        startIcon={<IconMail size={18} />}
                        sx={{
                          bgcolor: theme.palette.primary.main,
                          borderRadius: 3,
                          px: 3,
                          textTransform: 'none',
                          fontWeight: 600,
                          '&:hover': {
                            bgcolor: theme.palette.primary.dark,
                            transform: 'translateY(-2px)'
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        Contact
                      </Button>
                    )}
                    <Button
                      onClick={handleShare}
                      variant="outlined"
                      startIcon={<IconShare size={18} />}
                      sx={{
                        borderRadius: 3,
                        px: 3,
                        textTransform: 'none',
                        fontWeight: 600,
                        '&:hover': {
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      Share
                    </Button>
                  </Stack>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Portfolio Section */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            background: 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
            position: 'relative',
            overflow: 'hidden',
            mb: 4
          }}
        >
          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={activeTab}
              onChange={(event, newValue) => setActiveTab(newValue)}
              sx={{
                px: { xs: 2, md: 4 },
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  minHeight: 64,
                  '&.Mui-selected': {
                    color: theme.palette.primary.main
                  }
                },
                '& .MuiTabs-indicator': {
                  height: 3,
                  borderRadius: '3px 3px 0 0',
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                }
              }}
            >
              <Tab
                value="all"
                label={`All Works (${products.length})`}
                icon={<IconPalette size={20} />}
                iconPosition="start"
                sx={{
                  '& .MuiTab-iconWrapper': {
                    marginRight: 1,
                    marginBottom: 0
                  }
                }}
              />
              <Tab
                value="for-sale"
                label={`For Sale (${forSaleProducts.length})`}
                icon={<IconShoppingCart size={20} />}
                iconPosition="start"
                sx={{
                  '& .MuiTab-iconWrapper': {
                    marginRight: 1,
                    marginBottom: 0
                  }
                }}
              />
            </Tabs>
          </Box>

          {/* Portfolio Content */}
          <Box sx={{ p: { xs: 3, md: 5 } }}>
            {productsLoading ? (
              <Box 
                sx={{ 
                  display: { xs: 'block', md: 'flex' }, 
                  gap: { md: 2 },
                  '& > *': {
                    mb: { xs: 2, md: 0 }
                  }
                }}
              >
                {[...Array(4)].map((_, index) => (
                  <Box key={index} sx={{ flex: { md: '1 1 25%' } }}>
                    <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
                  </Box>
                ))}
              </Box>
            ) : displayProducts.length === 0 ? (
              <Box sx={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 8, 
                px: 4, 
                textAlign: 'center'
              }}>
                <IconPalette size={64} color={theme.palette.text.disabled} />
                <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
                  No Artworks {activeTab === 'for-sale' ? 'For Sale' : 'Available'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {activeTab === 'for-sale' 
                    ? 'This artist currently has no artworks available for purchase.'
                    : 'This artist hasn\'t uploaded any artworks yet.'}
                </Typography>
              </Box>
            ) : (
              <Box 
                sx={{ 
                  display: { xs: 'block', md: 'flex' }, 
                  gap: { md: 2 },
                  flexWrap: 'wrap',
                  '& > *': {
                    mb: { xs: 2, md: 2 }
                  }
                }}
              >
                {displayProducts.map((product, index) => (
                  <Box key={product.id} sx={{ flex: { md: '0 0 calc(25% - 12px)' } }}>
                    <Box
                      sx={{
                        position: 'relative',
                        paddingTop: '100%', // 1:1 aspect ratio
                        borderRadius: 2,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        '&:hover .product-overlay': {
                          opacity: 1
                        },
                        '&:hover .product-image': {
                          transform: 'scale(1.05)'
                        }
                      }}
                    >
                      {/* Image */}
                      <Box
                        className="product-image"
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          background: product.cover_photo_url
                            ? `url(${product.cover_photo_url})`
                            : `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          transition: 'transform 0.3s ease'
                        }}
                      />

                      {/* Hover Overlay */}
                      <Box
                        className="product-overlay"
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'rgba(0,0,0,0.6)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 2,
                          opacity: 0,
                          transition: 'opacity 0.3s ease'
                        }}
                      >
                        {/* View Icon - Always shown */}
                        <IconButton
                          onClick={() => handleViewImage(product, displayProducts)}
                          sx={{
                            bgcolor: theme.palette.common.white,
                            color: theme.palette.primary.main,
                            width: 50,
                            height: 50,
                            '&:hover': {
                              bgcolor: theme.palette.primary.main,
                              color: theme.palette.common.white,
                              transform: 'scale(1.1)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <IconEye size={24} />
                        </IconButton>

                        {/* Buy Icon - Only for in_stock products or in for-sale tab */}
                        {(activeTab === 'for-sale' || product.in_stock) && (
                          <IconButton
                            component={Link}
                            to={`/products/${product.slug}`}
                            sx={{
                              bgcolor: theme.palette.common.white,
                              color: theme.palette.success.main,
                              width: 50,
                              height: 50,
                              '&:hover': {
                                bgcolor: theme.palette.success.main,
                                color: theme.palette.common.white,
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <IconShoppingCart size={24} />
                          </IconButton>
                        )}
                      </Box>

                      {/* Status Badge */}
                      {!product.in_stock && activeTab === 'all' && (
                        <Chip
                          label="Not Available"
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 12,
                            left: 12,
                            bgcolor: alpha(theme.palette.error.main, 0.9),
                            color: theme.palette.common.white,
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            zIndex: 1
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Paper>
      </Container>

      {/* Lightbox Dialog */}
      <Dialog
        open={lightboxOpen}
        onClose={handleCloseLightbox}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'transparent',
            boxShadow: 'none',
            overflow: 'hidden'
          }
        }}
        sx={{
          '& .MuiBackdrop-root': {
            bgcolor: 'rgba(0,0,0,0.95)'
          }
        }}
      >
        <DialogContent sx={{ p: 0, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Close Button */}
          <IconButton
            onClick={handleCloseLightbox}
            sx={{
              position: 'absolute',
              top: 20,
              right: 20,
              bgcolor: alpha(theme.palette.common.white, 0.1),
              color: theme.palette.common.white,
              backdropFilter: 'blur(10px)',
              zIndex: 2,
              '&:hover': {
                bgcolor: alpha(theme.palette.common.white, 0.2),
                transform: 'scale(1.1)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            <IconX size={24} />
          </IconButton>

          {/* Previous Button */}
          {lightboxImages.length > 1 && (
            <IconButton
              onClick={handlePrevImage}
              sx={{
                position: 'absolute',
                left: 20,
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: alpha(theme.palette.common.white, 0.1),
                color: theme.palette.common.white,
                backdropFilter: 'blur(10px)',
                zIndex: 2,
                '&:hover': {
                  bgcolor: alpha(theme.palette.common.white, 0.2),
                  transform: 'translateY(-50%) scale(1.1)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              <IconChevronLeft size={32} />
            </IconButton>
          )}

          {/* Next Button */}
          {lightboxImages.length > 1 && (
            <IconButton
              onClick={handleNextImage}
              sx={{
                position: 'absolute',
                right: 20,
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: alpha(theme.palette.common.white, 0.1),
                color: theme.palette.common.white,
                backdropFilter: 'blur(10px)',
                zIndex: 2,
                '&:hover': {
                  bgcolor: alpha(theme.palette.common.white, 0.2),
                  transform: 'translateY(-50%) scale(1.1)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              <IconChevronRight size={32} />
            </IconButton>
          )}

          {/* Image */}
          {lightboxImages[currentImageIndex] && (
            <Fade in timeout={300}>
              <Box
                sx={{
                  maxWidth: '90%',
                  maxHeight: '90vh',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Box
                  component="img"
                  src={lightboxImages[currentImageIndex].cover_photo_url}
                  alt={lightboxImages[currentImageIndex].main_title}
                  sx={{
                    maxWidth: '100%',
                    maxHeight: '80vh',
                    objectFit: 'contain',
                    borderRadius: 2,
                    boxShadow: '0 24px 48px rgba(0,0,0,0.5)'
                  }}
                />
                
                {/* Image Info */}
                <Box sx={{ mt: 3, textAlign: 'center', color: theme.palette.common.white }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                    {lightboxImages[currentImageIndex].main_title}
                  </Typography>
                  {lightboxImages[currentImageIndex].sub_title && (
                    <Typography variant="body1" sx={{ opacity: 0.8 }}>
                      {lightboxImages[currentImageIndex].sub_title}
                    </Typography>
                  )}
                  {lightboxImages.length > 1 && (
                    <Typography variant="caption" sx={{ opacity: 0.6, mt: 1, display: 'block' }}>
                      {currentImageIndex + 1} / {lightboxImages.length}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Fade>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ArtistProfile;
