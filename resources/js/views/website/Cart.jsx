import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  IconButton,
  Avatar,
  Divider,
  Paper,
  CircularProgress,
  Alert,
  Stack,
  Breadcrumbs,
  alpha
} from '@mui/material';
import {
  IconShoppingCart,
  IconTrash,
  IconPlus,
  IconMinus,
  IconArrowLeft,
  IconShoppingBag,
  IconCreditCard
} from '@tabler/icons-react';
import { useCart } from '../../contexts/CartContext';
import { useTheme } from '@mui/material/styles';
import { Link, useNavigate } from 'react-router-dom';

const Cart = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { cartItems, cartSummary, loading, updateQuantity, removeFromCart, clearCart } = useCart();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    await updateQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = async (itemId) => {
    await removeFromCart(itemId);
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      await clearCart();
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress size={40} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link to="/" style={{ textDecoration: 'none', color: theme.palette.text.secondary }}>
          Home
        </Link>
        <Typography color="text.primary">Shopping Cart</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconShoppingCart size={32} color={theme.palette.primary.main} />
          Shopping Cart
        </Typography>
        
        <Button
          component={Link}
          to="/products"
          startIcon={<IconArrowLeft size={16} />}
          sx={{ color: theme.palette.text.secondary }}
        >
          Continue Shopping
        </Button>
      </Box>

      {cartItems.length === 0 ? (
        /* Empty Cart */
        <Paper sx={{ textAlign: 'center', py: 8, px: 4, borderRadius: 3 }}>
          <IconShoppingBag size={80} color={theme.palette.text.disabled} />
          <Typography variant="h5" sx={{ mt: 3, mb: 2, fontWeight: 600 }}>
            Your cart is empty
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Looks like you haven't added any items to your cart yet.
          </Typography>
          <Button
            component={Link}
            to="/products"
            variant="contained"
            size="large"
            startIcon={<IconShoppingBag size={20} />}
            sx={{
              py: 2,
              px: 4,
              borderRadius: 3,
              textTransform: 'none',
              fontSize: '1.1rem',
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
            }}
          >
            Start Shopping
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={4}>
          {/* Cart Items */}
          <Grid item xs={12} md={8}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
              <CardContent sx={{ p: 0 }}>
                {/* Cart Header */}
                <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {cartSummary.itemsCount} item{cartSummary.itemsCount !== 1 ? 's' : ''}
                    </Typography>
                    <Button
                      onClick={handleClearCart}
                      color="error"
                      size="small"
                      startIcon={<IconTrash size={16} />}
                      sx={{ textTransform: 'none' }}
                    >
                      Clear Cart
                    </Button>
                  </Box>
                </Box>

                {/* Cart Items List */}
                <Stack divider={<Divider />}>
                  {cartItems.map((item) => (
                    <Box key={item.id} sx={{ p: 3 }}>
                      <Grid container spacing={3} alignItems="center">
                        {/* Product Image */}
                        <Grid item xs={12} sm={3}>
                          <Avatar
                            src={item.product_image}
                            variant="rounded"
                            sx={{
                              width: 100,
                              height: 100,
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              mx: 'auto'
                            }}
                          >
                            <IconShoppingBag size={32} />
                          </Avatar>
                        </Grid>

                        {/* Product Details */}
                        <Grid item xs={12} sm={5}>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                            {item.product_title}
                          </Typography>
                          {item.artist && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              by {item.artist}
                            </Typography>
                          )}
                          <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                            {formatPrice(item.price)} each
                          </Typography>
                          {!item.available && (
                            <Alert severity="warning" sx={{ mt: 1 }}>
                              This item is no longer available
                            </Alert>
                          )}
                        </Grid>

                        {/* Quantity Controls */}
                        <Grid item xs={12} sm={2}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <IconButton
                              size="small"
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              sx={{
                                border: `1px solid ${theme.palette.divider}`,
                                borderRadius: 1
                              }}
                            >
                              <IconMinus size={16} />
                            </IconButton>
                            <Typography
                              sx={{
                                mx: 2,
                                minWidth: 40,
                                textAlign: 'center',
                                fontWeight: 600
                              }}
                            >
                              {item.quantity}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              disabled={item.quantity >= 10}
                              sx={{
                                border: `1px solid ${theme.palette.divider}`,
                                borderRadius: 1
                              }}
                            >
                              <IconPlus size={16} />
                            </IconButton>
                          </Box>
                        </Grid>

                        {/* Price & Remove */}
                        <Grid item xs={12} sm={2}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.primary.main, mb: 1 }}>
                              {formatPrice((parseFloat(item.price) || 0) * (parseInt(item.quantity) || 0))}
                            </Typography>
                            <IconButton
                              onClick={() => handleRemoveItem(item.id)}
                              color="error"
                              size="small"
                            >
                              <IconTrash size={18} />
                            </IconButton>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Order Summary */}
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', position: 'sticky', top: 20 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                  Order Summary
                </Typography>

                <Stack spacing={2} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Subtotal</Typography>
                    <Typography sx={{ fontWeight: 600 }}>
                      {formatPrice(cartSummary.subtotal)}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Tax</Typography>
                    <Typography sx={{ fontWeight: 600 }}>
                      {formatPrice(cartSummary.tax)}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Shipping</Typography>
                    <Typography sx={{ fontWeight: 600, color: cartSummary.shipping === 0 ? 'success.main' : 'inherit' }}>
                      {cartSummary.shipping === 0 ? 'FREE' : formatPrice(cartSummary.shipping)}
                    </Typography>
                  </Box>
                  
                  {cartSummary.subtotal < 50 && (
                    <Alert severity="info" sx={{ mt: 1 }}>
                      Add {formatPrice(50 - cartSummary.subtotal)} more for free shipping!
                    </Alert>
                  )}
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Total
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                    {formatPrice(cartSummary.total)}
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handleCheckout}
                  startIcon={<IconCreditCard size={20} />}
                  sx={{
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderRadius: 3,
                    textTransform: 'none',
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                    '&:hover': {
                      boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`
                    }
                  }}
                >
                  Proceed to Checkout
                </Button>

                <Button
                  component={Link}
                  to="/products"
                  variant="outlined"
                  fullWidth
                  size="large"
                  sx={{
                    mt: 2,
                    py: 2,
                    borderRadius: 3,
                    textTransform: 'none'
                  }}
                >
                  Continue Shopping
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default Cart;
