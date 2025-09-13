<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Faker\Factory as Faker;

class FakeUsersSeeder extends Seeder
{
    public function run()
    {
        $faker = Faker::create();
        
        // Array of realistic profile photos from Unsplash
        $profilePhotos = [
            'https://images.unsplash.com/photo-1494790108755-2616b612b647?w=400',
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
            'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
            'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
            'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=400',
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
            'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400',
            'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400',
            'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400',
            'https://images.unsplash.com/photo-1557862921-37829c790f19?w=400',
            'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
            'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400',
            'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
            'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400',
            'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400',
            'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400',
            'https://images.unsplash.com/photo-1541101767792-f9b2b1c4f127?w=400',
            'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400'
        ];

        for ($i = 1; $i <= 50; $i++) {
            $user = User::create([
                'name' => $faker->name(),
                'email' => $faker->unique()->safeEmail(),
                'phone' => $faker->phoneNumber(),
                'password' => Hash::make('password123'),
                'newsletter_subscription' => $faker->boolean(30), // 30% chance of subscription
                'sms_notifications' => $faker->boolean(20), // 20% chance of SMS notifications
                'is_active' => $faker->boolean(90), // 90% chance of being active
                'email_verified_at' => $faker->boolean(80) ? now() : null,
                'created_at' => $faker->dateTimeBetween('-2 years', 'now'),
            ]);

            // Add profile photo from Unsplash
            if ($faker->boolean(70)) { // 70% chance of having a profile photo
                $photoUrl = $faker->randomElement($profilePhotos);
                try {
                    $user->addMediaFromUrl($photoUrl)
                        ->toMediaCollection('avatar');
                } catch (\Exception $e) {
                    // Skip if photo download fails
                    continue;
                }
            }
        }

        $this->command->info('Created 50 fake users with profile photos');
    }
}
