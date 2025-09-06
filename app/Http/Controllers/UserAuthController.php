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
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class UserAuthController extends Controller
{
    /**
     * User registration
     */
    public function register(Request $request): JsonResponse
    {
        try {
            // Log the incoming request for debugging
            \Log::info('User registration attempt', $request->all());
            
            $validator = \Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:8|confirmed',
                'first_name' => 'nullable|string|max:255',
                'last_name' => 'nullable|string|max:255',
                'phone' => 'nullable|string|max:255',
                'country_code' => 'nullable|string|max:5',
            ]);

            if ($validator->fails()) {
                \Log::error('User registration validation failed', $validator->errors()->toArray());
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
                'country_code' => $request->country_code ?? '+1',
                'is_active' => true,
            ]);

            // Login the user after registration
            Auth::guard('web')->login($user);

            return response()->json([
                'success' => true,
                'message' => 'Registration successful',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'avatar' => $user->avatar ? Storage::url($user->avatar) : null,
                ]
            ], 201);

        } catch (\Exception $e) {
            \Log::error('User registration error', [
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
            \Log::info('User login attempt', ['email' => $request->email]);
            
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
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'avatar' => $user->avatar ? Storage::url($user->avatar) : null,
                ]
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

            $avatarUrl = $user->avatar ? Storage::url($user->avatar) : null;
            \Log::info('User avatar URL generated', ['avatar_path' => $user->avatar, 'avatar_url' => $avatarUrl]);
            
            return response()->json([
                'success' => true,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'phone' => $user->phone,
                    'country_code' => $user->country_code,
                    'date_of_birth' => $user->date_of_birth,
                    'gender' => $user->gender,
                    'avatar' => $avatarUrl,
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
                ]
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

            $request->validate([
                'name' => 'sometimes|required|string|max:255',
                'first_name' => 'nullable|string|max:255',
                'last_name' => 'nullable|string|max:255',
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
                'newsletter_subscription' => 'nullable|boolean',
                'sms_notifications' => 'nullable|boolean',
                'preferred_language' => 'nullable|string|max:5',
                'timezone' => 'nullable|string|max:255',
                'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            ]);

            $updateData = $request->except(['avatar']);

            // Handle avatar upload
            if ($request->hasFile('avatar')) {
                // Delete old avatar if exists
                if ($user->avatar && Storage::exists($user->avatar)) {
                    Storage::delete($user->avatar);
                }

                $avatarPath = $request->file('avatar')->store('avatars', 'public');
                $updateData['avatar'] = $avatarPath;
            }

            User::where('id', $user->id)->update($updateData);
            $user = User::find($user->id);

            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'phone' => $user->phone,
                    'country_code' => $user->country_code,
                    'date_of_birth' => $user->date_of_birth,
                    'gender' => $user->gender,
                    'avatar' => $user->avatar ? Storage::url($user->avatar) : null,
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
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Profile update failed: ' . $e->getMessage()
            ], 500);
        }
    }
}
