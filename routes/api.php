<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\UserAuthController;
use App\Http\Controllers\ArtistController;
use App\Http\Controllers\ArtistWorkController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ArtPanelGalleryController;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\TestPaymentController;
use App\Http\Controllers\ProductReviewController;
use App\Http\Controllers\AdminOrderController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\SettingController;

// Configuration endpoint for frontend
Route::get('/config', function () {
    return response()->json([
        'app_url' => config('app.url'),
        'app_name' => config('app.name'),
        'api_url' => config('app.url') . '/api',
        'storage_url' => config('app.url') . '/storage'
    ]);
});

// Test routes
Route::get('/test', function () {
    return response()->json(['message' => 'API GET is working']);
});

Route::post('/test', function () {
    return response()->json(['message' => 'API POST is working']);
});

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Admin authentication routes
Route::post('/admin/login', [AuthController::class, 'login']);
Route::post('/admin/logout', [AuthController::class, 'logout']);
Route::get('/admin/me', [AuthController::class, 'me']);

// Protected Admin routes - require authentication
Route::middleware(['admin.auth'])->group(function () {
    // Admin CRUD routes
    Route::apiResource('admins', AdminController::class);

    // Users CRUD routes
    Route::apiResource('users', UserController::class);

    // Artists routes
    Route::apiResource('artists', ArtistController::class)->parameters(['artists' => 'artist:slug']);
    Route::get('/artists/{artist:slug}/works', [ArtistController::class, 'works']);

    // Artist Works routes
    Route::apiResource('artist-works', ArtistWorkController::class)->parameters(['artist-works' => 'artistWork:slug']);
    Route::post('/artist-works/{artistWork:slug}/toggle-featured', [ArtistWorkController::class, 'toggleFeatured']);
    Route::post('/artist-works/{artistWork:slug}/toggle-for-sale', [ArtistWorkController::class, 'toggleForSale']);
    Route::post('/artist-works/{artistWork:slug}/like', [ArtistWorkController::class, 'like']);
    Route::get('/tags', [ArtistWorkController::class, 'tags']);

    // Products routes
    Route::apiResource('products', ProductController::class)->parameters(['products' => 'product:slug']);
    Route::get('/products-artists', [ProductController::class, 'getArtists']);
    Route::post('/products/{product:slug}/toggle-stock', [ProductController::class, 'toggleStock']);
    Route::post('/products/{product:slug}/like', [ProductController::class, 'toggleLike']);

    // Art Panel Galleries routes
    Route::apiResource('art-panel-galleries', ArtPanelGalleryController::class)->parameters(['art-panel-galleries' => 'artPanelGallery:slug']);
    Route::get('/galleries-artists', [ArtPanelGalleryController::class, 'getArtists']);

    // News routes
    Route::apiResource('news', NewsController::class);

    // Admin Orders routes
    Route::prefix('admin-orders')->group(function () {
        Route::get('/', [AdminOrderController::class, 'index']);
        Route::get('/statistics', [AdminOrderController::class, 'statistics']);
        Route::get('/{id}', [AdminOrderController::class, 'show']);
        Route::put('/{id}/status', [AdminOrderController::class, 'updateStatus']);
        Route::put('/{id}/payment-status', [AdminOrderController::class, 'updatePaymentStatus']);
        Route::delete('/{id}', [AdminOrderController::class, 'destroy']);
    });

    // Dashboard routes
    Route::get('/dashboard/statistics', [DashboardController::class, 'getStatistics']);
    
    // Settings routes
    Route::prefix('settings')->group(function () {
        Route::get('/', [SettingController::class, 'index']);
        Route::post('/', [SettingController::class, 'update']);
        Route::delete('/file', [SettingController::class, 'deleteFile']);
    });
});


// User Authentication routes (need session middleware for web auth)
Route::prefix('auth')->middleware(['web'])->group(function () {
    Route::post('/register', [UserAuthController::class, 'register']);
    Route::post('/login', [UserAuthController::class, 'login']);
    Route::post('/logout', [UserAuthController::class, 'logout'])->middleware('auth:web');
    Route::get('/me', [UserAuthController::class, 'me'])->middleware('auth:web');
    Route::put('/profile', [UserAuthController::class, 'updateProfile'])->middleware('auth:web');
    Route::post('/profile', [UserAuthController::class, 'updateProfile'])->middleware('auth:web'); // For file uploads
});

// Cart routes (available for both authenticated users and guests, need session middleware)
Route::prefix('cart')->middleware(['web'])->group(function () {
    Route::get('/', [CartController::class, 'index']);
    Route::post('/add', [CartController::class, 'addToCart']);
    Route::put('/update', [CartController::class, 'updateQuantity']);
    Route::delete('/remove', [CartController::class, 'removeItem']);
    Route::delete('/clear', [CartController::class, 'clearCart']);
    Route::post('/merge', [CartController::class, 'mergeCart'])->middleware('auth:web');
});

// Order routes (require authentication)
Route::prefix('orders')->middleware(['web', 'auth:web'])->group(function () {
    Route::get('/', [OrderController::class, 'index']);
    Route::post('/', [OrderController::class, 'store']);
    Route::get('/{id}', [OrderController::class, 'show']);
    Route::post('/{id}/cancel', [OrderController::class, 'cancel']);
});

