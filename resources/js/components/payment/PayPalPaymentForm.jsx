import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Alert,
  CircularProgress,
  Typography,
  Paper,
  useTheme,
  alpha
} from '@mui/material';
import {
  IconBrandPaypal,
  IconLock
} from '@tabler/icons-react';
import configService from '../../services/configService';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

const PayPalPaymentForm = ({ 
  amount, 
  billingInfo, 
  onSuccess, 
  onError, 
  disabled = false,
  validateForm
}) => {
  const theme = useTheme();
  const { isAuthenticated } = useAuth();
  const { cartItems } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paypalLoaded, setPaypalLoaded] = useState(false);

  const getApiUrl = (endpoint = '') => {
    if (configService.isInitialized()) {
      return configService.getApiEndpointUrl(endpoint);
    }
    return `/api/${endpoint}`.replace(/\/+/g, '/').replace(/\/$/, '');
  };

  // Load PayPal SDK
  useEffect(() => {
    const loadPayPalSDK = () => {
      if (window.paypal) {
        setPaypalLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${import.meta.env.VITE_PAYPAL_CLIENT_ID || 'test'}&currency=USD`;
      script.async = true;
      script.onload = () => setPaypalLoaded(true);
      script.onerror = () => setError('Failed to load PayPal SDK');
      document.body.appendChild(script);
    };

    loadPayPalSDK();
  }, []);

  const syncGuestCart = async () => {
    if (isAuthenticated || !cartItems.length) {
      return true; // No need to sync for authenticated users or empty carts
    }

    try {
      const response = await fetch(getApiUrl('guest-payments/sync-cart'), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cart_items: cartItems.map(item => ({
            product_id: item.product_id,
            product_type: item.product_type,
            quantity: item.quantity,
            price: item.price,
            product_title: item.product_title,
            product_image: item.product_image,
            options: item.options || {}
          }))
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to sync cart');
      }

      return true;
    } catch (error) {
      console.error('Cart sync failed:', error);
      throw error;
    }
  };

  const handlePayPalPayment = async () => {
    setError('');

    // Validate form before processing payment
    if (validateForm && !validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Step 0: Sync guest cart if needed
      if (!isAuthenticated) {
        await syncGuestCart();
      }

      // Step 1: Create PayPal order on backend
      const endpoint = isAuthenticated ? 'payments/paypal/create-order' : 'guest-payments/paypal/create-order';
      const orderResponse = await fetch(getApiUrl(endpoint), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount
        })
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.message || 'Failed to create PayPal order');
      }

      const { paypal_order_id } = await orderResponse.json();

      // Step 2: Simulate PayPal payment completion
      // In a real implementation, this would be handled by PayPal's SDK
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 3: Confirm payment on backend
      const confirmEndpoint = isAuthenticated ? 'payments/paypal/confirm' : 'guest-payments/paypal/confirm';
      const confirmResponse = await fetch(getApiUrl(confirmEndpoint), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paypal_order_id: paypal_order_id,
          billing_full_name: billingInfo.fullName,
          billing_email: billingInfo.email,
          billing_phone: billingInfo.phone,
          billing_address: billingInfo.address,
          billing_city: billingInfo.city,
          billing_state: billingInfo.state,
          billing_postal_code: billingInfo.postalCode,
          billing_country: billingInfo.country
        })
      });

      if (confirmResponse.ok) {
        const orderData = await confirmResponse.json();
        onSuccess(orderData.order);
      } else {
        const errorData = await confirmResponse.json();
        setError(errorData.message || 'Failed to create order');
      }

    } catch (err) {
      setError(err.message || 'PayPal payment failed. Please try again.');
      onError && onError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 6 }}>
        <Typography 
          variant="h5" 
          sx={{ 
            mb: 4, 
            fontWeight: 600, 
            color: '#0f172a',
            fontSize: '1.5rem',
            letterSpacing: '-0.025em',
            display: 'flex', 
            alignItems: 'center', 
            gap: 3 
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              bgcolor: alpha('#0070ba', 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <IconBrandPaypal size={24} color="#0070ba" />
          </Box>
          PayPal Checkout
        </Typography>

        <Box 
          sx={{ 
            p: 5, 
            borderRadius: '20px',
            bgcolor: alpha('#0070ba', 0.04),
            border: `1px solid ${alpha('#0070ba', 0.2)}`
          }}
        >
          <Typography variant="h6" fontWeight={600} sx={{ mb: 3, color: '#0f172a' }}>
            Secure PayPal Payment
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748b', mb: 4, lineHeight: 1.6, fontSize: '0.95rem' }}>
            Click the button below to be redirected to PayPal where you can complete your payment securely using your PayPal account, credit card, or PayPal Credit.
          </Typography>

          <Box 
            sx={{ 
              p: 4,
              borderRadius: '16px',
              bgcolor: alpha('#10b981', 0.04),
              border: `1px solid ${alpha('#10b981', 0.2)}`
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconLock size={18} color="#10b981" />
              <Typography variant="body1" fontWeight={600} sx={{ color: '#10b981' }}>
                PayPal Buyer Protection
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#64748b', mt: 1, fontSize: '0.9rem', lineHeight: 1.5 }}>
              Get full refund if eligible order doesn't arrive or doesn't match description
            </Typography>
          </Box>
        </Box>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 4,
            borderRadius: '16px',
            bgcolor: alpha(theme.palette.error.main, 0.04),
            border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
            '& .MuiAlert-message': {
              width: '100%'
            }
          }}
        >
          <Typography variant="body1" fontWeight={500} sx={{ color: theme.palette.error.main }}>
            {error}
          </Typography>
        </Alert>
      )}

      <Button
        fullWidth
        size="large"
        variant="contained"
        onClick={handlePayPalPayment}
        disabled={loading || disabled || !paypalLoaded}
        startIcon={
          loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            <IconBrandPaypal size={24} />
          )
        }
        sx={{
          py: 4,
          fontSize: '1.125rem',
          fontWeight: 700,
          borderRadius: '20px',
          textTransform: 'none',
          background: 'linear-gradient(135deg, #0070ba 0%, #005ea6 100%)',
          boxShadow: '0 10px 30px rgba(0, 112, 186, 0.3)',
          border: 'none',
          color: 'white',
          letterSpacing: '-0.025em',
          '&:hover': {
            background: 'linear-gradient(135deg, #005ea6 0%, #004c8c 100%)',
            boxShadow: '0 15px 40px rgba(0, 112, 186, 0.4)',
            transform: 'translateY(-3px)'
          },
          '&:disabled': {
            background: '#e2e8f0',
            color: '#94a3b8',
            boxShadow: 'none',
            transform: 'none'
          },
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {loading ? 'Redirecting to PayPal...' : `Continue with PayPal • $${amount.toFixed(2)}`}
      </Button>
    </Box>
  );
};

export default PayPalPaymentForm;