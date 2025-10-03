import React, { useState, useEffect } from 'react';
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
  useTheme,
  alpha,
  IconButton,
  Stack,
  Paper,
  Divider,
  Badge,
  Tooltip
} from '@mui/material';
import {
  IconArrowLeft,
  IconHeart,
  IconShare,
  IconMail,
  IconPhone,
  IconWorld,
  IconBrandInstagram,
  IconBrandFacebook,
  IconBrandTwitter,
  IconMapPin,
  IconCalendar,
  IconPalette,
  IconStar,
  IconUsers,
  IconEye,
  IconShoppingCart
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

  const getSocialIcon = (platform) => {
    const icons = {
      instagram: IconBrandInstagram,
      facebook: IconBrandFacebook,
      twitter: IconBrandTwitter,
    };
    return icons[platform.toLowerCase()] || IconWorld;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 3, mb: 4 }} />
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Skeleton variant="circular" width={200} height={200} sx={{ mx: 'auto', mb: 2 }} />
            <Skeleton variant="text" height={40} sx={{ mb: 1 }} />
            <Skeleton variant="text" height={20} sx={{ mb: 2 }} />
          </Grid>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
          </Grid>
        </Grid>
      </Container>
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
  const totalProducts = products.length;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      {/* Enhanced Hero Section */}
      <Box 
        sx={{ 
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.03)} 0%, ${alpha(theme.palette.secondary.main, 0.03)} 100%)`,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Decorative Elements */}
        <Box
          sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
            opacity: 0.6
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -30,
            left: -30,
            width: 150,
            height: 150,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 70%)`,
            opacity: 0.6
          }}
        />

        <Container maxWidth="lg">
          {/* Back Button */}
          <Box sx={{ pt: 4, pb: 3 }}>
            <Button
              component={Link}
              to="/artists"
              startIcon={<IconArrowLeft size={18} />}
              sx={{ 
                color: theme.palette.text.secondary,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                borderRadius: 3,
                px: 3,
                py: 1,
                '&:hover': { 
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  transform: 'translateX(-4px)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              Back to Artists
            </Button>
          </Box>

          {/* Main Profile Card */}
          <Box sx={{ pb: 8 }}>
            <Paper 
              sx={{ 
                p: { xs: 4, md: 6 }, 
                borderRadius: 6, 
                bgcolor: 'white',
                boxShadow: '0 24px 48px rgba(0,0,0,0.12)',
                border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Decorative Background Elements */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '40%',
                  height: '100%',
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
                  borderRadius: '0 6px 6px 0'
                }}
              />

              <Grid container spacing={8} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
                {/* Left Side - Avatar & Identity */}
                <Grid item xs={12} md={5}>
                  <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                    {/* Enhanced Avatar */}
                    <Box sx={{ mb: 4, display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' } }}>
                      <Box
                        sx={{
                          position: 'relative',
                          display: 'inline-block'
                        }}
                      >
                        {/* Gradient Ring */}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: -6,
                            left: -6,
                            right: -6,
                            bottom: -6,
                            borderRadius: '50%',
                            background: `conic-gradient(from 0deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, ${theme.palette.success.main}, ${theme.palette.primary.main})`,
                            animation: 'rotate 8s linear infinite',
                            '@keyframes rotate': {
                              '0%': { transform: 'rotate(0deg)' },
                              '100%': { transform: 'rotate(360deg)' }
                            }
                          }}
                        />
                        <Avatar
                          src={artist.avatar_url || artist.avatar_thumb_url}
                          sx={{
                            width: 160,
                            height: 160,
                            border: `6px solid white`,
                            fontSize: '3rem',
                            fontWeight: 'bold',
                            bgcolor: theme.palette.primary.main,
                            boxShadow: '0 16px 40px rgba(0,0,0,0.15)',
                            position: 'relative',
                            zIndex: 1
                          }}
                        >
                          {artist.artist_name?.charAt(0)?.toUpperCase()}
                        </Avatar>
                        
                        {/* Online Status Indicator */}
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 12,
                            right: 12,
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            bgcolor: theme.palette.success.main,
                            border: `3px solid white`,
                            zIndex: 2
                          }}
                        />
                      </Box>
                    </Box>

                    {/* Artist Name with Verified Badge */}
                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="h3"
                        sx={{
                          fontWeight: 800,
                          mb: 1,
                          color: theme.palette.text.primary,
                          fontSize: { xs: '2rem', md: '2.5rem' },
                          lineHeight: 1.2
                        }}
                      >
                        {artist.artist_name}
                        <Box
                          component="span"
                          sx={{
                            display: 'inline-block',
                            ml: 1,
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            bgcolor: theme.palette.primary.main,
                            color: 'white',
                            fontSize: '0.75rem',
                            lineHeight: '24px',
                            textAlign: 'center',
                            verticalAlign: 'middle'
                          }}
                        >
                          ✓
                        </Box>
                      </Typography>
                      
                      {/* Specialties */}
                      {artist.specialties && (
                        <Stack direction="row" spacing={1} justifyContent={{ xs: 'center', md: 'flex-start' }} flexWrap="wrap" gap={1}>
                          {artist.specialties.split(',').slice(0, 3).map((specialty, index) => (
                            <Chip
                              key={index}
                              label={specialty.trim()}
                              size="small"
                              sx={{
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                color: theme.palette.primary.main,
                                fontWeight: 600,
                                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                '&:hover': {
                                  bgcolor: alpha(theme.palette.primary.main, 0.15),
                                  transform: 'translateY(-2px)'
                                },
                                transition: 'all 0.2s ease'
                              }}
                            />
                          ))}
                        </Stack>
                      )}
                    </Box>

                    {/* Enhanced Stats */}
                    <Grid container spacing={2} sx={{ mb: 4 }}>
                      <Grid item xs={4}>
                        <Paper 
                          elevation={0}
                          sx={{ 
                            textAlign: 'center', 
                            p: 3, 
                            borderRadius: 4, 
                            bgcolor: alpha(theme.palette.primary.main, 0.06),
                            border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                            }
                          }}
                        >
                          <Typography variant="h4" sx={{ fontWeight: 800, color: theme.palette.primary.main, mb: 1 }}>
                            {totalProducts}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                            Artworks
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={4}>
                        <Paper 
                          elevation={0}
                          sx={{ 
                            textAlign: 'center', 
                            p: 3, 
                            borderRadius: 4, 
                            bgcolor: alpha(theme.palette.success.main, 0.06),
                            border: `2px solid ${alpha(theme.palette.success.main, 0.1)}`,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                            }
                          }}
                        >
                          <Typography variant="h4" sx={{ fontWeight: 800, color: theme.palette.success.main, mb: 1 }}>
                            {forSaleProducts.length}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                            For Sale
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={4}>
                        <Paper 
                          elevation={0}
                          sx={{ 
                            textAlign: 'center', 
                            p: 3, 
                            borderRadius: 4, 
                            bgcolor: alpha(theme.palette.secondary.main, 0.06),
                            border: `2px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                            <Typography variant="h4" sx={{ fontWeight: 800, color: theme.palette.secondary.main, mr: 0.5 }}>
                              4.8
                            </Typography>
                            <IconStar size={20} color={theme.palette.secondary.main} fill={theme.palette.secondary.main} />
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                            Rating
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>

                    {/* Enhanced Quick Actions */}
                    <Stack direction="row" spacing={2} justifyContent="center">
                      <Button
                        onClick={handleShare}
                        variant="outlined"
                        startIcon={<IconShare size={18} />}
                        sx={{
                          borderRadius: 3,
                          px: 3,
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
                        Share
                      </Button>
                      
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
                            boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
                            '&:hover': { 
                              bgcolor: theme.palette.primary.dark,
                              transform: 'translateY(-2px)',
                              boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.4)}`
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          Contact
                        </Button>
                      )}
                    </Stack>
                  </Box>
                </Grid>

                {/* Right Side - Enhanced Bio & Contact */}
                <Grid item xs={12} md={7}>
                  <Box sx={{ pl: { xs: 0, md: 4 } }}>
                    {/* Enhanced About Section */}
                    <Box sx={{ mb: 5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                        <Box
                          sx={{
                            width: 4,
                            height: 32,
                            bgcolor: theme.palette.primary.main,
                            borderRadius: 2
                          }}
                        />
                        <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                          About {artist.artist_name}
                        </Typography>
                      </Box>
                      
                      <Typography
                        variant="body1"
                        sx={{
                          lineHeight: 1.8,
                          color: theme.palette.text.primary,
                          fontSize: '1.2rem',
                          mb: 4,
                          position: 'relative',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            left: -20,
                            top: 8,
                            width: 3,
                            height: 3,
                            borderRadius: '50%',
                            bgcolor: theme.palette.primary.main
                          }
                        }}
                      >
                        {artist.bio || 'This talented artist creates unique and inspiring works that captivate audiences with their distinctive style and creative vision.'}
                      </Typography>
                    </Box>

                    {/* Contact Information */}
                    {(artist.contact_email || artist.phone || artist.link) && (
                      <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: theme.palette.text.primary }}>
                          Connect
                        </Typography>
                        <Stack spacing={2}>
                          {artist.contact_email && (
                            <Paper
                              elevation={0}
                              sx={{
                                p: 2,
                                borderRadius: 3,
                                bgcolor: alpha(theme.palette.primary.main, 0.04),
                                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                                  transform: 'translateY(-2px)'
                                }
                              }}
                            >
                              <Button
                                startIcon={<IconMail size={20} />}
                                href={`mailto:${artist.contact_email}`}
                                fullWidth
                                sx={{ 
                                  justifyContent: 'flex-start',
                                  textTransform: 'none',
                                  color: theme.palette.text.primary,
                                  fontWeight: 600,
                                  py: 1
                                }}
                              >
                                {artist.contact_email}
                              </Button>
                            </Paper>
                          )}
                          {artist.phone && (
                            <Paper
                              elevation={0}
                              sx={{
                                p: 2,
                                borderRadius: 3,
                                bgcolor: alpha(theme.palette.success.main, 0.04),
                                border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  bgcolor: alpha(theme.palette.success.main, 0.08),
                                  transform: 'translateY(-2px)'
                                }
                              }}
                            >
                              <Button
                                startIcon={<IconPhone size={20} />}
                                href={`tel:${artist.phone}`}
                                fullWidth
                                sx={{ 
                                  justifyContent: 'flex-start',
                                  textTransform: 'none',
                                  color: theme.palette.text.primary,
                                  fontWeight: 600,
                                  py: 1
                                }}
                              >
                                {artist.phone}
                              </Button>
                            </Paper>
                          )}
                          {artist.link && (
                            <Paper
                              elevation={0}
                              sx={{
                                p: 2,
                                borderRadius: 3,
                                bgcolor: alpha(theme.palette.secondary.main, 0.04),
                                border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  bgcolor: alpha(theme.palette.secondary.main, 0.08),
                                  transform: 'translateY(-2px)'
                                }
                              }}
                            >
                              <Button
                                startIcon={<IconWorld size={20} />}
                                href={artist.link}
                                target="_blank"
                                fullWidth
                                sx={{ 
                                  justifyContent: 'flex-start',
                                  textTransform: 'none',
                                  color: theme.palette.text.primary,
                                  fontWeight: 600,
                                  py: 1
                                }}
                              >
                                Visit Website
                              </Button>
                            </Paper>
                          )}
                        </Stack>
                      </Box>
                    )}

                    {/* Social Media */}
                    {artist.social_links && Object.keys(artist.social_links).length > 0 && (
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: theme.palette.text.primary }}>
                          Social Media
                        </Typography>
                        <Grid container spacing={2}>
                          {Object.entries(artist.social_links).map(([platform, url]) => {
                            const IconComponent = getSocialIcon(platform);
                            return url ? (
                              <Grid item xs={6} sm={4} key={platform}>
                                <Paper
                                  elevation={0}
                                  sx={{
                                    p: 2,
                                    borderRadius: 3,
                                    bgcolor: alpha(theme.palette.secondary.main, 0.04),
                                    border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                      bgcolor: alpha(theme.palette.secondary.main, 0.08),
                                      transform: 'translateY(-2px)'
                                    }
                                  }}
                                >
                                  <Button
                                    href={url}
                                    target="_blank"
                                    fullWidth
                                    startIcon={<IconComponent size={20} />}
                                    sx={{
                                      textTransform: 'capitalize',
                                      color: theme.palette.text.primary,
                                      fontWeight: 600,
                                      justifyContent: 'flex-start'
                                    }}
                                  >
                                    {platform}
                                  </Button>
                                </Paper>
                              </Grid>
                            ) : null;
                          })}
                        </Grid>
                      </Box>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        </Container>
      </Box>

      {/* Portfolio Section - Instagram Grid Style */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 700, 
              mb: 2,
              textAlign: 'center'
            }}
          >
            Portfolio
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ textAlign: 'center', mb: 4 }}
          >
            Discover {artist.artist_name}'s latest artworks and creations
          </Typography>
        </Box>

        {productsLoading ? (
          <Grid container spacing={2}>
            {[...Array(9)].map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Skeleton 
                  variant="rectangular" 
                  height={300} 
                  sx={{ borderRadius: 2 }} 
                />
              </Grid>
            ))}
          </Grid>
        ) : products.length === 0 ? (
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
            <IconPalette size={64} color={theme.palette.text.disabled} />
            <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
              No Artworks Yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This artist hasn't uploaded any artworks yet. Check back soon!
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={2}>
            {products.map((product, index) => (
              <Grid item xs={12} sm={6} md={4} key={product.id}>
                <Fade in timeout={600 + index * 100}>
                  <Card
                    component={Link}
                    to={`/products/${product.slug}`}
                    sx={{
                      height: 350,
                      borderRadius: 3,
                      overflow: 'hidden',
                      textDecoration: 'none',
                      transition: 'all 0.3s ease',
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
                        '& .product-overlay': {
                          opacity: 1
                        }
                      }
                    }}
                  >
                    {/* Product Image */}
                    <Box
                      sx={{
                        height: 250,
                        position: 'relative',
                        background: product.cover_photo_url
                          ? `url(${product.cover_photo_url})`
                          : `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    >
                      {/* Overlay */}
                      <Box
                        className="product-overlay"
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.7) 100%)',
                          opacity: 0,
                          transition: 'opacity 0.3s ease',
                          display: 'flex',
                          alignItems: 'flex-end',
                          p: 2
                        }}
                      >
                        <Box sx={{ color: 'white' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            View Details
                          </Typography>
                        </Box>
                      </Box>

                      {/* Stock Badge */}
                      <Box sx={{ position: 'absolute', top: 12, left: 12 }}>
                        {product.in_stock ? (
                          <Chip
                            label="Available"
                            size="small"
                            sx={{
                              bgcolor: alpha(theme.palette.success.main, 0.9),
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.75rem'
                            }}
                          />
                        ) : (
                          <Chip
                            label="Sold"
                            size="small"
                            sx={{
                              bgcolor: alpha(theme.palette.error.main, 0.9),
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.75rem'
                            }}
                          />
                        )}
                      </Box>

                      {/* Price */}
                      {product.price && (
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 8,
                            right: 8,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-end',
                            gap: 0.5
                          }}
                        >
                          {product.discount_price && parseFloat(product.discount_price) > 0 ? (
                            <>
                              <Box
                                sx={{
                                  bgcolor: alpha(theme.palette.error.main, 0.9),
                                  color: 'white',
                                  px: 1.5,
                                  py: 0.5,
                                  borderRadius: 1,
                                  fontWeight: 600,
                                  fontSize: '0.9rem'
                                }}
                              >
                                ${parseFloat(product.discount_price).toFixed(2)}
                              </Box>
                              <Box
                                sx={{
                                  bgcolor: alpha('#000', 0.6),
                                  color: 'white',
                                  px: 1,
                                  py: 0.25,
                                  borderRadius: 0.5,
                                  fontSize: '0.75rem',
                                  textDecoration: 'line-through',
                                  opacity: 0.8
                                }}
                              >
                                ${parseFloat(product.price).toFixed(2)}
                              </Box>
                            </>
                          ) : (
                            <Box
                              sx={{
                                bgcolor: alpha('#000', 0.7),
                                color: 'white',
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 1,
                                fontWeight: 600
                              }}
                            >
                              ${parseFloat(product.price).toFixed(2)}
                            </Box>
                          )}
                        </Box>
                      )}
                    </Box>

                    {/* Product Info */}
                    <CardContent sx={{ p: 2 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 600,
                          mb: 0.5,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          color: theme.palette.text.primary
                        }}
                      >
                        {product.main_title}
                      </Typography>
                      {product.sub_title && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {product.sub_title}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default ArtistProfile;
