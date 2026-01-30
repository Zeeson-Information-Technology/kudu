# Kudu Health Facility Dashboard - Premium Design System

## Design Philosophy

The facility dashboard is engineered with **deep design thinking** specifically for healthcare products, prioritizing:

### 1. **Information Hierarchy & Scanability**
- **Hero Section**: Clear facility status with date context
- **Primary Metrics**: Today's critical KPIs prominent and color-coded by health status
- **Secondary Sections**: Activity flows, queue status, compliance metrics
- **Progressive Disclosure**: Advanced options in quick actions footer

### 2. **Healthcare-Specific Design Patterns**

#### Status Indicators
- **Healthy** (Green #16a34a): Normal operations, high compliance, positive metrics
- **Warning** (Orange #ea580c): Attention needed, pending tasks, moderate concerns
- **Critical** (Red #dc2626): Immediate action required, system issues, safety concerns
- **Info** (Blue #0284c7): Neutral information, syncing, background processes

#### Trust & Compliance Signaling
- **Audit-ready design**: Compliance status card prominently displays data integrity metrics
- **Consent tracking**: Visual indicators of consent form capture rates
- **Transparency**: Real-time sync status and data freshness
- **Storage visibility**: Users understand data capacity and backup status

### 3. **Operational Efficiency**
- **Queue Management**: Real-time view of patient flow across triage, consultation, lab, pharmacy
- **Activity Timeline**: Recent events for clinical context and situational awareness
- **System Health**: Uptime, sync status, and storage metrics at a glance
- **Quick Actions**: Fast navigation to common workflows

### 4. **Visual Design Principles**

#### Color Palette
```css
Primary: #0f6d6a (Teal - trust, healthcare, calm)
Success: #16a34a (Green - healthy status)
Warning: #ea580c (Orange - attention needed)
Critical: #dc2626 (Red - urgent action)
Info: #0284c7 (Blue - informational)
Neutral: #64748b (Slate - muted, secondary)
Background: #f8fafc (Cool light gray)
Surface: #ffffff (Clean white)
```

#### Typography
- **Headlines**: 700 weight, -0.02em letter-spacing (modern, tight)
- **Body**: 400-600 weight, 1.6 line-height (readable, airy)
- **Metrics**: Large numbers (2.2rem) for quick scanning
- **Labels**: Uppercase, 0.75rem, 0.08em letter-spacing (crisp, professional)

#### Spacing System
```
xs: 0.5rem    (tight)
sm: 0.75rem   (compact)
md: 1rem      (standard)
lg: 1.5rem    (generous)
xl: 2rem      (spacious)
```

#### Shadows (Depth)
- xs: Minimal elevation (inputs, labels)
- sm: Subtle lift (cards, buttons on hover)
- md: Medium depth (hovered metrics, modals)
- lg: Strong elevation (important modals, overlays)

### 5. **Component Architecture**

#### MetricCard
- Purpose: Display single KPI with trend data
- Health Status: Color-coded border and background
- Trend Indicator: Visual up/down arrow with percentage
- Hover State: Subtle lift animation for interactivity
- Use Case: Today's metrics, queue counts, compliance percentages

#### ActivityCard
- Purpose: Show recent clinical and operational events
- Activity Typing: Different icons/colors for patients, encounters, lab, sync, alerts
- Temporal Context: "2 min ago", "1 hour ago" for recency
- Scannable List: Fixed icon area, left-aligned content
- Call-to-Action: "View all →" for full activity log

#### HealthStatus
- Purpose: System operational status at a glance
- States: Operational, Degraded, Offline, Syncing
- Supporting Info: Uptime percentage, last sync timestamp
- Action Slot: Force sync button or status management
- Visual Design: Contextual background color coding

#### StatsGrid
- Purpose: Summary statistics with flexible column layout
- Responsive: Auto-fit to available width (cols 2-4)
- Icon Support: Optional emoji/SVG for visual reference
- Metadata: Secondary text for context ("Active records", "Total visits")
- Interaction: Links to detailed views

### 6. **Information Architecture**

Dashboard Flow:
1. **Header** - Facility recognition, date context
2. **System Health** - Operational status banner (calms user anxiety)
3. **Key Metrics** - Today's 4 critical KPIs with trends
4. **Statistics** - Broader facility numbers (active patients, encounters, etc.)
5. **Activity & Queue** - Real-time operational view (twin cards)
6. **System Health Deep** - Compliance and storage metrics
7. **Quick Actions** - Common workflow shortcuts

### 7. **Healthcare UX Best Practices**

- **Minimize Cognitive Load**: Use color, icons, and spatial grouping instead of text
- **Status at a Glance**: No need to read sentences to understand system state
- **Offline-First Mindset**: Sync status always visible, never hidden
- **Audit Trail Awareness**: Users understand data is logged and reviewed
- **Consent Centered**: Consent capture rate visible (supports privacy claims)
- **Clinical Safety**: Critical alerts and warnings prominent, not buried
- **Performance Context**: Queue length and wait times inform clinical decisions

### 8. **Responsive Behavior**

#### Desktop (1200px+)
- Multi-column metrics grid (4 columns)
- Wide stats grid
- Side-by-side activity and queue

#### Tablet (768px-1199px)
- Metrics grid adapts (2-3 columns)
- Stats stack appropriately
- Activity and queue stack vertically

#### Mobile (< 768px)
- Single column layout
- Simplified metrics (larger touch targets)
- Full-width cards and buttons
- Horizontal scroll for activity (swipeable)

## Component Documentation

### MetricCard Props
```typescript
interface MetricCardProps {
  label: string;              // "Total Patients Today"
  value: string | number;     // 24
  unit?: string;              // "" or "min", "GB"
  trend?: {
    direction: "up" | "down" | "neutral";
    value: number;            // 8 (% change)
  };
  icon?: ReactNode;           // Optional emoji or SVG
  status?: "healthy" | "warning" | "critical";
  description?: string;       // "Compared to yesterday"
  onClick?: () => void;       // For navigation
}
```

### ActivityCard Props
```typescript
interface ActivityItem {
  id: string;
  label: string;              // "New patient registered: Amara Okonkwo"
  time: string;               // "2 min ago"
  type: "patient" | "encounter" | "lab" | "sync" | "alert";
}

interface ActivityCardProps {
  title: string;
  items: ActivityItem[];
  icon?: ReactNode;
  viewAllHref?: string;       // Link to full activity view
}
```

### HealthStatus Props
```typescript
interface HealthStatusProps {
  status: "operational" | "degraded" | "offline" | "syncing";
  uptime?: string;            // "99.9% (Last 30 days)"
  lastSync?: string;          // "Just now"
  actions?: ReactNode;        // Action buttons
}
```

### StatsGrid Props
```typescript
interface StatItem {
  id: string;
  title: string;              // "Registered Patients"
  value: string | number;     // "342"
  metadata?: string;          // "Active records"
  icon?: ReactNode;           // "👥"
  href?: string;              // Link to detail view
}

interface StatsGridProps {
  stats: StatItem[];
  columns?: 2 | 3 | 4;        // Grid column count
  title?: string;             // Section title
}
```

## Future Enhancements

1. **Real Data Integration**
   - Connect to PouchDB for offline patient counts
   - Wire metrics to actual encounter data
   - Pull sync status from replication service
   - Show compliance from audit logs

2. **Drill-Down Views**
   - Click metrics to see detailed breakdowns
   - Expand activity for full event details
   - Link queue status to actual patient records

3. **Alerts & Notifications**
   - Critical alerts in header banner
   - Real-time update badges
   - Background syncing status

4. **Customization**
   - Role-based metric visibility
   - Configurable dashboard sections
   - Facility-specific branding

5. **Mobile Optimization**
   - Touch-friendly components
   - Simplified metric display
   - Bottom sheet navigation

## Accessibility Considerations

- Color not sole indicator (use icons, patterns)
- Sufficient contrast ratios (WCAG AA minimum)
- Semantic HTML with proper headings
- ARIA labels for status indicators
- Keyboard navigation support
- Focus visible states (2px solid outline)

## Performance Notes

- Lazy load activity history (pagination)
- Virtual scrolling for large queues
- Progressive loading with skeletons
- Cache facility metadata
- Debounce sync status updates
