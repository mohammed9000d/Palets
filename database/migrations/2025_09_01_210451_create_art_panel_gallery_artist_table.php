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
        Schema::create('art_panel_gallery_artist', function (Blueprint $table) {
            $table->id();
            $table->foreignId('art_panel_gallery_id')->constrained('art_panel_galleries')->onDelete('cascade');
            $table->foreignId('artist_id')->constrained('artists')->onDelete('cascade');
            $table->string('role')->nullable(); // Role of artist in gallery (e.g., 'featured', 'participant', 'guest')
            $table->integer('display_order')->default(0); // Order for displaying artists
            $table->timestamps();
            
            // Ensure unique combination
            $table->unique(['art_panel_gallery_id', 'artist_id'], 'gallery_artist_unique');
            
            // Indexes for performance
            $table->index('art_panel_gallery_id');
            $table->index('artist_id');
            $table->index('display_order');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('art_panel_gallery_artist');
    }
};
