<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class UserAuthController extends Controller
{
    /**
     * Get formatted user data for API responses
     */
    private function formatUserData($user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'phone' => $user->phone,
            'country_code' => $user->country_code,
            'date_of_birth' => $user->date_of_birth,
            'gender' => $user->gender,
            'avatar' => $user->getProfilePhotoUrl(),
            'avatar_thumb' => $user->getProfilePhotoThumbUrl(),
            'avatar_medium' => $user->getProfilePhotoMediumUrl(),
            'street_address' => $user->street_address,
            'city' => $user->city,
            'state' => $user->state,
            'postal_code' => $user->postal_code,
            'country' => $user->country,
            'billing_street_address' => $user->billing_street_address,
            'billing_city' => $user->billing_city,
            'billing_state' => $user->billing_state,
            'billing_postal_code' => $user->billing_postal_code,
            'billing_country' => $user->billing_country,
            'newsletter_subscription' => $user->newsletter_subscription,
            'sms_notifications' => $user->sms_notifications,
            'preferred_language' => $user->preferred_language,
            'timezone' => $user->timezone,
            'created_at' => $user->created_at,
        ];
    }
    /**
     * User registration
     */
    public function register(Request $request): JsonResponse
    {
        try {
            // Log the incoming request for debugging
            Log::info('User registration attempt', $request->all());
            
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:8|confirmed',
                'first_name' => 'nullable|string|max:255',
                'last_name' => 'nullable|string|max:255',
                'phone' => 'nullable|string|max:255',
                'country_code' => 'nullable|string|max:5',
            ]);

            if ($validator->fails()) {
                Log::error('User registration validation failed', $validator->errors()->toArray());
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                'phone' => $request->phone,
                'country_code' => $request->country_code ?? '+39',
                'is_active' => true,
            ]);

            // Login the user after registration
            Auth::guard('web')->login($user);

            return response()->json([
                'success' => true,
                'message' => 'Registration successful',
                'user' => $this->formatUserData($user)
            ], 201);

        } catch (\Exception $e) {
            Log::error('User registration error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Registration failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * User login
     */
    public function login(Request $request): JsonResponse
    {
        try {
            Log::info('User login attempt', ['email' => $request->email]);
            
            $request->validate([
                'email' => 'required|email',
                'password' => 'required|string',
            ]);

            $user = User::where('email', $request->email)->first();

            if (!$user || !Hash::check($request->password, $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'The provided credentials are incorrect.'
                ], 401);
            }

            if (!$user->is_active) {
                return response()->json([
                    'success' => false,
                    'message' => 'Your account has been deactivated.'
                ], 401);
            }

            // Update last login
            $user->update(['last_login_at' => now()]);

            // Login the user
            Auth::guard('web')->login($user, $request->boolean('remember'));

            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'user' => $this->formatUserData($user)
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Login failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * User logout
     */
    public function logout(Request $request): JsonResponse
    {
        try {
            Auth::guard('web')->logout();
            
            return response()->json([
                'success' => true,
                'message' => 'Successfully logged out'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Logout failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get authenticated user
     */
    public function me(Request $request): JsonResponse
    {
        try {
            $user = Auth::guard('web')->user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            return response()->json([
                'success' => true,
                'user' => $this->formatUserData($user)
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get user: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update user profile
     */
    public function updateProfile(Request $request): JsonResponse
    {
        try {
            $user = Auth::guard('web')->user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            
            // Validate the request
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'phone' => 'nullable|string|max:255',
                'country_code' => 'nullable|string|max:5',
                'date_of_birth' => 'nullable|date',
                'gender' => 'nullable|in:male,female,other',
                'street_address' => 'nullable|string|max:255',
                'city' => 'nullable|string|max:255',
                'state' => 'nullable|string|max:255',
                'postal_code' => 'nullable|string|max:255',
                'country' => 'nullable|string|max:255',
                'billing_street_address' => 'nullable|string|max:255',
                'billing_city' => 'nullable|string|max:255',
                'billing_state' => 'nullable|string|max:255',
                'billing_postal_code' => 'nullable|string|max:255',
                'billing_country' => 'nullable|string|max:255',
                'newsletter_subscription' => 'nullable',
                'sms_notifications' => 'nullable',
                'preferred_language' => 'nullable|string|max:5',
                'timezone' => 'nullable|string|max:255',
                'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Helper function to convert empty strings to null
            $getValue = function($key) use ($request) {
                $value = $request->input($key);
                return ($value === '' || $value === null) ? null : $value;
            };

            // Update user data directly on the model
            $user->name = $request->input('name');
            $user->phone = $getValue('phone');
            $user->country_code = $getValue('country_code');
            $user->date_of_birth = $getValue('date_of_birth');
            $user->gender = $getValue('gender');
            $user->street_address = $getValue('street_address');
            $user->city = $getValue('city');
            $user->state = $getValue('state');
            $user->postal_code = $getValue('postal_code');
            $user->country = $getValue('country');
            $user->billing_street_address = $getValue('billing_street_address');
            $user->billing_city = $getValue('billing_city');
            $user->billing_state = $getValue('billing_state');
            $user->billing_postal_code = $getValue('billing_postal_code');
            $user->billing_country = $getValue('billing_country');
            $user->newsletter_subscription = filter_var($request->input('newsletter_subscription'), FILTER_VALIDATE_BOOLEAN);
            $user->sms_notifications = filter_var($request->input('sms_notifications'), FILTER_VALIDATE_BOOLEAN);
            $user->preferred_language = $getValue('preferred_language');
            $user->timezone = $getValue('timezone');

            // Handle profile photo upload using media library
            if ($request->hasFile('avatar')) {
                Log::info('Processing avatar upload for user: ' . $user->id);
                
                // Clear existing profile photos (since we only allow one)
                $user->clearMediaCollection('profile_photos');
                
                // Add new profile photo
                $media = $user->addMediaFromRequest('avatar')
                    ->toMediaCollection('profile_photos');
                    
                Log::info('Avatar uploaded successfully', [
                    'media_id' => $media->id,
                    'file_name' => $media->file_name,
                    'url' => $media->getUrl()
                ]);
            }

            // Save the user
            $user->save();

            // Refresh user to get updated media
            $user = $user->fresh();
            
            $avatarUrl = $user->getProfilePhotoUrl();
            $avatarThumb = $user->getProfilePhotoThumbUrl();
            $avatarMedium = $user->getProfilePhotoMediumUrl();
            
            Log::info('Profile update completed', [
                'user_id' => $user->id,
                'avatar_url' => $avatarUrl,
                'avatar_thumb' => $avatarThumb,
                'avatar_medium' => $avatarMedium
            ]);

            // Return the updated user data
            $userData = $this->formatUserData($user);
            // Override avatar URLs with the calculated ones from this method
            $userData['avatar'] = $avatarUrl;
            $userData['avatar_thumb'] = $avatarThumb;
            $userData['avatar_medium'] = $avatarMedium;
            
            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully',
                'user' => $userData
            ], 200);

        } catch (\Exception $e) {
            Log::error('Profile update error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Profile update failed: ' . $e->getMessage()
            ], 500);
        }
    }
}
