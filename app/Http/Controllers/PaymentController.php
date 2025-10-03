<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Cart;
use App\Models\CartItem;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Stripe\Stripe;
use Stripe\PaymentIntent;
use Stripe\Exception\CardException;

class PaymentController extends Controller
{
    public function __construct()
    {
        // Set Stripe API key
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    /**
     * Create Stripe Payment Intent
     */
    public function createStripePaymentIntent(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['message' => 'Unauthorized'], 401);
            }

            $validator = Validator::make($request->all(), [
                'amount' => 'required|numeric|min:0.50',
                'currency' => 'string|in:usd,eur,gbp',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Create payment intent
            $paymentIntent = PaymentIntent::create([
                'amount' => round($request->amount * 100), // Convert to cents
                'currency' => $request->currency ?? 'usd',
                'customer' => $user->stripe_customer_id ?? null,
                'metadata' => [
                    'user_id' => $user->id,
                    'user_email' => $user->email,
                ],
                'automatic_payment_methods' => [
                    'enabled' => true,
                ],
            ]);

            return response()->json([
                'success' => true,
                'client_secret' => $paymentIntent->client_secret,
                'payment_intent_id' => $paymentIntent->id
            ]);

        } catch (CardException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Card error: ' . $e->getError()->message
            ], 400);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Payment intent creation failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Confirm Stripe Payment and Create Order
     */
    public function confirmStripePayment(Request $request): JsonResponse
    {
        return $this->createOrderFromPayment($request, 'stripe', $request->payment_intent_id);
    }

