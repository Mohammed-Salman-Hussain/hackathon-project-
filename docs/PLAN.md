# LoopLocal — Build Plan

Source of truth for *what* to build: [`MASTER_PROMPT.md`](MASTER_PROMPT.md).
This file says *how*: architecture, folder layout, data model, and each step broken into tasks with a definition of done.
Log of what has actually been done: [`PROGRESS.md`](PROGRESS.md).

**Any model continuing this work:** read MASTER_PROMPT.md → this file → the last block of PROGRESS.md, then carry on from "Next step".

---

## 1. Architecture

A single-page app that runs entirely in the browser. No backend, no login, no API keys.

```
┌──────────────────────────── UI (React routes) ────────────────────────────┐
│ Landing · Command (Officer/Resident/Worker) · Loops · Hub Twin · Storm    │
│ Impact · Replicate · Evidence · Hardware · Security · SDG 9 · Novelty x4  │
└───────────────▲──────────────────────────────────────────▲────────────────┘
                │ selectors (read)                         │ actions (write)
┌───────────────┴──────────────────────────────────────────┴────────────────┐
│                     Zustand store  (persisted: localStorage)               │
│  ui slice · clock slice · sim slice · actions slice · audit slice ·        │
│  reports slice · credits slice · checklist slice                           │
└───────────────▲────────────────────────────────────────────────────────────┘
                │ tick(simMinute, scenario, seed) → SimSnapshot
┌───────────────┴────────────────────────────────────────────────────────────┐
│  Engine (pure TypeScript, no React)                                         │
│  formulas.ts · scenarios.ts · simulate.ts · decisions.ts · score.ts · rng.ts│
└───────────────▲────────────────────────────────────────────────────────────┘
                │
┌───────────────┴──────────────┐
│  Seed data (src/data/*.ts)   │ hubs, drains, feeders, STPs, workers, evidence,
└──────────────────────────────┘ sensors, FAQ, localities, i18n
```

Rules:
- **The engine is pure.** `simulate(state, scenario, minute)` returns a new snapshot. No DOM, no timers, no randomness except the seeded RNG. This makes it unit-testable and deterministic for the demo.
- **One clock.** A single `requestAnimationFrame` loop in `useClock` advances `simMinute`; a full day = 120 s at 1×. Every screen reads from the same snapshot.
- **Cross-role wiring is just store state.** The action list lives in the store; Officer, Field Worker and Resident views are three filters over it.
- **Persisted:** ui prefs, actions and their status, audit log, issue reports, credits ledger, checklists. **Not persisted:** the live snapshot (recomputed).
- **3D is lazy.** Every react-three-fiber scene is behind `React.lazy` + Suspense with an SVG fallback, also used when `prefers-reduced-motion` is set or WebGL is missing.
- **Routing:** `HashRouter` so GitHub Pages works without server rewrites. Vite `base: '/hackathon-project-/'`.

## 2. Tech stack

React 18 · Vite · TypeScript strict · Tailwind CSS · shadcn/ui (Radix) · Framer Motion · three + @react-three/fiber + @react-three/drei · Recharts · MapLibre GL (Carto dark / OpenFreeMap tiles, no key) · Zustand (+persist) · React Router · Vitest (engine tests) · Playwright (screenshots) · ESLint · GitHub Actions → GitHub Pages.

## 3. Folder layout

