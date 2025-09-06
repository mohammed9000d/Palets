<?php

namespace App\Http\Controllers;

use App\Models\News;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class NewsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = News::orderBy('created_at', 'desc');
            
            // Search functionality
            if ($request->has('search') && !empty($request->search)) {
                $searchTerm = $request->search;
                $query->where(function($q) use ($searchTerm) {
                    $q->where('main_title', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('sub_title', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('description', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('author_name', 'LIKE', "%{$searchTerm}%");
                });
            }
            
            // Pagination - default to 15 for admin, 8 for public
            $defaultPerPage = $request->is('api/public/*') ? 8 : 15;
            $perPage = $request->get('per_page', $defaultPerPage);
            $news = $query->paginate($perPage);
            
            return response()->json($news, 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving news: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // This method can be used for web routes if needed
        // For API, we typically don't need this method
        return response()->json([
            'message' => 'Use POST /api/news to create news'
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'main_title' => 'required|string|max:255',
                'sub_title' => 'nullable|string|max:255',
                'description' => 'required|string',
                'cover_photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'author_name' => 'required|string|max:255',
                'author_photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $newsData = $request->only(['main_title', 'sub_title', 'description', 'author_name']);

            // Handle cover photo upload
            if ($request->hasFile('cover_photo')) {
                $coverPhoto = $request->file('cover_photo');
                $coverPhotoPath = $coverPhoto->store('news/covers', 'public');
                $newsData['cover_photo'] = $coverPhotoPath;
            }

            // Handle author photo upload
            if ($request->hasFile('author_photo')) {
                $authorPhoto = $request->file('author_photo');
                $authorPhotoPath = $authorPhoto->store('news/authors', 'public');
                $newsData['author_photo'] = $authorPhotoPath;
            }

            $news = News::create($newsData);

            return response()->json([
                'success' => true,
                'data' => $news,
                'message' => 'News created successfully'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creating news: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        try {
            $news = News::findOrFail($id);
            
            return response()->json([
                'success' => true,
                'data' => $news,
                'message' => 'News retrieved successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'News not found'
            ], 404);
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        // This method can be used for web routes if needed
        // For API, we typically use show method to get data for editing
        return response()->json([
            'message' => 'Use GET /api/news/{id} to get news data for editing'
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $news = News::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'main_title' => 'required|string|max:255',
                'sub_title' => 'nullable|string|max:255',
                'description' => 'required|string',
                'cover_photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'author_name' => 'required|string|max:255',
                'author_photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $newsData = $request->only(['main_title', 'sub_title', 'description', 'author_name']);

            // Handle cover photo upload
            if ($request->hasFile('cover_photo')) {
                // Delete old cover photo if exists
                if ($news->cover_photo && Storage::disk('public')->exists($news->cover_photo)) {
                    Storage::disk('public')->delete($news->cover_photo);
                }
                
                $coverPhoto = $request->file('cover_photo');
                $coverPhotoPath = $coverPhoto->store('news/covers', 'public');
                $newsData['cover_photo'] = $coverPhotoPath;
            }

            // Handle author photo upload
            if ($request->hasFile('author_photo')) {
                // Delete old author photo if exists
                if ($news->author_photo && Storage::disk('public')->exists($news->author_photo)) {
                    Storage::disk('public')->delete($news->author_photo);
                }
                
                $authorPhoto = $request->file('author_photo');
                $authorPhotoPath = $authorPhoto->store('news/authors', 'public');
                $newsData['author_photo'] = $authorPhotoPath;
            }

            $news->update($newsData);

            return response()->json([
                'success' => true,
                'data' => $news->fresh(),
                'message' => 'News updated successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating news: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $news = News::findOrFail($id);

            // Delete associated files
            if ($news->cover_photo && Storage::disk('public')->exists($news->cover_photo)) {
                Storage::disk('public')->delete($news->cover_photo);
            }

            if ($news->author_photo && Storage::disk('public')->exists($news->author_photo)) {
                Storage::disk('public')->delete($news->author_photo);
            }

            $news->delete();

            return response()->json([
                'success' => true,
                'message' => 'News deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting news: ' . $e->getMessage()
            ], 500);
        }
    }
}
