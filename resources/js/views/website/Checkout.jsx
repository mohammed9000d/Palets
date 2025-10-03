import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Button,
  TextField,
  FormControlLabel,
  Radio,
  Alert,
  CircularProgress,
  Paper,
  Stack,
  useTheme,
  alpha,
  Avatar,
  Chip,
  Divider
} from '@mui/material';
import {
  IconCreditCard,
  IconBrandPaypal,
  IconBrandStripe,
  IconShoppingBag,
  IconUser,
  IconMapPin,
  IconMail,
  IconPhone,
  IconArrowLeft,
  IconLock,
  IconShoppingCart
} from '@tabler/icons-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import StripePaymentForm from '../../components/payment/StripePaymentForm';
import PayPalPaymentForm from '../../components/payment/PayPalPaymentForm';
import OrderSuccessPopup from '../../components/checkout/OrderSuccessPopup';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51234567890');

const Checkout = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { cartItems, cartSummary, loading: cartLoading, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [paymentSuccessful, setPaymentSuccessful] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [orderData, setOrderData] = useState(null);

  const [billingInfo, setBillingInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });

  // Update billing info when user data changes or component mounts
  useEffect(() => {
    if (isAuthenticated && user) {
      setBillingInfo({
        fullName: user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.street_address || user.billing_street_address || '',
        city: user.city || user.billing_city || '',
        state: user.state || user.billing_state || '',
        postalCode: user.postal_code || user.billing_postal_code || '',
        country: user.country || user.billing_country || '',
      });
    }
  }, [isAuthenticated, user]);

  // Redirect to cart if empty (but not if payment was successful)
  useEffect(() => {
    if (!cartLoading && cartItems.length === 0 && !paymentSuccessful) {
      navigate('/cart');
    }
  }, [cartItems, cartLoading, navigate, paymentSuccessful]);

  const handleBillingInfoChange = (field, value) => {
    setBillingInfo(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Static Italy country code
  const ITALY_COUNTRY_CODE = '+39';

  // Helper function to get common TextField props
  const getTextFieldProps = (field, label, type = 'text') => {
    const baseProps = {
      fullWidth: true,
      label,
      type,
      value: billingInfo[field],
      onChange: (e) => handleBillingInfoChange(field, e.target.value),
      required: ['fullName', 'email', 'phone', 'address', 'city', 'country'].includes(field),
      error: !!fieldErrors[field],
      helperText: fieldErrors[field],
      sx: {
        '& .MuiOutlinedInput-root': {
          borderRadius: '12px',
          bgcolor: '#f8fafc',
          border: '1px solid #e2e8f0',
          '&:hover': {
            bgcolor: 'white',
            borderColor: '#cbd5e1'
          },
          '&.Mui-focused': {
            bgcolor: 'white',
            borderColor: theme.palette.primary.main,
            boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`
          },
          '&.Mui-error': {
            borderColor: theme.palette.error.main,
            '&:hover': {
              borderColor: theme.palette.error.main,
            }
          }
        },
        '& .MuiInputLabel-root': {
          color: '#64748b',
          fontWeight: 500
        },
        '& .MuiFormHelperText-root': {
          marginLeft: 0,
          marginTop: 1,
          fontSize: '0.875rem'
        }
      }
    };

    // Special handling for phone field
    if (field === 'phone') {
      baseProps.placeholder = 'e.g., 123 456 7890';
      baseProps.helperText = fieldErrors[field] || 'Italian phone number without country code';
      baseProps.InputProps = {
        startAdornment: (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1.5,
            pr: 1.5,
            borderRight: `1px solid #e2e8f0`,
            mr: 1.5
          }}>
            <IconPhone size={18} color="#64748b" />
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#0f172a',
                fontWeight: 600,
                fontSize: '0.95rem'
              }}
            >
              {ITALY_COUNTRY_CODE}
            </Typography>
          </Box>
        )
      };
    }

    return baseProps;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const [fieldErrors, setFieldErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    const required = ['fullName', 'email', 'phone', 'address', 'city', 'country'];
    
    // Check required fields
    for (let field of required) {
      if (!billingInfo[field].trim()) {
        const fieldName = field === 'fullName' ? 'Full Name' : 
                         field === 'postalCode' ? 'Postal Code' :
                         field.charAt(0).toUpperCase() + field.slice(1);
        errors[field] = `${fieldName} is required`;
      }
    }

    // Email validation
    if (billingInfo.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(billingInfo.email)) {
        errors.email = 'Please enter a valid email address';
      }
    }

    // Italian phone validation (without country code)
    if (billingInfo.phone.trim()) {
      // Italian phone numbers: 10 digits, can start with 3 (mobile) or other digits (landline)
      const phoneRegex = /^[0-9]{8,11}$/;
      const cleanPhone = billingInfo.phone.replace(/[\s\-\(\)]/g, '');
      if (!phoneRegex.test(cleanPhone)) {
        errors.phone = 'Please enter a valid Italian phone number (8-11 digits)';
      }
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      // Scroll to the contact information section
      const contactSection = document.querySelector('[data-section="contact-info"]');
      if (contactSection) {
        contactSection.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      }
      
      // Set a general error message
      const firstError = Object.values(errors)[0];
      setError(firstError);
      return false;
    }

    setError('');
    return true;
  };

  const handlePaymentSuccess = async (order) => {
    setPaymentSuccessful(true); // Set flag to prevent cart redirect
    setError('');
    setSuccess(''); // Clear any previous success messages
    
    // Store order data for the popup
    setOrderData(order);
    
    // Clear the cart from frontend context
    try {
      await clearCart();
    } catch (error) {
      console.error('Error clearing cart from frontend:', error);
      // Don't show error to user since payment was successful
    }
    
    // Show the success popup
    setShowSuccessPopup(true);
  };

  const handlePaymentError = (error) => {
    setError(error.message || 'Payment failed. Please try again.');
    setLoading(false);
  };

  if (cartLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (cartItems.length === 0 && !paymentSuccessful) {
    return null;
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: '#fafafa',
      display: { xs: 'block', md: 'flex' } 
    }}>
      {/* Left Side - Checkout Form (60%) */}
      <Box sx={{ 
        width: { xs: '100%', md: '60%' }, 
        bgcolor: 'white', 
        p: { xs: 4, sm: 5, md: 8 },
        overflowY: 'auto',
        minHeight: { xs: 'auto', md: '100vh' },
        order: { xs: 2, md: 1 }
      }}>
        {/* Header */}
        <Box sx={{ mb: 6 }}>
          <Button
            component={Link}
            to="/cart"
            startIcon={<IconArrowLeft size={20} />}
            sx={{ 
              color: '#64748b',
              textTransform: 'none',
              mb: 4,
              fontSize: '0.95rem',
              fontWeight: 500,
              p: 0,
              '&:hover': {
                bgcolor: 'transparent',
                color: '#334155'
              }
            }}
          >
            Back to Cart
          </Button>
          
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 600, 
              color: '#0f172a', 
              mb: 2,
              fontSize: { xs: '2rem', md: '2.5rem' },
              letterSpacing: '-0.025em'
            }}
          >
            Checkout
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconLock size={18} color="#10b981" />
            <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.95rem' }}>
              Secure SSL encrypted checkout
            </Typography>
          </Box>
        </Box>

        {/* Contact Information */}
        <Box sx={{ mb: 8 }} data-section="contact-info">
          <Typography 
            variant="h5" 
            sx={{ 
              mb: 4, 
              fontWeight: 600, 
              color: '#0f172a',
              fontSize: '1.5rem',
              letterSpacing: '-0.025em'
            }}
          >
            Contact Information
          </Typography>
          
          <Stack spacing={4}>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <TextField {...getTextFieldProps('fullName', 'Full Name')} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField {...getTextFieldProps('email', 'Email', 'email')} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField {...getTextFieldProps('phone', 'Phone', 'tel')} />
              </Grid>
              <Grid item xs={12}>
                <TextField {...getTextFieldProps('address', 'Address')} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField {...getTextFieldProps('city', 'City')} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField {...getTextFieldProps('country', 'Country')} />
              </Grid>
            </Grid>
          </Stack>
        </Box>

        {/* Payment Method */}
        <Box sx={{ mb: 8 }}>
          <Typography 
            variant="h5" 
            sx={{ 
              mb: 4, 
              fontWeight: 600, 
              color: '#0f172a',
              fontSize: '1.5rem',
              letterSpacing: '-0.025em'
            }}
          >
            Payment Method
          </Typography>
          
          <Stack spacing={3}>
            <Box
              onClick={() => setPaymentMethod('stripe')}
              sx={{
                p: 4,
                border: `2px solid ${paymentMethod === 'stripe' ? theme.palette.primary.main : '#e2e8f0'}`,
                borderRadius: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                bgcolor: paymentMethod === 'stripe' ? alpha(theme.palette.primary.main, 0.03) : '#f8fafc',
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Radio
                  checked={paymentMethod === 'stripe'}
                  sx={{ 
                    color: theme.palette.primary.main,
                    '&.Mui-checked': {
                      color: theme.palette.primary.main
                    }
                  }}
                />
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
                  <IconBrandStripe size={24} color="#635bff" />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" fontWeight={600} sx={{ color: '#0f172a', mb: 0.5 }}>
                    Credit/Debit Card
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.9rem' }}>
                    Secure payment with Stripe
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            <Box
              onClick={() => setPaymentMethod('paypal')}
              sx={{
                p: 4,
                border: `2px solid ${paymentMethod === 'paypal' ? '#0070ba' : '#e2e8f0'}`,
                borderRadius: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                bgcolor: paymentMethod === 'paypal' ? alpha('#0070ba', 0.03) : '#f8fafc',
                '&:hover': {
                  borderColor: '#0070ba',
                  bgcolor: alpha('#0070ba', 0.05),
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Radio
                  checked={paymentMethod === 'paypal'}
                  sx={{ 
                    color: '#0070ba',
                    '&.Mui-checked': {
                      color: '#0070ba'
                    }
                  }}
                />
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
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" fontWeight={600} sx={{ color: '#0f172a', mb: 0.5 }}>
                    PayPal
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.9rem' }}>
                    Pay with PayPal account
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Stack>
        </Box>

        {/* Payment Forms - Real Integration */}
        {paymentMethod === 'stripe' && (
          <Elements stripe={stripePromise}>
            <StripePaymentForm
              amount={cartSummary.total}
              billingInfo={billingInfo}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              disabled={loading}
              validateForm={validateForm}
            />
          </Elements>
        )}

        {paymentMethod === 'paypal' && (
          <PayPalPaymentForm
            amount={cartSummary.total}
            billingInfo={billingInfo}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            disabled={loading}
            validateForm={validateForm}
          />
        )}

        {/* Messages */}
        {error && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {error}
          </Alert>
        )}
      </Box>

      {/* Right Side - Order Summary (40%, Sticky) */}
      <Box sx={{ 
        width: { xs: '100%', md: '40%' }, 
        bgcolor: '#f8fafc',
        position: { xs: 'relative', md: 'sticky' },
        top: { md: 0 },
        height: { xs: 'auto', md: '100vh' },
        overflowY: { md: 'auto' },
        p: { xs: 4, sm: 5, md: 6 },
        borderLeft: { md: '1px solid #e2e8f0' },
        order: { xs: 1, md: 2 }
      }}>
        <Typography 
          variant="h5" 
          sx={{ 
            mb: 6, 
            fontWeight: 600, 
            color: '#0f172a',
            fontSize: '1.5rem',
            letterSpacing: '-0.025em'
          }}
        >
          Order Summary
        </Typography>

        {/* Cart Items */}
        <Stack spacing={3} sx={{ mb: 6 }}>
          {cartItems.filter(item => item.available !== false).map((item) => (
            <Box
              key={item.id}
              sx={{ 
                p: 4,
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                bgcolor: 'white',
                transition: 'all 0.2s ease',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                }
              }}
            >
              <Box sx={{ display: 'flex', gap: 3 }}>
                <Avatar
                  src={item.product_image}
                  variant="rounded"
                  sx={{ 
                    width: 56, 
                    height: 56,
                    borderRadius: '12px'
                  }}
                >
                  <IconShoppingCart size={20} />
                </Avatar>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography 
                    variant="body1" 
                    fontWeight={600} 
                    sx={{ 
                      fontSize: '0.95rem',
                      lineHeight: 1.4,
                      color: '#0f172a',
                      mb: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {item.product_title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.85rem' }}>
                      Qty: {item.quantity}
                    </Typography>
                    {item.options?.custom_dimensions && (
                      <Chip
                        label="Custom"
                        size="small"
                        variant="outlined"
                        sx={{ 
                          height: 20, 
                          fontSize: '0.7rem',
                          borderColor: '#e2e8f0',
                          color: '#64748b'
                        }}
                      />
                    )}
                  </Box>
                  <Typography 
                    variant="body1" 
                    fontWeight={700} 
                    sx={{ 
                      color: theme.palette.primary.main,
                      fontSize: '1rem'
                    }}
                  >
                    {formatPrice(item.price * item.quantity)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Stack>

        {/* Order Totals */}
        <Box sx={{ 
          p: 5, 
          borderRadius: '20px', 
          border: '1px solid #e2e8f0', 
          bgcolor: 'white',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
        }}>
          <Stack spacing={3}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body1" sx={{ color: '#64748b', fontSize: '0.95rem' }}>
                Subtotal
              </Typography>
              <Typography variant="body1" fontWeight={600} sx={{ color: '#0f172a' }}>
                {formatPrice(cartSummary.subtotal)}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body1" sx={{ color: '#64748b', fontSize: '0.95rem' }}>
                Shipping
              </Typography>
              <Typography variant="body1" fontWeight={600} sx={{ color: '#10b981' }}>
                On delivery
              </Typography>
            </Box>
            
            <Divider sx={{ my: 2, borderColor: '#e2e8f0' }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography 
                variant="h6" 
                fontWeight={700}
                sx={{ 
                  color: '#0f172a',
                  fontSize: '1.25rem'
                }}
              >
                Total
              </Typography>
              <Typography 
                variant="h6" 
                fontWeight={700} 
                sx={{ 
                  color: theme.palette.primary.main,
                  fontSize: '1.25rem'
                }}
              >
                {formatPrice(cartSummary.total)}
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Security Info */}
        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: 2,
            mb: 2
          }}>
            <IconLock size={18} color="#10b981" />
            <Typography variant="body1" sx={{ color: '#10b981', fontWeight: 600 }}>
              Secure Checkout
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Your information is protected with 256-bit SSL encryption
          </Typography>
        </Box>
      </Box>

      {/* Order Success Popup */}
      <OrderSuccessPopup
        open={showSuccessPopup}
        onClose={() => {
          setShowSuccessPopup(false);
          // Always navigate after closing popup
          if (isAuthenticated) {
            navigate('/my-orders');
          } else {
            navigate('/');
          }
        }}
        orderData={orderData}
        customerEmail={billingInfo.email}
        isAuthenticated={isAuthenticated}
        cartSummary={cartSummary}
      />
    </Box>
  );
};

export default Checkout;