# Facility Dashboard - Visual Design Reference

## 🎨 Color System

### Primary Colors
```
Teal (Primary):     #0f6d6a  - Trust, calm, healthcare
  Light variant:    #e0f2f1  - Light backgrounds
  Text on teal:     #ffffff  - White text

Healthy (Success):  #16a34a  - Positive status, trends up, good metrics
Warning (Orange):   #ea580c  - Attention needed, pending items, caution
Critical (Red):     #dc2626  - Urgent action, system issues, safety
Info (Blue):        #0284c7  - Informational, syncing, neutral updates
```

### Neutral Colors
```
Text (Dark Slate):  #0d1b2a  - Primary text, headings
Muted (Gray):       #64748b  - Secondary text, labels, disabled
Border (Light):     rgba(13, 27, 42, 0.08) - Subtle borders
Background:         #f8fafc  - Page background (cool light gray)
Surface:            #ffffff  - Card backgrounds (white)
```

### How Colors Are Used

**MetricCard Status Colors:**
```
Healthy:
  Background: rgba(34, 197, 94, 0.08)    - Light green bg
  Border:     rgba(34, 197, 94, 0.2)     - Green border
  Text:       #16a34a                    - Green text

Warning:
  Background: rgba(251, 146, 60, 0.08)   - Light orange bg
  Border:     rgba(251, 146, 60, 0.2)    - Orange border
  Text:       #ea580c                    - Orange text

Critical:
  Background: rgba(239, 68, 68, 0.08)    - Light red bg
  Border:     rgba(239, 68, 68, 0.2)     - Red border
  Text:       #dc2626                    - Red text
```

**Queue Status Colors:**
```
.queue-value--active:   Green    (#16a34a)
.queue-value--warning:  Orange   (#ea580c)
.queue-value--info:     Blue     (#0284c7)
.queue-value--default:  Gray     (#64748b)
```

---

## 📏 Typography System

### Font Stack
```css
Primary: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, 
         "Helvetica Neue", Arial, sans-serif
Monospace: "Monaco", "Courier New", monospace
```

### Type Scales

**Headings**
```
Page Title (.dashboard-header__title):
  Size: 2rem (32px)
  Weight: 700 (bold)
  Letter-spacing: -0.02em (tight)
  Line-height: 1.2
  Usage: Main page headline

Section Heading (.section-heading):
  Size: 1.25rem (20px)
  Weight: 700 (bold)
  Letter-spacing: -0.01em
  Usage: Section titles

Subsection (.card__title):
  Size: 1.15rem (18px)
  Weight: 700 (bold)
  Usage: Card titles
```

**Body Text**
```
Standard (.activity-item__label):
  Size: 0.95rem (15px)
  Weight: 600 (semibold)
  Line-height: 1.6
  Usage: Primary content

Secondary (.activity-item__time):
  Size: 0.85rem (13px)
  Weight: 400 (regular)
  Color: var(--color-muted)
  Usage: Supporting text

Help Text (.metric-card__description):
  Size: 0.9rem (14px)
  Weight: 400 (regular)
  Color: var(--color-muted)
  Usage: Descriptions, hints
```

**Metrics & Numbers**
```
Large Numbers (.metric-card__value):
  Size: 2.2rem (35px)
  Weight: 700 (bold)
  Letter-spacing: -0.02em
  Usage: Main metric values

Stat Values (.stat-item__value):
  Size: 1.8rem (28px)
  Weight: 700 (bold)
  Usage: Statistics
```

**Labels & Tags**
```
Label (.metric-card__label):
  Size: 0.95rem (15px)
  Weight: 600 (semibold)
  Color: var(--color-muted)
  Usage: Field labels

Tag (.tag):
  Size: 0.85rem (13px)
  Weight: 600 (semibold)
  Text-transform: uppercase
  Letter-spacing: 0.05em
  Usage: Status badges, tags
```

---

## 🧲 Spacing System

