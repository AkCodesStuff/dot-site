# DOT — logistics landing page template

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · token-driven theming · SEO wired end to end.

```bash
npm install
cp .env.example .env.local   # then set NEXT_PUBLIC_SITE_URL
npm run dev                  # http://localhost:3000
npm run build && npm start
```

---

## The two files you will edit most

| File | What it controls |
| --- | --- |
| [`src/config/site.ts`](src/config/site.ts) | Brand name, logo, **navbar tabs**, CTA, contact details, socials, SEO defaults, hero video |
| [`src/app/globals.css`](src/app/globals.css) | **Every colour in the project**, as design tokens |

---

## Colour tokens — the DOT palette

The project uses **six colours and nothing else**. They are written once, as raw
palette variables, at the top of [`src/app/globals.css`](src/app/globals.css):

| Swatch | Hex | Role | Used for |
| --- | --- | --- | --- |
| DOT Yellow | `#FFC300` | Signature | The DOT dot, highlights, key CTAs |
| DOT Black | `#0A0B0C` | Primary | Logo, headlines, strong contrast |
| DOT White | `#FFFFFF` | Primary | Backgrounds, space |
| DOT Deep Blue | `#123B66` | Secondary | Fleet, transport, brand elements |
| DOT Grey | `#6B7280` | Secondary | Supporting text, icons, hierarchy |
| DOT Light Grey | `#F3F4F6` | Background | Backgrounds, cards, separators |

Everything else is a **semantic alias onto those six**. Components never touch
the raw palette — they use the semantic token, always as a background +
foreground pair:

```tsx
<div className="bg-secondary text-on-secondary">…</div>
<span className="bg-warning text-on-warning">Delayed</span>
```

| Token | Resolves to | Used for |
| --- | --- | --- |
| `primary` / `on-primary` | Black / White | Headlines, default buttons, skip link |
| `primary-hover` | Deep Blue | Black buttons on hover |
| `secondary` / `on-secondary` | Deep Blue / White | Eyebrows, closing CTA bands |
| `accent` / `on-accent` | Yellow / Black | Key CTAs, active tab underline, accents |
| `accent-hover` / `on-accent-hover` | Black / Yellow | Yellow buttons invert on hover |
| `background` / `on-background` | White / Black | Page base |
| `surface` / `on-surface` | Light Grey / Black | Alternating bands, hero, header, footer |
| `surface-raised` / `on-surface-raised` | White / Black | Cards on tinted bands |
| `muted` / `on-muted` | Light Grey / Grey | Chips, supporting body copy |
| `border` | 28% Grey on White | Hairlines, card edges, dividers |
| `outline` | Deep Blue | Focus rings |
| `success` `warning` `danger` `info` | Deep Blue, Yellow, Black, Grey | Status badges |
| `overlay` / `on-overlay` | Black / White | Scrim over the hero video |

**Why status colours are not red/green.** The palette has no red or green, so
severity is carried by weight instead of hue: black reads as most severe,
yellow as attention, deep blue as positive or in progress, grey as neutral.

**The one derived value.** `--border` is a 28% tint of DOT Grey over DOT White.
Full DOT Grey is too heavy for a 1px rule and DOT Light Grey is invisible
against white; both inputs are palette colours. Change it in one place if you
would rather have a flat palette colour there.

**Opacity is allowed.** `bg-accent/15`, `text-on-secondary/80` and similar are
transparency applied to a brand colour, not a new hue.

**There is no dark mode.** A dark theme would need tints and shades that this
palette does not define, so the site is light-only and `color-scheme` is pinned
to `light`. Retheming is still a matter of changing the six values at the top of
`globals.css` — because the tokens are declared with `@theme inline`, every
utility resolves to `var(--token)` at runtime and no component needs touching.

> One documented exception lives outside `globals.css`:
> `siteConfig.browserThemeColor`. The `<meta name="theme-color">` tag is read by
> the browser before any CSS loads, so it cannot reference a CSS variable. It is
> DOT White — keep it in sync with `--background`.

> **Accessibility note.** DOT Grey on DOT White is 4.49:1 (passes AA). DOT Grey
> on DOT Light Grey is 4.08:1, marginally under AA for normal text — that
> pairing is the brand's own, so it is kept as specified. If you want AA
> everywhere, darken `--on-muted` towards `--dot-black` in `globals.css`; it is
> a one-line change and no component is affected.

