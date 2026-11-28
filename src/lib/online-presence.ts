import { useEffect, useSyncExternalStore } from 'react';
import { useLocation } from 'react-router-dom';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

// Live "who is on Menuzo right now" count, using Supabase Realtime presence.
// Each tab opens one shared channel. Tabs outside the admin portal mark themselves online
// under a random id (no personal data); the admin portal untracks itself and only counts.
export const ONLINE_CHANNEL = 'menuzo-online';

/** Company admin pages (portal and its login) are staff, not visitors, so they are never counted. */
export function isAdminPortalPath(pathname: string) {
  return ['/admin-portal', '/admin-login'].some((base) => pathname === base || pathname.startsWith(`${base}/`));
}

/** Number of distinct tabs in a presence state (each tab tracks under its own key). */
export function countPresence(state: Record<string, unknown[]>) {
  return Object.values(state).filter((entries) => Array.isArray(entries) && entries.length > 0).length;
}

function randomKey() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

let channel: RealtimeChannel | null = null;
let subscribed = false;
let wantTracking = false;
let isTracking = false;
let count: number | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function applyTracking() {
  if (!channel || !subscribed || wantTracking === isTracking) return;
  isTracking = wantTracking;
  void (wantTracking ? channel.track({ online_at: new Date().toISOString() }) : channel.untrack());
}

function ensureChannel() {
  if (channel) return;
  const ch = supabase.channel(ONLINE_CHANNEL, { config: { presence: { key: randomKey() } } });
  channel = ch;
  const sync = () => {
    count = countPresence(ch.presenceState());
    emit();
  };
  ch.on('presence', { event: 'sync' }, sync)
    .on('presence', { event: 'join' }, sync)
    .on('presence', { event: 'leave' }, sync)
    .subscribe((status) => {
      subscribed = status === 'SUBSCRIBED';
      // A reconnect starts without our presence, so track again if we should be online.
      if (subscribed) {
        isTracking = false;
        applyTracking();
      }
    });
}

function setTracking(online: boolean) {
  wantTracking = online;
  ensureChannel();
  applyTracking();
}

/** Mounted once at the app root: marks this tab online while it is outside the admin portal. */
export function OnlinePresenceTracker() {
  const { pathname } = useLocation();
  const online = !isAdminPortalPath(pathname);
  useEffect(() => { setTracking(online); }, [online]);
  return null;
}

function subscribe(listener: () => void) {
  ensureChannel();
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

/** Live count of tabs online. Null until the first presence sync arrives (or if Realtime is unreachable). */
export function useOnlineCount() {
  return useSyncExternalStore(subscribe, () => count, () => null);
}
