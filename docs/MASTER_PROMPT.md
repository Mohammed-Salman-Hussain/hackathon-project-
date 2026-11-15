# MASTER PROMPT — LoopLocal (Hackathon Round 1 build)

**For:** Claude Fable 5.2 (builder). Any model that picks up later follows the same prompt.
**Written by:** Claude Opus 5.5 (planner)
**Repo:** https://github.com/Mohammed-Salman-Hussain/hackathon-project- (currently empty)
**Goal:** Qualify for Round 1 with a front-end product that looks finished, is easy to use, and has every feature working.

---

## 0. HOW YOU MUST WORK (read first, follow exactly)

1. **Plan before code.** Your first job is `docs/PLAN.md`: the architecture, folder layout, data model, the build steps below broken into small tasks, and a definition of done for each step. Commit it before you write any app code.
2. **Work one step at a time, in order.** Each step from Section 12 gets:
   - its own branch: `step-NN-short-name` (e.g. `step-03-sim-engine`)
   - its own **pull request** into `main`, with a clear title, a summary of what changed, screenshots of new screens, and a "How to test" list
   - an entry in `docs/PROGRESS.md` (see the template in Section 13)
3. **Bootstrapping the empty repo:** you can't open a PR against a repo with no commits. Push a single first commit to `main` with only `README.md`, `.gitignore` and `docs/PLAN.md`. Every change after that goes through a PR.
4. **Leave it ready to hand over.** Credits may run out partway. After every step the repo must build, `docs/PROGRESS.md` must say exactly what is done, what is half-done and what comes next, and the next model must be able to carry on by reading `docs/PLAN.md` + `docs/PROGRESS.md` + this prompt (saved as `docs/MASTER_PROMPT.md`).
5. **Check your own work.** After each screen, run the app, take screenshots at 390px (mobile) and 1440px (desktop) with Playwright, look at them, and fix anything broken, ugly, overlapping or half-built before opening the PR. Put the screenshots in `docs/screenshots/step-NN/`.
6. **Nothing is "coming soon".** Every button, tab, toggle, form and filter must do something real inside the simulation. If a feature is in this prompt, it ships.
7. **Keep `main` green.** `npm run build` and `npm run lint` pass on every PR, with no TypeScript errors and no console errors.

---

## 1. THE PRODUCT IN ONE LINE

**LoopLocal is the brain that gets a neighbourhood's water, power, waste and drains to help each other. The Loop Hub is the body where its decisions happen.**

Themes: Urban Tech · UN SDGs **6** (water), **7** (energy), **9** (industry, innovation, infrastructure), **11** (sustainable cities).

---

## 2. THE PROBLEM (use this story on the landing page and in the pitch)

One colony, one bad week — **Kukatpally, Hyderabad, in heavy rain:**
- One rain and wind spell cut power for 5–6 hours across 20+ colonies.
- With the power gone, pumps trip and water supply stops (this has happened across KPHB and Kukatpally).
- Choked drains flood the streets. The GHMC chief engineer named clogged nalas as a major cause of flooding. The IDL nala, originally 7 m wide, had narrowed to 2 m in places.
- A few months later the same colony is short of water: tanker bookings in Kukatpally were **up 185% in October**, and the zone handles **~40,000–45,000 bookings a month**.
- What ties the two together: only **~0.95%** of Hyderabad's rain soaks into the ground.
- **Each department fixes one link of the chain. Nobody manages the whole loop.**

**The idea:** think of a kitchen garden. Scraps become compost, compost grows food, rain fills the can. LoopLocal does the same for a locality: waste becomes power, power moves water, saved water saves power, and used water gets reused.

---

## 3. CORE CONCEPTS

### The Core (one engine for the whole locality)
- **Map:** drains, lakes, pumps, tanks, rooftops, waste routes, sewage plants.
- **Signals:** weather forecasts, complaints, outage notices, tanker bookings, satellite images.
- **Forecasts:** rain impact, solar output, waste volume, evening power load.
- **Decision engine:** ranks the best actions across all loops at once.
- **Dispatch:** sends each action to the person who can carry it out, with place, reason and deadline.
- **Loop Score (0–100):** one number for how much the locality recycles and saves, broken down by loop and tied to SDGs 6, 7, 9 and 11.

