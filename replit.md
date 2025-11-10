# Beauty & Wellness Booking Website

## Overview
A modern beauty salon booking website with an elegant, editorial design. The application provides a multi-staff booking system for over 60 services across categories, featuring bilingual Georgian/English pricing. Key capabilities include an expandable services gallery, an integrated booking form, and a Gemini AI-powered chatbot for bilingual customer support. An administrative panel allows for comprehensive management of hero content, services, staff assignments, and site settings. The public-facing website is fully translated into Georgian, focusing on a sophisticated, minimalist aesthetic to build trust and drive booking actions.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built with React 18+ and TypeScript, using Vite for bundling and Wouter for routing. It leverages Shadcn/ui (Radix UI and Tailwind CSS) for its component system, following atomic design principles. Styling is handled by Tailwind CSS with a custom theme supporting three switchable color themes and Google Fonts. State management uses TanStack Query for server state and local React state for UI, employing a responsive, mobile-first design.

### Backend Architecture
The backend is an Express.js application written in TypeScript, utilizing ESM modules and a middleware-based request/response pipeline. It provides a RESTful API with centralized route registration and robust error handling. All data operations are performed via PostgreSQL using Drizzle ORM with an abstract storage interface. Session management for persistent admin authentication uses PostgreSQL-backed sessions via connect-pg-simple.

### Database Architecture
Drizzle ORM manages type-safe database operations and schema, employing a schema-first approach with Drizzle-Zod for runtime validation. The database schema includes entities for `users`, `staff`, `bookings`, `services`, `site_settings`, `hero_content`, `services_section`, `special_offers`, `gallery_images`, `trends`, and `trends_section`. PostgreSQL is integrated via the Neon serverless driver for scalable access. All CRUD operations utilize database queries for data persistence. Database seeding occurs automatically on first run with guard logic to prevent duplicates, and session persistence is handled by connect-pg-simple.

### UI/UX Decisions
The design embodies sophisticated minimalism, inspired by premium beauty brands, emphasizing trust, ample whitespace, and clear visual hierarchy. It features switchable color themes, elegant typography, and a responsive image gallery. All public-facing content is available in Georgian with selected English branding elements. Service category cards maintain a clean, text-only design for an understated, elegant aesthetic. Motion enhancements include cursor-tracked 3D tilt effects, Framer Motion-powered staggered animations, and fluid scroll-triggered effects for a premium, editorial feel.

### Feature Specifications
- **Multi-Staff Booking System**: Allows clients to select services and staff, with smart filtering and an admin approval workflow. Supports Google Calendar integration for real-time availability and event creation.
- **Booking Management Admin Panel**: Dedicated "Bookings" tab for managing pending and confirmed bookings, allowing admins to approve, reject, modify, or delete requests. Delete functionality removes both the booking record and the associated Google Calendar event.
- **Services Display**: Showcases 60+ bilingual Georgian/English services, organized by expandable categories in a responsive grid.
- **Photo Gallery**: Features three categories (Nails, Laser, Cosmetology) with expandable sections and a responsive image grid.
- **Trends Section**: A dynamic "What's Trendy Now" section for lookbooks and seasonal highlights, fully customizable and managed via the admin panel with bilingual support for headings and content.
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
- **Fonts**: Google Fonts (Playfair Display, Cormorant Garamond, Inter, Neue Haas Grotesk).
- **AI Integration**: @google/genai (Google Gemini AI SDK).
- **External Services**: Neon Database, Google Gemini AI (requires `GEMINI_API_KEY`), Replit App Storage (Google Cloud Storage), Uppy (@uppy/core, @uppy/react, @uppy/dashboard, @uppy/aws-s3).