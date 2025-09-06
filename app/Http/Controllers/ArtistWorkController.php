<?php

namespace App\Http\Controllers;

use App\Models\Artist;
use App\Models\ArtistWork;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;

class ArtistWorkController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = ArtistWork::with(['artist', 'media']);

        // Filter by artist
        if ($request->has('artist_id')) {
            $query->where('artist_id', $request->artist_id);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter featured works
        if ($request->has('featured')) {
            $query->where('is_featured', $request->boolean('featured'));
        }

        // Filter works for sale
        if ($request->has('for_sale')) {
            $query->where('is_for_sale', $request->boolean('for_sale'));
        }

        // Search functionality
        if ($request->has('search') && $request->search) {
            $query->search($request->search);
        }

        // Filter by tags
        if ($request->has('tags')) {
            $tags = is_array($request->tags) ? $request->tags : explode(',', $request->tags);
            $query->withTags($tags);
        }

        // Filter by year
        if ($request->has('year')) {
            $query->where('year_created', $request->year);
        }

        // Filter by price range
        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        // Pagination
        $perPage = $request->get('per_page', 12);
        $works = $query->paginate($perPage);

        // Transform data to include media URLs
        $works->getCollection()->transform(function ($work) {
            return $this->transformWork($work);
        });

        return response()->json($works);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Process tags if it's a JSON string
        $requestData = $request->all();
        if (isset($requestData['tags']) && is_string($requestData['tags'])) {
            $requestData['tags'] = json_decode($requestData['tags'], true) ?: [];
        }

        $validator = Validator::make($requestData, [
            'artist_id' => 'required|exists:artists,id',
            'title' => 'required|string|max:255',
            'overview' => 'nullable|string',
            'description' => 'nullable|string',
            'slug' => 'nullable|string|unique:artist_works,slug',
            'status' => 'required|in:draft,published,archived',
            'year_created' => 'nullable|integer|between:1900,' . date('Y'),
            'medium' => 'nullable|string|max:255',
            'dimensions' => 'nullable|string|max:255',
            'price' => 'nullable|numeric|between:0,999999.99',
            'is_for_sale' => 'boolean',
            'is_featured' => 'boolean',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            'cover_image' => 'nullable|image|mimes:jpeg,png,webp|max:10240', // 10MB max
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpeg,png,webp|max:10240',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $validated = $validator->validated();

        // Generate slug if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
        }

        // Ensure slug is unique
        $originalSlug = $validated['slug'];
        $counter = 1;
        while (ArtistWork::where('slug', $validated['slug'])->exists()) {
            $validated['slug'] = $originalSlug . '-' . $counter;
            $counter++;
        }

        $work = ArtistWork::create($validated);

        // Handle cover image upload
        if ($request->hasFile('cover_image')) {
            $work->addMediaFromRequest('cover_image')
                ->toMediaCollection('cover_image');
        }

        // Handle multiple images upload
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $work->addMedia($file)
                    ->toMediaCollection('images');
            }
        }

        // Load relationships for response
        $work->load(['artist', 'media']);

        return response()->json([
            'message' => 'Artist work created successfully',
            'work' => $this->transformWork($work)
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(ArtistWork $artistWork, Request $request)
    {
        $artistWork->load(['artist', 'media']);

        // Increment view count unless it's the same user/session viewing multiple times
        if (!$request->has('skip_view_increment')) {
            $artistWork->incrementViewCount();
        }

        return response()->json([
            'work' => $this->transformWork($artistWork, true)
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ArtistWork $artistWork)
    {
        // Process tags if it's a JSON string
        $requestData = $request->all();
        if (isset($requestData['tags']) && is_string($requestData['tags'])) {
            $requestData['tags'] = json_decode($requestData['tags'], true) ?: [];
        }

        $validator = Validator::make($requestData, [
            'artist_id' => 'sometimes|required|exists:artists,id',
            'title' => 'sometimes|required|string|max:255',
            'overview' => 'nullable|string',
            'description' => 'nullable|string',
            'slug' => ['nullable', 'string', Rule::unique('artist_works', 'slug')->ignore($artistWork->id)],
            'status' => 'sometimes|required|in:draft,published,archived',
            'year_created' => 'nullable|integer|between:1900,' . date('Y'),
            'medium' => 'nullable|string|max:255',
            'dimensions' => 'nullable|string|max:255',
            'price' => 'nullable|numeric|between:0,999999.99',
            'is_for_sale' => 'boolean',
            'is_featured' => 'boolean',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            'cover_image' => 'nullable|image|mimes:jpeg,png,webp|max:10240',
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpeg,png,webp|max:10240',
            'remove_cover_image' => 'boolean',
            'remove_images' => 'nullable|array',
            'remove_images.*' => 'integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $validated = $validator->validated();

        // Update slug if title changed
        if (isset($validated['title']) && empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
            
            // Ensure slug is unique
            $originalSlug = $validated['slug'];
            $counter = 1;
            while (ArtistWork::where('slug', $validated['slug'])->where('id', '!=', $artistWork->id)->exists()) {
                $validated['slug'] = $originalSlug . '-' . $counter;
                $counter++;
            }
        }

        $artistWork->update($validated);

        // Handle cover image removal
        if ($request->boolean('remove_cover_image')) {
            $artistWork->clearMediaCollection('cover_image');
        }

        // Handle new cover image upload
        if ($request->hasFile('cover_image')) {
            $artistWork->clearMediaCollection('cover_image');
            $artistWork->addMediaFromRequest('cover_image')
                ->toMediaCollection('cover_image');
        }

        // Handle image removal
        if ($request->has('remove_images')) {
            foreach ($request->remove_images as $mediaId) {
                $media = $artistWork->getMedia('images')->where('id', $mediaId)->first();
                if ($media) {
                    $media->delete();
                }
            }
        }

        // Handle new images upload
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $artistWork->addMedia($file)
                    ->toMediaCollection('images');
            }
        }

        // Reload relationships for response
        $artistWork->load(['artist', 'media']);

        return response()->json([
            'message' => 'Artist work updated successfully',
            'work' => $this->transformWork($artistWork)
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ArtistWork $artistWork)
    {
        // This will also delete all associated media due to cascade
        $artistWork->delete();

        return response()->json([
            'message' => 'Artist work deleted successfully'
        ]);
    }

    /**
     * Toggle featured status
     */
    public function toggleFeatured(ArtistWork $artistWork)
    {
        $artistWork->update(['is_featured' => !$artistWork->is_featured]);

        return response()->json([
            'message' => 'Featured status updated successfully',
            'is_featured' => $artistWork->is_featured
        ]);
    }

    /**
     * Toggle for sale status
     */
    public function toggleForSale(ArtistWork $artistWork)
    {
        $artistWork->update(['is_for_sale' => !$artistWork->is_for_sale]);

        return response()->json([
            'message' => 'For sale status updated successfully',
            'is_for_sale' => $artistWork->is_for_sale
        ]);
    }

    /**
     * Like a work
     */
    public function like(ArtistWork $artistWork)
    {
        $artistWork->incrementLikeCount();

        return response()->json([
            'message' => 'Work liked successfully',
            'like_count' => $artistWork->like_count
        ]);
    }

    /**
     * Get all unique tags
     */
    public function tags()
    {
        $works = ArtistWork::whereNotNull('tags')->get();
        $allTags = [];

        foreach ($works as $work) {
            if ($work->tags) {
                $allTags = array_merge($allTags, $work->tags);
            }
        }

        $uniqueTags = array_unique($allTags);
        sort($uniqueTags);

        return response()->json(['tags' => array_values($uniqueTags)]);
    }

    /**
     * Transform work data for API response
     */
    private function transformWork(ArtistWork $work, $includeFullDetails = false)
    {
        $data = [
            'id' => $work->id,
            'artist_id' => $work->artist_id,
            'title' => $work->title,
            'overview' => $work->overview,
            'slug' => $work->slug,
            'status' => $work->status,
            'year_created' => $work->year_created,
            'medium' => $work->medium,
            'dimensions' => $work->dimensions,
            'price' => $work->price,
            'is_for_sale' => $work->is_for_sale,
            'is_featured' => $work->is_featured,
            'tags' => $work->tags,
            'view_count' => $work->view_count,
            'like_count' => $work->like_count,
            'cover_image_url' => $work->cover_image_url,
            'cover_image_thumb_url' => $work->cover_image_thumb_url,
            'created_at' => $work->created_at,
            'updated_at' => $work->updated_at,
        ];

        if ($includeFullDetails) {
            $data['description'] = $work->description;
            $data['image_urls'] = $work->image_urls;
        }

        if ($work->relationLoaded('artist')) {
            $data['artist'] = [
                'id' => $work->artist->id,
                'artist_name' => $work->artist->artist_name,
                'slug' => $work->artist->slug,
                'avatar_url' => $work->artist->avatar_url,
                'avatar_thumb_url' => $work->artist->avatar_thumb_url,
            ];
        }

        return $data;
    }
}
