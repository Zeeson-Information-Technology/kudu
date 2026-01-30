# Facility Dashboard - Quick Start Guide for Developers

## 🚀 Getting Started

### View the Dashboard
1. Start the development server: `pnpm dev`
2. Navigate to `http://localhost:3000/dashboard`
3. Explore the new premium design!

### View Admin Dashboard
Navigate to `http://localhost:3000/dashboard/admin`

---

## 📦 Component Usage

### 1. MetricCard - Display KPIs with Status

```tsx
import { MetricCard } from "@/components/MetricCard";

<MetricCard
  label="Total Patients Today"
  value={24}
  unit=""
  trend={{ direction: "up", value: 8 }}
  status="healthy"
  description="Compared to yesterday"
/>
```

**Props:**
```typescript
interface MetricCardProps {
  label: string;                                  // Label text
  value: string | number;                        // Main value
  unit?: string;                                 // Unit (optional)
  trend?: { direction: "up" | "down" | "neutral"; value: number };
  icon?: ReactNode;                              // Optional icon
  status?: "healthy" | "warning" | "critical";   // Status color
  description?: string;                          // Help text
  onClick?: () => void;                          // Click handler
}
```

**Status Colors:**
- `healthy` → Green background (#16a34a)
- `warning` → Orange background (#ea580c)
- `critical` → Red background (#dc2626)

---

### 2. ActivityCard - Show Recent Events

```tsx
import { ActivityCard } from "@/components/ActivityCard";

<ActivityCard
  title="Recent Activity"
  items={[
    {
      id: "1",
      label: "New patient registered: Amara Okonkwo",
      time: "2 min ago",
      type: "patient"
    },
    {
      id: "2",
      label: "Lab results received for Case #3421",
      time: "8 min ago",
      type: "lab"
    }
  ]}
  viewAllHref="/dashboard/encounters"
/>
```

**Activity Types:**
- `patient` → 👤 (Patient registration)
- `encounter` → 📋 (Visit/consultation)
- `lab` → 🧪 (Lab results)
- `sync` → 🔄 (Data synchronization)
- `alert` → ⚠️ (System alerts)

**Props:**
```typescript
interface ActivityItem {
  id: string;
  label: string;           // Event description
  time: string;            // "2 min ago", "1 hour ago"
  type: "patient" | "encounter" | "lab" | "sync" | "alert";
}

interface ActivityCardProps {
  title: string;
  items: ActivityItem[];
  icon?: ReactNode;
  viewAllHref?: string;    // Link to full activity log
}
```

---

### 3. HealthStatus - System Status Banner

```tsx
import { HealthStatus } from "@/components/HealthStatus";

<HealthStatus
  status="operational"
  uptime="99.9% (Last 30 days)"
  lastSync="Just now"
  actions={<button className="button secondary small">Force Sync</button>}
/>
```

**Status States:**
- `operational` → Green checkmark, system running normally
- `degraded` → Orange warning, performance issues
- `offline` → Gray indicator, offline mode
- `syncing` → Purple refresh, data synchronizing

**Props:**
```typescript
interface HealthStatusProps {
  status: "operational" | "degraded" | "offline" | "syncing";
  uptime?: string;         // "99.9% (Last 30 days)"
  lastSync?: string;       // "Just now", "2 hours ago"
  actions?: ReactNode;     // Control buttons
}
```

---

### 4. StatsGrid - Display Statistics

```tsx
import { StatsGrid } from "@/components/StatsGrid";

<StatsGrid
  stats={[
    {
      id: "1",
      title: "Registered Patients",
      value: "342",
      metadata: "Active records",
      icon: "👥"
    },
    {
      id: "2",
      title: "Encounters This Month",
      value: "156",
      metadata: "Total visits",
      icon: "📊"
    }
  ]}
  columns={4}
  title="Facility Statistics"
/>
```

**Columns:**
- `2` → 2 per row (desktop)
- `3` → 3 per row (desktop)
- `4` → 4 per row (desktop)
- Auto-adjusts on mobile

**Props:**
```typescript
interface StatItem {
  id: string;
  title: string;           // Stat name
  value: string | number;  // Main value
  metadata?: string;       // Supporting text
  icon?: ReactNode;        // Icon/emoji
  href?: string;           // Click to navigate
}

interface StatsGridProps {
  stats: StatItem[];
  columns?: 2 | 3 | 4;
  title?: string;          // Optional section title
}
```

---

### 5. Dashboard Layout Components

```tsx
import { DashboardHeader, DashboardSection, DashboardGrid, DashboardCard } from "@/components/DashboardLayout";

// Header with title and date
<DashboardHeader
  title="Facility Dashboard"
  subtitle="Real-time operations"
  metadata={new Date().toLocaleDateString()}
/>

// Section with title and optional action
<DashboardSection
  title="Today's Metrics"
  action={<button>View All</button>}
>
  {/* Content here */}
</DashboardSection>

// Responsive grid container
<DashboardGrid columns={3} gap="lg">
  <DashboardCard title="Card 1">Content</DashboardCard>
  <DashboardCard title="Card 2">Content</DashboardCard>
</DashboardGrid>
```

---

## 🎨 Using Design Tokens

### Colors
```css
/* In your components */
color: var(--color-primary);      /* #0f6d6a - Teal */
color: var(--color-healthy);      /* #16a34a - Green */
color: var(--color-warning);      /* #ea580c - Orange */
color: var(--color-critical);     /* #dc2626 - Red */
color: var(--color-text);         /* #0d1b2a - Dark slate */
color: var(--color-muted);        /* #64748b - Gray */
```

### Spacing
```css
gap: var(--spacing-xs);  /* 0.5rem */
gap: var(--spacing-sm);  /* 0.75rem */
gap: var(--spacing-md);  /* 1rem */
gap: var(--spacing-lg);  /* 1.5rem */
gap: var(--spacing-xl);  /* 2rem */
```

### Shadows
```css
box-shadow: var(--shadow-xs);  /* Minimal */
box-shadow: var(--shadow-sm);  /* Subtle */
box-shadow: var(--shadow-md);  /* Medium */
box-shadow: var(--shadow-lg);  /* Strong */
box-shadow: var(--shadow-xl);  /* Maximum */
```

### Border Radius
```css
border-radius: var(--radius-sm);   /* 8px */
border-radius: var(--radius-md);   /* 12px */
border-radius: var(--radius-lg);   /* 16px */
border-radius: var(--radius-full); /* 999px (pills) */
```

### Transitions
```css
transition: all var(--transition-fast);  /* 150ms */
transition: all var(--transition-base);  /* 200ms */
transition: all var(--transition-slow);  /* 300ms */
```

---

## 📊 Data Integration Examples

### Connect to PouchDB (Example)

```tsx
'use client';

import { useEffect, useState } from "react";
import { MetricCard } from "@/components/MetricCard";
import { getDb } from "@/lib/offline/db";

export function DashboardMetrics() {
  const [metrics, setMetrics] = useState({
    totalPatients: 0,
    activeEncounters: 0,
    queueWaitTime: 0
  });

  useEffect(() => {
    const loadMetrics = async () => {
      const db = await getDb();
      
      // Fetch patient count
      const patientResult = await db.query('patients/all', {
        reduce: true,
        group: false
      });
      
      // Calculate metrics from database
      const totalPatients = patientResult.rows[0]?.value || 0;
      
      setMetrics(prev => ({
        ...prev,
        totalPatients
      }));
    };

    loadMetrics();
  }, []);

  return (
    <MetricCard
      label="Total Patients"
      value={metrics.totalPatients}
      status="healthy"
    />
  );
}
```

---

## 🔄 Real-Time Updates

### Subscribe to Activity Events

```tsx
'use client';

import { useEffect, useState } from "react";
import { ActivityCard } from "@/components/ActivityCard";

export function RecentActivity() {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    // Example: Subscribe to encounter events
    const handleEncounterEvent = (event) => {
      const newActivity = {
        id: event.id,
        label: `${event.type}: ${event.description}`,
        time: formatTime(event.timestamp),
        type: 'encounter'
      };
      
      setActivities(prev => [newActivity, ...prev].slice(0, 5));
    };

    // Listen to events
    window.addEventListener('encounter:created', handleEncounterEvent);
    
    return () => {
      window.removeEventListener('encounter:created', handleEncounterEvent);
    };
  }, []);

  return <ActivityCard title="Recent Activity" items={activities} />;
}
```

---

## 🎯 Common Patterns

### Page with Multiple Sections

```tsx
'use client';

export default function DashboardPage() {
  return (
    <main className="dashboard-page">
      {/* Page Header */}
      <DashboardHeader
        title="Facility Dashboard"
        subtitle="Real-time insights"
      />

      {/* Health Status */}
      <DashboardSection>
        <HealthStatus status="operational" />
      </DashboardSection>

      {/* Key Metrics Grid */}
      <DashboardSection title="Today's Metrics">
        <div className="metrics-grid">
          <MetricCard {...metric1} />
          <MetricCard {...metric2} />
          <MetricCard {...metric3} />
          <MetricCard {...metric4} />
        </div>
      </DashboardSection>

      {/* Twin Card Layout */}
      <DashboardSection title="Operations">
        <DashboardGrid columns={2}>
          <ActivityCard {...activityProps} />
          <DashboardCard title="Queue Status">
            {/* Queue content */}
          </DashboardCard>
        </DashboardGrid>
      </DashboardSection>
    </main>
  );
}
```

### Responsive Card Grid

```tsx
<DashboardSection title="Statistics">
  <StatsGrid
    stats={stats}
    columns={4}  // 4 on desktop, auto-adjusts on mobile
  />
</DashboardSection>
```

---

## 🧪 Testing Components

### Test MetricCard with Different States

```tsx
import { render, screen } from "@testing-library/react";
import { MetricCard } from "@/components/MetricCard";

describe("MetricCard", () => {
  it("displays healthy status in green", () => {
    render(
      <MetricCard
        label="Test"
        value="10"
        status="healthy"
      />
    );
    const card = screen.getByText("Test").closest(".metric-card");
    expect(card).toHaveStyle("border-color: rgba(34, 197, 94, 0.2)");
  });

  it("shows trend with up arrow", () => {
    render(
      <MetricCard
        label="Test"
        value="10"
        trend={{ direction: "up", value: 15 }}
      />
    );
    expect(screen.getByText("15%")).toBeInTheDocument();
  });
});
```

---

## 📱 Mobile Optimization

All components are fully responsive. Key breakpoints:

```css
/* Tablet and above */
@media (min-width: 768px) {
  /* 2+ column layouts */
}

/* Mobile */
@media (max-width: 767px) {
  /* Single column layouts */
  /* Larger touch targets (44px min) */
  /* Stacked sections */
}
```

---

## ⌨️ Keyboard Navigation

All components support:
- Tab navigation through all interactive elements
- Enter/Space to activate buttons
- Arrow keys for list navigation
- Escape to close modals

---

## ♿ Accessibility

- WCAG AA color contrast compliance
- Semantic HTML (headings, landmarks)
- ARIA labels for status indicators
- Focus visible states (2px outline)
- Keyboard navigation throughout

---

## 📚 Documentation Files

- **DASHBOARD_DESIGN.md** - Design system reference
- **DASHBOARD_REDESIGN.md** - Implementation overview
- **IMPLEMENTATION_SUMMARY.md** - Detailed deliverables
- **This file** - Quick start guide

---

## 🐛 Troubleshooting

### Metric Card Colors Not Showing
Make sure CSS custom properties are loaded:
```css
:root {
  --color-healthy: #16a34a;
  --color-warning: #ea580c;
  --color-critical: #dc2626;
}
```

### Layout Not Responsive
Check that viewport meta tag is in HTML head:
```html
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

### Component Styling Issues
Ensure `globals.css` is imported in layout:
```tsx
import "./globals.css";
```

---

## 🎓 Learning Resources

1. **TypeScript**: Review component interfaces for type safety
2. **React Patterns**: Study how hooks are used in components
3. **Tailwind/CSS**: Understand design tokens system
4. **Healthcare UX**: Read DASHBOARD_DESIGN.md for principles
5. **Component Library**: Explore each component's JSDoc

---

## 🤝 Contributing

When adding new features:
1. Use design tokens (colors, spacing, shadows)
2. Maintain responsive breakpoints
3. Add TypeScript interfaces
4. Include JSDoc comments
5. Test on mobile devices
6. Update documentation

---

## 📞 Support

For questions or issues:
1. Check the documentation files
2. Review component source code comments
3. Test with mock data first
4. Debug with browser dev tools

---

## ✨ Summary

The facility dashboard is now:
- ✅ Premium and modern
- ✅ Healthcare-optimized
- ✅ Fully responsive
- ✅ Accessible
- ✅ Well-documented
- ✅ Ready for data integration

Start with the components above and integrate real data from your PouchDB/API layer.

Happy coding! 🚀
