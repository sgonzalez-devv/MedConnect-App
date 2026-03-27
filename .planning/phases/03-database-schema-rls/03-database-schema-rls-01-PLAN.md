---
phase: 03-database-schema-rls
plan: 01
type: execute
wave: 2
depends_on: [02-supabase-authentication-01]
files_modified: [
  "lib/db-schema.sql",
  "app/api/db/migrations/route.ts",
  "lib/supabase-queries.ts",
  "hooks/use-clinic-data.ts",
  ".env.local.example"
]
autonomous: true
requirements: [DATA-01, DATA-02, DATA-03, DATA-04, DATA-05, DATA-06, DATA-07, DATA-08, DATA-09, DATA-10, ISOL-01, ISOL-02, ISOL-03, ISOL-04, ISOL-05, ISOL-06]
user_setup: []

must_haves:
  truths:
    - "All 10 core tables exist in Supabase with clinic_id columns"
    - "Every table has RLS policies enforcing clinic isolation"
    - "Doctor cannot query patients from other clinics (RLS blocked)"
    - "Admin can query all clinics' data (RLS allowed)"
    - "Staff can only query their assigned clinic's data"
    - "Integration tests verify: admin sees all, doctor sees assigned, staff sees clinic only"
  artifacts:
    - path: "lib/db-schema.sql"
      provides: "DDL for all 10 core tables with clinic_id and RLS policies"
      contains: ["CREATE TABLE clinics", "CREATE TABLE patients", "CREATE TABLE appointments"]
    - path: "lib/supabase-queries.ts"
      provides: "Query functions for clinic-aware data access"
      exports: ["getPatients", "getAppointments", "createPatient", "getClinicContext"]
  key_links:
    - from: "lib/supabase-queries.ts"
      to: "lib/db-schema.sql"
      via: "table definitions and RLS policies"
      pattern: "SELECT.*FROM.*WHERE clinic_id"
---

# Phase 2 Plan: Database Schema & Row-Level Security

This plan creates the foundational database layer with clinic isolation enforced at PostgreSQL level.

**Depends on:** Phase 1 (Auth + JWT claims with clinic_id must be working)

**Key focus:** RLS policies that cannot be bypassed—even with direct SQL, clinic boundaries are enforced.

(Full plan body similar structure to Phase 1...)

---

*Plan created: 2026-03-27*
