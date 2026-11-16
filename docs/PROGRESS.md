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

## Step 03 — Simulation engine
- Model: Claude Fable 5.2
- Date: 2026-11-15
- Branch / PR: `step-03-sim-engine` (branched from `step-02-layout`) / see PR list
- Status: Done
- What was built:
  - `src/engine/` (pure TypeScript, no React): `types`, `rng` (seeded), `formulas` (every formula and constant, plus the `FORMULAS` list for the Assumptions drawer), `scenarios` (normal, storm, heatwave, peak), `simulate` (a full day in 5-minute steps for every hub, drain and feeder, with the Loop Score), `decisions` (8 deterministic rules → ranked actions with place, reason, deadline, assignee trade, checklist, safety tip, impact), `session` (merges saved statuses, feeds finished actions back into the simulation), `sha256` (for the hash-chained audit log).
  - `src/data/`: Kukatpally seed data (10 hubs, 22 drains, 9 feeders, 12 STPs of which 4 registered, 12 workers, 3 buyer sites) and a seeded generator for the other four localities.
  - `src/store/sim.ts` (persisted as `looplocal-sim`): action statuses, reported actions, audit log. `dispatch`, `markDone`, `verify`, `addCustom`, `log`.
  - Hooks: `useSession()` (the day), `useSim()` (the day at the current minute: `snap`, `usualSnap`, `score`, `visible` actions).
  - UI: Assumptions drawer, Loop Score gauge (side nav and overview), live engine panel on the overview with KPIs and the top actions, `CountUp`.
  - 27 engine unit tests (`tests/engine/`).
- Files touched (key): `src/engine/*`, `src/data/kukatpally.ts`, `src/data/locality.ts`, `src/store/sim.ts`, `src/hooks/useSim.ts`, `src/components/common/{AssumptionsDrawer,LoopScoreCard,CountUp}.tsx`, `src/pages/LiveEngine.tsx`
- How to test: `npm test`. In the app, open the overview, switch the scenario to Storm day and let the clock run: the Loop Score, KPIs and action list change. Open "Assumptions".
- Screenshots: `docs/screenshots/step-03/`
- How the engine fits together (read this before Steps 05–13):
  - The whole day is computed up front (`simulateDay`), so any screen can read any minute (`snapshotAt(day, minute)`), which is what the Hub Twin scrubber and Storm Simulator need.
  - `mode: 'with' | 'without'`. `session.usual` is the same day run the usual way (timer pumping, no reuse, pits not opened). Use it for every "with vs without" comparison.
  - Actions come from `planDay` on the baseline day, so the list is stable. Their ids are `locality:scenario:rule:target`. Status lives in the store. An action that is `done` or `verified` changes the simulation through `effectsOf` (cleared drain, topped-up tank, opened pit, fixed STP, shifted pumping, collected waste). A `verified` action also adds its `impact.scoreDelta` to its loop's sub-score (capped at 18 per loop) via `applyActionBonus`. That is the "Loop Score animates up" moment for Step 06.
  - `effects.all = true` assumes every recommendation was carried out; use it for the "after" side of the Storm Simulator.
  - Storm day, Kukatpally, end of day: usual way 7 flooded drains and 250 hub-minutes without water; with every action done 0 and 0. These are model estimates.
- Known issues / TODO:
  - Tuning choices made here that the plan did not fix: piped supply covers 78% of demand; tankers avoided = (trips on the usual day − trips with LoopLocal) + 30% of recharge ÷ 5,000 L, not the simpler reuse-based formula in PLAN §4; storm peak is 26 mm/h (85 mm in the day); clog-risk rain term saturates at 30 mm/h. All are listed in the Assumptions drawer.
  - Performance finding: animating CSS-blurred aurora layers ran at 7 fps without a GPU. The aurora now uses plain radial gradients and `.glass` cards have no `backdrop-filter` (56–61 fps in the same test). Keep `backdrop-filter` to the sticky bars and sheets only, and never animate an element that has a CSS blur.
  - The four non-Kukatpally localities use generated data (2 hubs, 8 drains, 3 feeders each). Good enough for the selector to work; Replicate (Step 10) has its own illustrative weights.
  - Night-flow history for the Leak Detective (Step 13): use `nightFlowLph(flats, leakGrowth, dayIndex, noise)`; `sai-krupa` (7%/day) trips the rule, `vivekananda-c` (4%/day) is a "watch".
  - Not yet installed: three, @react-three/fiber@8, @react-three/drei@9 (Step 04), maplibre-gl and recharts (Step 05).
- Next step for whoever continues: **Step 04 — landing** on `step-04-landing`, branched from `step-03-sim-engine`: 3D Loop Ring hero (lazy, SVG fallback = the existing `LoopRing`), the "one colony, one bad week" scroll story, loop cards, "Enter Command Centre" and "Start 2-minute demo" buttons. Keep `LiveEngine` on the page or move it to Command in Step 05.
