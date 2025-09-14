import React, { useState } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Box,
  Typography,
  Divider,
  Button,
  Avatar,
  CircularProgress,
  alpha,
  Paper
} from '@mui/material';
import {
  IconShoppingCart,
  IconTrash,
  IconShoppingBag,
  IconX
} from '@tabler/icons-react';
import { useCart } from '../../contexts/CartContext';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

const CartIcon = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { cartItems, cartSummary, loading, removeFromCart, clearCart } = useCart();
  const [anchorEl, setAnchorEl] = useState(null);
  const [removingItems, setRemovingItems] = useState(new Set());

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleRemoveItem = async (itemId) => {
    setRemovingItems(prev => new Set([...prev, itemId]));
    try {
      await removeFromCart(itemId);
    } finally {
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleViewCart = () => {
    handleClose();
    navigate('/cart');
  };

  const handleCheckout = () => {
    handleClose();
    navigate('/checkout');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton
        onClick={handleClick}
        sx={{
          color: theme.palette.text.primary,
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.1)
          }
        }}
      >
        <Badge 
          badgeContent={cartSummary.itemsCount} 
          color="primary"
          sx={{
            '& .MuiBadge-badge': {
              fontSize: '0.75rem',
              fontWeight: 'bold',
              minWidth: 20,
              height: 20
            }
          }}
        >
          <IconShoppingCart size={24} />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          elevation: 8,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            minWidth: 350,
            maxWidth: 400,
            borderRadius: 3,
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* Header */}
        <Box sx={{ px: 3, py: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconShoppingBag size={20} color={theme.palette.primary.main} />
              Shopping Cart
            </Typography>
            <IconButton
              size="small"
              onClick={handleClose}
              sx={{ color: theme.palette.text.secondary }}
            >
              <IconX size={18} />
            </IconButton>
          </Box>
          {cartSummary.itemsCount > 0 && (
            <Box sx={{ mt: 0.5 }}>
              <Typography variant="body2" color="text.secondary">
                {cartSummary.itemsCount} item{cartSummary.itemsCount !== 1 ? 's' : ''}
              </Typography>
              {cartSummary.unavailable_items_count > 0 && (
                <Typography 
                  variant="caption" 
                  color="error.main" 
                  sx={{ 
                    fontWeight: 600,
                    display: 'block'
                  }}
                >
                  {cartSummary.unavailable_items_count} unavailable
                </Typography>
              )}
            </Box>
          )}
        </Box>

        {/* Cart Items */}
        <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={24} />
            </Box>
          ) : cartItems.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4, px: 3 }}>
              <IconShoppingCart size={48} color={theme.palette.text.disabled} />
              <Typography variant="body1" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
                Your cart is empty
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Add some products to get started
              </Typography>
            </Box>
          ) : (
            cartItems.map((item, index) => (
              <MenuItem
                key={item.id}
                sx={{
                  py: 2,
                  px: 3,
                  borderBottom: index < cartItems.length - 1 ? `1px solid ${alpha(theme.palette.divider, 0.5)}` : 'none',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.02)
                  }
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
                  {/* Product Image */}
                  <Avatar
                    src={item.product_image}
                    variant="rounded"
                    sx={{ 
                      width: 50, 
                      height: 50,
                      bgcolor: alpha(theme.palette.primary.main, 0.1)
                    }}
                  >
                    <IconShoppingBag size={20} />
                  </Avatar>

                  {/* Product Details */}
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 600,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        color: item.available ? 'text.primary' : 'text.disabled'
                      }}
                    >
                      {item.product_title}
                    </Typography>
                    {!item.available && (
                      <Typography 
                        variant="caption" 
                        color="error.main" 
                        sx={{ 
                          fontWeight: 600,
                          display: 'block'
                        }}
                      >
                        {item.unavailable_reason || 'Unavailable'}
                      </Typography>
                    )}
                    {item.artist && (
                      <Typography variant="caption" color="text.secondary">
                        by {item.artist}
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        Qty: {item.quantity}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 600, 
                          color: item.available ? theme.palette.primary.main : theme.palette.text.disabled,
                          textDecoration: item.available ? 'none' : 'line-through'
                        }}
                      >
                        {formatPrice((parseFloat(item.price) || 0) * (parseInt(item.quantity) || 0))}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Remove Button */}
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveItem(item.id)}
                    disabled={removingItems.has(item.id)}
                    sx={{
                      color: theme.palette.error.main,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.error.main, 0.1)
                      }
                    }}
                  >
                    {removingItems.has(item.id) ? (
                      <CircularProgress size={16} />
                    ) : (
                      <IconTrash size={16} />
                    )}
                  </IconButton>
                </Box>
              </MenuItem>
            ))
          )}
        </Box>

        {/* Footer */}
        {cartItems.length > 0 && (
          <Box sx={{ p: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
            {/* Subtotal */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                Subtotal:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                {formatPrice(cartSummary.subtotal)}
              </Typography>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={handleViewCart}
                sx={{ 
                  flex: 1,
                  textTransform: 'none',
                  borderRadius: 2
                }}
              >
                View Cart
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={handleCheckout}
                sx={{ 
                  flex: 1,
                  textTransform: 'none',
                  borderRadius: 2,
                  boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`
                }}
              >
                Checkout
              </Button>
            </Box>
          </Box>
        )}
      </Menu>
    </>
  );
};

export default CartIcon;
