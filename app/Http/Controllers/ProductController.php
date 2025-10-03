<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Product::with(['media', 'artist']);
        
        // For public API, only show published products
        if ($request->is('api/public/*')) {
            $query->where('status', 'published');
        }
        // Search functionality
        if ($request->has('search') && $request->search) {
            $query->search($request->search);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by in stock
        if ($request->has('in_stock')) {
            $query->where('in_stock', $request->boolean('in_stock'));
        }

        // Filter by artist
        if ($request->has('artist_id') && $request->artist_id) {
            $query->where('artist_id', $request->artist_id);
        }
        // Filter by price range
        if ($request->has('min_price') || $request->has('max_price')) {
            $minPrice = $request->get('min_price', 0);
            $maxPrice = $request->get('max_price', 999999);
            $query->priceRange($minPrice, $maxPrice);
        }

        // Filter by on sale
        if ($request->has('on_sale') && $request->boolean('on_sale')) {
            $query->onSale();
        }

        // Filter by custom dimension
        if ($request->has('custom_dimension')) {
            $query->where('is_custom_dimension', $request->boolean('custom_dimension'));
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        // Pagination
        $perPage = $request->get('per_page', 15);
        
        $products = $query->paginate($perPage);

        // Transform data to include media URLs and computed attributes
        $products->getCollection()->transform(function ($product) {
            return $this->transformProduct($product);
        });

        return response()->json($products);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Process JSON fields if they're strings
        $requestData = $this->processJsonFields($request->all());

        $validator = Validator::make($requestData, [
            'artist_id' => 'nullable|exists:artists,id',
            'main_title' => 'required|string|max:255',
            'sub_title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'product_details' => 'nullable|string',
            'in_stock' => 'boolean',
            'is_custom_dimension' => 'boolean',
            'slug' => 'nullable|string|unique:products,slug',
            'status' => 'in:draft,published,archived',
            'dimensions' => 'nullable|array',
            'discount_price' => 'nullable|numeric|min:0|lt:price',
            'cover_photo' => 'nullable|image|mimes:jpeg,png,webp|max:5120', // 5MB max
            'product_images' => 'nullable|array',
            'product_images.*' => 'image|mimes:jpeg,png,webp|max:5120',
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

        $product = Product::create($validated);

        // Handle cover photo upload
        if ($request->hasFile('cover_photo')) {
            $product->addMediaFromRequest('cover_photo')
                ->toMediaCollection('cover_photo');
        }

        // Handle product images upload
        if ($request->hasFile('product_images')) {
            foreach ($request->file('product_images') as $file) {
                $product->addMedia($file)
                    ->toMediaCollection('product_images');
            }
        }

        // Load media for response
        $product->load('media');

        return response()->json([
            'message' => 'Product created successfully',
            'product' => $this->transformProduct($product)
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product, Request $request)
    {
        // For public API, only allow published products
        if ($request->is('api/public/*') && $product->status !== 'published') {
            return response()->json([
                'message' => 'Product not found'
            ], 404);
        }
        
        $product->load(['media', 'artist', 'reviews']);
        
        // Increment view count
        $product->incrementViews();

        return response()->json([
            'product' => $this->transformProduct($product, true)
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Product $product)
    {
        // Process JSON fields if they're strings
        $requestData = $this->processJsonFields($request->all());

        $validator = Validator::make($requestData, [
            'artist_id' => 'nullable|exists:artists,id',
            'main_title' => 'sometimes|required|string|max:255',
            'sub_title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|required|numeric|min:0',
            'product_details' => 'nullable|string',
            'in_stock' => 'boolean',
            'is_custom_dimension' => 'boolean',
            'slug' => ['nullable', 'string', Rule::unique('products', 'slug')->ignore($product->id)],
            'status' => 'in:draft,published,archived',
            'dimensions' => 'nullable|array',
            'discount_price' => 'nullable|numeric|min:0',
            'cover_photo' => 'nullable|image|mimes:jpeg,png,webp|max:5120',
            'product_images' => 'nullable|array',
            'product_images.*' => 'image|mimes:jpeg,png,webp|max:5120',
            'remove_cover_photo' => 'boolean',
            'remove_product_images' => 'nullable|array',
            'remove_product_images.*' => 'integer',
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
            $validated['slug'] = $this->ensureUniqueSlug($validated['slug'], $product->id);
        }

        // Validate discount price against current price
        if (isset($validated['discount_price']) && $validated['discount_price'] >= ($validated['price'] ?? $product->price)) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => ['discount_price' => ['Discount price must be less than the regular price.']]
            ], 422);
        }

        $product->update($validated);

        // Handle cover photo removal
        if ($request->boolean('remove_cover_photo')) {
            $product->clearMediaCollection('cover_photo');
        }

        // Handle new cover photo upload
        if ($request->hasFile('cover_photo')) {
            $product->clearMediaCollection('cover_photo');
            $product->addMediaFromRequest('cover_photo')
                ->toMediaCollection('cover_photo');
        }

        // Handle product image removal
        if ($request->has('remove_product_images')) {
            foreach ($request->remove_product_images as $mediaId) {
                $media = $product->getMedia('product_images')->where('id', $mediaId)->first();
                if ($media) {
                    $media->delete();
                }
            }
        }

        // Handle new product images upload
        if ($request->hasFile('product_images')) {
            foreach ($request->file('product_images') as $file) {
                $product->addMedia($file)
                    ->toMediaCollection('product_images');
            }
        }

        // Reload media for response
        $product->load('media');

        return response()->json([
            'message' => 'Product updated successfully',
            'product' => $this->transformProduct($product)
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        // This will also delete all associated media due to cascade
        $product->delete();

        return response()->json([
            'message' => 'Product deleted successfully'
        ]);
    }

    /**
     * Toggle product stock status
     */
    public function toggleStock(Product $product)
    {
        $product->update(['in_stock' => !$product->in_stock]);

        return response()->json([
            'message' => 'Product stock status updated successfully',
            'in_stock' => $product->in_stock
        ]);
    }

    /**
     * Like/Unlike product
     */
    public function toggleLike(Product $product)
    {
        // This is a simple implementation - in a real app you'd track user likes
        $product->incrementLikes();

        return response()->json([
            'message' => 'Product liked successfully',
            'like_count' => $product->like_count
        ]);
    }

    /**
     * Get all artists for dropdown
     */
    public function getArtists()
    {
        $artists = \App\Models\Artist::select('id', 'artist_name', 'slug')
            ->where('is_active', true)
            ->orderBy('artist_name')
            ->get();

        return response()->json(['artists' => $artists]);
    }

    /**
     * Transform product data for API response
     */
    private function transformProduct(Product $product, $includeDetails = false)
    {
        $data = [
            'id' => $product->id,
            'artist_id' => $product->artist_id,
            'artist' => $product->artist ? [
                'id' => $product->artist->id,
                'artist_name' => $product->artist->artist_name,
                'slug' => $product->artist->slug,
                'avatar_url' => $product->artist->avatar_url,
                'avatar_thumb_url' => $product->artist->avatar_thumb_url,
                'bio' => $product->artist->bio,
                'specialties' => $product->artist->specialties,
            ] : null,
            'main_title' => $product->main_title,
            'sub_title' => $product->sub_title,
            'description' => $product->description,
            'price' => $product->price,
            'discount_price' => $product->discount_price,
            'final_price' => $product->final_price,
            'is_on_sale' => $product->is_on_sale,
            'discount_percentage' => $product->discount_percentage,
            'product_details' => $product->product_details,
            'in_stock' => $product->in_stock,
            'is_custom_dimension' => $product->is_custom_dimension,
            'slug' => $product->slug,
            'status' => $product->status,
            'is_available' => $product->is_available,
            'dimensions' => $product->dimensions,
            'view_count' => $product->view_count,
            'like_count' => $product->like_count,
            'cover_photo_url' => $product->cover_photo_url,
            'cover_photo_thumb_url' => $product->cover_photo_thumb_url,
            'cover_photo_preview_url' => $product->cover_photo_preview_url,
            'product_images' => $product->getMedia('product_images')->map(function ($media) {
                return [
                    'id' => $media->id,
                    'url' => $media->getUrl(),
                    'thumb' => $media->getUrl('thumb'),
                    'preview' => $media->getUrl('preview'),
                    'large' => $media->getUrl('large'),
                    'name' => $media->name,
                ];
            }),
            'created_at' => $product->created_at,
            'updated_at' => $product->updated_at,
        ];

        // Add review statistics if including details
        if ($includeDetails) {
            $data['average_rating'] = $product->average_rating;
            $data['reviews_count'] = $product->reviews_count;
            $data['rating_stats'] = $product->rating_stats;
        }

        return $data;
    }

    /**
     * Process JSON fields that might come as strings
     */
    private function processJsonFields(array $data): array
    {
        $jsonFields = ['dimensions'];
        
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
        $arrayFields = ['dimensions'];
        
        foreach ($arrayFields as $field) {
            if (isset($data[$field])) {
                $data[$field] = $data[$field] ?: null;
            }
        }

        return $data;
    }

    /**
     * Ensure slug is unique
     */
    private function ensureUniqueSlug(string $slug, int $excludeId = null): string
    {
        $originalSlug = $slug;
        $counter = 1;
        
        $query = Product::where('slug', $slug);
        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }
        
        while ($query->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
            
            $query = Product::where('slug', $slug);
            if ($excludeId) {
                $query->where('id', '!=', $excludeId);
            }
        }

        return $slug;
    }
}
