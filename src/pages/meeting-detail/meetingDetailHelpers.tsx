/* eslint-disable react-refresh/only-export-components */
// Shared helpers for MeetingDetail layouts
import { useState, useEffect, useRef } from 'react';
import { Loader2, Users, Pencil } from 'lucide-react';
import type { SMASpeaker } from '@/services/smaService';
import { useRenameSpeaker } from '@/hooks/queries/useSMAQueries';

export function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function formatDuration(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds) || seconds <= 0) return '--:--';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

// ── Inline speaker rename chip ──
export function SpeakerChip({
  speaker,
  meetingId,
  participantNames = [],
}: {
  speaker: SMASpeaker;
  meetingId: string;
  participantNames?: string[];
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(speaker.displayName ?? speaker.speakerLabel);
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutate: rename, isPending } = useRenameSpeaker(meetingId);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  useEffect(() => {
    if (!editing) setValue(speaker.displayName ?? speaker.speakerLabel);
  }, [speaker.displayName, speaker.speakerLabel, editing]);

  const save = (overrideValue?: string) => {
    const trimmed = (overrideValue ?? value).trim();
    if (!trimmed || trimmed === (speaker.displayName ?? speaker.speakerLabel)) {
      setEditing(false);
      return;
    }
    rename(
      { speakerId: speaker.id, displayName: trimmed },
      { onSettled: () => setEditing(false) }
    );
  };

  if (editing) {
    return (
      <div className="flex items-center flex-wrap gap-1">
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => save()}
          onKeyDown={(e) => {
            if (e.key === 'Enter') save();
            if (e.key === 'Escape') {
              setValue(speaker.displayName ?? speaker.speakerLabel);
              setEditing(false);
            }
          }}
          className="px-2 py-0.5 rounded-md text-xs font-medium border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 outline-none focus:border-neutral-500 dark:focus:border-neutral-400 w-28"
        />
        {participantNames.map((name) => (
          <button
            key={name}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setValue(name);
              save(name);
            }}
            className="px-2 py-0.5 rounded-full text-xs border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
          >
            {name}
          </button>
        ))}
        {isPending && (
          <Loader2 className="w-3 h-3 animate-spin text-neutral-400 shrink-0" />
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="group flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
      title={`${speaker.speakerLabel} — click to rename`}
    >
      <span>{speaker.displayName ?? speaker.speakerLabel}</span>
      <Pencil className="w-2.5 h-2.5 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}

// ── Speakers section (reused across RecordedDetail + ScheduledDetail) ──
export function SpeakersSection({
  speakers,
  meetingId,
  participantNames,
}: {
  speakers: SMASpeaker[];
  meetingId: string;
  participantNames: string[];
}) {
  if (speakers.length === 0) return null;
  const hasUnnamed = speakers.some((s) => !s.displayName);

  return (
    <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
      <div className="flex items-center gap-1.5 mb-2.5">
        <Users className="w-3.5 h-3.5 text-neutral-400" />
        <span className="text-[10px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
          Speakers ({speakers.length})
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {speakers.map((s) => (
          <SpeakerChip
            key={s.id}
            speaker={s}
            meetingId={meetingId}
            participantNames={participantNames}
          />
        ))}
      </div>
      <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-2">
        {hasUnnamed
          ? 'Click a speaker to name them — or pick from participants'
          : 'Click a speaker to rename'}
      </p>
    </div>
  );
}

export function SkeletonLines({ count = 3 }: { count?: number }) {
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded-lg"
          style={{ width: `${75 + (i % 3) * 10}%` }}
        />
      ))}
    </div>
  );
}
