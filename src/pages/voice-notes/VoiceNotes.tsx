import { useState, useRef } from 'react';
import {
  Mic,
  Upload,
  Play,
  Pause,
  Search,
  FileText,

  Clock,
  Calendar,
  MoreHorizontal,
  ArrowUpRight,
  Building2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useOrganizationStore } from '@/stores/organizationStore';

// ── Filter tabs ──
const FILTER_TABS = [
  { id: 'all', label: 'All' },
  { id: 'with-transcript', label: 'Transcribed' },
  { id: 'with-summary', label: 'Summarized' },
  { id: 'standalone', label: 'Standalone' },
] as const;

type FilterTab = (typeof FILTER_TABS)[number]['id'];

// ── Mock voice notes ──
type VoiceNote = {
  id: string;
  title: string;
  fileName: string;
  duration: string;
  fileSize: string;
  uploadedAt: string;
  meetingId?: number;
  meetingTitle?: string;
  hasTranscript: boolean;
  hasSummary: boolean;
  orgSource?: { orgId: string; orgName: string; isPersonal: boolean };
};

const mockVoiceNotes: VoiceNote[] = [
  {
    id: 'vn-1',
    title: 'Product Strategy Review',
    fileName: 'product-strategy-review.webm',
    duration: '45:12',
    fileSize: '18.2 MB',
    uploadedAt: '2026-02-10',
    meetingId: 101,
    meetingTitle: 'Product Strategy Review',
    hasTranscript: true,
    hasSummary: true,
    orgSource: { orgId: '2', orgName: 'Acme Inc', isPersonal: false },
  },
  {
    id: 'vn-2',
    title: 'Design Sync Recording',
    fileName: 'design-sync.webm',
    duration: '28:45',
    fileSize: '11.6 MB',
    uploadedAt: '2026-02-10',
    meetingId: 102,
    meetingTitle: 'Design Sync',
    hasTranscript: true,
    hasSummary: false,
    orgSource: { orgId: '3', orgName: 'Design Studio', isPersonal: false },
  },
  {
    id: 'vn-3',
    title: 'Quick brainstorm notes',
    fileName: 'brainstorm-2026-02-09.webm',
    duration: '12:30',
    fileSize: '5.1 MB',
    uploadedAt: '2026-02-09',
    hasTranscript: false,
    hasSummary: false,
    orgSource: { orgId: '1', orgName: 'Harsh Keshari', isPersonal: true },
  },
  {
    id: 'vn-4',
    title: 'Client Feedback Call',
    fileName: 'client-feedback.webm',
    duration: '1:02:18',
    fileSize: '24.8 MB',
    uploadedAt: '2026-02-08',
    meetingId: 106,
    meetingTitle: 'Client Feedback Session',
    hasTranscript: true,
    hasSummary: true,
    orgSource: { orgId: '2', orgName: 'Acme Inc', isPersonal: false },
  },
  {
    id: 'vn-5',
    title: 'Sprint Planning Notes',
    fileName: 'sprint-planning.webm',
    duration: '35:40',
    fileSize: '14.3 MB',
    uploadedAt: '2026-02-07',
    meetingId: 109,
    meetingTitle: 'Sprint Planning',
    hasTranscript: true,
    hasSummary: true,
    orgSource: { orgId: '2', orgName: 'Acme Inc', isPersonal: false },
  },
];

