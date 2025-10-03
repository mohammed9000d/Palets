<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Artist;
use App\Models\Product;

class TestProductsSeeder extends Seeder
{
    public function run()
    {
        // Create a test artist if none exists
        $artist = Artist::firstOrCreate(
            ['slug' => 'test-artist'],
            [
                'artist_name' => 'Test Artist',
                'bio' => 'This is a test artist for debugging purposes.',
                'is_active' => true,
            ]
        );

        // Create test products
        $products = [
            [
                'main_title' => 'Abstract Painting 1',
                'sub_title' => 'Colorful Abstract Art',
                'description' => 'A beautiful abstract painting with vibrant colors.',
                'price' => 150.00,
                'status' => 'published',
                'in_stock' => true,
            ],
            [
                'main_title' => 'Modern Sculpture',
                'sub_title' => 'Contemporary Art Piece',
                'description' => 'A modern sculpture made from recycled materials.',
                'price' => 300.00,
                'status' => 'published',
                'in_stock' => true,
            ],
            [
                'main_title' => 'Digital Art Print',
                'sub_title' => 'Limited Edition Print',
                'description' => 'High-quality digital art print, limited edition.',
                'price' => 75.00,
                'status' => 'published',
                'in_stock' => true,
            ],
        ];

        foreach ($products as $index => $productData) {
            Product::firstOrCreate(
                ['slug' => 'test-product-' . ($index + 1)],
                array_merge($productData, [
                    'artist_id' => $artist->id,
                    'slug' => 'test-product-' . ($index + 1),
                    'product_details' => 'Detailed information about this artwork.',
                ])
            );
        }

        $this->command->info('Test products created successfully!');
        $this->command->info('Artist: ' . $artist->artist_name . ' (ID: ' . $artist->id . ')');
        $this->command->info('Products created: ' . count($products));
    }
}
