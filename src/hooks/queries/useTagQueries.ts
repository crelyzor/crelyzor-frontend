import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/queryKeys';
import { tagsApi } from '@/services/tagsService';

export function useUserTags() {
  return useQuery({
    queryKey: queryKeys.tags.userTags(),
    queryFn: () => tagsApi.getTags(),
  });
}

export function useMeetingTags(meetingId: string) {
  return useQuery({
    queryKey: queryKeys.tags.byMeeting(meetingId),
    queryFn: () => tagsApi.getMeetingTags(meetingId),
    enabled: !!meetingId,
  });
}

export function useCreateTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; color?: string }) =>
      tagsApi.createTag(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.tags.userTags() });
    },
    onError: (err: Error) => {
      const msg = err.message?.includes('409')
        ? 'A tag with this name already exists'
        : 'Failed to create tag';
      toast.error(msg);
    },
  });
}

export function useUpdateTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      tagId,
      data,
    }: {
      tagId: string;
      data: { name?: string; color?: string };
    }) => tagsApi.updateTag(tagId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.tags.all });
    },
    onError: () => toast.error('Failed to update tag'),
  });
}

export function useDeleteTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tagId: string) => tagsApi.deleteTag(tagId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.tags.all });
    },
    onError: () => toast.error('Failed to delete tag'),
  });
}

export function useAttachTagToMeeting(meetingId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tagId: string) =>
      tagsApi.attachTagToMeeting(meetingId, tagId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.tags.byMeeting(meetingId) });
    },
    onError: () => toast.error('Failed to add tag'),
  });
}

export function useDetachTagFromMeeting(meetingId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tagId: string) =>
      tagsApi.detachTagFromMeeting(meetingId, tagId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.tags.byMeeting(meetingId) });
    },
    onError: () => toast.error('Failed to remove tag'),
  });
}

export function useAttachTagToCard(cardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tagId: string) => tagsApi.attachTagToCard(cardId, tagId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.tags.byCard(cardId) });
    },
    onError: () => toast.error('Failed to add tag'),
  });
}

export function useDetachTagFromCard(cardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tagId: string) => tagsApi.detachTagFromCard(cardId, tagId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.tags.byCard(cardId) });
    },
    onError: () => toast.error('Failed to remove tag'),
  });
}

export function useCardTags(cardId: string) {
  return useQuery({
    queryKey: queryKeys.tags.byCard(cardId),
    queryFn: () => tagsApi.getCardTags(cardId),
    enabled: !!cardId,
  });
}
