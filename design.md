# TaskFlow — Design System

## Design Direction

Premium, minimal SaaS productivity application. Clean, spacious, professional. Inspired by Linear, Notion, and Todoist.

## Color Palette

### Primary
| Token | Value | Usage |
|-------|-------|-------|
| primary-50 | #EEF2FF | Light backgrounds |
| primary-100 | #E0E7FF | Hover states |
| primary-500 | #6366F1 | Secondary actions |
| primary-600 | #4F46E5 | Primary buttons, active nav |
| primary-700 | #4338CA | Hover on primary |

### Neutrals
| Token | Value | Usage |
|-------|-------|-------|
| white | #FFFFFF | Cards, modals |
| slate-50 | #F8FAFC | Page background |
| slate-100 | #F1F5F9 | Sidebar background |
| slate-200 | #E2E8F0 | Borders |
| slate-400 | #94A3B8 | Muted text, placeholders |
| slate-600 | #475569 | Body text |
| slate-800 | #1E293B | Headings |
| slate-900 | #0F172A | Primary text |

### Priority Colors
| Priority | Badge BG | Badge Text | Dot |
|----------|----------|------------|-----|
| Low | emerald-50 | emerald-700 | emerald-500 |
| Medium | amber-50 | amber-700 | amber-500 |
| High | red-50 | red-700 | red-500 |

### Status Colors
| Status | Color | Usage |
|--------|-------|-------|
| Pending | slate-400 | Default state |
| Completed | emerald-500 | Checkmark, badge |
| Overdue | red-500 | Warning indicator |

## Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| App font | Inter (system fallback: sans-serif) | — | — |
| Page title | — | text-2xl (24px) | font-bold (700) |
| Section heading | — | text-lg (18px) | font-semibold (600) |
| Card title | — | text-sm (14px) | font-medium (500) |
| Body text | — | text-sm (14px) | font-normal (400) |
| Muted/meta | — | text-xs (12px) | font-normal (400) |
| Button text | — | text-sm (14px) | font-medium (500) |

## Spacing Scale

Use Tailwind's spacing scale consistently:
- **Page padding**: p-6 (24px)
- **Card padding**: p-5 (20px)
- **Card gap**: gap-4 (16px) or gap-6 (24px)
- **Section gap**: space-y-6 (24px)
- **Inline spacing**: gap-2 (8px) or gap-3 (12px)
- **Form field gap**: space-y-4 (16px)

## Border Radius

| Element | Radius |
|---------|--------|
| Cards | rounded-xl (12px) |
| Buttons | rounded-lg (8px) |
| Inputs | rounded-lg (8px) |
| Badges | rounded-full |
| Modals | rounded-2xl (16px) |
| Avatar | rounded-full |

## Shadows

| Element | Shadow |
|---------|--------|
| Cards | shadow-sm |
| Elevated cards (hover) | shadow-md |
| Modals | shadow-xl |
| Dropdowns | shadow-lg |

## Layout

### Sidebar (Desktop)
- Width: w-64 (256px)
- Background: white with right border
- Logo/app name at top
- Navigation items with Lucide icons
- Active item: indigo background, white text
- Inactive item: slate-600 text, hover slate-100 bg
- User info at bottom

### Top Navigation
- Height: h-16 (64px)
- Background: white with bottom border
- Search input (desktop)
- User avatar/name
- Mobile: hamburger menu button

### Main Content
- Background: slate-50
- Max width with centered content
- Padding: p-6

### Mobile
- Sidebar hidden by default, slides in as overlay
- Hamburger menu in top nav
- Full-width cards
- Stacked stat cards (2-column grid)

## Component Designs

### Stat Card
```
┌─────────────────────────┐
│  📊 Icon        Value   │
│  Label                  │
└─────────────────────────┘
```
- White bg, rounded-xl, shadow-sm
- Colored icon in a soft-colored circle
- Large number (text-2xl font-bold)
- Muted label (text-sm text-slate-500)

### Todo Card
```
┌─────────────────────────────────────┐
│ ○ Task Title              [H] 📎 ⋮ │
│   Short description...              │
│   📅 Due: Nov 25  ⏰ Reminder set   │
└─────────────────────────────────────┘
```
- White bg, rounded-xl, border, hover shadow
- Checkbox (circle) on left
- Priority badge (colored pill)
- Attachment indicator (paperclip icon)
- Due date with calendar icon
- Actions menu (edit, delete)
- Completed: strikethrough title, muted colors

### Add/Edit Todo Modal
```
┌──────────────────────────────────┐
│  Add New Task              ✕     │
│                                  │
│  Title ___________________       │
│  Description _____________       │
│  Priority [Low|Med|High]         │
│  Due Date [________] Time [___]  │
│  Reminder  [Toggle]              │
│  Attachments [Choose Files]      │
│                                  │
│  [Cancel]        [Save Task]     │
└──────────────────────────────────┘
```
- Overlay with backdrop blur
- White bg, rounded-2xl, shadow-xl
- Clear form layout with labels
- Primary button for save

### Login/Register Page
- Centered card on gradient or clean background
- App logo/name at top
- Clean form fields
- Primary submit button (full width)
- Link to switch between login/register

### Empty States
- Centered illustration/icon
- Descriptive message
- Action button (e.g., "Create your first task")

### Loading Skeletons
- Animated pulse placeholders matching card dimensions
- Use for stat cards, todo list, and dashboard sections

## Interactions

- **Hover**: Cards lift slightly (shadow-md), buttons darken
- **Click feedback**: Button press state (scale-95 briefly)
- **Transitions**: 150-200ms for color/shadow changes
- **Modal**: Fade in with slight scale animation
- **Toast**: Slide in from top-right, auto-dismiss after 3s

## Accessibility

- All form inputs have associated labels
- Buttons have descriptive text or aria-labels
- Color is not the only indicator (badges have text + color)
- Focus rings visible on interactive elements (ring-2 ring-indigo-500)
- Keyboard navigation works for modals and forms
- Sufficient color contrast (WCAG AA)
