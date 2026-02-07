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

  return response.json();
};
