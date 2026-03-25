# Architecture

**Analysis Date:** 2025-03-25

## Pattern Overview

**Overall:** Client-side rendered SPA (Single Page Application) using Next.js 16 with React 19, following a feature-based directory structure with server-side layout composition and client-side state management.

**Key Characteristics:**
- Full-stack React application (React Server Components in layouts, client components for interactive pages)
- Feature modules organized by domain (calendario, pacientes, bot-whatsapp, configuracion)
- UI component library built on Radix UI primitives with Tailwind CSS styling
- Mock data layer (`@/lib/mock-data`) providing API-like interface
- Client-side state management using React hooks (useState, useRouter, usePathname)
- Type-safe with TypeScript and Zod schema definitions
- Theme support via next-themes with light/dark mode
- Responsive design with mobile-first Tailwind approach

## Layers

**Presentation Layer (Pages & Components):**
- Purpose: Render UI and handle user interactions
- Location: `app/(app)/*/page.tsx` for feature pages, `components/` for reusable UI
- Contains: Page components (client-side), UI primitives, layout compositions
- Depends on: Utility hooks, mock data, UI components
- Used by: Next.js router, browsers

**UI Component Layer:**
- Purpose: Provide consistent, accessible design system components
- Location: `components/ui/*` (Radix UI wrappers), `components/*.tsx` (feature-specific components)
- Contains: Button, Card, Input, Select, Dialog, Tooltip, Sidebar, etc. with Tailwind styling
- Depends on: Radix UI, Tailwind CSS, lucide-react icons
- Used by: All page components and other components

**Data Layer:**
- Purpose: Provide domain models and mock data
- Location: `lib/types.ts` (type definitions), `lib/mock-data.ts` (data source)
- Contains: Type definitions (Patient, Appointment, Notification, etc.), mock functions
- Depends on: None (pure data)
- Used by: Pages, components for reading/displaying data

**Utility Layer:**
- Purpose: Provide helper functions and hooks
- Location: `lib/date-utils.ts`, `lib/utils.ts`, `hooks/use-*.ts`
- Contains: Date formatting, string utilities, custom hooks
- Depends on: date-fns for date handling
- Used by: Pages, components

**Layout Layer:**
- Purpose: Provide navigation shell and consistent layout structure
- Location: `app/layout.tsx` (root), `app/(app)/layout.tsx` (app shell)
- Contains: HTML root setup, sidebar navigation, header
- Depends on: Sidebar component, theme provider
- Used by: All pages under (app) route group

## Data Flow

**Page Load Flow:**

1. User navigates to route (e.g., `/dashboard`)
2. Next.js matches route to page.tsx in route group
3. Page component (client-side) renders and calls hooks
4. Hooks may import data from `@/lib/mock-data`
5. Mock data functions return arrays/objects with full domain models
6. Component filters/sorts/transforms data using array methods
7. UI components render with processed data
8. User interactions trigger state updates or navigation

**Example: Dashboard Page (`app/(app)/dashboard/page.tsx`):**
```
User visits /dashboard
  → DashboardPage renders (client-side)
  → Imports getTodayAppointments(), patients, notifications from mock-data
  → Calls these functions to get data
  → Filters: todayAppointments, unreadNotifications, activeConversations
  → Maps over filtered data to render Card, AppointmentCard components
  → Components render with Radix UI primitives + Tailwind
```

**State Management:**
- Local component state: `useState()` for form inputs, UI toggles, view preferences
- Navigation state: `useRouter()`, `usePathname()` for routing
- No global state management (Redux, Zustand, Context API)
- Data flows down as props; no lifting state across pages
- Each page is independent and self-contained

**Example: Patient Search (`app/(app)/pacientes/page.tsx`):**
```
Local state: searchQuery, viewMode
Search filter: patients.filter((patient) => fullName.includes(searchQuery))
View mode toggle: conditional rendering of Table vs Grid
Navigation: Link href="/pacientes/nuevo" for creating patients
```

