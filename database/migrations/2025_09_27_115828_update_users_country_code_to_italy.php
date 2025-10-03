<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update all existing users' country code to Italy (+39)
        DB::table('users')
            ->where('country_code', '+1')
            ->orWhereNull('country_code')
            ->update(['country_code' => '+39']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert back to +1 (though this might not be desired in production)
        DB::table('users')
            ->where('country_code', '+39')
            ->update(['country_code' => '+1']);
    }
};