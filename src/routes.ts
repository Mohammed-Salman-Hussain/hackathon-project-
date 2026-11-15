import {
  Building2,
  ClipboardCheck,
  CloudRain,
  Coins,
  Cpu,
  FileCheck2,
  Gauge,
  Globe2,
  LayoutDashboard,
  Lightbulb,
  Search,
  Shield,
  SlidersHorizontal,
  Waypoints,
  type LucideIcon,
} from 'lucide-react';

export interface RouteMeta {
  path: string;
  /** i18n key, also used as a stable id */
  key: string;
  label: string;
  icon: LucideIcon;
  group: 'main' | 'tools';
  /** Build step that delivers this screen (docs/PLAN.md §6) */
  step: number;
  blurb: string;
}

/** Single source of truth for navigation and routing. */
export const ROUTES: RouteMeta[] = [
  { path: '/command', key: 'command', label: 'Command', icon: LayoutDashboard, group: 'main', step: 5,
    blurb: 'The day’s priorities for the locality: map, ranked actions, and who is doing what. Changes with your role.' },
  { path: '/loops', key: 'loops', label: 'Loops', icon: Waypoints, group: 'main', step: 7,
    blurb: 'How waste, power, rain and used water feed each other, with live values on every link.' },
  { path: '/hub-twin', key: 'hubTwin', label: 'Hub Twin', icon: Building2, group: 'main', step: 8,
    blurb: 'A 3D cut-away of one apartment hub: solar roof, biogas, pumps, tanks, STP and recharge pit through a full day.' },
  { path: '/storm', key: 'storm', label: 'Storm Simulator', icon: CloudRain, group: 'main', step: 9,
    blurb: 'Run a storm day step by step and compare the outcome with and without LoopLocal.' },
  { path: '/impact', key: 'impact', label: 'Impact', icon: Gauge, group: 'main', step: 10,
    blurb: 'Water, energy and waste results, the Loop Score by loop, and the SDG targets they map to.' },
  { path: '/replicate', key: 'replicate', label: 'Replicate', icon: Globe2, group: 'main', step: 10,
    blurb: 'How five Hyderabad localities differ, and the starter playbook for each.' },
  { path: '/evidence', key: 'evidence', label: 'Evidence', icon: FileCheck2, group: 'main', step: 10,
    blurb: 'The real-world figures behind the problem, each with its source.' },
  { path: '/hardware', key: 'hardware', label: 'Hardware & Integration', icon: Cpu, group: 'main', step: 11,
    blurb: 'The integration plan: sensors, gateways, data flow and rollout phases.' },
  { path: '/security', key: 'security', label: 'Security', icon: Shield, group: 'main', step: 12,
    blurb: 'Trust Centre: device identity, access control, tamper-evident audit log and privacy.' },
  { path: '/sdg9', key: 'sdg9', label: 'SDG 9 Innovation', icon: Lightbulb, group: 'main', step: 12,
    blurb: 'Infrastructure that cooperates: resilient, retrofitted and accessible.' },
  { path: '/credits', key: 'credits', label: 'Loop Credits', icon: Coins, group: 'tools', step: 13,
    blurb: 'Hubs trade surplus treated water, biogas and solar, and earn community credits.' },
  { path: '/leaks', key: 'leaks', label: 'Leak Detective', icon: Search, group: 'tools', step: 13,
    blurb: 'Night-flow monitoring that spots hidden leaks hub by hub.' },
  { path: '/monsoon', key: 'monsoon', label: 'Monsoon Report Card', icon: ClipboardCheck, group: 'tools', step: 13,
    blurb: 'A pre-monsoon grade for every hub and drain, with the fixes that raise it.' },
  { path: '/sandbox', key: 'sandbox', label: 'Policy Sandbox', icon: SlidersHorizontal, group: 'tools', step: 13,
    blurb: 'Move policy sliders and see the locality-wide effect before committing.' },
];