```
.
├── .github/workflows/deploy.yml      # build + publish to GitHub Pages on merge to main
├── docs/                             # MASTER_PROMPT, PLAN, PROGRESS, screenshots/step-NN/
├── scripts/screenshots.mjs           # Playwright sweep: every route at 390 and 1440
├── index.html
├── src/
│   ├── main.tsx · App.tsx · routes.tsx
│   ├── styles/                       # globals.css, theme tokens (CSS variables)
│   ├── engine/                       # rng, formulas, scenarios, simulate, decisions, score, types
│   ├── data/                         # hubs, drains, feeders, stps, workers, localities,
│   │                                 # evidence, sensors, faq, tutorials, threats
│   ├── store/                        # useStore.ts + slices/
│   ├── i18n/                         # en.ts, te.ts, hi.ts, useT.ts
│   ├── hooks/                        # useClock, useReducedMotion, useCountUp, useMediaQuery
│   ├── components/
│   │   ├── ui/                       # shadcn primitives
│   │   ├── layout/                   # TopBar, SideNav, BottomNav, Footer, AuroraBackground
│   │   ├── common/                   # GlassCard, LoopRing, EstimateChip, AssumptionsDrawer,
│   │   │                             # HelpTip, CountUp, FlowLine, StatusPill, EmptyState
│   │   ├── charts/                   # Radar, Area, Bar wrappers themed to the palette
│   │   ├── map/                      # LocalityMap, layers, markers
│   │   └── three/                    # LoopRing3D, HubTwin3D, DeviceViewer3D
│   └── pages/
│       ├── Landing/
│       ├── Command/ (Officer, Resident, FieldWorker)
│       ├── Loops/ · HubTwin/ · Storm/ · Impact/ · Replicate/ · Evidence/
│       ├── Hardware/ (sections A–K) · Security/ · Sdg9/
│       └── Credits/ · LeakDetective/ · MonsoonCard/ · PolicySandbox/
└── tests/engine/*.test.ts
```

## 4. Data model (TypeScript, `src/engine/types.ts`)

```ts
type LoopId = 'waste' | 'energy' | 'rain' | 'reuse' | 'savings';
type Role = 'officer' | 'resident' | 'worker';
type ScenarioId = 'normal' | 'storm' | 'heatwave' | 'peak';
type ActionStatus = 'pending' | 'dispatched' | 'done' | 'verified';

interface Hub {
  id: string; name: string; area: string; flats: number; lat: number; lng: number;
  section: string;                       // discom section, e.g. 'KPHB-3'
  solarKwp: number; roofAreaM2: number;
  biogasM3PerDay: number;                // 0 if no unit
  tankKl: number; sumpKl: number; pumpKw: number;
  hasRechargePit: boolean; pitCleanDaysAgo: number;
  stpKld: number; stpRegistered: boolean; // Green Water Tanker registration
  connectedLoadKw: number; ownTransformer: boolean;
  segregationScore: number;              // 0–100
}
interface Drain   { id: string; name: string; path: [number, number][]; widthM: number;
                    daysSinceClean: number; hotspotProximity: number; complaints: number; }
interface Feeder  { id: string; name: string; section: string; capacityKva: number; baseLoadPct: number; }
interface Worker  { id: string; name: string; trade: 'sanitation'|'pump'|'plumber'|'lineman'; area: string; }

interface Scenario {
  id: ScenarioId;
  rainMmPerHour: (hour: number) => number;
  cloud: (hour: number) => number;       // 0–1
  tempC: (hour: number) => number;
  windKmh: (hour: number) => number;
  wasteFactor: number; loadFactor: number;
  outages: { section: string; startHour: number; hours: number }[];
}

interface HubState {
  hubId: string; solarKw: number; biogasKw: number; pumpOn: boolean; pumpSource: 'solar'|'biogas'|'grid'|'off';
  tankPct: number; sumpPct: number; gridUp: boolean;
  stpInflowL: number; stpOutflowL: number; stpSurplusL: number; stpHealthy: boolean;
  rechargeL: number; wasteDivertedKg: number; nightFlowLph: number;
  tankersAvoided: number; kwhShifted: number; rupeesSaved: number;
}
interface LoopScore { total: number; byLoop: Record<LoopId, number>; }
interface SimSnapshot {
  minute: number; scenario: ScenarioId;
  hubs: Record<string, HubState>;
  drainRisk: Record<string, number>;      // 0–100
  feederLoadPct: Record<string, number>;
  totals: { tankersAvoided: number; kwhShifted: number; rechargeL: number;
            wasteDivertedKg: number; rupeesSaved: number; reuseL: number; };
  score: LoopScore;
}

interface Action {
  id: string; loop: LoopId; title: string; reason: string;
  place: { label: string; lat: number; lng: number };
  assigneeRole: Worker['trade'] | 'officer'; assigneeId?: string;
  deadlineMinute: number; priority: 1 | 2 | 3;
  impact: { label: string; scoreDelta: number };
  status: ActionStatus; steps: string[]; safetyTip: string;
  proofPhoto?: string; createdMinute: number; source: 'engine' | 'resident' | 'officer';
}
interface AuditEntry { id: string; ts: number; actor: Role; event: string; prevHash: string; hash: string; }
```

