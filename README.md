# LoopLocal

**The brain that gets a neighbourhood's water, power, waste and drains to help each other.**
The Loop Hub is the body where its decisions happen.

Hackathon Round 1 entry · Urban Tech · UN SDGs 6, 7, 9, 11 · worked example: Kukatpally / KPHB, Hyderabad.

> Status: planning complete, build in progress. Live demo link will appear here after Step 01.

## The problem
- One rain and wind spell cut power for 5–6 hours across 20+ colonies; pumps trip and water stops.
- Choked drains flood the streets (the IDL nala narrowed from 7 m to 2 m in places).
- Months later the same colony is short of water: tanker bookings up 185% in October.
- Each department fixes one link of the chain. Nobody manages the whole loop.

## The five loops
1. Waste → Power (wet waste to biogas, kept out of drains)
2. Sun + Biogas → Pumps (pump in solar hours, fill tanks before cuts)
3. Rain → Water (clear risky drains, open recharge pits before storms)
4. Used water → Resource (STP water: on-site use, recharge, Green Water Tanker sale)
5. Saved water → Saved power (fewer tankers, less pumping)

## Project documents
- [`docs/MASTER_PROMPT.md`](docs/MASTER_PROMPT.md) — full product and build specification
- [`docs/PLAN.md`](docs/PLAN.md) — architecture, data model and step-by-step build plan
- [`docs/PROGRESS.md`](docs/PROGRESS.md) — log of every step, for handover between models

## Run locally (from Step 01 onward)
```
npm i && npm run dev
```

## Honesty note
This is a prototype running in simulation. The Hardware & Integration tab is the integration plan, not a deployment.
The software recommends; people carry out the actions.
