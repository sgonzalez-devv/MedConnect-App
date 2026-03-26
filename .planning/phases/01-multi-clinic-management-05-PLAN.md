---
phase: 01-multi-clinic-management
plan: 05
type: execute
wave: 4
depends_on: [01-01]
files_modified:
  - components/group-analytics/comparative-chart.tsx
  - components/group-analytics/trend-chart.tsx
  - components/group-analytics/growth-rate-card.tsx
  - app/(app)/groups/layout.tsx
  - app/(app)/groups/page.tsx
  - app/(app)/groups/[groupId]/dashboard/page.tsx
autonomous: true
requirements: [GROUP-01, GROUP-02, GROUP-03]
user_setup: []

must_haves:
  truths:
    - "Group dashboard aggregates metrics across multiple clinics"
    - "Comparative chart shows clinic-by-clinic appointment metrics"
    - "Trend chart shows multi-clinic trends over time"
    - "Growth rate card displays YoY growth percentages"
    - "Groups list page displays all available groups"
    - "Clicking group navigates to group dashboard"
  artifacts:
    - path: "components/group-analytics/comparative-chart.tsx"
      provides: "Bar chart comparing metrics across clinics in a group"
      min_lines: 40
    - path: "components/group-analytics/trend-chart.tsx"
      provides: "Line chart showing trends across clinics over time"
      min_lines: 40
    - path: "components/group-analytics/growth-rate-card.tsx"
      provides: "Card displaying growth rate metrics"
      min_lines: 30
    - path: "app/(app)/groups/page.tsx"
      provides: "Groups list/selector page"
      min_lines: 40
    - path: "app/(app)/groups/[groupId]/dashboard/page.tsx"
      provides: "Group analytics dashboard"
      min_lines: 100
  key_links:
    - from: "app/(app)/groups/[groupId]/dashboard/page.tsx"
      to: "lib/mock-data.ts"
      via: "getGroupMetrics function"
      pattern: "getGroupMetrics"
    - from: "components/group-analytics/*.tsx"
      to: "recharts"
      via: "Bar, Line, ComposedChart components"
      pattern: "from 'recharts'"
---

<objective>
Implement group-level analytics dashboard: create composable chart components (comparative, trend, growth rate) using Recharts, build group metrics aggregation across multiple clinics, establish group routing structure (/groups/[groupId]), and create group list page.

Purpose: Enable multi-clinic owners/managers to view aggregated analytics across their clinic groups, compare performance between clinics, and track trends and growth metrics. Groups are optional (single clinics work standalone).

Output: Group dashboard with 3 chart types, group list page, and routing structure. Establishes foundation for advanced group features.
</objective>

<execution_context>
@.planning/phases/01-multi-clinic-management-RESEARCH.md
</execution_context>

<context>
**Foundation:**
- Plan 01: getGroupMetrics function and GroupMetrics type defined
- Mock data: clinicGroups array with 1 sample group containing clinic-001 and clinic-002

**Chart library:**
- Recharts 2.15.0 already installed and used in dashboard
- Supports multi-series bar charts, line charts, composed charts
- No additional dependencies needed

**Metrics structure:**
- GroupMetrics includes: totalPatients, totalAppointments, appointmentsThisMonth, completedAppointmentsThisMonth, appointmentsByClinic
- appointmentsByClinic: { 'clinic-001': 15, 'clinic-002': 12 } — enables comparison

**Routing:**
- /groups — group selector/list
- /groups/[groupId] — group-scoped (similar to clinic layout)
- /groups/[groupId]/dashboard — group analytics
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create comparative chart component for clinic metrics</name>
  <files>components/group-analytics/comparative-chart.tsx</files>
  <action>
    Create new directory components/group-analytics/, then create comparative-chart.tsx:
    
    1. Add "use client" directive
    
    2. Imports:
       import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
       import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
       import type { GroupMetrics } from '@/lib/types'
    
    3. Export function ComparativeChart({ metrics, groupId }: { metrics: GroupMetrics; groupId: string }):
       - Transform appointmentsByClinic into chart data array:
         const data = Object.entries(metrics.appointmentsByClinic).map(([clinicId, count]) => ({
           clinicId,
           count,
         }))
       
       - Render Card with title "Citas por Clínica" (Appointments by Clinic)
       - Render ResponsiveContainer (height 300)
       - Inside: BarChart with data, Bar (dataKey="count", fill="var(--clinic-primary, #teal)")
       - Add XAxis (clinicId), YAxis, CartesianGrid, Tooltip, Legend
    
    4. Keep styling minimal; use Recharts defaults with Tailwind card wrapper
  </action>
  <verify>
    npm run build succeeds. Check:
    - No TypeScript errors on comparative-chart.tsx
    - Recharts imports resolve
    - GroupMetrics type imports correctly
  </verify>
  <done>
    - components/group-analytics/comparative-chart.tsx created
    - Bar chart renders clinic-by-clinic comparison
    - XAxis shows clinic IDs, YAxis shows appointment counts
    - Legend and Tooltip display correctly
  </done>
