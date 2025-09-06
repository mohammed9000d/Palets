<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

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
}
