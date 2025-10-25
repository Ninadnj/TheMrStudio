# Beauty & Wellness Booking Website

## Overview

A modern beauty salon booking website built with React, Express, and PostgreSQL, featuring an elegant, editorial-style design. The application provides a multi-staff booking system for over 60 services across categories like Nail and Epilation, with bilingual Georgian/English pricing. It includes an expandable services gallery, an integrated booking form, and a Gemini AI-powered chatbot for bilingual customer support. The administrative panel allows management of hero content, services, staff assignments, and site settings. The entire public-facing website is fully translated into Georgian, emphasizing a sophisticated, minimalist aesthetic designed to build trust and guide users to booking actions.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes & Bug Fixes

### October 2025
- **Next-Gen Motion Enhancements**: Elevated visuals with cursor-tracked 3D tilt effects on gallery images (±10° rotation following pointer), Framer Motion-powered staggered animations (0.05s gallery, 0.15s services), smooth category transitions (150ms fade), and luxury minimalist spacing. Gallery and Services sections now feature fluid scroll-triggered animations, enhanced typography scaling (up to 6xl), and unified transform system preventing CSS/JS conflicts. All motion effects use Framer Motion's spring physics for premium, editorial feel.
- **Ultra-Modern Design Transformation**: Complete visual redesign with editorial aesthetic, featuring Playfair Display typography for headlines, premium glass effects on header, smooth hover interactions (lift, zoom, border accents), and generous white space. Modern effects include: parallax scrolling hero, scroll progress indicator, magnetic buttons, ripple click effects, animated gradients, image reveal animations, skeleton loading states, and smooth scroll-triggered fade-ins. All functionality preserved.
- **Admin Password Updated**: Changed default admin password to "Wadisheni1." for enhanced security.
- **Two-Way Google Calendar Sync**: Website now reads from Google Calendar to check availability, preventing double-bookings when staff manually add events. Uses Freebusy API to query all staff calendars in batch. Properly converts times to Asia/Tbilisi timezone. Gracefully falls back to database-only if Calendar API unavailable.
- **Enhanced Service Update Validation**: Added Zod schema validation to service update endpoint with proper error handling and logging for better data integrity.
- **Fixed Staff Management Bug**: Corrected `apiRequest` parameter order in StaffEditor component. All CRUD operations (create, update, delete) now work correctly with Georgian characters. Backend validation added for proper error handling.
- **Fixed Booking Availability Logic**: Time slots now correctly block based on full booking duration, not just start time. Handles edge cases like mid-hour bookings (e.g., 12:45 + 30min properly blocks both 12:00 and 13:00).
- **Fixed Booking Modification Bug**: Changing only duration no longer sets time field to undefined.
- **Email Notifications**: Admin receives instant email alerts for new bookings (requires EMAIL_USER/EMAIL_PASS in Secrets, admin email configured in Settings tab).

## System Architecture

### Frontend Architecture
The frontend uses React 18+ with TypeScript, Vite for bundling, and Wouter for routing. It leverages Shadcn/ui (built on Radix UI and Tailwind CSS) for its component system, following atomic design principles. Styling is handled by Tailwind CSS with a custom theme supporting three switchable color themes (Ivory Noir, Nude Minimal, Cool Spa) and Google Fonts (Playfair Display, Cormorant Garamond, Inter, Neue Haas Grotesk). State management relies on TanStack Query for server state and local React state for UI, employing responsive, mobile-first design.

### Backend Architecture
The backend is built with Express.js and TypeScript, using ESM modules and a middleware-based request/response pipeline. It features a RESTful API with centralized route registration and robust error handling. An abstract storage interface allows for flexible data operations, with an in-memory storage implementation for development and preparation for PostgreSQL integration via Drizzle ORM. Session management uses PostgreSQL-backed sessions via connect-pg-simple for persistence across server restarts.

