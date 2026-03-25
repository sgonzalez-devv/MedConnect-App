# Coding Conventions

**Analysis Date:** 2026-03-25

## Naming Patterns

**Files:**
- **Components:** PascalCase with `.tsx` extension - e.g., `AppSidebar.tsx`, `StatsCard.tsx`, `ThemeProvider.tsx`
- **Page files:** kebab-case in directories matching Next.js App Router convention - e.g., `app/(app)/dashboard/page.tsx`, `app/login/page.tsx`
- **Utilities/Libraries:** camelCase with descriptive names - e.g., `date-utils.ts`, `mock-data.ts`, `types.ts`, `utils.ts`
- **UI Components:** PascalCase - e.g., `Card.tsx`, `Button.tsx`, `Input.tsx`
- **Hooks:** camelCase prefixed with `use-` - e.g., `use-mobile.ts`, `use-toast.ts`

**Functions:**
- **Exported utility functions:** camelCase - e.g., `cn()`, `formatDateLong()`, `calculateAge()`, `useIsMobile()`
- **Component functions:** PascalCase - e.g., `export default function DashboardPage()`
- **Helper functions in components:** camelCase - e.g., `handleSubmit`, `handleNext`, `handleBack`
- **Constants and enums:** UPPER_SNAKE_CASE where needed, or camelCase for simple constants

**Variables:**
- **Local state variables:** camelCase - e.g., `currentStep`, `formData`, `showPassword`, `isMobile`
- **Props interface properties:** camelCase - e.g., `className`, `onClick`, `isLoading`
- **Imported types:** PascalCase - e.g., `Patient`, `Appointment`, `ToastProps`

**Types & Interfaces:**
- **Interfaces:** PascalCase with `I` prefix optional - e.g., `StatsCardProps`, `Patient`, `Appointment`, `ThemeProviderProps`
- **Type aliases:** PascalCase - e.g., `ToasterToast`, `ActionType`, `Toast`
- **Union types:** Inline or named with PascalCase - e.g., `"consulta" | "seguimiento"`, `type ActionType`

## Code Style

**Formatting:**
- **Indentation:** 2 spaces (inferred from codebase)
- **Quote style:** Single quotes for string literals - e.g., `'use client'`, `import * as React from 'react'`
- **Semicolons:** Present at end of statements
- **Line length:** Not strictly enforced but generally readable

**Linting:**
- **ESLint:** Configured via package.json script `"lint": "eslint ."`
- **No explicit .eslintrc file:** Using Next.js default ESLint configuration
- **TypeScript strict mode:** Enabled in `tsconfig.json` with `"strict": true`

**Component Style:**
- **Functional components:** All components are functional (no class components)
- **React version:** React 19.2.4 with modern hooks support
- **Hooks usage:** Standard React hooks (`useState`, `useEffect`, `useRouter`, etc.)
- **Server vs Client:** Client components marked with `"use client"` directive where needed

## Import Organization

**Order:**
1. External libraries (React, Next.js, third-party packages)
2. Type imports using `import type` syntax
3. Internal component imports
4. Internal utility/lib imports
5. Styles (if using CSS modules)

**Example Pattern (from `app/login/page.tsx`):**
```typescript
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"
```

**Path Aliases:**
- `@/*` maps to project root - e.g., `@/components/ui/button`, `@/lib/utils`, `@/hooks/use-toast`
- Configured in `tsconfig.json` paths: `"@/*": ["./*"]`
- Prefer absolute imports over relative imports

**Barrel Files:**
- UI components export individual components from each file
- Example: `card.tsx` exports `Card`, `CardHeader`, `CardFooter`, `CardTitle`, `CardAction`, `CardDescription`, `CardContent` as named exports

## Component Patterns

**Functional Components:**
- All components are functional components using modern React patterns
- Components are type-safe with props interfaces

**Props Pattern (from `StatsCard.tsx`):**
```typescript
interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: { value: number; isPositive: boolean }
  color?: "teal" | "blue" | "indigo" | "orange" | "gray"
}

export function StatsCard({ title, value, subtitle, icon: Icon, trend, color = "teal" }: StatsCardProps) {
  // component body
}
```

**Spread Props Pattern:**
- Use spread syntax for passing through HTML attributes - `{...props}`
- Example: `<button {...props} />`

**Hooks Usage:**
- `useState` for local state management - e.g., `setCurrentStep`, `setFormData`, `setShowPassword`
- `useEffect` for side effects with dependency arrays
- `useRouter` from `next/navigation` for client-side routing
- Custom hooks like `useIsMobile()` for shared logic
- `useToast()` for toast notifications (custom implementation)

**Styling:**
- **Tailwind CSS:** Primary styling with Tailwind classes
- **Class utilities:** Use `cn()` utility from `lib/utils.ts` for merging classes
- **Variant management:** Use `class-variance-authority` (CVA) for component variants
- **Example:** Button component uses CVA for variants and sizes

