# Beauty & Wellness Booking Website

## Overview
A modern beauty salon booking website with an elegant, editorial design. The application provides a multi-staff booking system for over 60 services across categories, featuring bilingual Georgian/English pricing. Key capabilities include an expandable services gallery, an integrated booking form, and a Gemini AI-powered chatbot for bilingual customer support. An administrative panel allows for comprehensive management of hero content, services, staff assignments, and site settings. The public-facing website is fully translated into Georgian, focusing on a sophisticated, minimalist aesthetic to build trust and drive booking actions.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built with React 18+ and TypeScript, using Vite for bundling and Wouter for routing. It leverages Shadcn/ui (Radix UI and Tailwind CSS) for its component system, following atomic design principles. Styling is handled by Tailwind CSS with design tokens for light and dark themes and self-hosted fonts (see `design_guidelines.md`). State management uses TanStack Query for server state and local React state for UI, employing a responsive, mobile-first design.

### Backend Architecture
The backend is an Express.js application written in TypeScript, utilizing ESM modules and a middleware-based request/response pipeline. It provides a RESTful API with centralized route registration and robust error handling. All data operations are performed via PostgreSQL using Drizzle ORM with an abstract storage interface. Session management for persistent admin authentication uses PostgreSQL-backed sessions via connect-pg-simple.

### Database Architecture
Drizzle ORM manages type-safe database operations and schema, employing a schema-first approach with Drizzle-Zod for runtime validation. The database schema includes entities for `users`, `staff`, `bookings`, `services`, `site_settings`, `hero_content`, `services_section`, `special_offers`, `gallery_images`, `trends`, and `trends_section`. PostgreSQL is integrated via the Neon serverless driver for scalable access. All CRUD operations utilize database queries for data persistence. Database seeding occurs automatically on first run with guard logic to prevent duplicates, and session persistence is handled by connect-pg-simple.

### UI/UX Decisions
Design rules, tokens and component specs live in `design_guidelines.md` — that file is the single source of truth; tokens are implemented in `client/src/index.css`.

In short: quiet editorial luxury (references: Aesop, The Row, Byredo). Palette of ivory, porcelain, linen, espresso and ink with champagne and a little gold used like jewellery; espresso night in dark mode. Typography pairs Instrument Serif and BPG Nino Mtavruli for display with Geist and Noto Sans Georgian for text, all self-hosted; Georgian body text is never all caps. Desktop uses an editorial 12-column layout; mobile is app-like with a bottom tab bar as the only floating element. Booking runs in a bottom sheet on phones and a two-column panel on desktop, ending in an "invitation card" confirmation. Motion uses one easing (cubic-bezier(0.22, 1, 0.36, 1)), opacity-and-rise or mask reveals only, and honours prefers-reduced-motion. Georgian is the primary language; every string goes through `t(ka, en)`.

### Feature Specifications
- **Multi-Staff Booking System**: Allows clients to select services and staff, with smart filtering and an admin approval workflow. Supports Google Calendar integration for real-time availability and event creation.
- **Booking Management Admin Panel**: Dedicated "Bookings" tab for managing pending and confirmed bookings, allowing admins to approve, reject, modify, or delete requests. Delete functionality removes both the booking record and the associated Google Calendar event.
- **Services Display**: Showcases 60+ bilingual Georgian/English services, organized by expandable categories in a responsive grid.
- **Photo Gallery**: Features three categories (Nails, Laser, Cosmetology) with expandable sections and a responsive image grid.
- **Admin Panel**: Provides secure, PostgreSQL-backed session authentication for comprehensive CRUD operations across all content, staff, bookings, and site settings.
- **Special Offers Banner**: A promotional banner system for seasonal offers, configurable via the admin panel with custom messages, links, and expiry dates.
- **AI-Powered Chat Assistant**: A bilingual (Georgian/English) Google Gemini AI chatbot for customer support, service inquiries, and booking assistance.
- **Persistent Image Storage**: Implemented using Replit App Storage (Google Cloud Storage) with Uppy for image uploads, presigned URLs, and automatic ACL policy management for public access.

## External Dependencies

- **Frameworks**: React, Express, TypeScript, Vite.
- **Database & ORM**: @neondatabase/serverless (PostgreSQL driver), drizzle-orm, drizzle-zod, connect-pg-simple.
- **UI & Styling**: @radix-ui/react-***, shadcn/ui, tailwindcss, cmdk, embla-carousel-react.
- **State Management**: @tanstack/react-query, wouter.
- **Form Handling**: react-hook-form, zod, @hookform/resolvers.
- **Utilities**: date-fns, clsx, lucide-react, nanoid.
- **Development Tools**: tsx, esbuild, @replit/vite-plugin-***.
- **Fonts**: Self-hosted in `client/public/fonts` — Instrument Serif, Geist, Noto Sans Georgian, BPG Nino Mtavruli.
- **AI Integration**: @google/genai (Google Gemini AI SDK).
- **External Services**: Neon Database, Google Gemini AI (requires `GEMINI_API_KEY`), Replit App Storage (Google Cloud Storage), Uppy (@uppy/core, @uppy/react, @uppy/dashboard, @uppy/aws-s3).