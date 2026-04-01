# Permisos por Rol — MedConnect

> **Última actualización:** Abril 2026  
> Los roles son asignados **manualmente por el administrador** a través de Supabase.  
> No existe registro público — todas las cuentas son creadas por invitación.

---

## Roles disponibles

| Rol | Descripción |
|-----|-------------|
| `admin` | Acceso total al sistema. Gestiona clínicas, usuarios y configuración global. |
| `doctor` | Profesional médico. Gestiona su cartera de pacientes y expedientes clínicos. |
| `staff` | Personal administrativo. Gestiona citas y datos básicos de pacientes. |

---

## 🔴 Admin — Acceso Total

El admin es el único rol que puede configurar el sistema desde cero.

### Clínicas
| Acción | ✅ / ❌ |
|--------|--------|
| Ver todas las clínicas del sistema | ✅ |
| Crear una nueva clínica | ✅ |
| Editar datos de cualquier clínica | ✅ |
| Eliminar una clínica | ✅ |

### Usuarios & Accesos
| Acción | ✅ / ❌ |
|--------|--------|
| Crear cuentas de usuario (doctor / staff) | ✅ (vía Supabase Dashboard) |
| Asignar `clinic_id` y `user_role` a un usuario | ✅ (vía Supabase Dashboard) |
| Ver la lista de todos los usuarios | ✅ |
| Revocar acceso a un usuario | ✅ |

### Pacientes
| Acción | ✅ / ❌ |
|--------|--------|
| Ver pacientes de **cualquier** clínica | ✅ |
| Crear / editar pacientes | ✅ |
| Eliminar pacientes | ✅ |

### Citas
| Acción | ✅ / ❌ |
|--------|--------|
| Ver citas de **cualquier** clínica | ✅ |
| Crear / editar / cancelar citas | ✅ |
| Eliminar citas | ✅ |

### Expediente clínico
| Acción | ✅ / ❌ |
|--------|--------|
| Ver notas de consulta | ✅ |
| Crear / editar notas de consulta | ✅ |
| Ver / crear recetas médicas | ✅ |
| Ver / registrar signos vitales | ✅ |
| Ver / registrar historial médico | ✅ |
| Ver / registrar vacunas | ✅ |
| Subir / eliminar archivos adjuntos | ✅ |

### Dashboard & Reportes
| Acción | ✅ / ❌ |
|--------|--------|
| Dashboard principal | ✅ |
| Dashboard multi-clínica | ✅ |
| Estadísticas globales | ✅ |
| Configuración del sistema | ✅ |

---

## 🟢 Doctor — Atención Médica

El doctor trabaja **dentro de su clínica asignada** únicamente.

### Clínicas
| Acción | ✅ / ❌ |
|--------|--------|
| Ver su propia clínica | ✅ |
| Crear / editar / eliminar clínicas | ❌ |

### Pacientes
| Acción | ✅ / ❌ |
|--------|--------|
| Ver pacientes de su clínica | ✅ |
| Crear nuevos pacientes | ✅ |
| Editar datos del paciente | ✅ |
| Eliminar pacientes | ❌ |

### Citas
| Acción | ✅ / ❌ |
|--------|--------|
| Ver citas de su clínica | ✅ |
| Crear nuevas citas | ✅ |
| Editar / cancelar citas | ✅ |
| Eliminar citas | ❌ |

### Expediente clínico
| Acción | ✅ / ❌ |
|--------|--------|
| Ver notas de consulta | ✅ |
| Crear / editar notas de consulta | ✅ |
| Crear / editar recetas médicas | ✅ |
| Registrar / editar signos vitales | ✅ |
| Registrar / editar historial médico | ✅ |
| Registrar / editar vacunas | ✅ |
| Subir / eliminar archivos adjuntos | ✅ |

### Dashboard & Reportes
| Acción | ✅ / ❌ |
|--------|--------|
| Dashboard de su clínica | ✅ |
| Dashboard multi-clínica | ❌ |
| Configuración personal (perfil, horarios) | ✅ |
| Configuración global del sistema | ❌ |

---

## 🔵 Staff — Administración de Consulta

El staff es personal de recepción u operativo. **No tiene acceso a expedientes clínicos.**

### Clínicas
| Acción | ✅ / ❌ |
|--------|--------|
| Ver su propia clínica | ✅ |
| Crear / editar / eliminar clínicas | ❌ |

