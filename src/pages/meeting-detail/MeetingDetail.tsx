import { useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PageMotion } from '@/components/PageMotion';
import { Button } from '@/components/ui/button';
import { queryKeys } from '@/lib/queryKeys';
import { meetingsApi } from '@/services/meetingsService';
import { PageLoader } from '@/components/PageLoader';
import { VoiceNoteDetail } from './VoiceNoteDetail';
import { RecordedDetail } from './RecordedDetail';
import { ScheduledDetail } from './ScheduledDetail';

export default function MeetingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const completedAtRef = useRef<number | null>(null);

  // Poll while transcription is in-flight, then for 30s after COMPLETED (AI title update)
  const {
    data: rawMeeting,
    isLoading,
    isError,
  } = useQuery({
    queryKey: queryKeys.meetings.detail(id ?? ''),
    queryFn: () => meetingsApi.getById(id ?? ''),
    enabled: !!id,
    refetchInterval: (query) => {
      const status = query.state.data?.transcriptionStatus;
      if (status === 'UPLOADED' || status === 'PROCESSING') {
        completedAtRef.current = null;
        return 3000;
      }
      if (status === 'COMPLETED') {
        if (!completedAtRef.current) completedAtRef.current = Date.now();
        if (Date.now() - completedAtRef.current < 30_000) return 4000;
      }
      return false;
    },
  });

  if (isLoading) return <PageLoader />;

  if (isError) {
    return (
      <PageMotion>
        <div className="max-w-3xl mx-auto py-20 text-center">
          <h2 className="text-lg font-semibold text-neutral-950 dark:text-neutral-50 mb-2">
            Failed to load meeting
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
            Something went wrong. Please try again.
          </p>
          <Button variant="outline" onClick={() => navigate('/meetings')}>
            Back to Meetings
          </Button>
        </div>
      </PageMotion>
    );
  }

  if (!rawMeeting) {
    return (
      <PageMotion>
        <div className="max-w-3xl mx-auto py-20 text-center">
          <h2 className="text-lg font-semibold text-neutral-950 dark:text-neutral-50 mb-2">
            Meeting not found
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
            This meeting may have been deleted or doesn't exist.
          </p>
          <Button variant="outline" onClick={() => navigate('/meetings')}>
            Back to Meetings
          </Button>
        </div>
      </PageMotion>
    );
  }

  const transcriptionStatus = rawMeeting.transcriptionStatus;

  return (
    <PageMotion>
      {rawMeeting.type === 'VOICE_NOTE' ? (
        <VoiceNoteDetail
          meeting={rawMeeting}
          transcriptionStatus={transcriptionStatus}
        />
      ) : rawMeeting.type === 'RECORDED' ? (
        <RecordedDetail
          meeting={rawMeeting}
          transcriptionStatus={transcriptionStatus}
        />
      ) : (
        <ScheduledDetail
          meeting={rawMeeting}
          transcriptionStatus={transcriptionStatus}
        />
      )}
    </PageMotion>
  );
}
