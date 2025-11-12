/**
 * @fileoverview Retry Utility
 * Provides retry logic with exponential backoff for transient failures.
 * Used for database connection failures and temporary network issues.
 *
 * @module utils/retry
 */

/**
 * Retry configuration options
 * @typedef {Object} RetryOptions
 * @property {number} [maxRetries=3] - Maximum number of retry attempts
 * @property {number} [initialDelayMs=100] - Initial delay in milliseconds
 * @property {number} [maxDelayMs=10000] - Maximum delay in milliseconds
 * @property {number} [backoffMultiplier=2] - Exponential backoff multiplier
 * @property {Function} [onRetry] - Callback on retry attempt
 */
export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

/**
 * Execute a function with exponential backoff retry logic
 *
 * @param fn - Async function to execute
 * @param options - Retry configuration
 * @returns Result of the function
 *
 * @example
 * const data = await withRetry(
 *   () => supabase.from('sites').select('*'),
 *   { maxRetries: 3, initialDelayMs: 100 }
 * );
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelayMs = 100,
    maxDelayMs = 5000,
    backoffMultiplier = 2,
    onRetry,
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        initialDelayMs * Math.pow(backoffMultiplier, attempt),
        maxDelayMs
      );

      // Call retry callback if provided
      if (onRetry) {
        onRetry(attempt + 1, lastError);
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error("Unknown error during retry");
}

/**
 * Retry a function with jitter to prevent thundering herd
 * Adds random jitter to the delay to spread out retries
 *
 * @param fn - Async function to execute
 * @param options - Retry configuration
 * @returns Result of the function
 */
export async function withRetryAndJitter<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelayMs = 100,
    maxDelayMs = 5000,
    backoffMultiplier = 2,
    onRetry,
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Calculate delay with exponential backoff
      const baseDelay = Math.min(
        initialDelayMs * Math.pow(backoffMultiplier, attempt),
        maxDelayMs
      );

      // Add random jitter (0-100% of base delay)
      const jitter = Math.random() * baseDelay;
      const delay = baseDelay + jitter;

      // Call retry callback if provided
      if (onRetry) {
        onRetry(attempt + 1, lastError);
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error("Unknown error during retry");
}

/**
 * Check if an error is retryable (transient)
 *
 * @param error - Error to check
 * @returns true if error is likely transient and should be retried
 */
export function isRetryableError(error: any): boolean {
  // Network errors
  if (error.code === "ECONNREFUSED" || error.code === "ECONNRESET") {
    return true;
  }

  // Timeout errors
  if (error.code === "ETIMEDOUT" || error.code === "EHOSTUNREACH") {
    return true;
  }

  // HTTP 5xx errors (server errors)
  if (error.status >= 500 && error.status < 600) {
    return true;
  }

  // HTTP 429 (Too Many Requests)
  if (error.status === 429) {
    return true;
  }

  // Supabase specific errors
  if (
    error.message?.includes("connection") ||
    error.message?.includes("timeout")
  ) {
    return true;
  }

  return false;
}

/**
 * Retry only on retryable errors
 *
 * @param fn - Async function to execute
 * @param options - Retry configuration
 * @returns Result of the function
 */
export async function withSmartRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelayMs = 100,
    maxDelayMs = 5000,
    backoffMultiplier = 2,
    onRetry,
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Only retry if error is retryable
      if (!isRetryableError(error)) {
        throw lastError;
      }

      // Don't retry on last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        initialDelayMs * Math.pow(backoffMultiplier, attempt),
        maxDelayMs
      );

      // Call retry callback if provided
      if (onRetry) {
        onRetry(attempt + 1, lastError);
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error("Unknown error during retry");
}
