<?php

namespace App\Http\Controllers;

use App\Models\ArtPanelGallery;
use App\Models\Artist;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;

class ArtPanelGalleryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = ArtPanelGallery::with(['media', 'organizerArtist', 'artists']);

        // Search functionality
        if ($request->has('search') && $request->search) {
            $query->search($request->search);
        }

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }



        // Filter by time period
        if ($request->has('period')) {
            switch ($request->period) {
                case 'active':
                    $query->active();
                    break;
                case 'upcoming':
                    $query->upcoming();
                    break;
                case 'past':
                    $query->past();
                    break;
            }
        }

        // Filter by organizer artist
        if ($request->has('organizer_artist_id') && $request->organizer_artist_id) {
            $query->where('organizer_artist_id', $request->organizer_artist_id);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        // Pagination
        $perPage = $request->get('per_page', 15);
        $galleries = $query->paginate($perPage);

        // Transform data to include computed attributes
        $galleries->getCollection()->transform(function ($gallery) {
            return $this->transformGallery($gallery);
        });

        return response()->json($galleries);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Process JSON fields if they're strings
        $requestData = $this->processJsonFields($request->all());

        $validator = Validator::make($requestData, [
            'organizer_artist_id' => 'nullable|exists:artists,id',
            'main_title' => 'required|string|max:255',
            'sub_title' => 'nullable|string|max:255',
            'overview' => 'nullable|string',
            'description' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'slug' => 'nullable|string|unique:art_panel_galleries,slug',
            'status' => 'in:draft,published,archived',
            'location' => 'nullable|string|max:255',
            'cover_image' => 'nullable|image|mimes:jpeg,png,webp|max:5120',
            'gallery_images' => 'nullable|array',
            'gallery_images.*' => 'image|mimes:jpeg,png,webp|max:5120',
            'participating_artists' => 'nullable|array',
            'participating_artists.*.artist_id' => 'required|exists:artists,id',
            'participating_artists.*.role' => 'nullable|string|max:100',
            'participating_artists.*.display_order' => 'nullable|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $validated = $validator->validated();
        
        // Process array fields
        $validated = $this->processArrayFields($validated);

        // Generate slug if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['main_title']);
        }

        // Ensure slug is unique
        $validated['slug'] = $this->ensureUniqueSlug($validated['slug']);

        // Extract participating artists data
        $participatingArtists = $validated['participating_artists'] ?? [];
        unset($validated['participating_artists']);

        $gallery = ArtPanelGallery::create($validated);

        // Handle cover image upload
        if ($request->hasFile('cover_image')) {
            $gallery->addMediaFromRequest('cover_image')
                ->toMediaCollection('cover_image');
        }

        // Handle gallery images upload
        if ($request->hasFile('gallery_images')) {
            foreach ($request->file('gallery_images') as $file) {
                $gallery->addMedia($file)
                    ->toMediaCollection('gallery_images');
            }
        }

        // Attach participating artists
        if (!empty($participatingArtists)) {
            $this->syncParticipatingArtists($gallery, $participatingArtists);
        }

        // Load relationships for response
        $gallery->load(['media', 'organizerArtist', 'artists']);

        return response()->json([
            'message' => 'Gallery created successfully',
            'gallery' => $this->transformGallery($gallery)
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(ArtPanelGallery $artPanelGallery)
    {
        $artPanelGallery->load(['media', 'organizerArtist', 'artists']);
        
        // Increment view count
        $artPanelGallery->incrementViews();

        return response()->json([
            'gallery' => $this->transformGallery($artPanelGallery, true)
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ArtPanelGallery $artPanelGallery)
    {
        // Process JSON fields if they're strings
        $requestData = $this->processJsonFields($request->all());

        $validator = Validator::make($requestData, [
            'organizer_artist_id' => 'nullable|exists:artists,id',
            'main_title' => 'sometimes|required|string|max:255',
            'sub_title' => 'nullable|string|max:255',
            'overview' => 'nullable|string',
            'description' => 'nullable|string',
            'start_date' => 'sometimes|required|date',
            'end_date' => 'sometimes|required|date|after_or_equal:start_date',
            'slug' => ['nullable', 'string', Rule::unique('art_panel_galleries', 'slug')->ignore($artPanelGallery->id)],
            'status' => 'in:draft,published,archived',
            'location' => 'nullable|string|max:255',
            'cover_image' => 'nullable|image|mimes:jpeg,png,webp|max:5120',
            'gallery_images' => 'nullable|array',
            'gallery_images.*' => 'image|mimes:jpeg,png,webp|max:5120',
            'participating_artists' => 'nullable|array',
            'participating_artists.*.artist_id' => 'nullable|exists:artists,id',
            'participating_artists.*.role' => 'nullable|string|max:100',
            'participating_artists.*.display_order' => 'nullable|integer|min:0',
            'remove_cover_image' => 'boolean',
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
        
        // Process array fields
        $validated = $this->processArrayFields($validated);

        // Update slug if main title changed
        if (isset($validated['main_title']) && empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['main_title']);
            $validated['slug'] = $this->ensureUniqueSlug($validated['slug'], $artPanelGallery->id);
        }

        // Extract participating artists data
        $participatingArtists = $validated['participating_artists'] ?? null;
        unset($validated['participating_artists']);

        $artPanelGallery->update($validated);

        // Handle cover image removal
        if ($request->boolean('remove_cover_image')) {
            $artPanelGallery->clearMediaCollection('cover_image');
        }

        // Handle new cover image upload
        if ($request->hasFile('cover_image')) {
            $artPanelGallery->clearMediaCollection('cover_image');
            $artPanelGallery->addMediaFromRequest('cover_image')
                ->toMediaCollection('cover_image');
        }

        // Handle gallery image removal
        if ($request->has('remove_gallery_images')) {
            foreach ($request->remove_gallery_images as $mediaId) {
                $media = $artPanelGallery->getMedia('gallery_images')->where('id', $mediaId)->first();
                if ($media) {
                    $media->delete();
                }
            }
        }

        // Handle new gallery images upload
        if ($request->hasFile('gallery_images')) {
            foreach ($request->file('gallery_images') as $file) {
                $artPanelGallery->addMedia($file)
                    ->toMediaCollection('gallery_images');
            }
        }

        // Update participating artists if provided
        if ($participatingArtists !== null) {
            $this->syncParticipatingArtists($artPanelGallery, $participatingArtists);
        }

        // Reload relationships for response
        $artPanelGallery->load(['media', 'organizerArtist', 'artists']);

        return response()->json([
            'message' => 'Gallery updated successfully',
            'gallery' => $this->transformGallery($artPanelGallery)
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ArtPanelGallery $artPanelGallery)
    {
        // This will also delete all associated media and pivot records due to cascade
        $artPanelGallery->delete();

        return response()->json([
            'message' => 'Gallery deleted successfully'
        ]);
    }



    /**
     * Get all artists for dropdowns
     */
    public function getArtists()
    {
        $artists = Artist::select('id', 'artist_name', 'slug')
            ->where('is_active', true)
            ->orderBy('artist_name')
            ->get();

        return response()->json(['artists' => $artists]);
    }

    /**
     * Transform gallery data for API response
     */
    private function transformGallery(ArtPanelGallery $gallery, $includeDetails = false)
    {
        $data = [
            'id' => $gallery->id,
            'organizer_artist_id' => $gallery->organizer_artist_id,
            'organizer_artist' => $gallery->organizerArtist ? [
                'id' => $gallery->organizerArtist->id,
                'artist_name' => $gallery->organizerArtist->artist_name,
                'slug' => $gallery->organizerArtist->slug,
                'avatar_url' => $gallery->organizerArtist->avatar_url,
                'avatar_thumb_url' => $gallery->organizerArtist->avatar_thumb_url,
            ] : null,
            'main_title' => $gallery->main_title,
            'sub_title' => $gallery->sub_title,
            'overview' => $gallery->overview,
            'description' => $gallery->description,
            'start_date' => $gallery->start_date->format('Y-m-d'),
            'end_date' => $gallery->end_date->format('Y-m-d'),
            'date_period' => $gallery->date_period,
            'duration' => $gallery->duration,
            'slug' => $gallery->slug,
            'status' => $gallery->status,
            'is_active' => $gallery->is_active,
            'is_upcoming' => $gallery->is_upcoming,
            'is_past' => $gallery->is_past,
            'location' => $gallery->location,
            'view_count' => $gallery->view_count,
            'cover_image_url' => $gallery->cover_image_url,
            'cover_image_thumb_url' => $gallery->cover_image_thumb_url,
            'cover_image_preview_url' => $gallery->cover_image_preview_url,
            'gallery_images' => $gallery->getMedia('gallery_images')->map(function ($media) {
                return [
                    'id' => $media->id,
                    'url' => $media->getUrl(),
                    'thumb' => $media->getUrl('thumb'),
                    'preview' => $media->getUrl('preview'),
                    'large' => $media->getUrl('large'),
                    'name' => $media->name,
                ];
            }),
            'participating_artists' => $gallery->artists->map(function ($artist) {
                return [
                    'artist_id' => $artist->id,
                    'artist_name' => $artist->artist_name,
                    'slug' => $artist->slug,
                    'role' => $artist->pivot->role,
                    'display_order' => $artist->pivot->display_order,
                    'avatar_url' => $artist->avatar_url,
                    'avatar_thumb_url' => $artist->avatar_thumb_url,
                ];
            }),
            'participating_artists_count' => $gallery->artists->count(),
            'created_at' => $gallery->created_at,
            'updated_at' => $gallery->updated_at,
        ];



        return $data;
    }

    /**
     * Process JSON fields that might come as strings
     */
    private function processJsonFields(array $data): array
    {
        $jsonFields = ['participating_artists'];
        
        foreach ($jsonFields as $field) {
            if (isset($data[$field]) && is_string($data[$field])) {
                $data[$field] = json_decode($data[$field], true) ?: null;
            }
        }

        return $data;
    }

    /**
     * Process array fields to ensure proper formatting
     */
    private function processArrayFields(array $data): array
    {
        // No array fields to process in simplified schema
        return $data;
    }

    /**
     * Sync participating artists with the gallery
     */
    private function syncParticipatingArtists(ArtPanelGallery $gallery, array $participatingArtists)
    {
        $syncData = [];
        
        foreach ($participatingArtists as $artistData) {
            // Skip if artist_id is not provided or is null
            if (empty($artistData['artist_id'])) {
                continue;
            }
            
            $syncData[$artistData['artist_id']] = [
                'role' => $artistData['role'] ?? null,
                'display_order' => $artistData['display_order'] ?? 0,
            ];
        }
        
        $gallery->artists()->sync($syncData);
    }

    /**
     * Ensure slug is unique
     */
    private function ensureUniqueSlug(string $slug, int $excludeId = null): string
    {
        $originalSlug = $slug;
        $counter = 1;
        
        $query = ArtPanelGallery::where('slug', $slug);
        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }
        
        while ($query->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
            
            $query = ArtPanelGallery::where('slug', $slug);
            if ($excludeId) {
                $query->where('id', '!=', $excludeId);
            }
        }

        return $slug;
    }
}