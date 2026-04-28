import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Mic,
  Square,
  Trash2,
  Save,
  CalendarPlus,
  CheckSquare,
  X,
  ChevronLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { meetingsApi } from '@/services/meetingsService';
import type { MeetingKind } from '@/types';
import { CreateTaskModal } from '@/pages/tasks/components/CreateTaskModal';
import { ScheduleMeetingDialog } from '@/components/meetings/ScheduleMeetingDialog';
import { useBillingUsage } from '@/hooks/queries/useBillingQueries';

type FabState =
  | 'idle'
  | 'menu'
  | 'meeting-submenu'
  | 'recording'
  | 'review'
  | 'saving';

interface RecordingResult {
  blob: Blob;
  durationSeconds: number;
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${m}:${s}`;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Action row component ────────────────────────────────────────────────────

function ActionRow({
  icon: Icon,
  label,
  description,
  onClick,
  highlight,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  description: string;
  onClick: () => void;
  highlight?: boolean;
  delay?: number;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.2,
        delay: delay ?? 0,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all active:scale-[0.98] text-left group ${
        highlight
          ? 'bg-white hover:bg-neutral-100 active:bg-neutral-200'
          : 'hover:bg-white/6 active:bg-white/10'
      }`}
      style={highlight ? {} : {}}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
          highlight ? 'bg-neutral-900' : 'bg-white/10'
        }`}
      >
        <Icon
          className={`w-5 h-5 ${highlight ? 'text-white' : 'text-neutral-300'}`}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`text-[14px] font-semibold leading-tight ${highlight ? 'text-neutral-900' : 'text-white'}`}
        >
          {label}
        </p>
        <p
          className={`text-[11px] mt-0.5 leading-tight ${highlight ? 'text-neutral-500' : 'text-neutral-500'}`}
        >
          {description}
        </p>
      </div>
    </motion.button>
  );
}

// ── Main component ──────────────────────────────────────────────────────────

export function StartMeetingFab() {
  const [state, setState] = useState<FabState>('idle');
  const [recordingType, setRecordingType] = useState<MeetingKind>('RECORDED');
  const [elapsed, setElapsed] = useState(0);
  const [recording, setRecording] = useState<RecordingResult | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showScheduleMeeting, setShowScheduleMeeting] = useState(false);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: billing } = useBillingUsage();

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef<Date | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      mediaRecorderRef.current?.stream?.getTracks().forEach((t) => t.stop());
      wakeLockRef.current?.release().catch(() => {});
    };
  }, []);

  const startRecording = useCallback(async (type: MeetingKind) => {
    setRecordingType(type);
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      toast.error('Microphone access denied');
      setState('idle');
      return;
    }
    setState('recording');
    startedAtRef.current = new Date();
    chunksRef.current = [];
    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : 'audio/webm';
    const recorder = new MediaRecorder(stream, { mimeType });
    mediaRecorderRef.current = recorder;
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      const durationSeconds = Math.round(
        (Date.now() - (startedAtRef.current?.getTime() ?? Date.now())) / 1000
      );
      setRecording({ blob, durationSeconds });
      setState('review');
    };
    recorder.start(500);
    setElapsed(0);

    // Fix: calculate from wall-clock time so the timer never drifts
    // when the tab is throttled in the background
    timerRef.current = setInterval(() => {
      const started = startedAtRef.current?.getTime() ?? Date.now();
      setElapsed(Math.floor((Date.now() - started) / 1000));
    }, 1000);

    // Evaluate before TypeScript narrows navigator — avoids 'never' on maxTouchPoints
    const hasWakeLock = 'wakeLock' in navigator;
    const isMobile = navigator.maxTouchPoints > 0;

    // iOS Safari doesn't support Wake Lock — warn user to keep screen on
    if (!hasWakeLock && isMobile) {
      toast.info('Keep your screen on while recording', { duration: 4500 });
    }

    // Request wake lock to keep the screen alive during recording (Chrome/Android)
    if (hasWakeLock) {
      try {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
      } catch {
        /* denied or unsupported — continue anyway */
      }
    }
  }, []);

  useEffect(() => {
    const createAction = searchParams.get('create');
    if (!createAction) return;

    if (createAction === 'voice-note') {
      setSearchParams({}, { replace: true });
      startRecording('VOICE_NOTE');
      return;
    }

    if (createAction === 'meeting-recording') {
      setSearchParams({}, { replace: true });
      startRecording('RECORDED');
      return;
    }
  }, [searchParams, setSearchParams, startRecording]);

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
      recorder.stream.getTracks().forEach((t) => t.stop());
    }
    // Release wake lock when recording stops
    wakeLockRef.current?.release().catch(() => {});
    wakeLockRef.current = null;
  }, []);

  // Detect backgrounding (tab hidden / phone screen off) during recording
  useEffect(() => {
    if (state !== 'recording') return;

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'hidden') {
        // Auto-stop and preserve whatever was captured so far
        stopRecording();
        toast.warning('Recording stopped — app went to background');
      } else if (document.visibilityState === 'visible') {
        // Re-acquire wake lock when user returns to the tab
        if ('wakeLock' in navigator && wakeLockRef.current === null) {
          try {
            wakeLockRef.current = await navigator.wakeLock.request('screen');
          } catch {
            /* ignore */
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [state, stopRecording]);

  const handleDiscard = useCallback(() => {
    setRecording(null);
    setElapsed(0);
    setState('idle');
  }, []);

  const handleSave = useCallback(async () => {
    if (!recording) return;
    setState('saving');
    const now = new Date();
    const startTime = new Date(
      now.getTime() - recording.durationSeconds * 1000
    );
    const endTime = now;
    try {
      const meeting = await meetingsApi.create({
        type: recordingType,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        timezone: 'UTC',
      });
      try {
        await meetingsApi.uploadRecording(
          meeting.id,
          recording.blob,
          recording.durationSeconds
        );
        toast.success('Recording saved — transcription started');
      } catch {
        toast.error('Meeting saved but upload failed. Try uploading manually.');
      }
      setRecording(null);
      setElapsed(0);
      setState('idle');
      navigate(`/meetings/${meeting.id}`);
    } catch {
      toast.error('Failed to save meeting');
      setState('review');
    }
  }, [recording, recordingType, navigate]);

  const dismiss = () => setState('idle');

  const recordingTypeLabel =
    recordingType === 'VOICE_NOTE' ? 'Voice note' : 'Meeting';

  // ── Sheet panel shared wrapper ────────────────────────────────────────────

  const Sheet = ({ children }: { children: React.ReactNode }) => (
    <>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={dismiss}
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      />
      {/* Sheet */}
      <motion.div
        key="sheet"
        initial={{ y: '100%', opacity: 0.6 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 32, stiffness: 380, mass: 0.8 }}
        className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-safe"
      >
        <div
          className="w-full max-w-sm mx-4 mb-6 rounded-[28px] overflow-hidden"
          style={{
            background: 'rgba(18, 18, 20, 0.97)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow:
              '0 -4px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
          }}
        >
          {children}
        </div>
      </motion.div>
    </>
  );

  return (
    <>
      {/* ── Main menu ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {state === 'menu' && (
          <Sheet>
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <p className="text-[11px] font-semibold tracking-[0.14em] text-neutral-500 uppercase">
                Create
              </p>
              <button
                onClick={dismiss}
                className="w-7 h-7 rounded-full bg-white/8 hover:bg-white/12 flex items-center justify-center transition-colors"
              >
                <X className="w-3.5 h-3.5 text-neutral-400" />
              </button>
            </div>

            {/* Actions */}
            <div className="px-2 pb-4 space-y-0.5">
              {/* Voice Note — hero */}
              <ActionRow
                icon={Mic}
                label="Voice Note"
                description="Capture audio instantly, get AI summary"
                onClick={() => {
                  setState('idle');
                  startRecording('VOICE_NOTE');
                }}
                highlight
                delay={0.04}
              />

              <div className="h-px bg-white/5 mx-4 my-1" />

              <ActionRow
                icon={CalendarPlus}
                label="Meeting"
                description="Record or schedule a meeting"
                onClick={() => setState('meeting-submenu')}
                delay={0.08}
              />
              <ActionRow
                icon={CheckSquare}
                label="Task"
                description="Add something to your to-do list"
                onClick={() => {
                  dismiss();
                  setShowTaskModal(true);
                }}
                delay={0.11}
              />
            </div>
          </Sheet>
        )}
      </AnimatePresence>

      {/* ── Meeting submenu ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {state === 'meeting-submenu' && (
          <Sheet>
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <button
                onClick={() => setState('menu')}
                className="flex items-center gap-1.5 text-[12px] font-medium text-neutral-400 hover:text-neutral-200 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Back
              </button>
              <p className="text-[11px] font-semibold tracking-[0.14em] text-neutral-500 uppercase">
                Meeting
              </p>
              <button
                onClick={dismiss}
                className="w-7 h-7 rounded-full bg-white/8 hover:bg-white/12 flex items-center justify-center transition-colors"
              >
                <X className="w-3.5 h-3.5 text-neutral-400" />
              </button>
            </div>

            <div className="px-2 pb-4 space-y-0.5">
              <ActionRow
                icon={Mic}
                label="Start Recording"
                description="Record audio now, transcribe with AI"
                onClick={() => {
                  setState('idle');
                  startRecording('RECORDED');
                }}
                highlight
                delay={0.04}
              />
              <ActionRow
                icon={CalendarPlus}
                label="Schedule"
                description="Plan a meeting for later"
                onClick={() => {
                  setState('idle');
                  setShowScheduleMeeting(true);
                }}
                delay={0.08}
              />
            </div>
          </Sheet>
        )}
      </AnimatePresence>

      {/* ── Live recording indicator ─────────────────────────────────────── */}
      <AnimatePresence>
        {state === 'recording' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-20 sm:bottom-8 left-1/2 -translate-x-1/2 z-40"
          >
            <div className="flex items-center gap-3 h-12 pl-4 pr-2 rounded-full bg-[#1C1C1E] border border-white/5 shadow-xl shadow-black/40">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
              </span>
              <span className="text-xs text-neutral-400">
                {recordingTypeLabel}
              </span>
              <span className="text-sm font-mono text-white tabular-nums min-w-[40px]">
                {formatDuration(elapsed)}
              </span>
              <button
                onClick={stopRecording}
                className="h-8 w-8 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors active:scale-95 ml-1"
              >
                <Square className="w-3.5 h-3.5 text-white fill-white" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Review panel ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {state === 'review' && recording && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-50"
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="fixed bottom-20 sm:bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-[320px] px-4"
            >
              <div className="bg-[#1C1C1E] border border-white/5 rounded-[28px] p-2 shadow-2xl flex flex-col gap-2">
                <div className="px-4 pt-3 pb-2 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#2C2C2E] flex items-center justify-center shrink-0">
                    <Mic className="w-4 h-4 text-neutral-400" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-white">
                      {recordingTypeLabel} recorded
                    </p>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      {formatDuration(recording.durationSeconds)} &middot;{' '}
                      {formatFileSize(recording.blob.size)}
                    </p>
                    {/* Transcription quota indicator */}
                    {billing &&
                      billing.limits.transcriptionMinutes !== -1 &&
                      (() => {
                        const minsLeft = Math.max(
                          0,
                          billing.limits.transcriptionMinutes -
                            billing.usage.transcriptionMinutes
                        );
                        const thisRecordingMins = Math.ceil(
                          recording.durationSeconds / 60
                        );
                        const willExceed = thisRecordingMins > minsLeft;
                        return (
                          <p
                            className={`text-[10px] mt-1 font-medium ${
                              willExceed ? 'text-amber-400' : 'text-neutral-500'
                            }`}
                          >
                            {willExceed
                              ? `⚠ Only ${minsLeft} min left — this recording may hit your limit`
                              : `${minsLeft} transcription min remaining`}
                          </p>
                        );
                      })()}
                  </div>
                </div>
                <div className="h-px bg-white/5 mx-2" />
                <Button
                  onClick={handleSave}
                  className="h-14 w-full bg-white text-black hover:bg-neutral-100 rounded-[20px] text-[15px] font-medium shadow-none active:scale-[0.98] transition-all"
                >
                  <Save className="w-5 h-5 mr-2.5" />
                  Save &amp; process
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleDiscard}
                  className="h-14 w-full bg-[#2C2C2E] text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-[20px] text-[15px] font-medium active:scale-[0.98] transition-all"
                >
                  <Trash2 className="w-5 h-5 mr-2.5" />
                  Discard
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Saving indicator ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {state === 'saving' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-20 sm:bottom-8 left-1/2 -translate-x-1/2 z-40"
          >
            <div className="flex items-center gap-3 h-12 pl-4 pr-5 rounded-full bg-[#1C1C1E] border border-white/5 shadow-xl shadow-black/40">
              <div className="w-4 h-4 border-2 border-neutral-600 border-t-white rounded-full animate-spin" />
              <span className="text-sm text-neutral-300">Uploading…</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main FAB ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {state === 'idle' && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="fixed bottom-20 sm:bottom-8 left-1/2 -translate-x-1/2 z-40"
          >
            <button
              onClick={() => setState('menu')}
              className="flex items-center gap-2 h-11 px-5 rounded-full transition-all active:scale-95 shadow-lg bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-900 border border-transparent dark:border-neutral-200/20"
            >
              <Plus className="w-4 h-4" />
              <span className="text-[13px] font-semibold tracking-wide">
                Create
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Task modal ───────────────────────────────────────────────────── */}
      <CreateTaskModal
        open={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        navigateOnSuccess
      />

      {/* ── Schedule meeting modal ───────────────────────────────────────── */}
      <ScheduleMeetingDialog
        open={showScheduleMeeting}
        onOpenChange={setShowScheduleMeeting}
      />
    </>
  );
}