### The Loop Hub (where it happens)
One apartment complex or colony block that handles part of its own power, water and waste, with the Core as its brain. A hub starts with one or two parts and adds more:
- **Solar roof** for pumps, lifts and corridor lights
- **Biogas unit** for wet waste
- **Pumps and tanks**: *a water tank is a battery you fill when power is available*
- **Recharge pit** that sends storm runoff into the ground
- **STP** (sewage treatment plant) whose treated water becomes a resource

Hubs **share surplus**: one hub's extra biogas or treated water can serve a neighbour. The municipal view is all hubs added together.

### The five loops (colour-coded everywhere)
| # | Loop | What the engine does | Colour |
|---|------|------------------------|--------|
| 1 | **Waste → Power** | Routes wet waste (50–60% of urban waste) to local biogas, monitors feed quality. Keeping wet waste out of drains also lowers flood risk, so one action helps two loops. | Green |
| 2 | **Sun + Biogas → Pumps** | Runs pumps and STP blowers in sunlit hours and fills tanks before planned cuts. On a cloudy day it switches to biogas. Uses the off-peak tariff discount (10 am–6 pm). | Amber |
| 3 | **Rain → Water** | Before a storm it flags the drains most likely to choke and opens recharge pits. It ranks hubs by tanker use, missing pits and roof area, and estimates litres recharged per storm. | Violet |
| 4 | **Used water → Resource** | Uses STP water in this order: (a) on site (flushing, gardens, cooling), (b) recharge-pit top-up if the quality test passes, (c) surplus sold to construction sites through a **Green Water Tanker** booking. Flags a failing plant (normal inflow, falling treated output). | Teal/Aqua |
| 5 | **Saved water → Saved power** | Fewer tanker trips, more recharge and more reuse mean less pumping and a smaller power bill. | Blue-cyan |

### A day in the life of one hub (use it in Hub Twin and Storm Simulator)
- **Morning:** kitchens produce wet waste → Core sends it to biogas.
- **Midday:** strong sun → pumps and STP blowers run on solar, tank fills.
- **Afternoon:** forecast shows a storm, discom announces a cut for the section → tanks top up early.
- **Storm night:** runoff goes into the recharge pit, not the street. The tank carries the building through the outage.
- **Next day:** a nearby construction site books the surplus treated water; Loop Score updates.

### Positioning (wording rules)
India already has city command centres, flood alerts (Chennai, Bengaluru) and energy platforms (e.g. Tata Power demand response). They work at **city scale or on one problem**. LoopLocal is the **neighbourhood layer**: it joins all the loops and turns data into dispatched actions.
- Say "neighbourhood layer". **Never** say "first ever" or "only solution".
- Present LoopLocal as the **hub-side engine that feeds into** HMWSSB's own STP–buyer platform, not a competitor to it.

---

## 4. TECH STACK

- **React 18 + Vite + TypeScript** (strict)
- **Tailwind CSS + shadcn/ui** for components
- **Framer Motion** for transitions and micro-interactions
- **Three.js via @react-three/fiber + @react-three/drei** for 3D: hero loop ring, 3D Hub Twin, 3D hardware/component viewer
- **Recharts** for charts
- **MapLibre GL** (free tiles, no API key, e.g. OpenFreeMap / Carto dark) or **Leaflet** as a fallback, with real Kukatpally coordinates
- **Zustand** (one shared store, persisted to `localStorage`)
- **React Router** (hash router, so it works on GitHub Pages)
- **i18n:** a small dictionary for English / తెలుగు / हिन्दी key labels
- **Playwright** for screenshot checks
- **Deployment:** a GitHub Actions workflow that publishes to **GitHub Pages** on every merge to `main` (set the Vite `base` to the repo name). Put the live link at the top of the README. Judges need a link they can click.

