---
name: mobile-first-design
description: Guidelines, responsive layout patterns, touch ergonomics, and mobile-first standards for the KemKendra B2B chemical marketplace.
license: Apache-2.0
metadata:
  author: synthora
  framework: nextjs-tailwind
---

# Mobile-First Design & Responsive Ergonomics Guide

This skill governs all user interface development, responsive layout adaptations, and mobile component styling across Synthora / KemKendra.

## 1. Core Principles: Mobile-First Progression

In Tailwind CSS, styles without a prefix apply to **all viewports (starting at mobile 320px)**. Breakpoint prefixes (`sm:`, `md:`, `lg:`, `xl:`) only apply when the viewport meets or exceeds that minimum width.

- **Mobile Viewport Target:** `360px` to `428px` (iPhone SE to iPhone 15 Pro Max, Samsung Galaxy, Pixel).
- **Default Breakpoint Rule:** Never write desktop-first CSS with negative max-width overrides. Style the single-column, touch-friendly mobile layout first, then enhance for `sm:` (640px), `md:` (768px), and `lg:` (1024px).

```tsx
// Correct (Mobile First):
<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

// Incorrect (Desktop First):
<div className="flex flex-row items-center justify-between max-sm:flex-col">
```

---

## 2. Touch Ergonomics & Tap Targets

1. **Minimum Tap Area:** Every interactive element (buttons, tabs, inputs, dropdown triggers) must have a touch target of at least **44x44px** (`min-h-[44px] min-w-[44px]` or `h-10 sm:h-9` with appropriate padding).
2. **Thumb Zone Actions:** Primary actions on mobile (e.g., "Request Quote", "Submit RFQ", "Track Order") should be easily reachable in the lower half of the screen.
3. **Sticky Bottom Action Bar on Product Pages:**
   On mobile viewports (`< 768px`), chemical detail and sourcing pages should feature a fixed bottom action bar with a backdrop blur:
   ```tsx
   <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 p-3 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-tactile-modal flex items-center gap-2">
     <button className="flex-1 h-11 bg-[#0052CC] text-white font-bold rounded-xl text-xs uppercase tracking-wider">
       Request Best Quote
     </button>
   </div>
   ```

---

## 3. Data Tables vs. Mobile Card Stacks

Wide multi-column tables are illegible and cumbersome on mobile screens:
- **Rule:** Never force horizontal table scrolling as the sole mobile interface for critical data.
- **Pattern:** Use dual presentation:
  - Mobile (`< 768px`): Render a clean, vertical card stack displaying key chemical attributes (Manufacturer, Purity, MOQ, In-Stock badge, Quote button).
  - Desktop (`md:` and above): Render the high-density comparison table.

```tsx
{/* Mobile Card List (< 768px) */}
<div className="md:hidden space-y-3">
  {offerings.map(offering => (
    <div key={offering.id} className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
      ...
    </div>
  ))}
</div>

{/* Desktop Comparison Table (>= 768px) */}
<div className="hidden md:block overflow-x-auto border border-slate-200 rounded-xl">
  <table className="w-full text-left text-xs">...</table>
</div>
```

---

## 4. Mobile Modal Sheets

Dialogs on mobile devices should behave like native bottom sheets:
- Full screen width (`w-full`) with rounded top corners (`rounded-t-2xl sm:rounded-2xl`).
- Dock to bottom on small viewports (`mt-auto sm:my-auto`).
- Capped height with smooth scrolling (`max-h-[92vh] overflow-y-auto`).
- Clear sticky dismiss header so the user can easily exit.

---

## 5. Mobile Typography & Input Fields

1. **Prevent iOS Auto-Zoom:** Input fields must have `text-base sm:text-xs` or `font-size: 16px` on mobile viewports so iOS Safari does not zoom the viewport on focus.
2. **Prevent Horizontal Layout Shifts:** Every page root container must have `overflow-x-hidden` or `w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`.
3. **Number Keypad Hints:** Inputs expecting numeric values (quantities, CAS numbers, PIN codes) should carry `inputMode="numeric"` or `inputMode="decimal"` to invoke the numeric virtual keyboard on mobile phones.
