# Design Guidelines: Modern Beauty & Wellness Booking Website

## Design Approach
**Reference-Based Design** inspired by premium beauty and wellness brands (Glossier, MR Nail & Laser Studio, high-end spa websites). Focus on elegance, trust-building, and effortless booking experience.

## Core Design Principles
- Sophisticated minimalism with breathing room
- Soft, calming aesthetic that conveys professionalism
- Clear visual hierarchy guiding users to booking
- Gallery-first price transparency

## Color Palette

**Light Mode (Primary):**
- Background: 48 8% 97% (warm off-white)
- Surface: 48 15% 93% (soft beige)
- Primary: 28 70% 92% → 155 45% 88% (peach-to-sage gradient for CTAs)
- Text Primary: 28 25% 15% (warm dark brown)
- Text Secondary: 28 15% 40%
- Accent: 155 35% 65% (muted sage green)

**Dark Mode:**
- Background: 28 20% 12%
- Surface: 28 18% 16%
- Text Primary: 48 8% 95%
- Maintain gradient accents with adjusted opacity

## Typography

**Font Families:**
- Headings: 'Playfair Display' (serif, elegant) - Google Fonts
- Subheadings: 'Cormorant Garamond' (serif, lighter)
- Body: 'Inter' (sans-serif, clean) - Google Fonts
- Buttons/UI: 'Inter' (medium weight)

**Scale:**
- Hero Headline: text-6xl (60px) font-serif
- Section Headers: text-4xl (36px) font-serif
- Service Titles: text-2xl (24px) font-serif
- Body Text: text-base (16px) leading-relaxed
- Button Text: text-sm uppercase tracking-wider

## Layout System

**Spacing Units:** Tailwind units of 4, 6, 8, 12, 16, 20, 24, 32
- Section padding: py-20 lg:py-32
- Component spacing: gap-8 to gap-12
- Container: max-w-7xl mx-auto px-6

**Grid System:**
- Services: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Price Gallery: horizontal scroll with snap points
- Booking Form: Single column, max-w-2xl centered

## Component Library

### Hero Section
- Full-width gradient overlay background (120vh height)
- Centered content with brand name in large serif typography
- Elegant tagline beneath
- Two gradient CTA buttons (Book Now primary, View Services secondary)
- Subtle scroll indicator at bottom

### Services Showcase
- Card-based layout with subtle shadows (shadow-sm hover:shadow-md)
- Each card: Icon, service name, short description, price, duration
- Rounded corners (rounded-2xl)
- Hover effect: slight lift and shadow increase

### Booking Form
- Floating label inputs with soft borders
- Gradient submit button matching hero CTAs
- Date picker with calendar UI
- Service dropdown with visual previews
- Multi-step feel with clear progress (optional visual indicator)

### Price Lists Gallery
- Horizontal scrolling carousel with snap-scroll-x
- Each price photo in rounded card (aspect-video or 4:3)
- Navigation arrows on desktop, swipe on mobile
- Photo captions with service category labels
- Blurred background for contrast

### Navigation
- Sticky header with logo left, nav links center, booking CTA right
- Transparent initially, becomes solid on scroll with backdrop blur
- Mobile: hamburger menu with full-screen overlay

### Footer
- Three-column layout: About, Quick Links, Contact Info
- Social media icons
- Newsletter signup with inline form
- Subtle top border, generous padding

## Images

### Hero Background
Large, elegant hero image showing clean, modern beauty studio interior or close-up of professional service. Should convey luxury and cleanliness. Apply soft gradient overlay (peach to sage, 40% opacity) to ensure text readability.

### Services Section
Each service card includes a subtle icon (use Heroicons - spa, sparkles, heart, clock icons). Consider adding small accent images for featured services.

### Price Lists Gallery
Primary feature: User-uploaded price list photos displayed in scrollable gallery. Minimum 4-6 placeholder cards showing different service categories (nails, laser, facial, etc.). Each card should maintain consistent aspect ratio and rounded borders.

## Animations
- Minimal, tasteful animations only
- Fade-in on scroll for service cards (staggered)
- Smooth gradient transitions on CTA buttons (300ms)
- Gentle hover lifts (transform: translateY(-4px))
- No auto-playing carousels or distracting movements

## Accessibility
- Consistent dark mode across all form inputs
- Minimum contrast ratio 4.5:1 for all text
- Focus states with visible outlines (ring-2 ring-accent)
- Aria labels for all interactive elements
- Keyboard navigation for gallery carousel

## Key Differentiators
- Soft gradient aesthetics (not harsh or vibrant)
- Serif typography for sophistication
- Gallery-first pricing transparency
- Warm, welcoming color palette avoiding clinical blues
- Generous whitespace creating premium feel