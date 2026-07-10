/**
 * Superadmin auth helpers
 * ---------------------------------------------------------------------------
 * The username-less superadmin is intentionally separate from staff users.
 * The entered password is kept in sessionStorage only so legacy PHP endpoints
 * can receive the current password after it is changed from /admin.
 */
import { API_BASE_URL } from '@/config/api';

/** Legacy password used until production config stores a custom hash. */
export const DEFAULT_SUPERADMIN_PASSWORD = 'admin2025';

/** Session-only key for the active superadmin password. */
const SUPERADMIN_PASSWORD_SESSION_KEY = 'speitour_superadmin_password_v1';

/** Fetch patch singleton flag to avoid double-wrapping fetch in dev/HMR. */
let fetchPatchInstalled = false;

/** Read the active superadmin password for admin API payloads. */
export const getSuperAdminPassword = (): string => {
  if (typeof window === 'undefined') return DEFAULT_SUPERADMIN_PASSWORD;
  return sessionStorage.getItem(SUPERADMIN_PASSWORD_SESSION_KEY) || DEFAULT_SUPERADMIN_PASSWORD;
};

/** True only when the current tab really has the superadmin password captured. */
export const hasRememberedSuperAdminPassword = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!sessionStorage.getItem(SUPERADMIN_PASSWORD_SESSION_KEY);
};

/** Remember the password only for the current browser session. */
export const rememberSuperAdminPassword = (password: string): void => {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(SUPERADMIN_PASSWORD_SESSION_KEY, password);
};

/** Clear the session-scoped superadmin password. */
export const clearSuperAdminPassword = (): void => {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(SUPERADMIN_PASSWORD_SESSION_KEY);
};

/** Ask the production API whether the password is valid. */
export const validateSuperAdminPassword = async (password: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin_auth.php?action=login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (response.ok) {
      rememberSuperAdminPassword(password);
      return true;
    }
    if (response.status === 401) return false;
  } catch {
    // If production API is unavailable, keep the historical local fallback.
  }

  const matchesLegacyFallback = password === DEFAULT_SUPERADMIN_PASSWORD;
  if (matchesLegacyFallback) rememberSuperAdminPassword(password);
  return matchesLegacyFallback;
};

/** Persist a new superadmin password hash on the production API. */
export const changeSuperAdminPassword = async (
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/admin_auth.php?action=change_password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'No se pudo cambiar la contraseña');
  rememberSuperAdminPassword(newPassword);
};

/** Check whether a URL is a same-origin PHP API request. */
const isSameOriginApiRequest = (url: URL): boolean =>
  typeof window !== 'undefined' && url.origin === window.location.origin && url.pathname.startsWith('/api/');

/** Resolve fetch input into a URL without reading or cloning request bodies. */
const getFetchUrl = (input: RequestInfo | URL): URL | null => {
  if (typeof window === 'undefined') return null;
  try {
    const href = input instanceof Request ? input.url : input.toString();
    return new URL(href, window.location.origin);
  } catch {
    return null;
  }
};

/** Replace legacy password values inside JSON, FormData, URLSearchParams, or query strings. */
const replaceLegacyPassword = (input: RequestInfo | URL, init?: RequestInit): [RequestInfo | URL, RequestInit | undefined] => {
  if (typeof window === 'undefined') return [input, init];
  const activePassword = getSuperAdminPassword();
  if (activePassword === DEFAULT_SUPERADMIN_PASSWORD) return [input, init];

  const requestUrl = getFetchUrl(input);
  if (!requestUrl || !isSameOriginApiRequest(requestUrl)) return [input, init];

  const nextInit: RequestInit = init ? { ...init } : {};

  // Send the current password as a rescue channel for legacy admin calls whose
  // body/query still contains admin2025. Backend endpoints validate this header
  // only on same-origin /api requests, never on public frontend routes.
  const headers = new Headers(nextInit.headers ?? (input instanceof Request ? input.headers : undefined));
  headers.set('X-Superadmin-Password', activePassword);
  nextInit.headers = headers;

  // Patch querystring password=admin2025 for admin GET endpoints.
  if (typeof input === 'string' || input instanceof URL) {
    const original = input.toString();
    const url = new URL(original, window.location.origin);
    if (url.searchParams.get('password') === DEFAULT_SUPERADMIN_PASSWORD) {
      url.searchParams.set('password', activePassword);
      input = original.startsWith('http') ? url.toString() : `${url.pathname}${url.search}`;
    }
  }

  if (!nextInit?.body) return [input, nextInit];

  // Patch JSON bodies: { password: 'admin2025', ... }.
  if (typeof nextInit.body === 'string') {
    try {
      const parsed = JSON.parse(nextInit.body);
      if (parsed?.password === DEFAULT_SUPERADMIN_PASSWORD) {
        nextInit.body = JSON.stringify({ ...parsed, password: activePassword });
      }
    } catch {
      // Non-JSON string bodies are left untouched.
    }
  }

  // Patch multipart uploads: FormData password field.
  if (nextInit.body instanceof FormData && nextInit.body.get('password') === DEFAULT_SUPERADMIN_PASSWORD) {
    nextInit.body.set('password', activePassword);
  }

  // Patch URLSearchParams bodies if ever used by an admin endpoint.
  if (nextInit.body instanceof URLSearchParams && nextInit.body.get('password') === DEFAULT_SUPERADMIN_PASSWORD) {
    nextInit.body.set('password', activePassword);
  }

  return [input, nextInit];
};

/**
 * Install a small compatibility layer so existing admin components that still
 * send admin2025 automatically send the current changed superadmin password.
 */
export const installSuperAdminPasswordFetchPatch = (): void => {
  if (typeof window === 'undefined' || fetchPatchInstalled) return;
  fetchPatchInstalled = true;
  const originalFetch = window.fetch.bind(window);
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const [patchedInput, patchedInit] = replaceLegacyPassword(input, init);
    return originalFetch(patchedInput, patchedInit);
  };
};