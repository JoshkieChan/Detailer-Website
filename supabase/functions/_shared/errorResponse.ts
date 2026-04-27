// Standardized error response format for Supabase Edge Functions

export interface ApiError {
  error: string;
  code?: string;
  details?: unknown;
}

export interface ApiSuccess<T = unknown> {
  data: T;
  message?: string;
}

export function errorResponse(
  message: string,
  status: number = 500,
  code?: string,
  details?: unknown
): Response {
  const error: ApiError = { error: message };
  if (code) error.code = code;
  if (details) error.details = details;

  return new Response(JSON.stringify(error), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export function successResponse<T>(
  data: T,
  status: number = 200,
  message?: string
): Response {
  const response: ApiSuccess<T> = { data };
  if (message) response.message = message;

  return new Response(JSON.stringify(response), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

// Common error codes
export const ErrorCodes = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  BAD_REQUEST: 'BAD_REQUEST',
} as const;
