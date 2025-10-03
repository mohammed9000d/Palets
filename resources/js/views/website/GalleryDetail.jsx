import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLoading } from '../../contexts/LoadingContext';
import {
  Box,
  Typography,
  Button,
  Container,
  Card,
  CardContent,
  Avatar,
  Chip,
  Stack,
  IconButton,
  Skeleton,
  Fade,
  useTheme,
  alpha,
  Divider,
  Dialog,
  DialogContent,
  Breadcrumbs
} from '@mui/material';
import {
  IconArrowLeft,
  IconCalendar,
  IconMapPin,
  IconUsers,
  IconEye,
  IconPalette,
  IconClock,
  IconShare,
  IconChevronLeft,
  IconChevronRight,
  IconX,
  IconExternalLink,
  IconSparkles,
  IconHistory,
  IconHome,
  IconPhoto
} from '@tabler/icons-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, Thumbs, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';
import 'swiper/css/free-mode';
import axios from 'axios';
import configService from 'services/configService';
import ReactMarkdown from 'react-markdown';

const GalleryDetail = () => {
  const theme = useTheme();
  const { slug } = useParams();
  const navigate = useNavigate();
  const { markContentReady } = useLoading();
  
  // State management
  const [gallery, setGallery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [configReady, setConfigReady] = useState(false);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [imageDialog, setImageDialog] = useState({ open: false, image: null, index: 0 });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Initialize config service
  useEffect(() => {
    const initConfig = async () => {
      try {
        await configService.initialize();
        setConfigReady(true);
      } catch (error) {
        console.error('Failed to initialize config in GalleryDetail:', error);
        setConfigReady(true);
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

  // Load gallery data
  useEffect(() => {
    if (configReady && slug) {
      loadGallery();
    }
  }, [configReady, slug]);

  const loadGallery = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get(getApiUrl(`public/art-panel-galleries/${slug}`));
      setGallery(response.data.gallery);
      
      setTimeout(() => {
        markContentReady('gallery-detail');
      }, 100);
      
    } catch (error) {
      console.error('Error loading gallery:', error);
      setError('Gallery not found or failed to load');
      setTimeout(() => {
        markContentReady('gallery-detail');
      }, 100);
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = (image, index) => {
    setImageDialog({ open: true, image, index });
    setCurrentImageIndex(index);
  };

  const handleCloseImageDialog = () => {
    setImageDialog({ open: false, image: null, index: 0 });
  };

  const handleNextImage = () => {
    if (gallery?.gallery_images && currentImageIndex < gallery.gallery_images.length - 1) {
      const newIndex = currentImageIndex + 1;
      setCurrentImageIndex(newIndex);
      setImageDialog({ 
        open: true, 
        image: gallery.gallery_images[newIndex], 
        index: newIndex 
      });
    }
  };

  const handlePrevImage = () => {
    if (currentImageIndex > 0) {
      const newIndex = currentImageIndex - 1;
      setCurrentImageIndex(newIndex);
      setImageDialog({ 
        open: true, 
        image: gallery.gallery_images[newIndex], 
        index: newIndex 
      });
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: gallery.main_title,
        text: gallery.overview,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  // Loading State
  if (loading) {
    return (
      <Box>
        {/* Header Skeleton */}
        <Box sx={{ py: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Container maxWidth="lg">
            <Skeleton variant="text" width={200} height={40} />
          </Container>
        </Box>
        
        {/* Main Content Skeleton */}
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 6 }}>
            {/* Left Column */}
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="rectangular" height={500} sx={{ mb: 4, borderRadius: 2 }} />
              <Skeleton variant="text" height={60} sx={{ mb: 2 }} />
              <Skeleton variant="text" height={40} sx={{ mb: 4 }} />
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
            </Box>
            
            {/* Right Column */}
            <Box sx={{ width: { lg: 350 } }}>
              <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
            </Box>
          </Box>
        </Container>
      </Box>
    );
  }

  // Error State
  if (error || !gallery) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <IconPalette size={64} style={{ opacity: 0.3, marginBottom: 16 }} />
        <Typography variant="h4" color="textSecondary" gutterBottom>
          Gallery Not Found
        </Typography>
        <Typography variant="body1" color="textSecondary" mb={3}>
          The gallery you're looking for doesn't exist or has been removed.
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<IconArrowLeft />}
          onClick={() => navigate('/galleries')}
        >
          Back to Galleries
        </Button>
      </Container>
    );
  }

  return (
    <Box>
      {/* Minimal Header with Breadcrumbs */}
      <Box sx={{ py: 3, borderBottom: 1, borderColor: 'divider', bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Breadcrumbs separator="›" sx={{ color: 'text.secondary' }}>
              <Link 
                to="/" 
                style={{ 
                  textDecoration: 'none', 
                  color: theme.palette.text.secondary,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <IconHome size={16} />
                Home
              </Link>
              <Link 
                to="/galleries" 
                style={{ 
                  textDecoration: 'none', 
                  color: theme.palette.text.secondary 
                }}
              >
                Galleries
              </Link>
              <Typography color="text.primary" fontWeight={500}>
                {gallery.main_title}
              </Typography>
            </Breadcrumbs>
            
            <Button
              startIcon={<IconShare size={18} />}
              onClick={handleShare}
              variant="outlined"
              size="small"
              sx={{ 
                textTransform: 'none',
                borderRadius: 2,
                minWidth: 'auto',
                px: 2
              }}
            >
              Share
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 6 }}>
          
          {/* Left Column - Main Content */}
          <Box sx={{ flex: 1 }}>
            
            {/* Gallery Images */}
            {gallery.gallery_images && gallery.gallery_images.length > 0 ? (
              <Box sx={{ mb: 6 }}>
                {/* Section Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h5" fontWeight={600}>
                    Exhibition Gallery
                  </Typography>
                  <Chip 
                    label={`${gallery.gallery_images.length} ${gallery.gallery_images.length === 1 ? 'Image' : 'Images'}`}
                    size="small"
                    sx={{ 
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                      fontWeight: 600
                    }}
                  />
                </Box>

                {/* Main Featured Image */}
                <Box 
                  sx={{ 
                    position: 'relative',
                    height: 400,
                    borderRadius: 2, 
                    overflow: 'hidden', 
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    mb: 3,
                    cursor: 'pointer'
                  }}
                  onClick={() => handleImageClick(gallery.gallery_images[0], 0)}
                >
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      background: `url(${gallery.gallery_images[0].url})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.02)'
                      }
                    }}
                  />
                  
                  {/* Overlay with info */}
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                      p: 3,
                      color: 'white'
                    }}
                  >
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                      Featured Image
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      Click to view all {gallery.gallery_images.length} images
                    </Typography>
                  </Box>

                  {/* Image counter badge */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      bgcolor: 'rgba(0,0,0,0.7)',
                      color: 'white',
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    1 / {gallery.gallery_images.length}
                  </Box>
                </Box>

                {/* Additional Images Section */}
                {gallery.gallery_images.length > 1 && (
                  <Box>
                    {gallery.gallery_images.length <= 4 ? (
                      // For 2-4 images: Show all remaining images in a nice layout
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {gallery.gallery_images.length === 2 ? 'Second Image' : 'More Images from this Exhibition'}
                        </Typography>
                        
                        <Box 
                          sx={{ 
                            display: 'grid',
                            gridTemplateColumns: gallery.gallery_images.length === 2 
                              ? '1fr' 
                              : gallery.gallery_images.length === 3 
                                ? 'repeat(2, 1fr)' 
                                : 'repeat(3, 1fr)',
                            gap: 2,
                            mb: 3
                          }}
                        >
                          {gallery.gallery_images.slice(1).map((image, index) => (
                            <Box
                              key={index + 1}
                              onClick={() => handleImageClick(image, index + 1)}
                              sx={{
                                height: gallery.gallery_images.length === 2 ? 200 : 120,
                                background: `url(${image.url})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                borderRadius: 2,
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                position: 'relative',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                '&:hover': {
                                  transform: 'translateY(-4px)',
                                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                                }
                              }}
                            >
                              {/* Image number badge */}
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: 8,
                                  right: 8,
                                  bgcolor: 'rgba(0,0,0,0.7)',
                                  color: 'white',
                                  width: 24,
                                  height: 24,
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.75rem',
                                  fontWeight: 600
                                }}
                              >
                                {index + 2}
                              </Box>
                            </Box>
                          ))}
                        </Box>

                        {/* Simple view all button for small galleries */}
                        <Box sx={{ textAlign: 'center' }}>
                          <Button
                            variant="text"
                            onClick={() => handleImageClick(gallery.gallery_images[0], 0)}
                            startIcon={<IconPhoto size={18} />}
                            sx={{ 
                              textTransform: 'none',
                              color: 'text.secondary',
                              '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.04)
                              }
                            }}
                          >
                            View in Gallery Mode
                          </Button>
                        </Box>
                      </Box>
                    ) : (
                      // For 5+ images: Show compact preview grid
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          More Images from this Exhibition
                        </Typography>
                        
                        <Box 
                          sx={{ 
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
                            gap: 1,
                            maxHeight: 100,
                            overflow: 'hidden'
                          }}
                        >
                          {gallery.gallery_images.slice(1, Math.min(gallery.gallery_images.length, 7)).map((image, index) => (
                            <Box
                              key={index + 1}
                              onClick={() => handleImageClick(image, index + 1)}
                              sx={{
                                height: 80,
                                background: `url(${image.thumb})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                borderRadius: 1,
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                position: 'relative',
                                '&:hover': {
                                  transform: 'scale(1.05)',
                                  zIndex: 2,
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                                }
                              }}
                            />
                          ))}
                          
                          {/* Show "+X more" if there are more than 6 additional images */}
                          {gallery.gallery_images.length > 7 && (
                            <Box
                              onClick={() => handleImageClick(gallery.gallery_images[0], 0)}
                              sx={{
                                height: 80,
                                background: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${gallery.gallery_images[7].thumb})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                borderRadius: 1,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  transform: 'scale(1.05)',
                                  background: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${gallery.gallery_images[7].thumb})`
                                }
                              }}
                            >
                              +{gallery.gallery_images.length - 7}
                            </Box>
                          )}
                        </Box>

                        {/* View All Button */}
                        <Box sx={{ textAlign: 'center', mt: 3 }}>
                          <Button
                            variant="outlined"
                            onClick={() => handleImageClick(gallery.gallery_images[0], 0)}
                            startIcon={<IconPhoto size={18} />}
                            sx={{ 
                              textTransform: 'none',
                              borderRadius: 2,
                              px: 3
                            }}
                          >
                            View All Gallery Images
                          </Button>
                        </Box>
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            ) : (
              // Fallback for cover image only
              gallery.cover_image_url && (
                <Box 
                  sx={{ 
                    mb: 6, 
                    height: 400, 
                    borderRadius: 2, 
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    background: `url(${gallery.cover_image_url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleImageClick({ url: gallery.cover_image_url }, 0)}
                />
              )
            )}

            {/* Gallery Information */}
            <Box sx={{ mb: 6 }}>
              {/* Status Badge */}
              <Box sx={{ mb: 3 }}>
                <Chip 
                  label={gallery.is_upcoming ? 'Upcoming Exhibition' : gallery.is_past ? 'Past Exhibition' : 'Active Exhibition'}
                  icon={gallery.is_upcoming ? <IconSparkles size={16} /> : gallery.is_past ? <IconHistory size={16} /> : <IconClock size={16} />}
                  sx={{ 
                    fontWeight: 600,
                    bgcolor: gallery.is_upcoming 
                      ? theme.palette.primary.main 
                      : gallery.is_past 
                        ? theme.palette.grey[600] 
                        : theme.palette.success.main,
                    color: 'white',
                    '& .MuiChip-icon': { color: 'white' },
                    '& .MuiChip-label': { color: 'white' }
                  }}
                />
              </Box>

              {/* Title */}
              <Typography 
                variant="h2" 
                component="h1" 
                sx={{ 
                  fontSize: { xs: '2rem', md: '2.5rem' },
                  fontWeight: 700,
                  mb: 2,
                  lineHeight: 1.2
                }}
              >
                {gallery.main_title}
              </Typography>

              {gallery.sub_title && (
                <Typography 
                  variant="h5" 
                  sx={{ 
                    color: theme.palette.primary.main,
                    fontWeight: 500,
                    mb: 4,
                    fontSize: { xs: '1.1rem', md: '1.25rem' }
                  }}
                >
                  {gallery.sub_title}
                </Typography>
              )}

              {/* Overview */}
              {gallery.overview && (
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontSize: '1.1rem',
                    lineHeight: 1.7,
                    color: theme.palette.text.secondary,
                    mb: 4
                  }}
                >
                  {gallery.overview}
                </Typography>
              )}
            </Box>

            {/* Description */}
            {gallery.description && (
              <Box sx={{ mb: 6 }}>
                <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
                  About This Exhibition
                </Typography>
                <Box 
                  sx={{ 
                    '& p': {
                      fontSize: '1rem',
                      lineHeight: 1.8,
                      color: theme.palette.text.secondary,
                      mb: 2,
                      '&:last-child': { mb: 0 }
                    },
                    '& h1, & h2, & h3, & h4, & h5, & h6': {
                      color: theme.palette.text.primary,
                      fontWeight: 600,
                      mt: 3,
                      mb: 2,
                      '&:first-of-type': { mt: 0 }
                    },
                    '& h1': { fontSize: '2rem' },
                    '& h2': { fontSize: '1.75rem' },
                    '& h3': { fontSize: '1.5rem' },
                    '& h4': { fontSize: '1.25rem' },
                    '& h5': { fontSize: '1.125rem' },
                    '& h6': { fontSize: '1rem' },
                    '& ul, & ol': {
                      pl: 3,
                      mb: 2,
                      '& li': {
                        mb: 0.5,
                        color: theme.palette.text.secondary
                      }
                    },
                    '& blockquote': {
                      borderLeft: `4px solid ${theme.palette.primary.main}`,
                      pl: 2,
                      py: 1,
                      my: 2,
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                      fontStyle: 'italic',
                      '& p': {
                        mb: 0
                      }
                    },
                    '& code': {
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: '0.875rem',
                      fontFamily: 'monospace'
                    },
                    '& pre': {
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                      p: 2,
                      borderRadius: 2,
                      overflow: 'auto',
                      mb: 2,
                      '& code': {
                        bgcolor: 'transparent',
                        p: 0
                      }
                    },
                    '& strong': {
                      fontWeight: 600,
                      color: theme.palette.text.primary
                    },
                    '& em': {
                      fontStyle: 'italic'
                    },
                    '& a': {
                      color: theme.palette.primary.main,
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline'
                      }
                    }
                  }}
                >
                  <ReactMarkdown>{gallery.description}</ReactMarkdown>
                </Box>
              </Box>
            )}

            {/* Participating Artists */}
            {gallery.participating_artists && gallery.participating_artists.length > 0 && (
              <Box>
                <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
                  Featured Artists ({gallery.participating_artists.length})
                </Typography>
                <Box 
                  sx={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: 3
                  }}
                >
                  {gallery.participating_artists.map((artist) => (
                    <Card 
                      key={artist.artist_id}
                      component={Link}
                      to={`/artists/${artist.slug}`}
                      sx={{ 
                        p: 3,
                        textDecoration: 'none',
                        transition: 'all 0.3s ease',
                        '&:hover': { 
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                        }
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar
                          src={artist.avatar_thumb_url}
                          sx={{ 
                            width: 50, 
                            height: 50,
                            bgcolor: theme.palette.primary.main
                          }}
                        >
                          {artist.artist_name.charAt(0)}
                        </Avatar>
                        <Box flex={1}>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {artist.artist_name}
                          </Typography>
                          {artist.role && (
                            <Typography variant="body2" color="text.secondary">
                              {artist.role}
                            </Typography>
                          )}
                        </Box>
                        <IconExternalLink size={18} color={theme.palette.text.secondary} />
                      </Box>
                    </Card>
                  ))}
                </Box>
              </Box>
            )}
          </Box>

          {/* Right Column - Sidebar */}
          <Box sx={{ width: { lg: 350 } }}>
            <Box sx={{ position: 'sticky', top: 24 }}>
              
              {/* Gallery Details Card */}
              <Card sx={{ mb: 4, p: 4 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                  Exhibition Details
                </Typography>
                
                <Stack spacing={3}>
                  {/* Date */}
                  <Box display="flex" alignItems="flex-start" gap={2}>
                    <IconCalendar size={20} color={theme.palette.primary.main} />
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Exhibition Period
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {gallery.date_period}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {gallery.duration} days
                      </Typography>
                    </Box>
                  </Box>

                  {/* Location */}
                  {gallery.location && (
                    <Box display="flex" alignItems="flex-start" gap={2}>
                      <IconMapPin size={20} color={theme.palette.primary.main} />
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          Location
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {gallery.location}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {/* Artists Count */}
                  <Box display="flex" alignItems="flex-start" gap={2}>
                    <IconUsers size={20} color={theme.palette.primary.main} />
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Featured Artists
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {gallery.participating_artists_count} artists
                      </Typography>
                    </Box>
                  </Box>

                  {/* Views */}
                  <Box display="flex" alignItems="flex-start" gap={2}>
                    <IconEye size={20} color={theme.palette.primary.main} />
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Views
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {gallery.view_count || 0} views
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </Card>

              {/* Organizer Card */}
              {gallery.organizer_artist && (
                <Card sx={{ mb: 4, p: 4 }}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                    Exhibition Organizer
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2} sx={{ mb: 3 }}>
                    <Avatar
                      src={gallery.organizer_artist.avatar_thumb_url}
                      sx={{ 
                        width: 60, 
                        height: 60,
                        bgcolor: theme.palette.primary.main
                      }}
                    >
                      {gallery.organizer_artist.artist_name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {gallery.organizer_artist.artist_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Exhibition Organizer
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    component={Link}
                    to={`/artists/${gallery.organizer_artist.slug}`}
                    variant="outlined"
                    fullWidth
                    endIcon={<IconExternalLink size={16} />}
                    sx={{ textTransform: 'none' }}
                  >
                    View Profile
                  </Button>
                </Card>
              )}
            </Box>
          </Box>
        </Box>
      </Container>

      {/* Image Lightbox Dialog */}
      <Dialog
        open={imageDialog.open}
        onClose={handleCloseImageDialog}
        maxWidth={false}
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'rgba(0,0,0,0.95)',
            boxShadow: 'none',
            overflow: 'hidden',
            m: 0,
            maxWidth: '100vw',
            maxHeight: '100vh'
          }
        }}
      >
        <DialogContent sx={{ p: 0, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          {imageDialog.image && (
            <>
              <Box
                component="img"
                src={imageDialog.image.large || imageDialog.image.url}
                alt="Gallery Image"
                sx={{
                  maxWidth: '90vw',
                  maxHeight: '90vh',
                  objectFit: 'contain'
                }}
              />
              
              {/* Close Button */}
              <IconButton
                onClick={handleCloseImageDialog}
                sx={{
                  position: 'absolute',
                  top: 24,
                  right: 24,
                  bgcolor: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                }}
              >
                <IconX />
              </IconButton>

              {/* Navigation Buttons */}
              {gallery?.gallery_images && gallery.gallery_images.length > 1 && (
                <>
                  {currentImageIndex > 0 && (
                    <IconButton
                      onClick={handlePrevImage}
                      sx={{
                        position: 'absolute',
                        left: 24,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        bgcolor: 'rgba(255,255,255,0.1)',
                        color: 'white',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                      }}
                    >
                      <IconChevronLeft size={24} />
                    </IconButton>
                  )}
                  
                  {currentImageIndex < gallery.gallery_images.length - 1 && (
                    <IconButton
                      onClick={handleNextImage}
                      sx={{
                        position: 'absolute',
                        right: 24,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        bgcolor: 'rgba(255,255,255,0.1)',
                        color: 'white',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                      }}
                    >
                      <IconChevronRight size={24} />
                    </IconButton>
                  )}
                </>
              )}

              {/* Image Counter */}
              {gallery?.gallery_images && gallery.gallery_images.length > 1 && (
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 24,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    bgcolor: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    px: 2,
                    py: 1,
                    borderRadius: 2
                  }}
                >
                  <Typography variant="body2">
                    {currentImageIndex + 1} / {gallery.gallery_images.length}
                  </Typography>
                </Box>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Custom Styles */}
      <style>
        {`
          .gallery-bullet {
            width: 8px !important;
            height: 8px !important;
            background: rgba(0,0,0,0.3) !important;
            border-radius: 50% !important;
            margin: 0 4px !important;
            transition: all 0.3s ease !important;
          }
          .gallery-bullet-active {
            background: ${theme.palette.primary.main} !important;
            transform: scale(1.2) !important;
          }
        `}
      </style>
    </Box>
  );
};

export default GalleryDetail;