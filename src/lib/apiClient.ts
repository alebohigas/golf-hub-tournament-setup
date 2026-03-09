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
    public endpoint: string
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
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new ApiError(
      `API error: ${response.statusText}`,
      response.status,
      url
    );
  }

  // read body as text so we can log malformed output if needed
  const text = await response.text();
  let parsed: any;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    console.error('apiFetch: failed to parse JSON response', url, text);
    throw err;
  }

  // if we expected an array but got something else, log a warning
  // caller might rely on arrays (e.g. resultados endpoints)
  if (url.includes('resultados') && parsed != null && !Array.isArray(parsed)) {
    console.warn('apiFetch: resultados endpoint returned non-array', url, parsed);
  }

  return parsed as T;
};
