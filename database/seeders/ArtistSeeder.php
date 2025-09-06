<?php

namespace Database\Seeders;

use App\Models\Artist;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ArtistSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $artists = [
            [
                'artist_name' => 'Leonardo da Vinci',
                'bio' => 'Leonardo da Vinci was an Italian Renaissance polymath whose areas of interest included invention, painting, drawing, architecture, science, music, mathematics, engineering, literature, anatomy, geology, astronomy, botany, writing, history, and cartography.',
                'link' => 'https://example.com/leonardo',
                'slug' => 'leonardo-da-vinci',
                'is_active' => true,
                'social_links' => [
                    'instagram' => '@leonardo_art',
                    'twitter' => '@leonardo_da_vinci',
                    'website' => 'https://leonardo-art.com'
                ],
                'contact_email' => 'leonardo@example.com',
                'phone' => '+1-555-0101',
                'specialties' => 'Renaissance painting, sculpture, engineering, anatomy',
                'commission_rate' => 15.00,
            ],
            [
                'artist_name' => 'Vincent van Gogh',
                'bio' => 'Vincent Willem van Gogh was a Dutch post-impressionist painter who posthumously became one of the most famous and influential figures in the history of Western art.',
                'link' => 'https://example.com/vangogh',
                'slug' => 'vincent-van-gogh',
                'is_active' => true,
                'social_links' => [
                    'instagram' => '@vangogh_art',
                    'facebook' => 'Vincent van Gogh Official'
                ],
                'contact_email' => 'vincent@example.com',
                'phone' => '+1-555-0102',
                'specialties' => 'Post-impressionism, oil painting, landscape, portraits',
                'commission_rate' => 20.00,
            ],
            [
                'artist_name' => 'Pablo Picasso',
                'bio' => 'Pablo Ruiz Picasso was a Spanish painter, sculptor, printmaker, ceramicist and theatre designer who spent most of his adult life in France.',
                'link' => 'https://example.com/picasso',
                'slug' => 'pablo-picasso',
                'is_active' => true,
                'social_links' => [
                    'instagram' => '@picasso_art',
                    'twitter' => '@pablo_picasso',
                    'website' => 'https://picasso-gallery.com'
                ],
                'contact_email' => 'pablo@example.com',
                'phone' => '+1-555-0103',
                'specialties' => 'Cubism, modern art, sculpture, ceramics',
                'commission_rate' => 25.00,
            ],
            [
                'artist_name' => 'Frida Kahlo',
                'bio' => 'Frida Kahlo was a Mexican artist who painted many portraits, self-portraits and works inspired by the nature and artifacts of Mexico.',
                'link' => 'https://example.com/frida',
                'slug' => 'frida-kahlo',
                'is_active' => true,
                'social_links' => [
                    'instagram' => '@frida_kahlo_art',
                    'facebook' => 'Frida Kahlo Museum'
                ],
                'contact_email' => 'frida@example.com',
                'phone' => '+1-555-0104',
                'specialties' => 'Self-portraits, surrealism, Mexican folk art',
                'commission_rate' => 18.00,
            ],
            [
                'artist_name' => 'Claude Monet',
                'bio' => 'Oscar-Claude Monet was a French painter, a founder of French Impressionist painting and the most consistent and prolific practitioner of the movement\'s philosophy.',
                'link' => 'https://example.com/monet',
                'slug' => 'claude-monet',
                'is_active' => true,
                'social_links' => [
                    'instagram' => '@monet_impressions',
                    'website' => 'https://monet-gardens.com'
                ],
                'contact_email' => 'claude@example.com',
                'phone' => '+1-555-0105',
                'specialties' => 'Impressionism, landscape painting, water lilies, plein air',
                'commission_rate' => 22.00,
            ],
        ];

        foreach ($artists as $artistData) {
            Artist::create($artistData);
        }
    }
}
