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
        Schema::create('artist_works', function (Blueprint $table) {
            $table->id();
            $table->foreignId('artist_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('overview')->nullable();
            $table->text('description')->nullable();
            $table->string('slug')->unique(); // SEO-friendly URL slug
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft');
            $table->year('year_created')->nullable();
            $table->string('medium')->nullable(); // Oil, watercolor, digital, etc.
            $table->string('dimensions')->nullable(); // e.g., "24x36 inches"
            $table->decimal('price', 10, 2)->nullable();
            $table->boolean('is_for_sale')->default(false);
            $table->boolean('is_featured')->default(false);
            $table->json('tags')->nullable(); // Art tags/categories
            $table->integer('view_count')->default(0);
            $table->integer('like_count')->default(0);
            $table->timestamps();
            
            // Indexes for better performance
            $table->index('artist_id');
            $table->index('title');
            $table->index('status');
            $table->index('is_featured');
            $table->index('is_for_sale');
            $table->index('slug');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('artist_works');
    }
};
