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

class TestPaymentController extends Controller
{
    /**
     * Test Stripe Payment (Simulated)
     */
    public function testStripePayment(Request $request): JsonResponse
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

            // Simulate payment processing delay
            sleep(2);

            DB::beginTransaction();

            // Create order
            $order = Order::create([
                'user_id' => $user->id,
                'status' => 'processing',
                'payment_method' => 'stripe',
                'payment_status' => 'paid',
                'payment_id' => 'test_stripe_' . uniqid(),
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
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $cartItem->product_id,
                    'product_type' => $cartItem->product_type,
                    'product_title' => $cartItem->product_title,
                    'product_image' => $cartItem->product_image,
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
                'message' => 'Test payment successful! Order created.',
                'order' => $order->load(['orderItems'])
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Test payment failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Test PayPal Payment (Simulated)
     */
    public function testPayPalPayment(Request $request): JsonResponse
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

            // Simulate PayPal processing delay
            sleep(2);

            DB::beginTransaction();

            // Create order
            $order = Order::create([
                'user_id' => $user->id,
                'status' => 'processing',
                'payment_method' => 'paypal',
                'payment_status' => 'paid',
                'payment_id' => 'test_paypal_' . uniqid(),
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
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $cartItem->product_id,
                    'product_type' => $cartItem->product_type,
                    'product_title' => $cartItem->product_title,
                    'product_image' => $cartItem->product_image,
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
                'message' => 'Test PayPal payment successful! Order created.',
                'order' => $order->load(['orderItems'])
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Test PayPal payment failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
