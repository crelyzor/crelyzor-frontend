import { useAuthStore, useUIStore } from '@/stores';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
};

class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data: unknown
  ) {
    super(`API Error: ${status} ${statusText}`);
    this.name = 'ApiError';
  }
}

function buildUrl(
  path: string,
  params?: Record<string, string | number | boolean | undefined>
): string {
  const base = API_BASE_URL.startsWith('http')
    ? API_BASE_URL
    : `${window.location.origin}${API_BASE_URL}`;
  const url = new URL(`${base}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
  }
  return url.toString();
}

// ── Refresh token coordination ──────────────────────────────────────────────
// Ensures only one refresh request is in-flight at a time.
// Any other 401s that arrive while a refresh is in progress are queued and
// retried once the refresh resolves.

let isRefreshing = false;
let pendingCallbacks: Array<{
  resolve: () => void;
  reject: (err: unknown) => void;
}> = [];

async function attemptTokenRefresh(): Promise<boolean> {
  const storedRefreshToken = localStorage.getItem('calendar-refresh-token');
  if (!storedRefreshToken) return false;

  try {
    const res = await fetch(buildUrl('/auth/refresh-token'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: storedRefreshToken }),
    });

    if (!res.ok) return false;

    const json = await res.json();
    // Response shape: { status, statusCode, message, data: { accessToken, refreshToken, expiresIn } }
    const data = json.data ?? json;
    if (!data?.accessToken || !data?.refreshToken) return false;

    useAuthStore.getState().setAccessToken(data.accessToken);
    localStorage.setItem('calendar-refresh-token', data.refreshToken);
    return true;
  } catch (err) {
    const isNetworkError =
      err instanceof TypeError && err.message.toLowerCase().includes('fetch');
    if (!isNetworkError && import.meta.env.DEV) {
      // In development only — token refresh failed unexpectedly
      console.warn('[apiClient] Token refresh failed unexpectedly', err);
    }
    return false;
  }
}

function clearAuthAndRedirect() {
  useAuthStore.getState().logout();
  localStorage.removeItem('calendar-refresh-token');
  window.location.replace('/signin');
}

// ─────────────────────────────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, headers = {}, params, signal } = options;

  const token = useAuthStore.getState().accessToken;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  const res = await fetch(buildUrl(path, params), {
    method,
    signal,
    headers: requestHeaders,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (res.status === 401) {
    // Never try to refresh the refresh-token endpoint itself (avoid infinite loop)
    if (path === '/auth/refresh-token') {
      clearAuthAndRedirect();
      throw new ApiError(res.status, res.statusText, null);
    }

    if (!isRefreshing) {
      isRefreshing = true;
      const refreshed = await attemptTokenRefresh();
      isRefreshing = false;

      if (refreshed) {
        // Unblock any queued requests so they can retry
        pendingCallbacks.forEach(({ resolve }) => resolve());
        pendingCallbacks = [];
        // Retry the original request — request() will pick up the new token from the store
        return request<T>(path, options);
      } else {
        const err = new ApiError(res.status, res.statusText, null);
        pendingCallbacks.forEach(({ reject }) => reject(err));
        pendingCallbacks = [];
        clearAuthAndRedirect();
        throw err;
      }
    }

    // A refresh is already in flight — queue this request and wait
    await new Promise<void>((resolve, reject) => {
      pendingCallbacks.push({ resolve, reject });
    });
    // Refresh succeeded (if it had failed, the promise would have been rejected above)
    return request<T>(path, options);
  }

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    const err = new ApiError(res.status, res.statusText, data);

    // 402 billing limit — trigger the upgrade modal instead of letting the
    // error propagate to the component. The component's catch handler will
    // still receive the ApiError, but the modal will have already opened.
    if (res.status === 402) {
      const code = (data as Record<string, unknown>)?.code;
      const BILLING_CODES = new Set([
        'TRANSCRIPTION_LIMIT_REACHED',
        'RECALL_LIMIT_REACHED',
        'AI_CREDITS_EXHAUSTED',
        'STORAGE_LIMIT_REACHED',
      ]);
      if (typeof code === 'string' && BILLING_CODES.has(code)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        useUIStore.getState().openUpgradeModal(code as any);
      } else {
        useUIStore.getState().openUpgradeModal();
      }
    }

    throw err;
  }

  // Handle 204 No Content
  if (res.status === 204) return undefined as T;

  const json = await res.json();

  // Backend wraps responses in { status, statusCode, message, data }
  // Unwrap if the response has that shape
  if (
    json &&
    typeof json === 'object' &&
    'data' in json &&
    'statusCode' in json
  ) {
    return json.data as T;
  }

  return json as T;
}

// ── FormData upload (bypasses JSON serialization, no Content-Type override) ──
async function requestForm<T>(path: string, formData: FormData): Promise<T> {
  const token = useAuthStore.getState().accessToken;

  const res = await fetch(buildUrl(path), {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // Do NOT set Content-Type — browser sets it with multipart boundary
    },
    body: formData,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new ApiError(res.status, res.statusText, data);
  }

  const json = await res.json();
  if (
    json &&
    typeof json === 'object' &&
    'data' in json &&
    'statusCode' in json
  ) {
    return json.data as T;
  }
  return json as T;
}

async function requestText(
  path: string,
  options: Omit<RequestOptions, 'method' | 'body'> = {}
): Promise<string> {
  const { headers = {}, params, signal } = options;
  const token = useAuthStore.getState().accessToken;

  const res = await fetch(buildUrl(path, params), {
    method: 'GET',
    signal,
    headers: {
      Accept: 'text/csv',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (res.status === 401) {
    clearAuthAndRedirect();
    throw new ApiError(res.status, res.statusText, null);
  }

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new ApiError(res.status, res.statusText, data);
  }

  return res.text();
}

export const apiClient = {
  get: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'GET' }),

  post: <T>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, 'method' | 'body'>
  ) => request<T>(path, { ...options, method: 'POST', body }),

  put: <T>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, 'method' | 'body'>
  ) => request<T>(path, { ...options, method: 'PUT', body }),

  patch: <T>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, 'method' | 'body'>
  ) => request<T>(path, { ...options, method: 'PATCH', body }),

  delete: <T>(
    path: string,
    options?: Omit<RequestOptions, 'method' | 'body'>
  ) => request<T>(path, { ...options, method: 'DELETE' }),

  postForm: <T>(path: string, formData: FormData) =>
    requestForm<T>(path, formData),

  getText: (path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    requestText(path, options),
};

export { ApiError };
