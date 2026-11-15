import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_LOCALITY } from '@/data/localities';
import { hubsIn } from '@/data/hubDirectory';

export type Role = 'officer' | 'resident' | 'worker';
export type ScenarioId = 'normal' | 'storm' | 'heatwave' | 'peak';
export type Lang = 'en' | 'te' | 'hi';
export type Theme = 'dark' | 'light';
export type Speed = 1 | 2 | 4;

export const DAY_MINUTES = 1440;
/** A full simulated day takes 120 s at 1×, i.e. 12 simulated minutes per second. */
export const SIM_MINUTES_PER_SECOND = DAY_MINUTES / 120;
const START_MINUTE = 6 * 60;

interface UiState {
  theme: Theme;
  lang: Lang;
  role: Role;
  scenario: ScenarioId;
  localityId: string;
  hubId: string;
  /** Simulated minute of the day, 0–1439 (whole minutes) */
  minute: number;
  /** Simulated day counter; goes up each time the clock passes midnight */
  day: number;
  playing: boolean;
  speed: Speed;
  setTheme: (t: Theme) => void;
  setLang: (l: Lang) => void;
  setRole: (r: Role) => void;
  setScenario: (s: ScenarioId) => void;
  setLocality: (id: string) => void;
  setHub: (id: string) => void;
  setMinute: (m: number) => void;
  advance: (minutes: number) => void;
  setPlaying: (p: boolean) => void;
  cycleSpeed: () => void;
}

export const useUi = create<UiState>()(
  persist(
    (set) => ({
      theme: 'dark',
      lang: 'en',
      role: 'officer',
      scenario: 'normal',
      localityId: DEFAULT_LOCALITY,
      hubId: hubsIn(DEFAULT_LOCALITY)[0]!.id,
      minute: START_MINUTE,
      day: 1,
      playing: true,
      speed: 1,
      setTheme: (theme) => set({ theme }),
      setLang: (lang) => set({ lang }),
      setRole: (role) => set({ role }),
      setScenario: (scenario) => set({ scenario }),
      setLocality: (localityId) =>
        set((s) => ({
          localityId,
          hubId: hubsIn(localityId).some((h) => h.id === s.hubId) ? s.hubId : (hubsIn(localityId)[0]?.id ?? s.hubId),
        })),
      setHub: (hubId) => set({ hubId }),
      setMinute: (m) => set({ minute: ((Math.floor(m) % DAY_MINUTES) + DAY_MINUTES) % DAY_MINUTES }),
      advance: (minutes) =>
        set((s) => {
          const next = s.minute + minutes;
          return { minute: next % DAY_MINUTES, day: s.day + Math.floor(next / DAY_MINUTES) };
        }),
      setPlaying: (playing) => set({ playing }),
      cycleSpeed: () => set((s) => ({ speed: s.speed === 1 ? 2 : s.speed === 2 ? 4 : 1 })),
    }),
    {
      name: 'looplocal-ui',
      version: 1,
      // The clock position is not saved: every visit starts the day at 06:00.
      partialize: (s) => ({
        theme: s.theme,
        lang: s.lang,
        role: s.role,
        scenario: s.scenario,
        localityId: s.localityId,
        hubId: s.hubId,
        speed: s.speed,
      }),
    },
  ),
);

/** "06:05" from a minute of the day. */
export const formatClock = (minute: number): string => {
  const h = Math.floor(minute / 60) % 24;
  const m = Math.floor(minute % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

/** Every key this app writes to localStorage starts with this prefix. */
export const STORAGE_PREFIX = 'looplocal-';

export function resetDemo(): void {
  Object.keys(localStorage)
    .filter((k) => k.startsWith(STORAGE_PREFIX))
    .forEach((k) => localStorage.removeItem(k));
  window.location.hash = '#/';
  window.location.reload();
}
