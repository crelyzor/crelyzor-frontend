# calendar-frontend — UI Intelligence

> This is the main dashboard app. Read this before touching any UI.

---

## Plugin

When building or modifying UI in this repo, use the **frontend-design** skill.
It knows how to build production-grade, aesthetic-first components.

Invoke it when: creating new pages, new components, redesigning sections.

---

## The Vibe

**Minimal. Precise. Alive.**

- Zero color — everything is neutral grays. No blue buttons, no colorful tags.
- Every interaction has a spring. Nothing just appears — it breathes.
- Glassmorphism on surfaces that float (headers, dropdowns, modals).
- DM Sans everywhere — geometric, modern, slightly technical.
- Dense but never cramped. Small text (10-12px) used intentionally for metadata.

**Reference:** Think Linear.app meets Notion meets a premium calendar app.

---

## Design Tokens (from index.css)

```css
/* Light Mode */
--background: #ffffff --foreground: #0a0a0a --card: #ffffff --primary: #171717
  --secondary: #f5f5f5 --muted: #f5f5f5 --muted-foreground: #737373
  --border: #e5e5e5 --ring: #171717 /* Dark Mode */ --background: #0a0a0a
  --foreground: #fafafa --card: #171717 --primary: #fafafa --secondary: #262626
  --muted: #262626 --muted-foreground: #a3a3a3 --border: #262626 --ring: #d4d4d4;
```

Never hardcode hex values. Always use CSS variables via Tailwind classes.

---

## Typography

- **Font:** DM Sans (already loaded via Google Fonts)
- **Weights:** 300, 400, 500, 600
- **Hierarchy:**
  - Page titles: `text-xl font-semibold` or `text-2xl font-semibold`
  - Section headers: `text-sm font-medium`
  - Body: `text-sm`
  - Metadata / labels: `text-xs text-muted-foreground`
  - Micro-labels: `text-[10px] text-muted-foreground uppercase tracking-wider`

---

## Animation Rules

**Page entrance — always:**

```tsx
// Wrap every page in PageMotion
import PageMotion from '@/components/PageMotion';
<PageMotion>
  <YourPage />
</PageMotion>;

// PageMotion does: opacity 0→1, y 8→0, 220ms, ease [0.25, 0.1, 0.25, 1]
```

**Spring physics for modals/dropdowns:**

```tsx
// Standard spring config
{ type: "spring", damping: 25, stiffness: 350 }

// Entry state
initial={{ opacity: 0, scale: 0.94, y: -6 }}
animate={{ opacity: 1, scale: 1, y: 0 }}
exit={{ opacity: 0, scale: 0.94, y: -6 }}
```

**Scroll-coupled (home page pattern):**

```tsx
const scrollY = useScroll();
const opacity = useTransform(scrollY, [0, 80], [1, 0]);
```

**Stagger children:**

```tsx
// Parent
transition={{ staggerChildren: 0.05 }}

// Child
initial={{ opacity: 0, y: 4 }}
animate={{ opacity: 1, y: 0 }}
```

---

## Border Radius Scale

| Usage                        | Class                                |
| ---------------------------- | ------------------------------------ |
| Badges, small pills          | `rounded-full`                       |
| Buttons, inputs, small cards | `rounded-lg`                         |
| Cards, panels                | `rounded-xl`                         |
| Dialogs, large panels        | `rounded-2xl`                        |
| Special (FAB menu items)     | `rounded-[20px]` or `rounded-[28px]` |

---

## Glassmorphism Pattern

Use on: headers, dropdowns, command palette, floating panels.

```tsx
// Header
className =
  'bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-200/50 dark:border-neutral-800/50';

// Dropdown/menu (dark preferred even in light mode)
className =
  'bg-[#1C1C1E] border border-white/5 rounded-[24px] shadow-2xl shadow-black/40';

// Overlay backdrop
className = 'bg-black/40 backdrop-blur-[3px]';
```

---

## Component Library

**shadcn/ui first.** Never rebuild what shadcn has.

Available components in `src/components/ui/`:
Button, Badge, Card, Dialog, DropdownMenu, Input, Label, Select, Switch, Tabs, Avatar, Command, Separator

**Button variants:** `default | destructive | outline | secondary | ghost | link`
**Button sizes:** `xs | sm | default | lg | icon-xs | icon-sm | icon | icon-lg`

```tsx
// Always import from @/components/ui/button
import { Button } from '@/components/ui/button';

// Never use plain <button> for actions
```

---

## State Management

```tsx
// Data from API — always React Query
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';

const { data, isLoading } = useQuery({
  queryKey: queryKeys.meetings.byId(id),
  queryFn: () => meetingsService.getById(id),
});

// App state — Zustand stores
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';

// Toasts — always Sonner
import { toast } from 'sonner';
toast.success('Meeting created');
toast.error('Failed to save');
```

---

## Dark Mode

Every component must support dark mode. Pattern:

```tsx
// Backgrounds
className = 'bg-white dark:bg-neutral-900';
className = 'bg-neutral-50 dark:bg-neutral-800';

// Text
className = 'text-neutral-900 dark:text-neutral-100';
className = 'text-neutral-500 dark:text-neutral-400';

// Borders
className = 'border-neutral-200 dark:border-neutral-700';

// Use CSS vars when possible — they auto-switch
className = 'bg-background text-foreground border-border';
```

---

## File Structure

```
src/
├── components/
│   ├── ui/          ← shadcn components (don't modify)
│   ├── home/        ← Home page widgets
│   ├── cards/       ← Card-related components
│   ├── command-palette/
│   ├── toolbar/
│   └── theme/
├── pages/           ← Route-level components (one folder per page)
├── hooks/
│   └── queries/     ← React Query hooks (one file per domain)
├── stores/          ← Zustand stores
├── services/        ← API call functions
├── lib/
│   ├── queryKeys.ts ← ALL query keys defined here
│   └── apiClient.ts ← Axios instance
├── types/           ← TypeScript types
└── constants/       ← Theme, toolbar, meeting constants
```

---

## Patterns

**New page:**

```tsx
// Always wrap in PageMotion
// Always handle loading state (skeleton, not spinner where possible)
// Always handle empty state (illustrated, with action CTA)
// Always handle error state
```

**Loading skeleton pattern:**

```tsx
<div className="animate-pulse">
  <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded-lg w-3/4" />
</div>
```

**Empty state pattern:**

```tsx
<div className="flex flex-col items-center justify-center py-16 text-center">
  <Icon className="h-10 w-10 text-muted-foreground mb-3" />
  <p className="text-sm font-medium">No meetings yet</p>
  <p className="text-xs text-muted-foreground mt-1">
    Create one to get started
  </p>
  <Button size="sm" className="mt-4">
    Create meeting
  </Button>
</div>
```

---

## What NOT To Do

- Do NOT use colors other than neutrals (no blue, green, yellow)
- Do NOT use `console.log` — use `toast.error` for user-facing errors
- Do NOT use `useEffect` for data fetching — use React Query
- Do NOT hardcode API URLs — use the apiClient from `@/lib/apiClient`
- Do NOT skip dark mode on any component
- Do NOT use mock/placeholder data in components — always connect to real API
- Do NOT use plain `<button>` — always use `<Button>` from shadcn
- Do NOT create new components if shadcn already has it
- Do NOT skip `PageMotion` on new pages
- Do NOT add color accent other than the neutral palette (except cards gold — that's cards-frontend only)
