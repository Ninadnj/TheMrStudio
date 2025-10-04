# Beauty & Wellness Booking Website

## Overview

A modern beauty salon booking website built with React, Express, and PostgreSQL. The application features an elegant, editorial-style landing page inspired by premium beauty brands like Glossier and MR Nail & Laser Studio, with a focus on sophisticated minimalism and effortless booking experiences.

**Full Georgian Translation**: The entire public-facing website is now in Georgian language, with only "THE MR studio" branding and footer credits remaining in English as requested. This includes hero content, services, booking forms, footer, and chat assistant UI.

The application showcases 60+ real services with Georgian/English bilingual pricing organized by category (Nail, Epilation). Features include a multi-staff booking system where clients can select services and preferred staff members, an expandable services gallery with real pricing, and an integrated booking form. A Gemini AI-powered chatbot offers bilingual customer support. The admin panel enables management of hero content, services, staff assignments, and site settings. The design emphasizes trust-building, breathing room, and clear visual hierarchy guiding users toward booking actions.

## Recent Changes

### October 4, 2025 - Photo Gallery Feature
- **Gallery Section Added**: New photo gallery (გალერეა) with three categories
  - ფრჩხილები (Nails) - Showcase nail art and manicure work
  - ლაზერი (Laser) - Display laser treatment results
  - კოსმეტოლოგია (Cosmetology) - Present cosmetology services
- **Admin Gallery Management**: Full CRUD interface in admin panel
  - Upload images by URL with preview
  - Organize by category with custom ordering
  - Edit and delete gallery images
- **Public Display**: Expandable category sections with responsive image grid
- **Navigation Updated**: Added გალერეა link to main navigation menu
- **Database Schema**: New galleryImages table with category, imageUrl, and order fields

### October 4, 2025 - Complete Georgian Translation
- **Full Georgian Language Implementation**: All public-facing content translated to Georgian
- **Hero Section**: Description and CTA buttons in Georgian
- **Services Section**: Header and all UI text in Georgian (service descriptions remain bilingual)
- **Booking Form**: All labels, placeholders, validation messages, and toast notifications in Georgian
- **Footer**: Description, quick links, contact info headings all in Georgian
- **Chat Widget**: UI already bilingual, defaults to Georgian
- **English Exceptions Preserved**: 
  - "THE MR" in hero title
  - "Nail & Laser Studio" subtitle in hero
  - "Where Beauty Meets Precision" tagline in hero
  - "© 2025 THE MR Nail & Laser Studio. All Rights Reserved." in footer
  - "THE MR Studio" in chat widget header
  - "Created by The DNJ™ with 🤍 &" in footer credits
- **Contact Email Updated**: Changed to Studiomrmr1@gmail.com across the site
- **Admin Panel**: Kept in English (internal tool for staff use)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build Tools:**
- React 18+ with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing

**UI Component System:**
- Shadcn/ui component library (Radix UI primitives with Tailwind CSS styling)
- "New York" style variant with customized design tokens
- Component architecture follows atomic design principles with separation into base UI components and page-level components

**Styling Approach:**
- Tailwind CSS for utility-first styling with custom theme configuration
- CSS variables for dynamic theming (supports light/dark mode via `data-theme` attribute)
- Three switchable color themes: Ivory Noir (default), Nude Minimal, and Cool Spa
- Design system uses custom spacing, typography, and color tokens defined in `tailwind.config.ts`
- Google Fonts integration: Playfair Display/Cormorant Garamond (serif headings), Inter (body text), Neue Haas Grotesk (editorial styling)

**State Management:**
- TanStack Query (React Query) for server state management and API data fetching
- Local React state for component-level UI state
- Custom hooks for reusable stateful logic (e.g., `use-toast`, `use-mobile`)

**Key Design Patterns:**
- Component composition using Radix UI's slot pattern
- Controlled vs uncontrolled component patterns for forms (React Hook Form integration)
- Responsive design with mobile-first approach
- Theme switching via CSS variables and HTML data attributes

### Backend Architecture

**Server Framework:**
- Express.js with TypeScript for type-safe API development
- ESM modules throughout the codebase
- Middleware-based request/response pipeline