</task>

<task type="auto">
  <name>Task 2: Create trend chart component for multi-clinic trends</name>
  <files>components/group-analytics/trend-chart.tsx</files>
  <action>
    Create components/group-analytics/trend-chart.tsx:
    
    1. Add "use client" directive
    
    2. Imports:
       import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
       import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
       import type { GroupMetrics } from '@/lib/types'
    
    3. Export function TrendChart({ metrics, groupId }: { metrics: GroupMetrics; groupId: string }):
       - This is a simplified trend (since mock data is static)
       - Create mock trend data showing appointments over last 6 months:
         const trendData = [
           { month: 'Jan', clinic001: 10, clinic002: 8 },
           { month: 'Feb', clinic001: 12, clinic002: 9 },
           { month: 'Mar', clinic001: 15, clinic002: 12 },
         ]
       
       - Render Card with title "Tendencia de Citas" (Appointment Trends)
       - Render ResponsiveContainer (height 300)
       - Inside: LineChart with trendData
       - Add multiple Line components:
         * Line for clinic-001 (dataKey="clinic001")
         * Line for clinic-002 (dataKey="clinic002")
       - Add XAxis (month), YAxis, CartesianGrid, Tooltip, Legend
    
    Note: In production, would compute actual trends from historical data. Mock data is sufficient for MVP.
  </action>
  <verify>
    npm run build succeeds. Check:
    - No TypeScript errors on trend-chart.tsx
    - Recharts LineChart imports resolve
  </verify>
  <done>
    - components/group-analytics/trend-chart.tsx created
    - Line chart renders multi-clinic trend lines
    - XAxis shows months, YAxis shows counts
    - Multiple lines show clinic-specific trends
  </done>
</task>

<task type="auto">
  <name>Task 3: Create growth rate card component</name>
  <files>components/group-analytics/growth-rate-card.tsx</files>
  <action>
    Create components/group-analytics/growth-rate-card.tsx:
    
    1. Add "use client" directive
    
    2. Imports:
       import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
       import { TrendingUp, TrendingDown } from 'lucide-react'
       import type { GroupMetrics } from '@/lib/types'
    
    3. Export function GrowthRateCard({ metrics, groupId }: { metrics: GroupMetrics; groupId: string }):
       - Calculate growth rate (mock: fixed percentages for demo, or compute from mock data)
         const growthRate = 12.5 // Example: 12.5% YoY growth
         const previousTotal = Math.round(metrics.totalAppointments / (1 + growthRate / 100))
       
       - Render Card with title "Tasa de Crecimiento" (Growth Rate)
       - Display:
         * Large number: "{growthRate}%"
         * TrendingUp or TrendingDown icon (based on sign)
         * Subtitle: "YoY Growth"
         * Supporting text: "Previous: {previousTotal} appointments"
       
       - Style with Tailwind:
         * bg-gradient-to-br from-green-50 to-teal-50 (if positive growth)
         * Text color: green-700 or red-700 (based on trend)
  </action>
  <verify>
    npm run build succeeds. Check:
    - No TypeScript errors on growth-rate-card.tsx
    - All imports resolve
  </verify>
  <done>
    - components/group-analytics/growth-rate-card.tsx created
    - Growth rate displayed prominently
    - Trend indicator (up/down) shows direction
    - Supporting metrics (previous count) visible
  </done>
</task>

