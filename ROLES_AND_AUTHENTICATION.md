# User Roles & Authentication Setup

## Test Users (Will be Created Automatically)

After creating tables and seeding data, you'll have 3 test users with different roles:

### 1. **ADMIN** — Full System Access
- **Email:** `admin@medicalcity.com`
- **Password:** `AdminPass123!`
- **Permissions:**
  - View all clinics
  - View all users
  - View all patients across all clinics
  - Manage system settings
  - Access RLS admin override

### 2. **DOCTOR** — Patient Care Provider
- **Email:** `doctor@medicalcity.com`
- **Password:** `DoctorPass123!`
- **Permissions:**
  - View assigned patients
  - Create/edit consultation notes
  - Create/edit prescriptions
  - View vital signs and medical history
  - Create appointments for assigned patients
  - Full doctor_profile with specialization and availability

### 3. **STAFF** — Clinic Operations
- **Email:** `staff@medicalcity.com`
- **Password:** `StaffPass123!`
- **Permissions:**
  - Create/edit all patients in clinic
  - Create/edit all appointments in clinic
  - View patient lists
  - **Cannot delete** patients (RLS policy blocks staff delete)
  - Cannot access doctor-only features (prescriptions)

---

## How Roles Work

### Role Assignment (JWT Claims)
Each user gets a JWT token with metadata:
```json
{
  "user_id": "uuid-...",
  "email": "doctor@medicalcity.com",
  "clinic_id": "clinic-uuid-...",
  "user_role": "doctor"
}
```

### Database Access (RLS Policies)
Supabase enforces roles at the database layer:

```sql
-- Example: Doctor can only see patients in their clinic
SELECT * FROM patients
WHERE clinic_id = auth.jwt() ->> 'clinic_id'
```

### Frontend Access (API Routes)
API routes verify both auth AND role:

```typescript
// Example: Only staff can create patients
if (user.user_role !== 'staff' && user.user_role !== 'admin') {
  return Response.json({ error: 'Forbidden' }, { status: 403 })
}
```

---

## Setup Process

### Step 1: Create Database Tables (Prerequisite)
```bash
# Run this in Supabase Dashboard > SQL Editor
# Execute .supabase/001-schema.sql
# Execute .supabase/002-rls-policies.sql
```

### Step 2: Seed Test Clinic & Patients
```bash
cd /Users/sgonzalezfx/Desktop/MedConnect
node scripts/setup-complete.js
```
Creates:
- 1 test clinic
- 4 test patients
- 3 test appointments

### Step 3: Create Test Users with Roles
```bash
node scripts/create-test-users.js
```
Creates:
- Admin user (full access)
- Doctor user (patient care)
- Staff user (clinic operations)

---

## Testing Each Role

### Login as Admin
1. Go to `/auth/login`
2. Enter: `admin@medicalcity.com` / `AdminPass123!`
3. Access: All clinics, all users, system overview

### Login as Doctor
1. Go to `/auth/login`
2. Enter: `doctor@medicalcity.com` / `DoctorPass123!`
3. Access: Assigned patients, consultations, appointments
4. Test: Create prescription, add vital signs

### Login as Staff
1. Go to `/auth/login`
2. Enter: `staff@medicalcity.com` / `StaffPass123!`
3. Access: Clinic patients, create new patients/appointments
4. Test: Create new patient via form

---

## JWT Token Structure

When a user logs in, Supabase returns a JWT with these claims:

```json
{
  "sub": "user-uuid",
  "email": "doctor@medicalcity.com",
  "email_confirmed": true,
  "iss": "https://knbnvwlmxbidfiixnylg.supabase.co/auth/v1",
  "aud": "authenticated",
  "iat": 1704067200,
  "exp": 1704153600,
  "user_metadata": {
    "clinic_id": "clinic-uuid",
    "user_role": "doctor",
    "full_name": "Dr. James Wilson"
  }
}
```

The frontend reads `user_metadata.user_role` and `user_metadata.clinic_id` for:
- Conditional UI rendering (show/hide menu items)
- Route guards (redirect unauthorized users)
- API request headers (sent with every fetch)

---

## RLS Policies Reference

All database tables enforce these policies:

| Table | Admin | Doctor | Staff |
|-------|-------|--------|-------|
| patients | ✅ All | ✅ Clinic only | ✅ Clinic only |
| appointments | ✅ All | ✅ Clinic only | ✅ Clinic only |
| prescriptions | ✅ All | ✅ Create/Edit | ❌ View only |
| vital_signs | ✅ All | ✅ Clinic only | ❌ View only |
| consultation_notes | ✅ All | ✅ Create/Edit | ❌ View only |

---

## API Response Examples

### 401 Unauthorized (Invalid/Expired Token)
```json
{
  "error": "Unauthorized",
  "status": 401
}
```
**Frontend action:** Redirect to `/auth/login`, clear session

### 403 Forbidden (Role/Clinic Access Denied)
```json
{
  "error": "You don't have permission to access this clinic",
  "status": 403
}
```
**Frontend action:** Show error toast, redirect to clinic selector

### 200 Success (Valid Request)
```json
{
  "data": [{ "id": "...", "clinic_id": "...", "full_name": "John" }],
  "status": 200
}
```

---

## Troubleshooting

### User can't log in
- Check email/password in Supabase > Auth > Users
- Verify `email_confirm` is true
- Check for duplicate emails

### User sees 403 errors
- Verify `clinic_id` in user_metadata matches patient's `clinic_id`
- Check RLS policy is enabled on the table
- Admin should have `user_role: 'admin'` (overrides clinic checks)

### JWT claims missing
- Logout and log back in
- Check browser DevTools > Application > Cookies > `sb-...`
- Token should contain `user_metadata` with `clinic_id` and `user_role`

---

## Summary

✅ Three roles: Admin, Doctor, Staff  
✅ JWT-based authentication with metadata  
✅ Database-layer RLS enforcement  
✅ API-layer role verification  
✅ Frontend UI conditional on roles  
✅ Test users pre-configured for each role  

**Ready to test multi-role workflows!**
