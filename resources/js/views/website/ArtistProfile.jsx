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
    <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa' }}>
      {/* Modern Hero Section */}
      <Box sx={{ bgcolor: 'white', position: 'relative' }}>
        <Container maxWidth="xl">
          {/* Back Button */}
          <Box sx={{ pt: 3, pb: 2 }}>
            <Button
              component={Link}
              to="/artists"
              startIcon={<IconArrowLeft size={16} />}
              sx={{ 
                color: theme.palette.text.secondary,
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) }
              }}
            >
              Back to Artists
            </Button>
          </Box>

          {/* Unified Profile Section */}
          <Box sx={{ py: 6 }}>
            <Paper 
              sx={{ 
                p: 6, 
                borderRadius: 4, 
                bgcolor: 'white',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
              }}
            >
              <Grid container spacing={6} alignItems="flex-start">
                {/* Left Side - Avatar & Stats */}
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    {/* Large Avatar with Gradient Ring */}
                    <Box sx={{ mb: 4 }}>
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: '50%',
                          background: `conic-gradient(from 0deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, ${theme.palette.success.main}, ${theme.palette.primary.main})`,
                          display: 'inline-block',
                          mb: 3
                        }}
                      >
                        <Avatar
                          src={artist.avatar_url || artist.avatar_thumb_url}
                          sx={{
                            width: 180,
                            height: 180,
                            border: `6px solid white`,
                            fontSize: '3.5rem',
                            fontWeight: 'bold',
                            bgcolor: theme.palette.primary.main,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                          }}
                        >
                          {artist.artist_name?.charAt(0)?.toUpperCase()}
                        </Avatar>
                      </Box>

                      {/* Artist Name */}
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 800,
                          mb: 2,
                          color: theme.palette.text.primary,
                          fontSize: { xs: '1.8rem', md: '2.2rem' }
                        }}
                      >
                        {artist.artist_name}
                      </Typography>

                      {/* Specialties */}
                      {artist.specialties && (
                        <Box sx={{ mb: 4 }}>
                          <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" gap={1}>
                            {artist.specialties.split(',').map((specialty, index) => (
                              <Chip
                                key={index}
                                label={specialty.trim()}
                                sx={{
                                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                                  color: theme.palette.primary.main,
                                  fontWeight: 600,
                                  border: 'none',
                                  '&:hover': {
                                    bgcolor: alpha(theme.palette.primary.main, 0.2)
                                  }
                                }}
                              />
                            ))}
                          </Stack>
                        </Box>
                      )}
                    </Box>

                    {/* Stats Grid */}
                    <Grid container spacing={2} sx={{ mb: 4 }}>
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                          <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.primary.main, mb: 0.5 }}>
                            {totalProducts}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            Artworks
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.05) }}>
                          <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.success.main, mb: 0.5 }}>
                            {forSaleProducts.length}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            For Sale
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.secondary.main, 0.05) }}>
                          <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.secondary.main, mb: 0.5 }}>
                            4.8
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            Rating
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    {/* Quick Actions */}
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <IconButton
                        onClick={handleShare}
                        sx={{
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main,
                          '&:hover': { 
                            bgcolor: alpha(theme.palette.primary.main, 0.2),
                            transform: 'scale(1.1)'
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <IconShare size={20} />
                      </IconButton>
                      
                      {artist.contact_email && (
                        <IconButton
                          href={`mailto:${artist.contact_email}`}
                          sx={{
                            bgcolor: alpha(theme.palette.success.main, 0.1),
                            color: theme.palette.success.main,
                            '&:hover': { 
                              bgcolor: alpha(theme.palette.success.main, 0.2),
                              transform: 'scale(1.1)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <IconMail size={20} />
                        </IconButton>
                      )}
                      
                      {artist.social_links && Object.entries(artist.social_links).slice(0, 2).map(([platform, url]) => {
                        const IconComponent = getSocialIcon(platform);
                        return url ? (
                          <IconButton
                            key={platform}
                            href={url}
                            target="_blank"
                            sx={{
                              bgcolor: alpha(theme.palette.secondary.main, 0.1),
                              color: theme.palette.secondary.main,
                              '&:hover': {
                                bgcolor: alpha(theme.palette.secondary.main, 0.2),
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <IconComponent size={20} />
                          </IconButton>
                        ) : null;
                      })}
                    </Stack>
                  </Box>
                </Grid>

                {/* Right Side - Bio & Contact */}
                <Grid item xs={12} md={8}>
                  <Box>
                    {/* About Section */}
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: theme.palette.primary.main }}>
                        About {artist.artist_name}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          lineHeight: 1.8,
                          color: theme.palette.text.primary,
                          fontSize: '1.1rem',
                          mb: 4
                        }}
                      >
                        {artist.bio || 'This talented artist creates unique and inspiring works that captivate audiences with their distinctive style and creative vision.'}
                      </Typography>
                    </Box>

                    {/* Contact & Social */}
                    <Grid container spacing={4}>
                      {/* Contact Info */}
                      <Grid item xs={12} md={6}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: theme.palette.text.primary }}>
                          Get in Touch
                        </Typography>
                        <Stack spacing={2}>
                          {artist.contact_email && (
                            <Button
                              startIcon={<IconMail size={18} />}
                              href={`mailto:${artist.contact_email}`}
                              variant="outlined"
                              fullWidth
                              sx={{ 
                                justifyContent: 'flex-start',
                                textTransform: 'none',
                                borderRadius: 3,
                                py: 1.5
                              }}
                            >
                              {artist.contact_email}
                            </Button>
                          )}
                          {artist.phone && (
                            <Button
                              startIcon={<IconPhone size={18} />}
                              href={`tel:${artist.phone}`}
                              variant="outlined"
                              fullWidth
                              sx={{ 
                                justifyContent: 'flex-start',
                                textTransform: 'none',
                                borderRadius: 3,
                                py: 1.5
                              }}
                            >
                              {artist.phone}
                            </Button>
                          )}
                          {artist.link && (
                            <Button
                              startIcon={<IconWorld size={18} />}
                              href={artist.link}
                              target="_blank"
                              variant="outlined"
                              fullWidth
                              sx={{ 
                                justifyContent: 'flex-start',
                                textTransform: 'none',
                                borderRadius: 3,
                                py: 1.5
                              }}
                            >
                              Visit Website
                            </Button>
                          )}
                        </Stack>
                      </Grid>

                      {/* Social Links */}
                      <Grid item xs={12} md={6}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: theme.palette.text.primary }}>
                          Follow on Social
                        </Typography>
                        <Stack direction="row" spacing={2} flexWrap="wrap" gap={1}>
                          {artist.social_links && Object.entries(artist.social_links).map(([platform, url]) => {
                            const IconComponent = getSocialIcon(platform);
                            return url ? (
                              <Button
                                key={platform}
                                href={url}
                                target="_blank"
                                variant="outlined"
                                startIcon={<IconComponent size={18} />}
                                sx={{
                                  textTransform: 'capitalize',
                                  borderRadius: 3,
                                  '&:hover': {
                                    transform: 'translateY(-2px)'
                                  },
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                {platform}
                              </Button>
                            ) : null;
                          })}
                        </Stack>
                      </Grid>
                    </Grid>

                    {/* Commission Info */}
                    {artist.commission_rate && (
                      <Box sx={{ mt: 4 }}>
                        <Paper sx={{ 
                          p: 4,
                          borderRadius: 3,
                          background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.05)}, ${alpha(theme.palette.success.light, 0.1)})`,
                          border: `2px solid ${alpha(theme.palette.success.main, 0.2)}`
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Box sx={{
                              p: 1.5,
                              borderRadius: '50%',
                              bgcolor: alpha(theme.palette.success.main, 0.1)
                            }}>
                              <IconPalette size={24} color={theme.palette.success.main} />
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                              Custom Commissions Available
                            </Typography>
                          </Box>
                          <Typography variant="body1" sx={{ mb: 2, color: theme.palette.text.primary }}>
                            Starting at <strong>${artist.commission_rate}</strong>
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Contact the artist for custom artwork commissions and personalized pieces.
                          </Typography>
                          <Button
                            variant="contained"
                            size="large"
                            href={`mailto:${artist.contact_email}?subject=Commission Inquiry`}
                            sx={{
                              bgcolor: theme.palette.success.main,
                              textTransform: 'none',
                              borderRadius: 3,
                              px: 4,
                              py: 1.5,
                              fontWeight: 600
                            }}
                          >
                            Request Commission
                          </Button>
                        </Paper>
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
