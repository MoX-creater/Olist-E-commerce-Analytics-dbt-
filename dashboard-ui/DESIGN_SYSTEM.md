# Olist Trade Ledger – Design System

Shipping manifest / trade ledger aesthetic for Brazilian e-commerce data.

---

## 🎨 Design Philosophy

**Concept:** Grounded in traditional shipping manifests, invoices, and trade ledgers  
**Tone:** Document-like, dense, professional, utilitarian  
**Not:** Airy SaaS dashboard, colorful data viz, floating cards

---

## 🎨 Color Tokens

```css
/* Primary Palette */
--bg-primary: #1B1B18;           /* Deep charcoal (aged paper reverse) */
--text-primary: #EDEAE0;         /* Warm off-white (ink on aged paper) */
--text-secondary: #A8A49A;       /* Muted gray (supporting text) */

/* Accent Colors */
--accent-cargo: #4C7A6B;         /* Cargo green (primary data, trust) */
--accent-gold: #C9A227;          /* Muted gold (warnings, late states) */

/* Structural */
--border-hairline: #3A3A35;      /* Subtle borders (thin rules) */
```

### Color Usage Guidelines

| Element | Color | Purpose |
|---------|-------|---------|
| Background | `--bg-primary` | Canvas for all content |
| Headings | `--text-primary` | Maximum contrast |
| Body text | `--text-primary` | High readability |
| Labels, descriptions | `--text-secondary` | Supporting info |
| Primary data lines | `--accent-cargo` | Revenue, on-time metrics |
| Warning/late states | `--accent-gold` | Late deliveries, alerts |
| Borders, dividers | `--border-hairline` | Panel separation |

---

## ✍️ Typography

### Type Stack

```css
/* Serif Display (Headings) */
--font-serif: 'Fraunces', serif;

/* Monospace (All Numbers) */
--font-mono: 'IBM Plex Mono', monospace;

/* Body Copy (Descriptions) */
--font-body: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
```

### Usage Rules

| Element | Typeface | Weight | Size | Use Case |
|---------|----------|--------|------|----------|
| **Masthead Title** | Fraunces (serif) | 400 | 2.75rem | "Olist Trade Ledger" |
| **Subtitle** | System sans | 400 | 0.95rem | Context line |
| **Panel Titles** | Fraunces (serif) | 400 | 1.25rem | Chart/section headers |
| **Panel Descriptions** | System sans | 400 | 0.8125rem | Subtitles |
| **Timestamps** | IBM Plex Mono | 400 | 0.6875rem | "synced 14:32" |
| **Numeric Data** | IBM Plex Mono | 400-500 | 0.75-0.8125rem | Revenue, %, counts, axis labels |
| **Loading/Error States** | IBM Plex Mono | 400 | 0.75rem | Status messages |

### Typography Hierarchy

```
Masthead Title (Serif, 2.75rem)
  ↓
  Subtitle (Sans, 0.95rem)
    ↓
    Panel Title (Serif, 1.25rem)
      ↓
      Panel Description (Sans, 0.8125rem)
        ↓
        Numeric Data (Mono, 0.75-0.8125rem)
          ↓
          Timestamp (Mono, 0.6875rem, uppercase)
```

---

## 📐 Layout System

### Masthead (Header)

```
┌────────────────────────────────────────────────────┐
│ Olist Trade Ledger                                 │
│ Brazilian Marketplace Analytics – Orders, Freight  │
├────────────────────────────────────────────────────┤  ← 1px hairline
│                                                    │
```

**Changes from previous:**
- ❌ Removed: Purple gradient background, rounded corners, drop shadow
- ✅ Added: Flat background, single hairline border beneath
- ✅ Typography: Serif title (Fraunces), sans subtitle

### Panel Grid

```
┌─────────────┬─────────────┐  ← 1px hairline borders
│             │             │
│  Panel A    │  Panel B    │
│             │             │
├─────────────┼─────────────┤  ← Grid uses 1px gaps
│             │             │
│  Panel C    │  Panel D    │
│             │             │
└─────────────┴─────────────┘
```

**Grid Specs:**
- Gap: `1px` (hairline, not whitespace)
- Gap Color: `var(--border-hairline)`
- Border: `1px solid var(--border-hairline)` around entire grid
- Columns: Auto-fit, min 480px
- Panels read as **sections of one document**, not floating cards

