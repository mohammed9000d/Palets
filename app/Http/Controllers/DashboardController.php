<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use App\Models\Artist;
use App\Models\ArtistWork;
use App\Models\ProductReview;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Get comprehensive dashboard statistics
     */
    public function getStatistics(): JsonResponse
    {
        try {
            $stats = [
                // Overview Stats
                'overview' => $this->getOverviewStats(),
                
                // Revenue Analytics
                'revenue' => $this->getRevenueStats(),
                
                // Orders Analytics
                'orders' => $this->getOrderStats(),
                
                // Products Analytics
                'products' => $this->getProductStats(),
                
                // Users Analytics
                'users' => $this->getUserStats(),
                
                // Artists Analytics
                'artists' => $this->getArtistStats(),
                
                // Time-based Analytics
                'trends' => $this->getTrendStats(),
                
                // Recent Activity
                'recent_activity' => $this->getRecentActivity()
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch dashboard statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get overview statistics
     */
    private function getOverviewStats(): array
    {
        $totalRevenue = Order::where('payment_status', 'paid')->sum('total_amount');
        $monthlyRevenue = Order::where('payment_status', 'paid')
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->sum('total_amount');
        
        $lastMonthRevenue = Order::where('payment_status', 'paid')
            ->whereMonth('created_at', now()->subMonth()->month)
            ->whereYear('created_at', now()->subMonth()->year)
            ->sum('total_amount');

        $revenueGrowth = $lastMonthRevenue > 0 
            ? (($monthlyRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100 
            : 0;

        return [
            'total_revenue' => $totalRevenue,
            'monthly_revenue' => $monthlyRevenue,
            'revenue_growth' => round($revenueGrowth, 2),
            'total_orders' => Order::count(),
            'monthly_orders' => Order::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count(),
            'total_products' => Product::count(),
            'active_products' => Product::where('status', 'published')->count(),
            'total_users' => User::count(),
            'new_users_this_month' => User::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count(),
            'total_artists' => Artist::count(),
            'active_artists' => Artist::where('is_active', true)->count(),
        ];
    }

    /**
     * Get revenue statistics
     */
    private function getRevenueStats(): array
    {
        // Daily revenue for the last 30 days
        $dailyRevenue = Order::where('payment_status', 'paid')
            ->where('created_at', '>=', now()->subDays(30))
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(total_amount) as revenue'),
                DB::raw('COUNT(*) as orders')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Monthly revenue for the last 12 months
        $monthlyRevenue = Order::where('payment_status', 'paid')
            ->where('created_at', '>=', now()->subMonths(12))
            ->select(
                DB::raw('YEAR(created_at) as year'),
                DB::raw('MONTH(created_at) as month'),
                DB::raw('SUM(total_amount) as revenue'),
                DB::raw('COUNT(*) as orders')
            )
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get();

        // Revenue by payment method
        $revenueByPaymentMethod = Order::where('payment_status', 'paid')
            ->select('payment_method', DB::raw('SUM(total_amount) as revenue'))
            ->groupBy('payment_method')
            ->get();

        return [
            'daily_revenue' => $dailyRevenue,
            'monthly_revenue' => $monthlyRevenue,
            'revenue_by_payment_method' => $revenueByPaymentMethod,
            'average_order_value' => Order::where('payment_status', 'paid')->avg('total_amount'),
            'highest_order_value' => Order::where('payment_status', 'paid')->max('total_amount'),
        ];
    }

    /**
     * Get order statistics
     */
    private function getOrderStats(): array
    {
        $ordersByStatus = Order::select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->get();

        $ordersByPaymentStatus = Order::select('payment_status', DB::raw('COUNT(*) as count'))
            ->groupBy('payment_status')
            ->get();

        // Orders trend for the last 30 days
        $ordersTrend = Order::where('created_at', '>=', now()->subDays(30))
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as orders')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return [
            'orders_by_status' => $ordersByStatus,
            'orders_by_payment_status' => $ordersByPaymentStatus,
            'orders_trend' => $ordersTrend,
            'pending_orders' => Order::where('status', 'pending')->count(),
            'processing_orders' => Order::where('status', 'processing')->count(),
            'shipped_orders' => Order::where('status', 'shipped')->count(),
            'delivered_orders' => Order::where('status', 'delivered')->count(),
            'cancelled_orders' => Order::where('status', 'cancelled')->count(),
        ];
    }

    /**
     * Get product statistics
     */
    private function getProductStats(): array
    {
        // Top selling products
        $topProducts = OrderItem::select('product_id', DB::raw('SUM(quantity) as total_sold'))
            ->with('product')
            ->groupBy('product_id')
            ->orderBy('total_sold', 'desc')
            ->limit(10)
            ->get();

        // Products by status
        $productsByStatus = Product::select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->get();

        // Out of stock products
        $outOfStockProducts = Product::where('in_stock', false)->count();
        $inStockProducts = Product::where('in_stock', true)->count();

        return [
            'top_selling_products' => $topProducts,
            'products_by_status' => $productsByStatus,
            'in_stock_products' => $inStockProducts,
            'out_of_stock_products' => $outOfStockProducts,
            'total_products_sold' => OrderItem::sum('quantity'),
            'average_product_rating' => ProductReview::avg('rating'),
        ];
    }

    /**
     * Get user statistics
     */
    private function getUserStats(): array
    {
        // User registration trend for the last 30 days
        $userRegistrationTrend = User::where('created_at', '>=', now()->subDays(30))
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as users')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Top customers by order value
        $topCustomers = Order::where('payment_status', 'paid')
            ->select('user_id', DB::raw('SUM(total_amount) as total_spent'), DB::raw('COUNT(*) as order_count'))
            ->with('user')
            ->groupBy('user_id')
            ->orderBy('total_spent', 'desc')
            ->limit(10)
            ->get();

        return [
            'user_registration_trend' => $userRegistrationTrend,
            'top_customers' => $topCustomers,
            'users_with_orders' => User::whereHas('orders')->count(),
            'users_without_orders' => User::whereDoesntHave('orders')->count(),
        ];
    }

    /**
     * Get artist statistics
     */
    private function getArtistStats(): array
    {
        // Top artists by product sales (simplified)
        $topArtists = Artist::withCount('products')
            ->orderBy('products_count', 'desc')
            ->limit(10)
            ->get();

        // Artists by active status
        $artistsByStatus = Artist::select('is_active', DB::raw('COUNT(*) as count'))
            ->groupBy('is_active')
            ->get()
            ->map(function($item) {
                return [
                    'status' => $item->is_active ? 'active' : 'inactive',
                    'count' => $item->count
                ];
            });

        return [
            'top_artists' => $topArtists,
            'artists_by_status' => $artistsByStatus,
            'artists_with_products' => Artist::has('products')->count(),
            'artists_without_products' => Artist::doesntHave('products')->count(),
            'total_artworks' => ArtistWork::count(),
            'featured_artworks' => ArtistWork::where('is_featured', true)->count(),
        ];
    }

    /**
     * Get trend statistics
     */
    private function getTrendStats(): array
    {
        $currentMonth = now();
        $lastMonth = now()->subMonth();

        $currentMonthOrders = Order::whereMonth('created_at', $currentMonth->month)
            ->whereYear('created_at', $currentMonth->year)
            ->count();

        $lastMonthOrders = Order::whereMonth('created_at', $lastMonth->month)
            ->whereYear('created_at', $lastMonth->year)
            ->count();

        $orderGrowth = $lastMonthOrders > 0 
            ? (($currentMonthOrders - $lastMonthOrders) / $lastMonthOrders) * 100 
            : 0;

        $currentMonthUsers = User::whereMonth('created_at', $currentMonth->month)
            ->whereYear('created_at', $currentMonth->year)
            ->count();

        $lastMonthUsers = User::whereMonth('created_at', $lastMonth->month)
            ->whereYear('created_at', $lastMonth->year)
            ->count();

        $userGrowth = $lastMonthUsers > 0 
            ? (($currentMonthUsers - $lastMonthUsers) / $lastMonthUsers) * 100 
            : 0;

        return [
            'order_growth' => round($orderGrowth, 2),
            'user_growth' => round($userGrowth, 2),
            'current_month_orders' => $currentMonthOrders,
            'last_month_orders' => $lastMonthOrders,
            'current_month_users' => $currentMonthUsers,
            'last_month_users' => $lastMonthUsers,
        ];
    }

    /**
     * Get recent activity
     */
    private function getRecentActivity(): array
    {
        return [
            'recent_orders' => Order::with(['user', 'orderItems'])
                ->withCount('orderItems as items_count')
                ->select([
                    'id',
                    'user_id', 
                    'total_amount',
                    'status',
                    'payment_status',
                    'billing_full_name',
                    'created_at'
                ])
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get(),
            'recent_users' => User::orderBy('created_at', 'desc')
                ->limit(10)
                ->get(),
            'recent_products' => Product::with(['artist'])
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get(),
            'recent_reviews' => ProductReview::with(['user', 'product'])
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get(),
        ];
    }
}
