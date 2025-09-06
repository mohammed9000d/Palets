<?php

namespace Database\Seeders;

use App\Models\ArtPanelGallery;
use App\Models\Artist;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class ArtPanelGallerySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get artists for relationships
        $artists = Artist::take(5)->get();
        
        $galleries = [
            [
                'organizer_artist_id' => $artists->first()?->id,
                'main_title' => 'Contemporary Expressions 2024',
                'sub_title' => 'A Journey Through Modern Art',
                'overview' => 'An exciting exhibition featuring contemporary works from emerging and established artists, exploring themes of identity, technology, and human connection in the modern world.',
                'description' => "## Exhibition Highlights\n\n**Contemporary Expressions 2024** brings together diverse voices in modern art, showcasing how today's artists interpret our rapidly changing world.\n\n### Featured Themes\n- **Digital Age Identity**: How technology shapes who we are\n- **Urban Landscapes**: City life through artistic eyes\n- **Cultural Fusion**: Blending traditional and modern techniques\n\n### Special Events\n- **Opening Reception**: March 15, 6-9 PM\n- **Artist Talks**: Every Saturday at 2 PM\n- **Workshops**: Hands-on sessions with featured artists",
                'start_date' => Carbon::now()->addDays(15),
                'end_date' => Carbon::now()->addDays(45),
                'status' => 'published',
                'location' => 'Downtown Art Center, Gallery Wing A',
                'slug' => 'contemporary-expressions-2024'
            ],
            [
                'organizer_artist_id' => $artists->skip(1)->first()?->id,
                'main_title' => 'Nature\'s Canvas',
                'sub_title' => 'Environmental Art Showcase',
                'overview' => 'A powerful exhibition exploring the relationship between art and nature, featuring works created from sustainable materials and addressing climate change themes.',
                'description' => "## Environmental Consciousness Through Art\n\n**Nature's Canvas** presents works that not only celebrate the natural world but also challenge us to think about our environmental impact.\n\n### Sustainable Art Practices\n- **Recycled Materials**: Art from repurposed objects\n- **Natural Pigments**: Colors derived from plants and minerals\n- **Zero Waste**: Sustainable creation processes\n\n### Interactive Installations\n- **Living Wall**: Growing art that changes over time\n- **Rain Collection**: Water-powered kinetic sculptures\n- **Solar Panels**: Light-responsive installations",
                'start_date' => Carbon::now()->addDays(30),
                'end_date' => Carbon::now()->addDays(75),
                'status' => 'published',
                'location' => 'EcoArt Gallery, Main Hall',
                'slug' => 'natures-canvas'
            ],
            [
                'organizer_artist_id' => $artists->skip(2)->first()?->id,
                'main_title' => 'Abstract Visions',
                'sub_title' => 'Color, Form, and Emotion',
                'overview' => 'An immersive exploration of abstract art, where color and form transcend representation to evoke pure emotion and psychological response.',
                'description' => "## The Language of Abstraction\n\n**Abstract Visions** invites viewers to experience art beyond the literal, where color becomes music and form becomes poetry.\n\n### Artistic Movements\n- **Color Field Painting**: Large-scale color experiences\n- **Geometric Abstraction**: Mathematical beauty in art\n- **Expressionist Abstraction**: Emotional color and gesture\n\n### Sensory Experience\n- **Immersive Rooms**: 360-degree color environments\n- **Sound Integration**: Music that responds to visual art\n- **Touch Stations**: Tactile art experiences for all abilities",
                'start_date' => Carbon::now()->subDays(10),
                'end_date' => Carbon::now()->addDays(20),
                'status' => 'published',
                'location' => 'Modern Art Museum, East Wing',
                'slug' => 'abstract-visions'
            ],
            [
                'organizer_artist_id' => null,
                'main_title' => 'Digital Renaissance',
                'sub_title' => 'AI and Human Creativity',
                'overview' => 'A groundbreaking exhibition exploring the intersection of artificial intelligence and human creativity, featuring collaborative works between artists and AI systems.',
                'description' => "## The Future of Artistic Creation\n\n**Digital Renaissance** examines how artificial intelligence is transforming the creative process, while celebrating the irreplaceable human element in art.\n\n### AI-Human Collaborations\n- **Machine Learning Paintings**: AI-assisted compositions\n- **Algorithmic Sculptures**: Code-generated 3D forms\n- **Interactive Installations**: Responsive digital environments\n\n### Ethical Discussions\n- **Authorship Questions**: Who creates AI-assisted art?\n- **Creative Process**: Human intuition vs. machine logic\n- **Future Implications**: The evolving role of artists",
                'start_date' => Carbon::now()->addDays(60),
                'end_date' => Carbon::now()->addDays(120),
                'status' => 'published',
                'location' => 'TechArt Center, Innovation Lab',
                'slug' => 'digital-renaissance'
            ],
            [
                'organizer_artist_id' => $artists->skip(3)->first()?->id,
                'main_title' => 'Cultural Crossroads',
                'sub_title' => 'Global Perspectives in Art',
                'overview' => 'A celebration of cultural diversity through art, featuring works from artists representing different continents, traditions, and artistic philosophies.',
                'description' => "## Unity in Diversity\n\n**Cultural Crossroads** celebrates the rich tapestry of global artistic traditions while exploring how different cultures influence and inspire each other.\n\n### Continental Showcases\n- **African Heritage**: Traditional and contemporary African art\n- **Asian Influences**: Eastern philosophy in visual form\n- **European Traditions**: Classical meets modern European art\n- **Americas Collection**: Indigenous and contemporary American art\n\n### Cultural Exchange\n- **Artist Residencies**: International artist collaborations\n- **Traditional Workshops**: Learn authentic techniques\n- **Cultural Dialogues**: Panel discussions on art and identity",
                'start_date' => Carbon::now()->subDays(30),
                'end_date' => Carbon::now()->subDays(5),
                'status' => 'published',
                'location' => 'International Arts Center',
                'slug' => 'cultural-crossroads'
            ],
            [
                'organizer_artist_id' => $artists->skip(4)->first()?->id,
                'main_title' => 'Emerging Voices',
                'sub_title' => 'New Artists Showcase',
                'overview' => 'A platform for emerging artists to showcase their innovative works and fresh perspectives on contemporary issues and artistic expression.',
                'description' => "## The Next Generation\n\n**Emerging Voices** provides a platform for new artists to share their unique perspectives and innovative approaches to art-making.\n\n### Fresh Perspectives\n- **Student Showcases**: Recent art school graduates\n- **Self-taught Artists**: Unconventional artistic journeys\n- **Cross-disciplinary**: Artists from other fields bringing new ideas\n\n### Mentorship Program\n- **Established Artist Guidance**: Pairing emerging with experienced artists\n- **Career Development**: Workshops on the business of art\n- **Networking Events**: Building artistic communities",
                'start_date' => Carbon::now()->addDays(90),
                'end_date' => Carbon::now()->addDays(135),
                'status' => 'draft',
                'location' => 'Emerging Artists Gallery',
                'slug' => 'emerging-voices'
            ]
        ];

        foreach ($galleries as $galleryData) {
            $gallery = ArtPanelGallery::create($galleryData);
            
            // Add participating artists (2-4 random artists per gallery)
            $participatingArtists = $artists->random(rand(2, 4));
            $roles = ['Featured Artist', 'Guest Artist', 'Participant', 'Collaborator'];
            
            foreach ($participatingArtists as $index => $artist) {
                $gallery->artists()->attach($artist->id, [
                    'role' => $roles[array_rand($roles)],
                    'display_order' => $index
                ]);
            }
        }
    }
}