<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Admin;
use Illuminate\Support\Facades\Hash;
use Faker\Factory as Faker;

class FakeAdminsSeeder extends Seeder
{
    public function run()
    {
        $faker = Faker::create();
        
        // Array of professional profile photos from Unsplash
        $adminPhotos = [
            'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400',
            'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
            'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400',
            'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400',
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
            'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400',
            'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
            'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400',
            'https://images.unsplash.com/photo-1541101767792-f9b2b1c4f127?w=400',
            'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400',
            'https://images.unsplash.com/photo-1494790108755-2616b612b647?w=400',
            'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
            'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=400',
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
            'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400',
            'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400',
            'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400',
            'https://images.unsplash.com/photo-1557862921-37829c790f19?w=400'
        ];

        for ($i = 1; $i <= 50; $i++) {
            $admin = Admin::create([
                'name' => $faker->name(),
                'email' => $faker->unique()->safeEmail(),
                'password' => Hash::make('admin123'),
                'role' => 'super_admin', // All admins are super_admin as per requirements
                'is_active' => $faker->boolean(95), // 95% chance of being active
                'created_at' => $faker->dateTimeBetween('-1 year', 'now'),
            ]);

            // Add profile photo from Unsplash
            if ($faker->boolean(80)) { // 80% chance of having a profile photo
                $photoUrl = $faker->randomElement($adminPhotos);
                try {
                    $admin->addMediaFromUrl($photoUrl)
                        ->toMediaCollection('avatar');
                } catch (\Exception $e) {
                    // Skip if photo download fails
                    continue;
                }
            }
        }

        $this->command->info('Created 50 fake admins with profile photos');
    }
}
