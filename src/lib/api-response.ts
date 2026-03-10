import { NextResponse } from 'next/server';

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export function success<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data } satisfies ApiSuccess<T>, { status });
}

export function paginated<T>(data: T[], meta: { page: number; limit: number; total: number }) {
  return NextResponse.json({
    success: true,
    data,
    meta: {
      ...meta,
      totalPages: Math.ceil(meta.total / meta.limit),
    },
  } satisfies ApiSuccess<T[]>);
}

export function error(code: string, message: string, status = 400, details?: unknown) {
  return NextResponse.json(
    { success: false, error: { code, message, details } } satisfies ApiError,
    { status }
  );
}

export function unauthorized(message = 'Authentication required') {
  return error('UNAUTHORIZED', message, 401);
}

export function forbidden(message = 'Access denied') {
  return error('FORBIDDEN', message, 403);
}

export function notFound(resource = 'Resource') {
  return error('NOT_FOUND', `${resource} not found`, 404);
}

export function conflict(message: string) {
  return error('CONFLICT', message, 409);
}

export function validationError(details: unknown) {
  return error('VALIDATION_ERROR', 'Invalid request data', 400, details);
}

export function serverError(message = 'Internal server error') {
  return error('SERVER_ERROR', message, 500);
}
