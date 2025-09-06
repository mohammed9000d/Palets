<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Illuminate\Support\Str;
use Carbon\Carbon;

class ArtPanelGallery extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia;

    protected $fillable = [
        'organizer_artist_id',
        'main_title',
        'sub_title',
        'overview',
        'description',
        'start_date',
        'end_date',
        'slug',
        'status',
        'location',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'view_count' => 'integer',
    ];

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($gallery) {
            if (empty($gallery->slug)) {
                $gallery->slug = Str::slug($gallery->main_title);
            }
        });

        static::updating(function ($gallery) {
            if ($gallery->isDirty('main_title') && empty($gallery->slug)) {
                $gallery->slug = Str::slug($gallery->main_title);
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
     * Relationship: Gallery belongs to an organizer artist
     */
    public function organizerArtist()
    {
        return $this->belongsTo(Artist::class, 'organizer_artist_id');
    }

    /**
     * Relationship: Gallery has many participating artists (many-to-many)
     */
    public function artists()
    {
        return $this->belongsToMany(Artist::class, 'art_panel_gallery_artist')
                    ->withPivot('role', 'display_order')
                    ->withTimestamps()
                    ->orderBy('pivot_display_order');
    }

    /**
     * Define media collections
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('cover_image')
            ->singleFile()
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp']);

        $this->addMediaCollection('gallery_images')
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
     * Get cover image preview URL
     */
    public function getCoverImagePreviewUrlAttribute()
    {
        $coverImage = $this->getFirstMedia('cover_image');
        return $coverImage ? $coverImage->getUrl('preview') : null;
    }

    /**
     * Get gallery duration in days
     */
    public function getDurationAttribute()
    {
        return $this->start_date->diffInDays($this->end_date) + 1;
    }

    /**
     * Get formatted date period
     */
    public function getDatePeriodAttribute()
    {
        if ($this->start_date->isSameDay($this->end_date)) {
            return $this->start_date->format('M d, Y');
        }
        
        if ($this->start_date->isSameMonth($this->end_date)) {
            return $this->start_date->format('M d') . ' - ' . $this->end_date->format('d, Y');
        }
        
        return $this->start_date->format('M d, Y') . ' - ' . $this->end_date->format('M d, Y');
    }

    /**
     * Check if gallery is currently active
     */
    public function getIsActiveAttribute()
    {
        $today = Carbon::today();
        return $this->status === 'published' && 
               $today->between($this->start_date, $this->end_date);
    }

    /**
     * Check if gallery is upcoming
     */
    public function getIsUpcomingAttribute()
    {
        return $this->status === 'published' && Carbon::today()->lt($this->start_date);
    }

    /**
     * Check if gallery is past
     */
    public function getIsPastAttribute()
    {
        return Carbon::today()->gt($this->end_date);
    }

    /**
     * Scope: Published galleries only
     */
    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    /**
     * Scope: Active galleries (currently running)
     */
    public function scopeActive($query)
    {
        $today = Carbon::today();
        return $query->where('status', 'published')
                    ->where('start_date', '<=', $today)
                    ->where('end_date', '>=', $today);
    }

    /**
     * Scope: Upcoming galleries
     */
    public function scopeUpcoming($query)
    {
        return $query->where('status', 'published')
                    ->where('start_date', '>', Carbon::today());
    }

    /**
     * Scope: Past galleries
     */
    public function scopePast($query)
    {
        return $query->where('end_date', '<', Carbon::today());
    }

    /**
     * Scope: Search by title, overview, or description
     */
    public function scopeSearch($query, $term)
    {
        return $query->where('main_title', 'LIKE', "%{$term}%")
                    ->orWhere('sub_title', 'LIKE', "%{$term}%")
                    ->orWhere('overview', 'LIKE', "%{$term}%")
                    ->orWhere('description', 'LIKE', "%{$term}%")
                    ->orWhere('location', 'LIKE', "%{$term}%");
    }

    /**
     * Increment view count
     */
    public function incrementViews()
    {
        $this->increment('view_count');
    }


}
