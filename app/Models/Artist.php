<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Illuminate\Support\Str;

class Artist extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia;

    protected $fillable = [
        'artist_name',
        'bio',
        'link',
        'is_active',
        'slug',
        'social_links',
        'contact_email',
        'phone',
        'specialties',
        'commission_rate',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'social_links' => 'array',
        'commission_rate' => 'decimal:2',
    ];

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($artist) {
            if (empty($artist->slug)) {
                $artist->slug = Str::slug($artist->artist_name);
            }
        });

        static::updating(function ($artist) {
            if ($artist->isDirty('artist_name') && empty($artist->slug)) {
                $artist->slug = Str::slug($artist->artist_name);
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
     * Relationship: Artist has many works
     */
    public function works()
    {
        return $this->hasMany(ArtistWork::class);
    }

    /**
     * Relationship: Published works only
     */
    public function publishedWorks()
    {
        return $this->hasMany(ArtistWork::class)->where('status', 'published');
    }

    /**
     * Relationship: Featured works only
     */
    public function featuredWorks()
    {
        return $this->hasMany(ArtistWork::class)->where('is_featured', true);
    }

    /**
     * Relationship: Artist has many products
     */
    public function products()
    {
        return $this->hasMany(Product::class);
    }

    /**
     * Relationship: Published products only
     */
    public function publishedProducts()
    {
        return $this->hasMany(Product::class)->where('status', 'published');
    }

    /**
     * Relationship: Artist organizes galleries
     */
    public function organizedGalleries()
    {
        return $this->hasMany(ArtPanelGallery::class, 'organizer_artist_id');
    }

    /**
     * Relationship: Artist participates in galleries (many-to-many)
     */
    public function participatingGalleries()
    {
        return $this->belongsToMany(ArtPanelGallery::class, 'art_panel_gallery_artist')
                    ->withPivot('role', 'display_order')
                    ->withTimestamps()
                    ->orderBy('pivot_display_order');
    }

    /**
     * Define media collections
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('avatar')
            ->singleFile()
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp']);

        $this->addMediaCollection('gallery')
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
    }

    /**
     * Get avatar URL
     */
    public function getAvatarUrlAttribute()
    {
        $avatar = $this->getFirstMedia('avatar');
        return $avatar ? $avatar->getUrl() : null;
    }

    /**
     * Get avatar thumbnail URL
     */
    public function getAvatarThumbUrlAttribute()
    {
        $avatar = $this->getFirstMedia('avatar');
        return $avatar ? $avatar->getUrl('thumb') : null;
    }

    /**
     * Scope: Active artists only
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope: Search by name
     */
    public function scopeSearch($query, $term)
    {
        return $query->where('artist_name', 'LIKE', "%{$term}%")
                    ->orWhere('bio', 'LIKE', "%{$term}%")
                    ->orWhere('specialties', 'LIKE', "%{$term}%");
    }
}
