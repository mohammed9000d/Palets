<?php

namespace Database\Seeders;

use App\Models\Artist;
use App\Models\ArtistWork;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ArtistWorkSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $artists = Artist::all();

        if ($artists->count() === 0) {
            $this->command->info('No artists found. Please run ArtistSeeder first.');
            return;
        }

        $works = [
            // Leonardo da Vinci works
            [
                'artist_slug' => 'leonardo-da-vinci',
                'title' => 'Mona Lisa',
                'overview' => 'The most famous portrait in the world, known for her enigmatic smile.',
                'description' => 'The Mona Lisa is a half-length portrait painting by the Italian Renaissance artist Leonardo da Vinci that has been described as "the best known, the most visited, the most written about, the most sung about, the most parodied work of art in the world".',
                'slug' => 'mona-lisa',
                'status' => 'published',
                'year_created' => 1506,
                'medium' => 'Oil on poplar panel',
                'dimensions' => '77 cm × 53 cm (30 in × 21 in)',
                'price' => 1000000.00,
                'is_for_sale' => false,
                'is_featured' => true,
                'tags' => ['portrait', 'renaissance', 'masterpiece', 'famous'],
                'view_count' => 5000,
                'like_count' => 1200,
            ],
            [
                'artist_slug' => 'leonardo-da-vinci',
                'title' => 'The Last Supper',
                'overview' => 'Depiction of the Last Supper of Jesus with his apostles.',
                'description' => 'The Last Supper is a late 15th-century mural painting by Leonardo da Vinci housed by the refectory of the Convent of Santa Maria delle Grazie in Milan, Italy.',
                'slug' => 'the-last-supper',
                'status' => 'published',
                'year_created' => 1498,
                'medium' => 'Tempera and oil on gesso, pitch and mastic',
                'dimensions' => '460 cm × 880 cm (181 in × 346 in)',
                'price' => 2000000.00,
                'is_for_sale' => false,
                'is_featured' => true,
                'tags' => ['religious', 'renaissance', 'mural', 'biblical'],
                'view_count' => 3500,
                'like_count' => 980,
            ],
            // Vincent van Gogh works
            [
                'artist_slug' => 'vincent-van-gogh',
                'title' => 'The Starry Night',
                'overview' => 'Swirling night sky over a French village.',
                'description' => 'The Starry Night is an oil on canvas painting by Dutch Post-Impressionist painter Vincent van Gogh. Painted in June 1889, it depicts the view from the east-facing window of his asylum room at Saint-Paul-de-Mausole.',
                'slug' => 'the-starry-night',
                'status' => 'published',
                'year_created' => 1889,
                'medium' => 'Oil on canvas',
                'dimensions' => '73.7 cm × 92.1 cm (29 in × 36¼ in)',
                'price' => 500000.00,
                'is_for_sale' => false,
                'is_featured' => true,
                'tags' => ['landscape', 'night', 'post-impressionism', 'swirls'],
                'view_count' => 4200,
                'like_count' => 1500,
            ],
            [
                'artist_slug' => 'vincent-van-gogh',
                'title' => 'Sunflowers',
                'overview' => 'Series of still life paintings featuring sunflowers.',
                'description' => 'Sunflowers is the name of two series of still life paintings by the Dutch painter Vincent van Gogh. The first series, executed in Paris in 1887, depicts the flowers lying on the ground.',
                'slug' => 'sunflowers',
                'status' => 'published',
                'year_created' => 1888,
                'medium' => 'Oil on canvas',
                'dimensions' => '92 cm × 73 cm (36¼ in × 28¾ in)',
                'price' => 300000.00,
                'is_for_sale' => true,
                'is_featured' => true,
                'tags' => ['still life', 'flowers', 'yellow', 'vibrant'],
                'view_count' => 2800,
                'like_count' => 850,
            ],
            // Pablo Picasso works
            [
                'artist_slug' => 'pablo-picasso',
                'title' => 'Guernica',
                'overview' => 'Anti-war painting depicting the bombing of Guernica.',
                'description' => 'Guernica is a large 1937 oil painting on canvas by Spanish artist Pablo Picasso. It is one of his best-known works, regarded by many art critics as the most moving and powerful anti-war painting in history.',
                'slug' => 'guernica',
                'status' => 'published',
                'year_created' => 1937,
                'medium' => 'Oil on canvas',
                'dimensions' => '349.3 cm × 776.6 cm (137.4 in × 305.5 in)',
                'price' => 800000.00,
                'is_for_sale' => false,
                'is_featured' => true,
                'tags' => ['cubism', 'anti-war', 'political', 'black and white'],
                'view_count' => 3200,
                'like_count' => 1100,
            ],
            // Frida Kahlo works
            [
                'artist_slug' => 'frida-kahlo',
                'title' => 'Self-Portrait with Thorn Necklace and Hummingbird',
                'overview' => 'Self-portrait featuring symbolic elements.',
                'description' => 'This self-portrait by Frida Kahlo was painted in 1940. It depicts Frida wearing a thorn necklace with a dead hummingbird pendant, accompanied by a black cat and monkey.',
                'slug' => 'self-portrait-with-thorn-necklace-and-hummingbird',
                'status' => 'published',
                'year_created' => 1940,
                'medium' => 'Oil on canvas',
                'dimensions' => '63.5 cm × 49.5 cm (25 in × 19.5 in)',
                'price' => 250000.00,
                'is_for_sale' => true,
                'is_featured' => true,
                'tags' => ['self-portrait', 'symbolism', 'mexican art', 'surrealism'],
                'view_count' => 1800,
                'like_count' => 650,
            ],
            // Claude Monet works
            [
                'artist_slug' => 'claude-monet',
                'title' => 'Water Lilies',
                'overview' => 'Series of paintings depicting Monet\'s garden pond.',
                'description' => 'Water Lilies is a series of approximately 250 oil paintings by French Impressionist Claude Monet. The paintings depict Monet\'s flower garden at his home in Giverny.',
                'slug' => 'water-lilies',
                'status' => 'published',
                'year_created' => 1919,
                'medium' => 'Oil on canvas',
                'dimensions' => '200 cm × 425 cm (79 in × 167 in)',
                'price' => 400000.00,
                'is_for_sale' => true,
                'is_featured' => true,
                'tags' => ['impressionism', 'garden', 'water', 'nature'],
                'view_count' => 2200,
                'like_count' => 780,
            ],
        ];

        foreach ($works as $workData) {
            $artist = $artists->where('slug', $workData['artist_slug'])->first();
            if ($artist) {
                $workData['artist_id'] = $artist->id;
                unset($workData['artist_slug']);
                ArtistWork::create($workData);
            }
        }
    }
}
