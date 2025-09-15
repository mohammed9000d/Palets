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
  const [isFollowing, setIsFollowing] = useState(false);

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
      {/* Hero Section - Instagram Story Style */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background Pattern */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='${encodeURIComponent(alpha(theme.palette.primary.main, 0.05))}' fill-opacity='1'%3E%3Cpath d='M20 20c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm-20 16c-8.837 0-16-7.163-16-16s7.163-16 16-16 16 7.163 16 16-7.163 16-16 16z'/%3E%3C/g%3E%3C/svg%3E")`,
            opacity: 0.3
          }}
        />
        
        <Container maxWidth="lg">
          <Box sx={{ py: 6, position: 'relative', zIndex: 1 }}>
            {/* Back Button */}
            <Button
              component={Link}
              to="/artists"
              startIcon={<IconArrowLeft size={16} />}
              sx={{ 
                mb: 4, 
                color: theme.palette.text.secondary,
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) }
              }}
            >
              Back to Artists
            </Button>

            <Grid container spacing={4} alignItems="center">
              {/* Artist Avatar & Basic Info */}
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center' }}>
                  {/* Instagram-style Story Ring */}
                  <Box
                    sx={{
                      p: 0.5,
                      borderRadius: '50%',
                      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, ${theme.palette.success.main})`,
                      display: 'inline-block',
                      mb: 3
                    }}
                  >
                    <Avatar
                      src={artist.avatar_url || artist.avatar_thumb_url}
                      sx={{
                        width: 160,
                        height: 160,
                        border: `4px solid white`,
                        fontSize: '3rem',
                        fontWeight: 'bold',
                        bgcolor: theme.palette.primary.main
                      }}
                    >
                      {artist.artist_name?.charAt(0)?.toUpperCase()}
                    </Avatar>
                  </Box>

                  {/* Artist Name */}
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      mb: 1,
                      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}
                  >
                    {artist.artist_name}
                  </Typography>

                  {/* Stats Row - Instagram Style */}
                  <Stack direction="row" spacing={4} justifyContent="center" sx={{ mb: 3 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                        {totalProducts}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        artworks
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                        {forSaleProducts.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        for sale
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.secondary.main }}>
                        4.8
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        rating
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Action Buttons */}
                  <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 3 }}>
                    <Button
                      variant={isFollowing ? "outlined" : "contained"}
                      size="large"
                      onClick={() => setIsFollowing(!isFollowing)}
                      sx={{
                        borderRadius: 3,
                        px: 4,
                        textTransform: 'none',
                        fontWeight: 600,
                        ...(isFollowing ? {
                          borderColor: theme.palette.primary.main,
                          color: theme.palette.primary.main
                        } : {
                          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                          color: 'white'
                        })
                      }}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </Button>
                    
                    <IconButton
                      onClick={handleShare}
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                      }}
                    >
                      <IconShare size={20} />
                    </IconButton>
                  </Stack>
                </Box>
              </Grid>

              {/* Artist Bio & Details */}
              <Grid item xs={12} md={8}>
                <Paper 
                  sx={{ 
                    p: 4, 
                    borderRadius: 3, 
                    bgcolor: 'white',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                  }}
                >
                  {/* Specialties */}
                  {artist.specialties && (
                    <Box sx={{ mb: 3 }}>
                      <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                        {artist.specialties.split(',').map((specialty, index) => (
                          <Chip
                            key={index}
                            label={specialty.trim()}
                            variant="outlined"
                            size="small"
                            sx={{
                              borderColor: theme.palette.primary.main,
                              color: theme.palette.primary.main,
                              '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.1)
                              }
                            }}
                          />
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {/* Bio */}
                  <Typography
                    variant="body1"
                    sx={{
                      lineHeight: 1.8,
                      color: theme.palette.text.primary,
                      mb: 3,
                      fontSize: '1.1rem'
                    }}
                  >
                    {artist.bio || 'This talented artist creates unique and inspiring works that captivate audiences with their distinctive style and creative vision.'}
                  </Typography>

                  {/* Contact & Social */}
                  <Grid container spacing={3}>
                    {/* Contact Info */}
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: theme.palette.text.secondary }}>
                        Get in Touch
                      </Typography>
                      <Stack spacing={1}>
                        {artist.contact_email && (
                          <Button
                            startIcon={<IconMail size={18} />}
                            href={`mailto:${artist.contact_email}`}
                            variant="outlined"
                            size="small"
                            sx={{ 
                              justifyContent: 'flex-start',
                              textTransform: 'none',
                              borderRadius: 2
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
                            size="small"
                            sx={{ 
                              justifyContent: 'flex-start',
                              textTransform: 'none',
                              borderRadius: 2
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
                            size="small"
                            sx={{ 
                              justifyContent: 'flex-start',
                              textTransform: 'none',
                              borderRadius: 2
                            }}
                          >
                            Visit Website
                          </Button>
                        )}
                      </Stack>
                    </Grid>

                    {/* Social Links */}
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: theme.palette.text.secondary }}>
                        Follow on Social
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        {artist.social_links && Object.entries(artist.social_links).map(([platform, url]) => {
                          const IconComponent = getSocialIcon(platform);
                          return url ? (
                            <Tooltip key={platform} title={`Follow on ${platform}`}>
                              <IconButton
                                href={url}
                                target="_blank"
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
                                <IconComponent size={20} />
                              </IconButton>
                            </Tooltip>
                          ) : null;
                        })}
                      </Stack>
                    </Grid>
                  </Grid>

                  {/* Commission Info */}
                  {artist.commission_rate && (
                    <Box sx={{ 
                      mt: 3,
                      p: 3,
                      bgcolor: alpha(theme.palette.success.main, 0.05),
                      border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                      borderRadius: 2
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <IconPalette size={20} color={theme.palette.success.main} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                          Commission Available
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Custom artwork starting at <strong>${artist.commission_rate}</strong>
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>
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

  function getSocialIcon(platform) {
    const icons = {
      instagram: IconBrandInstagram,
      facebook: IconBrandFacebook,
      twitter: IconBrandTwitter,
    };
    return icons[platform.toLowerCase()] || IconWorld;
  }
};

export default ArtistProfile;
