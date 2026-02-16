# Vertigogo - Legal Services Platform

## Overview
Vertigogo connects clients needing legal help with law firms. The platform features AI-powered PDF analysis, anonymized case descriptions, partner pool with map visualization, and secure messaging. Cases are matched to agencies by legal area specialization.

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
- `shared/schema.ts` - Database schema, types, and LEGAL_AREAS/PRICE_RANGES/LANGUAGES constants
- `server/routes.ts` - All API endpoints including logo upload, reviews, stats
- `server/storage.ts` - Database storage layer with getOpenCasesForAgency, reviews CRUD, stats
- `server/db.ts` - Database connection
- `client/src/App.tsx` - Main app with routing
- `client/src/pages/` - All page components
- `client/src/components/` - Shared components

## User Roles
- **Client**: Free. Can upload cases, browse partners, message agencies, leave reviews
- **Agency**: 995 SEK/month via Stripe. Can view cases matching specialties, send inquiries, message clients

## Database Tables
- `users` - Replit Auth user accounts
- `sessions` - Auth sessions
- `user_profiles` - Role selection (client/agency)
- `agency_profiles` - Law firm profiles with location/specialties/offices/logoUrl/foundedYear/languages/priceRange/barAssociationMember/responseTimeHours
- `agency_reviews` - Client reviews with rating (1-5) and comment
- `cases` - Client cases with AI summaries, legalArea, hasInsurance, estimatedAmount
- `case_inquiries` - Agency responses to cases
- `direct_messages` - In-app messaging

## Case-Agency Matching
- AI extracts `legalArea` from uploaded PDF documents (one of the LEGAL_AREAS values)
- Agencies specify their specializations (from same LEGAL_AREAS list)
- Agency dashboard only shows cases where case.legalArea matches agency.specialties
- LEGAL_AREAS defined in shared/schema.ts (17 Swedish legal areas)

## Agency Features
- Logo upload via POST /api/agency/logo (stored in uploads/logos/)
- Multiple office locations via JSON `offices` field
- Primary office (city/address/lat/lng) + additional offices array
- Specialties are required to save profile
- Founded year, languages spoken, price range, bar association membership, response time
- Ratings & reviews from clients (1-5 stars + comment)
- Case statistics (number of inquiries handled via Vertigogo)

## Partner Discovery Features
1. **Ratings & Reviews** - Star ratings (1-5) with written reviews from clients
2. **Response Time** - Average response time shown on cards and detail pages
3. **Years of Experience** - Calculated from founded year
4. **Languages** - Array of languages the firm can serve clients in
5. **Case Statistics** - Count of cases handled via the platform
6. **Price Range** - Budget-vänlig / Medel / Premium
7. **Bar Association** - Advokatsamfundet membership indicator (shield icon)

## API Routes
- GET /api/agencies - All agencies
- GET /api/agencies/:id - Single agency
- GET /api/agencies/:id/reviews - Agency reviews
- GET /api/agencies/:id/stats - Agency stats (avgRating, reviewCount, caseCount)
- POST /api/reviews - Submit a review (client only)

## Recent Changes
- 2026-02-15: Initial build - all core features implemented
- Seeded 12 Swedish law firms with Swedish specializations and multi-office support
- AI prompt extracts legalArea for case-agency matching (JSON response format)
- Added insuranceType (4 options: Hemförsäkring, Företagsförsäkring, Nej har ingen försäkring, Nej jag betalar själv) and estimatedAmount fields to cases
- Added logo upload and multiple offices to agency profiles
- Added Vertigogo review notice on case creation form
- Redesigned with light #f3f4f8 background, white headers/sections, Baskervville font, pill buttons
- Renamed app from Vertogogo to Vertigogo
- Added 7 partner evaluation features: ratings/reviews, response time, years of experience, languages, case stats, price range, bar association membership
- Seeded demo reviews and updated all 12 agencies with new profile fields
- Added optional contactEmail/contactPhone fields to cases for client notification
- Integrated Resend for email notifications when agencies inquire on cases (server/email.ts)
- 2026-02-16: Added settings page (/settings) for clients with profile details view, newsletter opt-in toggle, and account deletion with confirmation dialog
- Added newsletterOptIn field to user_profiles, API endpoints: GET/PATCH /api/settings, DELETE /api/account
- Settings link added to client navigation bar and user dropdown menu
- Added agency case preferences: minCaseAmount, maxCaseAmount, acceptedInsuranceTypes fields to agency_profiles
- Changed case insurance from boolean (hasInsurance) to enum string (insuranceType) with 4 options
- Agency matching now filters by specialties + amount range + insurance type preferences
- INSURANCE_TYPES and AMOUNT_RANGES constants defined in shared/schema.ts
- Agency profile setup includes "Ärendepreferenser" section with amount range inputs and insurance type badges
- Added notification email per office: notificationEmail field on agency_profiles (primary office) and in offices JSON (additional offices)
- When cases are published (draft→open), matching agencies receive email notifications at all configured office notification emails
- Agency case dismiss feature with confirmation dialog (warns if ongoing conversation exists)
- sendNewCaseNotification function in server/email.ts for notifying agencies about new matching cases
- Agency selection feature: clients can select a winning agency for their case, closing it
- selectedAgencyId field on cases table tracks which agency was chosen
- Case status changes: open→closed when agency selected, closed→open when selection reverted
- API endpoints: POST /api/cases/:id/select-agency, POST /api/cases/:id/deselect-agency
- Email notifications: selected agency notified, non-selected agencies notified, all parties notified on revert
- Agency dashboard shows "Tilldelat" badge on won cases, agency case detail shows won/lost banners
- Client case detail: "Välj denna byrå" button on each inquiry, confirmation dialog, "Ångra val" button when case closed
