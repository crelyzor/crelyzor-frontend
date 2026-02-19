import { useAuthStore } from '@/stores';

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
    useAuthStore.getState().logout();
    throw new ApiError(res.status, res.statusText, null);
  }

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new ApiError(res.status, res.statusText, data);
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
};

export { ApiError };
