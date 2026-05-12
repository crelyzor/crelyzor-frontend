import { apiClient } from '@/lib/apiClient';
import type { Plan } from '@/types/organization';

export type { Plan };

export interface BillingUsage {
  transcriptionMinutes: number;
  recallHours: number;
  aiCredits: number;
  storageGb: number;
}

export interface BillingLimits {
  transcriptionMinutes: number; // -1 = unlimited
  recallHours: number;
  aiCredits: number;
  storageGb: number;
}

export interface BillingData {
  plan: Plan;
  usage: BillingUsage;
  limits: BillingLimits;
  periodStart: string;
  resetAt: string;
}

export const billingApi = {
  /** GET /billing/usage — current plan, counters, limits, reset date */
  getUsage: () => apiClient.get<BillingData>('/billing/usage'),

  /** POST /billing/checkout — stub until payment gateway is live */
  checkout: () =>
    apiClient.post<{ status: string; message: string; supportEmail: string }>(
      '/billing/checkout'
    ),
};
