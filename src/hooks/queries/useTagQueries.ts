import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/queryKeys';
import { tagsApi } from '@/services/tagsService';

export function useUserTags() {
  return useQuery({
    queryKey: queryKeys.tags.userTags(),
    queryFn: () => tagsApi.getTags(),
    staleTime: 5 * 60 * 1000, // 5 minutes — tags change infrequently
  });
}

export function useMeetingTags(meetingId: string) {
  return useQuery({
    queryKey: queryKeys.tags.byMeeting(meetingId),
    queryFn: () => tagsApi.getMeetingTags(meetingId),
    enabled: !!meetingId,
    staleTime: 5 * 60 * 1000, // 5 minutes — tags change infrequently
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
      // Invalidate user tag list and all per-meeting/per-card caches since
      // tag name/color may be rendered in those views. Use partial prefix keys
      // so every ['tags', 'meeting', *] and ['tags', 'card', *] query is
      // invalidated without blowing up unrelated caches.
      qc.invalidateQueries({ queryKey: queryKeys.tags.userTags() });
      qc.invalidateQueries({ queryKey: ['tags', 'meeting'] });
      qc.invalidateQueries({ queryKey: ['tags', 'card'] });
    },
    onError: () => toast.error('Failed to update tag'),
  });
}

export function useDeleteTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tagId: string) => tagsApi.deleteTag(tagId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.tags.userTags() });
      qc.invalidateQueries({ queryKey: ['tags', 'meeting'] });
      qc.invalidateQueries({ queryKey: ['tags', 'card'] });
    },
    onError: () => toast.error('Failed to delete tag'),
  });
}

export function useAttachTagToMeeting(meetingId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tagId: string) => tagsApi.attachTagToMeeting(meetingId, tagId),
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
    staleTime: 5 * 60 * 1000, // 5 minutes — tags change infrequently
  });
}
