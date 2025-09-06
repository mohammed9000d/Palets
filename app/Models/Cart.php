<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Cart extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'session_id',
        'status',
        'last_activity',
    ];

    protected $casts = [
        'last_activity' => 'datetime',
    ];

    /**
     * Get the user that owns the cart
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the cart items
     */
    public function items()
    {
        return $this->hasMany(CartItem::class);
    }

    /**
     * Get cart items count
     */
    public function getItemsCountAttribute()
    {
        return $this->items->sum('quantity');
    }

    /**
     * Get cart subtotal
     */
    public function getSubtotalAttribute()
    {
        return $this->items->sum(function ($item) {
            return $item->price * $item->quantity;
        });
    }

    /**
     * Get cart tax (8%)
     */
    public function getTaxAttribute()
    {
        return $this->subtotal * 0.08;
    }

    /**
     * Get shipping cost (free over $50)
     */
    public function getShippingAttribute()
    {
        return $this->subtotal > 50 ? 0 : 9.99;
    }

    /**
     * Get cart total
     */
    public function getTotalAttribute()
    {
        return $this->subtotal + $this->tax + $this->shipping;
    }

    /**
     * Update cart activity timestamp
     */
    public function updateActivity()
    {
        $this->update(['last_activity' => now()]);
    }

    /**
     * Find or create cart for user or session
     */
    public static function findOrCreateCart($userId = null, $sessionId = null)
    {
        if ($userId) {
            // For authenticated users, find or create by user_id
            return static::firstOrCreate(
                ['user_id' => $userId, 'status' => 'active'],
                ['last_activity' => now()]
            );
        } elseif ($sessionId) {
            // For guests, find or create by session_id
            return static::firstOrCreate(
                ['session_id' => $sessionId, 'status' => 'active'],
                ['last_activity' => now()]
            );
        }

        return null;
    }
}