No backend, no login, no API keys. Everything runs in the browser.

---

## 5. DESIGN LANGUAGE (make it mesmerizing, and still easy to use)

**Palette (dark "night-city" default):**
| Token | Use | Suggested hex |
|------|-----|-----|
| `bg` | deep navy base | `#060B1A` / surfaces `#0B1430` |
| `water` | teal / aqua | `#14E0C8` / `#38BDF8` |
| `energy` | amber (solar) | `#FBBF24` |
| `waste` | green (biogas) | `#34D399` |
| `rain` | violet (rain, drains) | `#A78BFA` |
| `danger` | alerts | `#F87171` |
| `text` | primary / muted | `#E6EDF7` / `#8A9BB8` |

*(If the user supplies a different palette, swap these tokens in `tailwind.config` and nothing else needs to change.)*

- Subtle **aurora gradients** in the background; **glassmorphism cards** with soft glow borders.
- **Signature motif: the glowing Loop Ring** with five colour-coded arcs. Use it in the logo, the hero (3D, slowly rotating, particles orbiting) and the Loop Score gauge.
- **Animated flow lines** with particles moving between nodes (waste → biogas → pumps → tank; rain → recharge; STP → garden).
- Fonts: geometric display for headings (e.g. *Space Grotesk* / *Sora*), clean sans for body (*Inter*). Load from Google Fonts.
- Count-up numbers, smooth page transitions, hover tooltips, skeleton loaders, toast notifications.
- **Light-mode toggle.** Respect `prefers-reduced-motion` (switch off particles and 3D auto-rotation).
- No lorem ipsum, no stock photos. Draw illustrations as SVG or 3D.
- **Ease of use matters as much as looks:** clear labels, one main action per screen, a first-visit guided tour (5 steps, skippable), and a "?" help icon on every panel.
- Performance: 3D scenes lazy-loaded, 60 fps on a mid-range laptop, Lighthouse performance ≥ 80 and accessibility ≥ 90.

---

## 6. GLOBAL LAYOUT

- **Top bar:** logo · locality selector (Kukatpally default) · hub selector · scenario switcher (**Normal day, Storm day, Heatwave, Peak evening**) · simulated clock with play / pause / speed (1×, 2×, 4×) · language toggle (EN / తె / हि) · **role switcher: Officer, Resident, Field Worker** · theme toggle.
- **Main navigation:** Command · Loops · Hub Twin · Storm Simulator · Impact · Replicate · Evidence · Hardware & Integration · Security · SDG 9 Innovation. On mobile this becomes a bottom nav plus a "More" sheet.
- **Footer:** "The software recommends; people carry out the actions."
- **Landing / intro page** (`/`): the hero with the 3D Loop Ring, the one-line pitch, the "one colony, one bad week" story as a scroll-animated sequence, the five loops, and a big **"Enter Command Centre"** button plus a **"Start 2-minute demo"** button that runs the demo flow from Section 11 automatically.

### Data-labelling rule (resolves a conflict between the user's notes; follow this)
The user's notes say both "badge every simulated number" and "don't say we used mock data anywhere". Do this:
- **Never** use the words "mock", "fake", "dummy" or "placeholder" in the UI.
- Mark model outputs with a small, tasteful **"Model estimate"** chip (tooltip: "Calculated by the LoopLocal engine from the assumptions shown"), and keep an **Assumptions** drawer that shows the formulas.
- Real-world figures live in **Evidence**, with their source names.
- **Never claim real deployments, partners, customers or live sensor feeds.** The Hardware tab says plainly that it is the integration plan.

---

## 7. SIMULATION ENGINE (one shared store, `src/engine/`)

