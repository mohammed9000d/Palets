<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class User extends Authenticatable implements HasMedia
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, InteractsWithMedia;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'country_code',
        'first_name',
        'last_name',
        'date_of_birth',
        'gender',
        'avatar',
        'street_address',
        'city',
        'state',
        'postal_code',
        'country',
        'billing_street_address',
        'billing_city',
        'billing_state',
        'billing_postal_code',
        'billing_country',
        'favorite_categories',
        'preferred_artists',
        'newsletter_subscription',
        'sms_notifications',
        'is_active',
        'last_login_at',
        'preferred_language',
        'timezone',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'date_of_birth' => 'date',
            'favorite_categories' => 'array',
            'preferred_artists' => 'array',
            'newsletter_subscription' => 'boolean',
            'sms_notifications' => 'boolean',
            'is_active' => 'boolean',
            'last_login_at' => 'datetime',
        ];
    }

    // Media Library Configuration
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('profile_photos')
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'])
            ->singleFile() // Only one profile photo at a time
            ->useDisk('public'); // Store in public disk for easy access
    }

    public function registerMediaConversions(Media $media = null): void
    {
        $this->addMediaConversion('thumb')
            ->width(150)
            ->height(150)
            ->sharpen(10)
            ->quality(90)
            ->performOnCollections('profile_photos')
            ->nonQueued(); // Generate immediately

        $this->addMediaConversion('medium')
            ->width(300)
            ->height(300)
            ->sharpen(10)
            ->quality(90)
            ->performOnCollections('profile_photos')
            ->nonQueued(); // Generate immediately
    }

    // Helper methods for profile photo
    public function getProfilePhotoUrl($conversion = null)
    {
        $media = $this->getFirstMedia('profile_photos');
        
        if (!$media) {
            return null;
        }

        return $conversion ? $media->getUrl($conversion) : $media->getUrl();
    }

    public function getProfilePhotoThumbUrl()
    {
        return $this->getProfilePhotoUrl('thumb');
    }

    public function getProfilePhotoMediumUrl()
    {
        return $this->getProfilePhotoUrl('medium');
    }

    // Relationships
    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}
