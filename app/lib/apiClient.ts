import createFetchClient, { Middleware } from 'openapi-fetch';
import createClient from 'openapi-react-query';
import qs from 'qs';
import { getDefaultStore } from 'jotai';
import { authAtom, setAuthAtom, clearAuthAtom } from './authAtom';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
if (!apiBaseUrl) {
  throw new Error('NEXT_PUBLIC_API_URL is not configured');
}

const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const store = getDefaultStore();
    const auth = store.get(authAtom);
    if (auth?.token) {
      return auth.token;
    }

    const stored = window.localStorage.getItem('healthyfy_admin_auth');
    if (stored) {
      const parsed = JSON.parse(stored) as { token?: string | null };
      return parsed.token || null;
    }
  } catch (error) {
    console.error('Error getting auth token:', error);
  }
  return null;
};

const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const store = getDefaultStore();
    const auth = store.get(authAtom);
    return auth?.refreshToken || null;
  } catch {
    return null;
  }
};

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

const refreshAccessToken = async (): Promise<boolean> => {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return false;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const response = await globalThis.fetch(
        `${apiBaseUrl}/auth/refresh`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        },
      );

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      if (data.token) {
        const store = getDefaultStore();
        store.set(setAuthAtom, {
          token: data.token,
          refreshToken: data.refreshToken || refreshToken,
        });
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

const authMiddleware: Middleware = {
  onRequest: async ({ request }) => {
    const token = getAuthToken();
    if (token) {
      request.headers.set('Authorization', `Bearer ${token}`);
    }
    return request;
  },
  onResponse: async ({ response, request }) => {
    if (response.status === 401) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        // Retry the original request with new token
        const newToken = getAuthToken();
        if (newToken) {
          const newRequest = new Request(request.url, {
            method: request.method,
            headers: new Headers(request.headers),
            body: request.body,
          });
          newRequest.headers.set('Authorization', `Bearer ${newToken}`);
          return globalThis.fetch(newRequest);
        }
      } else {
        // Refresh failed, clear auth and redirect to login
        if (typeof window !== 'undefined') {
          const store = getDefaultStore();
          store.set(clearAuthAtom);
          window.location.href = '/login';
        }
      }
    }
    return response;
  },
};

const multipartMiddleware: Middleware = {
  onRequest: async ({ request }) => {
    const body = request.body;

    if (body instanceof FormData) {
      return request;
    }

    return request;
  },
};

export const fetchClient = createFetchClient({
  baseUrl: apiBaseUrl,
  querySerializer: (params) => {
    return qs.stringify(params);
  },
});

fetchClient.use(authMiddleware);
fetchClient.use(multipartMiddleware);

export const api = createClient(fetchClient);

export const useQuery = api.useQuery;
export const useMutation = api.useMutation;
export const fetch = fetchClient;
