# Meridian — logistics landing page template

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

## Colour tokens

All colours are declared once in `src/app/globals.css` and exposed to Tailwind
through `@theme inline`. **No component contains a colour literal** — no `#hex`,
no `rgb()`, and no stock Tailwind palette class like `bg-blue-600`.

Each background token has a matching `on-*` foreground token that is readable on
top of it. Always use them in pairs:

```tsx
<div className="bg-primary text-on-primary">…</div>
<span className="bg-warning text-on-warning">Delayed</span>
```

| Background | Foreground | Used for |
| --- | --- | --- |
| `primary` / `primary-hover` | `on-primary` | Brand bands, footer, primary buttons |
| `secondary` / `secondary-hover` | `on-secondary` | Eyebrows, secondary actions |
| `accent` / `accent-hover` | `on-accent` | Highlights, main CTAs, active tab underline |
| `background` | `on-background` | Page base |
| `surface` | `on-surface` | Alternating section bands |
| `surface-raised` | `on-surface-raised` | Cards sitting on a surface |
| `muted` | `on-muted` | Chips, secondary body copy |
| `border`, `outline` | — | Hairlines, focus rings |
| `success` `warning` `danger` `info` | `on-*` | Shipment status badges |
| `overlay` | `on-overlay` | Scrim over the hero video |

**Retheming the whole site** = change the values under `:root`. Because the
tokens are declared with `@theme inline`, every utility resolves to
`var(--token)` at runtime, so there is nothing to duplicate for dark mode.

Dark mode is already handled three ways: `prefers-color-scheme`,
`<html data-theme="dark">` to force it, and `data-theme="light"` to opt out.

> The single documented exception is `siteConfig.browserThemeColor`. The
> `<meta name="theme-color">` tag is read by the browser before any CSS loads,
> so it cannot reference a CSS variable. Keep it in sync with `--background`.

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
  title: "Careers",                    // "Careers | Meridian" via the template
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
