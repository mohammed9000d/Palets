<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Artist;
use App\Models\ArtistWork;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class MediaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create temp directory for downloaded images
        Storage::makeDirectory('temp');

        // Seed artist avatars
        $artists = Artist::all();
        foreach ($artists as $index => $artist) {
            try {
                // Download a placeholder avatar
                $avatarUrl = 'https://picsum.photos/seed/artist' . $artist->id . '/400/400';
                $avatarContents = Http::get($avatarUrl)->body();
                $avatarPath = 'temp/avatar_' . $artist->id . '.jpg';
                Storage::put($avatarPath, $avatarContents);
                
                // Add to media collection
                $artist->addMedia(storage_path('app/' . $avatarPath))
                    ->toMediaCollection('avatar');
                
                // Add gallery images (2-3 per artist)
                $galleryCount = rand(2, 3);
                for ($i = 1; $i <= $galleryCount; $i++) {
                    $galleryUrl = 'https://picsum.photos/seed/gallery' . $artist->id . $i . '/600/400';
                    $galleryContents = Http::get($galleryUrl)->body();
                    $galleryPath = 'temp/gallery_' . $artist->id . '_' . $i . '.jpg';
                    Storage::put($galleryPath, $galleryContents);
                    
                    $artist->addMedia(storage_path('app/' . $galleryPath))
                        ->toMediaCollection('gallery');
                }
                
                $this->command->info('Added media for artist: ' . $artist->artist_name);
            } catch (\Exception $e) {
                $this->command->error('Failed to add media for artist ' . $artist->artist_name . ': ' . $e->getMessage());
            }
        }

        // Seed artwork images
        $artworks = ArtistWork::all();
        foreach ($artworks as $artwork) {
            try {
                // Download a placeholder cover image
                $coverUrl = 'https://picsum.photos/seed/artwork' . $artwork->id . '/800/600';
                $coverContents = Http::get($coverUrl)->body();
                $coverPath = 'temp/cover_' . $artwork->id . '.jpg';
                Storage::put($coverPath, $coverContents);
                
                // Add cover image
                $artwork->addMedia(storage_path('app/' . $coverPath))
                    ->toMediaCollection('cover_image');
                
                // Add additional images (1-3 per artwork)
                $imageCount = rand(1, 3);
                for ($i = 1; $i <= $imageCount; $i++) {
                    $imageUrl = 'https://picsum.photos/seed/artworkimg' . $artwork->id . $i . '/800/600';
                    $imageContents = Http::get($imageUrl)->body();
                    $imagePath = 'temp/artwork_' . $artwork->id . '_' . $i . '.jpg';
                    Storage::put($imagePath, $imageContents);
                    
                    $artwork->addMedia(storage_path('app/' . $imagePath))
                        ->toMediaCollection('images');
                }
                
                $this->command->info('Added media for artwork: ' . $artwork->title);
            } catch (\Exception $e) {
                $this->command->error('Failed to add media for artwork ' . $artwork->title . ': ' . $e->getMessage());
            }
        }

        // Clean up temp directory
        Storage::deleteDirectory('temp');
        
        $this->command->info('Media seeding completed!');
    }
}

