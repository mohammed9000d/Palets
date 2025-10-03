import React, { useState } from 'react';
import {
  Box,
  Button,
  Alert,
  CircularProgress,
  Typography,
  TextField,
  Grid,
  useTheme,
  alpha
} from '@mui/material';
import {
  IconLock,
  IconCreditCard
} from '@tabler/icons-react';
import configService from '../../services/configService';

const TestStripeForm = ({ 
  amount, 
  billingInfo, 
  onSuccess, 
  onError, 
  disabled = false 
}) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cardInfo, setCardInfo] = useState({
    cardNumber: '4242 4242 4242 4242',
    expiry: '12/25',
    cvv: '123'
  });

  const getApiUrl = (endpoint = '') => {
    if (configService.isInitialized()) {
      return configService.getApiEndpointUrl(endpoint);
    }
    return `/api/${endpoint}`.replace(/\/+/g, '/').replace(/\/$/, '');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Simulate Stripe payment processing
      const response = await fetch(getApiUrl('payments/test/stripe'), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...billingInfo,
          card_info: cardInfo
        })
      });

      if (response.ok) {
        const orderData = await response.json();
        onSuccess(orderData.order);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Payment failed');
      }

    } catch (err) {
      setError('Payment failed. Please try again.');
      onError && onError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
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
              bgcolor: alpha('#635bff', 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <IconCreditCard size={20} color="#635bff" />
          </Box>
          Test Card Details
        </Typography>

        <Alert severity="info" sx={{ mb: 3, borderRadius: '8px' }}>
          <Typography variant="body2" fontWeight={600}>
            🧪 Test Mode - Use the pre-filled test card or enter: 4242 4242 4242 4242
          </Typography>
        </Alert>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Card Number"
              value={cardInfo.cardNumber}
              onChange={(e) => setCardInfo(prev => ({ ...prev, cardNumber: e.target.value }))}
              placeholder="4242 4242 4242 4242"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px'
                }
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Expiry"
              value={cardInfo.expiry}
              onChange={(e) => setCardInfo(prev => ({ ...prev, expiry: e.target.value }))}
              placeholder="MM/YY"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px'
                }
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="CVV"
              value={cardInfo.cvv}
              onChange={(e) => setCardInfo(prev => ({ ...prev, cvv: e.target.value }))}
              placeholder="123"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px'
                }
              }}
            />
          </Grid>
        </Grid>

        <Box 
          sx={{ 
            mt: 3,
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
            This is a test environment. No real payments will be processed.
          </Typography>
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
        type="submit"
        fullWidth
        size="large"
        variant="contained"
        disabled={loading || disabled}
        startIcon={
          loading ? (
            <CircularProgress size={22} color="inherit" />
          ) : (
            <IconCreditCard size={22} />
          )
        }
        sx={{
          py: 3,
          fontSize: '1.1rem',
          fontWeight: 600,
          borderRadius: '12px',
          textTransform: 'none',
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
          '&:hover': {
            boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
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
        {loading ? 'Processing Test Payment...' : `Test Pay $${amount.toFixed(2)} with Stripe`}
      </Button>
    </Box>
  );
};

export default TestStripeForm;
