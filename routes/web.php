<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserAuthController;

// Serve React SPA for all routes except API routes
Route::get('/{any}', function () {
    return view('app');
})->where('any', '^(?!api).*$');