- **24-hour compressed clock:** a full day in ~2 minutes at 1×.
- **Scenario inputs:** rain (mm/h), wind, cloud cover, temperature, outage events (section, start, duration), waste volume, peak load.
- **Per hub and per locality outputs:** solar kW, biogas m³ / kWh, pump on/off, overhead and sump tank level %, STP inflow / outflow / surplus litres, recharge litres, clog risk per drain, transformer load %, tanker bookings avoided, kWh moved out of peak, ₹ saved, waste diverted (kg), and the **Loop Score (0–100)** with a per-loop breakdown.
- **Simple formulas you can see**, kept in one file (`engine/formulas.ts`) and rendered in the Assumptions drawer. Examples:
  - `solar_kW = capacity_kWp × irradiance(hour) × (1 − cloud) × 0.78`
  - `recharge_L = roof_area_m² × rain_mm × 0.8 × pit_open`
  - `clog_risk = f(rain forecast, waste hotspot proximity, days since last clean, complaints)`
  - `loop_score = weighted mean of 5 loop sub-scores` (weights shown)
- **Decision engine** (`engine/decisions.ts`): rule-based and deterministic. It produces a **ranked action list**, e.g. *"Clear Drain D-07 before 6 pm — clog risk 82%"*, *"Top up Sri Sai Residency tanks by 4 pm — cut 7–10 pm in Section KPHB-3"*. Each action has: id, loop, title, reason, place (lat/lng), assignee role, deadline, priority, expected impact, status (**Pending → Dispatched → Done → Verified**).
- **Seed data** (`src/data/`): fictional hubs (e.g. *Sri Sai Residency, 212 flats*; *Lakshmi Heights, 140 flats*; *Green Park Colony Block C*; add 5–8 more) placed on **real area names**: KPHB Phase 1–6, Moosapet, Balanagar, Nalla Cheruvu, IDL nala, Khaitlapur transfer station, Kukatpally Rythu Bazar. 20+ drains (D-01…), 8+ feeders/transformers, 10+ STPs (some registered for Green Water Tankers, some not), field workers with Indian names.
- Use a seeded random generator so the demo looks the same every time.
- A **"Reset demo"** button clears `localStorage`.

---

## 8. SCREENS

### 8.1 COMMAND (changes with role)

**OFFICER VIEW** (municipal, water board, discom)
- Locality **fingerprint radar**: which loops are weakest
- **Map of Kukatpally** with hub markers and toggleable layers: flood risk, outage risk, waste hotspots, tanker demand, heat
- **Priority action queue** with Dispatch buttons, assignee picker, deadline, status
- **Drain risk leaderboard** (top 10)
- **Transformer watch:** feeders ranked by load %, and a flag for apartments over 15 kW without their own transformer
- **STP registration tracker** (registered vs unregistered) + Green Water Tanker bookings
- **KPI strip:** tankers avoided, kWh moved, litres recharged, waste to biogas, Loop Score
- **Audit log** + **"Export report"** (opens a styled PDF preview of the day's report; downloadable through the browser's print-to-PDF)

**RESIDENT VIEW** (RWA secretary, residents)
- **Today's plan** in plain language ("Tank fills from 11 am on solar; storm expected at 6 pm, tanks top up by 4 pm")
- Live tank level, solar and biogas share, ₹ saved, tankers avoided (with assumptions)
- **Alerts:** storm warning, planned cut for my section, boil-water advisory
- **Waste segregation score** + neighbourhood leaderboard with reward badges
- **Report an issue** form (blocked drain, garbage pile, foul water, streetlight): photo upload (stored as a local preview), map pin; it becomes an action in the Officer queue
- **Payback estimator** for adding solar or biogas, with editable assumptions
- **Surplus sharing card:** offer or receive treated water, biogas or solar from a neighbouring hub

**FIELD WORKER VIEW** (sanitation, pump operators, plumbers, linemen; mobile-first, big buttons)
- **Task cards** with place, reason, deadline and priority
- **Task detail:** mini map, step checklist, "Mark done" with photo proof, safety tip, **Offline mode** badge (works with the network off, because everything is local)
- **Shift summary:** tasks done, impact created ("You helped avoid 3 tanker trips")
- **Voice-note button** (records audio using the browser MediaRecorder and plays it back) + EN / తె / हि toggle

**Cross-role wiring (must work):** Officer dispatches → task appears instantly in Field Worker → resident gets a notification when relevant → worker marks done → Officer verifies → **Loop Score animates up** with a toast.

