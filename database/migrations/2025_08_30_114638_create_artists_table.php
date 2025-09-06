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
        Schema::create('artists', function (Blueprint $table) {
            $table->id();
            $table->string('artist_name');
            $table->text('bio')->nullable(); // Artist biography
            $table->string('link')->nullable(); // Website or portfolio link
            $table->boolean('is_active')->default(true);
            $table->string('slug')->unique(); // SEO-friendly URL slug
            $table->json('social_links')->nullable(); // Social media links
            $table->string('contact_email')->nullable();
            $table->string('phone')->nullable();
            $table->text('specialties')->nullable(); // Art specialties/genres
            $table->decimal('commission_rate', 5, 2)->nullable(); // Commission percentage
            $table->timestamps();
            
            // Indexes for better performance
            $table->index('artist_name');
            $table->index('is_active');
            $table->index('slug');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('artists');
    }
};