### Pacientes
| Acción | ✅ / ❌ |
|--------|--------|
| Ver pacientes de su clínica | ✅ |
| Crear nuevos pacientes | ✅ |
| Editar datos básicos del paciente | ✅ |
| Eliminar pacientes | ✅ *(permitido por RLS, usar con cuidado)* |

### Citas
| Acción | ✅ / ❌ |
|--------|--------|
| Ver citas de su clínica | ✅ |
| Crear nuevas citas | ✅ |
| Editar / cancelar citas | ✅ |
| Eliminar citas | ✅ |

### Expediente clínico
| Acción | ✅ / ❌ |
|--------|--------|
| Ver notas de consulta | ✅ *(solo lectura)* |
| Crear / editar notas de consulta | ❌ |
| Ver recetas médicas | ✅ *(solo lectura)* |
| Crear / editar recetas | ❌ |
| Ver signos vitales | ✅ *(solo lectura)* |
| Registrar signos vitales | ❌ |
| Ver historial médico | ✅ *(solo lectura)* |
| Registrar historial médico | ❌ |
| Ver vacunas | ✅ *(solo lectura)* |
| Subir / eliminar archivos adjuntos | ✅ |

### Dashboard & Reportes
| Acción | ✅ / ❌ |
|--------|--------|
| Dashboard de su clínica | ✅ |
| Dashboard multi-clínica | ❌ |
| Configuración personal (perfil) | ✅ |
| Configuración global del sistema | ❌ |

---

## Resumen comparativo

| Módulo / Acción | Admin | Doctor | Staff |
|-----------------|:-----:|:------:|:-----:|
| **Ver clínicas** | Todas | Solo la suya | Solo la suya |
| **Crear clínicas** | ✅ | ❌ | ❌ |
| **Crear usuarios** | ✅ | ❌ | ❌ |
| **Ver pacientes** | Todas las clínicas | Su clínica | Su clínica |
| **Crear pacientes** | ✅ | ✅ | ✅ |
| **Eliminar pacientes** | ✅ | ❌ | ✅ |
| **Ver citas** | Todas las clínicas | Su clínica | Su clínica |
| **Crear / editar citas** | ✅ | ✅ | ✅ |
| **Eliminar citas** | ✅ | ❌ | ✅ |
| **Notas de consulta** | ✅ Completo | ✅ Completo | 👁 Solo lectura |
| **Recetas médicas** | ✅ Completo | ✅ Completo | 👁 Solo lectura |
| **Signos vitales** | ✅ Completo | ✅ Completo | 👁 Solo lectura |
| **Historial médico** | ✅ Completo | ✅ Completo | 👁 Solo lectura |
| **Vacunas** | ✅ Completo | ✅ Completo | 👁 Solo lectura |
| **Archivos adjuntos** | ✅ | ✅ | ✅ |
| **Dashboard multi-clínica** | ✅ | ❌ | ❌ |
| **Configuración del sistema** | ✅ | ❌ | ❌ |

---

## Dónde se aplica el control de acceso

Los permisos se aplican en **tres capas** de forma simultánea:

### 1. JWT (Token de sesión)
Cada usuario tiene en su token:
```json
{
  "user_metadata": {
    "clinic_id": "uuid-de-la-clinica",
    "user_role": "doctor",
    "full_name": "Dr. Juan Pérez"
  }
}
```
El `clinic_id` **no puede ser cambiado por el usuario** — es asignado por el administrador.

### 2. RLS — Row Level Security (Base de datos)
PostgreSQL / Supabase aplica políticas automáticas en cada consulta:
- Un `doctor` o `staff` **nunca puede ver datos de otra clínica**, aunque intente manipular la petición.
- Un `admin` tiene override completo.

### 3. API Routes (Servidor Next.js)
Cada endpoint verifica el rol antes de procesar:
```
GET  /api/patients       → cualquier rol autenticado de la clínica
POST /api/clinics        → solo admin
DELETE /api/patients/:id → solo admin o staff
```

---

## Cómo asignar un rol (proceso del administrador)

1. Ir a **Supabase Dashboard** → Authentication → Users
2. Localizar el usuario recién creado
3. Editar **User Metadata**:
```json
{
  "clinic_id": "el-uuid-de-la-clinica",
  "user_role": "doctor",
  "full_name": "Nombre del usuario"
}
```
4. Guardar — el usuario deberá **cerrar sesión y volver a entrar** para que el nuevo token refleje los cambios.

---

> ⚠️ **Importante:** El registro público (`/auth/signup`) está **deshabilitado**.  
> Todas las cuentas deben ser creadas manualmente desde el panel de Supabase y luego configuradas con el rol y clínica correspondiente.
