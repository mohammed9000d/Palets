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
        Schema::table('orders', function (Blueprint $table) {
            // Make user_id nullable for guest orders
            $table->foreignId('user_id')->nullable()->change();
            
            // Add session_id for guest orders
            $table->string('session_id')->nullable()->after('user_id');
            
            // Add index for session_id
            $table->index(['session_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Remove session_id column
            $table->dropIndex(['session_id']);
            $table->dropColumn('session_id');
            
            // Make user_id required again
            $table->foreignId('user_id')->nullable(false)->change();
        });
    }
};
