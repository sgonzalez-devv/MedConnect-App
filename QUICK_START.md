# MedConnect v1.0 — Quick Start

## 🎯 5-Minute Setup

### 1️⃣ Create Database Tables
```
Supabase Dashboard > SQL Editor > New Query
Copy: .supabase/001-schema.sql
Run ✅
```

### 2️⃣ Enable RLS
```
Supabase Dashboard > SQL Editor > New Query
Copy: .supabase/002-rls-policies.sql
Run ✅
```

### 3️⃣ Seed Data
```bash
node scripts/setup-complete.js
```

### 4️⃣ Create Users
```bash
node scripts/create-test-users.js
```

### 5️⃣ Start Dev Server
```bash
npm run dev
```

---

## 🔓 Test Logins

| Role | Email | Password |
|------|-------|----------|
| 👨‍💼 Admin | `admin@medicalcity.com` | `AdminPass123!` |
| 👨‍⚕️ Doctor | `doctor@medicalcity.com` | `DoctorPass123!` |
| 👩‍💻 Staff | `staff@medicalcity.com` | `StaffPass123!` |

---

## 🧪 Quick Tests

✅ Login works?  
✅ Dashboard loads appointments?  
✅ Can create new patient?  
✅ Can create new appointment?  
✅ Can logout & login again?  

---

## 📚 Full Docs

- `COMPLETE_SETUP_GUIDE.md` - Complete setup guide
- `ROLES_AND_AUTHENTICATION.md` - Role definitions
- `SUPABASE_SETUP.md` - Manual SQL instructions

---

## 🚀 Deploy to Production

```bash
npm run build
npm run start
```

(Configure environment variables on hosting platform)

---

**v1.0 Status:** ✅ Ready for Production