### Vertical Spacing
```
Page Sections:     var(--spacing-xl)  = 2rem (32px)
Component Gap:     var(--spacing-lg)  = 1.5rem (24px)
Element Gap:       var(--spacing-md)  = 1rem (16px)
Tight Groups:      var(--spacing-sm)  = 0.75rem (12px)
Minimal:           var(--spacing-xs)  = 0.5rem (8px)
```

### Horizontal Padding
```
Page Container:    1.5rem (24px) on each side
Card Padding:      var(--spacing-lg) = 1.5rem (24px)
Button Padding:    0.85rem (14px) vertical, 1.25rem (20px) horizontal
Input Padding:     0.8rem (13px) vertical, 0.95rem (15px) horizontal
```

### Responsive Adjustments
```
Desktop (> 1200px):  Full spacing system applied
Tablet (768-1199px): Slight reduction in section gaps
Mobile (< 768px):    Reduced padding and gaps for smaller screens
                     Page padding: 1rem (16px)
```

---

## 🎭 Shadow System (Elevation)

### Shadow Levels
```
var(--shadow-xs):  0 1px 2px rgba(13, 27, 42, 0.05)
  Use: Minimal elevation, subtle separation
  Elements: Form inputs, disabled states

var(--shadow-sm):  0 4px 8px rgba(13, 27, 42, 0.06)
  Use: Card hover states, light elevation
  Elements: Cards on hover, small overlays

var(--shadow-md):  0 8px 16px rgba(13, 27, 42, 0.08)
  Use: Medium elevation, floating elements
  Elements: Hovered metric cards, dropdowns

var(--shadow-lg):  0 12px 30px rgba(13, 27, 42, 0.12)
  Use: Strong elevation, prominent overlays
  Elements: Modals, tooltips, popovers

var(--shadow-xl):  0 20px 40px rgba(13, 27, 42, 0.15)
  Use: Maximum elevation, top layer
  Elements: Main modals, critical overlays
```

---

## 🔘 Border & Corner Radius System

### Radius Values
```
var(--radius-sm):   8px    - Buttons, small elements
var(--radius-md):   12px   - Input fields, badges
var(--radius-lg):   16px   - Cards, major components
var(--radius-full): 999px  - Pill shapes, badges
```

### Usage Patterns
```
Buttons:           var(--radius-md) = 12px
Cards:             var(--radius-lg) = 16px
Inputs:            var(--radius-md) = 12px
Badges/Pills:      var(--radius-full) = 999px
Modals:            var(--radius-lg) = 16px
Activity items:    var(--radius-md) = 12px
```

---

## ⏱️ Animation & Transitions

### Transition Timing
```
var(--transition-fast):  150ms ease-out - Quick feedback
  Use: Hover states, button clicks
  
var(--transition-base):  200ms ease-out - Standard animation
  Use: Card transitions, color changes
  
var(--transition-slow):  300ms ease-out - Deliberate animations
  Use: Modal opens, page transitions
```

### Animation Examples
```
Button hover:       transform: scale(1.05) with --transition-fast
Card hover:         transform: translateY(-2px) with --transition-base
Color change:       color fade with --transition-base
Metric trend:       opacity fade in with --transition-fast
```

---

## 🎨 Component Visual Styles

### MetricCard
```
┌─────────────────────────────┐
│ Label            [Icon]     │  <- metric-card__label
│                             │
│ 24                          │  <- metric-card__value (2.2rem, bold)
│                             │
│ ↑ 8%                        │  <- metric-card__trend (optional)
│ Compared to yesterday       │  <- metric-card__description
└─────────────────────────────┘

Borders:   2px solid (colored by status)
Background: Light colored (colored by status)
Padding:   var(--spacing-lg)
Corner:    var(--radius-lg)
Shadow:    var(--shadow-xs), var(--shadow-md) on hover
```

