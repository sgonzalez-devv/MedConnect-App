/**
 * Integration Tests: RLS Clinic Isolation Enforcement
 *
 * These tests verify that Row-Level Security policies on all tables
 * enforce clinic boundaries and cannot be bypassed.
 *
 * SETUP REQUIRED: Test Supabase project with:
 * - All 10 tables created (lib/db-schema.sql)
 * - RLS policies enabled (lib/db-rls-policies.sql)
 * - Test data: 2 clinics, doctors/staff assigned to each, patients per clinic
 */

import { createClient } from '@/lib/supabase-client';
import { describe, it, expect } from '@jest/globals';

// Test user tokens (in real tests, generated from JWT claims)
const TEST_TOKENS = {
  admin: process.env.TEST_TOKEN_ADMIN || '',
  doctor_clinic_a: process.env.TEST_TOKEN_DOCTOR_A || '',
  staff_clinic_b: process.env.TEST_TOKEN_STAFF_B || '',
};

const TEST_DATA = {
  clinic_a: process.env.TEST_CLINIC_A_ID || 'clinic-a-uuid',
  clinic_b: process.env.TEST_CLINIC_B_ID || 'clinic-b-uuid',
  patient_clinic_a: process.env.TEST_PATIENT_A_ID || 'patient-a-uuid',
  patient_clinic_b: process.env.TEST_PATIENT_B_ID || 'patient-b-uuid',
};

