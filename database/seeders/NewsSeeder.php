<?php

namespace Database\Seeders;

use App\Models\News;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class NewsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $news = [
            [
                'main_title' => 'New Contemporary Art Gallery Opens Downtown',
                'sub_title' => 'Featuring works from local and international artists',
                'description' => 'We are excited to announce the opening of our new contemporary art gallery in the heart of downtown. The gallery will feature rotating exhibitions showcasing both emerging local talent and established international artists. The opening exhibition, "Urban Reflections," explores how city life influences modern artistic expression through various mediums including painting, sculpture, and digital installations.',
                'author_name' => 'Sarah Johnson',
            ],
            [
                'main_title' => 'Artist Spotlight: Maria Rodriguez',
                'sub_title' => 'Exploring cultural identity through mixed media',
                'description' => 'This month, we shine a spotlight on Maria Rodriguez, a talented mixed-media artist whose work explores themes of cultural identity and belonging. Rodriguez combines traditional techniques with contemporary materials to create powerful pieces that speak to the immigrant experience. Her latest series, "Between Worlds," features large-scale installations that invite viewers to walk through recreated spaces representing different cultural environments.',
                'author_name' => 'Michael Chen',
            ],
            [
                'main_title' => 'Art Panel Workshop Series Begins Next Month',
                'sub_title' => 'Learn professional techniques from master artists',
                'description' => 'Join us for an exciting series of hands-on workshops where you can learn professional art panel techniques from master artists. The workshop series covers various methods including canvas preparation, color theory, composition, and finishing techniques. Whether you\'re a beginner or an experienced artist looking to refine your skills, these workshops offer valuable insights into the craft of panel art creation.',
                'author_name' => 'Elena Vasquez',
            ],
            [
                'main_title' => 'Digital Art Revolution: NFTs and Beyond',
                'sub_title' => 'How blockchain technology is changing the art world',
                'description' => 'The art world is experiencing a digital revolution with the rise of NFTs (Non-Fungible Tokens) and blockchain technology. This transformation is not just about digital ownership, but about creating new forms of artistic expression and connecting artists directly with collectors worldwide. Our upcoming exhibition will explore how digital artists are pushing boundaries and creating entirely new art forms that exist purely in the digital realm.',
                'author_name' => 'David Park',
            ],
            [
                'main_title' => 'Sustainable Art Practices: Going Green',
                'sub_title' => 'Environmental consciousness in contemporary art',
                'description' => 'As environmental awareness grows, artists are increasingly incorporating sustainable practices into their work. From using recycled materials to exploring themes of climate change, contemporary artists are leading the conversation about environmental responsibility. This article explores how sustainable art practices are not just good for the planet, but are also inspiring innovative new artistic techniques and materials.',
                'author_name' => 'Jennifer Green',
            ],
            [
                'main_title' => 'Virtual Gallery Tours Now Available',
                'sub_title' => 'Experience our exhibitions from anywhere in the world',
                'description' => 'We are proud to announce the launch of our virtual gallery tour platform, allowing art lovers from around the world to experience our exhibitions online. Using cutting-edge 360-degree photography and interactive technology, visitors can explore our galleries, zoom in on artworks, and access detailed information about each piece. The virtual tours also include audio commentary from curators and artists.',
                'author_name' => 'Alex Thompson',
            ]
        ];

        foreach ($news as $newsData) {
            News::create($newsData);
        }
    }
}