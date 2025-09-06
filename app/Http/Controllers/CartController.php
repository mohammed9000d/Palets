<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\ArtistWork;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CartController extends Controller
{
    /**
     * Get user's cart
     */
    public function index(Request $request)
    {
        try {
            $cart = $this->findOrCreateCart($request);
            
            if (!$cart) {
                return response()->json([
                    'success' => true,
                    'items' => [],
                    'summary' => [
                        'items_count' => 0,
                        'subtotal' => 0,
                        'tax' => 0,
                        'shipping' => 9.99,
                        'total' => 9.99
                    ]
                ]);
            }

            $cart->load(['items']);

            $items = $cart->items->map(function ($item) {
                $productDetails = $item->product_details;
                return [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'product_type' => $item->product_type,
                    'product_slug' => $productDetails['slug'],
                    'quantity' => $item->quantity,
                    'price' => $item->price,
                    'total' => $item->total,
                    'product_title' => $productDetails['title'],
                    'product_image' => $productDetails['image'],
                    'options' => $item->options,
                    'available' => $productDetails['available'],
                    'artist' => $productDetails['artist'] ?? null,
                    'added_at' => $item->created_at->toISOString()
                ];
            });

            return response()->json([
                'success' => true,
                'items' => $items,
                'summary' => [
                    'items_count' => $cart->items_count,
                    'subtotal' => $cart->subtotal,
                    'tax' => $cart->tax,
                    'shipping' => $cart->shipping,
                    'total' => $cart->total
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load cart',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add item to cart
     */
    public function addToCart(Request $request)
    {
        $request->validate([
            'product_id' => 'required|integer',
            'product_type' => 'required|in:product,artwork',
            'quantity' => 'required|integer|min:1|max:10',
            'options' => 'nullable|array'
        ]);

        try {
            DB::beginTransaction();

            // Find the product
            $product = $this->findProduct($request->product_id, $request->product_type);
            
            if (!$product) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product not found'
                ], 404);
            }

            // Check availability
            if (!$this->isProductAvailable($product, $request->product_type)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product is not available'
                ], 400);
            }

            // Find or create cart
            $cart = $this->findOrCreateCart($request);
            
            if (!$cart) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to create cart'
                ], 500);
            }

            // Check if item already exists in cart
            $existingItem = $cart->items()->where([
                'product_id' => $request->product_id,
                'product_type' => $request->product_type,
                'options' => json_encode($request->options ?? [])
            ])->first();

            if ($existingItem) {
                // Update quantity
                $existingItem->update([
                    'quantity' => $existingItem->quantity + $request->quantity
                ]);
            } else {
                // Create new cart item
                $cart->items()->create([
                    'product_id' => $request->product_id,
                    'product_type' => $request->product_type,
                    'quantity' => $request->quantity,
                    'price' => $this->getProductPrice($product, $request->product_type),
                    'options' => $request->options ?? []
                ]);
            }

            // Update cart activity
            $cart->updateActivity();

            DB::commit();

            // Return updated cart
            return $this->index($request);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to add item to cart',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update cart item quantity
     */
    public function updateQuantity(Request $request)
    {
        $request->validate([
            'item_id' => 'required|integer',
            'quantity' => 'required|integer|min:1|max:10'
        ]);

        try {
            $cart = $this->findOrCreateCart($request);
            
            if (!$cart) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cart not found'
                ], 404);
            }

            $cartItem = $cart->items()->find($request->item_id);
            
            if (!$cartItem) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cart item not found'
                ], 404);
            }

            $cartItem->update(['quantity' => $request->quantity]);
            $cart->updateActivity();

            return $this->index($request);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update cart item',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove item from cart
     */
    public function removeItem(Request $request)
    {
        $request->validate([
            'item_id' => 'required|integer'
        ]);

        try {
            $cart = $this->findOrCreateCart($request);
            
            if (!$cart) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cart not found'
                ], 404);
            }

            $cartItem = $cart->items()->find($request->item_id);
            
            if (!$cartItem) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cart item not found'
                ], 404);
            }

            $cartItem->delete();
            $cart->updateActivity();

            return $this->index($request);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to remove cart item',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Clear entire cart
     */
    public function clearCart(Request $request)
    {
        try {
            $cart = $this->findOrCreateCart($request);
            
            if ($cart) {
                $cart->items()->delete();
                $cart->updateActivity();
            }

            return response()->json([
                'success' => true,
                'message' => 'Cart cleared successfully',
                'items' => [],
                'summary' => [
                    'items_count' => 0,
                    'subtotal' => 0,
                    'tax' => 0,
                    'shipping' => 9.99,
                    'total' => 9.99
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to clear cart',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Find or create cart for current user/session
     */
    private function findOrCreateCart(Request $request)
    {
        if (Auth::guard('web')->check()) {
            // Authenticated user
            return Cart::findOrCreateCart(Auth::guard('web')->id());
        } else {
            // Guest user - use session ID
            $sessionId = $request->session()->getId();
            return Cart::findOrCreateCart(null, $sessionId);
        }
    }

    /**
     * Find product by ID and type
     */
    private function findProduct($productId, $productType)
    {
        if ($productType === 'artwork') {
            return ArtistWork::find($productId);
        } else {
            return Product::find($productId);
        }
    }

    /**
     * Check if product is available
     */
    private function isProductAvailable($product, $productType)
    {
        if ($productType === 'artwork') {
            return $product->is_for_sale && $product->status === 'published';
        } else {
            return $product->in_stock && $product->status === 'published';
        }
    }

    /**
     * Get product price
     */
    private function getProductPrice($product, $productType)
    {
        if ($productType === 'artwork') {
            return $product->price;
        } else {
            return $product->final_price; // This considers discount price
        }
    }
}
