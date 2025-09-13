<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ArtPanelGallery;
use App\Models\Artist;
use Faker\Factory as Faker;
use Illuminate\Support\Str;
use Carbon\Carbon;

class FakeGalleriesSeeder extends Seeder
{
    public function run()
    {
        $faker = Faker::create();
        
        // Get all artists to assign as organizers and participants
        $artists = Artist::all();
        
        if ($artists->isEmpty()) {
            $this->command->warn('No artists found. Please run FakeArtistsSeeder first.');
            return;
        }

        // Array of gallery cover photos from Unsplash
        $galleryPhotos = [
            'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800',
            'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
            'https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=800',
            'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800',
            'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=800',
            'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=800',
            'https://images.unsplash.com/photo-1594736797933-d0c6ba2fe65b?w=800',
            'https://images.unsplash.com/photo-1549490349-8643362247b5?w=800',
            'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800',
            'https://images.unsplash.com/photo-1569172122301-bc5008bc09c5?w=800',
            'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
            'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800',
            'https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=800',
            'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800',
            'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=800',
            'https://images.unsplash.com/photo-1594736797933-d0c6ba2fe65b?w=800',
            'https://images.unsplash.com/photo-1549490349-8643362247b5?w=800',
            'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800',
            'https://images.unsplash.com/photo-1569172122301-bc5008bc09c5?w=800',
            'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800'
        ];

        $galleryTitles = [
            'Contemporary Visions Exhibition',
            'Abstract Expressions Gallery Show',
            'Modern Masters Collection',
            'Emerging Artists Showcase',
            'Digital Art Revolution',
            'Traditional Meets Modern',
            'Color and Form Exhibition',
            'Urban Art Collective',
            'Nature Inspired Artworks',
            'Cultural Heritage Display',
            'Minimalist Art Movement',
            'Bold and Beautiful',
            'Artistic Innovations',
            'Creative Minds Unite',
            'Art Beyond Boundaries',
            'Visual Storytelling',
            'Texture and Light',
            'Emotional Landscapes',
            'Artistic Interpretations',
            'Creative Expressions',
            'Art and Society',
            'Visual Narratives',
            'Artistic Journeys',
            'Creative Discoveries',
            'Art in Motion',
            'Contemporary Perspectives',
            'Artistic Reflections',
            'Creative Visions',
            'Art and Culture',
            'Visual Arts Festival'
        ];

        $locations = [
            'Downtown Art Center', 'Metropolitan Museum', 'City Gallery', 'Modern Art Space',
            'Contemporary Art Museum', 'Community Art Center', 'Cultural District Gallery',
            'Arts Quarter', 'Creative Hub', 'Exhibition Hall', 'Art District', 'Gallery District',
            'Museum of Fine Arts', 'Art Foundation', 'Cultural Center', 'Arts Complex',
            'Gallery Space', 'Art Venue', 'Exhibition Center', 'Creative Space'
        ];

        for ($i = 1; $i <= 50; $i++) {
            $title = $faker->randomElement($galleryTitles) . ' ' . $faker->year();
            
            // Generate random dates
            $startDate = $faker->dateTimeBetween('-6 months', '+6 months');
            $endDate = $faker->dateTimeBetween($startDate, $startDate->format('Y-m-d') . ' +3 months');
            $duration = Carbon::parse($startDate)->diffInDays(Carbon::parse($endDate));
            
            $gallery = ArtPanelGallery::create([
                'main_title' => $title,
                'sub_title' => $faker->sentence(6),
                'slug' => Str::slug($title) . '-' . $faker->randomNumber(3),
                'overview' => $faker->paragraph(2),
                'description' => $this->generateGalleryDescription($faker),
                'organizer_artist_id' => $faker->randomElement($artists)->id,
                'location' => $faker->randomElement($locations),
                'start_date' => $startDate,
                'end_date' => $endDate,
                'status' => $faker->randomElement(['published', 'draft', 'archived']),
                'created_at' => $faker->dateTimeBetween('-1 year', 'now'),
            ]);

            // Add cover image from Unsplash
            $coverUrl = $faker->randomElement($galleryPhotos);
            try {
                $gallery->addMediaFromUrl($coverUrl)
                    ->toMediaCollection('cover_image');
            } catch (\Exception $e) {
                // Skip if photo download fails
            }

            // Add participating artists
            $participantCount = $faker->numberBetween(3, 8);
            $participants = $faker->randomElements($artists, $participantCount);
            
            foreach ($participants as $index => $participant) {
                $gallery->artists()->attach($participant->id, [
                    'role' => $faker->randomElement(['Exhibitor', 'Featured Artist', 'Guest Artist', 'Curator']),
                    'display_order' => $index + 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        $this->command->info('Created 50 fake galleries with cover images and participating artists');
    }

    private function generateGalleryDescription($faker)
    {
        $description = "## About This Exhibition\n\n";
        $description .= $faker->paragraphs(2, true) . "\n\n";
        
        $description .= "## Featured Works\n\n";
        $description .= $faker->paragraph() . "\n\n";
        
        $description .= "### Exhibition Highlights\n\n";
        for ($i = 0; $i < $faker->numberBetween(3, 5); $i++) {
            $description .= "- " . $faker->sentence() . "\n";
        }
        $description .= "\n";
        
        $description .= "## Curator's Note\n\n";
        $description .= "> " . $faker->paragraph() . "\n\n";
        
        $description .= "## Visitor Information\n\n";
        $description .= "- Opening Reception: " . $faker->dateTimeThisMonth()->format('F j, Y') . "\n";
        $description .= "- Gallery Hours: Tuesday - Sunday, 10 AM - 6 PM\n";
        $description .= "- Admission: " . ($faker->boolean(60) ? 'Free' : '$' . $faker->numberBetween(5, 15)) . "\n";
        $description .= "- Parking: Available on-site\n\n";
        
        $description .= "## About the Artists\n\n";
        $description .= $faker->paragraph() . "\n";
        
        return $description;
    }
}
