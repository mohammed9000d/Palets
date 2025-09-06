import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import configService from '../services/configService';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const [configReady, setConfigReady] = useState(false);

  // Initialize config service
  useEffect(() => {
    const initConfig = async () => {
      try {
        await configService.initialize();
        setConfigReady(true);
      } catch (error) {
        console.error('Failed to initialize config in CartContext:', error);
        setConfigReady(true); // Continue with fallback
      }
    };
    
    initConfig();
  }, []);

  // Helper function to get API URL
  const getApiUrl = (endpoint = '') => {
    if (configService.isInitialized()) {
      return configService.getApiEndpointUrl(endpoint);
    }
    return `/api/${endpoint}`.replace(/\/+/g, '/').replace(/\/$/, '');
  };

  // Load cart from localStorage on mount (for guests) or from API (for authenticated users)
  useEffect(() => {
    if (configReady) {
      loadCart();
    }
  }, [isAuthenticated, user, configReady]);

  // Save cart to localStorage whenever it changes (for guests)
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('guestCart', JSON.stringify(cartItems));
    }
  }, [cartItems, isAuthenticated]);

  const loadCart = async () => {
    if (isAuthenticated) {
      // Load cart from API for authenticated users
      try {
        setLoading(true);
        const response = await fetch(getApiUrl('cart'), {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setCartItems(data.items || []);
        }
      } catch (error) {
        console.error('Error loading cart:', error);
        // Fallback to localStorage
        const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        setCartItems(guestCart);
      } finally {
        setLoading(false);
      }
    } else {
      // Load cart from localStorage for guests
      const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
      setCartItems(guestCart);
    }
  };

  const addToCart = async (product, quantity = 1, options = {}) => {
    try {
      setLoading(true);

      // Create cart item object - use final_price which considers discounts
      const productPrice = product.final_price || product.price || 0;
      
      const cartItem = {
        product_id: product.id,
        product_slug: product.slug,
        product_type: product.type || 'product', // 'product' or 'artwork'
        quantity: parseInt(quantity) || 1,
        price: parseFloat(productPrice) || 0,
        product_title: product.main_title || product.title,
        product_image: product.cover_photo_url || product.cover_image_url,
        options: options, // For custom dimensions, colors, etc.
        added_at: new Date().toISOString()
      };

      if (isAuthenticated) {
        // Add to cart via API for authenticated users
        const response = await fetch(getApiUrl('cart/add'), {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            product_id: cartItem.product_id,
            product_type: cartItem.product_type,
            quantity: cartItem.quantity,
            options: cartItem.options
          })
        });

        if (response.ok) {
          const data = await response.json();
          setCartItems(data.items || []);
          return { success: true, message: 'Product added to cart!' };
        } else {
          const errorData = await response.json();
          return { success: false, message: errorData.message || 'Failed to add product to cart' };
        }
      } else {
        // Add to local cart for guests
        const existingItemIndex = cartItems.findIndex(
          item => item.product_id === cartItem.product_id && 
                  item.product_type === cartItem.product_type &&
                  JSON.stringify(item.options) === JSON.stringify(cartItem.options)
        );

        let updatedCart;
        if (existingItemIndex >= 0) {
          // Update quantity if item already exists
          updatedCart = [...cartItems];
          updatedCart[existingItemIndex].quantity += cartItem.quantity;
        } else {
          // Add new item
          updatedCart = [...cartItems, { ...cartItem, id: Date.now() }];
        }

        setCartItems(updatedCart);
        return { success: true, message: 'Product added to cart!' };
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      return { success: false, message: 'Failed to add product to cart' };
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      setLoading(true);
      quantity = parseInt(quantity);

      if (quantity <= 0) {
        return removeFromCart(itemId);
      }

      if (isAuthenticated) {
        // Update via API for authenticated users
        const response = await fetch(getApiUrl('cart/update'), {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            item_id: itemId,
            quantity: quantity
          })
        });

        if (response.ok) {
          const data = await response.json();
          setCartItems(data.items || []);
          return { success: true };
        } else {
          return { success: false, message: 'Failed to update cart' };
        }
      } else {
        // Update local cart for guests
        const updatedCart = cartItems.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        );
        setCartItems(updatedCart);
        return { success: true };
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      return { success: false, message: 'Failed to update cart' };
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      setLoading(true);

      if (isAuthenticated) {
        // Remove via API for authenticated users
        const response = await fetch(getApiUrl('cart/remove'), {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            item_id: itemId
          })
        });

        if (response.ok) {
          const data = await response.json();
          setCartItems(data.items || []);
          return { success: true };
        } else {
          return { success: false, message: 'Failed to remove item from cart' };
        }
      } else {
        // Remove from local cart for guests
        const updatedCart = cartItems.filter(item => item.id !== itemId);
        setCartItems(updatedCart);
        return { success: true };
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      return { success: false, message: 'Failed to remove item from cart' };
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);

      if (isAuthenticated) {
        // Clear via API for authenticated users
        const response = await fetch(getApiUrl('cart/clear'), {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          setCartItems([]);
          return { success: true };
        } else {
          return { success: false, message: 'Failed to clear cart' };
        }
      } else {
        // Clear local cart for guests
        setCartItems([]);
        localStorage.removeItem('guestCart');
        return { success: true };
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      return { success: false, message: 'Failed to clear cart' };
    } finally {
      setLoading(false);
    }
  };

  // Merge guest cart with user cart when user logs in
  const mergeGuestCart = async () => {
    const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
    
    if (guestCart.length > 0 && isAuthenticated) {
      try {
        setLoading(true);
        const response = await fetch(getApiUrl('cart/merge'), {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            guest_cart: guestCart
          })
        });

        if (response.ok) {
          const data = await response.json();
          setCartItems(data.items || []);
          localStorage.removeItem('guestCart');
        }
      } catch (error) {
        console.error('Error merging cart:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Calculate cart totals
  const cartSummary = {
    itemsCount: cartItems.reduce((total, item) => total + (parseInt(item.quantity) || 0), 0),
    subtotal: cartItems.reduce((total, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 0;
      return total + (price * quantity);
    }, 0),
    get tax() {
      return this.subtotal * 0.08; // 8% tax
    },
    get shipping() {
      return this.subtotal > 50 ? 0 : 9.99; // Free shipping over $50
    },
    get total() {
      return this.subtotal + this.tax + this.shipping;
    }
  };

  const value = {
    cartItems,
    loading,
    cartSummary,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    loadCart,
    mergeGuestCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
