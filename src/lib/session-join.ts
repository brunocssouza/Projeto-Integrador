/**
 * Determines whether a session's "Join" button should be unlocked.
 * The button unlocks 30 minutes before the scheduled start time.
 */
export function canJoinSession(scheduledAt: string): {
  ok: boolean;
  minutesToStart: number;
} {
  const ms = new Date(scheduledAt).getTime() - Date.now();
  const minutesToStart = ms / 60000;
  return { ok: minutesToStart <= 30, minutesToStart };
}

export const JOIN_WINDOW_MINUTES = 30;