### 8.2 LOOPS
An interactive animated node graph or Sankey of the five loops, with live values on every link. Clicking a node opens a side panel: what happens here, what feeds it, what it feeds, the action the engine would dispatch, and a plain-language **"Why this matters"** line.

### 8.3 HUB TWIN (3D)
- A **3D cut-away apartment complex** (react-three-fiber): solar roof, kitchens, biogas unit, pump room, overhead + sump tanks, STP, garden, recharge pit. Flows animate with the clock (glowing pipes, water level rising in the tanks, sun moving).
- Orbit controls; click any part for its live stats.
- **Timeline scrubber**: "A day in the life of a hub" with the 5 chapters from Section 3.
- **"With LoopLocal" vs "Without"** toggle comparing outcomes side by side.
- An SVG 2D fallback for reduced-motion or low-power devices.

### 8.4 STORM SIMULATOR
A big **"Run Storm Day"** button. Steps unfold one after another, with narration: forecast arrives → engine flags 2 drains + 1 pump line → tasks dispatched to workers → tanks fill on solar → recharge pits open → outage hits → tank carries the hub through → runoff recharges. Finish with a **before / after** comparison: flooded streets, outage hours without water, water supplied, litres recharged.

### 8.5 IMPACT
Animated counters and charts for water, energy and waste; Loop Score breakdown by loop; **SDG 6, 7, 9, 11 badges**, each mapped to targets (6.3, 6.4, 7.2, 7.3, 9.1, 9.4, 11.5, 11.6); the Assumptions panel.

### 8.6 REPLICATE
Radar-chart comparison of **Kukatpally, LB Nagar, Uppal, Yousufguda, Ameerpet**, labelled "Illustrative weights". Each locality gets a different **starter playbook** (e.g. Uppal: drains + recharge first; Ameerpet: peak-load + solar first).

### 8.7 EVIDENCE
Cards with the real figure, source name and a **Verified / Needs checking** tag:
- Kukatpally zone: ~40,000–45,000 tanker bookings/month (HMWSSB official, *South First*) — Verified
- Kukatpally tanker bookings +185% YoY, October 2026 (*Telangana Today*) — Verified
- ~0.95% of Hyderabad's rainwater percolates (HMWSSB MD, *Newsmeter*) — Verified
- IDL nala narrowed from 7 m to 2 m by encroachment (*Hyderabad Mail*) — Verified
- 20+ colonies lost power for 5–6 h after one rain and wind spell (*Hyderabad Mail*) — Verified
- Apartments above 15 kW should have their own transformer (*Telangana Today*) — Verified
- Greater Hyderabad record peak 4,421 MW on 3 March 2026 (*Newsmeter*) — **Needs checking** (sources differ)
- Green Water Tankers launched 1 Nov 2026; only 61 of ~600 private STPs registered before the 25 Oct deadline (*Hans India*) — Verified
- 17,384 of 40,209 surveyed complexes had no recharge pit (HMWSSB, *Telangana Today*) — Verified
- Wet waste ≈ 50–60% of urban waste (CPCB paper via *Down To Earth*) — Verified
- 2026-27 tariff: +₹1.50/unit at peak (6–10 am, 6–10 pm), −₹0.50 from 10 am–6 pm for covered categories (*Hans India*) — note: "Applicability to apartment common-area meters not confirmed."
- Delhi RWA biogas plant cut wet waste ~30% and fuelled community kitchens — case study
- Mumbai complex (850+ flats) installed 810 kW rooftop solar for common areas after spending up to ₹17 million/year on them — case study

