<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Illuminate\Support\Str;

class Product extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia;

    protected $fillable = [
        'artist_id',
        'main_title',
        'sub_title',
        'description',
        'price',
        'product_details',
        'in_stock',
        'is_custom_dimension',
        'slug',
        'status',
        'dimensions',
        'discount_price',
    ];

    protected $casts = [
        'in_stock' => 'boolean',
        'is_custom_dimension' => 'boolean',
        'price' => 'decimal:2',
        'discount_price' => 'decimal:2',
        'dimensions' => 'array',
        'view_count' => 'integer',
        'like_count' => 'integer',
    ];

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($product) {
            if (empty($product->slug)) {
                $product->slug = Str::slug($product->main_title);
            }
        });

        static::updating(function ($product) {
            if ($product->isDirty('main_title') && empty($product->slug)) {
                $product->slug = Str::slug($product->main_title);
            }
        });
    }

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName()
    {
        return 'slug';
    }

    /**
     * Relationship: Product belongs to an artist
     */
    public function artist()
    {
        return $this->belongsTo(Artist::class);
    }

    /**
     * Define media collections
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('cover_photo')
            ->singleFile()
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp']);

        $this->addMediaCollection('product_images')
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp']);
    }

    /**
     * Define media conversions
     */
    public function registerMediaConversions(Media $media = null): void
    {
        $this->addMediaConversion('thumb')
            ->width(300)
            ->height(300)
            ->sharpen(10)
            ->nonQueued();

        $this->addMediaConversion('preview')
            ->width(800)
            ->height(600)
            ->sharpen(10)
            ->nonQueued();

        $this->addMediaConversion('large')
            ->width(1200)
            ->height(1200)
            ->sharpen(10)
            ->nonQueued();
    }

    /**
     * Get cover photo URL
     */
    public function getCoverPhotoUrlAttribute()
    {
        $coverPhoto = $this->getFirstMedia('cover_photo');
        return $coverPhoto ? $coverPhoto->getUrl() : null;
    }

    /**
     * Get cover photo thumbnail URL
     */
    public function getCoverPhotoThumbUrlAttribute()
    {
        $coverPhoto = $this->getFirstMedia('cover_photo');
        return $coverPhoto ? $coverPhoto->getUrl('thumb') : null;
    }

    /**
     * Get cover photo preview URL
     */
    public function getCoverPhotoPreviewUrlAttribute()
    {
        $coverPhoto = $this->getFirstMedia('cover_photo');
        return $coverPhoto ? $coverPhoto->getUrl('preview') : null;
    }

    /**
     * Get final price (considering discount)
     */
    public function getFinalPriceAttribute()
    {
        return $this->discount_price ?? $this->price;
    }

    /**
     * Check if product is on sale
     */
    public function getIsOnSaleAttribute()
    {
        return !is_null($this->discount_price) && $this->discount_price < $this->price;
    }

    /**
     * Get discount percentage
     */
    public function getDiscountPercentageAttribute()
    {
        if (!$this->is_on_sale) {
            return 0;
        }
        
        return round((($this->price - $this->discount_price) / $this->price) * 100);
    }

    /**
     * Check if product is available
     */
    public function getIsAvailableAttribute()
    {
        return $this->in_stock && $this->status === 'published';
    }

    /**
     * Scope: Published products only
     */
    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    /**
     * Scope: In stock products only
     */
    public function scopeInStock($query)
    {
        return $query->where('in_stock', true);
    }

    /**
     * Scope: On sale products only
     */
    public function scopeOnSale($query)
    {
        return $query->whereNotNull('discount_price')
                    ->whereRaw('discount_price < price');
    }

    /**
     * Scope: Search by title, description
     */
    public function scopeSearch($query, $term)
    {
        return $query->where('main_title', 'LIKE', "%{$term}%")
                    ->orWhere('sub_title', 'LIKE', "%{$term}%")
                    ->orWhere('description', 'LIKE', "%{$term}%")
                    ->orWhere('product_details', 'LIKE', "%{$term}%")
                    ->orWhereHas('artist', function ($artistQuery) use ($term) {
                        $artistQuery->where('artist_name', 'LIKE', "%{$term}%")
                                   ->orWhere('bio', 'LIKE', "%{$term}%")
                                   ->orWhere('specialties', 'LIKE', "%{$term}%");
                    });
    }

    /**
     * Scope: Price range filter
     */
    public function scopePriceRange($query, $minPrice, $maxPrice)
    {
        return $query->whereBetween('price', [$minPrice, $maxPrice]);
    }

    /**
     * Increment view count
     */
    public function incrementViews()
    {
        $this->increment('view_count');
    }

    /**
     * Increment like count
     */
    public function incrementLikes()
    {
        $this->increment('like_count');
    }

    /**
     * Decrement like count
     */
    public function decrementLikes()
    {
        $this->decrement('like_count');
    }
}
