# LoopLocal — Progress Log

One block per step, newest at the bottom. Whoever continues: read the last block's "Next step".

---

## Step 00 — Plan and repo bootstrap
- Model: Claude Fable 5.2
- Date: 2026-11-15
- Branch / PR: `main` (direct first commit; an empty repo cannot take a PR)
- Status: Done
- What was built: `README.md`, `.gitignore`, `docs/MASTER_PROMPT.md` (full spec), `docs/PLAN.md` (architecture, folder layout, data model, formulas, decision rules, step tasks, risks), this file.
- Files touched (key): `README.md`, `docs/*`
- How to test: read `docs/PLAN.md`; nothing to run yet.
- Screenshots: none (no UI yet)
- Known issues / TODO:
  - The session that wrote the plan had no access to the npm registry, so nothing could be installed or built there. Step 01 must run where `npm install` works.
  - Colour palette: using the navy / teal / amber / green / violet tokens from the master prompt until the user supplies another.
- Next step for whoever continues: **Step 01 — scaffold** on branch `step-01-scaffold` (see PLAN.md §6). Enable GitHub Pages (Settings → Pages → Source: GitHub Actions) so the deploy workflow can publish.

## Step 01 — Scaffold
- Model: Claude Fable 5.2
- Date: 2026-11-15
- Branch / PR: `step-01-scaffold` / see PR list
- Status: Done
- What was built: Vite 6 + React 18 + TypeScript strict; Tailwind 3 with every colour as a CSS variable (dark default, `.light` override); shadcn-style primitives written by hand on Radix (button, card, dialog, sheet, tabs, tooltip, select, slider, switch, toaster); HashRouter with all 14 screen routes plus the overview; Loop Ring logo and favicon; aurora background; ESLint 9; Vitest; Playwright screenshot script; GitHub Actions workflow (lint, test, build on every PR; deploy to Pages on `main`).
- Files touched (key): `package.json`, `vite.config.ts`, `tailwind.config.ts`, `src/styles/globals.css`, `src/components/ui/*`, `src/routes.ts`, `src/App.tsx`, `src/pages/*`, `scripts/screenshots.mjs`, `.github/workflows/deploy.yml`
- How to test: `npm i && npm run dev`, open the printed URL. `npm run lint`, `npm test`, `npm run build` all pass. Screenshots: `npm run build && CHROME_PATH=/usr/bin/google-chrome npm run shots -- step-NN [routes]` (omit `CHROME_PATH` if Chrome is installed normally).
- Screenshots: `docs/screenshots/step-01/`
- Known issues / TODO:
  - Decisions that differ from the plan's wording: the shadcn CLI was not used (its registry is not reachable from the build sandbox), so the primitives are hand-written in the same style. Tailwind is v3 (the spec refers to `tailwind.config`), React is 18 as specified.
  - Screens other than the overview show an interim brief (`src/pages/ScreenBrief.tsx`) until their step lands; each step replaces its route's element in `src/App.tsx`.
  - **The repo owner must enable Pages once:** Settings → Pages → Source: "GitHub Actions". Until then the deploy job fails; the build job still passes.
  - three, @react-three/fiber (v8 for React 18), @react-three/drei (v9), recharts and maplibre-gl are not installed yet; add them in the step that first needs them.
- Next step for whoever continues: **Step 02 — layout** on `step-02-layout`, branched from `step-01-scaffold` if PR 1 is not merged yet.

## Step 02 — Layout
- Model: Claude Fable 5.2
- Date: 2026-11-15
- Branch / PR: `step-02-layout` (branched from `step-01-scaffold`) / see PR list
- Status: Done
- What was built: top bar (locality, hub, scenario, simulated clock with play / pause / 1×-2×-4×, language EN / తె / हि, role switcher, theme toggle); desktop side navigation with Screens and Tools groups; phone bottom navigation with a "More" sheet; a Controls sheet that holds every control on narrow screens plus "Reset demo" with a confirmation dialog; footer; light theme; i18n dictionaries; shared `GlassCard`, `HelpTip` ("?"), `EstimateChip` ("Model estimate"), `Segmented`. The clock really ticks (one `requestAnimationFrame` loop, a day in 120 s at 1×) and choices persist in `localStorage` under `looplocal-ui`.
- Files touched (key): `src/store/ui.ts`, `src/hooks/useClock.ts`, `src/i18n/*`, `src/components/layout/*`, `src/components/common/*`, `src/data/localities.ts`, `src/data/hubDirectory.ts`
- How to test: switch role, scenario, language and theme and reload: the choices stay. Press pause: the clock stops. Narrow the window below 1024 px: side nav becomes the bottom nav, controls move into the sheet. Controls → Reset demo clears saved state.
- Screenshots: `docs/screenshots/step-02/`
- Known issues / TODO:
  - Telugu and Hindi labels were checked for key coverage by a unit test, but the build sandbox has no Telugu/Devanagari font, so their on-screen shaping could not be reviewed in a screenshot. Check once in a normal browser (Noto Sans Telugu / Devanagari load from Google Fonts).
  - Only the labels in `src/i18n/en.ts` are translated. Each later step adds its own key labels to all three dictionaries (the test in `tests/i18n.test.ts` fails if one is missed).
  - Every `localStorage` key must start with `looplocal-` so "Reset demo" clears it.
  - Hubs exist for all five localities in `src/data/hubDirectory.ts` (10 in Kukatpally, 2 each elsewhere). Step 03 decides how much of the engine runs for the other four.
- Next step for whoever continues: **Step 03 — simulation engine** on `step-03-sim-engine`, branched from `step-02-layout`.
