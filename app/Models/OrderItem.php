<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'product_id',
        'product_type',
        'product_title',
        'product_image',
        'quantity',
        'unit_price',
        'total_price',
        'custom_options',
    ];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'total_price' => 'decimal:2',
        'custom_options' => 'array',
    ];

    // Relationships
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    // Accessors
    public function getFormattedUnitPriceAttribute()
    {
        return '$' . number_format($this->unit_price, 2);
    }

    public function getFormattedTotalPriceAttribute()
    {
        return '$' . number_format($this->total_price, 2);
    }

    public function hasCustomDimensions(): bool
    {
        return isset($this->custom_options['custom_dimensions']) && 
               !empty($this->custom_options['custom_dimensions']);
    }

    public function getCustomDimensionsText(): ?string
    {
        if (!$this->hasCustomDimensions()) {
            return null;
        }

        $dimensions = $this->custom_options['custom_dimensions'];
        $text = '';
        
        if (!empty($dimensions['width'])) {
            $text .= $dimensions['width'] . 'cm W';
        }
        
        if (!empty($dimensions['height'])) {
            $text .= ($text ? ' × ' : '') . $dimensions['height'] . 'cm H';
        }
        
        if (!empty($dimensions['depth'])) {
            $text .= ($text ? ' × ' : '') . $dimensions['depth'] . 'cm D';
        }
        
        return $text ?: null;
    }
}
