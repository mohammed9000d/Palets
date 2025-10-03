import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Grid,
  MenuItem,
  Avatar,
  IconButton,
  Divider,
  FormControlLabel,
  Switch,
  useTheme,
  alpha,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Stack,
  Badge,
  Tabs,
  Tab,
  Skeleton
} from '@mui/material';
import {
  IconUser,
  IconMail,
  IconPhone,
  IconMapPin,
  IconCalendar,
  IconCamera,
  IconDeviceFloppy,
  IconArrowLeft,
  IconBell,
  IconGlobe,
  IconCreditCard,
  IconShield
} from '@tabler/icons-react';
import { useAuth } from '../../contexts/AuthContext';

const Profile = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, updateProfile, isAuthenticated, loading: authLoading } = useAuth();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    country_code: '+39',
    date_of_birth: '',
    gender: '',
    street_address: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    billing_street_address: '',
    billing_city: '',
    billing_state: '',
    billing_postal_code: '',
    billing_country: '',
    newsletter_subscription: false,
    sms_notifications: false,
    preferred_language: 'en',
    timezone: 'UTC',
    avatar: null
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('personal');
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);

  // Static Italy country code
  const ITALY_COUNTRY_CODE = '+39';

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'it', label: 'Italian' },
    { value: 'pt', label: 'Portuguese' },
    { value: 'ja', label: 'Japanese' },
    { value: 'zh', label: 'Chinese' },
    { value: 'ar', label: 'Arabic' },
  ];

  const timezones = [
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'Eastern Time' },
    { value: 'America/Chicago', label: 'Central Time' },
    { value: 'America/Denver', label: 'Mountain Time' },
    { value: 'America/Los_Angeles', label: 'Pacific Time' },
    { value: 'Europe/London', label: 'London' },
    { value: 'Europe/Paris', label: 'Paris' },
    { value: 'Asia/Tokyo', label: 'Tokyo' },
    { value: 'Asia/Shanghai', label: 'Shanghai' },
    { value: 'Australia/Sydney', label: 'Sydney' },
  ];

  // Helper function to format date for HTML date input
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    // If it's already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    // If it's in ISO format, extract just the date part
    if (dateString.includes('T')) {
      return dateString.split('T')[0];
    }
    // Try to parse and format the date
    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    } catch (e) {
      console.warn('Could not parse date:', dateString);
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: e.target.type === 'checkbox' ? checked : value
    }));
    if (message.text) setMessage({ type: '', text: '' });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'File size must be less than 5MB' });
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setMessage({ type: 'error', text: 'Please select a valid image file (JPEG, PNG, GIF, or WebP)' });
        return;
      }

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);

      setFormData(prev => ({
        ...prev,
        avatar: file
      }));

      // Clear any previous error messages
      if (message.text) setMessage({ type: '', text: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const result = await updateProfile(formData);
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        setFormData(prev => ({ ...prev, avatar: null }));
        // Clear preview and force re-render after user state updates
        setTimeout(() => {
          setAvatarPreview(null);
          setForceUpdate(prev => prev + 1); // Force component re-render
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }, 1000); // Give time for user state to update
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/profile' } } });
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Update form data when user data becomes available
  React.useEffect(() => {
    if (user && Object.keys(user).length > 0) {
      const newFormData = {
        name: user.name || '',
        phone: user.phone || '',
        country_code: user.country_code || '+39',
        date_of_birth: formatDateForInput(user.date_of_birth),
        gender: user.gender || '',
        street_address: user.street_address || '',
        city: user.city || '',
        state: user.state || '',
        postal_code: user.postal_code || '',
        country: user.country || '',
        billing_street_address: user.billing_street_address || '',
        billing_city: user.billing_city || '',
        billing_state: user.billing_state || '',
        billing_postal_code: user.billing_postal_code || '',
        billing_country: user.billing_country || '',
        newsletter_subscription: user.newsletter_subscription || false,
        sms_notifications: user.sms_notifications || false,
        preferred_language: user.preferred_language || 'en',
        timezone: user.timezone || 'UTC',
        avatar: null
      };
      setFormData(newFormData);
    }
  }, [user]);

  if (authLoading || (isAuthenticated && !user)) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '300px',
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.08)} 100%)`,
            zIndex: 0
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: 4 }}>
          {/* Back Button Skeleton */}
          <Box sx={{ pt: 4, pb: 2 }}>
            <Skeleton variant="rectangular" width={150} height={40} sx={{ borderRadius: 3 }} />
          </Box>

          {/* Profile Header Skeleton */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: 4,
              background: 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
              mb: 4
            }}
          >
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'center', md: 'flex-start' } }}>
                  <Skeleton variant="circular" width={120} height={120} sx={{ mb: 3 }} />
                </Box>
              </Grid>
              <Grid item xs={12} md={8}>
                <Box sx={{ pl: { xs: 0, md: 2 } }}>
                  <Skeleton variant="text" width="60%" height={50} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="40%" height={30} sx={{ mb: 2 }} />
                  <Skeleton variant="text" width="50%" height={20} sx={{ mb: 3 }} />
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Form Content Skeleton */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 4,
              background: 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              boxShadow: '0 20px 60px rgba(0,0,0,0.08)'
            }}
          >
            {/* Tabs Skeleton */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: { xs: 2, md: 4 } }}>
              <Box sx={{ display: 'flex', gap: 4, py: 2 }}>
                <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 2 }} />
                <Skeleton variant="rectangular" width={100} height={40} sx={{ borderRadius: 2 }} />
                <Skeleton variant="rectangular" width={80} height={40} sx={{ borderRadius: 2 }} />
              </Box>
            </Box>

            {/* Form Fields Skeleton */}
            <Box sx={{ p: { xs: 3, md: 5 } }}>
              <Grid container spacing={4}>
                <Grid item xs={12}>
                  <Skeleton variant="rectangular" width="100%" height={56} sx={{ borderRadius: 3 }} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Skeleton variant="rectangular" width="100%" height={56} sx={{ borderRadius: 3 }} />
                </Grid>
                <Grid item xs={12} sm={8}>
                  <Skeleton variant="rectangular" width="100%" height={56} sx={{ borderRadius: 3 }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Skeleton variant="rectangular" width="100%" height={56} sx={{ borderRadius: 3 }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Skeleton variant="rectangular" width="100%" height={56} sx={{ borderRadius: 3 }} />
                </Grid>
                <Grid item xs={12}>
                  <Skeleton variant="rectangular" width="100%" height={56} sx={{ borderRadius: 3 }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Skeleton variant="rectangular" width="100%" height={56} sx={{ borderRadius: 3 }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Skeleton variant="rectangular" width="100%" height={56} sx={{ borderRadius: 3 }} />
                </Grid>
              </Grid>

              {/* Save Button Skeleton */}
              <Box sx={{ mt: 6, display: 'flex', justifyContent: 'flex-end' }}>
                <Skeleton variant="rectangular" width={150} height={50} sx={{ borderRadius: 4 }} />
              </Box>
            </Box>
          </Paper>
        </Container>
      </Box>
    );
  }


  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: IconUser },
    { id: 'address', label: 'Address', icon: IconMapPin },
    { id: 'billing', label: 'Billing', icon: IconCreditCard }
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '300px',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.08)} 100%)`,
          zIndex: 0
        }
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Enhanced Back Button */}
        <Box sx={{ pt: 4, pb: 2 }}>
          <Button
            onClick={() => navigate('/')}
            startIcon={<IconArrowLeft size={20} />}
            sx={{
              color: theme.palette.text.secondary,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1.5,
              borderRadius: 3,
              bgcolor: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                transform: 'translateX(-4px)',
                boxShadow: '0 6px 25px rgba(0,0,0,0.12)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Back to Home
          </Button>
        </Box>

        {/* Enhanced Profile Header */}
            <Paper
          elevation={0}
              sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            background: 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
            position: 'relative',
            overflow: 'hidden',
            mb: 4,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, ${theme.palette.success.main})`,
              borderRadius: '4px 4px 0 0'
            }
          }}
        >
            <Grid container spacing={4} alignItems="center">
              {/* Enhanced Avatar Section */}
              <Grid item xs={12} md={4}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: { xs: 'center', md: 'flex-start' },
                  textAlign: { xs: 'center', md: 'left' }
                }}>
                  <Box sx={{ position: 'relative', mb: 3 }}>
                    {/* Animated Ring */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -8,
                        left: -8,
                        right: -8,
                        bottom: -8,
                        borderRadius: '50%',
                        background: `conic-gradient(from 0deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, ${theme.palette.success.main}, ${theme.palette.primary.main})`,
                        animation: 'rotate 8s linear infinite',
                        '@keyframes rotate': {
                          '0%': { transform: 'rotate(0deg)' },
                          '100%': { transform: 'rotate(360deg)' }
                        },
                        opacity: 0.8
                      }}
                    />
                    
                    {/* Avatar with enhanced styling */}
                        <Box sx={{ position: 'relative', display: 'inline-block' }}>
                          <Avatar
                            key={`${user?.avatar || 'no-avatar'}-${forceUpdate}`} // Force re-render when avatar changes
                            src={avatarPreview || user?.avatar}
                            sx={{
                              width: 120,
                              height: 120,
                              border: `6px solid ${theme.palette.background.paper}`,
                              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                              fontSize: '2.5rem',
                              fontWeight: 'bold',
                              bgcolor: theme.palette.primary.main,
                              position: 'relative',
                              zIndex: 1,
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'scale(1.05)',
                                boxShadow: '0 12px 40px rgba(0,0,0,0.2)'
                              }
                            }}
                          >
                            {user?.name?.charAt(0)?.toUpperCase()}
                          </Avatar>
                          
                          {/* Upload/Change Photo Button */}
                  <IconButton
                    onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingAvatar}
                    sx={{
                      position: 'absolute',
                              bottom: 8,
                              right: 8,
                      backgroundColor: theme.palette.primary.main,
                      color: 'white',
                              width: 40,
                              height: 40,
                              boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                      '&:hover': {
                        backgroundColor: theme.palette.primary.dark,
                                transform: 'scale(1.1)',
                                boxShadow: '0 6px 20px rgba(0,0,0,0.3)'
                              },
                              '&:disabled': {
                                backgroundColor: theme.palette.action.disabled
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {uploadingAvatar ? (
                              <CircularProgress size={20} color="inherit" />
                            ) : (
                              <IconCamera size={20} />
                            )}
                  </IconButton>


                  <input
                    ref={fileInputRef}
                    type="file"
                            accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                    onChange={handleAvatarChange}
                    style={{ display: 'none' }}
                  />
                </Box>
                </Box>
                </Box>
              </Grid>
              
              {/* Enhanced User Info */}
              <Grid item xs={12} md={8}>
                <Box sx={{ pl: { xs: 0, md: 2 } }}>
                  <Box sx={{ mb: 3 }}>
                    <Typography 
                      variant="h3" 
                      sx={{ 
                        fontWeight: 800,
                        mb: 1,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontSize: { xs: '2rem', md: '2.5rem' }
                      }}
                    >
                    {user?.name}
                  </Typography>
                    
                    <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500, mb: 2 }}>
                    {user?.email}
                  </Typography>
                    
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                      Member since {new Date(user?.created_at || Date.now()).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                  </Typography>
                </Box>
              </Box>
          </Grid>
            </Grid>
          </Paper>


        {/* Enhanced Form Content with Tabs */}
            <Paper
          elevation={0}
              sx={{
            borderRadius: 4,
            background: 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
            {/* Horizontal Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={activeTab}
                onChange={(event, newValue) => setActiveTab(newValue)}
                      sx={{
                  px: { xs: 2, md: 4 },
                  '& .MuiTab-root': {
                        textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '1rem',
                    minHeight: 64,
                    '&.Mui-selected': {
                      color: theme.palette.primary.main
                    }
                  },
                  '& .MuiTabs-indicator': {
                    height: 3,
                    borderRadius: '3px 3px 0 0',
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                  }
                }}
              >
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                return (
                    <Tab
                    key={tab.id}
                      value={tab.id}
                      label={tab.label}
                      icon={<Icon size={20} />}
                      iconPosition="start"
                    sx={{
                        '& .MuiTab-iconWrapper': {
                          marginRight: 1,
                          marginBottom: 0
                        }
                      }}
                    />
                );
              })}
              </Tabs>
            </Box>

            {/* Tab Content */}
            <Box sx={{ p: { xs: 3, md: 5 } }}>
                {/* Enhanced Message Alert */}
              {message.text && (
                <Alert 
                  severity={message.type} 
                    sx={{ 
                      mb: 4, 
                      borderRadius: 3,
                      border: 'none',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                      '& .MuiAlert-icon': {
                        fontSize: '1.5rem'
                      },
                      '& .MuiAlert-message': {
                        fontWeight: 600
                      }
                    }}
                  onClose={() => setMessage({ type: '', text: '' })}
                >
                  {message.text}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                {/* Enhanced Personal Information Tab */}
                {activeTab === 'personal' && (
                  <Box>
                      <Box sx={{ mb: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <Box
                            sx={{
                              width: 4,
                              height: 40,
                              bgcolor: theme.palette.primary.main,
                              borderRadius: 2
                            }}
                          />
                          <Typography 
                            variant="h4" 
                            sx={{ 
                              fontWeight: 700,
                              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                              backgroundClip: 'text',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent'
                            }}
                          >
                      Personal Information
                    </Typography>
                        </Box>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, fontSize: '1.1rem' }}>
                          Keep your personal information up to date for a better experience
                        </Typography>
                        <Divider sx={{ borderColor: alpha(theme.palette.primary.main, 0.1) }} />
                      </Box>
                      
                      <Grid container spacing={4} sx={{ display: 'flex', flexDirection: 'column' }}>
                        {/* Clickable Profile Photo Input */}
                        <Grid item xs={12}>
                          <Box sx={{ position: 'relative' }}>
                            <Typography 
                              variant="subtitle1" 
                              sx={{ 
                                fontWeight: 600, 
                                mb: 2, 
                                color: theme.palette.text.primary,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                              }}
                            >
                              <IconCamera size={20} color={theme.palette.primary.main} />
                              Profile Photo
                            </Typography>
                            
                            <Box
                              onClick={() => fileInputRef.current?.click()}
                              sx={{
                                p: 4,
                                borderRadius: 3,
                                bgcolor: alpha(theme.palette.background.paper, 0.8),
                                border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
                                cursor: uploadingAvatar ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minHeight: 200,
                                gap: 3,
                                '&:hover': !uploadingAvatar ? {
                                  bgcolor: alpha(theme.palette.background.paper, 1),
                                  borderColor: alpha(theme.palette.primary.main, 0.5),
                                  boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`,
                                  transform: 'translateY(-2px)'
                                } : {}
                              }}
                            >
                              {/* Clickable Avatar */}
                              <Box sx={{ position: 'relative' }}>
                                <Avatar
                                  key={`${user?.avatar || 'no-avatar'}-${forceUpdate}`}
                                  src={avatarPreview || user?.avatar}
                                  sx={{
                                    width: 100,
                                    height: 100,
                                    border: `4px solid ${theme.palette.primary.main}`,
                                    fontSize: '2rem',
                                    fontWeight: 'bold',
                                    bgcolor: theme.palette.primary.main,
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                                    transition: 'all 0.2s ease'
                                  }}
                                >
                                  {user?.name?.charAt(0)?.toUpperCase()}
                                </Avatar>
                                
                                {/* Camera Overlay */}
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    bottom: -8,
                                    right: -8,
                                    width: 36,
                                    height: 36,
                                    borderRadius: '50%',
                                    bgcolor: theme.palette.primary.main,
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                    border: `3px solid ${theme.palette.background.paper}`
                                  }}
                                >
                                  {uploadingAvatar ? (
                                    <CircularProgress size={16} color="inherit" />
                                  ) : (
                                    <IconCamera size={18} />
                                  )}
                                </Box>
                              </Box>
                              
                              {/* Upload Instructions */}
                              <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                                  {uploadingAvatar ? 'Uploading photo...' : 
                                   user?.avatar ? 'Click to change your photo' : 'Click to upload your photo'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  JPEG, PNG, GIF, WebP • Max 5MB
                                </Typography>
                              </Box>
                              
                              {/* Success Indicator */}
                              {avatarPreview && (
                                <Box sx={{ 
                                  px: 3,
                                  py: 1.5,
                                  borderRadius: 2, 
                                  bgcolor: alpha(theme.palette.success.main, 0.1),
                                  border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1
                                }}>
                                  <Box component="span" sx={{ fontSize: '1.1rem', color: theme.palette.success.main }}>✓</Box>
                                  <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                                    New photo selected
                                  </Typography>
                                </Box>
                              )}
                              
                              
                              <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                                onChange={handleAvatarChange}
                                style={{ display: 'none' }}
                              />
                            </Box>
                          </Box>
                        </Grid>

                        <Grid item xs={12}>
                          <Box sx={{ position: 'relative' }}>
                            <TextField
                              fullWidth
                              name="name"
                              label="Full Name"
                              value={formData.name || ''}
                              onChange={handleChange}
                              required
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 3,
                                  bgcolor: alpha(theme.palette.background.paper, 0.8),
                                  '&:hover': {
                                    bgcolor: alpha(theme.palette.background.paper, 1),
                                    '& .MuiOutlinedInput-notchedOutline': {
                                      borderColor: alpha(theme.palette.primary.main, 0.3)
                                    }
                                  },
                                  '&.Mui-focused': {
                                    bgcolor: alpha(theme.palette.background.paper, 1),
                                    boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`
                                  }
                                },
                                '& .MuiInputLabel-root': {
                                  fontWeight: 600
                                }
                              }}
                          InputProps={{
                            startAdornment: (
                                  <IconUser size={20} color={theme.palette.primary.main} style={{ marginRight: 12 }} />
                            )
                          }}
                        />
                          </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          name="phone"
                          label="Phone Number"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="e.g., 123 456 7890"
                          helperText="Italian phone number without country code"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 3,
                              bgcolor: alpha(theme.palette.background.paper, 0.8),
                              '&:hover': {
                                bgcolor: alpha(theme.palette.background.paper, 1),
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: alpha(theme.palette.primary.main, 0.3)
                                }
                              },
                              '&.Mui-focused': {
                                bgcolor: alpha(theme.palette.background.paper, 1),
                                boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`
                              }
                            },
                            '& .MuiInputLabel-root': {
                              fontWeight: 600
                            }
                          }}
                          InputProps={{
                            startAdornment: (
                              <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 1,
                                pr: 1,
                                borderRight: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                                mr: 1
                              }}>
                                <IconPhone size={20} color={theme.palette.primary.main} />
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    color: theme.palette.text.primary,
                                    fontWeight: 600,
                                    fontSize: '0.95rem'
                                  }}
                                >
                                  {ITALY_COUNTRY_CODE}
                                </Typography>
                              </Box>
                            )
                          }}
                          FormHelperTextProps={{
                            sx: {
                              color: theme.palette.text.secondary,
                              fontSize: '0.75rem'
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          name="date_of_birth"
                          label="Date of Birth"
                          type="date"
                          value={formData.date_of_birth}
                          onChange={handleChange}
                          InputLabelProps={{ shrink: true }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 3,
                              bgcolor: alpha(theme.palette.background.paper, 0.8),
                              '&:hover': {
                                bgcolor: alpha(theme.palette.background.paper, 1),
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: alpha(theme.palette.primary.main, 0.3)
                                }
                              },
                              '&.Mui-focused': {
                                bgcolor: alpha(theme.palette.background.paper, 1),
                                boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`
                              }
                            },
                            '& .MuiInputLabel-root': {
                              fontWeight: 600
                            }
                          }}
                          InputProps={{
                            startAdornment: (
                              <IconCalendar size={20} color={theme.palette.primary.main} style={{ marginRight: 12 }} />
                            )
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          select
                          name="gender"
                          label="Gender"
                          value={formData.gender}
                          onChange={handleChange}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 3,
                              bgcolor: alpha(theme.palette.background.paper, 0.8),
                              '&:hover': {
                                bgcolor: alpha(theme.palette.background.paper, 1),
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: alpha(theme.palette.primary.main, 0.3)
                                }
                              },
                              '&.Mui-focused': {
                                bgcolor: alpha(theme.palette.background.paper, 1),
                                boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`
                              }
                            },
                            '& .MuiInputLabel-root': {
                              fontWeight: 600
                            }
                          }}
                        >
                          <MenuItem value="">Select Gender</MenuItem>
                          <MenuItem value="male">Male</MenuItem>
                          <MenuItem value="female">Female</MenuItem>
                          <MenuItem value="other">Other</MenuItem>
                        </TextField>
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {/* Address Tab */}
                {activeTab === 'address' && (
                  <Box>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      Address Information
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          name="street_address"
                          label="Street Address"
                          value={formData.street_address}
                          onChange={handleChange}
                          InputProps={{
                            startAdornment: (
                              <IconMapPin size={20} color={theme.palette.text.secondary} style={{ marginRight: 8 }} />
                            )
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          name="city"
                          label="City"
                          value={formData.city}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          name="state"
                          label="State/Province"
                          value={formData.state}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          name="postal_code"
                          label="Postal Code"
                          value={formData.postal_code}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          name="country"
                          label="Country"
                          value={formData.country}
                          onChange={handleChange}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {/* Billing Tab */}
                {activeTab === 'billing' && (
                  <Box>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      Billing Address
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          name="billing_street_address"
                          label="Billing Street Address"
                          value={formData.billing_street_address}
                          onChange={handleChange}
                          InputProps={{
                            startAdornment: (
                              <IconCreditCard size={20} color={theme.palette.text.secondary} style={{ marginRight: 8 }} />
                            )
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          name="billing_city"
                          label="Billing City"
                          value={formData.billing_city}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          name="billing_state"
                          label="Billing State/Province"
                          value={formData.billing_state}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          name="billing_postal_code"
                          label="Billing Postal Code"
                          value={formData.billing_postal_code}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          name="billing_country"
                          label="Billing Country"
                          value={formData.billing_country}
                          onChange={handleChange}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {/* Preferences Tab */}
                {activeTab === 'preferences' && (
                  <Box>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      Preferences & Settings
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          select
                          name="preferred_language"
                          label="Preferred Language"
                          value={formData.preferred_language}
                          onChange={handleChange}
                          InputProps={{
                            startAdornment: (
                              <IconGlobe size={20} color={theme.palette.text.secondary} style={{ marginRight: 8 }} />
                            )
                          }}
                        >
                          {languages.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          select
                          name="timezone"
                          label="Timezone"
                          value={formData.timezone}
                          onChange={handleChange}
                        >
                          {timezones.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={12}>
                        <Card variant="outlined" sx={{ p: 2 }}>
                          <Typography variant="h6" gutterBottom>
                            Notification Preferences
                          </Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <FormControlLabel
                              control={
                                <Switch
                                  name="newsletter_subscription"
                                  checked={formData.newsletter_subscription}
                                  onChange={handleChange}
                                  color="primary"
                                />
                              }
                              label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <IconMail size={20} />
                                  <Typography>Email Newsletter</Typography>
                                </Box>
                              }
                            />
                            <FormControlLabel
                              control={
                                <Switch
                                  name="sms_notifications"
                                  checked={formData.sms_notifications}
                                  onChange={handleChange}
                                  color="primary"
                                />
                              }
                              label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <IconBell size={20} />
                                  <Typography>SMS Notifications</Typography>
                                </Box>
                              }
                            />
                          </Box>
                        </Card>
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {/* Enhanced Save Button */}
                <Box sx={{ mt: 6, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                  
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <IconDeviceFloppy size={20} />}
                    sx={{
                      px: 6,
                      py: 2,
                      borderRadius: 4,
                      textTransform: 'none',
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.4)}`,
                        transform: 'translateY(-3px)',
                        '&::before': {
                          opacity: 1
                        }
                      },
                      '&:disabled': {
                        transform: 'none',
                        '&::before': {
                          opacity: 0
                        }
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `linear-gradient(135deg, ${alpha('#fff', 0.2)}, transparent)`,
                        opacity: 0,
                        transition: 'opacity 0.3s ease'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {loading ? 'Saving Changes...' : 'Save Changes'}
                  </Button>
                </Box>
                </Box>
              </Box>
            </Paper>
      </Container>
    </Box>
  );
};

export default Profile;
