import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/queryKeys';
import { cardsApi } from '@/services/cardsService';
import type {
  CreateCardPayload,
  UpdateCardPayload,
  PreviewCardPayload,
} from '@/types';

export function useTemplates() {
  return useQuery({
    queryKey: queryKeys.cards.templates(),
    queryFn: () => cardsApi.getTemplates(),
    staleTime: Infinity, // templates are static per deploy
  });
}

export function usePreviewCard() {
  return useMutation({
    mutationFn: (data: PreviewCardPayload) => cardsApi.preview(data),
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to preview card');
    },
  });
}

export function useCards() {
  return useQuery({
    queryKey: queryKeys.cards.list(),
    queryFn: () => cardsApi.list(),
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useCard(id: string) {
  return useQuery({
    queryKey: queryKeys.cards.detail(id),
    queryFn: () => cardsApi.getById(id),
    enabled: !!id,
    staleTime: 60 * 1000,
  });
}

export function useCardAnalytics(id: string, days?: number) {
  return useQuery({
    queryKey: queryKeys.cards.analytics(id, days),
    queryFn: () => cardsApi.analytics(id, days),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCardContacts(params?: {
  cardId?: string;
  search?: string;
  tags?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: queryKeys.cards.contacts(params),
    queryFn: () => cardsApi.contacts(params),
    staleTime: 30 * 1000,
  });
}

export function useCreateCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCardPayload) => cardsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.cards.all });
      toast.success('Card created');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create card');
    },
  });
}

export function useUpdateCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCardPayload }) =>
      cardsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.cards.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update card');
    },
  });
}

export function useDeleteCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cardsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.cards.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete card');
    },
  });
}

export function useDuplicateCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, slug }: { id: string; slug: string }) =>
      cardsApi.duplicate(id, slug),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.cards.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to duplicate card');
    },
  });
}

export function useUpdateContactTags() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, tags }: { id: string; tags: string[] }) =>
      cardsApi.updateContactTags(id, tags),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.cards.contacts() });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update contact tags');
    },
  });
}

export function useDeleteContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cardsApi.deleteContact(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.cards.contacts() });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete contact');
    },
  });
}

export function useCardMeetings(cardId: string) {
  return useQuery({
    queryKey: queryKeys.cards.meetings(cardId),
    queryFn: () => cardsApi.getCardMeetings(cardId),
    enabled: !!cardId,
    staleTime: 5 * 60 * 1000, // 5 min — card-meeting links change infrequently
  });
}
