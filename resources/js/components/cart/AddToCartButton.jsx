import React, { useState } from 'react';
import {
  Button,
  Box,
  IconButton,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
  alpha
} from '@mui/material';
import {
  IconShoppingCart,
  IconMinus,
  IconPlus,
  IconCheck
} from '@tabler/icons-react';
import { useCart } from '../../contexts/CartContext';
import { useTheme } from '@mui/material/styles';

const AddToCartButton = ({ 
  product, 
  productType = 'product',
  initialQuantity = 1,
  disabled = false,
  variant = 'contained',
  size = 'large',
  fullWidth = false,
  showQuantityControls = false,
  customOptions = {}
}) => {
  const theme = useTheme();
  const { addToCart, loading } = useCart();
  const [quantity, setQuantity] = useState(initialQuantity);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    if (!product || disabled) return;

    setIsAdding(true);
    setError('');

    try {
      const result = await addToCart(product, quantity, customOptions);
      
      if (result.success) {
        setShowSuccess(true);
        // Reset quantity to 1 after successful add
        setQuantity(1);
      } else {
        setError(result.message || 'Failed to add to cart');
      }
    } catch (err) {
      setError('Failed to add to cart');
    } finally {
      setIsAdding(false);
    }
  };

  const incrementQuantity = () => {
    setQuantity(prev => Math.min(prev + 1, 10));
  };

  const decrementQuantity = () => {
    setQuantity(prev => Math.max(prev - 1, 1));
  };

  const handleCloseSnackbar = () => {
    setShowSuccess(false);
    setError('');
  };

  const isProductAvailable = () => {
    return product?.in_stock;
  };

  const getButtonText = () => {
    if (isAdding) return 'Adding...';
    if (!isProductAvailable()) return 'Unavailable';
    return 'Add to Cart';
  };

  const isDisabled = disabled || !isProductAvailable() || isAdding || loading;

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Quantity Controls */}
        {showQuantityControls && isProductAvailable() && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              Quantity:
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              overflow: 'hidden'
            }}>
              <IconButton
                size="small"
                onClick={decrementQuantity}
                disabled={quantity <= 1 || isDisabled}
                sx={{ borderRadius: 0, px: 2 }}
              >
                <IconMinus size={16} />
              </IconButton>
              <Typography sx={{ 
                px: 3, 
                py: 1, 
                minWidth: 60, 
                textAlign: 'center',
                borderLeft: `1px solid ${theme.palette.divider}`,
                borderRight: `1px solid ${theme.palette.divider}`,
                fontWeight: 600
              }}>
                {quantity}
              </Typography>
              <IconButton
                size="small"
                onClick={incrementQuantity}
                disabled={quantity >= 10 || isDisabled}
                sx={{ borderRadius: 0, px: 2 }}
              >
                <IconPlus size={16} />
              </IconButton>
            </Box>
          </Box>
        )}

        {/* Add to Cart Button */}
        <Button
          variant={variant}
          size={size}
          fullWidth={fullWidth}
          onClick={handleAddToCart}
          disabled={isDisabled}
          startIcon={
            isAdding ? (
              <CircularProgress size={20} color="inherit" />
            ) : showSuccess ? (
              <IconCheck size={20} />
            ) : (
              <IconShoppingCart size={20} />
            )
          }
          sx={{
            py: size === 'large' ? 2 : 1.5,
            fontSize: size === 'large' ? '1.1rem' : '1rem',
            fontWeight: 600,
            borderRadius: 3,
            textTransform: 'none',
            ...(variant === 'contained' && {
              bgcolor: showSuccess ? theme.palette.success.main : theme.palette.primary.main,
              color: 'white',
              boxShadow: showSuccess 
                ? `0 4px 12px ${alpha(theme.palette.success.main, 0.3)}`
                : `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
              '&:hover': {
                bgcolor: showSuccess ? theme.palette.success.dark : theme.palette.primary.dark,
                boxShadow: showSuccess
                  ? `0 6px 16px ${alpha(theme.palette.success.main, 0.4)}`
                  : `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`
              },
              '&:disabled': {
                bgcolor: theme.palette.grey[300],
                color: theme.palette.grey[500],
                boxShadow: 'none'
              }
            }),
            ...(variant === 'outlined' && {
              borderColor: showSuccess ? theme.palette.success.main : theme.palette.primary.main,
              color: showSuccess ? theme.palette.success.main : theme.palette.primary.main,
              '&:hover': {
                borderColor: showSuccess ? theme.palette.success.dark : theme.palette.primary.dark,
                bgcolor: showSuccess 
                  ? alpha(theme.palette.success.main, 0.05)
                  : alpha(theme.palette.primary.main, 0.05)
              }
            })
          }}
        >
          {showSuccess ? 'Added to Cart!' : getButtonText()}
        </Button>
      </Box>

      {/* Success/Error Snackbars */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity="success" 
          variant="filled"
          sx={{ width: '100%' }}
        >
          Product added to cart successfully!
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity="error" 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AddToCartButton;
