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
            // Add new full name columns
            $table->string('billing_full_name')->after('currency');
            $table->string('shipping_full_name')->nullable()->after('billing_country');
            
            // Drop old separate name columns
            $table->dropColumn(['billing_first_name', 'billing_last_name', 'shipping_first_name', 'shipping_last_name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Add back the separate name columns
            $table->string('billing_first_name')->after('currency');
            $table->string('billing_last_name')->after('billing_first_name');
            $table->string('shipping_first_name')->nullable()->after('billing_country');
            $table->string('shipping_last_name')->nullable()->after('shipping_first_name');
            
            // Drop the full name columns
            $table->dropColumn(['billing_full_name', 'shipping_full_name']);
        });
    }
};
