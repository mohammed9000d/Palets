<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminAuth
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // For API routes, check for token in Authorization header
        if ($request->is('api/*')) {
            $token = $request->bearerToken() ?: $request->header('Authorization');
            
            if (!$token) {
                return response()->json([
                    'success' => false,
                    'message' => 'Authentication token required'
                ], 401);
            }

            // Remove 'Bearer ' prefix if present
            $token = str_replace('Bearer ', '', $token);
            
            // Validate the token (simple validation for our base64 token)
            try {
                $tokenData = base64_decode($token);
                if (!$tokenData || !str_contains($tokenData, ':')) {
                    throw new \Exception('Invalid token format');
                }
                
                $parts = explode(':', $tokenData);
                if (count($parts) < 3) {
                    throw new \Exception('Invalid token structure');
                }
                
                $adminId = $parts[0];
                $admin = \App\Models\Admin::find($adminId);
                
                if (!$admin || !$admin->is_active) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Invalid or inactive admin account'
                    ], 401);
                }
                
                // Set the authenticated admin for the request
                $request->setUserResolver(function () use ($admin) {
                    return $admin;
                });
                
            } catch (\Exception $e) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid authentication token'
                ], 401);
            }
        } else {
            // For web routes, return 401 as well since we're primarily API-focused
            return response()->json([
                'success' => false,
                'message' => 'Authentication required'
            ], 401);
        }

        return $next($request);
    }
}
