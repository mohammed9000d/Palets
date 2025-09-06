<?php

namespace App\Http\Controllers;

use App\Models\Artist;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;

class ArtistController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Artist::with(['media']);

        // Search functionality
        if ($request->has('search') && $request->search) {
            $query->search($request->search);
        }

        // Filter by active status - default to active for public routes
        if ($request->has('active')) {
            $query->where('is_active', $request->boolean('active'));
        } elseif ($request->is('api/public/*')) {
            // Public routes should only show active artists by default
            $query->where('is_active', true);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        // Pagination - default to 8 for public routes, 15 for admin
        $defaultPerPage = $request->is('api/public/*') ? 8 : 15;
        $perPage = $request->get('per_page', $defaultPerPage);
        $artists = $query->paginate($perPage);

        // Transform data to include media URLs
        $artists->getCollection()->transform(function ($artist) {
            return [
                'id' => $artist->id,
                'artist_name' => $artist->artist_name,
                'bio' => $artist->bio,
                'link' => $artist->link,
                'slug' => $artist->slug,
                'is_active' => $artist->is_active,
                'social_links' => $artist->social_links,
                'contact_email' => $artist->contact_email,
                'phone' => $artist->phone,
                'specialties' => $artist->specialties,
                'commission_rate' => $artist->commission_rate,
                'avatar_url' => $artist->avatar_url,
                'avatar_thumb_url' => $artist->avatar_thumb_url,
                'works_count' => $artist->works()->count(),
                'published_works_count' => $artist->publishedWorks()->count(),
                'created_at' => $artist->created_at,
                'updated_at' => $artist->updated_at,
            ];
        });

        return response()->json($artists);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Process social_links if it's a JSON string
        $requestData = $request->all();
        if (isset($requestData['social_links']) && is_string($requestData['social_links'])) {
            $requestData['social_links'] = json_decode($requestData['social_links'], true) ?: [];
        }

        $validator = Validator::make($requestData, [
            'artist_name' => 'required|string|max:255',
            'bio' => 'nullable|string',
            'link' => 'nullable|url',
            'slug' => 'nullable|string|unique:artists,slug',
            'is_active' => 'boolean',
            'social_links' => 'nullable|array',
            'contact_email' => 'nullable|email',
            'phone' => 'nullable|string|max:20',
            'specialties' => 'nullable|string',
            'commission_rate' => 'nullable|numeric|between:0,99.99',
            'avatar' => 'nullable|image|mimes:jpeg,png,webp|max:5120', // 5MB max
            'gallery_images' => 'nullable|array',
            'gallery_images.*' => 'image|mimes:jpeg,png,webp|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $validated = $validator->validated();
        
        // Ensure social_links is properly formatted
        if (isset($validated['social_links'])) {
            $validated['social_links'] = $validated['social_links'] ?: [];
        }

        // Generate slug if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['artist_name']);
        }

        // Ensure slug is unique
        $originalSlug = $validated['slug'];
        $counter = 1;
        while (Artist::where('slug', $validated['slug'])->exists()) {
            $validated['slug'] = $originalSlug . '-' . $counter;
            $counter++;
        }

        $artist = Artist::create($validated);

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            $artist->addMediaFromRequest('avatar')
                ->toMediaCollection('avatar');
        }

        // Handle gallery images upload
        if ($request->hasFile('gallery_images')) {
            foreach ($request->file('gallery_images') as $file) {
                $artist->addMedia($file)
                    ->toMediaCollection('gallery');
            }
        }

        // Load media for response
        $artist->load('media');

        return response()->json([
            'message' => 'Artist created successfully',
            'artist' => $this->transformArtist($artist)
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Artist $artist)
    {
        $artist->load(['media', 'works' => function ($query) {
            $query->published()->with('media');
        }]);

        return response()->json([
            'artist' => $this->transformArtist($artist, true)
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Artist $artist)
    {
        // Process social_links if it's a JSON string
        $requestData = $request->all();
        if (isset($requestData['social_links']) && is_string($requestData['social_links'])) {
            $requestData['social_links'] = json_decode($requestData['social_links'], true) ?: [];
        }

        $validator = Validator::make($requestData, [
            'artist_name' => 'sometimes|required|string|max:255',
            'bio' => 'nullable|string',
            'link' => 'nullable|url',
            'slug' => ['nullable', 'string', Rule::unique('artists', 'slug')->ignore($artist->id)],
            'is_active' => 'boolean',
            'social_links' => 'nullable|array',
            'contact_email' => 'nullable|email',
            'phone' => 'nullable|string|max:20',
            'specialties' => 'nullable|string',
            'commission_rate' => 'nullable|numeric|between:0,99.99',
            'avatar' => 'nullable|image|mimes:jpeg,png,webp|max:5120',
            'gallery_images' => 'nullable|array',
            'gallery_images.*' => 'image|mimes:jpeg,png,webp|max:5120',
            'remove_avatar' => 'boolean',
            'remove_gallery_images' => 'nullable|array',
            'remove_gallery_images.*' => 'integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $validated = $validator->validated();
        
        // Ensure social_links is properly formatted
        if (isset($validated['social_links'])) {
            $validated['social_links'] = $validated['social_links'] ?: [];
        }

        // Update slug if artist name changed
        if (isset($validated['artist_name']) && empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['artist_name']);
            
            // Ensure slug is unique
            $originalSlug = $validated['slug'];
            $counter = 1;
            while (Artist::where('slug', $validated['slug'])->where('id', '!=', $artist->id)->exists()) {
                $validated['slug'] = $originalSlug . '-' . $counter;
                $counter++;
            }
        }

        $artist->update($validated);

        // Handle avatar removal
        if ($request->boolean('remove_avatar')) {
            $artist->clearMediaCollection('avatar');
        }

        // Handle new avatar upload
        if ($request->hasFile('avatar')) {
            $artist->clearMediaCollection('avatar');
            $artist->addMediaFromRequest('avatar')
                ->toMediaCollection('avatar');
        }

        // Handle gallery image removal
        if ($request->has('remove_gallery_images')) {
            foreach ($request->remove_gallery_images as $mediaId) {
                $media = $artist->getMedia('gallery')->where('id', $mediaId)->first();
                if ($media) {
                    $media->delete();
                }
            }
        }

        // Handle new gallery images upload
        if ($request->hasFile('gallery_images')) {
            foreach ($request->file('gallery_images') as $file) {
                $artist->addMedia($file)
                    ->toMediaCollection('gallery');
            }
        }

        // Reload media for response
        $artist->load('media');

        return response()->json([
            'message' => 'Artist updated successfully',
            'artist' => $this->transformArtist($artist)
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Artist $artist)
    {
        // This will also delete all associated media due to cascade
        $artist->delete();

        return response()->json([
            'message' => 'Artist deleted successfully'
        ]);
    }

    /**
     * Get artist's works
     */
    public function works(Artist $artist, Request $request)
    {
        $query = $artist->works()->with('media');

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

        // Search
        if ($request->has('search')) {
            $query->search($request->search);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        $perPage = $request->get('per_page', 12);
        $works = $query->paginate($perPage);

        return response()->json($works);
    }

    /**
     * Transform artist data for API response
     */
    private function transformArtist(Artist $artist, $includeWorks = false)
    {
        $data = [
            'id' => $artist->id,
            'artist_name' => $artist->artist_name,
            'bio' => $artist->bio,
            'link' => $artist->link,
            'slug' => $artist->slug,
            'is_active' => $artist->is_active,
            'social_links' => $artist->social_links,
            'contact_email' => $artist->contact_email,
            'phone' => $artist->phone,
            'specialties' => $artist->specialties,
            'commission_rate' => $artist->commission_rate,
            'avatar_url' => $artist->avatar_url,
            'avatar_thumb_url' => $artist->avatar_thumb_url,
            'gallery_images' => $artist->getMedia('gallery')->map(function ($media) {
                return [
                    'id' => $media->id,
                    'url' => $media->getUrl(),
                    'thumb' => $media->getUrl('thumb'),
                    'preview' => $media->getUrl('preview'),
                    'name' => $media->name,
                ];
            }),
            'works_count' => $artist->works()->count(),
            'published_works_count' => $artist->publishedWorks()->count(),
            'created_at' => $artist->created_at,
            'updated_at' => $artist->updated_at,
        ];

        if ($includeWorks && $artist->relationLoaded('works')) {
            $data['works'] = $artist->works->map(function ($work) {
                return [
                    'id' => $work->id,
                    'title' => $work->title,
                    'slug' => $work->slug,
                    'overview' => $work->overview,
                    'status' => $work->status,
                    'is_featured' => $work->is_featured,
                    'is_for_sale' => $work->is_for_sale,
                    'price' => $work->price,
                    'cover_image_url' => $work->cover_image_url,
                    'cover_image_thumb_url' => $work->cover_image_thumb_url,
                    'created_at' => $work->created_at,
                ];
            });
        }

        return $data;
    }
}
