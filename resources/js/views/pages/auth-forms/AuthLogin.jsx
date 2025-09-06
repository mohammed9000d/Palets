import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';

// project imports
import AnimateButton from 'ui-component/extended/AnimateButton';
import { useAdminAuth } from 'contexts/AdminAuthContext';

// assets
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// ===============================|| JWT - LOGIN ||=============================== //

export default function AuthLogin() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { login, loginLoading } = useAdminAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [checked, setChecked] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    general: ''
  });
  const [touched, setTouched] = useState({
    email: false,
    password: false
  });

  // Validation helper functions
  const validateEmail = (email) => {
    if (!email) {
      return 'Email address is required';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validatePassword = (password) => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    return '';
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'email':
        return validateEmail(value);
      case 'password':
        return validatePassword(value);
      default:
        return '';
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    
    setFormData({
      ...formData,
      [name]: value
    });

    // Real-time validation - only show errors for touched fields
    if (touched[name]) {
      const fieldError = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: fieldError,
        general: '' // Clear general error when user starts typing
      }));
    }
  };

  const handleBlur = (event) => {
    const { name, value } = event.target;
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Validate field on blur
    const fieldError = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: fieldError
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Mark all fields as touched
    setTouched({
      email: true,
      password: true
    });

    // Validate all fields
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);

    const newErrors = {
      email: emailError,
      password: passwordError,
      general: ''
    };

    setErrors(newErrors);

    // If there are validation errors, don't submit
    if (emailError || passwordError) {
      return;
    }

    // Clear all errors before attempting login
    setErrors({ email: '', password: '', general: '' });

    const result = await login(formData.email, formData.password);
    if (result.success) {
      // Redirect to admin dashboard on successful login
      navigate('/admin', { replace: true });
    } else {
      // Enhanced error messages based on common login failures
      let errorMessage = result.message || 'Login failed';
      
      // Check if it's actually a network error or authentication failure
      if (result.message?.toLowerCase().includes('network error occurred')) {
        // This is likely an authentication failure, not a real network error
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      } else if (result.message?.toLowerCase().includes('invalid') || 
                 result.message?.toLowerCase().includes('incorrect') ||
                 result.message?.toLowerCase().includes('unauthorized') ||
                 result.message?.toLowerCase().includes('credentials')) {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      } else if (result.message?.toLowerCase().includes('network') && 
                 !result.message?.toLowerCase().includes('network error occurred')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (result.message?.toLowerCase().includes('server')) {
        errorMessage = 'Server error. Please try again later or contact support if the problem persists.';
      }
      
      setErrors(prev => ({
        ...prev,
        general: errorMessage
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {errors.general && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errors.general}
        </Alert>
      )}
      
      <FormControl fullWidth sx={{ ...theme.typography.customInput }} error={!!errors.email}>
        <InputLabel htmlFor="outlined-adornment-email-login">Email Address</InputLabel>
        <OutlinedInput 
          id="outlined-adornment-email-login" 
          type="email" 
          value={formData.email} 
          name="email"
          onChange={handleChange}
          onBlur={handleBlur}
          label="Email Address"
          error={!!errors.email}
        />
        {errors.email && (
          <FormHelperText error>
            {errors.email}
          </FormHelperText>
        )}
      </FormControl>

      <FormControl fullWidth sx={{ ...theme.typography.customInput }} error={!!errors.password}>
        <InputLabel htmlFor="outlined-adornment-password-login">Password</InputLabel>
        <OutlinedInput
          id="outlined-adornment-password-login"
          type={showPassword ? 'text' : 'password'}
          value={formData.password}
          name="password"
          onChange={handleChange}
          onBlur={handleBlur}
          error={!!errors.password}
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleClickShowPassword}
                onMouseDown={handleMouseDownPassword}
                edge="end"
                size="large"
              >
                {showPassword ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </InputAdornment>
          }
          label="Password"
        />
        {errors.password && (
          <FormHelperText error>
            {errors.password}
          </FormHelperText>
        )}
      </FormControl>

      <Grid container sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Grid>
          <FormControlLabel
            control={<Checkbox checked={checked} onChange={(event) => setChecked(event.target.checked)} name="checked" color="primary" />}
            label="Keep me logged in"
          />
        </Grid>
      </Grid>
      <Box sx={{ mt: 2 }}>
        <AnimateButton>
          <Button 
            color="secondary" 
            fullWidth 
            size="large" 
            type="submit" 
            variant="contained"
            disabled={loginLoading || !!errors.email || !!errors.password || !formData.email || !formData.password}
          >
            {loginLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </AnimateButton>
      </Box>
    </form>
  );
}
