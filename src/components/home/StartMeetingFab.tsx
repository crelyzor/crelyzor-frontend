import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Mic, Square, Trash2, Save, CalendarPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { meetingsApi } from '@/services/meetingsService';
import type { MeetingKind } from '@/types';

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

export function StartMeetingFab() {
  const [state, setState] = useState<FabState>('idle');
  const [recordingType, setRecordingType] = useState<MeetingKind>('RECORDED');
  const [elapsed, setElapsed] = useState(0);
  const [recording, setRecording] = useState<RecordingResult | null>(null);
  const navigate = useNavigate();

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef<Date | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      mediaRecorderRef.current?.stream?.getTracks().forEach((t) => t.stop());
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
    timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
  }, []);

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
  }, []);

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
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
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

  return (
    <>
      {/* ── Top-level menu: Voice Note / Meeting ── */}
      <AnimatePresence>
        {state === 'menu' && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={dismiss}
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
                {/* Voice Note */}
                <Button
                  variant="default"
                  onClick={() => {
                    setState('idle');
                    startRecording('VOICE_NOTE');
                  }}
                  className="h-14 w-full bg-white text-black hover:bg-neutral-100 rounded-[20px] text-[15px] font-medium shadow-none active:scale-[0.98] transition-all justify-start px-5"
                >
                  <Mic className="w-5 h-5 mr-3 shrink-0" />
                  <div className="flex flex-col items-start leading-tight">
                    <span>Voice Note</span>
                    <span className="text-[11px] font-normal text-neutral-500">
                      Quick audio capture + AI summary
                    </span>
                  </div>
                </Button>

                {/* Meeting */}
                <Button
                  variant="ghost"
                  onClick={() => setState('meeting-submenu')}
                  className="h-14 w-full bg-[#2C2C2E] text-neutral-200 hover:bg-[#3A3A3C] rounded-[20px] text-[15px] font-medium active:scale-[0.98] transition-all justify-start px-5"
                >
                  <CalendarPlus className="w-5 h-5 mr-3 shrink-0" />
                  <div className="flex flex-col items-start leading-tight">
                    <span>Meeting</span>
                    <span className="text-[11px] font-normal text-neutral-500">
                      Record or schedule a meeting
                    </span>
                  </div>
                </Button>

                {/* Cancel */}
                <Button
                  variant="ghost"
                  onClick={dismiss}
                  className="h-11 w-full bg-transparent text-neutral-500 hover:text-neutral-300 rounded-[20px] text-[14px] font-medium active:scale-[0.98] transition-all"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Meeting sub-menu: Start Recording / Schedule ── */}
      <AnimatePresence>
        {state === 'meeting-submenu' && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={dismiss}
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
                {/* Back label */}
                <div className="px-4 pt-2 pb-1">
                  <p className="text-[11px] text-neutral-500 uppercase tracking-wider font-medium">
                    Meeting
                  </p>
                </div>

                {/* Start Recording */}
                <Button
                  variant="default"
                  onClick={() => {
                    setState('idle');
                    startRecording('RECORDED');
                  }}
                  className="h-14 w-full bg-white text-black hover:bg-neutral-100 rounded-[20px] text-[15px] font-medium shadow-none active:scale-[0.98] transition-all justify-start px-5"
                >
                  <Mic className="w-5 h-5 mr-3 shrink-0" />
                  Start Recording
                </Button>

                {/* Schedule — coming soon */}
                <Button
                  variant="ghost"
                  disabled
                  className="h-14 w-full bg-[#2C2C2E] text-neutral-600 rounded-[20px] text-[15px] font-medium justify-between px-5 cursor-not-allowed opacity-40"
                >
                  <div className="flex items-center gap-3">
                    <CalendarPlus className="w-5 h-5" />
                    Schedule
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-neutral-600">
                    Soon
                  </span>
                </Button>

                {/* Back */}
                <Button
                  variant="ghost"
                  onClick={() => setState('menu')}
                  className="h-11 w-full bg-transparent text-neutral-500 hover:text-neutral-300 rounded-[20px] text-[14px] font-medium active:scale-[0.98] transition-all"
                >
                  ← Back
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Live recording indicator ── */}
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

      {/* ── Review panel ── */}
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

      {/* ── Saving indicator ── */}
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

      {/* ── Main FAB — only when idle ── */}
      <AnimatePresence>
        {state === 'idle' && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="fixed bottom-20 sm:bottom-8 left-1/2 -translate-x-1/2 z-40"
          >
            <Button
              onClick={() => setState('menu')}
              size="lg"
              className="h-12 px-6 rounded-full bg-neutral-900 text-white shadow-xl shadow-neutral-900/20 dark:shadow-black/40 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
