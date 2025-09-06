import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  Skeleton,
  Chip,
  Fade,
  useTheme,
  alpha
} from '@mui/material';
import {
  IconSearch,
  IconX,
  IconNews,
  IconCalendar,
  IconUser,
  IconArrowRight,
  IconShoppingCart
} from '@tabler/icons-react';
import { publicNewsAPI } from '../../services/api';

const Articles = () => {
  const theme = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchParams.get('search') || '');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalArticles, setTotalArticles] = useState(0);
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

  // Load articles - initial load or search
  const loadArticles = async (isLoadMore = false) => {
    try {
      const pageToLoad = isLoadMore ? currentPage + 1 : 1;
      
      if (isLoadMore) {
        setLoadingMore(true);
      } else if (debouncedSearchTerm && articles.length > 0) {
        setSearchLoading(true);
      } else {
        setLoading(true);
      }

      const params = new URLSearchParams({
        page: pageToLoad,
        per_page: 8 // 8 articles per page (4 rows of 2)
      });

      if (debouncedSearchTerm) {
        params.append('search', debouncedSearchTerm);
      }

      const response = await publicNewsAPI.getAll(Object.fromEntries(params));
      
      if (response.data) {
        const paginationData = response.data;
        const articlesData = paginationData.data || [];
        
        if (isLoadMore) {
          // Append new articles to existing list
          setArticles(prev => [...prev, ...articlesData]);
          setCurrentPage(pageToLoad);
        } else {
          // Replace articles list (new search or initial load)
          setArticles(articlesData);
          setCurrentPage(1);
        }
        
        setTotalArticles(paginationData.total || 0);
        setTotalPages(paginationData.last_page || 1);
        setHasNextPage(paginationData.current_page < paginationData.last_page);
      }
    } catch (error) {
      console.error('Error loading articles:', error);
      if (!isLoadMore) {
        setArticles([]);
      }
    } finally {
      setLoading(false);
      setSearchLoading(false);
      setLoadingMore(false);
    }
  };

  // Load articles on initial load and search term changes
  useEffect(() => {
    loadArticles();
  }, [debouncedSearchTerm]);

  // Load more articles function
  const handleLoadMore = () => {
    if (hasNextPage && !loading && !loadingMore && !searchLoading) {
      loadArticles(true);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    const baseUrl = '';
    return `${baseUrl}/storage/${imagePath}`;
  };

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
            Art News & Stories
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
            Discover the latest news, exhibitions, and stories from the art world
          </Typography>
        </Box>

        {/* Enhanced Search Bar */}
        <Box sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
          <TextField
            ref={searchInputRef}
            fullWidth
            variant="outlined"
            placeholder={`Search articles... (Ctrl+K)`}
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
                  Found <strong>{totalArticles}</strong> article{totalArticles !== 1 ? 's' : ''} for "{debouncedSearchTerm}"
                </>
              ) : (
                <>
                  Showing <strong>{articles.length}</strong> of <strong>{totalArticles}</strong> articles
                </>
              )}
            </Typography>
          </Box>
        )}

        {/* Articles Grid */}
        {loading ? (
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: {
              xs: '1fr', // 1 column on mobile
              md: 'repeat(2, 1fr)'  // 2 columns on desktop
            },
            gap: 3
          }}>
            {[...Array(12)].map((_, index) => (
              <Box key={index}>
                <Card sx={{ height: 420 }}>
                  <Skeleton variant="rectangular" height={240} />
                  <CardContent>
                    <Skeleton variant="text" height={30} />
                    <Skeleton variant="text" height={20} />
                    <Skeleton variant="text" height={60} />
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        ) : articles.length > 0 ? (
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: {
              xs: '1fr', // 1 column on mobile
              md: 'repeat(2, 1fr)'  // 2 columns on desktop
            },
            gap: 3
          }}>
            {articles.map((article, index) => (
              <Box key={article.id}>
                <Fade in timeout={600 + index * 100}>
                  <Card
                    component={Link}
                    to={`/articles/${article.id}`}
                    sx={{
                      height: 420,
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
                    <CardMedia
                      component="div"
                      sx={{
                        height: 240,
                        background: article.cover_photo
                          ? `url(${getImageUrl(article.cover_photo)})`
                          : `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'flex-start'
                      }}
                    >
                      {/* Date Badge */}
                      <Box sx={{ position: 'absolute', top: 12, left: 12 }}>
                        <Chip
                          label={formatDate(article.created_at)}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(0,0,0,0.8)',
                            color: 'white',
                            fontWeight: 600
                          }}
                        />
                      </Box>
                    </CardMedia>

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
                          sx={{
                            fontWeight: 700,
                            mb: 1,
                            color: theme.palette.text.primary,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            lineHeight: 1.3
                          }}
                        >
                          {article.main_title}
                        </Typography>

                        {article.sub_title && (
                          <Typography
                            variant="body2"
                            sx={{
                              color: theme.palette.text.secondary,
                              mb: 2,
                              display: '-webkit-box',
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}
                          >
                            {article.sub_title}
                          </Typography>
                        )}

                        <Typography
                          variant="body2"
                          sx={{
                            color: theme.palette.text.secondary,
                            mb: 3,
                            flexGrow: 1,
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            lineHeight: 1.5
                          }}
                        >
                          {article.description}
                        </Typography>
                      </Box>

                      {/* Bottom Content */}
                      <Box sx={{ mt: 'auto' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconUser size={16} color={theme.palette.text.secondary} />
                            <Typography variant="caption" color="text.secondary">
                              {article.author_name}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconCalendar size={16} color={theme.palette.text.secondary} />
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(article.created_at)}
                            </Typography>
                          </Box>
                        </Box>

                        <Button
                          endIcon={<IconArrowRight size={16} />}
                          sx={{
                            color: theme.palette.primary.main,
                            fontWeight: 600,
                            textTransform: 'none',
                            p: 0,
                            minWidth: 'auto',
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
                          Read More
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Fade>
              </Box>
            ))}
          </Box>
        ) : (
          <Box textAlign="center" py={8}>
            <IconNews size={64} color={theme.palette.text.secondary} />
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              {debouncedSearchTerm ? 'No Articles Found' : 'No Articles Available'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
              {debouncedSearchTerm 
                ? `No articles match "${debouncedSearchTerm}". Try using different keywords or check your spelling.`
                : 'No articles available at the moment. Check back later for new content.'
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
                    setSearchTerm('art');
                    setDebouncedSearchTerm('art');
                  }}
                  sx={{ textTransform: 'none' }}
                >
                  Try "art"
                </Button>
              </Box>
            )}
          </Box>
        )}

        {/* Load More Button */}
        {!loading && articles.length > 0 && hasNextPage && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleLoadMore}
              disabled={loadingMore}
              startIcon={loadingMore ? <CircularProgress size={20} color="inherit" /> : <IconNews size={20} />}
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
              {loadingMore ? 'Loading More Articles...' : `Load More Articles (${totalArticles - articles.length} remaining)`}
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Articles;