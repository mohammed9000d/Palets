<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Artist;
use Faker\Factory as Faker;
use Illuminate\Support\Str;

class FakeProductsSeeder extends Seeder
{
    public function run()
    {
        $faker = Faker::create();
        
        // Get all artists to assign products to them
        $artists = Artist::all();
        
        if ($artists->isEmpty()) {
            $this->command->warn('No artists found. Please run FakeArtistsSeeder first.');
            return;
        }

        // Array of art product photos from Unsplash
        $productPhotos = [
            'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800',
            'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
            'https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=800',
            'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800',
            'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=800',
            'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=800',
            'https://images.unsplash.com/photo-1594736797933-d0c6ba2fe65b?w=800',
            'https://images.unsplash.com/photo-1549490349-8643362247b5?w=800',
            'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=800',
            'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
            'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800',
            'https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=800',
            'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800',
            'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=800',
            'https://images.unsplash.com/photo-1594736797933-d0c6ba2fe65b?w=800',
            'https://images.unsplash.com/photo-1549490349-8643362247b5?w=800',
            'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
            'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800',
            'https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=800',
            'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800'
        ];

        $productTitles = [
            'Abstract Symphony', 'Urban Dreams', 'Mystic Waters', 'Golden Hour', 'Ethereal Landscapes',
            'Color Burst', 'Serenity Now', 'Modern Expressions', 'Timeless Beauty', 'Vibrant Souls',
            'Ocean Whispers', 'Mountain Majesty', 'City Lights', 'Forest Dreams', 'Desert Bloom',
            'Sunset Reflections', 'Morning Glory', 'Midnight Canvas', 'Rainbow Bridge', 'Starlight Serenade',
            'Peaceful Moments', 'Dynamic Energy', 'Soft Whispers', 'Bold Statements', 'Gentle Breeze',
            'Fiery Passion', 'Cool Waters', 'Warm Embrace', 'Silent Stories', 'Loud Colors',
            'Hidden Treasures', 'Open Spaces', 'Closed Doors', 'New Beginnings', 'Endless Journeys',
            'Simple Pleasures', 'Complex Emotions', 'Pure Essence', 'Mixed Feelings', 'Clear Vision'
        ];

        $productSubtitles = [
            'A masterpiece of modern art', 'Contemporary expression', 'Limited edition piece',
            'Handcrafted with love', 'Inspired by nature', 'Urban contemporary style',
            'Abstract interpretation', 'Minimalist design', 'Bold and vibrant', 'Subtle and elegant'
        ];

        for ($i = 1; $i <= 50; $i++) {
            $mainTitle = $faker->randomElement($productTitles) . ' ' . $faker->numberBetween(1, 100);
            $price = $faker->randomFloat(2, 50, 2000);
            $discountPrice = $faker->boolean(30) ? $faker->randomFloat(2, $price * 0.7, $price * 0.9) : null;
            
            $product = Product::create([
                'artist_id' => $faker->randomElement($artists)->id,
                'main_title' => $mainTitle,
                'sub_title' => $faker->randomElement($productSubtitles),
                'slug' => Str::slug($mainTitle) . '-' . $faker->randomNumber(3),
                'description' => $faker->paragraphs(2, true),
                'product_details' => $this->generateProductDetails($faker),
                'price' => $price,
                'discount_price' => $discountPrice,
                'in_stock' => $faker->boolean(80), // 80% chance of being in stock
                'is_custom_dimension' => $faker->boolean(40), // 40% chance of custom dimensions
                'dimensions' => [
                    'width' => $faker->numberBetween(20, 120),
                    'height' => $faker->numberBetween(20, 120),
                    'depth' => $faker->boolean(50) ? $faker->numberBetween(1, 10) : null,
                    'unit' => 'cm'
                ],
                'status' => $faker->randomElement(['published', 'draft', 'archived']),
                'created_at' => $faker->dateTimeBetween('-1 year', 'now'),
            ]);

            // Add cover photo from Unsplash
            $coverUrl = $faker->randomElement($productPhotos);
            try {
                $product->addMediaFromUrl($coverUrl)
                    ->toMediaCollection('cover_photo');
            } catch (\Exception $e) {
                // Skip if photo download fails
            }

            // Add product gallery images
            $galleryCount = $faker->numberBetween(2, 5);
            for ($j = 0; $j < $galleryCount; $j++) {
                $galleryUrl = $faker->randomElement($productPhotos);
                try {
                    $product->addMediaFromUrl($galleryUrl)
                        ->toMediaCollection('product_images');
                } catch (\Exception $e) {
                    // Skip if photo download fails
                }
            }
        }

        $this->command->info('Created 50 fake products with cover photos and gallery images');
    }

    private function generateProductDetails($faker)
    {
        $details = "## Product Description\n\n";
        $details .= $faker->paragraphs(3, true) . "\n\n";
        
        $details .= "## Materials Used\n\n";
        $materials = $faker->randomElements([
            'Canvas', 'Oil Paint', 'Acrylic Paint', 'Watercolor', 'Charcoal', 
            'Graphite', 'Mixed Media', 'Paper', 'Wood Panel', 'Linen'
        ], $faker->numberBetween(2, 4));
        foreach ($materials as $material) {
            $details .= "- " . $material . "\n";
        }
        
        $details .= "\n## Care Instructions\n\n";
        $details .= "- Keep away from direct sunlight\n";
        $details .= "- Clean with a soft, dry cloth\n";
        $details .= "- Frame recommended for protection\n";
        $details .= "- Store in a cool, dry place\n\n";
        
        $details .= "## About the Artist\n\n";
        $details .= $faker->paragraph() . "\n";
        
        return $details;
    }
}
