'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { GpsState, GpsCoords } from '@/hooks/useGps';

interface Props {
  state:   GpsState;
  coords:  GpsCoords | null;
  error:   string;
  onFetch: () => void;
  onReset: () => void;
  /** Visual variant — default matches light card backgrounds, 'dark' suits the SOS screen */
  variant?: 'default' | 'dark';
}

const PIN_ICON = (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const SPINNER = (
  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
  </svg>
);

export function GpsButton({ state, coords, error, onFetch, onReset, variant = 'default' }: Props) {
  const isDark = variant === 'dark';

  /* ── Idle / Error — the main "Use my location" button ─── */
  if (state === 'idle' || state === 'error') {
    return (
      <div className="space-y-1.5">
        <button
          type="button"
          onClick={onFetch}
          className={`inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-xs font-medium transition-colors ${
            isDark
              ? 'border-white/20 bg-white/10 text-white hover:bg-white/15'
              : 'border-line bg-canvas text-ink-muted hover:border-line-strong hover:text-ink'
          }`}
        >
          {PIN_ICON}
          Use my location
        </button>
        {error && (
          <p className={`text-[11px] ${isDark ? 'text-sos-300' : 'text-sos-600 dark:text-sos-400'}`}>
            {error}
          </p>
        )}
      </div>
    );
  }

  /* ── Loading ─────────────────────────────────────────────── */
  if (state === 'loading') {
    return (
      <button
        type="button"
        disabled
        className={`inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-xs font-medium opacity-60 ${
          isDark ? 'border-white/20 bg-white/10 text-white' : 'border-line bg-canvas text-ink-muted'
        }`}
      >
        {SPINNER}
        Getting location…
      </button>
    );
  }

  /* ── OK — show the resolved address + a clear button ─────── */
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-medium ${
          isDark
            ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300'
            : 'border-leaf-200 bg-leaf-50 text-leaf-700 dark:border-leaf-500/20 dark:bg-leaf-500/10 dark:text-leaf-300'
        }`}
      >
        <span className="shrink-0" aria-hidden="true">📍</span>
        <span className="truncate max-w-[180px]">{coords?.label}</span>
        <button
          type="button"
          onClick={onReset}
          aria-label="Clear location"
          className={`ml-1 shrink-0 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors`}
        >
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
