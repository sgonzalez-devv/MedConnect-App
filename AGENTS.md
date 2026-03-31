# Project Context for AI Agents

## Supabase MCP Connection

A Supabase MCP server is configured and enabled. Agents can use it to:

- **Create tables** — Define new tables with columns, types, and constraints
- **Manage tables** — Alter columns, add indexes, modify schemas
- **Run queries** — Execute SQL directly against the Supabase project
- **Manage RLS policies** — Create and update Row Level Security policies
- **Manage migrations** — Track and apply database migrations

**Project ref:** `knbnvwlmxbidfiixnylg`

When working with the database, always use the Supabase MCP tools instead of writing raw SQL files. Prefer MCP operations for schema changes so they are applied directly and immediately.

## Conventions

- Use `snake_case` for table and column names
- Always add `created_at` and `updated_at` timestamps to new tables
- Enable RLS on all tables that store user data
- Use UUIDs as primary keys (`gen_random_uuid()`)
- Document schema changes in `.planning/` phase docs when part of a GSD phase