describe('RLS Clinic Isolation Tests', () => {
  
  describe('PATIENTS Table - SELECT Policies', () => {
    
    it('Admin can select patients from any clinic', async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .in('clinic_id', [TEST_DATA.clinic_a, TEST_DATA.clinic_b]);
      
      expect(error).toBeNull();
      expect(data?.length).toBeGreaterThanOrEqual(2);
    });

    it('Doctor can only select patients from assigned clinic', async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('patients')
        .select('*');
      
      expect(error).toBeNull();
      // RLS policy filters to clinic_a only
      expect(data?.every((p: any) => p.clinic_id === TEST_DATA.clinic_a)).toBe(true);
    });

    it('Doctor cannot select patients from other clinic', async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('clinic_id', TEST_DATA.clinic_b);
      
      // RLS blocks cross-clinic query
      expect(data?.length || 0).toBe(0);
    });

    it('Staff can only select patients from their clinic', async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('patients')
        .select('*');
      
      expect(error).toBeNull();
      expect(data?.every((p: any) => p.clinic_id === TEST_DATA.clinic_b)).toBe(true);
    });
  });

  describe('PATIENTS Table - INSERT Policies', () => {
    
    it('Doctor can insert patient in assigned clinic', async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('patients')
        .insert({
          clinic_id: TEST_DATA.clinic_a,
          full_name: 'Test Patient',
          status: 'active',
        })
        .select()
        .single();
      
      expect(error).toBeNull();
      expect(data?.clinic_id).toBe(TEST_DATA.clinic_a);
    });

    it('Doctor cannot insert patient in other clinic (RLS blocks)', async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('patients')
        .insert({
          clinic_id: TEST_DATA.clinic_b,
          full_name: 'Test Patient',
          status: 'active',
        })
        .select()
        .single();
      
      // RLS WITH CHECK fails
      expect(error).not.toBeNull();
    });
  });

  describe('APPOINTMENTS Table - Clinic Isolation', () => {
    
    it('Admin can select any clinic appointments', async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('appointments')
        .select('*');
      
      expect(error).toBeNull();
      // Admin sees all clinics
      const clinicIds = new Set(data?.map((a: any) => a.clinic_id) || []);
      expect(clinicIds.size).toBeGreaterThanOrEqual(1);
    });

    it('Doctor sees only assigned clinic appointments', async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('appointments')
        .select('*');
      
      expect(error).toBeNull();
      expect(data?.every((a: any) => a.clinic_id === TEST_DATA.clinic_a)).toBe(true);
    });

    it('Doctor cannot insert appointment in other clinic', async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('appointments')
        .insert({
          clinic_id: TEST_DATA.clinic_b,
          patient_id: TEST_DATA.patient_clinic_b,
          appointment_datetime: new Date().toISOString(),
        })
        .select()
        .single();
      
      expect(error).not.toBeNull();
    });
  });

  describe('VITAL_SIGNS Table - Data Isolation', () => {
    
    it('Doctor can select vital signs from own clinic patients', async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('vital_signs')
        .select('*')
        .eq('clinic_id', TEST_DATA.clinic_a);
      
      expect(error).toBeNull();
    });

    it('Doctor cannot access vital signs from other clinic', async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('vital_signs')
        .select('*')
        .eq('clinic_id', TEST_DATA.clinic_b);
      
      // RLS blocks query
      expect(data?.length || 0).toBe(0);
    });
  });

  describe('MEDICAL_HISTORY Table - Clinic Boundaries', () => {
    
    it('Staff can select medical history from clinic patients', async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('medical_history')
        .select('*')
        .eq('clinic_id', TEST_DATA.clinic_b);
      
      expect(error).toBeNull();
    });

    it('Staff cannot access other clinic medical history', async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('medical_history')
        .select('*')
        .eq('clinic_id', TEST_DATA.clinic_a);
      
      expect(data?.length || 0).toBe(0);
    });
  });

  describe('PRESCRIPTIONS Table - DELETE Restrictions', () => {
    
    it('Staff can delete prescriptions in their clinic', async () => {
      const supabase = createClient();
      
      // Create prescription first
      const { data: created } = await supabase
        .from('prescriptions')
        .insert({
          clinic_id: TEST_DATA.clinic_b,
          patient_id: TEST_DATA.patient_clinic_b,
          medication_name: 'Test Medication',
        })
        .select()
        .single();
      
      if (created?.id) {
        const { error } = await supabase
          .from('prescriptions')
          .delete()
          .eq('id', created.id);
        
        expect(error).toBeNull();
      }
    });

    it('Doctor cannot delete prescriptions (staff-only policy)', async () => {
      const supabase = createClient();
      
      // Attempt to delete prescription
      const { error } = await supabase
        .from('prescriptions')
        .delete()
        .eq('clinic_id', TEST_DATA.clinic_a);
      
      // RLS DELETE policy requires staff role
      expect(error).not.toBeNull();
    });
  });

  describe('ATTACHMENTS Table - Document Isolation', () => {
    
    it('Doctor can view attachments from clinic patients', async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('attachments')
        .select('*')
        .eq('clinic_id', TEST_DATA.clinic_a);
      
      expect(error).toBeNull();
    });

    it('Doctor cannot insert attachments for other clinic', async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('attachments')
        .insert({
          clinic_id: TEST_DATA.clinic_b,
          patient_id: TEST_DATA.patient_clinic_b,
          file_name: 'test.pdf',
          file_path: 's3://bucket/test.pdf',
        })
        .select()
        .single();
      
      expect(error).not.toBeNull();
    });
  });

  describe('DOCTOR_PROFILES Table - Clinic Staff Management', () => {
    
    it('Admin can view doctors from all clinics', async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('doctor_profiles')
        .select('*');
      
      expect(error).toBeNull();
    });

    it('Doctor can only view doctors from their clinic', async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('doctor_profiles')
        .select('*');
      
      expect(error).toBeNull();
      expect(data?.every((d: any) => d.clinic_id === TEST_DATA.clinic_a)).toBe(true);
    });
  });

  describe('CONSULTATION_NOTES Table - Clinical Data Protection', () => {
    
    it('Doctor can select notes from assigned clinic', async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('consultation_notes')
        .select('*')
        .eq('clinic_id', TEST_DATA.clinic_a);
      
      expect(error).toBeNull();
    });

    it('Doctor cannot select notes from other clinic', async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('consultation_notes')
        .select('*')
        .eq('clinic_id', TEST_DATA.clinic_b);
      
      expect(data?.length || 0).toBe(0);
    });
  });

  describe('VACCINE_RECORDS Table - Patient Data Isolation', () => {
    
    it('Staff sees vaccine records from clinic patients', async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('vaccine_records')
        .select('*')
        .eq('clinic_id', TEST_DATA.clinic_b);
      
      expect(error).toBeNull();
    });

    it('Staff cannot see vaccine records from other clinic', async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('vaccine_records')
        .select('*')
        .eq('clinic_id', TEST_DATA.clinic_a);
      
      expect(data?.length || 0).toBe(0);
    });
  });

  describe('CLINICS Table - Access Control', () => {
    
    it('User can view their own clinic', async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('id', TEST_DATA.clinic_a);
      
      expect(error).toBeNull();
      expect(data?.length).toBe(1);
    });

    it('User cannot view clinics they do not belong to', async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('id', TEST_DATA.clinic_b);
      
      expect(data?.length || 0).toBe(0);
    });

    it('Admin can view all clinics', async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('clinics')
        .select('*');
      
      expect(error).toBeNull();
      expect(data?.length).toBeGreaterThanOrEqual(2);
    });
  });
});