**Changes from previous:**
- ❌ Removed: `2rem` gaps, rounded corners, drop shadows, hover effects
- ✅ Added: 1px hairline separation, flat panels, tighter spacing

### Panel Structure

```
┌────────────────────────────────────────────────┐
│ Revenue Trend               synced 14:32       │  ← Title + timestamp
│ Total revenue and orders                       │  ← Description
│                                                │
│ [Chart Area]                                   │
│                                                │
└────────────────────────────────────────────────┘
```

**Panel Header:**
- Flex layout: title/description on left, timestamp on right
- Title: Serif, 1.25rem
- Description: Sans, 0.8125rem, muted
- Timestamp: Monospace, 0.6875rem, uppercase, "synced HH:MM"

**Changes from previous:**
- ❌ Removed: "Cached" colored pill badge
- ✅ Added: Monospace timestamp in corner

---

## 📊 Chart Styling

### Common Chart Elements

**Grid Lines:**
- Color: `var(--border-hairline)`
- Style: `strokeDasharray="3 3"` (subtle dashed)

**Axes:**
- Stroke: `var(--text-secondary)`
- Font: `var(--font-mono)`, `0.75rem`
- All numeric labels use monospace

**Tooltips:**
- Background: `var(--bg-primary)`
- Border: `1px solid var(--border-hairline)`
- Font: `var(--font-mono)`, `0.8125rem`
- No rounded corners

**Legend:**
- Font: `var(--font-mono)`, `0.75rem`

### Chart-Specific Styles

#### Revenue Trend (Line Chart)
- Primary line: `var(--accent-cargo)`, `strokeWidth: 1.5` (thinner)
- Secondary line: `var(--text-secondary)`, dashed
- ❌ Removed: Thick strokes, gradient fills, colored dots
- ✅ Added: Minimal strokes, cargo green primary

#### Order Status (Pie Chart)
- Colors: Cargo green palette + gold accent
- Labels: Monospace percentages
- ❌ Removed: Bright rainbow colors
- ✅ Added: Muted earth tones

#### Top Categories (Horizontal Bar)
- Fill: `var(--accent-cargo)`
- No rounded corners (`radius: [0,0,0,0]`)
- ❌ Removed: Purple bars, rounded ends
- ✅ Added: Flat cargo green bars

#### Delivery Performance (Bar Chart)
- Avg Delivery: `var(--accent-cargo)` (trustworthy)
- Late %: `var(--accent-gold)` (warning state)
- ❌ Removed: Blue/red contrast
- ✅ Added: Green/gold semantic colors

#### Review Scores (Grouped Bar)
- On-Time: `var(--accent-cargo)` (positive)
- Late: `var(--accent-gold)` (warning)
- ❌ Removed: Green/orange, rounded tops
- ✅ Added: Cargo green/gold, flat tops

---

## 🧩 Component Changes

### App.jsx
**Before:**
```jsx
<h1>📊 Olist Analytics Dashboard</h1>
<p className="subtitle">E-commerce insights powered by dbt</p>
```

**After:**
```jsx
<h1>Olist Trade Ledger</h1>
<p className="subtitle">Brazilian Marketplace Analytics – Orders, Freight, Delivery & Revenue</p>
```

**Changes:**
- Removed emoji icon
- Changed to serif display face
- More formal, document-like title
- Subtitle explicitly references shipping/trade context

---

### index.css
**Before:**
```css
body {
  background: #0a0e27;  /* Deep blue */
  color: #e4e4e7;       /* Neutral gray */
}
```

**After:**
```css
:root {
  --bg-primary: #1B1B18;      /* Charcoal */
  --text-primary: #EDEAE0;    /* Warm off-white */
  --accent-cargo: #4C7A6B;    /* Cargo green */
  --font-serif: 'Fraunces', serif;
  --font-mono: 'IBM Plex Mono', monospace;
}
```

**Changes:**
- Introduced CSS custom properties (design tokens)
- Warmer, document-like color palette
- Typography variables for consistent usage

---

### App.css
**Before:**
```css
.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}
```

**After:**
```css
.app-header {
  padding: 2rem 3rem 1.5rem;
  border-bottom: 1px solid var(--border-hairline);
  background: var(--bg-primary);
}

.app-header h1 {
  font-family: var(--font-serif);
  font-weight: 400;  /* Light serif weight */
  letter-spacing: -0.02em;
}
```

**Changes:**
- Removed gradient, rounded corners, drop shadow
- Added single hairline border beneath
- Applied serif typography to masthead
- Flatter, more document-like header

