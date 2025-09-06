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
  CardContent
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
  IconSettings,
  IconBell,
  IconGlobe,
  IconCreditCard
} from '@tabler/icons-react';
import { useAuth } from '../../contexts/AuthContext';

const Profile = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, updateProfile, isAuthenticated, loading: authLoading } = useAuth();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    country_code: user?.country_code || '+1',
    date_of_birth: user?.date_of_birth || '',
    gender: user?.gender || '',
    street_address: user?.street_address || '',
    city: user?.city || '',
    state: user?.state || '',
    postal_code: user?.postal_code || '',
    country: user?.country || '',
    billing_street_address: user?.billing_street_address || '',
    billing_city: user?.billing_city || '',
    billing_state: user?.billing_state || '',
    billing_postal_code: user?.billing_postal_code || '',
    billing_country: user?.billing_country || '',
    newsletter_subscription: user?.newsletter_subscription || false,
    sms_notifications: user?.sms_notifications || false,
    preferred_language: user?.preferred_language || 'en',
    timezone: user?.timezone || 'UTC',
    avatar: null
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('personal');

  const countryCodes = [
    { value: '+1', label: '+1 (US/CA)' },
    { value: '+44', label: '+44 (UK)' },
    { value: '+33', label: '+33 (FR)' },
    { value: '+49', label: '+49 (DE)' },
    { value: '+39', label: '+39 (IT)' },
    { value: '+34', label: '+34 (ES)' },
    { value: '+81', label: '+81 (JP)' },
    { value: '+86', label: '+86 (CN)' },
    { value: '+91', label: '+91 (IN)' },
    { value: '+61', label: '+61 (AU)' },
  ];

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

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/profile' } } });
    }
  }, [isAuthenticated, authLoading, navigate]);

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
      setFormData(prev => ({
        ...prev,
        avatar: file
      }));
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
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: IconUser },
    { id: 'address', label: 'Address', icon: IconMapPin },
    { id: 'billing', label: 'Billing', icon: IconCreditCard },
    { id: 'preferences', label: 'Preferences', icon: IconSettings },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        py: 4
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Button
            onClick={() => navigate('/')}
            startIcon={<IconArrowLeft size={20} />}
            sx={{
              color: theme.palette.text.secondary,
              textTransform: 'none',
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1)
              }
            }}
          >
            Back to Home
          </Button>
        </Box>

        <Grid container spacing={4}>
          {/* Profile Header */}
          <Grid item xs={12}>
            <Paper
              elevation={4}
              sx={{
                p: 4,
                borderRadius: 3,
                background: alpha('#ffffff', 0.9),
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    src={user?.avatar}
                    sx={{
                      width: 100,
                      height: 100,
                      border: `4px solid ${theme.palette.primary.main}`,
                      boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`
                    }}
                  >
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </Avatar>
                  <IconButton
                    onClick={() => fileInputRef.current?.click()}
                    sx={{
                      position: 'absolute',
                      bottom: -5,
                      right: -5,
                      backgroundColor: theme.palette.primary.main,
                      color: 'white',
                      width: 35,
                      height: 35,
                      '&:hover': {
                        backgroundColor: theme.palette.primary.dark,
                      }
                    }}
                  >
                    <IconCamera size={18} />
                  </IconButton>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    style={{ display: 'none' }}
                  />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="bold" gutterBottom>
                    {user?.name}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    {user?.email}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Member since {new Date(user?.created_at || Date.now()).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Navigation Tabs */}
          <Grid item xs={12} md={3}>
            <Paper
              elevation={4}
              sx={{
                p: 2,
                borderRadius: 3,
                background: alpha('#ffffff', 0.9),
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
              }}
            >
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <Button
                    key={tab.id}
                    fullWidth
                    variant={activeTab === tab.id ? 'contained' : 'text'}
                    startIcon={<Icon size={20} />}
                    onClick={() => setActiveTab(tab.id)}
                    sx={{
                      justifyContent: 'flex-start',
                      mb: 1,
                      textTransform: 'none',
                      borderRadius: 2,
                      py: 1.5,
                      ...(activeTab === tab.id && {
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        boxShadow: `0 4px 15px ${alpha(theme.palette.primary.main, 0.3)}`
                      })
                    }}
                  >
                    {tab.label}
                  </Button>
                );
              })}
            </Paper>
          </Grid>

          {/* Form Content */}
          <Grid item xs={12} md={9}>
            <Paper
              elevation={4}
              sx={{
                p: 4,
                borderRadius: 3,
                background: alpha('#ffffff', 0.9),
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
              }}
            >
              {/* Message Alert */}
              {message.text && (
                <Alert 
                  severity={message.type} 
                  sx={{ mb: 3, borderRadius: 2 }}
                  onClose={() => setMessage({ type: '', text: '' })}
                >
                  {message.text}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                {/* Personal Information Tab */}
                {activeTab === 'personal' && (
                  <Box>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      Personal Information
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          name="name"
                          label="Full Name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          InputProps={{
                            startAdornment: (
                              <IconUser size={20} color={theme.palette.text.secondary} style={{ marginRight: 8 }} />
                            )
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          name="first_name"
                          label="First Name"
                          value={formData.first_name}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          name="last_name"
                          label="Last Name"
                          value={formData.last_name}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          select
                          name="country_code"
                          label="Country Code"
                          value={formData.country_code}
                          onChange={handleChange}
                        >
                          {countryCodes.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={12} sm={8}>
                        <TextField
                          fullWidth
                          name="phone"
                          label="Phone Number"
                          value={formData.phone}
                          onChange={handleChange}
                          InputProps={{
                            startAdornment: (
                              <IconPhone size={20} color={theme.palette.text.secondary} style={{ marginRight: 8 }} />
                            )
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
                          InputProps={{
                            startAdornment: (
                              <IconCalendar size={20} color={theme.palette.text.secondary} style={{ marginRight: 8 }} />
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

                {/* Save Button */}
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <IconDeviceFloppy size={20} />}
                    sx={{
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                      '&:hover': {
                        boxShadow: `0 6px 25px ${alpha(theme.palette.primary.main, 0.4)}`,
                        transform: 'translateY(-2px)'
                      },
                      '&:disabled': {
                        transform: 'none'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Profile;
