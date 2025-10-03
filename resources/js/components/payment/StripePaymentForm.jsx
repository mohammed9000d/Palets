import React, { useState } from 'react';
import {
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
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
  IconLock,
  IconCreditCard
} from '@tabler/icons-react';
import configService from '../../services/configService';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

const StripePaymentForm = ({ 
  amount, 
  billingInfo, 
  onSuccess, 
  onError, 
  disabled = false,
  validateForm
}) => {
  const theme = useTheme();
  const stripe = useStripe();
  const elements = useElements();
  const { isAuthenticated } = useAuth();
  const { cartItems } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getApiUrl = (endpoint = '') => {
    if (configService.isInitialized()) {
      return configService.getApiEndpointUrl(endpoint);
    }
    return `/api/${endpoint}`.replace(/\/+/g, '/').replace(/\/$/, '');
  };

  // Convert country names to ISO 3166-1 alpha-2 codes
  const getCountryCode = (countryName) => {
    const countryMap = {
      'egypt': 'EG',
      'united states': 'US',
      'usa': 'US',
      'united kingdom': 'GB',
      'uk': 'GB',
      'canada': 'CA',
      'france': 'FR',
      'germany': 'DE',
      'italy': 'IT',
      'spain': 'ES',
      'australia': 'AU',
      'japan': 'JP',
      'china': 'CN',
      'india': 'IN',
      'brazil': 'BR',
      'mexico': 'MX',
      'netherlands': 'NL',
      'sweden': 'SE',
      'norway': 'NO',
      'denmark': 'DK',
      'finland': 'FI',
      'poland': 'PL',
      'russia': 'RU',
      'south africa': 'ZA',
      'saudi arabia': 'SA',
      'uae': 'AE',
      'united arab emirates': 'AE',
      'turkey': 'TR',
      'greece': 'GR',
      'portugal': 'PT',
      'ireland': 'IE',
      'belgium': 'BE',
      'switzerland': 'CH',
      'austria': 'AT',
      'czech republic': 'CZ',
      'hungary': 'HU',
      'romania': 'RO',
      'bulgaria': 'BG',
      'croatia': 'HR',
      'slovenia': 'SI',
      'slovakia': 'SK',
      'lithuania': 'LT',
      'latvia': 'LV',
      'estonia': 'EE'
    };

    const normalizedCountry = countryName.toLowerCase().trim();
    return countryMap[normalizedCountry] || countryName.toUpperCase().substring(0, 2);
  };

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

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: theme.palette.text.primary,
        fontFamily: theme.typography.fontFamily,
        '::placeholder': {
          color: theme.palette.text.secondary,
        },
        iconColor: theme.palette.primary.main,
      },
      invalid: {
        color: theme.palette.error.main,
        iconColor: theme.palette.error.main,
      },
    },
    hidePostalCode: true,
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!stripe || !elements || disabled) {
      return;
    }

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

      // Step 1: Create payment intent on backend
      const endpoint = isAuthenticated ? 'payments/stripe/create-intent' : 'guest-payments/stripe/create-intent';
      const intentResponse = await fetch(getApiUrl(endpoint), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          currency: 'usd'
        })
      });

      if (!intentResponse.ok) {
        const errorData = await intentResponse.json();
        throw new Error(errorData.message || 'Failed to create payment intent');
      }

      const { client_secret, payment_intent_id } = await intentResponse.json();

      // Step 2: Confirm payment with Stripe
      const cardElement = elements.getElement(CardElement);
      
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: billingInfo.fullName,
            email: billingInfo.email,
            phone: billingInfo.phone,
            address: {
              line1: billingInfo.address,
              city: billingInfo.city,
              state: billingInfo.state,
              postal_code: billingInfo.postalCode,
              country: getCountryCode(billingInfo.country), // Convert to country code
            },
          },
        },
      });

      if (stripeError) {
        setError(stripeError.message);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        // Step 3: Confirm payment on backend and create order
        const confirmEndpoint = isAuthenticated ? 'payments/stripe/confirm' : 'guest-payments/stripe/confirm';
        const confirmResponse = await fetch(getApiUrl(confirmEndpoint), {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            payment_intent_id: paymentIntent.id,
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
      } else {
        setError('Payment was not completed successfully');
      }

    } catch (err) {
      setError(err.message || 'Payment failed. Please try again.');
      onError && onError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
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
              bgcolor: alpha('#635bff', 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <IconCreditCard size={24} color="#635bff" />
          </Box>
          Card Details
        </Typography>

        <Box 
          sx={{ 
            p: 5, 
            border: `2px solid #e2e8f0`, 
            borderRadius: '20px',
            bgcolor: '#f8fafc',
            transition: 'all 0.3s ease',
            '&:focus-within': {
              borderColor: theme.palette.primary.main,
              bgcolor: 'white',
              boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.1)}`,
              transform: 'translateY(-2px)'
            }
          }}
        >
          <CardElement options={cardElementOptions} />
        </Box>

        <Box 
          sx={{ 
            mt: 4,
            p: 4,
            borderRadius: '16px',
            bgcolor: alpha('#10b981', 0.04),
            border: `1px solid ${alpha('#10b981', 0.2)}`
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconLock size={18} color="#10b981" />
            <Typography variant="body1" fontWeight={600} sx={{ color: '#10b981' }}>
              Secured by Stripe
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 1, fontSize: '0.9rem', lineHeight: 1.5 }}>
            Your card information is encrypted and never stored on our servers
          </Typography>
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
        type="submit"
        fullWidth
        size="large"
        variant="contained"
        disabled={!stripe || loading || disabled}
        startIcon={
          loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            <IconCreditCard size={24} />
          )
        }
        sx={{
          py: 4,
          fontSize: '1.125rem',
          fontWeight: 700,
          borderRadius: '20px',
          textTransform: 'none',
          background: 'linear-gradient(135deg, #635bff 0%, #4f46e5 100%)',
          boxShadow: '0 10px 30px rgba(99, 91, 255, 0.3)',
          border: 'none',
          color: 'white',
          letterSpacing: '-0.025em',
          '&:hover': {
            background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
            boxShadow: '0 15px 40px rgba(99, 91, 255, 0.4)',
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
        {loading ? 'Processing Payment...' : `Complete Payment • $${amount.toFixed(2)}`}
      </Button>
    </Box>
  );
};

export default StripePaymentForm;