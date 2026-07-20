/**
 * Lightweight global toast store.
 *
 * Why a singleton: the previous implementation kept toasts in component-local
 * state, which meant `toast()` calls from one component (e.g. ScanButton) were
 * never visible — the <Toaster> rendered elsewhere had its own list. This module
 * exposes one process-wide store so any caller and the single <Toaster> share
 * the same queue.
 */

import { useCallback, useEffect, useState } from 'react';

export type ToastVariant = 'default' | 'destructive';

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

export interface ToastItem extends ToastOptions {
  id: number;
}

type Listener = () => void;

// =====================================================
// Module-level singleton store (shared across all callers)
// =====================================================
let toasts: ToastItem[] = [];
const listeners = new Set<Listener>();
let counter = 0;

function emit() {
  for (const l of listeners) l();
}

function scheduleDismiss(id: number, duration: number) {
  window.setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    emit();
  }, duration);
}

function pushToast(options: ToastOptions) {
  const id = ++counter;
  const item: ToastItem = {
    id,
    duration: 4000,
    variant: 'default',
    ...options,
  };
  toasts = [...toasts, item];
  emit();
  scheduleDismiss(id, item.duration);
  return id;
}

function dismissToast(id: number) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

// =====================================================
// React hook
// =====================================================

/**
 * Subscribe to the global toast store. Any component can call `toast(...)` to
 * enqueue a notification; mount <Toaster /> once (e.g. in the layout) to render.
 */
export function useToast() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const listener = () => setTick((n) => n + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const toast = useCallback((options: ToastOptions) => pushToast(options), []);
  const dismiss = useCallback((id: number) => dismissToast(id), []);

  return { toast, dismiss, toasts };
}
