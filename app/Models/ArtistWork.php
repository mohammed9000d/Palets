<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Illuminate\Support\Str;

class ArtistWork extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia;

    protected $fillable = [
        'artist_id',
        'title',
        'overview',
        'description',
        'slug',
        'status',
        'year_created',
        'medium',
        'dimensions',
        'price',
        'is_for_sale',
        'is_featured',
        'tags',
        'view_count',
        'like_count',
    ];

    protected $casts = [
        'is_for_sale' => 'boolean',
        'is_featured' => 'boolean',
        'tags' => 'array',
        'price' => 'decimal:2',
        'view_count' => 'integer',
        'like_count' => 'integer',
        'year_created' => 'integer',
    ];

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($work) {
            if (empty($work->slug)) {
                $work->slug = Str::slug($work->title);
            }
        });

        static::updating(function ($work) {
            if ($work->isDirty('title') && empty($work->slug)) {
                $work->slug = Str::slug($work->title);
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
     * Relationship: Work belongs to an artist
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
        $this->addMediaCollection('cover_image')
            ->singleFile()
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp']);

        $this->addMediaCollection('images')
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
            ->height(900)
            ->sharpen(10)
            ->nonQueued();
    }

    /**
     * Get cover image URL
     */
    public function getCoverImageUrlAttribute()
    {
        $coverImage = $this->getFirstMedia('cover_image');
        return $coverImage ? $coverImage->getUrl() : null;
    }

    /**
     * Get cover image thumbnail URL
     */
    public function getCoverImageThumbUrlAttribute()
    {
        $coverImage = $this->getFirstMedia('cover_image');
        return $coverImage ? $coverImage->getUrl('thumb') : null;
    }

    /**
     * Get all image URLs
     */
    public function getImageUrlsAttribute()
    {
        return $this->getMedia('images')->map(function ($media) {
            return [
                'id' => $media->id,
                'url' => $media->getUrl(),
                'thumb' => $media->getUrl('thumb'),
                'preview' => $media->getUrl('preview'),
                'large' => $media->getUrl('large'),
                'name' => $media->name,
                'size' => $media->size,
            ];
        });
    }

    /**
     * Scope: Published works only
     */
    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    /**
     * Scope: Featured works only
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope: For sale works only
     */
    public function scopeForSale($query)
    {
        return $query->where('is_for_sale', true);
    }

    /**
     * Scope: Search by title or description
     */
    public function scopeSearch($query, $term)
    {
        return $query->where('title', 'LIKE', "%{$term}%")
                    ->orWhere('description', 'LIKE', "%{$term}%")
                    ->orWhere('overview', 'LIKE', "%{$term}%")
                    ->orWhere('medium', 'LIKE', "%{$term}%");
    }

    /**
     * Scope: Filter by tags
     */
    public function scopeWithTags($query, $tags)
    {
        if (is_string($tags)) {
            $tags = [$tags];
        }

        return $query->where(function ($query) use ($tags) {
            foreach ($tags as $tag) {
                $query->orWhereJsonContains('tags', $tag);
            }
        });
    }

    /**
     * Increment view count
     */
    public function incrementViewCount()
    {
        $this->increment('view_count');
    }

    /**
     * Increment like count
     */
    public function incrementLikeCount()
    {
        $this->increment('like_count');
    }
}
