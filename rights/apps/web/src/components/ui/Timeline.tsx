'use client';

import { motion } from 'framer-motion';
import { Tag } from './Tag';
import { Card } from './Card';
import { strings } from '@/lib/strings';
import type { NoticeEvent } from '@/lib/api';

const s = strings.grievance;

/* ── Icons per EventKind ──────────────────────────────────── */

const eventIcons: Record<string, string> = {
  FILED:            '📄',
  FOLLOWUP_7D:      '🔔',
  ESCALATION_14D:   '⚠️',
  SOS_BROADCAST:    '🚨',
  USER_UPDATE:      '💬',
  COMMUNITY_NOTICE: '🏘️',
};

const eventColors: Record<string, string> = {
  FILED:            'bg-brand-500',
  FOLLOWUP_7D:      'bg-amber-500',
  ESCALATION_14D:   'bg-sos-500',
  SOS_BROADCAST:    'bg-sos-600',
  USER_UPDATE:      'bg-slate-500',
  COMMUNITY_NOTICE: 'bg-leaf-600',
};

const sourceLabel: Record<string, string> = {
  SYSTEM:  'System',
  OFFICER: 'Officer',
  USER:    'You',
};

/* ── Types ────────────────────────────────────────────────── */

export interface TimelineProps {
  events: NoticeEvent[];
  className?: string;
}

/* ── Stagger animation ────────────────────────────────────── */

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const item = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

/* ── Component ────────────────────────────────────────────── */

export function Timeline({ events, className = '' }: TimelineProps) {
  if (events.length === 0) {
    return (
      <Card variant="ghost" className="py-8 text-center">
        <p className="text-sm text-ink-soft">{s.noEvents}</p>
      </Card>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className={`relative ${className}`}
      role="list"
      aria-label={s.timelineTitle}
    >
      {/* Vertical line */}
      <div className="absolute left-5 top-0 h-full w-0.5 bg-gradient-timeline opacity-30" />

      {events.map((event, i) => (
        <motion.div
          key={event.id}
          variants={item}
          className="relative flex gap-4 pb-8 last:pb-0"
          role="listitem"
        >
          {/* Node dot */}
          <div className="relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${eventColors[event.kind] ?? 'bg-slate-600'} shadow-lg`}
            >
              <span className="text-lg" aria-hidden="true">
                {eventIcons[event.kind] ?? '📋'}
              </span>
            </div>
            {/* Pulse ring on latest event */}
            {i === events.length - 1 && (
              <span
                className={`absolute inset-0 rounded-full ${eventColors[event.kind] ?? 'bg-slate-600'} animate-pulse-ring opacity-40`}
              />
            )}
          </div>

          {/* Event card */}
          <Card className="flex-1" variant="default">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold text-ink">
                {s.eventLabels[event.kind] ?? event.kind}
              </h3>
              <Tag value={event.channel} colorScheme="channel" small>
                {s.channelLabels[event.channel] ?? event.channel}
              </Tag>
              {/* Source badge — highlight officer replies */}
              {event.source && event.source !== 'SYSTEM' && (
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${
                  event.source === 'OFFICER'
                    ? 'bg-brand-50 text-brand-700 ring-brand-100 dark:bg-brand-500/10 dark:text-brand-300'
                    : 'bg-canvas-2 text-ink-muted ring-line'
                }`}>
                  {sourceLabel[event.source] ?? event.source}
                </span>
              )}
            </div>

            <time className="mt-1 block text-xs text-ink-soft">
              {new Date(event.sentAt).toLocaleString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </time>

            {/* Officer / user reply — render as message bubble */}
            {event.kind === 'USER_UPDATE' && event.payload && (event.payload as Record<string, unknown>).message ? (
              <div className={`mt-3 rounded-xl p-3 text-sm leading-relaxed ${
                event.source === 'OFFICER'
                  ? 'bg-brand-50 text-brand-900 ring-1 ring-brand-100 dark:bg-brand-500/10 dark:text-brand-100'
                  : 'bg-canvas-2 text-ink ring-1 ring-line'
              }`}>
                {String((event.payload as Record<string, unknown>).message)}
              </div>
            ) : event.payload && Object.keys(event.payload).length > 0 ? (
              /* Generic payload — show key details, not raw JSON */
              <div className="mt-3 space-y-1.5">
                {(event.payload as Record<string, unknown>).subject && (
                  <p className="text-xs font-medium text-ink">
                    📧 {String((event.payload as Record<string, unknown>).subject)}
                  </p>
                )}
                {(event.payload as Record<string, unknown>).to && (
                  <p className="text-xs text-ink-muted">
                    To: {String((event.payload as Record<string, unknown>).to)}
                  </p>
                )}
                {(event.payload as Record<string, unknown>).ccParent && (
                  <p className="text-xs text-ink-muted">
                    CC: {String((event.payload as Record<string, unknown>).ccParent)} (parent authority)
                  </p>
                )}
                {(event.payload as Record<string, unknown>).escalatedTo && (
                  <p className="text-xs font-medium text-sos-600 dark:text-sos-400">
                    ↑ Escalated to: {String((event.payload as Record<string, unknown>).escalatedTo)}
                  </p>
                )}
                {(event.payload as Record<string, unknown>).followupNumber && (
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    Reminder #{String((event.payload as Record<string, unknown>).followupNumber)} sent
                  </p>
                )}
              </div>
            ) : null}
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