---

### Dashboard.css
**Before:**
```css
.dashboard-grid {
  gap: 2rem;
}

.chart-card {
  background: #1a1f3a;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.chart-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.2);
}

.cache-badge {
  background: rgba(34, 197, 94, 0.2);
  color: #4ade80;
  border-radius: 4px;
}
```

**After:**
```css
.dashboard-grid {
  gap: 1px;  /* Hairline separation */
  background: var(--border-hairline);
  border: 1px solid var(--border-hairline);
}

.chart-card {
  background: var(--bg-primary);
  padding: 1.75rem 2rem;
  /* No border-radius, no box-shadow, no hover effect */
}

.chart-timestamp {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  text-transform: uppercase;
}
```

**Changes:**
- Grid gap reduced to 1px (hairline)
- Removed rounded corners, shadows, hover effects
- Replaced colored "Cached" badge with monospace timestamp
- Panels read as sections of one document

---

### ChartWrapper.jsx
**Before:**
```jsx
{cached && <span className="cache-badge">Cached</span>}
```

**After:**
```jsx
<span className="chart-timestamp">{getTimestamp()}</span>

// getTimestamp returns: "synced 14:32"
```

**Changes:**
- Removed colored pill badge
- Added functional monospace timestamp
- More utilitarian, less decorative

---

## 📏 Spacing Scale

```
Tight spacing (document-like, not airy SaaS):
- Panel padding: 1.75rem 2rem
- Chart header margin: 1.25rem
- Grid gap: 1px (hairline)
- Outer margins: 2rem-3rem
```

**Before:** 2rem gaps, 1.5rem padding, spacious  
**After:** 1px gaps, 1.75rem padding, denser

---

## 🎯 Design Decisions

### Why These Changes?

| Decision | Rationale |
|----------|-----------|
| **Serif headings** | Evoke traditional ledgers, invoices, shipping manifests |
| **Monospace numbers** | Align numerics in columns, recall typewriter reports |
| **Cargo green** | Grounded in shipping/logistics context |
| **Gold warnings** | Subtle but distinct from primary green |
| **Hairline borders** | Document sections, not floating cards |
| **No rounded corners** | Document aesthetic, not app aesthetic |
| **No gradients** | Flat, utilitarian, not decorative |
| **Timestamp vs badge** | Functional info, not status decoration |
| **Tighter spacing** | Dense ledger, not spaced-out dashboard |

### Visual Hierarchy

```
1. Masthead (Serif, largest)
2. Panel Titles (Serif, medium)
3. Panel Descriptions (Sans, small)
4. Chart Data (Mono, small)
5. Timestamps (Mono, smallest, uppercase)
```

---

## 🧪 Testing Checklist

- [ ] All headings use Fraunces serif
- [ ] All numeric data (revenue, %, counts) use IBM Plex Mono
- [ ] Grid gaps are 1px hairlines, not whitespace
- [ ] No rounded corners on panels or charts
- [ ] No drop shadows anywhere
- [ ] "Cached" badges replaced with "synced HH:MM" timestamps
- [ ] Color palette matches tokens (no purple, blue, bright green)
- [ ] Masthead has single hairline beneath, no gradient
- [ ] Chart axes use monospace font
- [ ] Tooltips use dark background + hairline border

---

## 🎨 Color Palette Reference

```
Cargo Green Spectrum:
#3A5A4D  ← Darker
#4C7A6B  ← Primary (accent-cargo)
#6B8E7F
#8AA193
#A8B4A8  ← Lighter

Gold Spectrum:
#C9A227  ← Primary (accent-gold)
#D4B04A  ← Lighter variant

Neutrals:
#1B1B18  ← Background
#3A3A35  ← Hairline borders
#A8A49A  ← Secondary text
#EDEAE0  ← Primary text
```

---

## 📖 References

**Inspiration:**
- Traditional shipping manifests (columns, monospace)
- Trade ledgers (serif headings, ruled lines)
- Invoices (flat layout, functional typography)
- Brazilian freight documents (green cargo aesthetic)

**Not Inspired By:**
- Modern SaaS dashboards (Stripe, Intercom)
- Data visualization tools (Tableau, Looker)
- BI platforms (Power BI, Tableau)

---

**Design System Version:** 1.0.0  
**Last Updated:** 2026-09-11  
**Status:** 🟢 Implemented
