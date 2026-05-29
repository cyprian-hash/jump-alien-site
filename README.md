# Jump Alien — Marketing Site

Static React + Vite + Tailwind site for the Jump Alien iOS app. Three routes:

- `/` — landing page
- `/privacy` — privacy policy (linked from App Store Connect's "Privacy Policy URL")
- `/support` — support / FAQ (linked from App Store Connect's "Support URL")

## Stack

- Vite 7
- React 19
- Tailwind 4
- shadcn/ui primitives (Radix under the hood)
- Wouter for routing
- Plain static build — no server needed for production

## Run locally

```sh
npm install
npm run dev
```

Then visit `http://localhost:3000/`.

> Works with `pnpm` and `yarn` too. The lockfile is intentionally not checked in — generate your own on first install.

## Build

```sh
npm run build
```

Output goes to `dist/public/`. That folder is what you deploy.

```sh
npm run preview
```

Previews the production build locally.

## Type check

```sh
npm run check
```

## Edit copy in one place

Site-wide constants (App Store URL, support email, site name) live in
[`client/src/lib/site.ts`](client/src/lib/site.ts). Update once and the entire
site reflects the change.

After your App Store Connect record is created, change `APP_STORE_URL` to the
real `https://apps.apple.com/.../id1234567890` URL.

## Privacy policy consistency

The `/privacy` page must stay consistent with:

1. The iOS app's `PrivacyInfo.xcprivacy` (in `JumpAlien/`)
2. The App Store Connect "App Privacy" questionnaire

All three currently declare zero data collection. If you ever add analytics,
ads, or Game Center, update all three.

## Deployment

The build produces a static `dist/public/` folder. Deploy it anywhere that
serves static files. A few easy options:

### GitHub Pages
1. Push this folder to a repo
2. In repo Settings &rarr; Pages, set the build action to publish from
   `dist/public/`
3. Add a `.github/workflows/deploy.yml` that runs `npm ci && npm run build`
   and publishes the artifact

### Netlify
1. New site from Git
2. Build command: `npm run build`
3. Publish directory: `dist/public`

### Vercel
1. Import the repo
2. Framework preset: Vite
3. Build command: `npm run build`
4. Output directory: `dist/public`

### Cloudflare Pages
1. Connect repo
2. Build command: `npm run build`
3. Build output directory: `dist/public`

## SPA routing on hosts

Because routing is client-side (Wouter), the host needs to fall back to
`index.html` for unknown paths so that `/privacy` and `/support` don't 404 on
hard refresh. Netlify, Vercel, and Cloudflare Pages do this automatically when
the build is a Vite SPA. For plain static hosts (S3, nginx), add a rewrite
that serves `index.html` for any path that isn't a file.

## Brand assets

Live in `client/public/assets/` and `client/public/fonts/`:

- `logo.png` — JUMP ALIEN logo
- `alien.png` — character walking frame (used in nav)
- `alien-rocket.png` — character flying frame (used in hero)
- `gameplay.png` — gameplay screenshot
- `favicon.png` — 192&times;192 app icon
- `fonts/Turtles.ttf` — the original Jump Alien display typeface

Replace any of these by overwriting the file; no other changes needed.
