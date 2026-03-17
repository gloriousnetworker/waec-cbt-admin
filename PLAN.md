# UI/UX Consistency Plan
## Einstein's CBT Admin — Component Polish Pass

---

## SCOPE

Five components need a design/font consistency pass, plus dashboard-wide animations.

- `Questions.jsx`
- `Subjects.jsx`
- `Exams.jsx`
- `Subscription.jsx`
- `Settings.jsx`
- `dashboard/page.jsx` (animations only)

---

## GLOBAL RULES (applied to every component)

| Problem | Fix |
|---|---|
| `font-playfair` on any non-H1/H2 heading | Remove — body text inherits `font-inter` |
| `#10b981` / `#059669` green as "brand" | Replace with `brand-primary` (#1F2A49 navy) / `brand-primary-dk` |
| `#626060`, `text-[#1E1E1E]`, `text-gray-*` | Replace with `text-content-primary/secondary/muted` tokens |
| `bg-gray-50/100/200`, `border-gray-200/300` | Replace with `bg-surface-muted/subtle`, `border-border` |
| `text-[13px] leading-[140%] font-[600]` inline | Replace with Tailwind semantic classes (`text-sm font-semibold`) |
| `focus:border-[#10b981]` on inputs | Replace with `focus:ring-brand-primary focus:border-brand-primary` |
| Loading spinners `border-[#10b981]` | Replace with `border-brand-primary-lt border-t-brand-primary` |
| Empty-state buttons `bg-[#10b981]` | Replace with `bg-brand-primary hover:bg-brand-primary-dk` |

---

## COMPONENT-BY-COMPONENT PLAN

---

### 1. `Questions.jsx` (~1296 lines)

**Issues found:**
- `font-playfair` on 100+ labels, badges, button text, table text
- `#10b981` green on filter/search inputs focus ring, action buttons, badges, spinner
- `bg-gray-50/100`, `border-gray-200`, `text-gray-*` throughout
- Inline `text-[13px] leading-[100%] font-[600]` patterns on every element
- No entrance animation on question cards list

**Specific fixes:**
1. All form labels → `text-sm font-medium text-content-secondary` (remove font-playfair)
2. All input fields → `focus:ring-brand-primary focus:border-brand-primary` + remove font-playfair
3. Difficulty badges (easy/medium/hard) → keep colour logic, remove font-playfair
4. Action buttons (Add Question, Import, Export) → `bg-brand-primary hover:bg-brand-primary-dk`
5. Question cards → `bg-white border-border shadow-card` (remove bg-gray-50 + gray borders)
6. Loading spinner → brand colours
7. Empty state button → brand primary
8. Add staggered entrance animation on the question card list

---

### 2. `Subjects.jsx` (~147 lines — smallest, quickest)

**Issues found:**
- `font-playfair` on labels, stats, button text
- `#10b981` on action button and subject count badge
- `bg-gray-50`, `border-gray-200`, `text-gray-600/400`

**Specific fixes:**
1. "Add Subject" button → `bg-brand-primary hover:bg-brand-primary-dk`
2. Subject card active border → `border-brand-primary` (remove `border-[#10b981]`)
3. Subject count pill → `bg-brand-primary-lt text-brand-primary`
4. All labels/text → semantic Tailwind classes, remove font-playfair
5. Card hover → `hover:border-brand-primary hover:shadow-card-md`
6. Add staggered fadeInUp entrance animation on subject grid cards

---

### 3. `Exams.jsx` (~1524 lines — largest)

**Issues found:**
- Widespread `font-playfair` on all text elements
- `#10b981` green on tabs, buttons, badges, active states, focus rings
- `#8B5CF6` purple on practice exam type (inconsistent secondary colour)
- `bg-gray-50/100/200`, `text-gray-*`, `border-gray-*` throughout
- Student assignment modal has hardcoded colours

**Specific fixes:**
1. Exam type tabs (WAEC/NECO/Practice) → active: `bg-brand-primary text-white`, inactive: `bg-surface-muted text-content-secondary`
2. Practice type purple → replace with `bg-brand-accent` (#3A4F7A) to stay on-brand
3. "Create Exam" button → `bg-brand-primary hover:bg-brand-primary-dk`
4. Exam status badges → use `success-light/success`, `warning-light/warning-dark`, `danger-light/danger` tokens
5. Student selection modal → clean all gray/green to brand tokens
6. All form inputs → brand focus rings
7. Loading spinner → brand colours
8. Stagger animation on exam cards list

---

### 4. `Subscription.jsx` (~618 lines)

**Issues found:**
- `#8B5CF6` / `#7C3AED` purple as "Pro plan" accent — outside brand palette
- `#10b981` on Basic plan elements
- `font-playfair` on pricing text, descriptions, feature lists, buttons
- `bg-gray-50/100`, `text-gray-*` throughout
- Hardcoded gradient `linear-gradient(135deg, #8B5CF6, #7C3AED)` on Pro card

**Decision on purple:** Replace with `brand-gold` (#FFB300) — signals "premium/Best Value" within the existing brand palette without introducing an off-brand accent.

**Specific fixes:**
1. Pro plan card → replace purple gradient with gold (`linear-gradient(135deg, #FFB300, #D97706)`)
2. "Best Value" badge → `bg-brand-gold text-white`
3. Basic plan button → `bg-brand-primary text-white`
4. Pro plan button → `bg-brand-gold hover:bg-warning-dark text-white`
5. All body text → remove font-playfair, use semantic classes
6. Payment history table → `border-border`, `text-content-*` tokens
7. Status badges → `success-light/success`, `warning-light/warning` tokens
8. Add entrance animation on plan cards (staggered scale-in from bottom)

---

### 5. `Settings.jsx` (~818 lines)

**Issues found:**
- `font-playfair` on form labels, input hints, section titles, tab labels
- `#10b981` green on active tab indicator, save buttons, toggle switches
- `bg-gray-50/100`, `border-gray-200` throughout
- Toggle switches use inline `#10b981` background
- Danger zone uses `#DC2626` directly instead of `text-danger`

**Specific fixes:**
1. Active tab → `border-b-2 border-brand-primary text-brand-primary`
2. Save button → `bg-brand-primary hover:bg-brand-primary-dk`
3. Toggle switches → active state `bg-brand-primary`
4. All form labels → `text-sm font-medium text-content-secondary` (remove font-playfair)
5. All input fields → brand focus rings, remove font-playfair
6. Section headings → `text-base font-bold text-content-primary`
7. Danger zone → `text-danger`, `bg-danger-light`, `border-danger-light` tokens
8. Dividers → `border-border` token
9. Add fade-in animation on tab content panel switch

---

### 6. `dashboard/page.jsx` — Section Transition Animations

**Current state:** Sections swap instantly — hard cut when clicking sidebar items.

**Plan:** Wrap rendered section in `AnimatePresence` + `motion.div` keyed by `activeSection`.

```jsx
import { AnimatePresence, motion } from 'framer-motion';

// Replace:
<div>{renderSection()}</div>

// With:
<AnimatePresence mode="wait">
  <motion.div
    key={activeSection}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.2, ease: 'easeOut' }}
  >
    {renderSection()}
  </motion.div>
</AnimatePresence>
```

Every section click gets a smooth fade-up entrance and fade-up exit. No per-component changes needed.

---

## EXECUTION ORDER

| Step | File | Effort |
|---|---|---|
| 1 | `dashboard/page.jsx` | 5 lines — instant payoff |
| 2 | `Subjects.jsx` | ~30 edits — smallest file |
| 3 | `Settings.jsx` | ~80 edits — self-contained tabs |
| 4 | `Subscription.jsx` | ~70 edits — pricing card rebrand |
| 5 | `Questions.jsx` | ~150 edits — large but repetitive |
| 6 | `Exams.jsx` | ~200 edits — largest, saved last |

---

## WHAT WON'T CHANGE

- Component logic, API calls, state management — zero functional changes
- Subscription purple→gold rebrand: visual only, plan structure unchanged
- Pagination logic (already fixed in previous pass)
- Performance.jsx, Home.jsx, Students.jsx, Results.jsx, Navbar.jsx, Sidebar.jsx (already done)
