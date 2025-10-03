<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\ArtistWork;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

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
                        'unavailable_items_count' => 0,
                        'subtotal' => 0,
                        'shipping' => 0,
                        'total' => 0
                    ]
                ]);
            }

            $cart->load(['items']);

            $items = $cart->items->map(function ($item) {
                $productDetails = $item->product_details;
                
                // Check if product is still available
                $product = $this->findProduct($item->product_id, $item->product_type);
                $isAvailable = $product && $this->isProductAvailable($product, $item->product_type);
                
                return [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'product_type' => $item->product_type,
                    'product_slug' => $productDetails['slug'],
                    'quantity' => $item->quantity,
                    'price' => $item->price,
                    'total' => $isAvailable ? $item->total : 0, // Don't count unavailable items in total
                    'product_title' => $productDetails['title'],
                    'product_image' => $productDetails['image'],
                    'options' => $item->options,
                    'available' => $isAvailable,
                    'unavailable_reason' => !$isAvailable ? $this->getUnavailableReason($product, $item->product_type) : null,
                    'artist' => $productDetails['artist'] ?? null,
                    'added_at' => $item->created_at->toISOString()
                ];
            });

            return response()->json([
                'success' => true,
                'items' => $items,
                'summary' => [
                    'items_count' => $items->where('available', true)->sum('quantity'),
                    'unavailable_items_count' => $items->where('available', false)->sum('quantity'),
                    'subtotal' => $items->where('available', true)->sum('total'),
                    'shipping' => 0, // Shipping paid to delivery guy
                    'total' => $items->where('available', true)->sum('total') // No tax, no shipping charge
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
            $requestOptions = $request->options ?? [];
            $existingItem = $cart->items()->where([
                'product_id' => $request->product_id,
                'product_type' => $request->product_type,
            ])->get()->first(function ($item) use ($requestOptions) {
                // Compare options by converting both to arrays and comparing
                $itemOptions = is_string($item->options) ? json_decode($item->options, true) : $item->options;
                $itemOptions = $itemOptions ?? [];
                
                // Sort both arrays by keys for consistent comparison
                ksort($itemOptions);
                ksort($requestOptions);
                
                return $itemOptions == $requestOptions;
            });

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
                    'unavailable_items_count' => 0,
                    'subtotal' => 0,
                    'shipping' => 0,
                    'total' => 0
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
     * Check if product is available for cart operations
     */
    private function isProductAvailable($product, $productType)
    {
        if ($productType === 'artwork') {
            return $product && $product->is_for_sale && $product->status === 'published';
        } else {
            return $product && $product->in_stock && $product->status === 'published';
        }
    }

    /**
     * Merge guest cart with user cart when user logs in
     */
    public function mergeCart(Request $request)
    {
        // Log the incoming request for debugging
        Log::info('Cart merge request received', [
            'user_id' => Auth::guard('web')->id(),
            'guest_cart' => $request->guest_cart
        ]);

        $request->validate([
            'guest_cart' => 'required|array',
            'guest_cart.*.product_id' => 'required|integer',
            'guest_cart.*.product_type' => 'required|in:product,artwork',
            'guest_cart.*.quantity' => 'required|integer|min:1|max:10',
            'guest_cart.*.options' => 'nullable|array'
        ]);

        try {
            DB::beginTransaction();

            // Must be authenticated to merge cart
            if (!Auth::guard('web')->check()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Authentication required'
                ], 401);
            }

            $user = Auth::guard('web')->user();
            $cart = Cart::findOrCreateCart($user->id);
            
            $mergedCount = 0;
            $skippedCount = 0;

            foreach ($request->guest_cart as $index => $guestItem) {
                Log::info("Processing guest cart item {$index}", [
                    'item' => $guestItem,
                    'product_id' => $guestItem['product_id'] ?? 'missing',
                    'product_type' => $guestItem['product_type'] ?? 'missing',
                    'quantity' => $guestItem['quantity'] ?? 'missing'
                ]);

                // Find the product
                $product = $this->findProduct($guestItem['product_id'], $guestItem['product_type']);
                
                if (!$product) {
                    Log::warning("Product not found for guest cart item {$index}", [
                        'product_id' => $guestItem['product_id'],
                        'product_type' => $guestItem['product_type']
                    ]);
                    $skippedCount++;
                    continue;
                }

                // Skip only if product doesn't exist at all
                if (!$product) {
                    Log::warning("Product not found for guest cart item {$index}", [
                        'product_id' => $guestItem['product_id'],
                        'product_type' => $guestItem['product_type']
                    ]);
                    $skippedCount++;
                    continue;
                }
                
                // Log product info for debugging
                $isAvailable = $this->isProductAvailable($product, $guestItem['product_type']);
                Log::info("Product found for guest cart item {$index}", [
                    'product_id' => $guestItem['product_id'],
                    'product_title' => $product->main_title ?? $product->title ?? 'unknown',
                    'in_stock' => $product->in_stock ?? 'unknown',
                    'status' => $product->status ?? 'unknown',
                    'is_available' => $isAvailable
                ]);

                // Check if item already exists in user's cart
                $guestOptions = $guestItem['options'] ?? [];
                $existingItem = $cart->items()->where([
                    'product_id' => $guestItem['product_id'],
                    'product_type' => $guestItem['product_type'],
                ])->get()->first(function ($item) use ($guestOptions) {
                    // Compare options by converting both to arrays and comparing
                    $itemOptions = is_string($item->options) ? json_decode($item->options, true) : $item->options;
                    $itemOptions = $itemOptions ?? [];
                    
                    // Sort both arrays by keys for consistent comparison
                    ksort($itemOptions);
                    ksort($guestOptions);
                    
                    return $itemOptions == $guestOptions;
                });

                if ($existingItem) {
                    // Update quantity
                    Log::info("Updating existing cart item {$index}", [
                        'existing_quantity' => $existingItem->quantity,
                        'adding_quantity' => $guestItem['quantity'],
                        'new_quantity' => $existingItem->quantity + $guestItem['quantity']
                    ]);
                    
                    $existingItem->update([
                        'quantity' => $existingItem->quantity + $guestItem['quantity']
                    ]);
                } else {
                    // Create new cart item
                    Log::info("Creating new cart item {$index}", [
                        'product_id' => $guestItem['product_id'],
                        'product_type' => $guestItem['product_type'],
                        'quantity' => $guestItem['quantity'],
                        'price' => $this->getProductPrice($product, $guestItem['product_type'])
                    ]);
                    
                    $cart->items()->create([
                        'product_id' => $guestItem['product_id'],
                        'product_type' => $guestItem['product_type'],
                        'quantity' => $guestItem['quantity'],
                        'price' => $this->getProductPrice($product, $guestItem['product_type']),
                        'options' => $guestItem['options'] ?? []
                    ]);
                }
                
                $mergedCount++;
            }

            // Update cart activity
            $cart->updateActivity();

            DB::commit();

            Log::info('Cart merge completed', [
                'user_id' => $user->id,
                'merged_items' => $mergedCount,
                'skipped_items' => $skippedCount,
                'total_guest_items' => count($request->guest_cart),
                'success_rate' => count($request->guest_cart) > 0 ? ($mergedCount / count($request->guest_cart)) * 100 . '%' : '0%'
            ]);

            // Return updated cart
            $response = $this->index($request);
            $responseData = $response->getData(true);
            
            $responseData['merge_summary'] = [
                'merged_items' => $mergedCount,
                'skipped_items' => $skippedCount,
                'total_guest_items' => count($request->guest_cart),
                'message' => "Successfully merged {$mergedCount} of " . count($request->guest_cart) . " items from guest cart"
            ];

            return response()->json($responseData);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to merge cart',
                'error' => $e->getMessage()
            ], 500);
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
            // Use discount_price if available, otherwise regular price
            return ($product->discount_price && $product->discount_price > 0) 
                ? $product->discount_price 
                : $product->price;
        }
    }

    /**
     * Get reason why product is unavailable
     */
    private function getUnavailableReason($product, $productType)
    {
        // Always return simple "Unavailable" message for users
        return 'Unavailable';
    }
}
