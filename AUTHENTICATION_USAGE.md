# Authentication Usage Guide

## Overview
Your arts palets store now has two separate authentication systems:
- **Users (Customers)**: Store customers with detailed profiles
- **Admins**: Dashboard administrators with role-based access

## Authentication Guards

### User Authentication (Store Customers)
```php
// Login
Auth::guard('web')->attempt($credentials);

// Check if logged in
if (Auth::guard('web')->check()) {
    $user = Auth::guard('web')->user();
}

// Logout
Auth::guard('web')->logout();
```

### Admin Authentication (Dashboard)
```php
// Login
Auth::guard('admin')->attempt($credentials);

// Check if logged in
if (Auth::guard('admin')->check()) {
    $admin = Auth::guard('admin')->user();
}

// Logout
Auth::guard('admin')->logout();
```

## User Model Fields

### Basic Information
- `name` - Full name
- `email` - Email address
- `password` - Hashed password
- `first_name` - First name
- `last_name` - Last name
- `phone` - Phone number
- `country_code` - Country code (default: +1)

### Profile Information
- `date_of_birth` - Birth date
- `gender` - Gender (male, female, other)
- `avatar` - Profile picture path

### Address Information
- `street_address` - Street address
- `city` - City
- `state` - State/Province
- `postal_code` - ZIP/Postal code
- `country` - Country

### Billing Address (if different)
- `billing_street_address`
- `billing_city`
- `billing_state`
- `billing_postal_code`
- `billing_country`

### Store Preferences
- `favorite_categories` - JSON array of preferred art categories
- `preferred_artists` - JSON array of favorite artists
- `newsletter_subscription` - Boolean for email newsletter
- `sms_notifications` - Boolean for SMS notifications

### Account Status
- `is_active` - Account status
- `last_login_at` - Last login timestamp
- `preferred_language` - Language preference (default: en)
- `timezone` - User timezone (default: UTC)

## Admin Model Fields

### Basic Information
- `name` - Admin name
- `email` - Admin email
- `password` - Hashed password
- `role` - Admin role (admin, super_admin, moderator)
- `is_active` - Account status

## Route Protection

### Protecting User Routes
```php
Route::middleware('auth:web')->group(function () {
    Route::get('/profile', [UserController::class, 'profile']);
    Route::get('/orders', [OrderController::class, 'index']);
});
```

### Protecting Admin Routes
```php
Route::middleware('auth:admin')->group(function () {
    Route::get('/admin/dashboard', [AdminController::class, 'dashboard']);
    Route::get('/admin/users', [AdminController::class, 'users']);
});

// Or use the custom middleware
Route::middleware('admin.auth')->group(function () {
    // Admin routes
});
```

## Example Usage in Controllers

### User Controller
```php
class UserController extends Controller
{
    public function profile()
    {
        $user = Auth::guard('web')->user();
        return view('profile', compact('user'));
    }
    
    public function updateProfile(Request $request)
    {
        $user = Auth::guard('web')->user();
        $user->update($request->validated());
        return back()->with('success', 'Profile updated!');
    }
}
```

### Admin Controller
```php
class AdminController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:admin');
    }
    
    public function dashboard()
    {
        $admin = Auth::guard('admin')->user();
        return view('admin.dashboard', compact('admin'));
    }
}
```

## Middleware Registration

Add to `bootstrap/app.php`:
```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->alias([
        'admin.auth' => \App\Http\Middleware\AdminAuth::class,
    ]);
})
```

## Login Forms

### User Login
```php
// Route
Route::post('/login', function (Request $request) {
    $credentials = $request->only('email', 'password');
    
    if (Auth::guard('web')->attempt($credentials)) {
        return redirect()->intended('/dashboard');
    }
    
    return back()->withErrors(['email' => 'Invalid credentials']);
});
```

### Admin Login
```php
// Route
Route::post('/admin/login', function (Request $request) {
    $credentials = $request->only('email', 'password');
    
    if (Auth::guard('admin')->attempt($credentials)) {
        return redirect()->intended('/admin/dashboard');
    }
    
    return back()->withErrors(['email' => 'Invalid credentials']);
});
```

## Best Practices

1. **Always specify the guard** when working with authentication
2. **Use middleware** to protect routes appropriately
3. **Check user status** (is_active) in middleware
4. **Separate login forms** for users and admins
5. **Use different redirect paths** after login
6. **Validate user input** before updating profiles
7. **Hash passwords** using Laravel's built-in hashing
