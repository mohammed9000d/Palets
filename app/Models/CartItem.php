<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CartItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'cart_id',
        'product_id',
        'product_type',
        'quantity',
        'price',
        'options',
    ];

    protected $casts = [
        'options' => 'array',
        'quantity' => 'integer',
        'price' => 'decimal:2',
    ];

    /**
     * Get the cart that owns the item
     */
    public function cart()
    {
        return $this->belongsTo(Cart::class);
    }

    /**
     * Get the product (polymorphic relationship)
     */
    public function product()
    {
        if ($this->product_type === 'artwork') {
            return $this->belongsTo(ArtistWork::class, 'product_id');
        } else {
            return $this->belongsTo(Product::class, 'product_id');
        }
    }

    /**
     * Get product details with fallback
     */
    public function getProductDetailsAttribute()
    {
        $product = $this->product;
        
        if (!$product) {
            return [
                'title' => 'Product not found',
                'image' => null,
                'slug' => null,
                'available' => false
            ];
        }

        if ($this->product_type === 'artwork') {
            return [
                'title' => $product->title,
                'image' => $product->getFirstMediaUrl('cover_image'),
                'slug' => $product->slug,
                'available' => $product->is_for_sale,
                'artist' => $product->artist->artist_name ?? null
            ];
        } else {
            return [
                'title' => $product->main_title,
                'image' => $product->getFirstMediaUrl('cover_photo'),
                'slug' => $product->slug,
                'available' => $product->in_stock,
                'artist' => $product->artist->artist_name ?? null
            ];
        }
    }

    /**
     * Get item total price
     */
    public function getTotalAttribute()
    {
        return $this->price * $this->quantity;
    }
}
