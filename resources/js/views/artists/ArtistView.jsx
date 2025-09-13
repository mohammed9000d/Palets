import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Grid,
  Alert,
  CircularProgress,
  Avatar,
  IconButton,
  Chip,
  Card,
  CardMedia,
  Fade,
  useTheme,
  alpha,
  Divider,
  Link
} from '@mui/material';
import { 
  IconArrowLeft, 
  IconUser, 
  IconMail, 
  IconPhone, 
  IconWorld, 
  IconPalette,
  IconCurrencyDollar,
  IconBrandInstagram,
  IconBrandTwitter,
  IconBrandFacebook,
  IconBrandLinkedin,
  IconBrandYoutube,
  IconEdit,
  IconPhoto,
  IconEye
} from '@tabler/icons-react';
import { artistsAPI } from '../../services/api';
import MainCard from '../../ui-component/cards/MainCard';

const ArtistView = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const theme = useTheme();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [artist, setArtist] = useState(null);

  // Load artist data
  useEffect(() => {
    if (slug) {
      loadArtist();
    }
  }, [slug]);

  const loadArtist = async () => {
    setLoading(true);
    try {
      const response = await artistsAPI.getBySlug(slug);
      setArtist(response.data.artist);
      setError('');
    } catch (err) {
      setError('Failed to load artist data');
      console.error('Error loading artist:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/admin/artists/edit/${slug}`);
  };

  const socialIcons = {
    instagram: <IconBrandInstagram size={20} />,
    twitter: <IconBrandTwitter size={20} />,
    facebook: <IconBrandFacebook size={20} />,
    linkedin: <IconBrandLinkedin size={20} />,
    youtube: <IconBrandYoutube size={20} />,
    website: <IconWorld size={20} />
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

  if (!artist) {
    return (
      <MainCard>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography variant="h6" color="text.secondary">
            Artist not found
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
                onClick={() => navigate('/admin/artists')} 
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
                  Artist Profile
                </Typography>
                <Typography variant="body1" sx={{ color: alpha('#fff', 0.8), mt: 0.5 }}>
                  View artist information and gallery
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
              Edit Artist
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
            {/* Profile Info - Full Width */}
            <Grid item xs={12}>
              {/* Hero Profile Card */}
              <Box
                sx={{
                  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.7)} 100%)`,
                  backdropFilter: 'blur(20px)',
                  borderRadius: 4,
                  p: 4,
                  mb: 4,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Background Pattern */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '200px',
                    height: '200px',
                    background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 70%)`,
                    borderRadius: '50%',
                    transform: 'translate(50%, -50%)'
                  }}
                />
                
                <Box display="flex" alignItems="start" gap={4}>
                  <Avatar
                    src={artist.avatar_url}
                    sx={{ 
                      width: 140, 
                      height: 140,
                      border: `4px solid white`,
                      boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.2)}`,
                      backgroundColor: theme.palette.background.default
                    }}
                  >
                    <IconUser size={50} style={{ color: theme.palette.text.disabled }} />
                  </Avatar>
                  
                  <Box flex={1}>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <Typography variant="h2" fontWeight={700} sx={{ color: theme.palette.text.primary }}>
                        {artist.artist_name}
                      </Typography>
                      <Chip 
                        label={artist.is_active ? 'Active' : 'Inactive'}
                        color={artist.is_active ? 'success' : 'default'}
                        sx={{ 
                          fontWeight: 600,
                          px: 1,
                          borderRadius: 2
                        }}
                      />
                    </Box>
                    
                    {artist.specialties && (
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          color: theme.palette.primary.main,
                          fontWeight: 500,
                          mb: 2,
                          fontSize: '1.1rem'
                        }}
                      >
                        {artist.specialties}
                      </Typography>
                    )}
                    
                    {artist.bio && (
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          color: theme.palette.text.secondary,
                          mb: 3,
                          lineHeight: 1.6
                        }}
                      >
                        {artist.bio}
                      </Typography>
                    )}

                    {/* Contact Info */}
                    <Box display="flex" flexWrap="wrap" gap={3}>
                      {artist.contact_email && (
                        <Box 
                          display="flex" 
                          alignItems="center" 
                          gap={1.5}
                          sx={{
                            backgroundColor: alpha(theme.palette.primary.main, 0.08),
                            px: 2,
                            py: 1,
                            borderRadius: 2
                          }}
                        >
                          <IconMail size={18} style={{ color: theme.palette.primary.main }} />
                          <Typography variant="body2" fontWeight={500}>
                            {artist.contact_email}
                          </Typography>
                        </Box>
                      )}
                      
                      {artist.phone && (
                        <Box 
                          display="flex" 
                          alignItems="center" 
                          gap={1.5}
                          sx={{
                            backgroundColor: alpha(theme.palette.secondary.main, 0.08),
                            px: 2,
                            py: 1,
                            borderRadius: 2
                          }}
                        >
                          <IconPhone size={18} style={{ color: theme.palette.secondary.main }} />
                          <Typography variant="body2" fontWeight={500}>
                            {artist.phone}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* Stats Cards */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                {artist.commission_rate && (
                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.light, 0.05)} 100%)`,
                        borderRadius: 3,
                        p: 3,
                        border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                        transition: 'transform 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: `0 8px 25px ${alpha(theme.palette.success.main, 0.15)}`
                        }
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={2} mb={1}>
                        <Box
                          sx={{
                            backgroundColor: theme.palette.success.main,
                            borderRadius: 2,
                            p: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <IconCurrencyDollar size={20} style={{ color: 'white' }} />
                        </Box>
                        <Typography variant="h6" fontWeight={600}>
                          Commission Rate
                        </Typography>
                      </Box>
                      <Typography variant="h4" fontWeight={700} color="success.main">
                        ${artist.commission_rate}
                      </Typography>
                    </Box>
                  </Grid>
                )}

              </Grid>

              {/* Social Links */}
              {artist.social_links && Object.keys(artist.social_links).length > 0 && (
                <Box
                  sx={{
                    background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.7)} 100%)`,
                    backdropFilter: 'blur(20px)',
                    borderRadius: 3,
                    p: 3,
                    border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
                    boxShadow: `0 8px 25px ${alpha(theme.palette.secondary.main, 0.1)}`
                  }}
                >
                  <Typography variant="h5" fontWeight={600} mb={3} sx={{ color: theme.palette.secondary.main }}>
                    Social Links
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={2}>
                    {Object.entries(artist.social_links).map(([platform, url]) => {
                      if (!url) return null;
                      return (
                        <Link 
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ textDecoration: 'none' }}
                        >
                          <Chip
                            icon={socialIcons[platform]}
                            label={platform.charAt(0).toUpperCase() + platform.slice(1)}
                            clickable
                            sx={{ 
                              backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                              color: theme.palette.secondary.main,
                              borderRadius: 2,
                              px: 1,
                              py: 2,
                              fontWeight: 500,
                              '&:hover': { 
                                backgroundColor: theme.palette.secondary.main,
                                color: 'white',
                                transform: 'translateY(-2px)',
                                boxShadow: `0 4px 15px ${alpha(theme.palette.secondary.main, 0.3)}`
                              },
                              transition: 'all 0.3s ease'
                            }}
                          />
                        </Link>
                      );
                    })}
                  </Box>
                </Box>
              )}
            </Grid>

            {/* Gallery Section - Full Width at Bottom */}
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
                  {artist.gallery_images && artist.gallery_images.length > 0 && (
                    <Chip 
                      label={`${artist.gallery_images.length} image${artist.gallery_images.length !== 1 ? 's' : ''}`}
                      sx={{ 
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        fontWeight: 600
                      }}
                    />
                  )}
                </Box>
                
                {artist.gallery_images && artist.gallery_images.length > 0 ? (
                  <Grid container spacing={3}>
                    {artist.gallery_images.map((image, index) => (
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
                              console.log('Image failed to load:', image.thumb || image.url);
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
                      Upload some images to showcase this artist's work
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

export default ArtistView;
