import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { cardsApi } from '@/services/cardsService';
import type { CreateCardPayload, UpdateCardPayload } from '@/types';

export function useCards() {
  return useQuery({
    queryKey: queryKeys.cards.list(),
    queryFn: () => cardsApi.list(),
  });
}

export function useCard(id: string) {
  return useQuery({
    queryKey: queryKeys.cards.detail(id),
    queryFn: () => cardsApi.getById(id),
    enabled: !!id,
  });
}

export function useCardAnalytics(id: string, days?: number) {
  return useQuery({
    queryKey: queryKeys.cards.analytics(id, days),
    queryFn: () => cardsApi.analytics(id, days),
    enabled: !!id,
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
  });
}

export function useCreateCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCardPayload) => cardsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.cards.all });
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
  });
}

export function useDeleteCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cardsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.cards.all });
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
  });
}

export function useDeleteContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cardsApi.deleteContact(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.cards.contacts() });
    },
  });
}
