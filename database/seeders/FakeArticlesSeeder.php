<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\News;
use Faker\Factory as Faker;
use Illuminate\Support\Str;

class FakeArticlesSeeder extends Seeder
{
    public function run()
    {
        $faker = Faker::create();
        
        // Array of article cover photos from Unsplash
        $articleCovers = [
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

        // Array of author photos from Unsplash
        $authorPhotos = [
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

        $articleTitles = [
            'The Evolution of Contemporary Art in the Digital Age',
            'Exploring Abstract Expressionism: A Deep Dive',
            'How Street Art is Reshaping Urban Landscapes',
            'The Renaissance of Traditional Painting Techniques',
            'Digital Art vs Traditional Art: Finding Balance',
            'The Impact of Social Media on Art Discovery',
            'Sustainable Art Practices: Eco-Friendly Materials',
            'The Psychology of Color in Modern Art',
            'Art Therapy: Healing Through Creative Expression',
            'The Rise of NFTs in the Art World',
            'Minimalism: Less is More in Contemporary Design',
            'The Influence of Cultural Heritage on Modern Artists',
            'Art Education in the 21st Century',
            'The Business of Art: Marketing for Artists',
            'Photography as Fine Art: Breaking Boundaries',
            'Sculpture in Public Spaces: Community Art Projects',
            'The Role of Art Critics in Shaping Taste',
            'Emerging Artists to Watch This Year',
            'Art Collecting for Beginners: A Complete Guide',
            'The Intersection of Technology and Creativity',
            'Women Artists Breaking Glass Ceilings',
            'The Global Art Market: Trends and Insights',
            'Art Restoration: Preserving Cultural Heritage',
            'The Philosophy Behind Abstract Art',
            'Creating Art on a Budget: Tips and Tricks',
            'The Importance of Art in Mental Health',
            'Virtual Galleries: The Future of Art Exhibition',
            'Color Theory: Understanding Visual Harmony',
            'The Story Behind Famous Art Movements',
            'Local Artists Making Global Impact'
        ];

        for ($i = 1; $i <= 50; $i++) {
            $title = $faker->randomElement($articleTitles) . ' - ' . $faker->year();
            $authorName = $faker->name();
            
            $article = News::create([
                'main_title' => $title,
                'sub_title' => $faker->sentence(6),
                'description' => $this->generateArticleContent($faker),
                'author_name' => $authorName,
                'created_at' => $faker->dateTimeBetween('-1 year', 'now'),
            ]);

            // Add cover image from Unsplash
            $coverUrl = $faker->randomElement($articleCovers);
            try {
                $article->addMediaFromUrl($coverUrl)
                    ->toMediaCollection('covers');
            } catch (\Exception $e) {
                // Skip if photo download fails
            }

            // Add author photo from Unsplash
            if ($faker->boolean(70)) { // 70% chance of having author photo
                $authorUrl = $faker->randomElement($authorPhotos);
                try {
                    $article->addMediaFromUrl($authorUrl)
                        ->toMediaCollection('authors');
                } catch (\Exception $e) {
                    // Skip if photo download fails
                }
            }
        }

        $this->command->info('Created 50 fake articles with cover images and author photos');
    }

    private function generateArticleContent($faker)
    {
        $content = "# Introduction\n\n";
        $content .= $faker->paragraphs(2, true) . "\n\n";
        
        $content .= "## The Current Landscape\n\n";
        $content .= $faker->paragraphs(3, true) . "\n\n";
        
        $content .= "### Key Points to Consider\n\n";
        for ($i = 0; $i < $faker->numberBetween(3, 5); $i++) {
            $content .= "- " . $faker->sentence() . "\n";
        }
        $content .= "\n";
        
        $content .= "## Historical Context\n\n";
        $content .= $faker->paragraphs(2, true) . "\n\n";
        
        $content .= "## Modern Applications\n\n";
        $content .= $faker->paragraphs(3, true) . "\n\n";
        
        $content .= "### Expert Insights\n\n";
        $content .= "> " . $faker->paragraph() . "\n\n";
        $content .= "*- " . $faker->name() . ", Art Critic*\n\n";
        
        $content .= "## Future Implications\n\n";
        $content .= $faker->paragraphs(2, true) . "\n\n";
        
        $content .= "## Conclusion\n\n";
        $content .= $faker->paragraph() . "\n";
        
        return $content;
    }
}
