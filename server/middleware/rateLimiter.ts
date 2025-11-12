/**
 * @fileoverview Rate Limiting Middleware
 * Configurable rate limiters for different API endpoints.
 * Protects against abuse and DoS attacks.
 *
 * @module middleware/rateLimiter
 */

import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { Request, Response } from "express";

/**
 * Rate Limiting Configuration
 * All limits are configurable via environment variables
 *
 * Configured limiters:
 * - loginLimiter: 5 attempts per IP per 10 minutes
 * - sessionLimiter: 10 requests per IP per minute
 * - apiKeyLimiter: 100 requests per API key per hour
 * - generalLimiter: 1000 requests per IP per 15 minutes
 */

// Login rate limiter: 5 attempts per IP per 10 minutes
export const loginLimiter = rateLimit({
  windowMs: parseInt(process.env.LOGIN_RATE_LIMIT_WINDOW_MS || "600000"), // 10 minutes
  max: parseInt(process.env.LOGIN_RATE_LIMIT_MAX_ATTEMPTS || "5"), // 5 attempts
  message: "Too many login attempts, please try again later",
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skip: (req: Request) => {
    // Skip rate limiting for health checks
    return req.path === "/health";
  },
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: "Too many login attempts. Please try again in 10 minutes.",
      retryAfter: req.rateLimit?.resetTime,
    });
  },
});

// API key rate limiter: 100 requests per API key per hour
export const apiKeyLimiter = rateLimit({
  windowMs: parseInt(process.env.API_KEY_RATE_LIMIT_WINDOW_MS || "3600000"), // 1 hour
  max: parseInt(process.env.API_KEY_RATE_LIMIT_MAX_REQUESTS || "100"), // 100 requests
  message: "API rate limit exceeded",
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    // Use API key as the rate limit key if available
    const apiKey = req.headers["authorization"]?.replace("Bearer ", "");
    if (apiKey) {
      return apiKey;
    }
    // Fall back to IP address using the IPv6-safe helper
    return ipKeyGenerator(req);
  },
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: "API rate limit exceeded. Maximum 100 requests per hour.",
      retryAfter: req.rateLimit?.resetTime,
    });
  },
});

// Session creation rate limiter: 10 sessions per IP per hour
export const sessionLimiter = rateLimit({
  windowMs: parseInt(process.env.SESSION_RATE_LIMIT_WINDOW_MS || "3600000"), // 1 hour
  max: parseInt(process.env.SESSION_RATE_LIMIT_MAX_SESSIONS || "10"), // 10 sessions
  message: "Too many session creation attempts",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => {
    // Skip rate limiting for health checks
    return req.path === "/health";
  },
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: "Too many session creation attempts. Please try again later.",
      retryAfter: req.rateLimit?.resetTime,
    });
  },
});

// General API rate limiter: 1000 requests per IP per hour
export const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.GENERAL_RATE_LIMIT_WINDOW_MS || "3600000"), // 1 hour
  max: parseInt(process.env.GENERAL_RATE_LIMIT_MAX_REQUESTS || "1000"), // 1000 requests
  message: "Too many requests from this IP",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => {
    // Skip rate limiting for health checks
    return req.path === "/health";
  },
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: "Too many requests. Please try again later.",
      retryAfter: req.rateLimit?.resetTime,
    });
  },
});