### 8.8 HARDWARE & INTEGRATION
Header: *"How LoopLocal connects to the real world. The Round 1 prototype runs in simulation; this is the integration plan."*
- **A. Architecture diagram** (animated SVG): sensors/meters → edge gateway per hub → connectivity (LoRaWAN, NB-IoT/LTE, Wi-Fi) → cloud (AWS IoT Core, S3, Lambda, SageMaker, time-series store, QuickSight / custom dashboard) → LoopLocal Core → three apps. Show the **local-rules fallback** at the gateway when the cloud link drops (an animated toggle that "cuts" the link).
- **B. Sensor catalogue:** filterable cards grouped by loop. Each card: what it measures, mounting, signal type, connectivity, power, sampling rate, which decision it feeds, calibration/upkeep, failure modes, indicative cost band (Low/Med/High, "indicative, to be validated").
  - Water: radar/ultrasonic tank level, pump-outlet flow meter, pressure transducer, borewell level probe, quality probes (pH, turbidity, TDS, residual chlorine)
  - Pumps & energy: smart meter with CT clamps, smart relay/contactor for pump timers, solar inverter data link, feeder/transformer load monitor
  - Drains & rain: radar level sensor in nalas, tipping-bucket rain gauge, AI camera flagging garbage at drain inlets
  - Waste: bin fill-level sensors, load cells at segregation, QR/RFID collection tags, vehicle GPS
  - Biogas: gas flow meter, CH₄ + H₂S sensor, digester temperature + pH, feed-weight scale
  - STP: dissolved oxygen, inflow/outflow meters, turbidity + pH, blower current monitor
  - Air & heat (optional): PM2.5/PM10, temperature + humidity
- **C. 3D component viewer:** rotate a 3D model (built from primitives) of key devices (tank level sensor, edge gateway, smart meter, rain gauge); exploded-view animation.
- **D. Per-hub wiring view:** interactive schematic; click a device to see its interface (4–20 mA, RS485 Modbus, pulse, I²C), gateway port and MQTT topic.
- **E. Data flow:** sample MQTT topic tree (`looplocal/{locality}/{hub}/{loop}/{device}/telemetry`), sample JSON payload in a code block, alert thresholds (e.g. tank < 30% before a forecast cut → top-up action).
- **F. Integration without new hardware:** weather API, satellite imagery, public complaint portals, discom outage notices, HMWSSB tanker/registration data, each tagged **Public / Needs permission / Simulated**.
- **G. Tutorials:** step-by-step illustrated guides (install a tank sensor, calibrate a pH probe, pair a gateway).
- **H. "Ask LoopLocal" rule-based assistant:** a chat panel answering FAQs from a local knowledge base using keyword/intent matching (no LLM, no API). Suggested-question chips. Give it 30+ Q&As covering the hardware, the loops, security and costs.
- **I. Role-wise checklists:** Officer, Vendor, Field technician, Resident (tickable, saved locally).
- **J. Phased rollout:** Phase 0 simulated demo → Phase 1 software + existing meters/bills → Phase 2 low-cost sensors at one hub → Phase 3 hub cluster with surplus sharing.
- **K. Interactive hub sizer:** number of flats + loops chosen → suggested sensor list with cost bands ("a guide, not a quote").

### 8.9 SECURITY (a dedicated tab and a selling point)
Show this as a polished "Trust Centre" page with diagrams:
- **Device identity:** an X.509 certificate per device, mutual TLS, secure boot, **signed OTA firmware** updates
- **In transit / at rest:** TLS 1.3, encrypted storage, key rotation
- **Role-based access control:** a matrix of what Officer / Resident / Field Worker / Vendor can see and do (interactive table; changing the role in the top bar greys out actions live)
- **Tamper-evident audit log:** each entry hash-chained to the previous one; show a "Verify chain" button that actually checks the hashes in the browser (Web Crypto SHA-256)
- **Privacy by design:** resident data aggregated at hub level, minimum data collected, consent screens, built to align with India's **Digital Personal Data Protection Act, 2023**
- **Resilience:** gateway local-rules fallback, offline-first field app, rate limiting, anomaly detection for spoofed sensor readings (e.g. impossible tank-level jumps flagged)
- **Safety interlocks:** the software never switches pumps or valves outside safe limits; people approve high-impact actions ("human in the loop")
- A threat-model table: threat → mitigation

