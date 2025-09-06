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
});

// User Authentication routes (need session middleware for web auth)
Route::prefix('auth')->middleware(['web'])->group(function () {
    Route::post('/register', [UserAuthController::class, 'register']);
    Route::post('/login', [UserAuthController::class, 'login']);
    Route::post('/logout', [UserAuthController::class, 'logout'])->middleware('auth:web');
    Route::get('/me', [UserAuthController::class, 'me'])->middleware('auth:web');
    Route::put('/profile', [UserAuthController::class, 'updateProfile'])->middleware('auth:web');
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
});
