<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Product;
use App\Models\Artist;

class TestProductsApi extends Command
{
    protected $signature = 'test:products-api';
    protected $description = 'Test products API and create sample data if needed';

    public function handle()
    {
        $this->info('Testing Products API...');
        
        // Check total products
        $totalProducts = Product::count();
        $this->info("Total products in database: {$totalProducts}");
        
        // Check published products
        $publishedProducts = Product::where('status', 'published')->count();
        $this->info("Published products: {$publishedProducts}");
        
        // Check artists
        $totalArtists = Artist::count();
        $this->info("Total artists: {$totalArtists}");
        
        if ($totalArtists === 0) {
            $this->warn('No artists found! Creating a test artist...');
            $artist = Artist::create([
                'artist_name' => 'Test Artist',
                'bio' => 'This is a test artist for debugging purposes.',
                'slug' => 'test-artist',
                'is_active' => true,
            ]);
            $this->info("Created test artist with ID: {$artist->id}");
        } else {
            $artist = Artist::first();
            $this->info("Using existing artist: {$artist->artist_name} (ID: {$artist->id})");
        }
        
        if ($publishedProducts === 0) {
            $this->warn('No published products found! Creating test products...');
            
            for ($i = 1; $i <= 3; $i++) {
                $product = Product::create([
                    'artist_id' => $artist->id,
                    'main_title' => "Test Product {$i}",
                    'sub_title' => "Test subtitle {$i}",
                    'description' => "This is a test product {$i} for debugging purposes.",
                    'price' => 100.00 * $i,
                    'product_details' => "Detailed information about test product {$i}",
                    'in_stock' => true,
                    'slug' => "test-product-{$i}",
                    'status' => 'published',
                ]);
                $this->info("Created test product: {$product->main_title} (ID: {$product->id})");
            }
        }
        
        // Test the API logic
        $this->info("\nTesting API logic...");
        
        // Test without artist filter
        $allPublished = Product::with(['media', 'artist'])
            ->where('status', 'published')
            ->get();
        $this->info("All published products: {$allPublished->count()}");
        
        // Test with artist filter
        $artistProducts = Product::with(['media', 'artist'])
            ->where('status', 'published')
            ->where('artist_id', $artist->id)
            ->get();
        $this->info("Products for artist {$artist->id}: {$artistProducts->count()}");
        
        // Show product details
        foreach ($artistProducts as $product) {
            $this->info("- {$product->main_title} (Status: {$product->status}, Artist: {$product->artist_id})");
        }
        
        $this->info("\nTest completed! You can now test the API endpoints:");
        $this->info("- /api/public/products");
        $this->info("- /api/public/products?artist_id={$artist->id}");
        $this->info("- /api/public/debug/all-products");
        $this->info("- /api/public/debug/products?artist_id={$artist->id}");
    }
}