**Development Setup:**
- Vite middleware integration for HMR during development
- Custom logging middleware for API request tracking
- Static file serving for production builds
- Replit-specific plugins for development tooling

**API Design:**
- RESTful API structure with `/api` prefix for all endpoints
- Centralized route registration in `server/routes.ts`
- Error handling middleware with standardized error responses
- Session management prepared (connect-pg-simple dependency present)

**Storage Layer:**
- Abstract storage interface (`IStorage`) for data operations
- In-memory storage implementation (`MemStorage`) for development/testing
- Prepared for PostgreSQL integration via Drizzle ORM
- CRUD methods defined for user management (extensible for bookings, services, etc.)

### Database Architecture

**ORM & Schema Management:**
- Drizzle ORM for type-safe database operations
- Schema-first approach with TypeScript types auto-generated from database schema
- Drizzle-Zod integration for runtime validation matching database constraints

**Database Schema (Current):**
- `users` table with UUID primary keys, username/password authentication fields
- Schema defined in `shared/schema.ts` for sharing between client and server
- Migration support via `drizzle-kit push` command

**Planned Schema (Based on Application):**
- Services table (nail treatments, laser procedures, facials, etc.)
- Appointments/bookings table with customer info, service selection, date/time
- Pricing/packages table for service offerings
- Customer/contact records for booking history

**Connection Strategy:**
- PostgreSQL via Neon serverless driver for edge-compatible database access
- Connection string configured via `DATABASE_URL` environment variable
- Production-ready pooling and connection management

### Rationale for Key Decisions

**Shadcn/ui Over Complete UI Library:**
- Provides copy-paste component ownership rather than dependency lock-in
- Full customization control for unique beauty brand aesthetic
- Built on Radix UI primitives for accessibility compliance
- Reduces bundle size by including only used components

**Vite Over Create React App:**
- Significantly faster HMR and build times for better developer experience
- Native ESM support aligns with modern JavaScript practices
- Better tree-shaking and optimization for production
- More flexible plugin ecosystem

**In-Memory Storage Initially:**
- Allows rapid prototyping without database setup complexity
- Easy to swap for persistent storage via interface pattern
- Simplifies testing and local development

**Drizzle ORM Over Prisma:**
- Lighter weight with minimal runtime overhead
- SQL-like query builder feels more natural for complex queries
- Better TypeScript inference without code generation step
- Edge-compatible for serverless deployment options

**React Query for Data Fetching:**
- Automatic caching and background refetching
- Optimistic updates for better perceived performance
- Built-in loading and error states
- Reduces boilerplate compared to manual fetch management

## External Dependencies

### Core Framework Dependencies
- **React & React DOM**: ^18.x - UI framework
- **Express**: Latest - Backend web server
- **TypeScript**: Latest - Type safety across full stack
- **Vite**: Latest - Build tool and dev server

### Database & ORM
- **@neondatabase/serverless**: ^0.10.4 - PostgreSQL driver for Neon
- **drizzle-orm**: ^0.39.1 - Type-safe ORM
- **drizzle-zod**: ^0.7.0 - Zod schema generation from Drizzle schemas
- **connect-pg-simple**: ^10.0.0 - PostgreSQL session store for Express

### UI Component Libraries
- **@radix-ui/react-***: ^1.x - Headless UI primitives (20+ component packages)
- **class-variance-authority**: ^0.7.1 - Component variant management
- **tailwindcss**: Latest - Utility-first CSS framework
- **cmdk**: ^1.1.1 - Command palette/search interface
- **embla-carousel-react**: ^8.6.0 - Carousel component

### State Management & Data Fetching
- **@tanstack/react-query**: ^5.60.5 - Server state management
- **wouter**: Latest - Lightweight routing

### Form Handling
- **react-hook-form**: Latest (via @hookform/resolvers) - Form state management
- **zod**: Latest - Schema validation
- **@hookform/resolvers**: ^3.10.0 - Form validation resolvers

### Utilities
- **date-fns**: ^3.6.0 - Date manipulation and formatting
- **clsx**: ^2.1.1 - Conditional className utilities
- **lucide-react**: Latest - Icon library
- **nanoid**: Latest - Unique ID generation

