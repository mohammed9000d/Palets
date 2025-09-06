import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
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
  Tab,
  Tabs,
  Paper
} from '@mui/material';
import {
  IconArrowLeft,
  IconPalette,
  IconMail,
  IconPhone,
  IconWorld,
  IconBrandInstagram,
  IconBrandFacebook,
  IconBrandTwitter,
  IconBrandLinkedin,
  IconHeart,
  IconEye,
  IconShare
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
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (slug) {
      loadArtist();
      loadArtistProducts();
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

  const loadArtistProducts = async () => {
    try {
      setProductsLoading(true);
      // Get artist ID first, then load their products
      const response = await publicArtistsAPI.getBySlug(slug);
      if (response.data && response.data.artist && response.data.artist.id) {
        const productsResponse = await publicProductsAPI.getAll({ artist_id: response.data.artist.id });
        
        if (productsResponse.data) {
          const productsData = productsResponse.data.data || productsResponse.data;
          setProducts(Array.isArray(productsData) ? productsData : []);
        }
      }
    } catch (error) {
      console.error('Error loading artist products:', error);
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    const baseUrl = '';
    return `${baseUrl}/storage/${imagePath}`;
  };

  const getSocialIcon = (platform) => {
    switch (platform.toLowerCase()) {
      case 'instagram': return IconBrandInstagram;
      case 'facebook': return IconBrandFacebook;
      case 'twitter': return IconBrandTwitter;
      case 'linkedin': return IconBrandLinkedin;
      default: return IconWorld;
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

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 3, mb: 4 }} />
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Skeleton variant="circular" width={200} height={200} sx={{ mx: 'auto', mb: 2 }} />
            <Skeleton variant="text" height={40} />
            <Skeleton variant="text" height={30} />
          </Grid>
          <Grid item xs={12} md={8}>
            <Skeleton variant="text" height={60} />
            <Skeleton variant="rectangular" height={150} />
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
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          The artist you're looking for doesn't exist or has been removed.
        </Typography>
        <Button
          component={Link}
          to="/artists"
          variant="contained"
          startIcon={<IconArrowLeft />}
        >
          Back to Artists
        </Button>
      </Container>
    );
  }

  return (
    <Box>
      {/* Header Section */}
      <Box sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05), py: 4 }}>
        <Container maxWidth="lg">
          {/* Breadcrumbs */}
          <Breadcrumbs sx={{ mb: 3 }}>
            <Link
              to="/"
              style={{
                textDecoration: 'none',
                color: theme.palette.text.secondary,
                '&:hover': { color: theme.palette.primary.main }
              }}
            >
              Home
            </Link>
            <Link
              to="/artists"
              style={{
                textDecoration: 'none',
                color: theme.palette.text.secondary,
                '&:hover': { color: theme.palette.primary.main }
              }}
            >
              Artists
            </Link>
            <Typography color="text.primary" sx={{ fontWeight: 600 }}>
              {artist.artist_name}
            </Typography>
          </Breadcrumbs>

          {/* Back Button */}
          <Button
            component={Link}
            to="/artists"
            startIcon={<IconArrowLeft />}
            sx={{
              color: theme.palette.text.secondary,
              textTransform: 'none',
              fontWeight: 600,
              mb: 3,
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main
              }
            }}
          >
            Back to Artists
          </Button>
        </Container>
      </Box>

      {/* Artist Profile Content */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Fade in timeout={800}>
          <Box>
            {/* Artist Header */}
            <Grid container spacing={4} sx={{ mb: 6 }}>
              {/* Artist Avatar & Basic Info */}
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar
                    src={artist.avatar_url || artist.avatar_thumb_url}
                    sx={{ 
                      width: 200, 
                      height: 200, 
                      mx: 'auto', 
                      mb: 3,
                      border: `4px solid ${theme.palette.primary.main}`,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
                    }}
                  >
                    <IconPalette size={60} />
                  </Avatar>

                  <Typography
                    variant="h3"
                    component="h1"
                    sx={{
                      fontWeight: 800,
                      mb: 2,
                      color: theme.palette.text.primary,
                      fontSize: { xs: '2rem', md: '2.5rem' }
                    }}
                  >
                    {artist.artist_name}
                  </Typography>

                  {artist.specialties && (
                    <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 3, flexWrap: 'wrap' }}>
                      {artist.specialties.split(',').slice(0, 3).map((specialty, index) => (
                        <Chip
                          key={index}
                          label={specialty.trim()}
                          size="small"
                          sx={{
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                            fontWeight: 600
                          }}
                        />
                      ))}
                    </Stack>
                  )}

                  {/* Contact & Social */}
                  <Stack spacing={2} sx={{ mb: 3 }}>
                    {artist.contact_email && (
                      <Button
                        startIcon={<IconMail size={18} />}
                        href={`mailto:${artist.contact_email}`}
                        sx={{ 
                          justifyContent: 'flex-start',
                          color: theme.palette.text.secondary,
                          textTransform: 'none'
                        }}
                      >
                        {artist.contact_email}
                      </Button>
                    )}

                    {artist.phone && (
                      <Button
                        startIcon={<IconPhone size={18} />}
                        href={`tel:${artist.phone}`}
                        sx={{ 
                          justifyContent: 'flex-start',
                          color: theme.palette.text.secondary,
                          textTransform: 'none'
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
                        sx={{ 
                          justifyContent: 'flex-start',
                          color: theme.palette.text.secondary,
                          textTransform: 'none'
                        }}
                      >
                        Visit Website
                      </Button>
                    )}
                  </Stack>

                  {/* Social Links */}
                  {artist.social_links && Object.keys(artist.social_links).length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                        Follow on Social
                      </Typography>
                      <Stack direction="row" spacing={1} justifyContent="center">
                        {Object.entries(artist.social_links).map(([platform, url]) => {
                          const IconComponent = getSocialIcon(platform);
                          return url ? (
                            <IconButton
                              key={platform}
                              href={url}
                              target="_blank"
                              sx={{
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                color: theme.palette.primary.main,
                                '&:hover': {
                                  bgcolor: theme.palette.primary.main,
                                  color: 'white'
                                }
                              }}
                            >
                              <IconComponent size={20} />
                            </IconButton>
                          ) : null;
                        })}
                      </Stack>
                    </Box>
                  )}
                </Box>
              </Grid>

              {/* Artist Bio & Details */}
              <Grid item xs={12} md={8}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    About the Artist
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<IconShare size={16} />}
                    onClick={handleShare}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600
                    }}
                  >
                    Share Profile
                  </Button>
                </Box>

                <Typography
                  variant="body1"
                  sx={{
                    lineHeight: 1.8,
                    fontSize: '1.1rem',
                    color: theme.palette.text.primary,
                    mb: 4,
                    whiteSpace: 'pre-line'
                  }}
                >
                  {artist.bio || 'This talented artist creates unique and inspiring works that captivate audiences with their distinctive style and creative vision.'}
                </Typography>



                {artist.commission_rate && (
                  <Box sx={{ 
                    p: 4, 
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    borderRadius: 3,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    textAlign: 'center'
                  }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: theme.palette.primary.main }}>
                      Commission Work Available
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2, color: theme.palette.text.primary }}>
                      Starting at <strong>${artist.commission_rate}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Contact the artist for custom artwork commissions and personalized pieces.
                    </Typography>
                  </Box>
                )}
              </Grid>
            </Grid>

            <Divider sx={{ mb: 4 }} />

            {/* Tabs for Products */}
            <Box sx={{ mb: 4 }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                sx={{
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '1rem'
                  }
                }}
              >
                <Tab label={`All Works (${products.length})`} />
                <Tab label={`For Sale (${products.filter(product => product.in_stock).length})`} />
              </Tabs>
            </Box>

            {/* Products Gallery */}
            {productsLoading ? (
              <Grid container spacing={3}>
                {[...Array(8)].map((_, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                    <Card>
                      <Skeleton variant="rectangular" height={200} />
                      <CardContent>
                        <Skeleton variant="text" height={25} />
                        <Skeleton variant="text" height={20} />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Grid container spacing={3}>
                {products
                  .filter(product => {
                    if (tabValue === 1) return product.in_stock;
                    return true;
                  })
                  .map((product, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                      <Card
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          borderRadius: 2,
                          overflow: 'hidden',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
                          }
                        }}
                      >
                        <Box sx={{ position: 'relative' }}>
                          <CardMedia
                            component="div"
                            sx={{
                              height: 200,
                              background: product.cover_photo_url
                                ? `url(${product.cover_photo_url})`
                                : `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center'
                            }}
                          />
                          
                          {/* Badges */}
                          <Box sx={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 1, flexDirection: 'column' }}>
                            {product.in_stock ? (
                              <Chip
                                label="In Stock"
                                size="small"
                                sx={{
                                  bgcolor: theme.palette.success.main,
                                  color: 'white',
                                  fontWeight: 600
                                }}
                              />
                            ) : (
                              <Chip
                                label="Out of Stock"
                                size="small"
                                sx={{
                                  bgcolor: theme.palette.error.main,
                                  color: 'white',
                                  fontWeight: 600
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
                                bgcolor: alpha('#000', 0.7),
                                color: 'white',
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 1,
                                fontWeight: 600
                              }}
                            >
                              ${product.price}
                            </Box>
                          )}
                        </Box>

                        <CardContent sx={{ flexGrow: 1, p: 2 }}>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 600,
                              mb: 1,
                              display: '-webkit-box',
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}
                          >
                            {product.main_title}
                          </Typography>

                          {product.sub_title && (
                            <Typography
                              variant="body2"
                              sx={{
                                color: theme.palette.text.secondary,
                                mb: 1,
                                display: '-webkit-box',
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}
                            >
                              {product.sub_title}
                            </Typography>
                          )}

                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto' }}>

                            <IconButton
                              size="small"
                              sx={{
                                color: theme.palette.text.secondary,
                                '&:hover': { color: theme.palette.error.main }
                              }}
                            >
                              <IconHeart size={16} />
                            </IconButton>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
              </Grid>
            )}

            {/* Empty State for Products */}
            {!productsLoading && products.length === 0 && (
              <Box textAlign="center" py={8}>
                <IconPalette size={64} color={theme.palette.text.secondary} />
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  No Products Yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This artist hasn't published any products yet. Check back later!
                </Typography>
              </Box>
            )}
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default ArtistProfile;