### Formulas (all in `engine/formulas.ts`, each exported with a human-readable description for the Assumptions drawer)
- `solarKw = kWp × irradiance(hour) × (1 − cloud) × 0.78`
- `biogasKw = m³/day × wasteFactor × segregation × 2.0 kWh/m³ ÷ run hours`
- `tank Δ = pump inflow − demand(flats, hour, temp)`; pump runs when (solar or biogas covers pumpKw) or (grid up and tank < low mark) or pre-cut top-up
- `rechargeL = roofArea × rainMm × 0.8 × pitOpen`
- `clogRisk = clamp(0.45·rainForecast + 0.25·hotspot + 0.2·daysSinceClean/30 + 0.1·complaints)`
- `stpSurplus = outflow − onsiteUse − rechargeTopUp(if quality ok)`
- `feederLoad = base × loadFactor × hourCurve(hour) + tempUplift`
- `tankersAvoided = (rechargeCredit + reuseL) ÷ 5,000 L`
- `loopScore = Σ weight[loop] × subScore[loop]` (weights 0.2 each, shown and editable in the drawer)

### Decision rules (`engine/decisions.ts`, deterministic)
1. Drain clog risk ≥ 70 and rain within 6 h → "Clear Drain D-xx before HH" (sanitation)
2. Planned cut within 4 h and tank < 80% → "Top up tanks at {hub} by HH" (pump operator)
3. Storm within 6 h and pit present → "Open and inspect recharge pit at {hub}" (plumber)
4. STP inflow normal and outflow < 70% → "Check STP blower at {hub}" (plumber)
5. Feeder load ≥ 85% → "Shift pump schedule off-peak in section {x}" (lineman)
6. Wet waste backlog or segregation < 60 → "Collect wet waste from {hub}" (sanitation)
7. Night flow > 1.3× baseline for 3 days → "Check for leak at {hub}" (plumber)
8. STP surplus > 5 kL and registered → "Book Green Water Tanker for {site}" (officer)
Ranking: `priority = urgency(deadline) × impact(scoreDelta) × confidence`.

## 5. Design tokens

CSS variables in `styles/globals.css`, mapped into Tailwind (`bg`, `surface`, `water`, `aqua`, `energy`, `waste`, `rain`, `danger`, `text`, `muted`). Dark default; `.light` class overrides. Fonts: Space Grotesk (display), Inter (body). To change the palette, edit the variables only.

## 6. Steps, tasks and definition of done

Every step: branch `step-NN-name` → PR into `main` (summary, screenshots, how to test) → PROGRESS.md block. Always: `npm run build` and `npm run lint` clean, no console errors, screenshots at 390 px and 1440 px reviewed.

