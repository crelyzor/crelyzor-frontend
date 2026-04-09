import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { attachmentsApi } from '@/services/attachmentsService';
import { queryKeys } from '@/lib/queryKeys';
import { ApiError } from '@/lib/apiClient';

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    const payload = error.data as
      | { message?: string; details?: { fieldErrors?: Record<string, string[]> } }
      | null;
    if (payload?.message) return payload.message;
    const fieldErrors = payload?.details?.fieldErrors;
    if (fieldErrors) {
      const firstField = Object.keys(fieldErrors)[0];
      const firstIssue = firstField ? fieldErrors[firstField]?.[0] : undefined;
      if (firstIssue) return `${firstField}: ${firstIssue}`;
    }
  }
  return fallback;
}

export function useMeetingAttachments(meetingId: string) {
  return useQuery({
    queryKey: queryKeys.attachments.byMeeting(meetingId),
    queryFn: () => attachmentsApi.getAttachments(meetingId),
    enabled: !!meetingId,
    staleTime: 60_000,
  });
}

export function useAddLink(meetingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { url: string; name?: string }) =>
      attachmentsApi.addLink(meetingId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.attachments.byMeeting(meetingId),
      });
      toast.success('Link added');
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Failed to add link'));
    },
  });
}

export function useUploadAttachment(meetingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, name }: { file: File; name?: string }) =>
      attachmentsApi.uploadFile(meetingId, file, name),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.attachments.byMeeting(meetingId),
      });
      toast.success('File uploaded');
    },
    onError: () => {
      toast.error('Failed to upload file');
    },
  });
}

export function useDeleteAttachment(meetingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (attachmentId: string) =>
      attachmentsApi.deleteAttachment(meetingId, attachmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.attachments.byMeeting(meetingId),
      });
      toast.success('Attachment removed');
    },
    onError: () => {
      toast.error('Failed to remove attachment');
    },
  });
}
