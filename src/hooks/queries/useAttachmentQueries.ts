import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { attachmentsApi } from '@/services/attachmentsService';
import { queryKeys } from '@/lib/queryKeys';

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
    onError: () => {
      toast.error('Failed to add link');
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