    /**
     * Create PayPal Order
     */
    public function createPayPalOrder(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['message' => 'Unauthorized'], 401);
            }

            $validator = Validator::make($request->all(), [
                'amount' => 'required|numeric|min:0.50',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Get user's cart for validation
            $cart = Cart::where('user_id', $user->id)->first();
            if (!$cart) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cart not found'
                ], 404);
            }

            $cartItems = CartItem::where('cart_id', $cart->id)->get();
            if ($cartItems->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cart is empty'
                ], 400);
            }

            // Generate PayPal order ID
            $paypalOrderId = 'PAYPAL_' . uniqid() . '_' . time();

            return response()->json([
                'success' => true,
                'paypal_order_id' => $paypalOrderId,
                'amount' => $request->amount,
                'message' => 'PayPal order created successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'PayPal order creation failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Confirm PayPal Payment
     */
    public function confirmPayPalPayment(Request $request): JsonResponse
    {
        return $this->createOrderFromPayment($request, 'paypal', $request->paypal_order_id);
    }

    /**
     * Common method to create order from payment
     */
    private function createOrderFromPayment(Request $request, string $paymentMethod, string $paymentId): JsonResponse
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['message' => 'Unauthorized'], 401);
            }

            $validator = Validator::make($request->all(), [
                'billing_full_name' => 'required|string|max:255',
                'billing_email' => 'required|email|max:255',
                'billing_phone' => 'required|string|max:255',
                'billing_address' => 'required|string',
                'billing_city' => 'required|string|max:255',
                'billing_state' => 'nullable|string|max:255',
                'billing_postal_code' => 'nullable|string|max:255',
                'billing_country' => 'required|string|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Get user's cart
            $cart = Cart::where('user_id', $user->id)->first();
            if (!$cart) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cart not found'
                ], 404);
            }

            $cartItems = CartItem::where('cart_id', $cart->id)
                ->with('product')
                ->get();

            if ($cartItems->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cart is empty'
                ], 400);
            }

            // Calculate totals
            $subtotal = 0;
            foreach ($cartItems as $item) {
                $subtotal += $item->price * $item->quantity;
            }

            DB::beginTransaction();

            // Create order
            $order = Order::create([
                'user_id' => $user->id,
                'status' => 'processing',
                'payment_method' => $paymentMethod,
                'payment_status' => 'paid',
                'payment_id' => $paymentId,
                'subtotal' => $subtotal,
                'tax_amount' => 0,
                'shipping_amount' => 0,
                'total_amount' => $subtotal,
                'currency' => 'USD',
                'billing_full_name' => $request->billing_full_name,
                'billing_email' => $request->billing_email,
                'billing_phone' => $request->billing_phone,
                'billing_address' => $request->billing_address,
                'billing_city' => $request->billing_city,
                'billing_state' => $request->billing_state,
                'billing_postal_code' => $request->billing_postal_code,
                'billing_country' => $request->billing_country,
            ]);

            // Generate order number
            $order->generateOrderNumber();

            // Create order items
            foreach ($cartItems as $cartItem) {
                // Get product title and image from the related product
                $productTitle = 'Unknown Product';
                $productImage = null;
                
                if ($cartItem->product) {
                    if ($cartItem->product_type === 'artwork') {
                        $productTitle = $cartItem->product->title ?? 'Unknown Artwork';
                        $productImage = $cartItem->product->getFirstMediaUrl('cover_image');
                    } else {
                        $productTitle = $cartItem->product->main_title ?? 'Unknown Product';
                        $productImage = $cartItem->product->getFirstMediaUrl('cover_photo');
                    }
                }

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $cartItem->product_id,
                    'product_type' => $cartItem->product_type,
                    'product_title' => $productTitle,
                    'product_image' => $productImage,
                    'quantity' => $cartItem->quantity,
                    'unit_price' => $cartItem->price,
                    'total_price' => $cartItem->price * $cartItem->quantity,
                    'custom_options' => $cartItem->options,
                ]);
            }

            // Clear cart after successful order
            $cartItems->each(function ($item) {
                $item->delete();
            });

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => ucfirst($paymentMethod) . ' payment successful and order created',
                'order' => $order->load(['orderItems'])
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => ucfirst($paymentMethod) . ' payment confirmation failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Sync guest cart from localStorage to session cart
     */
    public function syncGuestCart(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'cart_items' => 'required|array',
                'cart_items.*.product_id' => 'required|integer',
                'cart_items.*.product_type' => 'required|in:product,artwork',
                'cart_items.*.quantity' => 'required|integer|min:1|max:10',
                'cart_items.*.price' => 'required|numeric|min:0',
                'cart_items.*.product_title' => 'required|string',
                'cart_items.*.product_image' => 'nullable|string',
                'cart_items.*.options' => 'nullable|array'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid cart data',
                    'errors' => $validator->errors()
                ], 422);
            }

            $sessionId = $request->session()->getId();
            
            // Clear existing session cart
            $existingCart = Cart::where('session_id', $sessionId)->first();
            if ($existingCart) {
                $existingCart->items()->delete();
                $existingCart->delete();
            }

            // Create new session cart
            $cart = Cart::create([
                'session_id' => $sessionId,
                'status' => 'active',
                'last_activity' => now()
            ]);

            // Add items to session cart
            foreach ($request->cart_items as $item) {
                CartItem::create([
                    'cart_id' => $cart->id,
                    'product_id' => $item['product_id'],
                    'product_type' => $item['product_type'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'options' => $item['options'] ?? []
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Cart synced successfully',
                'cart_id' => $cart->id,
                'items_count' => count($request->cart_items)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to sync cart',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create Stripe Payment Intent for Guest Users
     */
    public function createGuestStripePaymentIntent(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'amount' => 'required|numeric|min:0.50',
                'currency' => 'string|in:usd,eur,gbp',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Create payment intent for guest
            $paymentIntent = PaymentIntent::create([
                'amount' => round($request->amount * 100), // Convert to cents
                'currency' => $request->currency ?? 'usd',
                'metadata' => [
                    'guest_checkout' => true,
                    'session_id' => $request->session()->getId(),
                ],
                'automatic_payment_methods' => [
                    'enabled' => true,
                ],
            ]);

            return response()->json([
                'success' => true,
                'client_secret' => $paymentIntent->client_secret,
                'payment_intent_id' => $paymentIntent->id
            ]);

        } catch (CardException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Card error: ' . $e->getError()->message
            ], 400);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Payment intent creation failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Confirm Stripe Payment and Create Order for Guest Users
     */
    public function confirmGuestStripePayment(Request $request): JsonResponse
    {
        return $this->createGuestOrderFromPayment($request, 'stripe', $request->payment_intent_id);
    }

    /**
     * Create PayPal Order for Guest Users
     */
    public function createGuestPayPalOrder(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'amount' => 'required|numeric|min:0.50',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Generate PayPal order ID for guest
            $paypalOrderId = 'GUEST_PAYPAL_' . uniqid() . '_' . time();

            return response()->json([
                'success' => true,
                'paypal_order_id' => $paypalOrderId,
                'amount' => $request->amount,
                'message' => 'PayPal order created successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'PayPal order creation failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Confirm PayPal Payment for Guest Users
     */
    public function confirmGuestPayPalPayment(Request $request): JsonResponse
    {
        return $this->createGuestOrderFromPayment($request, 'paypal', $request->paypal_order_id);
    }

    /**
     * Common method to create order from payment for guest users
     */
    private function createGuestOrderFromPayment(Request $request, string $paymentMethod, string $paymentId): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'billing_full_name' => 'required|string|max:255',
                'billing_email' => 'required|email|max:255',
                'billing_phone' => 'required|string|max:255',
                'billing_address' => 'required|string',
                'billing_city' => 'required|string|max:255',
                'billing_state' => 'nullable|string|max:255',
                'billing_postal_code' => 'nullable|string|max:255',
                'billing_country' => 'required|string|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Get guest cart using session ID
            $sessionId = $request->session()->getId();
            $cart = Cart::where('session_id', $sessionId)->where('status', 'active')->first();
            
            if (!$cart) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cart not found. Please add items to your cart before checkout.',
                    'debug' => [
                        'session_id' => $sessionId,
                        'cart_count' => Cart::where('session_id', $sessionId)->count()
                    ]
                ], 404);
            }

            $cartItems = CartItem::where('cart_id', $cart->id)
                ->with('product')
                ->get();

            if ($cartItems->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cart is empty'
                ], 400);
            }

            // Calculate totals
            $subtotal = 0;
            foreach ($cartItems as $item) {
                $subtotal += $item->price * $item->quantity;
            }

            DB::beginTransaction();

            // Create order for guest (no user_id)
            $order = Order::create([
                'user_id' => null, // Guest order
                'session_id' => $sessionId, // Store session ID for guest orders
                'status' => 'processing',
                'payment_method' => $paymentMethod,
                'payment_status' => 'paid',
                'payment_id' => $paymentId,
                'subtotal' => $subtotal,
                'tax_amount' => 0,
                'shipping_amount' => 0,
                'total_amount' => $subtotal,
                'currency' => 'USD',
                'billing_full_name' => $request->billing_full_name,
                'billing_email' => $request->billing_email,
                'billing_phone' => $request->billing_phone,
                'billing_address' => $request->billing_address,
                'billing_city' => $request->billing_city,
                'billing_state' => $request->billing_state,
                'billing_postal_code' => $request->billing_postal_code,
                'billing_country' => $request->billing_country,
            ]);

            // Generate order number
            $order->generateOrderNumber();

            // Create order items
            foreach ($cartItems as $cartItem) {
                // Get product title and image from the related product
                $productTitle = 'Unknown Product';
                $productImage = null;
                
                if ($cartItem->product) {
                    if ($cartItem->product_type === 'artwork') {
                        $productTitle = $cartItem->product->title ?? 'Unknown Artwork';
                        $productImage = $cartItem->product->getFirstMediaUrl('cover_image');
                    } else {
                        $productTitle = $cartItem->product->main_title ?? 'Unknown Product';
                        $productImage = $cartItem->product->getFirstMediaUrl('cover_photo');
                    }
                }

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $cartItem->product_id,
                    'product_type' => $cartItem->product_type,
                    'product_title' => $productTitle,
                    'product_image' => $productImage,
                    'quantity' => $cartItem->quantity,
                    'unit_price' => $cartItem->price,
                    'total_price' => $cartItem->price * $cartItem->quantity,
                    'custom_options' => $cartItem->options,
                ]);
            }

            // Clear cart after successful order
            $cartItems->each(function ($item) {
                $item->delete();
            });

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => ucfirst($paymentMethod) . ' payment successful and order created',
                'order' => $order->load(['orderItems'])
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => ucfirst($paymentMethod) . ' payment confirmation failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}