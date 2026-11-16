import { CloudLightning, HardHat, House, Landmark, Sun, ThermometerSun, Zap, type LucideIcon } from 'lucide-react';
import type { Role, ScenarioId } from '@/store/ui';

export const SCENARIO_ICONS: Record<ScenarioId, LucideIcon> = {
  normal: Sun,
  storm: CloudLightning,
  heatwave: ThermometerSun,
  peak: Zap,
};

export const ROLE_ICONS: Record<Role, LucideIcon> = { officer: Landmark, resident: House, worker: HardHat };
