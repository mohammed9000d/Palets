import React, { useState } from 'react';
import {
  Box,
  Button,
  Alert,
  CircularProgress,
  Typography,
  useTheme,
  alpha
} from '@mui/material';
import {
  IconBrandPaypal,
  IconLock
} from '@tabler/icons-react';
import configService from '../../services/configService';

const TestPayPalForm = ({ 
  amount, 
  billingInfo, 
  onSuccess, 
  onError, 
  disabled = false 
}) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getApiUrl = (endpoint = '') => {
    if (configService.isInitialized()) {
      return configService.getApiEndpointUrl(endpoint);
    }
    return `/api/${endpoint}`.replace(/\/+/g, '/').replace(/\/$/, '');
  };

  const handlePayPalPayment = async () => {
    setLoading(true);
    setError('');

    try {
      // Simulate PayPal payment processing
      const response = await fetch(getApiUrl('payments/test/paypal'), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(billingInfo)
      });

      if (response.ok) {
        const orderData = await response.json();
        onSuccess(orderData.order);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'PayPal payment failed');
      }

    } catch (err) {
      setError('PayPal payment failed. Please try again.');
      onError && onError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 3, 
            fontWeight: 600, 
            color: '#1a202c',
            display: 'flex', 
            alignItems: 'center', 
            gap: 2 
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              bgcolor: alpha('#0070ba', 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <IconBrandPaypal size={20} color="#0070ba" />
          </Box>
          Test PayPal Payment
        </Typography>

        <Alert severity="info" sx={{ mb: 3, borderRadius: '8px' }}>
          <Typography variant="body2" fontWeight={600}>
            🧪 Test Mode - This will simulate a successful PayPal payment
          </Typography>
        </Alert>

        <Box 
          sx={{ 
            p: 4, 
            borderRadius: '12px',
            bgcolor: alpha('#0070ba', 0.04),
            border: `1px solid ${alpha('#0070ba', 0.2)}`
          }}
        >
          <Typography variant="body1" fontWeight={600} sx={{ mb: 2, color: '#1a202c' }}>
            Test PayPal Payment
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
            Click the button below to simulate a successful PayPal payment. In production, this would redirect to PayPal's secure payment page.
          </Typography>

          <Box 
            sx={{ 
              p: 3,
              borderRadius: '8px',
              bgcolor: alpha(theme.palette.success.main, 0.04),
              border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconLock size={16} color={theme.palette.success.main} />
              <Typography variant="body2" fontWeight={600} sx={{ color: theme.palette.success.main }}>
                Test Mode - No Real Charges
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.8rem' }}>
              This will create a test order without processing real payment
            </Typography>
          </Box>
        </Box>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            borderRadius: '8px'
          }}
        >
          {error}
        </Alert>
      )}

      <Button
        fullWidth
        size="large"
        variant="contained"
        onClick={handlePayPalPayment}
        disabled={loading || disabled}
        startIcon={
          loading ? (
            <CircularProgress size={22} color="inherit" />
          ) : (
            <IconBrandPaypal size={22} />
          )
        }
        sx={{
          py: 3,
          fontSize: '1.1rem',
          fontWeight: 600,
          borderRadius: '12px',
          textTransform: 'none',
          background: 'linear-gradient(135deg, #0070ba 0%, #005ea6 100%)',
          boxShadow: '0 4px 12px rgba(0, 112, 186, 0.3)',
          '&:hover': {
            boxShadow: '0 6px 16px rgba(0, 112, 186, 0.4)',
            transform: 'translateY(-1px)'
          },
          '&:disabled': {
            background: theme.palette.grey[300],
            color: theme.palette.grey[500],
            boxShadow: 'none',
            transform: 'none'
          }
        }}
      >
        {loading ? 'Processing Test Payment...' : `Test Pay $${amount.toFixed(2)} with PayPal`}
      </Button>
    </Box>
  );
};

export default TestPayPalForm;
