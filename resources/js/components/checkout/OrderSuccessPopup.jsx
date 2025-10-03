import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  IconButton,
  Fade,
  Slide,
  useTheme,
  alpha,
  Stack,
  Divider,
  Chip
} from '@mui/material';
import {
  IconCheck,
  IconX,
  IconShoppingBag,
  IconCalendar,
  IconMail,
  IconReceipt,
  IconArrowRight,
  IconConfetti
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

const OrderSuccessPopup = ({ 
  open, 
  onClose, 
  orderData, 
  customerEmail,
  isAuthenticated = false,
  cartSummary = {}
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(false);
  const [countdown, setCountdown] = useState(10);

  const handleViewOrders = React.useCallback(() => {
    onClose();
    if (isAuthenticated) {
      navigate('/my-orders');
    } else {
      navigate('/', { 
        state: { 
          orderSuccess: true, 
          orderNumber: orderData?.order_number,
          orderEmail: customerEmail 
        } 
      });
    }
  }, [onClose, isAuthenticated, navigate, orderData?.order_number, customerEmail]);

  useEffect(() => {
    if (open) {
      // Reset countdown
      setCountdown(10);
      
      // Trigger confetti animation after popup opens
      const confettiTimer = setTimeout(() => {
        setShowConfetti(true);
      }, 300);

      // Countdown timer
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            handleViewOrders();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearTimeout(confettiTimer);
        clearInterval(countdownInterval);
      };
    }
  }, [open, handleViewOrders]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog
      open={open}
      onClose={handleViewOrders} // Navigate instead of just closing
      disableEscapeKeyDown={true} // Prevent escape key closing
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '24px',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
          '@keyframes pulse': {
            '0%': {
              opacity: 0.7
            },
            '50%': {
              opacity: 1
            },
            '100%': {
              opacity: 0.7
            }
          }
        }
      }}
      TransitionComponent={Slide}
      TransitionProps={{
        direction: 'up',
        timeout: 600
      }}
    >
      {/* Confetti Animation Background */}
      {showConfetti && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 20% 80%, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 50%),
              radial-gradient(circle at 40% 40%, ${alpha(theme.palette.success.main, 0.1)} 0%, transparent 50%)
            `,
            animation: 'pulse 2s ease-in-out infinite',
            zIndex: 0
          }}
        />
      )}

      <DialogContent sx={{ p: 0, position: 'relative', zIndex: 1 }}>
        {/* Close Button - Navigate instead of just closing */}
        <IconButton
          onClick={handleViewOrders}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 2,
            bgcolor: alpha('#ffffff', 0.9),
            '&:hover': {
              bgcolor: alpha('#ffffff', 1),
              transform: 'scale(1.1)'
            },
            transition: 'all 0.2s ease'
          }}
        >
          <IconX size={20} />
        </IconButton>

        {/* Success Header */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.primary.main} 100%)`,
            color: 'white',
            pt: 4,
            pb: 6,
            px: 6,
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Success Icon with Animation */}
          <Fade in={open} timeout={800}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: alpha('#ffffff', 0.2),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
                animation: showConfetti ? 'bounce 1s ease-in-out' : 'none',
                '@keyframes bounce': {
                  '0%, 20%, 53%, 80%, 100%': {
                    transform: 'translate3d(0,0,0)'
                  },
                  '40%, 43%': {
                    transform: 'translate3d(0,-30px,0)'
                  },
                  '70%': {
                    transform: 'translate3d(0,-15px,0)'
                  },
                  '90%': {
                    transform: 'translate3d(0,-4px,0)'
                  }
                }
              }}
            >
              <IconCheck size={40} stroke={3} />
            </Box>
          </Fade>

          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 2,
              fontSize: { xs: '1.75rem', md: '2.25rem' }
            }}
          >
            Order Confirmed!
          </Typography>

          <Typography
            variant="h6"
            sx={{
              opacity: 0.9,
              fontWeight: 400,
              fontSize: '1.1rem'
            }}
          >
            Thank you for your purchase
          </Typography>
        </Box>

        {/* Order Details */}
        <Box sx={{ p: 4 }}>
          {/* Order Number & Date */}
          <Box
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.04),
              borderRadius: '16px',
              p: 3,
              mb: 4,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
            }}
          >
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconReceipt size={20} color={theme.palette.primary.main} />
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                    Order Number
                  </Typography>
                  <Typography variant="h6" fontWeight={600} sx={{ color: theme.palette.primary.main }}>
                    #{orderData?.order_number || 'N/A'}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ opacity: 0.3 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconCalendar size={20} color={theme.palette.text.secondary} />
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                    Order Date
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {orderData?.created_at ? formatDate(orderData.created_at) : 'Just now'}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ opacity: 0.3 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconMail size={20} color={theme.palette.text.secondary} />
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                    Confirmation Email
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {customerEmail || 'N/A'}
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </Box>

          {/* Order Summary */}
          {cartSummary && (
            <Box
              sx={{
                bgcolor: '#f8fafc',
                borderRadius: '16px',
                p: 3,
                mb: 4
              }}
            >
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: '#0f172a' }}>
                Order Summary
              </Typography>
              
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Subtotal
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {formatPrice(cartSummary.subtotal || 0)}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Shipping
                  </Typography>
                  <Typography variant="body2" fontWeight={500} color="success.main">
                    On delivery
                  </Typography>
                </Box>
                
                <Divider />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6" fontWeight={700}>
                    Total
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color="primary.main">
                    {formatPrice(cartSummary.total || 0)}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          )}

          {/* Status Chip */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Chip
              icon={<IconShoppingBag size={16} />}
              label="Processing Order"
              color="primary"
              variant="outlined"
              sx={{
                px: 2,
                py: 1,
                fontSize: '0.9rem',
                fontWeight: 600,
                borderRadius: '12px'
              }}
            />
          </Box>

          {/* Action Buttons */}
          <Stack spacing={3}>
            <Button
              variant="contained"
              size="large"
              onClick={handleViewOrders}
              endIcon={<IconArrowRight size={20} />}
              sx={{
                py: 2.5,
                borderRadius: '16px',
                fontSize: '1.1rem',
                fontWeight: 600,
                textTransform: 'none',
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`,
                '&:hover': {
                  boxShadow: `0 12px 35px ${alpha(theme.palette.primary.main, 0.4)}`,
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              {isAuthenticated ? 'View My Orders' : 'Continue Shopping'} ({countdown}s)
            </Button>

            {/* Secondary action for authenticated users */}
            {isAuthenticated && (
              <Button
                variant="outlined"
                size="large"
                onClick={() => {
                  onClose();
                  navigate('/');
                }}
                sx={{
                  py: 2,
                  borderRadius: '16px',
                  fontSize: '1rem',
                  fontWeight: 500,
                  textTransform: 'none',
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                  color: theme.palette.primary.main,
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                    transform: 'translateY(-1px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Continue Shopping
              </Button>
            )}

            {/* Info text */}
            <Typography 
              variant="body2" 
              sx={{ 
                textAlign: 'center',
                color: theme.palette.text.secondary,
                fontSize: '0.9rem',
                fontStyle: 'italic'
              }}
            >
              {isAuthenticated 
                ? 'Automatically redirecting to your orders...' 
                : 'Automatically redirecting to continue shopping...'
              }
            </Typography>
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default OrderSuccessPopup;
