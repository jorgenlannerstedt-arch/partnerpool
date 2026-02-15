# Vertigogo - Legal Services Platform

## Overview
Vertigogo connects clients needing legal help with law firms. The platform features AI-powered PDF analysis, anonymized case descriptions, partner pool with map visualization, and secure messaging.

## Architecture
- **Frontend**: React + Vite + TailwindCSS + shadcn/ui components
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL (Neon-backed via Replit)
- **Auth**: Replit Auth (Google/Apple/email login)
- **AI**: Anthropic Claude (claude-sonnet-4-5) via Replit AI Integrations
- **Payments**: Stripe (995 SEK/month for agencies)
- **Maps**: Leaflet (free, no API key)

## Design System
- **Design**: Clean, light professional aesthetic
- **Fonts**: Baskervville (serif headings), Open Sans (body text)
- **Colors**: Light background (#f3f4f8), neutral dark primary, blue accent (#0082f3 / HSL 210 90% 49%)
- **Style**: Pill-shaped buttons (rounded-full), white header/footer, light sections
- **Language**: All UI text in Swedish

## Key Files
- `shared/schema.ts` - Database schema and types
- `server/routes.ts` - All API endpoints
- `server/storage.ts` - Database storage layer
- `server/db.ts` - Database connection
- `client/src/App.tsx` - Main app with routing
- `client/src/pages/` - All page components
- `client/src/components/` - Shared components

## User Roles
- **Client**: Free. Can upload cases, browse partners, message agencies
- **Agency**: 995 SEK/month via Stripe. Can view cases, send inquiries, message clients

## Database Tables
- `users` - Replit Auth user accounts
- `sessions` - Auth sessions
- `user_profiles` - Role selection (client/agency)
- `agency_profiles` - Law firm profiles with location/specialties
- `cases` - Client cases with AI summaries
- `case_inquiries` - Agency responses to cases
- `direct_messages` - In-app messaging

## Recent Changes
- 2026-02-15: Initial build - all core features implemented
- Seeded 12 Swedish law firms for partner pool
- Switched AI from OpenAI to Anthropic Claude (claude-sonnet-4-5)
- Translated all UI text to Swedish
- Redesigned with light #f3f4f8 background, white headers/sections, Baskervville font, pill buttons
- Renamed app from Vertogogo to Vertigogo
