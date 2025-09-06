<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        // Seed admin users
        $this->call(AdminSeeder::class);

        // Seed artists and their works
        $this->call(ArtistSeeder::class);
        $this->call(ArtistWorkSeeder::class);
        
        // Seed products
        $this->call(ProductSeeder::class);
        
        // Seed galleries
        $this->call(ArtPanelGallerySeeder::class);
        
        // Seed news
        $this->call(NewsSeeder::class);
    }
}
