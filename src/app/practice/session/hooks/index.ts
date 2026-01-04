/**
 * Session Hooks Barrel Export
 * Re-exports all hooks used by the practice session page.
 */

export { useSessionState } from './useSessionState';
export type {
  SessionPhase,
  ActiveSessionState,
  SessionAction,
  UseSessionStateReturn
} from './useSessionState';

export { useSessionTimer } from './useSessionTimer';
export type {
  UseSessionTimerOptions,
  UseSessionTimerReturn
} from './useSessionTimer';

export { useSessionPersistence, clearPersistedSessionState, SESSION_STATE_STORAGE_KEY, SESSION_CONFIG_STORAGE_KEY } from './useSessionPersistence';
export type {
  PersistedSessionState,
  UseSessionPersistenceOptions,
  UseSessionPersistenceReturn
} from './useSessionPersistence';

export { useSessionKeyboard } from './useSessionKeyboard';
export type {
  UseSessionKeyboardOptions,
  UseSessionKeyboardReturn
} from './useSessionKeyboard';
