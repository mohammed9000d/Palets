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
        Schema::create('art_panel_galleries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organizer_artist_id')->nullable()->constrained('artists')->onDelete('set null'); // Organizer artist
            $table->string('main_title'); // Main gallery title
            $table->string('sub_title')->nullable(); // Sub title
            $table->text('overview')->nullable(); // Short overview/summary
            $table->text('description')->nullable(); // Detailed description (will support rich text)
            $table->date('start_date'); // Gallery start date
            $table->date('end_date'); // Gallery end date
            $table->string('slug')->unique(); // SEO-friendly URL slug
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft'); // Gallery status
            $table->string('location')->nullable(); // Physical location of gallery
            $table->integer('view_count')->default(0); // View counter
            $table->timestamps();
            
            // Indexes for better performance
            $table->index('organizer_artist_id');
            $table->index('main_title');
            $table->index('status');
            $table->index('start_date');
            $table->index('end_date');
            $table->index('slug');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('art_panel_galleries');
    }
};