### Database Architecture
Drizzle ORM is used for type-safe database operations and schema management, with a schema-first approach and Drizzle-Zod for runtime validation. The current schema includes a `users` table and is designed to expand with `services`, `appointments`, and `pricing` tables. PostgreSQL is integrated via the Neon serverless driver with WebSocket configuration for scalable and edge-compatible database access. Session persistence is managed via connect-pg-simple with automatic session table creation in PostgreSQL.

### UI/UX Decisions
The design emphasizes sophisticated minimalism inspired by premium beauty brands, focusing on trust-building, breathing room, and clear visual hierarchy. It utilizes switchable color themes, elegant typography, and a responsive image gallery. All public-facing content is available in Georgian with selected English branding elements. Service category cards feature a clean, text-only design without decorative icons to maintain the understated, elegant aesthetic.

### Feature Specifications
- **Multi-Staff Booking System with Admin Approval Workflow**: Allows clients to select services and preferred staff members, with smart filtering based on staff qualifications. Business hours: 10:00 AM to 8:00 PM (20:00) with hourly time slots. Default appointment duration is 1.5 hours (90 minutes). Bookings start with "pending" status and require admin approval before confirmation. Admin can modify booking time and duration (30min, 1h, 1.5h, 2h, 3h) before approving. Google Calendar integration: creates events upon admin approval AND reads from staff calendars to show real-time availability (prevents double-booking when staff manually add events to Google Calendar).
- **Booking Management Admin Panel**: Dedicated "Bookings" tab (first tab in admin dashboard) with separate sections for pending and confirmed bookings. Admins can approve, reject (with optional reason), or modify (time/duration) pending booking requests. Approved bookings automatically move to confirmed section and create Google Calendar events.
- **Services Display**: Displays 60+ real services with bilingual Georgian/English names and prices, organized by expandable categories in a responsive 2-column grid.
- **Photo Gallery**: Features three categories (Nails, Laser, Cosmetology) with expandable sections and a responsive image grid.
- **Admin Panel**: Provides secure, PostgreSQL-backed session authentication (admin/Wadisheni1.) with persistent login across server restarts. Accessible at `/admin`, `/admin/login`, or `/admin/dashboard`. Offers CRUD operations for bookings (approve/reject/modify), hero content, services, gallery images, staff management (including Google Calendar ID preparation), special offers, and site settings. Sessions stored in PostgreSQL with 24-hour expiration, httpOnly cookies, and secure flag in production.
- **Special Offers Banner**: Promotional banner system for seasonal offers (Christmas, New Year, etc.). Admin can create offers with custom messages, optional links, and expiry dates. Active offers display at the top of the homepage with dismiss functionality. Supports smooth scroll to sections via anchor links.
- **AI-Powered Chat Assistant**: A bilingual (Georgian/English) Google Gemini AI chatbot provides customer support, answers service inquiries, assists with booking, and provides location/contact information.

## External Dependencies

- **Frameworks**: React, Express, TypeScript, Vite.
- **Database & ORM**: @neondatabase/serverless (PostgreSQL driver), drizzle-orm, drizzle-zod, connect-pg-simple (PostgreSQL session store).
- **UI & Styling**: @radix-ui/react-*** (headless UI primitives), shadcn/ui, class-variance-authority, tailwindcss, cmdk, embla-carousel-react (carousel).
- **State Management**: @tanstack/react-query (server state), wouter (routing).
- **Form Handling**: react-hook-form, zod, @hookform/resolvers.
- **Utilities**: date-fns, clsx, lucide-react (icons), nanoid.
- **Development Tools**: tsx, esbuild, @replit/vite-plugin-***.
- **Fonts**: Google Fonts (Playfair Display, Cormorant Garamond, Inter, Neue Haas Grotesk) via CDN.
- **AI Integration**: @google/genai (Google Gemini AI SDK for chatbot).
- **External Services**: Neon Database (serverless PostgreSQL with WebSocket), Google Gemini AI (requires `GEMINI_API_KEY`), Unsplash (placeholder images). PostgreSQL session store configured via connect-pg-simple for admin authentication persistence.