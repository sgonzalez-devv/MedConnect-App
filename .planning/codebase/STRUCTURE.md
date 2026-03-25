# Codebase Structure

**Analysis Date:** 2025-03-25

## Directory Layout

```
MedConnect/
├── app/                           # Next.js app router (app directory)
│   ├── (app)/                     # Route group for authenticated pages with sidebar layout
│   │   ├── bot-whatsapp/         # WhatsApp conversation management
│   │   ├── calendario/            # Calendar & appointment management
│   │   │   ├── nueva-cita/       # Create new appointment
│   │   │   ├── cita/[id]/        # Appointment detail view
│   │   │   └── page.tsx          # Calendar main page
│   │   ├── pacientes/            # Patient management
│   │   │   ├── [id]/             # Patient detail view
│   │   │   ├── nuevo/            # Create new patient
│   │   │   └── page.tsx          # Patient list page
│   │   ├── configuracion/        # Settings & configuration
│   │   ├── dashboard/            # Dashboard/home page
│   │   └── layout.tsx            # App layout wrapper (sidebar, header)
│   ├── login/                    # Login page (public)
│   ├── onboarding/               # Onboarding wizard (public)
│   ├── layout.tsx                # Root layout (HTML, global styles)
│   ├── page.tsx                  # Root page (redirects to /onboarding)
│   └── globals.css               # Global Tailwind CSS + custom utilities
├── components/                    # Reusable React components
│   ├── ui/                       # Radix UI primitives wrapped for Tailwind
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   ├── sidebar.tsx
│   │   ├── table.tsx
│   │   ├── tooltip.tsx
│   │   ├── dialog.tsx
│   │   └── ... (50+ UI components)
│   ├── app-sidebar.tsx           # Main navigation sidebar
│   ├── appointment-card.tsx      # Reusable appointment display component
│   ├── notification-panel.tsx    # Notification display component
│   ├── stats-card.tsx            # Statistics card component
│   ├── theme-provider.tsx        # Theme provider setup
│   └── ui/use-mobile.ts          # Mobile detection hook
├── hooks/                        # Custom React hooks
│   ├── use-mobile.ts            # Mobile viewport detection
│   └── use-toast.ts             # Toast notification hook
├── lib/                         # Utility functions and types
│   ├── types.ts                 # TypeScript type definitions
│   ├── mock-data.ts             # Mock data functions and fixtures
│   ├── date-utils.ts            # Date formatting utilities
│   ├── utils.ts                 # General utilities (cn, etc.)
│   └── cn.ts                    # Tailwind class name merger
├── public/                      # Static assets
│   ├── icon.svg
│   ├── icon-light-32x32.png
│   ├── icon-dark-32x32.png
│   ├── apple-icon.png
│   ├── placeholder-logo.svg
│   ├── placeholder.svg
│   └── ...
├── styles/                      # CSS styles
│   └── globals.css             # Global styles imported in root layout
├── .planning/                   # GSD planning documents
│   └── codebase/               # This folder (auto-generated)
├── tsconfig.json               # TypeScript configuration with @ path alias
├── next.config.mjs             # Next.js configuration
├── postcss.config.mjs          # PostCSS configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── components.json             # shadcn/ui configuration
├── package.json                # Dependencies & scripts
└── pnpm-lock.yaml             # Locked dependency versions
```

## Directory Purposes

**`app/(app)/`** (Authenticated Feature Routes):
- Purpose: All authenticated user pages with sidebar navigation
- Contains: Feature page files (page.tsx), dynamic routes ([id]/page.tsx), nested routes (nueva-cita/)
- Key files: 
  - `app/(app)/dashboard/page.tsx` - Main dashboard overview
  - `app/(app)/calendario/page.tsx` - Calendar view
  - `app/(app)/pacientes/page.tsx` - Patient list
  - `app/(app)/bot-whatsapp/page.tsx` - WhatsApp conversations
  - `app/(app)/configuracion/page.tsx` - Settings

**`app/(app)/layout.tsx`:**
- Purpose: Shared layout for authenticated pages
- Contains: SidebarProvider, AppSidebar component, header with navigation trigger
- Provides: Consistent sidebar + header + main content wrapper for all (app) routes

**`app/login/` & `app/onboarding/`:**
- Purpose: Public pages for authentication and user setup
- Contains: page.tsx files with full-width layouts (no sidebar)
- Key files:
  - `app/login/page.tsx` - Login form with email/password
  - `app/onboarding/page.tsx` - Multi-step setup wizard

**`components/ui/`:**
- Purpose: Design system primitives (Radix UI wrapped with Tailwind)
- Contains: 50+ UI components (Button, Card, Input, Dialog, Sidebar, Table, etc.)
- Pattern: Each component is a .tsx file exporting a default or named component
- Styling: Each wraps Radix primitive with className and forwardRef pattern

**`components/` (Feature Components):**
- Purpose: Complex, feature-specific components used across pages
- Key files:
  - `app-sidebar.tsx` - Navigation sidebar with menu items
  - `appointment-card.tsx` - Appointment display component
  - `notification-panel.tsx` - Notification display
  - `stats-card.tsx` - Statistics card

**`lib/types.ts`:**
- Purpose: TypeScript interfaces for all domain models
- Contains: Patient, Appointment, Notification, WhatsAppConversation, ConsultationNote, DoctorProfile, etc.
- Pattern: Strict interfaces with required fields and optional fields marked with `?`

