# Design — TĨNH Spa Commerce

A locked system for a real spa-commerce experience. Every route shares the same mineral-green palette, tactile glass material, typography, interaction voice, and product-to-service continuity.

## Genre

Editorial commerce with quiet-luxury restraint. The interface feels calm and sensory, but purchase, booking, search, stock and operations stay explicit.

## Macrostructure family

- Storefront `/`: **Marquee Hero** with a full-bleed treatment photograph and the first CTA below the fold; F6 product floor; F4 treatment sequence; Ft5 statement close.
- Product `/san-pham/[slug]`: **Photographic Purchase Studio** with a persistent image field and one focused glass purchase surface.
- Admin `/admin`: **Bento Operations** with a floating command rail, irregular metric hierarchy and dense tabular work areas.

## Theme — Studio Mineral

- Paper: warm mineral ivory, not pure white.
- Ink: deep botanical charcoal.
- Accent: controlled forest green, used for actions and state—not decoration.
- Glass: translucent ivory over photographic or softly coloured fields, with one hairline edge and restrained blur.
- No gradients. Depth comes from transparency, image fields, layering, blur and measured shadow.

## Typography

- Display: Cormorant Garamond, weight 300/600, upright only.
- Body and controls: IBM Plex Sans, weight 400/600.
- Large type uses tight tracking and short lines; operational text remains compact and tabular.
- No italic headings or single-word italic emphasis.

## Navigation and footer

- Nav: **N10 Floating-on-scroll morph**, edge-spanning over the first scene and condensing into a compact glass rail after the first scroll threshold.
- Footer: **Ft5 Statement**, one closing sentence followed by a restrained metadata row.
- The product filter bar may become sticky glass because it carries an active task. Decorative cards may not.

## Spacing and shape

- Four-point named scale from `tokens.css`.
- Soft radii belong to glass navigation, active commerce controls and major photographic frames.
- Product cards remain mostly unboxed; their glass metadata overlaps the image rather than wrapping the entire card.
- Mobile preserves decision order at 320/375/414px and keeps hit targets at least 44px.

## Motion

- Three primitives per route: first-scene reveal, navigation morph, state feedback.
- Motion uses opacity and transform; major motion stays under 760ms.
- Images may settle once on load and scale no more than 1.025 on hover.
- Reduced motion removes decorative transforms and keeps open/closed states legible.

## Product × service signature

Buying and booking are equal paths. The storefront introduces both below the marquee, product pages preserve the consultation route, and admin reporting keeps product and service revenue visible together.

## Exports

### tokens.css

```css
:root {
  --color-paper: oklch(97% 0.015 96);
  --color-paper-2: oklch(94% 0.024 108);
  --color-ink: oklch(18% 0.028 155);
  --color-ink-2: oklch(31% 0.032 155);
  --color-rule: oklch(82% 0.025 130);
  --color-accent: oklch(37% 0.11 151);
  --color-accent-ink: oklch(98% 0.012 105);
  --color-focus: oklch(55% 0.15 151);
  --color-glass: oklch(98% 0.014 102 / 0.68);
  --font-display: var(--font-cormorant);
  --font-body: var(--font-ibm-plex);
  --space-md: 1rem;
  --space-2xl: 4rem;
  --text-display: clamp(3.25rem, 6.4vw, 5.5rem);
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --dur-short: 280ms;
  --radius-xl: 2rem;
}
```

### Tailwind v4 `@theme`

```css
@theme inline {
  --color-tinh-paper: var(--color-paper);
  --color-tinh-surface: var(--color-surface);
  --color-tinh-ink: var(--color-ink);
  --color-tinh-accent: var(--color-accent);
  --font-tinh-display: var(--font-display);
  --font-tinh-body: var(--font-body);
  --spacing-page: var(--page-gutter);
  --radius-tinh-glass: var(--radius-xl);
}
```

### DTCG `tokens.json`

```json
{
  "color": {
    "paper": { "$type": "color", "$value": "oklch(97% 0.015 96)" },
    "ink": { "$type": "color", "$value": "oklch(18% 0.028 155)" },
    "accent": { "$type": "color", "$value": "oklch(37% 0.11 151)" },
    "glass": { "$type": "color", "$value": "oklch(98% 0.014 102 / 0.68)" }
  },
  "font": {
    "display": { "$type": "fontFamily", "$value": "Cormorant Garamond" },
    "body": { "$type": "fontFamily", "$value": "IBM Plex Sans" }
  },
  "motion": {
    "short": { "$type": "duration", "$value": "280ms" },
    "scene": { "$type": "duration", "$value": "760ms" }
  }
}
```

### shadcn/ui CSS variables

```css
:root {
  --background: var(--color-paper);
  --foreground: var(--color-ink);
  --card: var(--color-glass-strong);
  --card-foreground: var(--color-ink);
  --primary: var(--color-accent);
  --primary-foreground: var(--color-accent-ink);
  --muted: var(--color-paper-2);
  --muted-foreground: var(--color-muted);
  --border: var(--color-rule);
  --input: var(--color-rule);
  --ring: var(--color-focus);
  --radius: var(--radius-md);
}
```

## Deliberate constraints

- Liquid glass is a material hierarchy, not a universal card style.
- No glow, gradient decoration, pill-heavy content, generic icon tiles or ornamental badges.
- App screens may be denser, but share the same glass, type, accent and motion tokens.
