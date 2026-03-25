# Technology Stack

**Analysis Date:** 2026-03-25

## Languages

**Primary:**
- TypeScript 5.7.3 - Full codebase with strict type checking enabled
- JavaScript - Build configuration files (ESM modules)

**Secondary:**
- CSS - Styling with Tailwind CSS v4 and PostCSS

## Runtime

**Environment:**
- Node.js (bundled with Next.js, 16.1.6)

**Package Manager:**
- pnpm 9.15.9 - Configured in `package.json` packageManager field
- Lockfile: `pnpm-lock.yaml` (present)

## Frameworks

**Core:**
- Next.js 16.1.6 - Full-stack React framework with App Router
- React 19.2.4 - UI library
- React DOM 19.2.4 - DOM rendering

**UI & Components:**
- Radix UI (multiple packages, latest versions 1.1-2.2) - Headless component primitives
  - Components: Accordion, Alert Dialog, Avatar, Button, Card, Checkbox, Dialog, Dropdown Menu, Label, Menu, Popover, Progress, Radio Group, Scroll Area, Select, Separator, Sidebar, Switch, Tabs, Toast, Toggle, Tooltip, and more
- shadcn/ui - Component library built on Radix UI (configured via `components.json`)
- Lucide React 0.564.0 - Icon library with 564+ icons

**Forms & Validation:**
- React Hook Form 7.54.1 - Form state management
- @hookform/resolvers 3.9.1 - Form validation resolver integration
- Zod 3.24.1 - Schema validation library for TypeScript

**State & Storage:**
- Browser sessionStorage - Used for WhatsApp onboarding state in `app/(app)/bot-whatsapp/page.tsx`
- Client-side state management via React hooks (useState, useEffect)
- No global state management library (Redux, Zustand, etc.)

**Data & Utilities:**
- date-fns 4.1.0 - Date manipulation and formatting utilities
- Recharts 2.15.0 - Charts and visualizations library
- Embla Carousel React 8.6.0 - Carousel/slider component
- React Day Picker 9.13.2 - Calendar picker component
- React Resizable Panels 2.1.7 - Resizable panel layouts
- Input OTP 1.4.2 - OTP input component
- CMDK 1.1.1 - Command palette/menu component
- Sonner 1.7.1 - Toast notifications
- Vaul 1.1.2 - Drawer component

**Utilities:**
- clsx 2.1.1 - Conditional className combining
- Tailwind Merge 3.3.1 - Smart Tailwind CSS class merging
- Class Variance Authority 0.7.1 - Component variant library
- Autoprefixer 10.4.20 - CSS vendor prefixes

## Frontend Architecture

**Styling:**
- Tailwind CSS 4.2.0 - Utility-first CSS framework (installed as @tailwindcss/postcss dev dependency)
- PostCSS 8.5 - CSS transformation pipeline
- CSS Variables - Using oklch() color space for theming (defined in `app/globals.css`)
- Animations via tw-animate-css 1.3.3

**Theme System:**
- next-themes 0.4.6 - Theme provider (installed but not actively used in codebase)
- CSS custom properties for dark/light mode support

## Build Tools & Configuration

**Build Configuration:**
- `next.config.mjs` - Next.js configuration with:
  - `typescript.ignoreBuildErrors: true`
  - `images.unoptimized: true`
- `tsconfig.json` - TypeScript configuration with:
  - `strict: true` - Strict mode enabled
  - Target: ES6
  - JSX: react-jsx
  - Module resolution: bundler
  - Path alias: `@/*` mapped to root directory
- `postcss.config.mjs` - PostCSS pipeline with @tailwindcss/postcss plugin
- `components.json` - shadcn/ui configuration for component generation
  - Style: New York
  - RSC: Enabled (React Server Components)
  - Tailwind CSS variables enabled
  - Icon library: Lucide

**Development:**
- ESLint - Linting tool (present in scripts: `npm run lint`)
- TypeScript compiler - Type checking

## Testing

**Testing Framework:**
- Not detected - No test framework configured (no Jest, Vitest, etc.)
- No test files found in codebase (*.test.ts, *.spec.ts patterns absent)

## Type Definitions

**Type System:**
- TypeScript strict mode enabled
- @types/react 19.2.14
- @types/react-dom 19.2.3
- @types/node 22 - Node.js type definitions
- Next.js generates: `next-env.d.ts` (type definitions)

## Fonts & Assets

**Fonts:**
- Geist - Default sans-serif font (from next/font/google)
- Geist Mono - Monospace font (from next/font/google)
- Font subsetting: Latin subset

**Icons:**
- Lucide React - SVG icon library

## Monitoring & Analytics

**Analytics:**
- @vercel/analytics 1.6.1 - Vercel Web Analytics integration
  - Imported in root layout: `app/layout.tsx`
  - Component: `<Analytics />`

## Development Dependencies Summary

```
- TypeScript 5.7.3
- @types/node 22
- @types/react 19.2.14
- @types/react-dom 19.2.3
- Tailwind CSS 4.2.0 (@tailwindcss/postcss)
- PostCSS 8.5
- Autoprefixer 10.4.20
```

## Environment Configuration

**Build-time:**
- `typescript.ignoreBuildErrors: true` - Build succeeds despite type errors

**Runtime:**
- Image optimization: disabled (`images.unoptimized: true`)
- HTML language: Spanish (`lang="es"`)

## Platform Requirements

**Development:**
- Node.js (compatible with Next.js 16.1.6)
- pnpm 9.15.9 (package manager)
- Modern browser with ES2015+ support

**Production:**
- Node.js runtime (or Vercel deployment platform)
- Browser support: Modern browsers (CSS custom properties, ES2015+)

---

*Stack analysis: 2026-03-25*