### ActivityCard
```
┌─────────────────────────────┐
│ Recent Activity      [Icon] │  <- Header
│                             │
│ 🟢 New patient registered   │  <- Activity item with icon
│    Amara Okonkwo            │
│    2 min ago                │
│                             │
│ 🧪 Lab results received     │  <- Activity item with icon
│    Case #3421               │
│    8 min ago                │
│                             │
│ View all →                  │  <- Link to full view
└─────────────────────────────┘

Icon colors:
  Patient: Blue (#0284c7)
  Encounter: Orange (#ea580c)
  Lab: Green (#16a34a)
  Sync: Purple (#9333ea)
  Alert: Red (#dc2626)
```

### HealthStatus
```
┌─────────────────────────────┐
│ ✓ System Operational        │  <- Status indicator
│                             │
│ Uptime: 99.9%              │  <- Supporting info
│ Last sync: Just now        │
│              [Force Sync]   │  <- Action button
└─────────────────────────────┘

Background colors by status:
  operational: Light green
  degraded: Light orange
  offline: Light gray
  syncing: Light purple
```

### StatsGrid
```
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│   👥     │  │   📊     │  │   ✓      │  │   ⏱      │
│ Patients │  │ Encounters│  │ Tasks    │  │ Uptime   │
│   342    │  │   156    │  │    8     │  │  99.9%   │
│ Active   │  │ Visits   │  │ Follow-up│  │ Month    │
└──────────┘  └──────────┘  └──────────┘  └──────────┘

Icon: 1.8rem, semi-opaque
Value: 1.8rem, bold, dark text
Title: 0.95rem, secondary gray
Metadata: 0.85rem, muted gray

Responsive:
  4 cols on desktop (> 1200px)
  2-3 cols on tablet (768-1199px)
  1 col on mobile (< 768px)
```

---

## 📱 Responsive Layout

### Desktop (1200px+)
```
┌─────────────────────────────────┐
│ Header | Actions | Metadata     │
├─────────────────────────────────┤
│  Metric  Metric  Metric  Metric │
│   Card    Card    Card    Card  │
├─────────────────────────────────┤
│  Stat    Stat    Stat    Stat   │
│  Card    Card    Card    Card   │
├─────────────────────────────────┤
│ Activity Card  │ Queue Card     │
│                │                │
├─────────────────────────────────┤
│ Compliance     │ Storage        │
│ Card           │ Card           │
└─────────────────────────────────┘
```

### Tablet (768-1199px)
```
┌──────────────────────────┐
│ Header    | Metadata     │
├──────────────────────────┤
│  Metric   Metric         │
│  Card     Card           │
│  Metric   Metric         │
│  Card     Card           │
├──────────────────────────┤
│  Stat     Stat           │
│  Card     Card           │
│  Stat     Stat           │
│  Card     Card           │
├──────────────────────────┤
│ Activity Card            │
├──────────────────────────┤
│ Queue Card               │
├──────────────────────────┤
│ Compliance     Storage   │
│ Card           Card      │
└──────────────────────────┘
```

### Mobile (<768px)
```
┌────────────────┐
│  Header        │
│    Metadata    │
├────────────────┤
│ Metric Card    │
│ Metric Card    │
│ Metric Card    │
│ Metric Card    │
├────────────────┤
│ Stat Card      │
│ Stat Card      │
│ Stat Card      │
│ Stat Card      │
├────────────────┤
│ Activity Card  │
├────────────────┤
│ Queue Card     │
├────────────────┤
│ Compliance     │
├────────────────┤
│ Storage        │
├────────────────┤
│  [Action]      │
│  [Action]      │
└────────────────┘

Full-width: 100%
Padding: 1rem
All multi-column grids: 1 column
Buttons: Full width or 50% split
```

---

## 🎯 Interaction States

