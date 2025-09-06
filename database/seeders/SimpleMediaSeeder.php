<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Artist;
use App\Models\ArtistWork;

class SimpleMediaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create a simple placeholder image
        $width = 400;
        $height = 400;
        
        // Seed artist avatars
        $artists = Artist::all();
        foreach ($artists as $index => $artist) {
            try {
                // Create a simple colored rectangle as placeholder
                $image = imagecreatetruecolor($width, $height);
                $bgColor = imagecolorallocate($image, rand(100, 255), rand(100, 255), rand(100, 255));
                imagefill($image, 0, 0, $bgColor);
                
                // Add text
                $textColor = imagecolorallocate($image, 255, 255, 255);
                $text = substr($artist->artist_name, 0, 2);
                $fontSize = 60;
                $bbox = imagettfbbox($fontSize, 0, 'C:\Windows\Fonts\arial.ttf', $text);
                $x = ($width - ($bbox[2] - $bbox[0])) / 2;
                $y = ($height - ($bbox[7] - $bbox[1])) / 2;
                imagettftext($image, $fontSize, 0, $x, $y, $textColor, 'C:\Windows\Fonts\arial.ttf', $text);
                
                // Save temporarily
                $tempPath = storage_path('app/temp_avatar_' . $artist->id . '.jpg');
                imagejpeg($image, $tempPath, 90);
                imagedestroy($image);
                
                // Add to media collection
                $artist->addMedia($tempPath)
                    ->toMediaCollection('avatar');
                
                // Clean up temp file
                unlink($tempPath);
                
                // Add gallery images (2 per artist)
                for ($i = 1; $i <= 2; $i++) {
                    $galleryImage = imagecreatetruecolor(600, 400);
                    $bgColor = imagecolorallocate($galleryImage, rand(100, 255), rand(100, 255), rand(100, 255));
                    imagefill($galleryImage, 0, 0, $bgColor);
                    
                    $tempGalleryPath = storage_path('app/temp_gallery_' . $artist->id . '_' . $i . '.jpg');
                    imagejpeg($galleryImage, $tempGalleryPath, 90);
                    imagedestroy($galleryImage);
                    
                    $artist->addMedia($tempGalleryPath)
                        ->toMediaCollection('gallery');
                    
                    unlink($tempGalleryPath);
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
                // Create cover image
                $coverImage = imagecreatetruecolor(800, 600);
                $bgColor = imagecolorallocate($coverImage, rand(50, 200), rand(50, 200), rand(50, 200));
                imagefill($coverImage, 0, 0, $bgColor);
                
                // Add artwork title text
                $textColor = imagecolorallocate($coverImage, 255, 255, 255);
                $text = substr($artwork->title, 0, 10);
                imagestring($coverImage, 5, 350, 280, $text, $textColor);
                
                $tempCoverPath = storage_path('app/temp_cover_' . $artwork->id . '.jpg');
                imagejpeg($coverImage, $tempCoverPath, 90);
                imagedestroy($coverImage);
                
                $artwork->addMedia($tempCoverPath)
                    ->toMediaCollection('cover_image');
                
                unlink($tempCoverPath);
                
                // Add additional images (2 per artwork)
                for ($i = 1; $i <= 2; $i++) {
                    $artworkImage = imagecreatetruecolor(800, 600);
                    $bgColor = imagecolorallocate($artworkImage, rand(50, 200), rand(50, 200), rand(50, 200));
                    imagefill($artworkImage, 0, 0, $bgColor);
                    
                    $tempArtworkPath = storage_path('app/temp_artwork_' . $artwork->id . '_' . $i . '.jpg');
                    imagejpeg($artworkImage, $tempArtworkPath, 90);
                    imagedestroy($artworkImage);
                    
                    $artwork->addMedia($tempArtworkPath)
                        ->toMediaCollection('images');
                    
                    unlink($tempArtworkPath);
                }
                
                $this->command->info('Added media for artwork: ' . $artwork->title);
            } catch (\Exception $e) {
                $this->command->error('Failed to add media for artwork ' . $artwork->title . ': ' . $e->getMessage());
            }
        }
        
        $this->command->info('Media seeding completed!');
    }
}

