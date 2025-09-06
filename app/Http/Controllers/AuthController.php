<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Admin login
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $admin = Admin::where('email', $request->email)->first();

        if (!$admin || !Hash::check($request->password, $admin->password)) {
            return response()->json([
                'message' => 'The provided credentials are incorrect.'
            ], 422);
        }

        if (!$admin->is_active) {
            return response()->json([
                'message' => 'Your account has been deactivated.'
            ], 422);
        }

        // Create a simple token (in production, use Laravel Sanctum or Passport)
        $token = base64_encode($admin->id . ':' . time() . ':' . config('app.key'));

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $admin->id,
                'name' => $admin->name,
                'email' => $admin->email,
                'role' => $admin->role,
            ]
        ]);
    }

    /**
     * Admin logout
     */
    public function logout(Request $request)
    {
        // Since we're using a simple token system, just return success
        // In production with Sanctum, you would revoke the token
        return response()->json(['message' => 'Successfully logged out']);
    }

    /**
     * Get authenticated admin
     */
    public function me(Request $request)
    {
        $admin = $request->user();
        
        return response()->json([
            'user' => [
                'id' => $admin->id,
                'name' => $admin->name,
                'email' => $admin->email,
                'role' => $admin->role,
            ]
        ]);
    }
}
