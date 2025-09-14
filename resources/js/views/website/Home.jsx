import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Avatar,
  Chip,
  Stack,
  IconButton,
  Paper,
  Skeleton,
  Fade,
  Slide,
  useTheme,
  alpha
} from '@mui/material';
import {
  IconArrowRight,
  IconCalendar,
  IconMapPin,
  IconUsers,
  IconEye,
  IconChevronLeft,
  IconChevronRight,
  IconPalette,
  IconShoppingCart,
  IconNews,
  IconStar,
  IconTrendingUp,
  IconAward,
  IconHeart
} from '@tabler/icons-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade, Parallax } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import 'swiper/css/parallax';
import axios from 'axios';
import configService from 'services/configService';

const API_BASE_URL = '/api';

const Home = () => {
  const theme = useTheme();
  const [upcomingGalleries, setUpcomingGalleries] = useState([]);
  const [latestNews, setLatestNews] = useState([]);
  const [latestProducts, setLatestProducts] = useState([]);
  const [featuredArtists, setFeaturedArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [configReady, setConfigReady] = useState(false);

  // Initialize config service
  useEffect(() => {
    const initConfig = async () => {
      try {
        await configService.initialize();
        setConfigReady(true);
      } catch (error) {
        console.error('Failed to initialize config in Home:', error);
        setConfigReady(true); // Continue with fallback
      }
    };
    
    initConfig();
  }, []);

  // Helper functions
  const getApiUrl = (endpoint = '') => {
    if (configService.isInitialized()) {
      return configService.getApiEndpointUrl(endpoint);
    }
    return `/api/${endpoint}`.replace(/\/+/g, '/').replace(/\/$/, '');
  };

  const getStorageUrl = (path = '') => {
    if (configService.isInitialized()) {
      return configService.getStorageFileUrl(path);
    }
    return `/storage/${path}`.replace(/\/+/g, '/').replace(/\/$/, '');
  };

  useEffect(() => {
    if (configReady) {
      loadHomeData();
    }
  }, [configReady]);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      
      // Load upcoming galleries
      const galleriesResponse = await axios.get(getApiUrl('public/art-panel-galleries?period=upcoming&per_page=5'));
      setUpcomingGalleries(galleriesResponse.data.data || []);
      
      // Load latest news
      const newsResponse = await axios.get(getApiUrl('public/news?per_page=6'));
      setLatestNews(newsResponse.data.data || []);
      
      // Load latest products
      const productsResponse = await axios.get(getApiUrl('public/products?status=published&per_page=8'));
      setLatestProducts(productsResponse.data.data || []);
      
      // Load featured artists
      const artistsResponse = await axios.get(getApiUrl('public/artists?per_page=10'));
      setFeaturedArtists(artistsResponse.data.data || []);
      
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };



  // Hero Slider Component - Professional Design
  const HeroSlider = () => (
    <Box sx={{ position: 'relative', height: '85vh', overflow: 'hidden' }}>
      {loading ? (
        <Skeleton variant="rectangular" width="100%" height="100%" />
      ) : upcomingGalleries.length > 0 ? (
        <Swiper
          modules={[Navigation, Pagination, Autoplay, EffectFade, Parallax]}
          navigation={{
            nextEl: '.hero-button-next',
            prevEl: '.hero-button-prev',
          }}
          pagination={{ 
            clickable: true,
            bulletClass: 'swiper-pagination-bullet hero-bullet',
            bulletActiveClass: 'swiper-pagination-bullet-active hero-bullet-active'
          }}
          autoplay={{ delay: 6000, disableOnInteraction: false }}
          effect="fade"
          parallax={true}
          loop={true}
          style={{ height: '100%' }}
        >
          {upcomingGalleries.map((gallery, index) => (
            <SwiperSlide key={gallery.id}>
      <Box 
        sx={{ 
                  height: '100%',
                  position: 'relative',
                  background: gallery.cover_image_url 
                    ? `url(${gallery.cover_image_url})`
                    : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundAttachment: 'fixed',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.7) 100%)',
                    zIndex: 1
                  }
                }}
              >
                <Container 
                  maxWidth="lg" 
                  sx={{ 
                    height: '100%', 
          display: 'flex',
          alignItems: 'center',
                    position: 'relative',
                    zIndex: 2
                  }}
                >
                  <Grid container spacing={4} alignItems="center">
                    <Grid item xs={12} lg={8}>
                      <Fade in timeout={1000 + index * 200}>
                        <Box>
                          <Box sx={{ mb: 3 }}>
                            <Chip 
                              label="Upcoming Exhibition" 
                              icon={<IconCalendar size={18} />}
                              sx={{ 
                                bgcolor: alpha(theme.palette.primary.main, 0.9),
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                px: 2,
                                py: 1,
                                height: 'auto'
                              }}
                            />
                          </Box>
                          
                          <Typography 
                            variant="h1" 
                            component="h1" 
                            sx={{
                              fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                              fontWeight: 800,
                              color: 'white',
                              mb: 2,
                              lineHeight: 1.1,
                              textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                            }}
                            data-swiper-parallax="-300"
                          >
                            {gallery.main_title}
                          </Typography>
                          
                          {gallery.sub_title && (
                            <Typography 
                              variant="h4" 
                              sx={{
                                fontSize: { xs: '1.25rem', md: '1.75rem' },
                                fontWeight: 300,
                                color: alpha('#ffffff', 0.9),
                                mb: 3,
                                textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                              }}
                              data-swiper-parallax="-200"
                            >
                              {gallery.sub_title}
                            </Typography>
                          )}
                          
                          <Typography 
                            variant="body1" 
                            sx={{
                              fontSize: { xs: '1rem', md: '1.125rem' },
                              color: alpha('#ffffff', 0.85),
                              mb: 4,
                              maxWidth: 600,
                              lineHeight: 1.6,
                              textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                            }}
                            data-swiper-parallax="-100"
                          >
                            {gallery.overview}
                          </Typography>
                          
                          <Stack 
                            direction={{ xs: 'column', sm: 'row' }} 
                            spacing={2} 
                            alignItems={{ xs: 'stretch', sm: 'center' }}
                            sx={{ mb: 4 }}
                            data-swiper-parallax="0"
                          >
                            <Box display="flex" alignItems="center" gap={1}>
                              <IconCalendar size={20} color={alpha('#ffffff', 0.8)} />
                              <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.8), fontWeight: 500 }}>
                                {gallery.date_period}
        </Typography>
                            </Box>
                            {gallery.location && (
                              <Box display="flex" alignItems="center" gap={1}>
                                <IconMapPin size={20} color={alpha('#ffffff', 0.8)} />
                                <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.8), fontWeight: 500 }}>
                                  {gallery.location}
        </Typography>
                              </Box>
                            )}
                            <Box display="flex" alignItems="center" gap={1}>
                              <IconUsers size={20} color={alpha('#ffffff', 0.8)} />
                              <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.8), fontWeight: 500 }}>
                                {gallery.participating_artists_count} Featured Artists
        </Typography>
                            </Box>
                          </Stack>
                          
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Button 
            variant="contained" 
                              size="large"
                              endIcon={<IconArrowRight />}
                              sx={{ 
                                bgcolor: 'white',
                                color: theme.palette.primary.main,
                                fontWeight: 600,
                                px: 4,
                                py: 1.5,
                                borderRadius: 2,
                                textTransform: 'none',
                                fontSize: '1rem',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                                '&:hover': { 
                                  bgcolor: alpha('#ffffff', 0.9),
                                  transform: 'translateY(-2px)',
                                  boxShadow: '0 12px 40px rgba(0,0,0,0.3)'
                                },
                                transition: 'all 0.3s ease'
                              }}
                            >
                              Explore Exhibition
                            </Button>
                            <Button
                              variant="outlined"
            size="large"
                              endIcon={<IconEye />}
                              sx={{ 
                                borderColor: 'white',
                                color: 'white',
                                fontWeight: 600,
                                px: 4,
                                py: 1.5,
                                borderRadius: 2,
                                textTransform: 'none',
                                fontSize: '1rem',
                                borderWidth: 2,
                                '&:hover': { 
                                  bgcolor: alpha('#ffffff', 0.1),
                                  borderColor: 'white',
                                  transform: 'translateY(-2px)'
                                },
                                transition: 'all 0.3s ease'
                              }}
                            >
                              View Details
                            </Button>
                          </Stack>
                        </Box>
                      </Fade>
                    </Grid>
                  </Grid>
                </Container>
              </Box>
            </SwiperSlide>
          ))}
          
          {/* Custom Navigation */}
          <IconButton
            className="hero-button-prev"
            sx={{
              position: 'absolute',
              left: 24,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              bgcolor: alpha('#ffffff', 0.2),
              color: 'white',
              backdropFilter: 'blur(10px)',
              '&:hover': { bgcolor: alpha('#ffffff', 0.3) },
              transition: 'all 0.3s ease'
            }}
          >
            <IconChevronLeft size={24} />
          </IconButton>
          <IconButton
            className="hero-button-next"
            sx={{
              position: 'absolute',
              right: 24,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              bgcolor: alpha('#ffffff', 0.2),
              color: 'white',
              backdropFilter: 'blur(10px)',
              '&:hover': { bgcolor: alpha('#ffffff', 0.3) },
              transition: 'all 0.3s ease'
            }}
          >
            <IconChevronRight size={24} />
          </IconButton>
        </Swiper>
      ) : (
        // Fallback when no galleries
        <Box
          sx={{
            height: '100%',
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            display: 'flex',
            alignItems: 'center',
            color: 'white',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.3)',
              zIndex: 1
            }
          }}
        >
          <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
            <Typography variant="h1" component="h1" sx={{ fontSize: { xs: '2.5rem', md: '4rem' }, fontWeight: 800, mb: 2 }}>
              Discover Extraordinary Art
            </Typography>
            <Typography variant="h4" sx={{ fontSize: { xs: '1.25rem', md: '1.75rem' }, fontWeight: 300, mb: 4, opacity: 0.9 }}>
              Curated Collections from Visionary Artists
            </Typography>
            <Button
              variant="contained"
              size="large"
              endIcon={<IconArrowRight />}
              sx={{ 
                bgcolor: 'white',
                color: theme.palette.primary.main,
                fontWeight: 600,
                px: 4,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem'
              }}
            >
              Explore Galleries
          </Button>
          </Container>
        </Box>
      )}
      
      {/* Custom Pagination Styles */}
      <style jsx global>{`
        .hero-bullet {
          width: 12px !important;
          height: 12px !important;
          background: rgba(255,255,255,0.4) !important;
          border-radius: 50% !important;
          margin: 0 6px !important;
          transition: all 0.3s ease !important;
        }
        .hero-bullet-active {
          background: white !important;
          transform: scale(1.2) !important;
        }
      `}</style>
    </Box>
  );

  // News Section - Professional Design
  const NewsSection = () => (
    <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#fafafa' }}>
      <Container maxWidth="lg">
        <Fade in timeout={800}>
          <Box textAlign="center" mb={8}>
            <Typography 
              variant="overline" 
              sx={{ 
                color: theme.palette.primary.main, 
                fontWeight: 700,
                letterSpacing: 2,
                fontSize: '0.875rem'
              }}
            >
              LATEST INSIGHTS
            </Typography>
            <Typography 
              variant="h2" 
              component="h2" 
              sx={{ 
                fontSize: { xs: '2rem', md: '2.75rem' },
                fontWeight: 700,
                color: theme.palette.text.primary,
                mb: 2,
                mt: 1
              }}
            >
              Art World News & Stories
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: theme.palette.text.secondary,
                fontWeight: 400,
                maxWidth: 600,
                mx: 'auto'
              }}
            >
              Stay connected with the latest developments, artist spotlights, and cultural insights from the contemporary art scene
            </Typography>
          </Box>
        </Fade>
        
        {loading ? (
          <Box sx={{ display: 'flex', gap: 2 }}>
            {[...Array(3)].map((_, index) => (
              <Box key={index} sx={{ flex: '1 1 33.333%' }}>
                <Card sx={{ height: 420 }}>
                  <Skeleton variant="rectangular" height={220} />
                  <CardContent>
                    <Skeleton variant="text" height={30} />
                    <Skeleton variant="text" height={20} />
                    <Skeleton variant="text" height={60} />
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        ) : (
          <>
            <Box 
              sx={{ 
                display: { xs: 'block', md: 'flex' }, 
                gap: { md: 2 },
                '& > *': {
                  mb: { xs: 2, md: 0 }
                }
              }}
            >
              {latestNews.slice(0, 3).map((news, index) => (
                <Box key={news.id} sx={{ flex: { md: '1 1 33.333%' } }}>
                  <Slide direction="up" in timeout={600 + index * 200}>
                    <Card 
                      sx={{ 
                        height: 420, 
                        display: 'flex', 
                        flexDirection: 'column',
                        borderRadius: 3,
                        overflow: 'hidden',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        transition: 'all 0.3s ease',
                        '&:hover': { 
                          transform: 'translateY(-8px)',
                          boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                        }
                      }}
                    >
                      <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                        <CardMedia
                          component="div"
                          sx={{
                            height: 220,
                            background: news.cover_photo
                              ? `url(${getStorageUrl(news.cover_photo)})`
                              : `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            transition: 'transform 0.3s ease',
                            '&:hover': { transform: 'scale(1.05)' }
                          }}
                        />
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 16,
                            left: 16,
                            bgcolor: alpha(theme.palette.primary.main, 0.9),
                            color: 'white',
                            p: 1,
                            borderRadius: 2,
                            backdropFilter: 'blur(10px)'
                          }}
                        >
                          <IconNews size={20} />
                        </Box>
                      </Box>
                      <CardContent sx={{ flexGrow: 1, p: 2.5, display: 'flex', flexDirection: 'column' }}>
                        <Typography 
                          variant="h6" 
                          component="h3" 
                          sx={{ 
                            fontWeight: 700,
                            mb: 1,
                            lineHeight: 1.3,
                            color: theme.palette.text.primary,
                            fontSize: '1rem'
                          }}
                        >
                          {news.main_title}
                        </Typography>
                        {news.sub_title && (
                          <Typography 
                            variant="subtitle2" 
                            sx={{ 
                              color: theme.palette.primary.main,
                              fontWeight: 600,
                              mb: 1.5,
                              fontSize: '0.8rem'
                            }}
                          >
                            {news.sub_title}
                          </Typography>
                        )}
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: theme.palette.text.secondary,
                            mb: 'auto',
                            lineHeight: 1.5,
                            fontSize: '0.8rem'
                          }}
                        >
                          {news.description?.substring(0, 90)}...
                        </Typography>
                        <Box display="flex" alignItems="center" justifyContent="space-between" mt={2}>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: theme.palette.text.secondary,
                              fontWeight: 500,
                              fontSize: '0.75rem'
                            }}
                          >
                            By {news.author_name}
                          </Typography>
                          <IconArrowRight size={14} color={theme.palette.primary.main} />
                        </Box>
                      </CardContent>
                    </Card>
                  </Slide>
                </Box>
              ))}
            </Box>
            
            <Box textAlign="center" mt={6}>
              <Button 
                component={Link}
                to="/articles"
                variant="outlined" 
                size="large"
                endIcon={<IconArrowRight />}
                sx={{
                  borderColor: theme.palette.primary.main,
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                  borderWidth: 2,
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    bgcolor: alpha(theme.palette.primary.main, 0.05)
                  }
                }}
              >
                Read All Articles
              </Button>
            </Box>
          </>
        )}
      </Container>
    </Box>
  );

  // Products Section - Professional Design
  const ProductsSection = () => (
    <Box sx={{ py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <Fade in timeout={800}>
          <Box textAlign="center" mb={8}>
            <Typography 
              variant="overline" 
              sx={{ 
                color: theme.palette.primary.main, 
                fontWeight: 700,
                letterSpacing: 2,
                fontSize: '0.875rem'
              }}
            >
              CURATED COLLECTION
            </Typography>
            <Typography 
              variant="h2" 
              component="h2" 
              sx={{ 
                fontSize: { xs: '2rem', md: '2.75rem' },
                fontWeight: 700,
                color: theme.palette.text.primary,
                mb: 2,
                mt: 1
              }}
            >
              Exceptional Art Panels
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: theme.palette.text.secondary,
                fontWeight: 400,
                maxWidth: 600,
                mx: 'auto'
              }}
            >
              Transform your space with carefully crafted art panels from renowned and emerging artists worldwide
            </Typography>
          </Box>
        </Fade>
        
        {loading ? (
          <Grid container spacing={4}>
            {[...Array(4)].map((_, index) => (
              <Grid item xs={12} sm={6} lg={3} key={index}>
                <Card sx={{ height: 420 }}>
                  <Skeleton variant="rectangular" height={280} />
                  <CardContent>
                    <Skeleton variant="text" height={25} />
                    <Skeleton variant="text" height={20} />
                    <Skeleton variant="text" height={30} />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <>
            <Box sx={{
              '& .swiper': {
                '& .swiper-wrapper': {
                  alignItems: 'stretch' // Make all slides same height
                },
                '& .swiper-slide': {
                  height: 'auto',
                  display: 'flex !important',
                  '& > div': {
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }
                }
              }
            }}>
              <Swiper
                modules={[Navigation]}
                navigation={{
                  nextEl: '.products-button-next',
                  prevEl: '.products-button-prev',
                }}
                spaceBetween={24}
                slidesPerView={1}
                breakpoints={{
                  640: { slidesPerView: 2 },
                  768: { slidesPerView: 2 },
                  1024: { slidesPerView: 3 },
                  1280: { slidesPerView: 4 }
                }}
              >
              {latestProducts.slice(0, 8).map((product, index) => (
                <SwiperSlide key={product.id}>
                  <Slide direction="up" in timeout={600 + index * 100}>
                    <Card 
                      sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        borderRadius: 3,
                        overflow: 'hidden',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        transition: 'all 0.3s ease',
                        '&:hover': { 
                          transform: 'translateY(-8px)',
                          boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                        }
                      }}
                    >
                      <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                        <CardMedia
                          component="div"
                          sx={{
                            height: 280,
                            background: product.cover_photo_url 
                              ? `url(${product.cover_photo_url})`
                              : `linear-gradient(135deg, ${theme.palette.secondary.light} 0%, ${theme.palette.secondary.main} 100%)`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            transition: 'transform 0.3s ease',
                            '&:hover': { transform: 'scale(1.05)' }
                          }}
                        />
                        {product.is_on_sale && (
                          <Chip
                            label={`${product.discount_percentage}% OFF`}
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: 12,
                              right: 12,
                              bgcolor: theme.palette.error.main,
                              color: 'white',
                              fontWeight: 600
                            }}
                          />
                        )}
                        {!product.in_stock && (
                          <Chip
                            label="Sold Out"
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: 12,
                              left: 12,
                              bgcolor: alpha('#000', 0.7),
                              color: 'white',
                              fontWeight: 600
                            }}
                          />
                        )}
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 12,
                            right: 12,
                            bgcolor: alpha('#fff', 0.9),
                            backdropFilter: 'blur(10px)',
                            borderRadius: 2,
                            p: 1
                          }}
                        >
                          <IconHeart size={20} color={theme.palette.text.secondary} />
                        </Box>
                      </Box>
                      <CardContent sx={{ 
                        flexGrow: 1, 
                        p: 3, 
                        display: 'flex', 
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}>
                        {/* Top Content */}
                        <Box>
                          <Typography 
                            variant="h6" 
                            component="h3" 
                            sx={{ 
                              fontWeight: 700,
                              mb: 1,
                              lineHeight: 1.3,
                              fontSize: '1.1rem',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
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
                                fontSize: '0.875rem',
                                display: '-webkit-box',
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}
                            >
                              {product.sub_title}
                            </Typography>
                          )}
                          {product.artist && (
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                color: theme.palette.primary.main,
                                fontWeight: 600,
                                display: 'block',
                                mb: 2
                              }}
                            >
                              by {product.artist.artist_name}
                            </Typography>
                          )}
                        </Box>
                        
                        {/* Bottom Content - Price */}
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                          <Box>
                            {product.discount_price && parseFloat(product.discount_price) > 0 ? (
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    textDecoration: 'line-through', 
                                    color: theme.palette.text.secondary,
                                    fontSize: '0.875rem'
                                  }}
                                >
                                  ${parseFloat(product.price).toFixed(2)}
                                </Typography>
                                <Typography 
                                  variant="h6" 
                                  sx={{ 
                                    color: theme.palette.error.main,
                                    fontWeight: 700
                                  }}
                                >
                                  ${parseFloat(product.discount_price).toFixed(2)}
                                </Typography>
                              </Stack>
                            ) : (
                              <Typography 
                                variant="h6" 
                                sx={{ 
                                  fontWeight: 700,
                                  color: theme.palette.text.primary
                                }}
                              >
                                ${parseFloat(product.price).toFixed(2)}
                              </Typography>
                            )}
                          </Box>
                          {product.is_custom_dimension && (
                            <Chip 
                              label="Custom" 
                              size="small" 
                              variant="outlined"
                              sx={{ fontSize: '0.75rem' }}
                            />
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Slide>
                </SwiperSlide>
              ))}
              </Swiper>
            </Box>
            
            {/* Custom Navigation for Products */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
              <IconButton
                className="products-button-prev"
                sx={{
                  bgcolor: theme.palette.primary.main,
                  color: 'white',
                  '&:hover': { bgcolor: theme.palette.primary.dark },
                  '&:disabled': { bgcolor: 'grey.300' }
                }}
              >
                <IconChevronLeft />
              </IconButton>
              <IconButton
                className="products-button-next"
                sx={{
                  bgcolor: theme.palette.primary.main,
                  color: 'white',
                  '&:hover': { bgcolor: theme.palette.primary.dark },
                  '&:disabled': { bgcolor: 'grey.300' }
                }}
              >
                <IconChevronRight />
              </IconButton>
            </Box>
            
            <Box textAlign="center" mt={4}>
              <Button 
                variant="contained" 
                size="large"
                endIcon={<IconShoppingCart />}
                sx={{
                  bgcolor: theme.palette.primary.main,
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  '&:hover': {
                    bgcolor: theme.palette.primary.dark,
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.2)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Explore All Collections
              </Button>
      </Box>
          </>
        )}
    </Container>
    </Box>
  );

  // Artists Section - Professional Design
  const ArtistsSection = () => (
    <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#fafafa' }}>
      <Container maxWidth="lg">
        <Fade in timeout={800}>
          <Box textAlign="center" mb={8}>
            <Typography 
              variant="overline" 
              sx={{ 
                color: theme.palette.primary.main, 
                fontWeight: 700,
                letterSpacing: 2,
                fontSize: '0.875rem'
              }}
            >
              CREATIVE MINDS
            </Typography>
            <Typography 
              variant="h2" 
              component="h2" 
              sx={{ 
                fontSize: { xs: '2rem', md: '2.75rem' },
                fontWeight: 700,
                color: theme.palette.text.primary,
                mb: 2,
                mt: 1
              }}
            >
              Featured Artists
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: theme.palette.text.secondary,
                fontWeight: 400,
                maxWidth: 600,
                mx: 'auto'
              }}
            >
              Meet the visionary artists whose creativity and passion bring extraordinary works to life
            </Typography>
          </Box>
        </Fade>
        
        {loading ? (
          <Grid container spacing={4}>
            {[...Array(5)].map((_, index) => (
              <Grid item xs={12} sm={6} md={4} lg={2.4} key={index}>
                <Card sx={{ textAlign: 'center', p: 2 }}>
                  <Skeleton variant="circular" width={140} height={140} sx={{ mx: 'auto', mb: 2 }} />
                  <Skeleton variant="text" height={25} />
                  <Skeleton variant="text" height={20} />
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <>
            <Swiper
              modules={[Navigation]}
              navigation={{
                nextEl: '.artists-button-next',
                prevEl: '.artists-button-prev',
              }}
              spaceBetween={20}
              slidesPerView={1}
              breakpoints={{
                640: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 4 },
                1280: { slidesPerView: 5 }
              }}
            >
              {featuredArtists.map((artist, index) => (
                <SwiperSlide key={artist.id}>
                  <Slide direction="up" in timeout={600 + index * 100}>
                    <Box 
                      sx={{ 
                        textAlign: 'center',
                        p: 2,
                        borderRadius: 4,
                        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                        border: '1px solid',
                        borderColor: alpha(theme.palette.primary.main, 0.1),
                        transition: 'all 0.4s ease',
                        cursor: 'pointer',
                        '&:hover': { 
                          transform: 'translateY(-12px)',
                          boxShadow: `0 20px 60px ${alpha(theme.palette.primary.main, 0.15)}`,
                          borderColor: alpha(theme.palette.primary.main, 0.3),
                          '& .artist-avatar': {
                            transform: 'scale(1.05)',
                            boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.25)}`
                          },
                          '& .artist-name': {
                            color: theme.palette.primary.main
                          }
                        }
                      }}
                    >
                      <Box sx={{ position: 'relative', display: 'inline-block', mb: 2.5 }}>
                        <Avatar
                          src={artist.avatar_thumb_url}
                          className="artist-avatar"
                          sx={{ 
                            width: 100, 
                            height: 100, 
                            mx: 'auto',
                            border: `3px solid ${theme.palette.primary.main}`,
                            boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.15)}`,
                            transition: 'all 0.4s ease',
                            background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`
                          }}
                        >
                          <IconPalette size={35} color="white" />
                        </Avatar>
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: -5,
                            right: -5,
                            bgcolor: theme.palette.secondary.main,
                            color: 'white',
                            borderRadius: '50%',
                            width: 28,
                            height: 28,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            border: '2px solid white'
                          }}
                        >
                          <IconStar size={14} />
                        </Box>
                      </Box>
                      
                      <Typography 
                        variant="h6" 
                        component="h3" 
                        className="artist-name"
                        sx={{ 
                          fontWeight: 700,
                          mb: 0.5,
                          color: theme.palette.text.primary,
                          fontSize: '1.1rem',
                          transition: 'color 0.3s ease'
                        }}
                      >
                        {artist.artist_name}
                      </Typography>
                      
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: theme.palette.text.secondary,
                          fontWeight: 500,
                          mb: 2.5,
                          fontSize: '0.875rem',
                          fontStyle: 'italic'
                        }}
                      >
                        {artist.specialties?.split(',')[0]?.trim() || 'Contemporary Artist'}
                      </Typography>
                      
                      <Button 
                        variant="outlined"
                        size="small" 
                        endIcon={<IconEye size={16} />}
                        sx={{
                          borderColor: theme.palette.primary.main,
                          color: theme.palette.primary.main,
                          fontWeight: 600,
                          textTransform: 'none',
                          borderRadius: 2,
                          px: 2.5,
                          py: 0.75,
                          fontSize: '0.875rem',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            bgcolor: theme.palette.primary.main,
                            color: 'white',
                            transform: 'translateY(-2px)',
                            boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.3)}`
                          }
                        }}
                      >
                        View Portfolio
                      </Button>
                    </Box>
                  </Slide>
                </SwiperSlide>
              ))}
            </Swiper>
            
            {/* Custom Navigation for Artists */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 5 }}>
              <IconButton
                className="artists-button-prev"
                sx={{
                  width: 50,
                  height: 50,
                  bgcolor: 'white',
                  color: theme.palette.primary.main,
                  border: `2px solid ${theme.palette.primary.main}`,
                  boxShadow: `0 4px 15px ${alpha(theme.palette.primary.main, 0.2)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': { 
                    bgcolor: theme.palette.primary.main,
                    color: 'white',
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`
                  },
                  '&:disabled': { 
                    bgcolor: 'grey.100',
                    color: 'grey.400',
                    borderColor: 'grey.300',
                    boxShadow: 'none'
                  }
                }}
              >
                <IconChevronLeft size={24} />
              </IconButton>
              <IconButton
                className="artists-button-next"
                sx={{
                  width: 50,
                  height: 50,
                  bgcolor: 'white',
                  color: theme.palette.primary.main,
                  border: `2px solid ${theme.palette.primary.main}`,
                  boxShadow: `0 4px 15px ${alpha(theme.palette.primary.main, 0.2)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': { 
                    bgcolor: theme.palette.primary.main,
                    color: 'white',
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`
                  },
                  '&:disabled': { 
                    bgcolor: 'grey.100',
                    color: 'grey.400',
                    borderColor: 'grey.300',
                    boxShadow: 'none'
                  }
                }}
              >
                <IconChevronRight size={24} />
              </IconButton>
            </Box>
            
            <Box textAlign="center" mt={4}>
              <Button 
                component={Link}
                to="/artists"
                variant="outlined" 
                size="large"
                endIcon={<IconUsers />}
                sx={{
                  borderColor: theme.palette.primary.main,
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                  borderWidth: 2,
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    bgcolor: alpha(theme.palette.primary.main, 0.05)
                  }
                }}
              >
                Meet All Artists
              </Button>
            </Box>
          </>
        )}
      </Container>
    </Box>
  );



  return (
    <Box>
      {/* Hero Section */}
      <HeroSlider />

      {/* News Section */}
      <NewsSection />

      {/* Products Section */}
      <ProductsSection />

      {/* Artists Section */}
      <ArtistsSection />
    </Box>
  );
};

export default Home;