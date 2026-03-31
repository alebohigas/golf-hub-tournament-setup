/**
 * API Client
 * Thin wrapper around fetch for consistent error handling
 * Used by all React Query hooks
 */

// ============= Error Types =============

/** Custom error with HTTP status */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public endpoint: string,
    public responseBody?: string,
    public responseData?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ============= Fetch Wrapper =============

/**
 * Typed fetch wrapper with error handling
 * @param url - Full API URL
 * @returns Parsed JSON response
 * @throws ApiError on non-OK responses
 */
export const apiFetch = async <T>(url: string): Promise<T> => {
  /** Request API endpoint using GET */
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  /** Read response text once to support both success and error parsing */
  const text = await response.text();
  const trimmedText = text.trim();
  let parsed: any = null;

  /** Try to parse JSON payload when available */
  if (trimmedText) {
    try {
      parsed = JSON.parse(trimmedText);
    } catch {
      parsed = null;
    }
  }

  if (!response.ok) {
    /** Prefer backend error message when provided */
    const backendMessage =
      parsed?.error ??
      parsed?.message ??
      `API error (${response.status})`;

    throw new ApiError(
      backendMessage,
      response.status,
      url,
      trimmedText,
      parsed
    );
  }

  /** Ensure successful responses are valid JSON */
  if (!trimmedText) {
    throw new ApiError('API returned an empty response body', response.status, url, trimmedText);
  }

  if (parsed === null) {
    console.error('apiFetch: failed to parse JSON response', url, trimmedText);
    throw new ApiError('API returned malformed JSON/HTML response', response.status, url, trimmedText);
  }

  // if we expected an array but got something else, log a warning
  // caller might rely on arrays (e.g. resultados endpoints)
  if (url.includes('resultados') && parsed != null && !Array.isArray(parsed)) {
    console.warn('apiFetch: resultados endpoint returned non-array', url, parsed);
  }

  return parsed as T;
};
