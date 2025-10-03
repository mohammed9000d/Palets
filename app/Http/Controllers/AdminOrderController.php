<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class AdminOrderController extends Controller
{
    /**
     * Display a listing of orders for admin
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Order::with(['user', 'orderItems']);

            // Search functionality
            if ($request->has('search') && $request->search) {
                $searchTerm = $request->search;
                $query->where(function($q) use ($searchTerm) {
                    $q->where('order_number', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('billing_full_name', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('billing_email', 'LIKE', "%{$searchTerm}%")
                      ->orWhereHas('user', function($userQuery) use ($searchTerm) {
                          $userQuery->where('name', 'LIKE', "%{$searchTerm}%")
                                   ->orWhere('email', 'LIKE', "%{$searchTerm}%");
                      });
                });
            }

            // Filter by status
            if ($request->has('status') && $request->status) {
                $query->where('status', $request->status);
            }

            // Filter by payment status
            if ($request->has('payment_status') && $request->payment_status) {
                $query->where('payment_status', $request->payment_status);
            }

            // Filter by date range
            if ($request->has('date_from') && $request->date_from) {
                $query->whereDate('created_at', '>=', $request->date_from);
            }
            if ($request->has('date_to') && $request->date_to) {
                $query->whereDate('created_at', '<=', $request->date_to);
            }

            // Sorting
            $sortBy = $request->get('sort_by', 'created_at');
            $sortDirection = $request->get('sort_direction', 'desc');
            $query->orderBy($sortBy, $sortDirection);

            // Pagination
            $perPage = $request->get('per_page', 15);
            $orders = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $orders
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch orders',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified order
     */
    public function show($id): JsonResponse
    {
        try {
            $order = Order::with(['user', 'orderItems', 'orderItems.product'])
                ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $order
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update order status
     */
    public function updateStatus(Request $request, $id): JsonResponse
    {
        try {
            $validated = $request->validate([
                'status' => 'required|in:pending,processing,shipped,delivered,cancelled',
                'notes' => 'nullable|string'
            ]);

            $order = Order::findOrFail($id);
            
            $updateData = ['status' => $validated['status']];
            
            // Set timestamps based on status
            switch ($validated['status']) {
                case 'shipped':
                    $updateData['shipped_at'] = now();
                    break;
                case 'delivered':
                    $updateData['delivered_at'] = now();
                    if (!$order->shipped_at) {
                        $updateData['shipped_at'] = now();
                    }
                    break;
                case 'cancelled':
                    $updateData['cancelled_at'] = now();
                    break;
            }

            if (isset($validated['notes'])) {
                $updateData['notes'] = $validated['notes'];
            }

            $order->update($updateData);

            return response()->json([
                'success' => true,
                'message' => 'Order status updated successfully',
                'data' => $order->fresh(['user', 'orderItems'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update order status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update payment status
     */
    public function updatePaymentStatus(Request $request, $id): JsonResponse
    {
        try {
            $validated = $request->validate([
                'payment_status' => 'required|in:pending,paid,failed,refunded',
                'payment_id' => 'nullable|string'
            ]);

            $order = Order::findOrFail($id);
            
            $updateData = ['payment_status' => $validated['payment_status']];
            
            if (isset($validated['payment_id'])) {
                $updateData['payment_id'] = $validated['payment_id'];
            }

            $order->update($updateData);

            return response()->json([
                'success' => true,
                'message' => 'Payment status updated successfully',
                'data' => $order->fresh(['user', 'orderItems'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update payment status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get order statistics
     */
    public function statistics(): JsonResponse
    {
        try {
            $stats = [
                'total_orders' => Order::count(),
                'pending_orders' => Order::where('status', 'pending')->count(),
                'processing_orders' => Order::where('status', 'processing')->count(),
                'shipped_orders' => Order::where('status', 'shipped')->count(),
                'delivered_orders' => Order::where('status', 'delivered')->count(),
                'cancelled_orders' => Order::where('status', 'cancelled')->count(),
                'total_revenue' => Order::where('payment_status', 'paid')->sum('total_amount'),
                'pending_payments' => Order::where('payment_status', 'pending')->count(),
                'failed_payments' => Order::where('payment_status', 'failed')->count(),
                'recent_orders' => Order::with(['user'])
                    ->orderBy('created_at', 'desc')
                    ->limit(5)
                    ->get(),
                'monthly_revenue' => Order::where('payment_status', 'paid')
                    ->whereMonth('created_at', now()->month)
                    ->whereYear('created_at', now()->year)
                    ->sum('total_amount'),
                'daily_orders' => Order::whereDate('created_at', today())->count()
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete an order (soft delete or hard delete based on business logic)
     */
    public function destroy($id): JsonResponse
    {
        try {
            $order = Order::findOrFail($id);
            
            // Only allow deletion of cancelled orders or orders that haven't been processed
            if (!in_array($order->status, ['pending', 'cancelled'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete orders that are being processed or have been completed'
                ], 400);
            }

            // Delete order items first
            $order->orderItems()->delete();
            
            // Delete the order
            $order->delete();

            return response()->json([
                'success' => true,
                'message' => 'Order deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete order',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