<task type="auto">
  <name>Task 4: Create group layout wrapper</name>
  <files>app/(app)/groups/layout.tsx</files>
  <action>
    Create app/(app)/groups/layout.tsx:
    
    1. Add "use client" directive
    
    2. Imports:
       import { ReactNode } from 'react'
    
    3. Export default function GroupLayout({ children }: { children: ReactNode }):
       - Return simple wrapper: <>{children}</>
       
       Note: No clinic context sync needed for groups (groups don't filter by clinic context).
       Groups are read-only aggregate views. If future authentication required, this layout can handle group authorization.
  </action>
  <verify>
    npm run build succeeds. Check:
    - No TypeScript errors
  </verify>
  <done>
    - app/(app)/groups/layout.tsx created
    - Simple wrapper, no state management needed
  </done>
</task>

<task type="auto">
  <name>Task 5: Create groups list page</name>
  <files>app/(app)/groups/page.tsx</files>
  <action>
    Create app/(app)/groups/page.tsx:
    
    1. Add "use client" directive
    
    2. Imports:
       import Link from 'next/link'
       import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
       import { Button } from '@/components/ui/button'
       import { clinicGroups } from '@/lib/mock-data'
       import { Building2, ArrowRight } from 'lucide-react'
    
    3. Export default function GroupsPage():
       - Render page header: "Tus Grupos de Clínicas" (Your Clinic Groups)
       - Render description: "Gestiona múltiples clínicas desde una vista consolidada"
       - Map over clinicGroups array and render Card for each:
         * Card title: group.name
         * Card description: group.clinicIds.length + " clínicas" (clinics)
         * Card content: List clinic names (map over clinicIds and get clinic name from clinics array)
         * Button: Link to /groups/[groupId]/dashboard with text "Ver Dashboard"
       
       - Layout: Grid of cards (1 column on mobile, 2 on md+)
       
       - If no groups exist: Show empty state message "No hay grupos creados aún" (No groups created yet)
  </action>
  <verify>
    npm run build succeeds. Check:
    - No TypeScript errors
    - clinicGroups imports correctly
    - All UI components resolve
  </verify>
  <done>
    - app/(app)/groups/page.tsx created
    - Groups list displayed with card layout
    - Each group shows name and clinic count
    - Links to group dashboard work
  </done>
</task>

<task type="auto">
  <name>Task 6: Create group dashboard with analytics charts</name>
  <files>app/(app)/groups/[groupId]/dashboard/page.tsx</files>
  <action>
    Create app/(app)/groups/[groupId]/dashboard/page.tsx:
    
    1. Add "use client" directive
    
    2. Imports:
       import { getGroupMetrics, clinicGroups } from '@/lib/mock-data'
       import { ComparativeChart } from '@/components/group-analytics/comparative-chart'
       import { TrendChart } from '@/components/group-analytics/trend-chart'
       import { GrowthRateCard } from '@/components/group-analytics/growth-rate-card'
       import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
    
    3. Export default function GroupDashboard({ params }: { params: { groupId: string } }):
       - Get group from clinicGroups array: const group = clinicGroups.find(g => g.id === params.groupId)
       - If not found: throw notFound() or return error message
       - Get metrics: const metrics = getGroupMetrics(params.groupId)
       
       - Render page structure:
         * Header: group.name title
         * Summary cards (3 columns on lg, stack on mobile):
           - "Pacientes Totales": metrics.totalPatients
           - "Citas Total": metrics.totalAppointments
           - "Citas Este Mes": metrics.appointmentsThisMonth
         * Charts (full-width, stack vertically):
           - ComparativeChart (appointments by clinic)
           - TrendChart (multi-clinic trends)
           - GrowthRateCard (YoY growth)
  </action>
  <verify>
    npm run build succeeds. Check:
    - No TypeScript errors on group dashboard
    - All chart component imports resolve
    - getGroupMetrics imports correctly
  </verify>
  <done>
    - app/(app)/groups/[groupId]/dashboard/page.tsx created
    - Group dashboard displays aggregated metrics
    - Comparative, trend, and growth charts render
    - Summary cards show key metrics
    - Page loads without errors for valid groupId
  </done>
</task>

</tasks>

<verification>
Before marking plan complete:

1. **Build success:** `npm run build` succeeds with no TypeScript errors
2. **Groups list page:**
   - Navigate to /groups
   - Verify group (Grupo Central & Naco) displayed in card
   - Verify clinic count shown (2 clínicas)
   - Verify link to /groups/[groupId]/dashboard works
3. **Group dashboard:**
   - Navigate to /groups/group-001/dashboard
   - Verify page loads without errors
   - Verify summary cards display (total patients, total appointments, this month)
4. **Chart components:**
   - Verify comparative chart renders (bar chart, clinic-001 vs clinic-002 appointments)
   - Verify trend chart renders (line chart with 2 lines)
   - Verify growth rate card renders with percentage and icon
5. **Data accuracy:**
   - Comparative chart bar values match appointmentsByClinic from metrics
   - Summary cards show correct aggregated counts
6. **Responsive layout:**
   - Charts stack vertically on mobile
   - Cards responsive to screen size
7. **No console errors:** Open DevTools and verify clean console
</verification>

<success_criteria>
- ✅ Build succeeds: `npm run build` outputs "Compiled successfully"
- ✅ Groups list page: /groups displays all clinic groups in card layout
- ✅ Group dashboard: /groups/[groupId]/dashboard displays aggregated analytics
- ✅ Comparative chart: Bar chart shows clinic-by-clinic appointment metrics
- ✅ Trend chart: Line chart shows multi-clinic trends over time
- ✅ Growth rate card: Displays YoY growth percentage with indicator
- ✅ Summary cards: Key metrics (total patients, appointments, this month) displayed
- ✅ Responsive layout: Charts and cards responsive to screen sizes

**Test with:**
- Navigate to /groups and verify group list
- Click "Ver Dashboard" to navigate to /groups/group-001/dashboard
- Verify all 3 chart types render without errors
- Verify summary card metrics are accurate
- Open DevTools console and verify no errors
- Test responsive layout on mobile/tablet sizes
</success_criteria>

<output>
After completion, create `.planning/phases/01-multi-clinic-management/01-05-SUMMARY.md` documenting:
- Group analytics chart components and implementation
- Group metrics aggregation pattern
- Group dashboard structure and data display
- Ready for next phase: authentication and authorization
</output>