---

## Navbar

Tabs live in `siteConfig.navigation`. The desktop nav, the mobile menu, the
footer links and `sitemap.xml` all read from that one array.

To add a page:

1. Add an entry to `navigation` in `src/config/site.ts`.
2. Create `src/app/<slug>/page.tsx` and export `metadata` via `createMetadata()`.

Every tab is a real route, not an on-page anchor. The active tab is derived from
`usePathname()` and marked with `aria-current="page"`.

**Logo** — `src/components/layout/Logo.tsx`. Either drop a file in `public/` and
set `siteConfig.logo.src = "/logo.svg"`, or keep the built-in inline SVG mark,
which inherits `currentColor` so it recolours itself on the light header, the
dark footer and over the hero video.

---

## SEO

| Piece | Where |
| --- | --- |
| Site-wide defaults, title template, OG/Twitter, `metadataBase` | `src/app/layout.tsx` |
| Per-page metadata helper | `src/lib/seo.ts` → `createMetadata()` |
| JSON-LD builders | `src/lib/structured-data.ts` |
| JSON-LD renderer | `src/components/seo/JsonLd.tsx` |
| `sitemap.xml` / `robots.txt` | `src/app/sitemap.ts`, `src/app/robots.ts` |

Every page does this:

```tsx
export const metadata = createMetadata({
  title: "Careers",                    // "Careers | DOT" via the template
  description: "…",
  path: "/careers",                    // drives the canonical URL
  keywords: ["logistics jobs"],
});
```

That one call emits the title, description, canonical link, Open Graph tags,
Twitter card and robots directives, so pages cannot drift apart.

Structured data already in place: `Organization` + `WebSite` sitewide,
`BreadcrumbList` on every page, `Service` on home and technology, `FAQPage` on
tracking, and `JobPosting` per role on careers.

**Still to do before launch:** drop a 1200×630 `og-image.png` into `public/`,
set `NEXT_PUBLIC_SITE_URL`, and uncomment the `verification` block in
`src/app/layout.tsx` once you have Search Console tokens.

---

## The scroll-driven hero video

The hero is already built for it. `src/components/media/ScrollVideo.tsx` renders
a tall scroll runway with a sticky, viewport-sized stage inside; scroll progress
drives `video.currentTime`, so scrolling *is* the video timeline. It respects
`prefers-reduced-motion` and drives seeks from `requestAnimationFrame`.

To switch it on, put the file in `public/` and set:

```ts
hero: {
  videoSrc: "/hero.mp4",
  posterSrc: "/hero-poster.jpg",
  scrollLengthVh: 300,   // viewport heights of scroll the video spans
}
```

`src/components/sections/Hero.tsx` swaps from the static layout to the scrubbed
one automatically — the overlay copy is identical in both modes, so no markup
changes.

**Encoding matters more than the code.** Seeking is only smooth with very
frequent keyframes:

```bash
ffmpeg -i in.mp4 -c:v libx264 -crf 24 -g 1 -pix_fmt yuv420p -an public/hero.mp4
```

Keep it to 5–10 seconds and a few MB, and consider a WebM sibling.

---

## Structure

```
src/
├─ app/
│  ├─ layout.tsx          navbar + footer shell, sitewide SEO, JSON-LD
│  ├─ page.tsx            Home
│  ├─ careers/            Careers
│  ├─ contact/            Contact
│  ├─ tracking/           Tracking
│  ├─ technology/         Technology
│  ├─ not-found.tsx       404
│  ├─ sitemap.ts robots.ts
│  └─ globals.css         ← all colour tokens
├─ components/
│  ├─ layout/             Navbar, Logo, Footer
│  ├─ ui/                 Container, Section, SectionHeading, Button, Card, Badge
│  ├─ sections/           Hero, PageHeader, ContactForm, TrackingWidget
│  ├─ media/              ScrollVideo
│  └─ seo/                JsonLd
├─ config/site.ts         ← everything editable
└─ lib/                   seo.ts, structured-data.ts, utils.ts
```

## Template stubs to replace

- `ContactForm` — `handleSubmit` is a no-op; point it at a route handler or Server Action.
- `TrackingWidget` — demo data only; try reference `MRD-4820193`. Replace `lookup()` with your tracking API.
- `openRoles` in `src/app/careers/page.tsx` — swap for a fetch from your ATS.
- Map embed slot on the contact page.
