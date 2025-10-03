# Professional Minimal Artist Profile

A clean, professional, and minimal artist profile page designed for showcasing artists in the most elegant way possible.

## Features

✨ **Professional & Minimal Design**
- Clean, centered layout with plenty of white space
- Elegant typography and subtle shadows
- Mobile-responsive design

🎨 **Artist Information Display**
- Large, prominent artist photo with elegant border
- Artist name with professional typography
- About section with readable formatting
- Specialties displayed as clean text

📞 **Contact Information**
- Email button with direct mailto link
- Phone button with direct tel link
- Website button opening in new tab
- All contact buttons with hover animations

🌐 **Social Media Integration**
- Instagram, Facebook, Twitter, LinkedIn support
- Clean icon buttons with hover effects
- Opens links in new tabs

🎨 **Artist Works Gallery**
- Instagram-style grid layout with square thumbnails
- Hover effects with View and Order buttons
- Professional full-screen gallery viewer
- Image carousel with navigation controls
- Pagination with "Show More" button

📱 **Mobile Optimized**
- Fully responsive design
- Touch-friendly buttons
- Optimized spacing for mobile devices
- Mobile-friendly gallery viewer

## Usage

### Route
The minimal artist profile is available at:
```
/artists/{artist-slug}/minimal
```

### Example URLs
- `/artists/john-doe/minimal`
- `/artists/jane-smith/minimal`

### Artist Data Structure
The component expects the following artist data structure:

```javascript
{
  artist_name: "Artist Name",
  bio: "Artist biography text...",
  specialties: "Painting, Sculpture, Digital Art", // comma-separated
  avatar_url: "https://example.com/avatar.jpg",
  avatar_thumb_url: "https://example.com/avatar-thumb.jpg",
  contact_email: "artist@example.com",
  phone: "+1234567890",
  link: "https://artist-website.com",
  social_links: {
    instagram: "https://instagram.com/artist",
    facebook: "https://facebook.com/artist",
    twitter: "https://twitter.com/artist",
    linkedin: "https://linkedin.com/in/artist"
  }
}
```

## Design Principles

### Minimalism
- Clean white background with subtle gray (#fafafa) page background
- Minimal use of colors - primarily using theme colors
- Generous white space for breathing room
- Single-column layout for focus

### Professional Appearance
- Large, circular artist photo (160px) with subtle shadow
- Professional typography hierarchy
- Consistent spacing and alignment
- Subtle hover animations for interactivity

### User Experience
- Clear navigation with back button
- Intuitive contact buttons
- Share functionality for easy sharing
- Loading states with skeleton components
- Error handling with user-friendly messages

## Customization

### Theme Integration
The component uses Material-UI theme colors:
- `theme.palette.primary.main` for primary elements
- `theme.palette.text.primary` for main text
- `theme.palette.text.secondary` for secondary text
- Alpha transparency for subtle backgrounds

### Responsive Breakpoints
- Mobile: Single column, centered content
- Tablet: Optimized button layouts
- Desktop: Maximum width container (md = 960px)

## Technical Details

### Dependencies
- React 19.1.0
- Material-UI 7.1.0
- React Router DOM 7.5.3
- Tabler Icons React 3.31.0

### Performance
- Lazy loading with React.lazy()
- Optimized images with avatar thumbnails
- Minimal re-renders with proper state management
- Skeleton loading for better perceived performance

### Accessibility
- Semantic HTML structure
- Proper ARIA labels
- Keyboard navigation support
- High contrast ratios
- Screen reader friendly

## Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## File Location
```
resources/js/views/website/ArtistProfileMinimal.jsx
```

## Integration
The component is automatically integrated into the routing system and can be accessed via the URL pattern mentioned above. No additional setup required.