### 8.10 SDG 9 INNOVATION (Industry, Innovation & Infrastructure)
A storytelling page on how LoopLocal advances SDG 9 (and links to 6, 7, 11):
- **9.1** resilient local infrastructure (hubs ride through outages and floods)
- **9.4** upgrading existing buildings for resource efficiency (retrofit, not rebuild)
- **9.5 / 9.c** local innovation and digital access (works on low-end phones, in 3 languages)
- Show "infrastructure that cooperates": before/after diagrams of siloed departments vs a joined loop
- Pull live numbers from the engine (kWh moved, litres reused, tankers avoided)

---

## 9. FOUR NEW FEATURES FOR NOVELTY (build all four)

1. **Loop Credits — hub-to-hub surplus exchange**
   A marketplace where hubs list surplus treated water, biogas or solar kWh and neighbours claim it. Every trade earns **Loop Credits** (a community points ledger, not money and not crypto) that hubs can spend on priority drain cleaning or a share of community-kitchen biogas. It has a live trade feed, a hub credit leaderboard, and a matching suggestion from the engine ("Lakshmi Heights needs 8 kL tomorrow; Sri Sai has 12 kL surplus, 400 m away").

2. **Night-Flow Leak Detective**
   Uses *minimum night flow* (2–4 am water flow, when nobody should be using much) to spot hidden leaks and running taps per hub. It shows a 7-day night-flow chart, flags any hub whose baseline creeps up, estimates litres lost per day and ₹ per month, and dispatches a "check for leak" task to the plumber.

3. **Monsoon Readiness Report Card**
   A pre-monsoon grade (A–F) for every hub and every drain: recharge pit present and clean, drains near the hub cleared, tank can last N hours of outage, STP registered for Green Water. The Resident view gets a shareable card ("Sri Sai Residency: B+ — add 1 recharge pit to reach A"). The Officer view gets a ward-level heat map plus a one-click "pre-monsoon drive" that bulk-dispatches the fixes.

4. **Policy Sandbox ("What-if" for officers)**
   Sliders such as: "% of complexes with recharge pits", "% of STPs registered for Green Water", "solar on X% of rooftops", "wet-waste segregation rate". The page projects the locality-wide change in tanker bookings, flood-risk drains, peak load and Loop Score. It is how an officer argues for a policy with numbers.

*(Optional extras if time remains: Heat Shield cool-roof planner for heatwave days; tree-cutting → biogas routing; a WhatsApp-style alert preview for residents.)*

---

## 10. INTERACTIONS, POLISH AND QUALITY BAR

- A scenario change must **visibly** change the map, charts and action queue within one clock tick.
- Design every **empty, loading and error state**.
- Fully **keyboard accessible**, visible focus rings, WCAG AA contrast, meaningful alt text and ARIA labels.
- **Mobile-first**: every screen works at 360–390px; Field Worker is designed for phones first.
- Toasts for every important event; confirmation dialogs for destructive actions.
- No dead links, no `console.log` noise, no unused routes.

**Honesty rules:** never claim real deployments or partnerships. Show the assumptions behind every estimate. The footer always reads *"The software recommends; people carry out the actions."*

---

## 11. THE 2-MINUTE DEMO FLOW (must run without a hitch, and also auto-play from the landing page)

1. Open **Command** in **Officer** view
2. Switch the scenario to **Storm day**
3. Press **Run Storm Day** → watch the actions dispatch
4. Switch to **Field Worker** → complete a task (photo proof) → Loop Score animates up
5. Switch to **Resident** → see the tank carry the hub through the outage
6. Open **Impact** → Loop Score + SDG badges
7. Open **Hardware & Integration** → show how it connects to real sensors (and flash the Security tab)

The auto-play version shows a small caption bar narrating each step, with pause/skip controls.

---

## 12. BUILD STEPS (one branch + one PR each)

