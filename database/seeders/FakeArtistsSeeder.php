<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Artist;
use Faker\Factory as Faker;
use Illuminate\Support\Str;

class FakeArtistsSeeder extends Seeder
{
    public function run()
    {
        $faker = Faker::create();
        
        // Array of artist profile photos from Unsplash
        $artistPhotos = [
            'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=400',
            'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
            'https://images.unsplash.com/photo-1596815064285-45ed8a9c0463?w=400',
            'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400',
            'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
            'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400',
            'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
            'https://images.unsplash.com/photo-1494790108755-2616b612b647?w=400',
            'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
            'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=400',
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
            'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400',
            'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400',
            'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400',
            'https://images.unsplash.com/photo-1557862921-37829c790f19?w=400',
            'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
            'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400'
        ];

        // Array of gallery photos for artists
        $galleryPhotos = [
            'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800',
            'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
            'https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=800',
            'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800',
            'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=800',
            'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=800',
            'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
            'https://images.unsplash.com/photo-1594736797933-d0c6ba2fe65b?w=800',
            'https://images.unsplash.com/photo-1549490349-8643362247b5?w=800',
            'https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=800'
        ];

        $specialties = [
            'Oil Painting', 'Watercolor', 'Acrylic Painting', 'Digital Art', 'Mixed Media',
            'Sculpture', 'Photography', 'Printmaking', 'Charcoal Drawing', 'Pastel Art',
            'Abstract Art', 'Portrait Painting', 'Landscape Painting', 'Contemporary Art',
            'Fine Art', 'Street Art', 'Conceptual Art', 'Installation Art', 'Ceramic Art'
        ];

        for ($i = 1; $i <= 50; $i++) {
            $artistName = $faker->firstName() . ' ' . $faker->lastName();
            
            $artist = Artist::create([
                'artist_name' => $artistName,
                'slug' => Str::slug($artistName) . '-' . $faker->randomNumber(3),
                'bio' => $faker->paragraphs(3, true),
                'link' => $faker->boolean(60) ? $faker->url() : null,
                'specialties' => implode(', ', $faker->randomElements($specialties, $faker->numberBetween(1, 3))),
                'contact_email' => $faker->safeEmail(),
                'phone' => $faker->boolean(70) ? $faker->phoneNumber() : null,
                'commission_rate' => $faker->boolean(80) ? $faker->randomFloat(2, 5, 25) : null,
                'social_links' => [
                    'instagram' => $faker->boolean(80) ? 'https://instagram.com/' . $faker->userName() : null,
                    'facebook' => $faker->boolean(60) ? 'https://facebook.com/' . $faker->userName() : null,
                    'twitter' => $faker->boolean(50) ? 'https://twitter.com/' . $faker->userName() : null,
                    'website' => $faker->boolean(40) ? $faker->url() : null,
                ],
                'is_active' => $faker->boolean(85), // 85% chance of being active
                'created_at' => $faker->dateTimeBetween('-2 years', 'now'),
            ]);

            // Add avatar photo from Unsplash
            if ($faker->boolean(85)) { // 85% chance of having an avatar
                $photoUrl = $faker->randomElement($artistPhotos);
                try {
                    $artist->addMediaFromUrl($photoUrl)
                        ->toMediaCollection('avatar');
                } catch (\Exception $e) {
                    // Skip if photo download fails
                }
            }

            // Add gallery images
            $galleryCount = $faker->numberBetween(2, 6);
            for ($j = 0; $j < $galleryCount; $j++) {
                $galleryUrl = $faker->randomElement($galleryPhotos);
                try {
                    $artist->addMediaFromUrl($galleryUrl)
                        ->toMediaCollection('gallery');
                } catch (\Exception $e) {
                    // Skip if photo download fails
                }
            }
        }

        $this->command->info('Created 50 fake artists with avatars and gallery photos');
    }
}
