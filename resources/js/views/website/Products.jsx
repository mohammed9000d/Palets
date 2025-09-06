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
  IconPalette,
  IconShoppingCart,
  IconEye,
  IconHeart
} from '@tabler/icons-react';
import { publicProductsAPI } from '../../services/api';

const Products = () => {
  const theme = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchParams.get('search') || '');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
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

  // Load products - initial load or search
  const loadProducts = async (isLoadMore = false) => {
    try {
      const pageToLoad = isLoadMore ? currentPage + 1 : 1;
      
      if (isLoadMore) {
        setLoadingMore(true);
      } else if (debouncedSearchTerm && products.length > 0) {
        setSearchLoading(true);
      } else {
        setLoading(true);
      }

      const params = new URLSearchParams({
        page: pageToLoad,
        per_page: 8 // 8 products per page (2 rows of 4)
      });

      if (debouncedSearchTerm) {
        params.append('search', debouncedSearchTerm);
      }

      const response = await publicProductsAPI.getAll(Object.fromEntries(params));
      
      if (response.data) {
        const paginationData = response.data;
        const productsData = paginationData.data || [];
        
        if (isLoadMore) {
          // Append new products to existing list
          setProducts(prev => [...prev, ...productsData]);
          setCurrentPage(pageToLoad);
        } else {
          // Replace products list (new search or initial load)
          setProducts(productsData);
          setCurrentPage(1);
        }
        
        setTotalProducts(paginationData.total || 0);
        setTotalPages(paginationData.last_page || 1);
        setHasNextPage(paginationData.current_page < paginationData.last_page);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      if (!isLoadMore) {
        setProducts([]);
      }
    } finally {
      setLoading(false);
      setSearchLoading(false);
      setLoadingMore(false);
    }
  };

  // Load products on initial load and search term changes
  useEffect(() => {
    loadProducts();
  }, [debouncedSearchTerm]);

  // Load more products function
  const handleLoadMore = () => {
    if (hasNextPage && !loading && !loadingMore && !searchLoading) {
      loadProducts(true);
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
            Art Products
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
            Discover unique art pieces and creative products from talented artists
          </Typography>
        </Box>

        {/* Enhanced Search Bar */}
        <Box sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
          <TextField
            ref={searchInputRef}
            fullWidth
            variant="outlined"
            placeholder={`Search products... (Ctrl+K)`}
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
                  Found <strong>{totalProducts}</strong> product{totalProducts !== 1 ? 's' : ''} for "{debouncedSearchTerm}"
                </>
              ) : (
                <>
                  Showing <strong>{products.length}</strong> of <strong>{totalProducts}</strong> products
                </>
              )}
            </Typography>
          </Box>
        )}

        {/* Products Grid */}
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
            {[...Array(8)].map((_, index) => (
              <Box key={index}>
                <Card sx={{ height: 400, width: '100%' }}>
                  <Skeleton variant="rectangular" height={250} />
                  <CardContent>
                    <Skeleton variant="text" height={28} sx={{ mb: 1 }} />
                    <Skeleton variant="text" height={20} sx={{ mb: 2 }} />
                    <Skeleton variant="text" height={24} />
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        ) : products.length > 0 ? (
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)', // 2 columns on mobile
              sm: 'repeat(3, 1fr)', // 3 columns on small tablets
              md: 'repeat(4, 1fr)'  // 4 columns on desktop and up
            },
            gap: 3
          }}>
            {products.map((product, index) => (
              <Box key={product.id}>
                <Fade in timeout={600 + index * 100}>
                  <Card
                    component={Link}
                    to={`/products/${product.slug}`}
                    sx={{
                      height: 400, // Fixed height for all cards
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
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="div"
                        sx={{
                          height: 250,
                          background: product.cover_photo_url
                            ? `url(${product.cover_photo_url})`
                            : `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}
                      />
                      
                      {/* Stock Badge */}
                      <Box sx={{ position: 'absolute', top: 12, left: 12 }}>
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
                            bottom: 12,
                            right: 12,
                            bgcolor: 'rgba(0,0,0,0.8)',
                            color: 'white',
                            px: 2,
                            py: 0.5,
                            borderRadius: 2,
                            fontWeight: 700,
                            fontSize: '1.1rem'
                          }}
                        >
                          ${product.price}
                        </Box>
                      )}
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
                          {product.main_title}
                        </Typography>

                        {product.sub_title && (
                          <Typography
                            variant="body2"
                            sx={{
                              color: theme.palette.text.secondary,
                              display: '-webkit-box',
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              mb: 1
                            }}
                          >
                            {product.sub_title}
                          </Typography>
                        )}

                        {product.artist && (
                          <Typography
                            variant="body2"
                            sx={{
                              color: theme.palette.primary.main,
                              fontWeight: 600,
                              fontSize: '0.875rem'
                            }}
                          >
                            by {product.artist.artist_name}
                          </Typography>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Fade>
              </Box>
            ))}
          </Box>
        ) : (
          <Box textAlign="center" py={8}>
            <IconPalette size={64} color={theme.palette.text.secondary} />
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              {debouncedSearchTerm ? 'No Products Found' : 'No Products Available'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
              {debouncedSearchTerm 
                ? `No products match "${debouncedSearchTerm}". Try using different keywords or check your spelling.`
                : 'No products available at the moment. Check back later for new items.'
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
        {!loading && products.length > 0 && hasNextPage && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleLoadMore}
              disabled={loadingMore}
              startIcon={loadingMore ? <CircularProgress size={20} color="inherit" /> : <IconShoppingCart size={20} />}
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
              {loadingMore ? 'Loading More Products...' : `Load More Products (${totalProducts - products.length} remaining)`}
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Products;
