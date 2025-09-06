import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  TextField,
  InputAdornment,

  Skeleton,
  Fade,
  Slide,
  useTheme,
  alpha,
  CircularProgress,
  IconButton,
  Stack
} from '@mui/material';
import {
  IconSearch,
  IconUser,
  IconArrowRight,
  IconPalette,
  IconX,
  IconMail,
  IconPhone,
  IconWorld,
  IconBrandInstagram,
  IconBrandFacebook,
  IconBrandTwitter,
  IconBrandLinkedin
} from '@tabler/icons-react';
import { publicArtistsAPI } from '../../services/api';




const Artists = () => {
  const theme = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchParams.get('search') || '');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalArtists, setTotalArtists] = useState(0);
  const debounceTimer = useRef(null);
  const searchInputRef = useRef(null);

  // Debounce search term
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchTerm]);

  // Load artists - initial load or search
  const loadArtists = async (isLoadMore = false) => {
    try {
      const pageToLoad = isLoadMore ? currentPage + 1 : 1;
      
      if (isLoadMore) {
        setLoadingMore(true);
      } else if (debouncedSearchTerm && artists.length > 0) {
        setSearchLoading(true);
      } else {
        setLoading(true);
      }

      const params = new URLSearchParams({
        page: pageToLoad,
        per_page: 8 // 8 artists per page (2 rows of 4)
      });

      if (debouncedSearchTerm) {
        params.append('search', debouncedSearchTerm);
      }

      const response = await publicArtistsAPI.getAll(Object.fromEntries(params));
      
      if (response.data) {
        const paginationData = response.data;
        const artistsData = paginationData.data || [];
        
        if (isLoadMore) {
          // Append new artists to existing list
          setArtists(prev => [...prev, ...artistsData]);
          setCurrentPage(pageToLoad);
        } else {
          // Replace artists list (new search or initial load)
          setArtists(artistsData);
          setCurrentPage(1);
        }
        

        
        setTotalArtists(paginationData.total || 0);
        setTotalPages(paginationData.last_page || 1);
        setHasNextPage(paginationData.current_page < paginationData.last_page);
      }
    } catch (error) {
      console.error('Error loading artists:', error);
      if (!isLoadMore) {
        setArtists([]);
      }
    } finally {
      setLoading(false);
      setSearchLoading(false);
      setLoadingMore(false);
    }
  };

  // Load artists on initial load and search term changes
  useEffect(() => {
    loadArtists();
  }, [debouncedSearchTerm]);

  // Load more artists function
  const handleLoadMore = () => {
    if (hasNextPage && !loading && !loadingMore && !searchLoading) {
      loadArtists(true);
    }
  };

  // Update URL when search term changes
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (debouncedSearchTerm) {
      params.set('search', debouncedSearchTerm);
    }
    
    setSearchParams(params);
  }, [debouncedSearchTerm]);

  // Keyboard shortcut for search focus
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        focusSearch();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleClearSearch = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
  };

  const focusSearch = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
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

  // Artists Grid
  const ArtistsGrid = () => (
    <Box>


      {loading ? (
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)', // 2 columns on mobile
            sm: 'repeat(3, 1fr)', // 3 columns on small tablets
            md: 'repeat(4, 1fr)'  // 4 columns on desktop and up
          },
          gap: 3
        }}>
          {[...Array(12)].map((_, index) => (
            <Box key={index}>
              <Card sx={{ height: 350, width: '100%' }}>
                <Box sx={{ p: 3, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  {/* Top Section */}
                  <Box>
                    <Skeleton variant="circular" width={100} height={100} sx={{ mx: 'auto', mb: 2 }} />
                    <Skeleton variant="text" height={28} sx={{ mb: 1 }} />
                    <Skeleton variant="text" height={20} sx={{ mb: 2 }} />
                  </Box>
                  
                  {/* Bottom Section */}
                  <Box>
                    <Skeleton variant="rectangular" height={32} sx={{ mb: 2, mx: 'auto', width: 120 }} />
                    <Skeleton variant="text" height={36} sx={{ mx: 'auto', width: 100 }} />
                  </Box>
                </Box>
              </Card>
            </Box>
          ))}
        </Box>
      ) : artists.length > 0 ? (
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)', // 2 columns on mobile
            sm: 'repeat(3, 1fr)', // 3 columns on small tablets
            md: 'repeat(4, 1fr)'  // 4 columns on desktop and up
          },
          gap: 3
        }}>
          {artists.map((artist, index) => (
            <Box key={artist.id}>
              <Slide direction="up" in timeout={600 + index * 100}>
                <Card
                  component={Link}
                  to={`/artists/${artist.slug}`}
                  sx={{
                    height: 350, // Fixed height for all cards
                    width: '100%', // Full width of grid item
                    display: 'flex',
                    flexDirection: 'column',
                    textDecoration: 'none',
                    borderRadius: 3,
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                      textDecoration: 'none'
                    }
                  }}
                >
                  <CardContent sx={{ 
                    flexGrow: 1, 
                    p: 3, 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    height: '100%', // Full height
                    justifyContent: 'space-between' // Distribute content evenly
                  }}>
                    {/* Top Section - Avatar and Basic Info */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                      {/* Artist Avatar */}
                      <Avatar
                        src={artist.avatar_thumb_url}
                        sx={{ 
                          width: 100, 
                          height: 100, 
                          mb: 2,
                          border: `3px solid ${theme.palette.primary.main}`,
                          boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                        }}
                      >
                        <IconPalette size={35} />
                      </Avatar>

                      {/* Artist Name */}
                      <Typography
                        variant="h6"
                        component="h3"
                        sx={{
                          fontWeight: 700,
                          mb: 1,
                          color: theme.palette.text.primary,
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          minHeight: '1.5em', // Consistent height
                          fontSize: '1.1rem'
                        }}
                      >
                        {artist.artist_name}
                      </Typography>

                      {/* Specialties */}
                      <Typography
                        variant="body2"
                        sx={{
                          color: theme.palette.primary.main,
                          fontWeight: 600,
                          mb: 2,
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          minHeight: '1.2em', // Consistent height
                          fontSize: '0.875rem'
                        }}
                      >
                        {artist.specialties ? artist.specialties.split(',')[0]?.trim() : 'Artist'}
                      </Typography>
                    </Box>

                    {/* Bottom Section - Social Links and Button */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                      {/* Social Links */}
                      {artist.social_links && Object.keys(artist.social_links).length > 0 ? (
                        <Stack direction="row" spacing={1} sx={{ mb: 2, minHeight: '32px', alignItems: 'center' }}>
                          {Object.entries(artist.social_links).slice(0, 3).map(([platform, url]) => {
                            const IconComponent = getSocialIcon(platform);
                            return url ? (
                              <IconButton
                                key={platform}
                                size="small"
                                onClick={(e) => {
                                  e.preventDefault();
                                  window.open(url, '_blank');
                                }}
                                sx={{
                                  color: theme.palette.text.secondary,
                                  '&:hover': { color: theme.palette.primary.main },
                                  width: 28,
                                  height: 28
                                }}
                              >
                                <IconComponent size={14} />
                              </IconButton>
                            ) : null;
                          })}
                        </Stack>
                      ) : (
                        <Box sx={{ minHeight: '32px', mb: 2 }} /> // Placeholder for consistent spacing
                      )}

                      {/* View Profile Button */}
                      <Button
                        endIcon={<IconArrowRight size={16} />}
                        sx={{
                          color: theme.palette.primary.main,
                          fontWeight: 600,
                          textTransform: 'none',
                          fontSize: '0.875rem',
                          minHeight: '36px', // Consistent button height
                          '&:hover': {
                            bgcolor: 'transparent',
                            '& .MuiButton-endIcon': {
                              transform: 'translateX(4px)'
                            }
                          },
                          '& .MuiButton-endIcon': {
                            transition: 'transform 0.2s ease'
                          }
                        }}
                      >
                        View Profile
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Slide>
            </Box>
          ))}
        </Box>
      ) : (
        <Box textAlign="center" py={8}>
          <IconPalette size={64} color={theme.palette.text.secondary} />
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
            {debouncedSearchTerm ? 'No Artists Found' : 'No Artists Available'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
            {debouncedSearchTerm 
              ? `No artists match "${debouncedSearchTerm}". Try using different keywords or check your spelling.`
              : 'No artists available at the moment. Check back later for new talent.'
            }
          </Typography>
          {debouncedSearchTerm && (
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                onClick={handleClearSearch}
                startIcon={<IconX size={16} />}
                sx={{ textTransform: 'none' }}
              >
                Clear Search
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  setSearchTerm('painting');
                  setDebouncedSearchTerm('painting');
                }}
                sx={{ textTransform: 'none' }}
              >
                Try "painting"
              </Button>
            </Box>
          )}
        </Box>
      )}

      {/* Load More Button */}
      {!loading && artists.length > 0 && hasNextPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleLoadMore}
            disabled={loadingMore}
            startIcon={loadingMore ? <CircularProgress size={20} color="inherit" /> : null}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 3,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              '&:hover': {
                boxShadow: '0 6px 25px rgba(0,0,0,0.15)',
                transform: 'translateY(-2px)'
              },
              '&:disabled': {
                transform: 'none'
              },
              transition: 'all 0.3s ease'
            }}
          >
            {loadingMore ? 'Loading More Artists...' : `Load More Artists (${totalArtists - artists.length} remaining)`}
          </Button>
        </Box>
      )}
    </Box>
  );

  return (
    <Box>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 800,
              mb: 2,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '2.5rem', md: '3.5rem' }
            }}
          >
            Featured Artists
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: theme.palette.text.secondary,
              maxWidth: 600,
              mx: 'auto',
              lineHeight: 1.6
            }}
          >
            Discover talented artists and their unique creative journeys
          </Typography>
        </Box>

        {/* Enhanced Search Bar */}
        <Box sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
          <TextField
            ref={searchInputRef}
            fullWidth
            variant="outlined"
            placeholder={`Search artists... (Ctrl+K)`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconSearch size={20} color={theme.palette.text.secondary} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  {searchLoading && <CircularProgress size={20} />}
                  {searchTerm && !searchLoading && (
                    <IconButton
                      size="small"
                      onClick={handleClearSearch}
                      sx={{ color: theme.palette.text.secondary }}
                    >
                      <IconX size={16} />
                    </IconButton>
                  )}
                </InputAdornment>
              ),
              sx: {
                borderRadius: 3,
                bgcolor: alpha(theme.palette.background.paper, 0.8),
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: alpha(theme.palette.primary.main, 0.2)
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: alpha(theme.palette.primary.main, 0.4)
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.primary.main
                }
              }
            }}
          />
        </Box>

        {/* Results Info */}
        {!loading && (
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {debouncedSearchTerm ? (
                <>
                  Found <strong>{totalArtists}</strong> artist{totalArtists !== 1 ? 's' : ''} for "{debouncedSearchTerm}"
                </>
              ) : (
                <>
                  Showing <strong>{artists.length}</strong> of <strong>{totalArtists}</strong> artists
                </>
              )}
            </Typography>
          </Box>
        )}

        <ArtistsGrid />
      </Container>
    </Box>
  );
};

export default Artists;
