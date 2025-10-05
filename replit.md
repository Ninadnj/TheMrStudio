# Beauty & Wellness Booking Website

## Overview

A modern beauty salon booking website built with React, Express, and PostgreSQL, featuring an elegant, editorial-style design. The application provides a multi-staff booking system for over 60 services across categories like Nail and Epilation, with bilingual Georgian/English pricing. It includes an expandable services gallery, an integrated booking form, and a Gemini AI-powered chatbot for bilingual customer support. The administrative panel allows management of hero content, services, staff assignments, and site settings. The entire public-facing website is fully translated into Georgian, emphasizing a sophisticated, minimalist aesthetic designed to build trust and guide users to booking actions.

## User Preferences

Preferred communication style: Simple, everyday language.

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
- **Multi-Staff Booking System**: Allows clients to select services and preferred staff members, with smart filtering based on staff qualifications. Supports 2-hour appointments available daily from 8:00 AM to 6:00 PM at 2-hour intervals (last booking at 18:00). Google Calendar integration creates 2-hour appointments.
- **Services Display**: Displays 60+ real services with bilingual Georgian/English names and prices, organized by expandable categories in a responsive 2-column grid.
- **Photo Gallery**: Features three categories (Nails, Laser, Cosmetology) with expandable sections and a responsive image grid.
- **Admin Panel**: Provides secure, PostgreSQL-backed session authentication (admin/admin123) with persistent login across server restarts. Accessible at `/admin`, `/admin/login`, or `/admin/dashboard`. Offers CRUD operations for hero content, services, gallery images, staff management (including Google Calendar ID preparation), special offers, and site settings. Sessions stored in PostgreSQL with 24-hour expiration, httpOnly cookies, and secure flag in production.
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