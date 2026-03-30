# Requirements: MedConnect v1.0 Supabase Connection

**Defined:** 2026-03-27
**Core Value:** Users can securely access a complete, persistent medical records system where every clinic has isolated, real-time data.

## v1 Requirements

Requirements for the Supabase integration milestone. Each maps to roadmap phases.

### Authentication

- [ ] **AUTH-01**: User can sign up with email and password
- [ ] **AUTH-02**: User receives email verification after signup
- [ ] **AUTH-03**: User can log in with email and password
- [ ] **AUTH-04**: User can reset password via email link
- [ ] **AUTH-05**: User session persists across browser refresh
- [ ] **AUTH-06**: User session expires after 7 days of inactivity
- [ ] **AUTH-07**: User can log out (clears session and JWT)

### User Management

- [ ] **USER-01**: User profile stores clinic assignment(s)
- [ ] **USER-02**: User has role assignment (admin/doctor/staff)
- [ ] **USER-03**: User clinic context is verified server-side (not client-selectable)
- [ ] **USER-04**: User can view own profile

### Data Persistence - Core Tables

- [ ] **DATA-01**: Clinics data persists in Supabase
- [ ] **DATA-02**: Patients data persists per clinic with clinic isolation
- [ ] **DATA-03**: Doctor profiles persist per clinic
- [ ] **DATA-04**: Appointments persist per clinic with clinic isolation
- [ ] **DATA-05**: Consultation notes persist per clinic with clinic isolation
- [ ] **DATA-06**: Vital signs persist per patient with clinic isolation
- [ ] **DATA-07**: Medical history persists per patient with clinic isolation
- [ ] **DATA-08**: Vaccine records persist per patient with clinic isolation
- [ ] **DATA-09**: Medical attachments persist per clinic with clinic isolation
- [ ] **DATA-10**: Prescriptions persist per clinic with clinic isolation

### Data Isolation & Security

- [ ] **ISOL-01**: Row-Level Security (RLS) policies enforce clinic boundaries on all tables
- [ ] **ISOL-02**: RLS policies verify user role before allowing read access
- [ ] **ISOL-03**: RLS policies verify user role before allowing write access
- [ ] **ISOL-04**: User cannot query data from clinics they don't belong to
- [ ] **ISOL-05**: Doctor cannot see patients from other clinics
- [ ] **ISOL-06**: Staff cannot modify records outside their clinic

### API Service Layer

- [x] **API-01**: Patients can be fetched via service function (clinic-aware)
- [x] **API-02**: Appointments can be fetched via service function (clinic-aware)
- [x] **API-03**: Consultation notes can be fetched via service function (clinic-aware)
- [x] **API-04**: Vital signs can be fetched via service function (clinic-aware)
- [x] **API-05**: Medical attachments can be fetched via service function (clinic-aware)
- [x] **API-06**: Doctor profiles can be fetched via service function (clinic-aware)
- [x] **API-07**: New records can be created via service function
- [x] **API-08**: Existing records can be updated via service function
- [x] **API-09**: Records can be deleted via service function
- [x] **API-10**: Service functions enforce clinic context automatically

### Frontend Integration

- [ ] **FE-01**: Dashboard fetches real appointments from Supabase (not mock data)
- [ ] **FE-02**: Patient list fetches from Supabase (not mock data)
- [ ] **FE-03**: Appointment calendar fetches from Supabase (not mock data)
- [ ] **FE-04**: Patient profile pages fetch real data from Supabase
- [ ] **FE-05**: Form submissions write to Supabase (not local state only)
- [ ] **FE-06**: Clinic context is always verified against current user's clinics

### Error Handling

- [x] **ERR-01**: User sees error message if Supabase connection fails
- [x] **ERR-02**: User sees error message if clinic isolation check fails
- [x] **ERR-03**: User is logged out if session expires
- [x] **ERR-04**: User is redirected to login if attempting to access without auth
- [x] **ERR-05**: User sees error if attempting to access clinic they don't belong to

## v2 Requirements

Deferred to future milestone. Tracked but not in current roadmap.

### Notifications

- **NOTIF-01**: User receives in-app notification when appointment is confirmed
- **NOTIF-02**: User receives email notification for appointment reminders
- **NOTIF-03**: User can configure notification preferences per clinic

