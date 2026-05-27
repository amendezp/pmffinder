/**
 * Simple in-memory IP-based rate limiter for guest endpoints.
 *
 * Caveats:
 * - Per-instance — Vercel may run multiple lambda instances, so the effective
 *   limit is per instance per window.
 * - Resets on cold start.
 *
 * Good enough as a basic deterrent for casual abuse. For production-grade
 * limiting, replace with Vercel KV / Upstash Redis.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 5000;

export function checkRateLimit(args: {
  key: string;
  max: number;
  windowMs: number;
}): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  let bucket = buckets.get(args.key);

  if (!bucket || bucket.resetAt < now) {
    bucket = { count: 0, resetAt: now + args.windowMs };
    if (buckets.size >= MAX_BUCKETS) {
      // Evict oldest. Approximate — just delete the first key the iterator
      // returns. Map preserves insertion order so this is roughly LRU.
      const oldest = buckets.keys().next().value;
      if (oldest !== undefined) buckets.delete(oldest);
    }
    buckets.set(args.key, bucket);
  }

  bucket.count++;
  return {
    allowed: bucket.count <= args.max,
    remaining: Math.max(0, args.max - bucket.count),
    resetAt: bucket.resetAt,
  };
}

export function getClientIp(req: Request): string {
  // Vercel sets these headers when behind their edge.
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}