## Key Abstractions

**Feature Modules:**
- Purpose: Group related functionality by domain (calendar, patients, WhatsApp)
- Examples: `app/(app)/calendario/`, `app/(app)/pacientes/`, `app/(app)/bot-whatsapp/`
- Pattern: Each module has its own pages and sub-routes; no shared feature state

**Route Groups:**
- Purpose: Organize routes without affecting URL structure
- Examples: `app/(app)/` wraps authenticated feature pages; `app/login`, `app/onboarding` separate
- Pattern: Layout wrapper shared by all routes in group

**Mock Data Functions:**
- Purpose: Simulate API responses for development
- Examples: `getTodayAppointments()`, `getPatientAppointments(patientId)`, `getConversationsWithPatients()`
- Pattern: Functions are deterministic, return full domain objects with relations

**Type Definitions:**
- Purpose: Enforce type safety across app
- Examples: `Patient`, `Appointment`, `Notification`, `WhatsAppConversation`, `ConsultationNote`
- Pattern: Interfaces define all required fields; optional fields marked with `?`

**Sidebar Navigation:**
- Purpose: Provide consistent navigation across all authenticated pages
- Examples: Dashboard, Calendar, Patients, WhatsApp Bot, Settings
- Pattern: Uses `SidebarProvider`, `AppSidebar` component with active route detection

## Entry Points

**Root Layout (`app/layout.tsx`):**
- Location: `app/layout.tsx`
- Triggers: Initial page load for any route
- Responsibilities: Set up HTML document, import global styles, add Analytics

**App Layout (`app/(app)/layout.tsx`):**
- Location: `app/(app)/layout.tsx`
- Triggers: Any route under `/(app)/*`
- Responsibilities: Render SidebarProvider, AppSidebar, header with SidebarTrigger, main content area

**Home Redirect (`app/page.tsx`):**
- Location: `app/page.tsx`
- Triggers: User navigates to `/`
- Responsibilities: Redirect to `/onboarding` (entry point for new users)

**Authentication Flow:**
- `/onboarding` → user setup form → redirects to `/login`
- `/login` → credentials form → redirects to `/dashboard` (mock: any input accepted)
- Root redirects to `/onboarding`; authenticated users access `/(app)/*`

## Error Handling

**Strategy:** No explicit error boundaries or try-catch blocks observed. Mock data is deterministic and never throws.

**Patterns:**
- Loading states: `isLoading` boolean in form components (simulated with setTimeout)
- Empty states: Conditional rendering with fallback UI (e.g., "No hay citas programadas")
- Form validation: Basic HTML5 validation (required attributes) + manual checks (e.g., duplicate allergies)
- No API error handling (mock data is synchronous)

**Examples:**
- Dashboard: Shows "No hay citas programadas para hoy" when `todayAppointments.length === 0`
- Patients: Shows "No se encontraron pacientes" when `filteredPatients.length === 0`
- New Patient Form: Prevents duplicate allergies/conditions with array include check

## Cross-Cutting Concerns

**Logging:** No logging framework detected. Pages use console implicitly (not shown in code).

**Validation:** 
- Form validation: React Hook Form with Zod (`@hookform/resolvers`, `zod`)
- Data validation: Type narrowing via TypeScript
- Client-side only; no server-side validation

**Authentication:** 
- Current: Mock authentication (any credentials accepted, redirects to `/dashboard`)
- Future: Would require auth provider (Clerk, NextAuth, Supabase)
- Protected routes: `(app)` layout requires user to access; public routes at root level

**Theming:**
- Tool: next-themes
- Provider: ThemeProvider in layout
- Colors: Tailwind CSS (teal-600 primary, blue/green/red/amber accents)
- Dark mode: Detected via CSS media query

**Notifications:**
- Framework: Sonner (toast notifications)
- Provider: Toaster component in layout
- Pattern: Imported and called via `useToast()` hook (not shown in current pages)

---

*Architecture analysis: 2025-03-25*