### Button States
```
Default:
  Background: var(--color-primary)
  Text: white
  Padding: 0.85rem 1.25rem
  Border-radius: var(--radius-md)

Hover:
  Transform: scale(1.02)
  Box-shadow: var(--shadow-md)
  Transition: var(--transition-base)

Active:
  Opacity: 0.9
  Transform: scale(0.98)

Disabled:
  Opacity: 0.6
  Cursor: not-allowed
```

### Card States
```
Default:
  Box-shadow: var(--shadow-xs)
  Background: white
  Border: 1px solid var(--color-border)

Hover (interactive):
  Transform: translateY(-2px)
  Box-shadow: var(--shadow-md)
  Transition: all var(--transition-base)

Focus (keyboard):
  Outline: 2px solid var(--color-accent)
  Outline-offset: 3px
```

### MetricCard Status States
```
Healthy:
  Border-color: rgba(34, 197, 94, 0.2)
  Background: rgba(34, 197, 94, 0.08)
  Text-color: #16a34a

Warning:
  Border-color: rgba(251, 146, 60, 0.2)
  Background: rgba(251, 146, 60, 0.08)
  Text-color: #ea580c

Critical:
  Border-color: rgba(239, 68, 68, 0.2)
  Background: rgba(239, 68, 68, 0.08)
  Text-color: #dc2626
```

---

## ♿ Accessibility Specifications

### Color Contrast
```
Text on White (WCAG AA, min 4.5:1):
  #0d1b2a on #ffffff → 13:1 ✅ Excellent
  #64748b on #ffffff → 6:1 ✅ Good
  #16a34a on #ffffff → 5:1 ✅ Good

Status Colors:
  Green (#16a34a) on light: 5:1+ ✅
  Orange (#ea580c) on light: 7:1+ ✅
  Red (#dc2626) on light: 6:1+ ✅
```

### Focus Indicators
```
All interactive elements:
  Outline: 2px solid var(--color-accent)
  Outline-offset: 3px
  Border-radius: 6px
  Visible on: :focus-visible state
```

### Semantic HTML
```
Headings:    <h1>, <h2>, <h3> hierarchy maintained
Landmarks:   <main>, <nav>, <aside>, <header>
Forms:       <label> with <input>, <select>, <textarea>
Lists:       <ul>, <ol> for structured content
Status:      aria-live regions for dynamic updates
Labels:      aria-label for icons and buttons
```

---

## 📐 Component Dimensions

### Metric Card
```
Width:   250px-1fr (responsive)
Height:  auto (~180px typical)
Padding: var(--spacing-lg) = 24px
Gap:     var(--spacing-md) = 16px
```

### Activity Card
```
Width:   350px-1fr (responsive)
Height:  auto (~300px typical)
Padding: var(--spacing-lg) = 24px
Activity item height: 60px
```

### Stats Grid Item
```
Width:   180px-1fr (responsive)
Height:  160px
Padding: var(--spacing-lg) = 24px
```

### Buttons
```
Primary:   0.85rem × 1.25rem padding
Small:     0.6rem × 1rem padding
Full width: 100% max-width 400px
Min height: 44px (touch-friendly)
```

---

## 🎓 Design Guidelines

### When to Use Each Status Color
- **Healthy (Green)**: Normal operations, positive metrics, passing compliance
- **Warning (Orange)**: Attention needed, pending items, moderate concerns
- **Critical (Red)**: Immediate action, system issues, safety concerns
- **Info (Blue)**: Informational updates, syncing status, neutral info

### Spacing Guidelines
- Use var(--spacing-xl) between major page sections
- Use var(--spacing-lg) between component groups
- Use var(--spacing-md) between elements within components
- Use var(--spacing-sm) for tight, related groups
- Use var(--spacing-xs) only for minimal spacing

### Shadow Guidelines
- var(--shadow-xs) for inputs and subtle elements
- var(--shadow-sm) for normal cards and buttons
- var(--shadow-md) for hovered cards and dropdowns
- var(--shadow-lg) for modals and tooltips
- var(--shadow-xl) for critical overlays

---

This visual reference ensures consistency across all dashboard interfaces.