### Development Tools
- **tsx**: Latest - TypeScript execution for Node.js
- **esbuild**: Latest - Fast JavaScript bundler for server code
- **@replit/vite-plugin-***: Latest - Replit-specific development tooling

### Google Fonts (Loaded via CDN)
- Playfair Display - Elegant serif for headings
- Cormorant Garamond - Lighter serif for subheadings
- Inter - Clean sans-serif for body text
- Neue Haas Grotesk - Editorial display font

### AI Integration
- **@google/genai**: Google Gemini AI SDK for chatbot functionality
- **Gemini 2.0 Flash Exp**: Latest Gemini model with Georgian language support
- Bilingual chatbot (Georgian/English) for customer assistance
- Configured with studio information, services, pricing, and booking details

### External Services (Prepared/Future)
- **Neon Database**: Serverless PostgreSQL hosting (connection ready)
- **Google Gemini AI**: Chatbot service (active, requires GEMINI_API_KEY)
- **Image CDN**: Unsplash URLs currently used for placeholder images (to be replaced with actual service photos)
- **Session Store**: PostgreSQL-backed sessions via connect-pg-simple (configured but not actively used)

## Features

### Multi-Staff Booking System
- **Service Categories**: Nail (manicure, pedicure, design - 17 services) and Epilation (laser hair removal - 45 services)
- **Staff Assignments**: 4 staff members with service category specializations
  - Mari (Nail - order 1)
  - User 1 (Nail - order 2)
  - User 2 (Cosmetology - order 3, no services yet)
  - User 3 (Epilation - order 4)
- **Smart Staff Filtering**: When a service is selected, only staff members qualified for that service category are shown
- **Category Alignment**: Service categories exactly match staff categories (Nail, Epilation, Cosmetology)
- **Booking Data**: Each booking includes staffId, staffName, service name, date, time, and customer details

### Services Display
- **Real Pricing**: 62 real services with bilingual Georgian/English names and prices in ₾ (Georgian Lari)
- **Expandable Categories**: Accordion-style layout with category headers showing icons and descriptions
- **Organized by Category**: Services grouped and sorted by order within Nail and Epilation categories
- **2-Column Grid**: Service items displayed in responsive grid with service name and price
- **Bilingual**: Section header "სერვისები და ფასები / Services & Pricing"

### Photo Gallery
- **Three Categories**: ფრჩხილები (Nails), ლაზერი (Laser), კოსმეტოლოგია (Cosmetology)
- **Expandable Sections**: Accordion-style layout with category headers and image counts
- **Responsive Grid**: Images displayed in 2-4 column grid based on screen size
- **Admin Upload**: Upload images via URL with live preview
- **Custom Ordering**: Set display order for each image within its category
- **Public Display**: Georgian section heading "გალერეა" with bilingual subtitle

### Admin Panel
- **Secure Authentication**: Bcrypt password hashing (10 rounds) with session-based auth
- **5 Management Tabs**:
  1. **Hero Content**: Edit hero title, subtitle, and CTA
  2. **Services**: CRUD operations for services (currently 62 loaded)
  3. **Gallery**: Upload and manage gallery images by category
  4. **Staff**: CRUD operations for staff with service category assignments
  5. **Settings**: Site-wide configuration
- **Staff Management**: Add/edit/delete staff, assign to service categories, set display order, prepare Google Calendar IDs
- **Gallery Management**: Upload images by URL, preview, organize by category, set display order
- **Default Credentials**: username=admin, password=admin123 (⚠️ change in production)

### AI-Powered Chat Assistant
- **Bilingual Support**: Seamlessly switches between Georgian (ქართული) and English
- **Service Information**: Answers questions about nail services, laser treatments, facials, and body care
- **Booking Assistance**: Helps customers understand booking process and requirements
- **Location & Contact**: Provides studio address and contact information
- **Smart Responses**: Powered by Google Gemini AI with context-aware answers
- **Error Handling**: Localized error messages with toast notifications
- **Validation**: Zod schema validation for message structure and language constraints