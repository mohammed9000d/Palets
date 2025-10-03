import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Grid,
  MenuItem,
  useTheme,
  alpha,
  CircularProgress
} from '@mui/material';
import {
  IconEye,
  IconEyeOff,
  IconMail,
  IconLock,
  IconUser,
  IconPhone,
  IconArrowLeft,
  IconUserPlus
} from '@tabler/icons-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

const Register = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { register, isAuthenticated, loading: authLoading } = useAuth();
  const { mergeGuestCart } = useCart();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone: '',
    country_code: '+39'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Static Italy country code
  const ITALY_COUNTRY_CODE = '+39';

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate, location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Full name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    if (formData.password !== formData.password_confirmation) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await register(formData);
      
      if (result.success) {
        console.log('Registration successful, checking for guest cart to merge...');
        
        // Check if there's a guest cart to merge
        const guestCart = localStorage.getItem('guestCart');
        if (guestCart) {
          try {
            const parsedGuestCart = JSON.parse(guestCart);
            if (parsedGuestCart.length > 0) {
              console.log('Found guest cart, merging...', parsedGuestCart);
              await mergeGuestCart();
              console.log('Guest cart merge completed');
            }
          } catch (mergeError) {
            console.error('Error during cart merge:', mergeError);
          }
        }
        
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
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

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
        display: 'flex',
        alignItems: 'center',
        py: 4
      }}
    >
      <Container maxWidth="md">
        <Box sx={{ mb: 4 }}>
          <Button
            component={Link}
            to="/"
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

        <Paper
          elevation={12}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 3,
            background: alpha('#ffffff', 0.95),
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
                boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`
              }}
            >
              <IconUserPlus size={32} color="white" />
            </Box>
            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}
            >
              Create Account
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Join our community of art enthusiasts
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {/* Registration Form */}
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3} sx={{ mb: 2 }}>
              {/* Full Name */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="name"
                  label="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconUser size={20} color={theme.palette.text.secondary} />
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 2,
                      backgroundColor: alpha('#ffffff', 0.9),
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: theme.palette.primary.main,
                          borderWidth: 2
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: theme.palette.primary.main,
                          borderWidth: 2
                        }
                      }
                    }
                  }}
                  InputLabelProps={{
                    sx: {
                      color: theme.palette.text.secondary,
                      '&.Mui-focused': {
                        color: theme.palette.primary.main
                      }
                    }
                  }}
                />
              </Grid>


              {/* Email */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="email"
                  type="email"
                  label="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconMail size={20} color={theme.palette.text.secondary} />
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 2,
                      backgroundColor: alpha('#ffffff', 0.9),
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: theme.palette.primary.main,
                          borderWidth: 2
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: theme.palette.primary.main,
                          borderWidth: 2
                        }
                      }
                    }
                  }}
                  InputLabelProps={{
                    sx: {
                      color: theme.palette.text.secondary,
                      '&.Mui-focused': {
                        color: theme.palette.primary.main
                      }
                    }
                  }}
                />
              </Grid>

              {/* Phone */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="phone"
                  label="Phone Number (Optional)"
                  value={formData.phone}
                  onChange={handleChange}
                  variant="outlined"
                  placeholder="e.g., 123 456 7890"
                  helperText="Italian phone number without country code"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1,
                          pr: 1,
                          borderRight: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                          mr: 1
                        }}>
                          <IconPhone size={20} color={theme.palette.text.secondary} />
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
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 2,
                      backgroundColor: alpha('#ffffff', 0.9),
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: theme.palette.primary.main,
                          borderWidth: 2
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: theme.palette.primary.main,
                          borderWidth: 2
                        }
                      }
                    }
                  }}
                  InputLabelProps={{
                    sx: {
                      color: theme.palette.text.secondary,
                      '&.Mui-focused': {
                        color: theme.palette.primary.main
                      }
                    }
                  }}
                  FormHelperTextProps={{
                    sx: {
                      color: theme.palette.text.secondary,
                      fontSize: '0.75rem'
                    }
                  }}
                />
              </Grid>

              {/* Password */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  label="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  helperText="Minimum 8 characters"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconLock size={20} color={theme.palette.text.secondary} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          sx={{
                            color: theme.palette.text.secondary,
                            '&:hover': {
                              color: theme.palette.primary.main
                            }
                          }}
                        >
                          {showPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 2,
                      backgroundColor: alpha('#ffffff', 0.9),
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: theme.palette.primary.main,
                          borderWidth: 2
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: theme.palette.primary.main,
                          borderWidth: 2
                        }
                      }
                    }
                  }}
                  InputLabelProps={{
                    sx: {
                      color: theme.palette.text.secondary,
                      '&.Mui-focused': {
                        color: theme.palette.primary.main
                      }
                    }
                  }}
                  FormHelperTextProps={{
                    sx: {
                      color: theme.palette.text.secondary,
                      fontSize: '0.75rem'
                    }
                  }}
                />
              </Grid>

              {/* Confirm Password */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="password_confirmation"
                  type={showConfirmPassword ? 'text' : 'password'}
                  label="Confirm Password"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  helperText="Must match password"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconLock size={20} color={theme.palette.text.secondary} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                          sx={{
                            color: theme.palette.text.secondary,
                            '&:hover': {
                              color: theme.palette.primary.main
                            }
                          }}
                        >
                          {showConfirmPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 2,
                      backgroundColor: alpha('#ffffff', 0.9),
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: theme.palette.primary.main,
                          borderWidth: 2
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: theme.palette.primary.main,
                          borderWidth: 2
                        }
                      }
                    }
                  }}
                  InputLabelProps={{
                    sx: {
                      color: theme.palette.text.secondary,
                      '&.Mui-focused': {
                        color: theme.palette.primary.main
                      }
                    }
                  }}
                  FormHelperTextProps={{
                    sx: {
                      color: theme.palette.text.secondary,
                      fontSize: '0.75rem'
                    }
                  }}
                />
              </Grid>
            </Grid>

            {/* Terms and Conditions */}
            <Box sx={{ mt: 3, mb: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', lineHeight: 1.6 }}>
                By creating an account, you agree to our{' '}
                <Button
                  component={Link}
                  to="/terms"
                  variant="text"
                  sx={{
                    textTransform: 'none',
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                    fontSize: 'inherit',
                    textDecoration: 'underline',
                    p: 0,
                    minWidth: 'auto',
                    '&:hover': {
                      backgroundColor: 'transparent',
                      textDecoration: 'underline'
                    }
                  }}
                >
                  Terms of Service
                </Button>
                {' '}and{' '}
                <Button
                  component={Link}
                  to="/privacy"
                  variant="text"
                  sx={{
                    textTransform: 'none',
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                    fontSize: 'inherit',
                    textDecoration: 'underline',
                    p: 0,
                    minWidth: 'auto',
                    '&:hover': {
                      backgroundColor: 'transparent',
                      textDecoration: 'underline'
                    }
                  }}
                >
                  Privacy Policy
                </Button>
              </Typography>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <IconUserPlus size={20} />}
              sx={{
                py: 1.8,
                borderRadius: 3,
                textTransform: 'none',
                fontSize: '1.1rem',
                fontWeight: 600,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                '&:hover': {
                  boxShadow: `0 6px 25px ${alpha(theme.palette.primary.main, 0.4)}`,
                  transform: 'translateY(-2px)',
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.9)}, ${alpha(theme.palette.secondary.main, 0.9)})`
                },
                '&:disabled': {
                  transform: 'none',
                  background: alpha(theme.palette.primary.main, 0.6)
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                mb: 3
              }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Button
                  component={Link}
                  to="/login"
                  variant="text"
                  sx={{
                    textTransform: 'none',
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.1)
                    }
                  }}
                >
                  Sign In
                </Button>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;