export default function VoiceNotes() {
  const navigate = useNavigate();
  const { currentOrg } = useOrganizationStore();
  const isPersonalView = currentOrg?.isPersonal ?? true;

  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter by org
  let filtered = isPersonalView
    ? mockVoiceNotes
    : mockVoiceNotes.filter((vn) => vn.orgSource?.orgId === currentOrg?.id);

  // Filter by search
  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (vn) =>
        vn.title.toLowerCase().includes(q) ||
        vn.fileName.toLowerCase().includes(q) ||
        vn.meetingTitle?.toLowerCase().includes(q)
    );
  }

  // Filter by tab
  if (activeFilter === 'with-transcript')
    filtered = filtered.filter((vn) => vn.hasTranscript);
  if (activeFilter === 'with-summary')
    filtered = filtered.filter((vn) => vn.hasSummary);
  if (activeFilter === 'standalone')
    filtered = filtered.filter((vn) => !vn.meetingId);

  // Group by date
  const grouped = filtered.reduce<Record<string, VoiceNote[]>>((acc, vn) => {
    const key = vn.uploadedAt;
    if (!acc[key]) acc[key] = [];
    acc[key].push(vn);
    return acc;
  }, {});

  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    const today = new Date('2026-02-10T00:00:00');
    const yesterday = new Date('2026-02-09T00:00:00');
    if (d.getTime() === today.getTime()) return 'Today';
    if (d.getTime() === yesterday.getTime()) return 'Yesterday';
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-neutral-950 dark:text-neutral-50 tracking-tight">
          Voice Notes
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          {isPersonalView
            ? 'All voice notes across your organizations'
            : `Voice notes for ${currentOrg?.name}`}
        </p>
      </div>

      {/* Search + Upload */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <Input
            type="text"
            placeholder="Search voice notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 border-neutral-200 dark:border-neutral-700"
          />
        </div>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="audio/*"
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          className="bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 gap-1.5 text-xs h-9 px-4"
        >
          <Upload className="w-3.5 h-3.5" />
          Upload
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 mb-5">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors
              ${
                activeFilter === tab.id
                  ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                  : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Voice notes list */}
      {Object.keys(grouped).length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <div className="w-14 h-14 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
            <Mic className="w-7 h-7 text-neutral-400" />
          </div>
          <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            No voice notes
          </p>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 max-w-xs">
            Upload a recording to get started. Voice notes will be transcribed
            and summarized automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([date, notes]) => (
              <div key={date}>
                <h2 className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-2">
                  {formatDateLabel(date)}
                </h2>
                <div className="space-y-2">
                  {notes.map((vn) => {
                    const isPlaying = playingId === vn.id;
                    return (
                      <Card
                        key={vn.id}
                        className="border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            {/* Play button */}
                            <button
                              onClick={() =>
                                setPlayingId(isPlaying ? null : vn.id)
                              }
                              className="shrink-0 w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 flex items-center justify-center transition-colors"
                            >
                              {isPlaying ? (
                                <Pause className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                              ) : (
                                <Play className="w-4 h-4 text-neutral-700 dark:text-neutral-300 ml-0.5" />
                              )}
                            </button>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-semibold text-neutral-950 dark:text-neutral-50 truncate">
                                  {vn.title}
                                </h3>
                                {/* SMA indicators */}
                                {vn.hasTranscript && (
                                  <div
                                    className="w-5 h-5 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center"
                                    title="Transcribed"
                                  >
                                    <FileText className="w-3 h-3 text-neutral-500 dark:text-neutral-400" />
                                  </div>
                                )}
                                {vn.hasSummary && (
                                  <div
                                    className="w-5 h-5 rounded-full bg-violet-50 dark:bg-violet-950/40 flex items-center justify-center"
                                    title="AI Summary"
                                  >

                                  </div>
                                )}
                              </div>

                              {/* Meta */}
                              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                <span className="flex items-center gap-1 text-[11px] text-neutral-400 dark:text-neutral-500">
                                  <Clock className="w-3 h-3" />
                                  {vn.duration}
                                </span>
                                <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
                                  {vn.fileSize}
                                </span>
                                {vn.meetingTitle && (
                                  <button
                                    onClick={() =>
                                      vn.meetingId &&
                                      navigate(`/meetings/${vn.meetingId}`)
                                    }
                                    className="flex items-center gap-1 text-[11px] text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                  >
                                    <Calendar className="w-3 h-3" />
                                    {vn.meetingTitle}
                                    <ArrowUpRight className="w-2.5 h-2.5" />
                                  </button>
                                )}
                                {isPersonalView &&
                                  vn.orgSource &&
                                  !vn.orgSource.isPersonal && (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400">
                                      <Building2 className="w-2.5 h-2.5" />
                                      {vn.orgSource.orgName}
                                    </span>
                                  )}
                              </div>

                              {/* Waveform placeholder when playing */}
                              {isPlaying && (
                                <div className="mt-3 flex items-center gap-2">
                                  <div className="flex-1 h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                                    <div className="h-full w-2/5 rounded-full bg-neutral-900 dark:bg-neutral-100 animate-pulse" />
                                  </div>
                                  <span className="text-[10px] text-neutral-400 font-mono">
                                    14:32 / {vn.duration}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Actions */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="shrink-0 h-8 w-8"
                            >
                              <MoreHorizontal className="w-4 h-4 text-neutral-400" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
