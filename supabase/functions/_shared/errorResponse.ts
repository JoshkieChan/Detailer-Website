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
      'Access-Control-Allow-Origin': 'https://signaldatasource.com',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-owner-passcode',
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
  SLOT_UNAVAILABLE: 'SLOT_UNAVAILABLE',
  PRICING_MISMATCH: 'PRICING_MISMATCH',
} as const;

export class BookingError extends Error {
  constructor(message: string, public code: string = ErrorCodes.VALIDATION_ERROR, public status = 400) {
    super(message);
  }
}

export function bookingErrorResponse(error: unknown): Response {
  if (error instanceof BookingError) return errorResponse(error.message, error.status, error.code);
  const code = typeof error === 'object' && error !== null && 'code' in error ? error.code : '';
  if (code === '23P01' || code === '40001' || code === '40P01') {
    return errorResponse('Selected booking time is no longer available. Please choose another time.', 409, ErrorCodes.SLOT_UNAVAILABLE);
  }
  if (code === '23514' || code === '22007' || code === '22008') {
    return errorResponse('Invalid booking selection or schedule.', 400, ErrorCodes.VALIDATION_ERROR);
  }
  return errorResponse('We could not complete this request. Please try again later.', 500, ErrorCodes.INTERNAL_ERROR);
}
