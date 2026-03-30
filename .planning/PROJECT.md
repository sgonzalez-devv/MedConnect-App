# MedConnect

## What This Is

MedConnect is a multi-clinic medical management platform that helps healthcare practitioners manage patients, appointments, consultations, and medical records in a unified, clinic-aware interface. It provides clinic staff and doctors a comprehensive system to track patient care across multiple clinic locations with role-based access and clinic-specific data isolation.

## Current Milestone: v1.0 Supabase Connection

**Goal:** Migrate MedConnect from mock data to a complete Supabase backend with authentication and all core data entities.

**Target features:**
- Supabase Authentication (signup, login, logout, session management)
- Custom users table with clinic assignments and doctor profiles
- Complete database schema for all 17 core entities
- Incremental migration path (Auth → Data)
- Clean database (starting fresh, no legacy mock data)
- API service layer to replace mock data calls

## Core Value

Users can securely access a complete, persistent medical records system where every clinic has isolated, real-time data.

## Requirements

### Validated

- **DATA-01 through DATA-10** — All 10 core and data tables created with clinic isolation (Phase 03)
- **ISOL-01 through ISOL-06** — Row-level security policies implemented and tested (Phase 03)

### Active

See `.planning/REQUIREMENTS.md` for full list.

### Out of Scope

- **Mobile-native app** — Web-first, responsive design only for this milestone
- **Real-time collaboration** — Focus on individual user actions, not concurrent editing
- **Advanced analytics** — Basic reporting only; deep analytics deferred to v2
- **WhatsApp integration** — Schema prepared but integration deferred to v2
- **Payment processing** — Not in scope; focus on core medical records
- **Third-party API integrations** — Supabase-only backend for v1

## Context

**Technical Environment:**
- Next.js 16 (App Router) with TypeScript
- Tailwind CSS 4.2 for styling
- Shadcn/ui components with Radix UI
- React Hook Form + Zod for form validation
- 17 well-structured TypeScript interfaces for data entities
- Current mock data in lib/mock-data.ts with helper functions

**Prior Work:**
- UI/UX layer fully implemented (57 components, OKLCH color system)
- Multi-clinic architecture with ClinicContext for clinic selection
- Comprehensive data model with clear entity relationships
- Mock data covering 2 clinics, 5 patients, 23 appointments, and supporting records

**Known Issues to Address:**
- All data currently in memory (mock) — no persistence
- No authentication system (all users have full access)
- No API layer or real database
- No way to create or modify data (read-only UI)

## Constraints

- **No legacy data migration** — Starting clean with fresh Supabase databases
- **Incremental rollout** — Auth first, then data table-by-table to avoid big-bang failures
- **Clinic isolation** — All queries must filter by clinic to maintain multi-clinic integrity
- **Authentication model** — Supabase Auth + custom users table (not OAuth for v1)
- **TypeScript types** — Maintain type safety throughout backend integration

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Use Supabase Auth + custom users table | Flexible user profiles tied to clinics, built-in secure auth | ✅ Auth completed (Phase 02) |
| Incremental migration (Auth → Data) | Reduces risk, allows testing in phases | ✅ Schema & RLS completed (Phase 03) |
| Clean database (no seed data) | Easier onboarding, no legacy data baggage | ✅ All tables in production schema |
| Keep TypeScript interfaces unchanged | Minimal frontend refactoring, API layer adapts to existing types | ✅ Interfaces preserved, query functions created |
| RLS enforcement at PostgreSQL layer | Defense-in-depth security with app-level filtering | ✅ RLS policies + app queries (Phase 03) |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-30 after Phase 03 (Database Schema & RLS) completion*
