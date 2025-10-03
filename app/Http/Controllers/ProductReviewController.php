<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductReview;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class ProductReviewController extends Controller
{
    /**
     * Get reviews for a specific product
     */
    public function index(Request $request, $productId)
    {
        try {
            $product = Product::findOrFail($productId);
            
            $page = $request->get('page', 1);
            $perPage = 5; // As requested
            
            $reviews = $product->reviews()
                ->with('user:id,name')
                ->newest()
                ->paginate($perPage, ['*'], 'page', $page);

            // Get rating statistics
            $ratingStats = $product->rating_stats;
            $totalReviews = $product->reviews_count;
            $averageRating = round($product->average_rating, 1);

            // Calculate percentages for rating stats
            $ratingPercentages = [];
            if ($totalReviews > 0) {
                for ($i = 1; $i <= 5; $i++) {
                    $ratingPercentages[$i] = round(($ratingStats[$i] / $totalReviews) * 100, 1);
                }
            } else {
                for ($i = 1; $i <= 5; $i++) {
                    $ratingPercentages[$i] = 0;
                }
            }

            return response()->json([
                'success' => true,
                'reviews' => $reviews->items(),
                'pagination' => [
                    'current_page' => $reviews->currentPage(),
                    'last_page' => $reviews->lastPage(),
                    'per_page' => $reviews->perPage(),
                    'total' => $reviews->total(),
                    'has_more' => $reviews->hasMorePages()
                ],
                'statistics' => [
                    'average_rating' => $averageRating,
                    'total_reviews' => $totalReviews,
                    'rating_counts' => $ratingStats,
                    'rating_percentages' => $ratingPercentages
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load reviews',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a new review
     */
    public function store(Request $request, $productId)
    {
        try {
            // Check if user is authenticated
            if (!Auth::check()) {
                return response()->json([
                    'success' => false,
                    'message' => 'You must be logged in to leave a review'
                ], 401);
            }

            $product = Product::findOrFail($productId);

            $request->validate([
                'rating' => 'required|integer|min:1|max:5',
                'comment' => 'required|string|min:10|max:1000',
            ]);

            // Check if user already reviewed this product
            $existingReview = ProductReview::where([
                'user_id' => Auth::id(),
                'product_id' => $productId
            ])->first();

            if ($existingReview) {
                return response()->json([
                    'success' => false,
                    'message' => 'You have already reviewed this product. You can edit your existing review instead.'
                ], 422);
            }

            // Create the review
            $review = ProductReview::create([
                'user_id' => Auth::id(),
                'product_id' => $productId,
                'rating' => $request->rating,
                'comment' => $request->comment,
            ]);

            // Load the review with user data
            $review->load('user:id,name');

            return response()->json([
                'success' => true,
                'message' => 'Review added successfully!',
                'review' => $review
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to add review',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update an existing review
     */
    public function update(Request $request, $productId, $reviewId)
    {
        try {
            if (!Auth::check()) {
                return response()->json([
                    'success' => false,
                    'message' => 'You must be logged in to edit a review'
                ], 401);
            }

            $review = ProductReview::where([
                'id' => $reviewId,
                'product_id' => $productId,
                'user_id' => Auth::id()
            ])->firstOrFail();

            $request->validate([
                'rating' => 'required|integer|min:1|max:5',
                'comment' => 'required|string|min:10|max:1000',
            ]);

            $review->update([
                'rating' => $request->rating,
                'comment' => $request->comment,
            ]);

            $review->load('user:id,name');

            return response()->json([
                'success' => true,
                'message' => 'Review updated successfully!',
                'review' => $review
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update review',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a review
     */
    public function destroy($productId, $reviewId)
    {
        try {
            if (!Auth::check()) {
                return response()->json([
                    'success' => false,
                    'message' => 'You must be logged in to delete a review'
                ], 401);
            }

            $review = ProductReview::where([
                'id' => $reviewId,
                'product_id' => $productId,
                'user_id' => Auth::id()
            ])->firstOrFail();

            $review->delete();

            return response()->json([
                'success' => true,
                'message' => 'Review deleted successfully!'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete review',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user's review for a specific product
     */
    public function getUserReview($productId)
    {
        try {
            if (!Auth::check()) {
                return response()->json([
                    'success' => true,
                    'review' => null
                ]);
            }

            $review = ProductReview::where([
                'user_id' => Auth::id(),
                'product_id' => $productId
            ])->with('user:id,name')->first();

            return response()->json([
                'success' => true,
                'review' => $review
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load user review',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}