## Error Handling

**Strategy:** Minimal explicit error handling in client code

**Patterns Observed:**
- No explicit try-catch blocks in page components
- Form validation handled inline with HTML5 validation attributes (`required`)
- Async operations use simple promise chains or await
- Mock data used throughout eliminating actual error scenarios

**Type Safety:**
- TypeScript strict mode provides compile-time error prevention
- Interface contracts ensure type correctness at runtime

**User Feedback:**
- Toast notifications (via `useToast()`) for user-facing messages
- Loading states tracked via `isLoading` variable

## Logging

**Framework:** Console object used for logging (not dedicated logging library)

**Patterns:**
- No console logging statements detected in source code
- Logging would be done via `console.log()`, `console.error()`, `console.warn()` when needed
- Debug information typically handled through browser dev tools

## Comments

**Documentation Style:**
- Minimal comments - code is self-documenting through clear naming
- Comments used for explaining non-obvious behavior (e.g., `date-utils.ts` includes format documentation in comments)

**JSDoc/TSDoc:**
- Limited JSDoc usage observed
- Function documentation provided through type signatures and interfaces
- Example from `date-utils.ts`:
```typescript
/**
 * Format: "15 de marzo de 2024"
 */
export function formatDateLong(date: Date | string): string {
  // ...
}
```

**Code Comments:**
- Explanatory comments used in utility functions
- Example: `// Consistent date formatting utilities to avoid hydration mismatches`

## Configuration and Environment Variables

**Environment Configuration:**
- `.env*.local` files for local development secrets (in `.gitignore`)
- Next.js metadata configuration in `layout.tsx` files
- Icon configuration in root layout for light/dark mode support

**Build Configuration:**
- Next.js config in `next.config.mjs`:
  - `typescript.ignoreBuildErrors: true` (allows type errors during build)
  - `images.unoptimized: true` (for static export)
  
- PostCSS config in `postcss.config.mjs`:
  - Tailwind CSS 4.2 via `@tailwindcss/postcss` plugin

**TypeScript Configuration (tsconfig.json):**
- `strict: true` - Strict type checking
- `target: ES6` - Modern JavaScript support
- `jsx: react-jsx` - JSX handling without React import
- `isolatedModules: true` - Module isolation
- `skipLibCheck: true` - Skip lib type checking

## Package Management

**Manager:** pnpm 9.15.9+

**Key Dependencies:**
- React 19.2.4 and React DOM 19.2.4
- Next.js 16.1.6
- TypeScript 5.7.3
- Tailwind CSS 4.2.0
- @radix-ui/* - Headless UI components (20+ packages)
- lucide-react - Icon library
- react-hook-form - Form handling
- zod - Schema validation
- recharts - Charts library
- date-fns - Date manipulation

## Data Types and Interfaces

**Type Organization (from `lib/types.ts`):**
- All domain types centralized in single file
- Medical domain interfaces: `Patient`, `Appointment`, `ConsultationNote`, `MedicalAttachment`
- Supporting types: `VitalSigns`, `Vaccine`, `MedicalHistory`, `Prescription`
- UI types: `Notification`, `WhatsAppMessage`, `WhatsAppConversation`
- Profile: `DoctorProfile`

**Type Pattern (from `lib/types.ts`):**
```typescript
export interface Patient {
  id: string
  nombre: string
  apellido: string
  email: string
  // ... more properties
}

export interface Appointment {
  id: string
  pacienteId: string
  estado: "programada" | "confirmada" | "en_curso" | "completada" | "cancelada" | "no_asistio"
  // ... more properties
}
```

**Enum Patterns:**
- Inline union types for status fields - e.g., `"consulta" | "seguimiento" | "urgencia"`
- Color variants as discriminated union types
- Configuration objects with type literal values

## Code Organization by Layer

**Page Layer (`app/*/page.tsx`):**
- Server or client components marked with `"use client"` when needed
- Direct use of mock data from `lib/mock-data.ts`
- Page components use exported default functions
- No component extraction to separate files observed

**Component Layer (`components/`):**
- UI components in `components/ui/` subdirectory
- Business/feature components in `components/` root (e.g., `app-sidebar.tsx`, `stats-card.tsx`)
- All components are functional and typed

**Utility Layer (`lib/`):**
- `utils.ts` - Utility functions like `cn()` for CSS class merging
- `types.ts` - All TypeScript interfaces and types
- `date-utils.ts` - Date formatting and calculation utilities
- `mock-data.ts` - Mock/fixture data for development

**Hook Layer (`hooks/`):**
- Custom hooks for shared component logic
- `use-mobile.ts` - Responsive design hook
- `use-toast.ts` - Toast notification system

---

*Convention analysis: 2026-03-25*
