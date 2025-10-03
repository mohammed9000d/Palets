<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Setting;

class SettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $defaultSettings = [
            [
                'key' => 'site_name',
                'value' => 'Palets',
                'type' => 'string',
                'description' => 'Website name displayed in header and title'
            ],
            [
                'key' => 'site_description',
                'value' => 'Art Gallery Management System - Discover and collect beautiful artworks from talented artists',
                'type' => 'string',
                'description' => 'Website description for SEO and general information'
            ],
            [
                'key' => 'dark_mode',
                'value' => '0',
                'type' => 'boolean',
                'description' => 'Enable dark mode theme for the website'
            ]
        ];

        foreach ($defaultSettings as $setting) {
            Setting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}