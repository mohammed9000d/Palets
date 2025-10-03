import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useLoading } from '../../contexts/LoadingContext';
import {
  Box,
  Typography,
  Button,
  Container,
  Card,
  CardContent,
  CardMedia,
  Avatar,
  Chip,
  Stack,
  IconButton,
  Paper,
  Skeleton,
  Fade,
  Slide,
  useTheme,
  alpha,
  Tabs,
  Tab,
  Divider,
  Tooltip
} from '@mui/material';
import {
  IconArrowRight,
  IconCalendar,
  IconMapPin,
  IconUsers,
  IconEye,
  IconPalette,
  IconSortDescending,
  IconChevronLeft,
  IconChevronRight,
  IconClock,
  IconHistory,
  IconSparkles
} from '@tabler/icons-react';
import axios from 'axios';
import configService from 'services/configService';

const API_BASE_URL = '/api';

const Galleries = () => {
  const theme = useTheme();
  const { markContentReady } = useLoading();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State management
  const [upcomingGalleries, setUpcomingGalleries] = useState([]);
  const [archivedGalleries, setArchivedGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [configReady, setConfigReady] = useState(false);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'upcoming');
  const [currentPage, setCurrentPage] = useState({
    upcoming: parseInt(searchParams.get('upcoming_page')) || 1,
    archived: parseInt(searchParams.get('archived_page')) || 1
  });
  const [pagination, setPagination] = useState({
    upcoming: { current_page: 1, last_page: 1, total: 0 },
    archived: { current_page: 1, last_page: 1, total: 0 }
  });

  // Initialize config service
  useEffect(() => {
    const initConfig = async () => {
      try {
        await configService.initialize();
        setConfigReady(true);
      } catch (error) {
        console.error('Failed to initialize config in Galleries:', error);
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

  // Load galleries data
  useEffect(() => {
    if (configReady) {
      loadGalleries();
    }
  }, [configReady, activeTab, currentPage]);

  // Update URL params when state changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (activeTab !== 'upcoming') params.set('tab', activeTab);
    if (currentPage.upcoming !== 1) params.set('upcoming_page', currentPage.upcoming);
    if (currentPage.archived !== 1) params.set('archived_page', currentPage.archived);
    
    setSearchParams(params);
  }, [activeTab, currentPage, setSearchParams]);

  const loadGalleries = async () => {
    try {
      setLoading(true);
      
      const loadUpcoming = async () => {
        const params = {
          period: 'upcoming',
          status: 'published',
          per_page: 12,
          page: currentPage.upcoming,
          sort_by: 'start_date',
          sort_direction: 'asc'
        };
        
        const response = await axios.get(getApiUrl('public/art-panel-galleries'), { params });
        setUpcomingGalleries(response.data.data || []);
        setPagination(prev => ({
          ...prev,
          upcoming: {
            current_page: response.data.current_page || 1,
            last_page: response.data.last_page || 1,
            total: response.data.total || 0
          }
        }));
      };

      const loadArchived = async () => {
        const params = {
          period: 'past',
          status: 'published',
          per_page: 12,
          page: currentPage.archived,
          sort_by: 'start_date',
          sort_direction: 'desc'
        };
        
        const response = await axios.get(getApiUrl('public/art-panel-galleries'), { params });
        setArchivedGalleries(response.data.data || []);
        setPagination(prev => ({
          ...prev,
          archived: {
            current_page: response.data.current_page || 1,
            last_page: response.data.last_page || 1,
            total: response.data.total || 0
          }
        }));
      };

      // Load both sections
      await Promise.all([loadUpcoming(), loadArchived()]);
      
      // Signal content ready
      setTimeout(() => {
        markContentReady('galleries-page');
      }, 100);
      
    } catch (error) {
      console.error('Error loading galleries:', error);
      setTimeout(() => {
        markContentReady('galleries-page');
      }, 100);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };


  const handlePageChange = (type, page) => {
    setCurrentPage(prev => ({
      ...prev,
      [type]: page
    }));
  };

  // Gallery Card Component
  const GalleryCard = ({ gallery, index }) => (
    <Slide direction="up" in timeout={600 + index * 100} key={gallery.id}>
      <Card 
        component={Link}
        to={`/galleries/${gallery.slug}`}
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          transition: 'all 0.3s ease',
          textDecoration: 'none',
          cursor: 'pointer',
          '&:hover': { 
            transform: 'translateY(-8px)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
            textDecoration: 'none'
          }
        }}
      >
          <Box sx={{ position: 'relative', overflow: 'hidden' }}>
            <CardMedia
              component="div"
              sx={{
                height: 280,
                background: gallery.cover_image_url 
                  ? `url(${gallery.cover_image_url})`
                  : `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transition: 'transform 0.3s ease',
                '&:hover': { transform: 'scale(1.05)' }
              }}
            />
            
            {/* Status Badge */}
            <Box
              sx={{
                position: 'absolute',
                top: 16,
                left: 16,
                bgcolor: gallery.is_upcoming 
                  ? theme.palette.primary.main
                  : theme.palette.secondary.main,
                color: 'white',
                p: 1,
                borderRadius: 2,
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}
            >
              {gallery.is_upcoming ? <IconSparkles size={16} color="white" /> : <IconHistory size={16} color="white" />}
              <Typography variant="caption" fontWeight={600} sx={{ color: 'white' }}>
                {gallery.is_upcoming ? 'Upcoming' : 'Past Exhibition'}
              </Typography>
            </Box>

            {/* Duration Badge */}
            <Chip
              label={`${gallery.duration} days`}
              size="small"
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                bgcolor: alpha('#000', 0.7),
                color: 'white',
                fontWeight: 600
              }}
            />
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
                {gallery.main_title}
              </Typography>
              
              {gallery.sub_title && (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                    mb: 1.5,
                    fontSize: '0.875rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {gallery.sub_title}
                </Typography>
              )}

              {gallery.overview && (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: theme.palette.text.secondary,
                    mb: 2,
                    lineHeight: 1.5,
                    fontSize: '0.875rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {gallery.overview}
                </Typography>
              )}
            </Box>
            
            {/* Gallery Info */}
            <Box>
              <Stack spacing={1} mb={2}>
                <Box display="flex" alignItems="center" gap={1}>
                  <IconCalendar size={16} color={theme.palette.text.secondary} />
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    {gallery.date_period}
                  </Typography>
                </Box>
                
                {gallery.location && (
                  <Box display="flex" alignItems="center" gap={1}>
                    <IconMapPin size={16} color={theme.palette.text.secondary} />
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      {gallery.location}
                    </Typography>
                  </Box>
                )}
                
                <Box display="flex" alignItems="center" gap={1}>
                  <IconUsers size={16} color={theme.palette.text.secondary} />
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    {gallery.participating_artists_count} Featured Artists
                  </Typography>
                </Box>
              </Stack>

              {/* Organizer */}
              {gallery.organizer_artist && (
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="caption" color="text.secondary">
                      Organized by
                    </Typography>
                    <Chip 
                      label={gallery.organizer_artist.artist_name} 
                      size="small" 
                      variant="outlined"
                      color="primary"
                      sx={{ fontSize: '0.75rem' }}
                    />
                  </Box>
                  <IconArrowRight size={16} color={theme.palette.primary.main} />
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
    </Slide>
  );

  // Loading Skeleton
  const LoadingSkeleton = () => (
    <Box 
      sx={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 4,
        '@media (max-width: 900px)': {
          gridTemplateColumns: 'repeat(2, 1fr)',
        },
        '@media (max-width: 600px)': {
          gridTemplateColumns: '1fr',
        }
      }}
    >
      {[...Array(6)].map((_, index) => (
        <Card key={index} sx={{ height: 520 }}>
          <Skeleton variant="rectangular" height={280} />
          <CardContent>
            <Skeleton variant="text" height={30} />
            <Skeleton variant="text" height={20} />
            <Skeleton variant="text" height={60} />
            <Box mt={2}>
              <Skeleton variant="text" height={20} />
              <Skeleton variant="text" height={20} />
              <Skeleton variant="text" height={20} />
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );

  // Pagination Component
  const PaginationControls = ({ type }) => {
    const paginationData = pagination[type];
    const currentPageData = currentPage[type];
    
    if (paginationData.last_page <= 1) return null;

    return (
      <Box display="flex" justifyContent="center" alignItems="center" gap={2} mt={4}>
        <IconButton
          onClick={() => handlePageChange(type, currentPageData - 1)}
          disabled={currentPageData <= 1}
          sx={{
            bgcolor: theme.palette.primary.main,
            color: 'white',
            '&:hover': { bgcolor: theme.palette.primary.dark },
            '&:disabled': { bgcolor: 'grey.300', color: 'grey.500' }
          }}
        >
          <IconChevronLeft />
        </IconButton>
        
        <Typography variant="body2" color="text.secondary">
          Page {currentPageData} of {paginationData.last_page}
        </Typography>
        
        <IconButton
          onClick={() => handlePageChange(type, currentPageData + 1)}
          disabled={currentPageData >= paginationData.last_page}
          sx={{
            bgcolor: theme.palette.primary.main,
            color: 'white',
            '&:hover': { bgcolor: theme.palette.primary.dark },
            '&:disabled': { bgcolor: 'grey.300', color: 'grey.500' }
          }}
        >
          <IconChevronRight />
        </IconButton>
      </Box>
    );
  };

  return (
    <Box>
       {/* Hero Section */}
       <Box 
         sx={{ 
           background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
           color: 'white',
           py: { xs: 8, md: 12 },
           position: 'relative',
           overflow: 'hidden',
           '&::before': {
             content: '""',
             position: 'absolute',
             top: 0,
             left: 0,
             right: 0,
             bottom: 0,
             background: `radial-gradient(circle at 30% 70%, ${alpha(theme.palette.primary.dark, 0.3)} 0%, transparent 50%),
                         radial-gradient(circle at 70% 30%, ${alpha(theme.palette.secondary.dark, 0.3)} 0%, transparent 50%)`,
             zIndex: 1
           },
           '&::after': {
             content: '""',
             position: 'absolute',
             top: 0,
             left: 0,
             right: 0,
             bottom: 0,
             background: 'rgba(0,0,0,0.1)',
             zIndex: 2
           }
         }}
       >
         <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 3 }}>
           <Fade in timeout={800}>
             <Box textAlign="center">
               <Typography 
                 variant="overline" 
                 sx={{ 
                   color: 'rgba(255,255,255,0.9)',
                   fontWeight: 700,
                   letterSpacing: 3,
                   fontSize: '0.875rem',
                   textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
                 }}
               >
                 ART PANEL EXHIBITIONS
               </Typography>
               <Typography 
                 variant="h1" 
                 component="h1" 
                 sx={{ 
                   fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                   fontWeight: 800,
                   mb: 2,
                   mt: 1,
                   color: 'white',
                   textShadow: '2px 2px 8px rgba(0,0,0,0.4)',
                   lineHeight: 1.1
                 }}
               >
                 Gallery Exhibitions
               </Typography>
               <Typography 
                 variant="h5" 
                 sx={{ 
                   fontWeight: 400,
                   maxWidth: 700,
                   mx: 'auto',
                   color: 'rgba(255,255,255,0.95)',
                   textShadow: '1px 1px 3px rgba(0,0,0,0.4)',
                   lineHeight: 1.5,
                   fontSize: { xs: '1.1rem', md: '1.25rem' }
                 }}
               >
                 Discover extraordinary art exhibitions featuring works from talented artists around the world
               </Typography>
             </Box>
           </Fade>
         </Container>
       </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                minHeight: 60
              }
            }}
          >
            <Tab 
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <IconSparkles size={20} />
                  <span>Upcoming Exhibitions</span>
                  {pagination.upcoming.total > 0 && (
                    <Chip 
                      label={pagination.upcoming.total} 
                      size="small" 
                      color="primary"
                      sx={{ ml: 1 }}
                    />
                  )}
                </Box>
              } 
              value="upcoming" 
            />
            <Tab 
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <IconHistory size={20} />
                  <span>Past Exhibitions</span>
                  {pagination.archived.total > 0 && (
                    <Chip 
                      label={pagination.archived.total} 
                      size="small" 
                      color="secondary"
                      sx={{ ml: 1 }}
                    />
                  )}
                </Box>
              } 
              value="archived" 
            />
          </Tabs>
        </Box>

        {/* Content Sections */}
        {activeTab === 'upcoming' && (
          <Box>
            {loading ? (
              <LoadingSkeleton />
            ) : upcomingGalleries.length > 0 ? (
              <>
                <Box 
                  sx={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 4,
                    '@media (max-width: 900px)': {
                      gridTemplateColumns: 'repeat(2, 1fr)',
                    },
                    '@media (max-width: 600px)': {
                      gridTemplateColumns: '1fr',
                    }
                  }}
                >
                  {upcomingGalleries.map((gallery, index) => (
                    <GalleryCard key={gallery.id} gallery={gallery} index={index} />
                  ))}
                </Box>
                <PaginationControls type="upcoming" />
              </>
            ) : (
              <Paper 
                sx={{ 
                  p: 8, 
                  textAlign: 'center', 
                  borderRadius: 3,
                  background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)'
                }}
              >
                <IconSparkles size={64} style={{ opacity: 0.3, marginBottom: 16 }} />
                <Typography variant="h5" color="textSecondary" gutterBottom>
                  No Upcoming Exhibitions
                </Typography>
                <Typography variant="body1" color="textSecondary" mb={3}>
                  {searchTerm 
                    ? 'No exhibitions match your search criteria. Try adjusting your search terms.'
                    : 'There are currently no upcoming exhibitions scheduled. Check back soon for new announcements!'
                  }
                </Typography>
                {searchTerm && (
                  <Button 
                    variant="outlined" 
                    onClick={() => setSearchTerm('')}
                    sx={{ mr: 2 }}
                  >
                    Clear Search
                  </Button>
                )}
                <Button 
                  variant="contained" 
                  onClick={() => setActiveTab('archived')}
                >
                  View Past Exhibitions
                </Button>
              </Paper>
            )}
          </Box>
        )}

        {activeTab === 'archived' && (
          <Box>
            {loading ? (
              <LoadingSkeleton />
            ) : archivedGalleries.length > 0 ? (
              <>
                <Box 
                  sx={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 4,
                    '@media (max-width: 900px)': {
                      gridTemplateColumns: 'repeat(2, 1fr)',
                    },
                    '@media (max-width: 600px)': {
                      gridTemplateColumns: '1fr',
                    }
                  }}
                >
                  {archivedGalleries.map((gallery, index) => (
                    <GalleryCard key={gallery.id} gallery={gallery} index={index} />
                  ))}
                </Box>
                <PaginationControls type="archived" />
              </>
            ) : (
              <Paper 
                sx={{ 
                  p: 8, 
                  textAlign: 'center', 
                  borderRadius: 3,
                  background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)'
                }}
              >
                <IconHistory size={64} style={{ opacity: 0.3, marginBottom: 16 }} />
                <Typography variant="h5" color="textSecondary" gutterBottom>
                  No Past Exhibitions
                </Typography>
                <Typography variant="body1" color="textSecondary" mb={3}>
                  {searchTerm 
                    ? 'No past exhibitions match your search criteria. Try adjusting your search terms.'
                    : 'There are no past exhibitions to display yet.'
                  }
                </Typography>
                {searchTerm && (
                  <Button 
                    variant="outlined" 
                    onClick={() => setSearchTerm('')}
                    sx={{ mr: 2 }}
                  >
                    Clear Search
                  </Button>
                )}
                <Button 
                  variant="contained" 
                  onClick={() => setActiveTab('upcoming')}
                >
                  View Upcoming Exhibitions
                </Button>
              </Paper>
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Galleries;
