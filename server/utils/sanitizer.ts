/**
 * @fileoverview Sanitizer Utility
 * Removes sensitive data from logs and error messages.
 * Prevents accidental exposure of API keys, passwords, and other secrets.
 *
 * @module utils/sanitizer
 */

/**
 * Sanitize an API key for logging
 * Shows only first 8 and last 4 characters
 *
 * @function sanitizeApiKey
 * @param {string} key - API key to sanitize
 * @returns {string} Sanitized API key (e.g., 'sk_live_...jkl')
 *
 * @example
 * sanitizeApiKey('sk_live_abc123def456ghi789jkl')
 * // Returns: 'sk_live_...jkl'
 */
export function sanitizeApiKey(key: string): string {
  if (!key || key.length < 12) {
    return "***";
  }
  const start = key.substring(0, 8);
  const end = key.substring(key.length - 4);
  return `${start}...${end}`;
}

/**
 * Sanitize a password for logging
 * Shows only asterisks
 */
export function sanitizePassword(password: string): string {
  if (!password) return "***";
  return "*".repeat(Math.min(password.length, 8));
}

/**
 * Sanitize a token for logging
 * Shows only first 8 and last 4 characters
 */
export function sanitizeToken(token: string): string {
  if (!token || token.length < 12) {
    return "***";
  }
  const start = token.substring(0, 8);
  const end = token.substring(token.length - 4);
  return `${start}...${end}`;
}

/**
 * Sanitize an email address for logging
 * Shows only first character and domain
 *
 * @example
 * sanitizeEmail('john.doe@example.com')
 * // Returns: 'j***@example.com'
 */
export function sanitizeEmail(email: string): string {
  if (!email || !email.includes("@")) {
    return "***";
  }
  const [localPart, domain] = email.split("@");
  if (!localPart || localPart.length === 0) {
    return `***@${domain}`;
  }
  return `${localPart[0]}***@${domain}`;
}

/**
 * Sanitize an object by removing or masking sensitive fields
 *
 * @example
 * sanitizeObject({
 *   username: 'john',
 *   password: 'secret123',
 *   api_key: 'sk_live_abc123...'
 * })
 * // Returns: {
 * //   username: 'john',
 * //   password: '***',
 * //   api_key: 'sk_live_...***'
 * // }
 */
export function sanitizeObject(obj: any): any {
  if (!obj || typeof obj !== "object") {
    return obj;
  }

  const sensitiveFields = [
    "password",
    "api_key",
    "apiKey",
    "token",
    "session_token",
    "sessionToken",
    "secret",
    "authorization",
    "Authorization",
    "supabase_key",
    "supabaseKey",
    "access_token",
    "accessToken",
    "refresh_token",
    "refreshToken",
  ];

  const sanitized = Array.isArray(obj) ? [...obj] : { ...obj };

  for (const key in sanitized) {
    if (sensitiveFields.includes(key)) {
      const value = sanitized[key];
      if (typeof value === "string") {
        if (key.includes("password")) {
          sanitized[key] = sanitizePassword(value);
        } else if (key.includes("api_key") || key.includes("apiKey")) {
          sanitized[key] = sanitizeApiKey(value);
        } else if (key.includes("token")) {
          sanitized[key] = sanitizeToken(value);
        } else {
          sanitized[key] = "***";
        }
      }
    } else if (typeof sanitized[key] === "object") {
      sanitized[key] = sanitizeObject(sanitized[key]);
    }
  }

  return sanitized;
}

/**
 * Sanitize an error message
 * Removes sensitive data from error messages
 */
export function sanitizeError(error: any): string {
  if (!error) return "Unknown error";

  let message = error.message || String(error);

  // Remove common sensitive patterns
  message = message.replace(/sk_[a-z0-9_]+/gi, "[REDACTED_API_KEY]");
  message = message.replace(
    /Bearer\s+[a-zA-Z0-9_\-\.]+/gi,
    "Bearer [REDACTED_TOKEN]"
  );
  message = message.replace(/password[=:]\s*[^\s,}]+/gi, "password=[REDACTED]");
  message = message.replace(
    /api[_-]?key[=:]\s*[^\s,}]+/gi,
    "api_key=[REDACTED]"
  );
  message = message.replace(/token[=:]\s*[^\s,}]+/gi, "token=[REDACTED]");

  return message;
}

/**
 * Create a safe log entry with sanitized sensitive data
 *
 * @example
 * const logEntry = createSafeLogEntry({
 *   event: 'login_attempt',
 *   username: 'john',
 *   password: 'secret123',
 *   ip: '192.168.1.1'
 * });
 * // Returns: {
 * //   event: 'login_attempt',
 * //   username: 'john',
 * //   password: '***',
 * //   ip: '192.168.1.1'
 * // }
 */
export function createSafeLogEntry(data: any): any {
  return sanitizeObject(data);
}

/**
 * Sanitize Authorization header
 * Removes the actual token/key value
 */
export function sanitizeAuthHeader(header: string): string {
  if (!header) return "***";

  if (header.startsWith("Bearer ")) {
    return "Bearer [REDACTED_TOKEN]";
  }

  if (header.startsWith("Basic ")) {
    return "Basic [REDACTED_CREDENTIALS]";
  }

  return "[REDACTED_AUTH]";
}

/**
 * Sanitize request headers for logging
 * Removes sensitive headers like Authorization, Cookie, etc.
 */
export function sanitizeHeaders(headers: any): any {
  const sensitiveHeaders = [
    "authorization",
    "cookie",
    "x-api-key",
    "x-auth-token",
    "x-access-token",
  ];

  const sanitized = { ...headers };

  for (const key of sensitiveHeaders) {
    if (key in sanitized) {
      if (key === "authorization") {
        sanitized[key] = sanitizeAuthHeader(sanitized[key]);
      } else {
        sanitized[key] = "[REDACTED]";
      }
    }
  }

  return sanitized;
}