### Real-Time Updates

- **REALTIME-01**: Appointment changes push real-time updates to dashboard
- **REALTIME-02**: Vital signs changes push real-time updates to patient records
- **REALTIME-03**: User sees live clinic load status

### Advanced Features

- **ADV-01**: User can bulk import patient records from CSV
- **ADV-02**: User can export patient records to PDF
- **ADV-03**: System tracks audit trail of who accessed what data when
- **ADV-04**: Full-text search for patients and appointments
- **ADV-05**: Cross-clinic visibility for admin users (with audit logging)
- **ADV-06**: WhatsApp integration for appointment confirmations
- **ADV-07**: SMS reminders for appointments
- **ADV-08**: Multi-factor authentication (MFA) for doctor accounts

## Out of Scope

Explicitly excluded from v1.0 to maintain focus on core backend integration.

| Feature | Reason |
|---------|--------|
| Mobile app | Web-first approach; responsive web sufficient for v1 |
| Real-time collaboration | Not required for medical records workflow; sync conflicts unnecessary |
| Advanced analytics | Basic reporting only; deep analytics deferred to v2+ |
| OAuth/SSO login | Email/password sufficient for v1; OAuth for v2 |
| WhatsApp/SMS integration | Schema prepared but integration deferred to v2 |
| Payment processing | Not in scope for medical records system |
| Telemedicine | Out of scope; focus on records management |
| Bulk import/export | Deferred to v2; manual entry for v1 validation |
| Audit trails | Schema prepared but not logged in v1 |
| Multi-factor authentication | Deferred to v2 for security hardening |
| Cross-clinic visibility | Strict clinic isolation for v1; cross-clinic queries v2+ |
| Full-text search | Deferred to v2; simple filtering sufficient for v1 |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Pending |
| AUTH-03 | Phase 1 | Pending |
| AUTH-04 | Phase 1 | Pending |
| AUTH-05 | Phase 1 | Pending |
| AUTH-06 | Phase 1 | Pending |
| AUTH-07 | Phase 1 | Pending |
| USER-01 | Phase 1 | Pending |
| USER-02 | Phase 1 | Pending |
| USER-03 | Phase 1 | Pending |
| USER-04 | Phase 1 | Pending |
| DATA-01 | Phase 2 | Pending |
| DATA-02 | Phase 2 | Pending |
| DATA-03 | Phase 2 | Pending |
| DATA-04 | Phase 2 | Pending |
| DATA-05 | Phase 2 | Pending |
| DATA-06 | Phase 2 | Pending |
| DATA-07 | Phase 2 | Pending |
| DATA-08 | Phase 2 | Pending |
| DATA-09 | Phase 2 | Pending |
| DATA-10 | Phase 2 | Pending |
| ISOL-01 | Phase 2 | Pending |
| ISOL-02 | Phase 2 | Pending |
| ISOL-03 | Phase 2 | Pending |
| ISOL-04 | Phase 2 | Pending |
| ISOL-05 | Phase 2 | Pending |
| ISOL-06 | Phase 2 | Pending |
| API-01 | Phase 3 | Complete |
| API-02 | Phase 3 | Complete |
| API-03 | Phase 3 | Complete |
| API-04 | Phase 3 | Complete |
| API-05 | Phase 3 | Complete |
| API-06 | Phase 3 | Complete |
| API-07 | Phase 3 | Complete |
| API-08 | Phase 3 | Complete |
| API-09 | Phase 3 | Complete |
| API-10 | Phase 3 | Complete |
| FE-01 | Phase 3 | Pending |
| FE-02 | Phase 3 | Pending |
| FE-03 | Phase 3 | Pending |
| FE-04 | Phase 3 | Pending |
| FE-05 | Phase 3 | Pending |
| FE-06 | Phase 3 | Pending |
| ERR-01 | Phase 3 | Complete |
| ERR-02 | Phase 3 | Complete |
| ERR-03 | Phase 3 | Complete |
| ERR-04 | Phase 3 | Complete |
| ERR-05 | Phase 3 | Complete |

**Coverage:**
- v1 requirements: 47 total
- Mapped to phases: 47
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-27*
*Last updated: 2026-03-27 after research synthesis*
