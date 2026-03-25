# External Integrations

**Analysis Date:** 2026-03-25

## APIs & External Services

**Analytics:**
- Vercel Analytics - Web analytics and monitoring
  - SDK/Client: `@vercel/analytics` 1.6.1
  - Implementation: `app/layout.tsx` imports `Analytics` component from `@vercel/analytics/next`
  - Usage: Server-side component injected at root layout level

## Data Storage

**Databases:**
- Not detected - No database client configured (no Prisma, Supabase, Firebase, etc.)

**Data Management:**
- Mock Data - Development data hardcoded in `lib/mock-data.ts`
  - Contains sample patients, appointments, consultations, and notifications
  - No persistence layer or API backend

**Client-side Storage:**
- Browser sessionStorage - Temporary session state
  - Used in: `app/(app)/bot-whatsapp/page.tsx`
  - Key: `"whatsapp-onboarding-shown"` - Tracks WhatsApp onboarding state

**File Storage:**
- Local filesystem only - No cloud storage integration
- Images unoptimized in Next.js config (deployment on non-Vercel platform presumed)

**Caching:**
- Not detected - No caching layer configured

## Authentication & Identity

**Auth Provider:**
- Custom or placeholder - No third-party auth service integrated
- Login page exists: `app/login/page.tsx`
- Onboarding page exists: `app/onboarding/page.tsx`
- No OAuth, Firebase Auth, Clerk, Auth0, or Supabase Auth detected

## Real-time Communication

**WebSockets:**
- Not detected

**Polling/Webhooks:**
- Not detected

**WhatsApp Integration:**
- WhatsApp Bot page present: `app/(app)/bot-whatsapp/page.tsx`
- UI for WhatsApp communication visible
- No actual WhatsApp API client configured (e.g., twilio, meta-whatsapp-api)
- Client-side message state management via React hooks and sessionStorage

## Monitoring & Observability

**Error Tracking:**
- Not detected (no Sentry, Rollbar, Bugsnag configured)

**Logs:**
- Browser console - Default logging approach
- No centralized logging service

**Performance Monitoring:**
- Vercel Analytics - Web vitals tracking

## CI/CD & Deployment

**Hosting:**
- Next.js application (deployable to any Node.js host or Vercel)
- Configured for self-hosted or third-party deployment
- Images unoptimized (not Vercel-specific optimization)

**CI Pipeline:**
- Not detected - No GitHub Actions, GitLab CI, or similar configured

## Email & Messaging

**Email Service:**
- Not detected - No SendGrid, Mailgun, AWS SES, or similar integrated

**SMS:**
- Not detected

**Push Notifications:**
- Not detected

## External APIs Called

**Third-party API Clients:**
- Not detected - No API consumption patterns found
- All data flows through local mock data system

## Environment Configuration

**Required env vars:**
- None explicitly defined - Application appears frontend-only with mock data
- No `.env` or `.env.example` file in root directory

**Secrets location:**
- Not applicable (no external integrations requiring secrets)

## API Endpoints (Internal)

**API Routes:**
- Not detected - No `/api` directory or route handlers found
- Application uses client-side data only (mock data from `lib/mock-data.ts`)

## Medical Data Integrations

**Health Records:**
- Not detected - No EHR/EMR system integration (HL7, FHIR, etc.)

**Pharmacy Integration:**
- Not detected - No pharmacy system API integration

**Lab Systems:**
- Not detected - No lab information system integration

**Insurance:**
- Not detected - No insurance verification or claims API

## Form & Validation Services

**Form Handling:**
- React Hook Form 7.54.1 - Client-side form state management
  - Used for appointment creation, patient forms
  - Integration: `@hookform/resolvers` 3.9.1

**Validation:**
- Zod 3.24.1 - TypeScript-first schema validation
  - Applied to form inputs and data structures
  - No server-side validation detected

## Calendar & Scheduling

**Calendar Service:**
- None detected - Calendar built with custom React component
- Uses react-day-picker 9.13.2 for date selection
- Local state management via React hooks

## Third-party Data Sources

**Patient Records:**
- Mock data only - `lib/mock-data.ts`

**Appointments:**
- Mock data only - Stored in memory, functions in `lib/mock-data.ts`

**Medical Attachments:**
- Not implemented - Type defined but no file upload/storage

## Component Libraries (UI)

**Radix UI Primitives:**
- 26+ Radix UI packages (v1.1-2.2)
- Provides accessible, headless component foundations
- Used through shadcn/ui component wrapper

**Icon Library:**
- Lucide React 0.564.0 - 564+ SVG icons

## Chart & Visualization

**Charts:**
- Recharts 2.15.0 - React charting library
- Used for medical data visualization (vital signs, appointment analytics)

## Date & Time

**Date Library:**
- date-fns 4.1.0 - Date manipulation, formatting
- Custom date utilities in: `lib/date-utils.ts`
- Functions: `formatDateWithWeekday()`, `formatDateShort()`, `calculateAge()`

---

## Integration Summary

**External Service Dependencies:** 1
- Vercel Analytics (optional monitoring)

**Internal Data Sources:** 1
- Mock data system (no backend)

**Status:** MVP/Demo
- No real backend APIs
- No database integration
- No third-party service integrations
- All data is frontend-only and ephemeral
- Suitable for prototyping and UI development only

---

*Integration audit: 2026-03-25*
