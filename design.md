# Design — TĨNH Spa Commerce

## Intent

TĨNH is a quiet-luxury spa commerce experience for real customers who move between two connected needs: caring for their skin at home and booking professional care. The interface should feel editorial and tactile, but remain direct enough to buy a product, book a treatment, ask an advisor, or operate the business without friction.

## Design language

- Genre: editorial commerce with an Atelier treatment.
- Voice: composed, specific, warm; short Vietnamese copy with no promotional shouting.
- Materials: warm paper, wine-red ink, hairline rules, generous negative space, close-cropped skincare photography.
- Typography: Cormorant Garamond for display and editorial moments; IBM Plex Sans for controls, data, labels, prices, and body copy.
- Shape: mostly square and hairline-led. Small radii are reserved for compact controls, not used as a generic card treatment.
- Responsive stance: preserve the order of decisions, not the desktop geometry. Mobile keeps the same product-to-service relationship with a sticky booking action.

## Route macrostructures

### Storefront `/` — Catalogue

- N12 announcement and retractable navigation.
- H6 photographic fold: a full image field with an anchored paper copy panel.
- F6 editorial product grid with useful filters and visible active criteria.
- Service booking is presented as a parallel purchase path, never a secondary afterthought.
- Ft1 mast-headed footer.

### Product `/san-pham/[slug]` — Split Studio

- Product portrait and purchase proof occupy two calm, balanced fields.
- Quantity, inventory, and add state are explicit and accessible.
- The path back to the combined shop-and-service experience remains visible.

### Admin `/admin` — Workbench

- Quiet rail navigation, task-first header, dense but legible operational surfaces.
- Charts reveal from their origin using transforms only.
- Tab changes crossfade; data rows do not perform decorative motion.

## Interaction and motion

- Maximum three motion primitives per route.
- Storefront: first-fold reveal, surface reveal for menus/drawers/dialogs, commerce-state feedback.
- Product: image/copy entrance, quantity feedback, add-button state morph.
- Admin: tab crossfade, chart reveal, inline save confirmation.
- Motion uses opacity and transform only. Focus rings are immediate. Major transitions remain under 500ms.
- Overlays are mutually exclusive, Escape-dismissable, scroll-locking where appropriate, and return focus to their trigger.
- Reduced-motion keeps closed/open state transforms intact while removing decorative animation.

## Token source of truth

The canonical implementation is [`tokens.css`](./tokens.css). Components consume semantic variables only; raw color and font values stay out of route styles.

### CSS variables

```css
:root {
  --color-paper: oklch(97% 0.014 78);
  --color-surface: oklch(99% 0.008 78);
  --color-ink: oklch(19% 0.025 33);
  --color-accent: oklch(35% 0.105 21);
  --font-display: var(--font-cormorant);
  --font-body: var(--font-ibm-plex);
  --space-md: 1rem;
  --space-2xl: 4rem;
  --dur-short: 280ms;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
}
```

### Tailwind v4 mapping

```css
@theme inline {
  --color-tinh-paper: var(--color-paper);
  --color-tinh-surface: var(--color-surface);
  --color-tinh-ink: var(--color-ink);
  --color-tinh-accent: var(--color-accent);
  --font-tinh-display: var(--font-display);
  --font-tinh-body: var(--font-body);
  --spacing-page: var(--page-gutter);
}
```

### DTCG subset

```json
{
  "color": {
    "paper": { "$type": "color", "$value": "oklch(97% 0.014 78)" },
    "ink": { "$type": "color", "$value": "oklch(19% 0.025 33)" },
    "accent": { "$type": "color", "$value": "oklch(35% 0.105 21)" }
  },
  "motion": {
    "short": { "$type": "duration", "$value": "280ms" },
    "long": { "$type": "duration", "$value": "460ms" }
  }
}
```

### shadcn semantic mapping

```css
:root {
  --background: var(--color-paper);
  --foreground: var(--color-ink);
  --card: var(--color-surface);
  --card-foreground: var(--color-ink);
  --primary: var(--color-accent);
  --primary-foreground: var(--color-accent-ink);
  --border: var(--color-rule);
  --ring: var(--color-focus);
  --destructive: var(--color-error);
}
```

## Deliberate constraints

- No glassmorphism, glow, gradient decoration, pill-heavy UI, oversized display type, or floating rounded containers.
- Product/service continuity is the signature interaction: every primary shopping surface should keep professional care one decision away.
- Operational screens may be denser than the storefront, but must share the same type, color, rule, and interaction tokens.