| Step | Branch | Scope | Done when |
|---|---|---|---|
| 00 | `main` (direct) | README, .gitignore, `docs/PLAN.md`, `docs/MASTER_PROMPT.md`, `docs/PROGRESS.md` | Plan committed |
| 01 | `step-01-scaffold` | Vite + TS + Tailwind + shadcn + router + theme tokens + fonts + lint + GitHub Pages workflow | Live link shows a styled shell |
| 02 | `step-02-layout` | Top bar, nav (desktop + mobile), footer, i18n, role/scenario/clock controls (UI only), light/dark | All controls render on mobile and desktop |
| 03 | `step-03-sim-engine` | Seed data, Zustand store, clock, formulas, scenarios, decision engine, Loop Score, unit tests for formulas | Store ticks; scenario changes outputs |
| 04 | `step-04-landing` | 3D Loop Ring hero, problem story, loops overview, CTAs | Landing looks stunning at 60 fps |
| 05 | `step-05-command-officer` | Map + layers, action queue, leaderboards, transformer watch, STP tracker, KPIs, audit log, PDF export | Dispatch works |
| 06 | `step-06-command-resident-worker` | Resident + Field Worker views, cross-role wiring, issue reporting, voice note, offline badge | Dispatch → task → done → score up |
| 07 | `step-07-loops` | Animated loop graph + side panels | Click any node for details |
| 08 | `step-08-hub-twin` | 3D cut-away hub, timeline scrubber, with/without toggle, 2D fallback | Flows follow the clock |
| 09 | `step-09-storm` | Storm Simulator sequence + before/after | Runs end to end |
| 10 | `step-10-impact-replicate-evidence` | Impact, Replicate, Evidence | All charts animate |
| 11 | `step-11-hardware` | All 11 sub-sections A–K of Hardware & Integration incl. 3D viewer + assistant | Every sub-section is interactive |
| 12 | `step-12-security-sdg9` | Security Trust Centre (hash-chain verify works) + SDG 9 page | "Verify chain" passes and shows a failure on tamper |
| 13 | `step-13-novelty` | Loop Credits, Night-Flow Leak Detective, Monsoon Report Card, Policy Sandbox | All 4 wired to the engine |
| 14 | `step-14-demo-tour` | Guided first-visit tour + auto-play 2-minute demo | Demo runs hands-free |
| 15 | `step-15-qa-polish` | Playwright screenshot sweep of every route (mobile + desktop), a11y fixes, performance pass, README with screenshots + live link + pitch summary | Lighthouse targets met, no console errors |

If you run low on credits, finish the current step cleanly (build passes, PR opened, PROGRESS updated) before stopping. Never leave a half-merged state.

---

## 13. `docs/PROGRESS.md` TEMPLATE (append one block per step)

```
## Step NN — <name>
- Model: Fable 5.2 (or whichever model did it)
- Date:
- Branch / PR: step-NN-... / #<n>
- Status: Done | Partial | Blocked
- What was built:
- Files touched (key):
- How to test:
- Screenshots: docs/screenshots/step-NN/
- Known issues / TODO:
- Next step for whoever continues:
```

---

## 14. README MUST CONTAIN

Project name + one-line pitch · live demo link · 3–4 hero screenshots/GIF · the problem in 4 bullets · the five loops · feature list by screen · tech stack · how to run locally (`npm i && npm run dev`) · the 2-minute demo script · SDG mapping · honesty note ("prototype running in simulation; Hardware tab is the integration plan") · team credits.

---

## 15. FINAL CHECKLIST BEFORE THE LAST PR

- [ ] Every screen in Section 8 and every feature in Section 9 exists and works
- [ ] The demo flow in Section 11 runs manually **and** on auto-play
- [ ] Role switching changes Command; scenario switching changes map, charts and actions
- [ ] Dispatch → Field task → Done → Verified → Loop Score animation works
- [ ] 3D scenes load lazily and fall back gracefully
- [ ] EN / తె / हि switch key labels
- [ ] Light and dark both look good
- [ ] No "mock / fake / dummy / placeholder" text anywhere; model estimates carry the "Model estimate" chip; no false claims
- [ ] Mobile 390px and desktop 1440px screenshots of every route reviewed and committed
- [ ] GitHub Pages live link works from the README
- [ ] `docs/PROGRESS.md` is complete
