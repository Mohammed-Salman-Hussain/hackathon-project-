import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ActionRecord } from '@/engine/session';
import { sha256Hex } from '@/engine/sha256';
import type { Action, AuditEntry } from '@/engine/types';
import { useUi } from './ui';

export const GENESIS_HASH = '0'.repeat(64);

/** The text that is hashed for one audit entry. The Security screen re-checks it. */
export const auditPayload = (e: Omit<AuditEntry, 'hash'>): string =>
  `${e.prevHash}|${e.id}|${e.day}|${e.minute}|${e.actor}|${e.event}`;

interface SimState {
  /** Status of engine-raised actions, by action id */
  records: Record<string, ActionRecord>;
  /** Actions created by people: resident reports and officer tasks */
  custom: Action[];
  audit: AuditEntry[];
  dispatch: (action: Action, assigneeId: string, assigneeName: string) => void;
  markDone: (action: Action, proofPhoto?: string) => void;
  verify: (action: Action) => void;
  addCustom: (action: Action) => void;
  log: (event: string, actor?: AuditEntry['actor']) => void;
}

const MAX_AUDIT = 400;

function appendAudit(audit: AuditEntry[], event: string, actor: AuditEntry['actor']): AuditEntry[] {
  const ui = useUi.getState();
  const prevHash = audit.length ? audit[audit.length - 1]!.hash : GENESIS_HASH;
  const base = { id: `A-${String(audit.length + 1).padStart(4, '0')}`, day: ui.day, minute: ui.minute, actor, event, prevHash };
  return [...audit, { ...base, hash: sha256Hex(auditPayload(base)) }].slice(-MAX_AUDIT);
}

export const useSimStore = create<SimState>()(
  persist(
    (set) => ({
      records: {},
      custom: [],
      audit: [],
      dispatch: (action, assigneeId, assigneeName) =>
        set((s) => ({
          records: { ...s.records, [action.id]: { ...s.records[action.id], status: 'dispatched', assigneeId } },
          audit: appendAudit(s.audit, `Dispatched "${action.title}" to ${assigneeName}`, 'officer'),
        })),
      markDone: (action, proofPhoto) =>
        set((s) => ({
          records: { ...s.records, [action.id]: { ...s.records[action.id], status: 'done', proofPhoto } },
          audit: appendAudit(s.audit, `Marked done "${action.title}"${proofPhoto ? ' with photo proof' : ''}`, 'worker'),
        })),
      verify: (action) =>
        set((s) => ({
          records: { ...s.records, [action.id]: { ...s.records[action.id], status: 'verified' } },
          audit: appendAudit(s.audit, `Verified "${action.title}" (+${action.impact.scoreDelta} ${action.loop})`, 'officer'),
        })),
      addCustom: (action) =>
        set((s) => ({
          custom: [...s.custom, action],
          audit: appendAudit(s.audit, `Reported "${action.title}"`, action.source === 'resident' ? 'resident' : 'officer'),
        })),
      log: (event, actor = useUi.getState().role) => set((s) => ({ audit: appendAudit(s.audit, event, actor) })),
    }),
    { name: 'looplocal-sim', version: 1 },
  ),
);
