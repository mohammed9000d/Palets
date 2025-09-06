<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('cart_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('cart_id');
            $table->unsignedBigInteger('product_id');
            $table->string('product_type')->default('product'); // 'product' or 'artwork'
            $table->integer('quantity')->default(1);
            $table->decimal('price', 10, 2); // Price at time of adding to cart
            $table->json('options')->nullable(); // Custom options (dimensions, colors, etc.)
            $table->timestamps();

            $table->foreign('cart_id')->references('id')->on('carts')->onDelete('cascade');
            
            // Create polymorphic relationship - can reference products or artworks
            $table->index(['product_id', 'product_type']);
            $table->index('cart_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cart_items');
    }
};
