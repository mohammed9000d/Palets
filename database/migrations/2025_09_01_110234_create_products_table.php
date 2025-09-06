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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('artist_id')->nullable()->constrained('artists')->onDelete('set null'); // Artist relationship (optional)
            $table->string('main_title'); // Main product title
            $table->string('sub_title')->nullable(); // Sub title
            $table->text('description')->nullable(); // Product description
            $table->decimal('price', 10, 2); // Product price
            $table->text('product_details')->nullable(); // Detailed product information
            $table->boolean('in_stock')->default(true); // Stock status
            $table->boolean('is_custom_dimension')->default(false); // Custom dimension flag
            $table->string('slug')->unique(); // SEO-friendly URL slug
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft'); // Product status
            $table->json('dimensions')->nullable(); // Product dimensions (width, height, depth, weight)
            $table->decimal('discount_price', 10, 2)->nullable(); // Discounted price
            $table->integer('view_count')->default(0); // View counter
            $table->integer('like_count')->default(0); // Like counter
            $table->timestamps();
            
            // Indexes for better performance
            $table->index('artist_id');
            $table->index('main_title');
            $table->index('status');
            $table->index('in_stock');
            $table->index('slug');
            $table->index('price');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
