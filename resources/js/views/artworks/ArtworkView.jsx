import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Grid,
  Alert,
  CircularProgress,
  IconButton,
  Chip,
  Card,
  CardMedia,
  Fade,
  useTheme,
  alpha,
  Divider
} from '@mui/material';
import { 
  IconArrowLeft, 
  IconEdit,
  IconPhoto,
  IconPalette,
  IconCurrencyDollar,
  IconCalendar,
  IconRuler,
  IconUser,
  IconStar,
  IconTag
} from '@tabler/icons-react';
import { artworksAPI } from '../../services/api';
import MainCard from '../../ui-component/cards/MainCard';
import { getImageUrl } from '../../utils/imageHelper';

const ArtworkView = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const theme = useTheme();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [artwork, setArtwork] = useState(null);

  // Load artwork data
  useEffect(() => {
    if (slug) {
      loadArtwork();
    }
  }, [slug]);

  const loadArtwork = async () => {
    setLoading(true);
    try {
      const response = await artworksAPI.getBySlug(slug);
      // Handle different possible response structures
      const artworkData = response.data.work || response.data.artwork || response.data;
      setArtwork(artworkData);
      setError('');
    } catch (err) {
      setError('Failed to load artwork data');
      console.error('Error loading artwork:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/admin/artworks/edit/${slug}`);
  };

  if (loading) {
    return (
      <MainCard>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </MainCard>
    );
  }

  if (!artwork) {
    return (
      <MainCard>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography variant="h6" color="text.secondary">
            Artwork not found
          </Typography>
        </Box>
      </MainCard>
    );
  }

  return (
    <Fade in={true}>
      <Box sx={{ 
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
        pb: 4
      }}>
        {/* Modern Header Section */}
        <Box 
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white',
            p: 4,
            mb: 4,
            borderRadius: '0 0 24px 24px',
            boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={2}>
              <IconButton 
                onClick={() => navigate('/admin/artworks')} 
                sx={{ 
                  color: 'white',
                  backgroundColor: alpha('#fff', 0.1),
                  '&:hover': { backgroundColor: alpha('#fff', 0.2) }
                }}
              >
                <IconArrowLeft />
              </IconButton>
              <Box>
                <Typography variant="h3" fontWeight={700} color="white">
                  Artwork Details
                </Typography>
                <Typography variant="body1" sx={{ color: alpha('#fff', 0.8), mt: 0.5 }}>
                  View artwork information and gallery
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<IconEdit />}
              onClick={handleEdit}
              sx={{ 
                backgroundColor: alpha('#fff', 0.15),
                color: 'white',
                borderRadius: 3,
                px: 3,
                py: 1.5,
                '&:hover': {
                  backgroundColor: alpha('#fff', 0.25),
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Edit Artwork
            </Button>
          </Box>
        </Box>

        <Box sx={{ px: 4 }}>
          {/* Error Alert */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3, 
                borderRadius: 3,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            >
              {error}
            </Alert>
          )}

          {/* Main Content */}
          <Grid container spacing={4}>
            {/* Cover Image */}
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.7)} 100%)`,
                  backdropFilter: 'blur(20px)',
                  borderRadius: 4,
                  p: 3,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
                  height: 'fit-content'
                }}
              >
                <Typography variant="h5" fontWeight={600} mb={3} sx={{ color: theme.palette.primary.main }}>
                  Cover Image
                </Typography>
                {artwork.cover_image_url ? (
                  <Box
                    sx={{
                      borderRadius: 3,
                      overflow: 'hidden',
                      width: '100%',
                      height: '400px',
                      position: 'relative'
                    }}
                  >
                    <img
                      src={artwork.cover_image_url}
                      alt={artwork.title}
                      style={{
                        objectFit: 'cover',
                        width: '100%',
                        height: '400px',
                        borderRadius: '12px'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `
                          <div style="
                            width: 100%;
                            height: 400px;
                            display: flex; 
                            align-items: center; 
                            justify-content: center; 
                            background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
                            color: #999;
                            border-radius: 12px;
                          ">
                            <div style="text-align: center;">
                              <div style="font-size: 48px; margin-bottom: 16px;">🖼️</div>
                              <div style="font-size: 16px; font-weight: 500;">Cover image not available</div>
                            </div>
                          </div>
                        `;
                      }}
                    />
                  </Box>
                ) : (
                  <Box 
                    display="flex" 
                    flexDirection="column" 
                    alignItems="center" 
                    justifyContent="center" 
                    minHeight="400px"
                    sx={{ 
                      background: `linear-gradient(135deg, ${alpha(theme.palette.grey[100], 0.5)} 0%, ${alpha(theme.palette.grey[200], 0.3)} 100%)`,
                      borderRadius: 3,
                      border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`
                    }}
                  >
                    <IconPhoto size={64} style={{ color: theme.palette.primary.main, marginBottom: 16 }} />
                    <Typography variant="h6" color="primary.main" textAlign="center">
                      No Cover Image
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>

            {/* Artwork Info */}
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.7)} 100%)`,
                  backdropFilter: 'blur(20px)',
                  borderRadius: 4,
                  p: 4,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
                  height: 'fit-content'
                }}
              >
                {/* Title and Status */}
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  <Typography variant="h2" fontWeight={700} sx={{ color: theme.palette.text.primary, flex: 1 }}>
                    {artwork.title}
                  </Typography>
                  <Box display="flex" gap={1}>
                    {artwork.is_featured && (
                      <Chip 
                        icon={<IconStar size={16} />}
                        label="Featured"
                        color="warning"
                        sx={{ fontWeight: 600 }}
                      />
                    )}
                    {artwork.is_for_sale && (
                      <Chip 
                        icon={<IconCurrencyDollar size={16} />}
                        label="For Sale"
                        color="success"
                        sx={{ fontWeight: 600 }}
                      />
                    )}
                  </Box>
                </Box>

                {/* Artist */}
                {artwork.artist && (
                  <Box display="flex" alignItems="center" gap={2} mb={3}>
                    <IconUser size={20} style={{ color: theme.palette.secondary.main }} />
                    <Typography variant="h6" sx={{ color: theme.palette.secondary.main, fontWeight: 500 }}>
                      {artwork.artist.artist_name || artwork.artist.name}
                    </Typography>
                  </Box>
                )}

                {/* Description */}
                {(artwork.description || artwork.overview) && (
                  <Box mb={3}>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: theme.palette.text.secondary,
                        lineHeight: 1.6,
                        mb: 2
                      }}
                    >
                      {artwork.description || artwork.overview}
                    </Typography>
                  </Box>
                )}

                <Divider sx={{ my: 3 }} />

                {/* Details Grid */}
                <Grid container spacing={3}>
                  {artwork.year_created && (
                    <Grid item xs={6}>
                      <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                        <IconCalendar size={18} style={{ color: theme.palette.primary.main }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary">Year Created</Typography>
                          <Typography variant="body2" fontWeight={600}>{artwork.year_created}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                  )}

                  {artwork.medium && (
                    <Grid item xs={6}>
                      <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                        <IconPalette size={18} style={{ color: theme.palette.primary.main }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary">Medium</Typography>
                          <Typography variant="body2" fontWeight={600}>{artwork.medium}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                  )}

                  {artwork.dimensions && (
                    <Grid item xs={6}>
                      <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                        <IconRuler size={18} style={{ color: theme.palette.primary.main }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary">Dimensions</Typography>
                          <Typography variant="body2" fontWeight={600}>{artwork.dimensions}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                  )}

                  {artwork.price && (
                    <Grid item xs={6}>
                      <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                        <IconCurrencyDollar size={18} style={{ color: theme.palette.success.main }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary">Price</Typography>
                          <Typography variant="body2" fontWeight={600} color="success.main">
                            ${artwork.price}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  )}
                </Grid>

                {/* Tags */}
                {artwork.tags && artwork.tags.length > 0 && (
                  <Box mt={3}>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <IconTag size={18} style={{ color: theme.palette.secondary.main }} />
                      <Typography variant="subtitle2" color="secondary.main" fontWeight={600}>
                        Tags
                      </Typography>
                    </Box>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {artwork.tags.map((tag, index) => (
                        <Chip
                          key={index}
                          label={typeof tag === 'string' ? tag : tag.name}
                          size="small"
                          sx={{
                            backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                            color: theme.palette.secondary.main,
                            borderRadius: 2
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            </Grid>

            {/* Gallery Section - Full Width */}
            <Grid item xs={12}>
              <Box
                sx={{
                  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.7)} 100%)`,
                  backdropFilter: 'blur(20px)',
                  borderRadius: 4,
                  p: 4,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
                  mt: 2
                }}
              >
                <Box display="flex" alignItems="center" gap={2} mb={4}>
                  <Box
                    sx={{
                      backgroundColor: theme.palette.primary.main,
                      borderRadius: 2,
                      p: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <IconPhoto size={28} style={{ color: 'white' }} />
                  </Box>
                  <Typography variant="h3" fontWeight={700} sx={{ color: theme.palette.primary.main }}>
                    Gallery
                  </Typography>
                  {(artwork.images || artwork.image_urls) && (artwork.images || artwork.image_urls).length > 0 && (
                    <Chip 
                      label={`${(artwork.images || artwork.image_urls).length} image${(artwork.images || artwork.image_urls).length !== 1 ? 's' : ''}`}
                      sx={{ 
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        fontWeight: 600
                      }}
                    />
                  )}
                </Box>
                
                {(artwork.images || artwork.image_urls) && (artwork.images || artwork.image_urls).length > 0 ? (
                  <Grid container spacing={3}>
                    {(artwork.images || artwork.image_urls).map((image, index) => (
                      <Grid item xs={12} sm={4} md={4} key={image.id || index}>
                        <Box
                          sx={{ 
                            borderRadius: 3,
                            overflow: 'hidden',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            border: `2px solid transparent`,
                            width: '100%',
                            height: '280px',
                            position: 'relative',
                            '&:hover': {
                              transform: 'translateY(-8px) scale(1.05)',
                              boxShadow: `0 16px 40px ${alpha(theme.palette.primary.main, 0.25)}`,
                              border: `2px solid ${alpha(theme.palette.primary.main, 0.4)}`
                            }
                          }}
                        >
                          <img
                            src={image.thumb || image.url}
                            alt={`Gallery ${index + 1}`}
                            style={{ 
                              objectFit: 'cover',
                              width: '100%',
                              height: '280px',
                              borderRadius: '12px'
                            }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = `
                                <div style="
                                  width: 100%;
                                  height: 280px;
                                  display: flex; 
                                  align-items: center; 
                                  justify-content: center; 
                                  background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
                                  color: #999;
                                  border-radius: 12px;
                                ">
                                  <div style="text-align: center;">
                                    <div style="font-size: 32px; margin-bottom: 8px;">📷</div>
                                    <div style="font-size: 12px; font-weight: 500;">Image not available</div>
                                  </div>
                                </div>
                              `;
                            }}
                          />
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Box 
                    display="flex" 
                    flexDirection="column" 
                    alignItems="center" 
                    justifyContent="center" 
                    minHeight="300px"
                    sx={{ 
                      background: `linear-gradient(135deg, ${alpha(theme.palette.grey[100], 0.5)} 0%, ${alpha(theme.palette.grey[200], 0.3)} 100%)`,
                      borderRadius: 3,
                      border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
                      p: 4
                    }}
                  >
                    <Box
                      sx={{
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        borderRadius: '50%',
                        p: 3,
                        mb: 3
                      }}
                    >
                      <IconPhoto 
                        size={64} 
                        style={{ 
                          color: theme.palette.primary.main
                        }} 
                      />
                    </Box>
                    <Typography variant="h4" fontWeight={600} color="primary.main" textAlign="center" mb={2}>
                      No Gallery Images
                    </Typography>
                    <Typography variant="body1" color="text.secondary" textAlign="center">
                      Upload some images to showcase this artwork
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Fade>
  );
};

export default ArtworkView;