**`lib/mock-data.ts`:**
- Purpose: Mock data fixtures and data-fetching functions
- Contains: 
  - Data arrays: `patients`, `doctorProfile`, `appointments`, `conversations`
  - Functions: `getTodayAppointments()`, `getPatientAppointments(id)`, `getConversationsWithPatients()`
- Pattern: Deterministic functions; seed with current date for today's appointments

**`lib/date-utils.ts`:**
- Purpose: Date formatting and calculation utilities
- Contains: Functions like `formatDateLong()`, `formatDateShort()`, `calculateAge()`, `formatDateWithWeekday()`
- Used by: Pages for displaying dates in Spanish

**`hooks/`:**
- Purpose: Custom React hooks for reusable logic
- Key files:
  - `use-mobile.ts` - Detect if viewport is mobile
  - `use-toast.ts` - Trigger toast notifications via Sonner

## Key File Locations

**Entry Points:**
- `app/layout.tsx`: Root HTML document, global CSS, Analytics
- `app/(app)/layout.tsx`: Sidebar layout for authenticated pages
- `app/page.tsx`: Redirect to `/onboarding`
- `app/login/page.tsx`: Login form
- `app/onboarding/page.tsx`: Setup wizard

**Configuration:**
- `tsconfig.json`: Path alias `@/*` maps to root directory
- `next.config.mjs`: Image optimization disabled, TypeScript errors ignored
- `tailwind.config.ts`: Tailwind color palette and plugins
- `components.json`: shadcn/ui CLI configuration
- `package.json`: Scripts (dev, build, start, lint), dependencies

**Core Logic:**
- `lib/types.ts`: All type definitions
- `lib/mock-data.ts`: Data layer; all state comes from here
- `app/(app)/dashboard/page.tsx`: Main dashboard (shows stats, today's appointments)
- `app/(app)/pacientes/page.tsx`: Patient list with search and dual view (table/grid)
- `app/(app)/calendario/page.tsx`: Calendar with month/day navigation

**Testing:**
- No test files detected in codebase

## Naming Conventions

**Files:**
- Route pages: `page.tsx` (Next.js convention)
- Dynamic routes: `[id].tsx` or `[id]/page.tsx`
- Components: PascalCase with `.tsx` extension (e.g., `AppSidebar.tsx`, `PatientCard.tsx`)
- Utilities: camelCase with functional suffix (e.g., `use-mobile.ts`, `date-utils.ts`)
- Types: PascalCase (e.g., `types.ts` exports `interface Patient`, `interface Appointment`)

**Directories:**
- Feature modules: kebab-case (e.g., `bot-whatsapp`, `nueva-cita`, `configuracion`)
- Component groups: lowercase (e.g., `ui/`, `hooks/`)
- Route groups: parentheses for no-URL-impact (e.g., `(app)`)

**Code:**
- Components: PascalCase function/export names (e.g., `export default function DashboardPage()`)
- Hooks: Prefix with `use` (e.g., `use-mobile`, `use-toast`)
- Types/Interfaces: PascalCase (e.g., `Patient`, `Appointment`)
- Variables: camelCase (e.g., `searchQuery`, `filteredPatients`, `isLoading`)
- Constants: UPPER_SNAKE_CASE (e.g., `DIAS_SEMANA`, `MESES` in calendario/page.tsx)

## Where to Add New Code

**New Feature Module:**
1. Create directory: `app/(app)/[feature-name]/`
2. Add page file: `app/(app)/[feature-name]/page.tsx` (client component with "use client")
3. Add types to: `lib/types.ts` if new domain model needed
4. Add mock data to: `lib/mock-data.ts` if test data needed
5. Add navigation to: `components/app-sidebar.tsx` mainNavItems array

**New Page within Feature:**
1. Create subdirectory: `app/(app)/[feature]/[subpage]/`
2. Add page file: `app/(app)/[feature]/[subpage]/page.tsx`
3. For dynamic routes: `app/(app)/[feature]/[id]/page.tsx`

**New Component (Reusable):**
1. If UI primitive: `components/ui/[component-name].tsx` (with Radix wrapper pattern)
2. If feature-specific: `components/[component-name].tsx`
3. Export as default or named; use forwardRef for primitives

**New Utility/Hook:**
1. Function utilities: `lib/[utility-name].ts` (e.g., `lib/string-utils.ts`)
2. Custom hooks: `hooks/use-[hook-name].ts` (e.g., `hooks/use-search.ts`)
3. Types: Always add to `lib/types.ts`, never create separate type files

**Form/Input Pages:**
1. Template: Copy pattern from `app/(app)/pacientes/nuevo/page.tsx`
2. Use React Hook Form + Zod for validation
3. Import UI components from `components/ui/`
4. Use `useRouter()` for navigation on submit

**API Integration (Future):**
- Create: `app/api/[route]/route.ts` (Next.js API route)
- Replace: Import calls in components from `lib/mock-data.ts`
- Keep mock data for development fallback

## Special Directories

**`.planning/`:**
- Purpose: GSD planning and analysis documents
- Generated: Yes (auto-created by orchestrator)
- Committed: Yes (reviewed as part of project documentation)

**`public/`:**
- Purpose: Static assets served at root path (e.g., `/icon.svg`)
- Generated: No
- Committed: Yes (icons, logos, placeholder images)

**`.next/`:**
- Purpose: Build output and cache
- Generated: Yes (by Next.js build)
- Committed: No (in .gitignore)

**`node_modules/`:**
- Purpose: Installed dependencies
- Generated: Yes (by npm/pnpm)
- Committed: No (in .gitignore)

---

*Structure analysis: 2025-03-25*
