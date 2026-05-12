'use client';

import { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { useCurrentUser } from '@/hooks/queries/useAuthQueries';
import { PlanBadge } from '@/components/PlanBadge';

const MESSAGES = {
  PRO: "You're on Pro. Everything just got smarter.",
  BUSINESS: 'Welcome to Business. Built for how serious teams work.',
} as const;

export function PlanCelebrationOverlay() {
  const { data: user } = useCurrentUser();
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userIdRef = useRef<string | null>(null);
  const hasFiredRef = useRef(false);
  const dismissBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!user) return;
    if (!user.plan || user.plan === 'FREE') return;
    if (localStorage.getItem(`plan_celebrated_${user.id}`)) return;
    if (hasFiredRef.current) return;

    hasFiredRef.current = true;
    userIdRef.current = user.id;
    setVisible(true);

    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.55 },
      colors:
        user.plan === 'PRO'
          ? ['#d4af61', '#f0d080', '#b8923a']
          : ['#6366f1', '#818cf8', '#4338ca'],
    });

    timerRef.current = setTimeout(() => dismiss(), 3000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [user]);

  // Focus dismiss button when overlay appears
  useEffect(() => {
    if (visible) dismissBtnRef.current?.focus();
  }, [visible]);

  // Dismiss on Escape
  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible]);

  function dismiss() {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (userIdRef.current)
      localStorage.setItem(`plan_celebrated_${userIdRef.current}`, 'true');
    setVisible(false);
  }

  if (!visible || !user || !user.plan || user.plan === 'FREE') return null;

  const message = MESSAGES[user.plan as keyof typeof MESSAGES];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Plan upgrade: ${user.plan}`}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={dismiss}
    >
      <div
        className="flex flex-col items-center gap-4 rounded-2xl bg-white dark:bg-neutral-900 px-10 py-10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <PlanBadge plan={user.plan} />
        <p className="text-lg font-semibold text-center max-w-xs text-neutral-900 dark:text-neutral-100">
          {message}
        </p>
        <button
          ref={dismissBtnRef}
          onClick={dismiss}
          className="mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
