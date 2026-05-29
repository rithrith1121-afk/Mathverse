import { supabase } from '../lib/supabase';
import localforage from 'localforage';

// Track initialized users to avoid duplicate realtime subscriptions
const initializedUserIds = new Set<string>();

/**
 * Types of operations that can be queued while offline.
 */
type QueuedOperation = {
  table: string;
  action: 'insert' | 'update' | 'delete';
  payload: any; // record data
};

/**
 * Initialize realtime listeners for a given user ID.
 * Updates local storage (localforage) when changes are received.
 */
export function initRealtimeSync(userId: string) {
  // Prevent duplicate subscriptions for the same user
  if (initializedUserIds.has(userId)) {
    return;
  }
  initializedUserIds.add(userId);

  // Profiles sync – keep user profile up‑to‑date
  supabase
    .channel('public:profiles')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` },
      (payload) => {
        // Store the latest profile in localforage
        localforage.setItem('profile', payload.new);
        // Optionally broadcast to app via custom event
        window.dispatchEvent(new CustomEvent('profile_updated', { detail: payload.new }));
      }
    )
    .subscribe();

  // Learning sessions sync example
  supabase
    .channel('public:learning_sessions')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'learning_sessions', filter: `user_id=eq.${userId}` },
      (payload) => {
        // Store the latest session list
        localforage.getItem<any[]>('learning_sessions').then((list = []) => {
          const updated = payload.eventType === 'DELETE' ? list.filter((r) => r.id !== payload.old.id) : [...list.filter((r) => r.id !== payload.new.id), payload.new];
          localforage.setItem('learning_sessions', updated);
        });
      }
    )
    .subscribe();

  // Study plans sync
  supabase
    .channel('public:study_plans')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'study_plans', filter: `user_id=eq.${userId}` },
      (payload) => {
        localforage.getItem<any[]>('study_plans').then((list = []) => {
          const updated = payload.eventType === 'DELETE' ? list.filter((r) => r.id !== payload.old.id) : [...list.filter((r) => r.id !== payload.new.id), payload.new];
          localforage.setItem('study_plans', updated);
        });
      }
    )
    .subscribe();
}

/**
 * Queue a mutation when offline. It will be persisted in IndexedDB.
 */
export async function queueMutation(op: QueuedOperation) {
  const queue: QueuedOperation[] = (await localforage.getItem('mutation_queue')) || [];
  queue.push(op);
  await localforage.setItem('mutation_queue', queue);
}

/**
 * Attempt to flush the queued mutations.
 * Called when connectivity is restored.
 */
export async function flushMutationQueue() {
  const queue: QueuedOperation[] = (await localforage.getItem('mutation_queue')) || [];
  const remaining: QueuedOperation[] = [];

  for (const op of queue) {
    try {
      if (op.action === 'insert') {
        await supabase.from(op.table).insert(op.payload);
      } else if (op.action === 'update') {
        await supabase.from(op.table).upsert(op.payload);
      } else if (op.action === 'delete') {
        await supabase.from(op.table).delete().eq('id', op.payload.id);
      }
    } catch (e) {
      console.warn('Failed to sync mutation', op, e);
      remaining.push(op);
    }
  }
  await localforage.setItem('mutation_queue', remaining);
}

/**
 * Listen for online/offline events to trigger sync.
 */
export function setupOnlineListener() {
  window.addEventListener('online', () => {
    console.log('Connection restored – flushing mutation queue');
    flushMutationQueue();
  });
}

/**
 * Initialise the whole cloud sync system for the current user.
 */
export function initialiseCloudSync(userId: string) {
  initRealtimeSync(userId);
  setupOnlineListener();
  // Attempt immediate flush in case there are pending ops from a previous session
  flushMutationQueue();
}
