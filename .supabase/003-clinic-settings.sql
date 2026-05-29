-- Migration: Add settings JSONB column to clinics table
-- Run this in Supabase SQL Editor before using the clinic configuration tabs
--
-- The settings column stores schedule, notification, and system preferences
-- for each clinic in a flexible JSONB format.

ALTER TABLE clinics
  ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';

COMMENT ON COLUMN clinics.settings IS 'Clinic-level preferences: schedule, notifications, system';