// Payment routes (require authentication)
Route::prefix('payments')->middleware(['web', 'auth:web'])->group(function () {
    Route::post('/stripe/create-intent', [PaymentController::class, 'createStripePaymentIntent']);
    Route::post('/stripe/confirm', [PaymentController::class, 'confirmStripePayment']);
    Route::post('/paypal/create-order', [PaymentController::class, 'createPayPalOrder']);
    Route::post('/paypal/confirm', [PaymentController::class, 'confirmPayPalPayment']);
    
    // Test payment routes (for development/testing)
    Route::post('/test/stripe', [TestPaymentController::class, 'testStripePayment']);
    Route::post('/test/paypal', [TestPaymentController::class, 'testPayPalPayment']);
});

// Guest payment routes (available for both authenticated and guest users)
Route::prefix('guest-payments')->middleware(['web'])->group(function () {
    Route::post('/sync-cart', [PaymentController::class, 'syncGuestCart']);
    Route::post('/stripe/create-intent', [PaymentController::class, 'createGuestStripePaymentIntent']);
    Route::post('/stripe/confirm', [PaymentController::class, 'confirmGuestStripePayment']);
    Route::post('/paypal/create-order', [PaymentController::class, 'createGuestPayPalOrder']);
    Route::post('/paypal/confirm', [PaymentController::class, 'confirmGuestPayPalPayment']);
});

// Public settings route
Route::get('/public/settings', [SettingController::class, 'getPublicSettings']);

// Public routes for frontend (no authentication required)
Route::prefix('public')->group(function () {
    Route::get('/artists', [ArtistController::class, 'index']);
    Route::get('/artists/{artist:slug}', [ArtistController::class, 'show']);
    Route::get('/artists/{artist:slug}/works', [ArtistController::class, 'works']);
    Route::get('/works', [ArtistWorkController::class, 'index']);
    Route::get('/works/{artistWork:slug}', [ArtistWorkController::class, 'show']);
    Route::post('/works/{artistWork:slug}/like', [ArtistWorkController::class, 'like']);
    Route::get('/tags', [ArtistWorkController::class, 'tags']);
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{product:slug}', [ProductController::class, 'show']);
    Route::get('/products-artists', [ProductController::class, 'getArtists']);
    Route::post('/products/{product:slug}/like', [ProductController::class, 'toggleLike']);
    Route::get('/art-panel-galleries', [ArtPanelGalleryController::class, 'index']);
    Route::get('/art-panel-galleries/{artPanelGallery:slug}', [ArtPanelGalleryController::class, 'show']);
    Route::get('/galleries-artists', [ArtPanelGalleryController::class, 'getArtists']);
    Route::get('/news', [NewsController::class, 'index']);
    Route::get('/news/{id}', [NewsController::class, 'show']);
    
    // Debug routes for testing
    Route::get('/debug/products', function(Request $request) {
        $query = \App\Models\Product::with(['media', 'artist']);
        $query->where('status', 'published');
        
        if ($request->has('artist_id') && $request->artist_id) {
            $query->where('artist_id', $request->artist_id);
        }
        
        $products = $query->get();
        
        return response()->json([
            'debug' => true,
            'request_params' => $request->all(),
            'total_products' => $products->count(),
            'products' => $products->map(function($product) {
                return [
                    'id' => $product->id,
                    'main_title' => $product->main_title,
                    'artist_id' => $product->artist_id,
                    'artist_name' => $product->artist?->artist_name,
                    'status' => $product->status,
                    'cover_photo_url' => $product->cover_photo_url,
                ];
            })
        ]);
    });
    
    Route::get('/debug/all-products', function() {
        $allProducts = \App\Models\Product::all();
        $publishedProducts = \App\Models\Product::where('status', 'published')->get();
        $artists = \App\Models\Artist::all();
        
        return response()->json([
            'debug' => true,
            'total_products' => $allProducts->count(),
            'published_products' => $publishedProducts->count(),
            'total_artists' => $artists->count(),
            'all_products' => $allProducts->map(function($product) {
                return [
                    'id' => $product->id,
                    'main_title' => $product->main_title,
                    'artist_id' => $product->artist_id,
                    'status' => $product->status,
                ];
            }),
            'artists' => $artists->map(function($artist) {
                return [
                    'id' => $artist->id,
                    'artist_name' => $artist->artist_name,
                    'slug' => $artist->slug,
                ];
            })
        ]);
    });
});

// Product Reviews routes (mixed public/authenticated)
Route::prefix('products/{productId}/reviews')->middleware(['web'])->group(function () {
    // Public routes
    Route::get('/', [ProductReviewController::class, 'index']);
    
    // Authenticated routes
    Route::post('/', [ProductReviewController::class, 'store'])->middleware('auth:web');
    Route::put('/{reviewId}', [ProductReviewController::class, 'update'])->middleware('auth:web');
    Route::delete('/{reviewId}', [ProductReviewController::class, 'destroy'])->middleware('auth:web');
    Route::get('/user', [ProductReviewController::class, 'getUserReview'])->middleware('auth:web');
});
