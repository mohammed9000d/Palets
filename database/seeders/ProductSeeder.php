<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Artist;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get some artists to associate with products
        $artists = Artist::take(3)->get();
        
        $products = [
            [
                'artist_id' => $artists->first()?->id,
                'main_title' => 'Abstract Canvas Panel Set',
                'sub_title' => 'Modern Geometric Collection',
                'description' => 'A stunning collection of abstract geometric panels featuring bold colors and contemporary design. Perfect for modern living spaces.',
                'price' => 299.99,
                'discount_price' => 249.99,
                'product_details' => "## Features\n- **Premium Canvas**: High-quality stretched canvas\n- **Vibrant Colors**: Fade-resistant inks\n- **Ready to Hang**: Includes mounting hardware\n\n### Specifications\n- Set of 3 panels\n- Each panel: 40cm x 60cm\n- Total wall space: 120cm x 60cm",
                'in_stock' => true,
                'is_custom_dimension' => true,
                'status' => 'published',
                'dimensions' => [
                    'width' => '120',
                    'height' => '60',
                    'depth' => '3',
                    'weight' => '2.5'
                ],
                'slug' => 'abstract-canvas-panel-set'
            ],
            [
                'artist_id' => $artists->skip(1)->first()?->id,
                'main_title' => 'Nature Inspired Wood Panels',
                'sub_title' => 'Handcrafted Botanical Art',
                'description' => 'Beautiful handcrafted wooden panels featuring intricate botanical designs. Each piece is unique and made from sustainable materials.',
                'price' => 189.99,
                'product_details' => "## Craftsmanship\n- **Sustainable Wood**: Responsibly sourced materials\n- **Hand-carved Details**: Intricate botanical patterns\n- **Natural Finish**: Eco-friendly protective coating\n\n### Care Instructions\n1. Dust with soft, dry cloth\n2. Avoid direct sunlight\n3. Keep away from moisture",
                'in_stock' => true,
                'is_custom_dimension' => false,
                'status' => 'published',
                'dimensions' => [
                    'width' => '80',
                    'height' => '100',
                    'depth' => '2',
                    'weight' => '3.2'
                ],
                'slug' => 'nature-inspired-wood-panels'
            ],
            [
                'artist_id' => $artists->skip(2)->first()?->id,
                'main_title' => 'Minimalist Metal Art Panels',
                'sub_title' => 'Contemporary Steel Collection',
                'description' => 'Sleek minimalist metal panels that add sophistication to any space. Featuring brushed steel finish with subtle geometric patterns.',
                'price' => 449.99,
                'discount_price' => 399.99,
                'product_details' => "## Premium Materials\n- **Brushed Steel**: High-grade stainless steel\n- **Powder Coating**: Durable, scratch-resistant finish\n- **Precision Cut**: Laser-cut geometric patterns\n\n### Installation\n- Wall mounting system included\n- Professional installation recommended\n- Suitable for indoor use only",
                'in_stock' => true,
                'is_custom_dimension' => true,
                'status' => 'published',
                'dimensions' => [
                    'width' => '150',
                    'height' => '80',
                    'depth' => '1',
                    'weight' => '8.5'
                ],
                'slug' => 'minimalist-metal-art-panels'
            ],
            [
                'artist_id' => null,
                'main_title' => 'Vintage Textile Panel Collection',
                'sub_title' => 'Restored Heritage Fabrics',
                'description' => 'Carefully restored vintage textile panels showcasing traditional patterns and craftsmanship from around the world.',
                'price' => 129.99,
                'product_details' => "## Heritage Collection\n- **Authentic Textiles**: Sourced from global artisans\n- **Professional Restoration**: Expert cleaning and preservation\n- **Museum Quality**: Archival mounting and framing\n\n### Cultural Significance\nEach piece tells a story of traditional craftsmanship and cultural heritage.",
                'in_stock' => false,
                'is_custom_dimension' => false,
                'status' => 'published',
                'dimensions' => [
                    'width' => '60',
                    'height' => '90',
                    'depth' => '4',
                    'weight' => '1.8'
                ],
                'slug' => 'vintage-textile-panel-collection'
            ],
            [
                'artist_id' => $artists->first()?->id,
                'main_title' => 'Digital Art LED Panels',
                'sub_title' => 'Interactive Light Installation',
                'description' => 'Cutting-edge digital art panels with programmable LED displays. Create dynamic, ever-changing art installations.',
                'price' => 899.99,
                'product_details' => "## Technology Features\n- **4K LED Display**: Ultra-high resolution\n- **Smart Controls**: App-controlled via WiFi\n- **Energy Efficient**: Low power consumption\n- **Custom Content**: Upload your own artwork\n\n### Technical Specs\n- Resolution: 3840 x 2160\n- Brightness: 500 nits\n- Color gamut: 95% DCI-P3\n- Connectivity: WiFi, Bluetooth, USB-C",
                'in_stock' => true,
                'is_custom_dimension' => true,
                'status' => 'published',
                'dimensions' => [
                    'width' => '100',
                    'height' => '60',
                    'depth' => '5',
                    'weight' => '12.0'
                ],
                'slug' => 'digital-art-led-panels'
            ],
            [
                'artist_id' => null,
                'main_title' => 'Ceramic Mosaic Panels',
                'sub_title' => 'Handmade Mediterranean Style',
                'description' => 'Beautiful handmade ceramic mosaic panels inspired by Mediterranean art traditions. Each tile is individually crafted.',
                'price' => 349.99,
                'product_details' => "## Artisan Craftsmanship\n- **Hand-glazed Tiles**: Individual ceramic pieces\n- **Traditional Techniques**: Mediterranean mosaic methods\n- **Weather Resistant**: Suitable for indoor/outdoor use\n\n### Design Options\n- Mediterranean blue and white\n- Earthy terracotta tones\n- Custom color combinations available",
                'in_stock' => true,
                'is_custom_dimension' => true,
                'status' => 'draft',
                'dimensions' => [
                    'width' => '90',
                    'height' => '90',
                    'depth' => '2',
                    'weight' => '15.5'
                ],
                'slug' => 'ceramic-mosaic-panels'
            ]
        ];

        foreach ($products as $productData) {
            Product::create($productData);
        }
    }
}