| Step | Tasks | Done when |
|---|---|---|
| **00 plan** (direct to main) | README, .gitignore, MASTER_PROMPT, PLAN, PROGRESS | Files on `main` |
| **01 scaffold** | Vite+TS strict; Tailwind + tokens; shadcn base (button, card, dialog, sheet, tabs, tooltip, select, slider, switch, toast); HashRouter with all route stubs; fonts; ESLint; Vitest; Pages workflow; Playwright script | Live Pages link shows the themed shell; CI green |
| **02 layout** | TopBar (logo ring, locality, hub, scenario, clock controls, language, role, theme); SideNav + mobile BottomNav + More sheet; Footer; Aurora background; i18n dictionaries; GlassCard, HelpTip, EstimateChip | Every control renders and updates the ui slice on both sizes |
| **03 engine** | rng, seed data (10 hubs, 22 drains, 9 feeders, 12 STPs, 12 workers), scenarios, formulas, simulate, decisions, score; store slices; useClock; Assumptions drawer; Vitest tests | Clock ticks; switching scenario changes snapshot and action list; tests pass |
| **04 landing** | LoopRing3D hero + SVG fallback; scroll story "one colony, one bad week"; five loop cards; CTAs | 60 fps, lazy 3D, reduced-motion respected |
| **05 officer** | MapLibre map + 5 layers; fingerprint radar; action queue with dispatch + assignee; drain leaderboard; transformer watch; STP tracker; KPI strip; audit log; report preview/print | Dispatch changes status and writes audit entry |
| **06 resident + worker** | Today's plan generator; tank gauge; alerts; segregation leaderboard; issue form (photo preview, map pin → officer queue); payback estimator; surplus card; worker task cards, detail, checklist, photo proof, voice note, shift summary, offline badge | Dispatch → task → done → verified → score animation + toast |
| **07 loops** | Node graph with particle links and live values; side panel per node; "Why this matters" | Every node clickable; values follow the clock |
| **08 hub twin** | 3D cut-away building; animated pipes, tank levels, sun; click-for-stats; day-in-the-life scrubber; with/without toggle; 2D SVG fallback | Scrubber and clock both drive the scene |
| **09 storm** | Scripted 8-step sequence with narration, map + twin highlights; before/after panel | Runs end to end from one button, replayable |
| **10 impact, replicate, evidence** | Counters, charts, score breakdown, SDG target badges; 5-locality radars + playbooks; evidence cards with tags and filter | All charts animate and respond to scenario |
| **11 hardware** | Sections A–K incl. architecture SVG with link-cut toggle, sensor catalogue filters, DeviceViewer3D exploded view, wiring schematic, MQTT/JSON, no-hardware sources, tutorials, rule-based assistant (30+ Q&As), checklists, rollout, hub sizer | Every sub-section interactive |
| **12 security + SDG 9** | Trust Centre: identity, encryption, RBAC matrix tied to role, hash-chained audit with real SHA-256 verify + tamper demo, privacy, resilience, interlocks, threat table; SDG 9 story page with live numbers | Verify passes, then fails after tamper |
| **13 novelty** | Loop Credits marketplace; Night-Flow Leak Detective; Monsoon Report Card (+bulk dispatch); Policy Sandbox | All four read from and write to the engine/store |
| **14 demo + tour** | 5-step first-visit tour; auto-play 2-minute demo with caption bar, pause/skip | Demo runs hands-free from Landing |
| **15 QA** | Full screenshot sweep; a11y (focus, contrast, labels); bundle splitting; Lighthouse ≥ 80 perf / ≥ 90 a11y; README with screenshots, live link, demo script | Final checklist in MASTER_PROMPT §15 all ticked |

## 7. Risks and how they are handled

| Risk | Handling |
|---|---|
| 3D heavy on low-end laptops | Lazy load, low-poly primitives, cap DPR at 1.5, SVG fallback |
| Map tiles blocked at the venue | Fallback to a bundled SVG outline of Kukatpally with the same markers and layers |
| Large bundle | Route-level code splitting; three and maplibre in their own chunks |
| Credits run out mid-step | Small PRs; PROGRESS.md updated before every stop |
| Demo not repeatable | Seeded RNG; "Reset demo" button |
| Over-claiming | "Model estimate" chip, Assumptions drawer, Evidence sources, no deployment or partner claims |
