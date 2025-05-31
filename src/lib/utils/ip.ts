import { NextRequest } from "next/server";

/**
 * Extract the real client IP address from various headers
 * Handles development, production, and various proxy scenarios
 */
export function getClientIP(request: NextRequest): string {
  // Try to get the real IP from various headers in order of preference
  const headers = [
    "x-forwarded-for",
    "x-real-ip",
    "x-client-ip",
    "cf-connecting-ip", // Cloudflare
    "x-cluster-client-ip",
    "x-forwarded",
    "forwarded-for",
    "forwarded",
  ];

  for (const header of headers) {
    const value = request.headers.get(header);
    if (value) {
      // x-forwarded-for can contain multiple IPs (client, proxy1, proxy2, ...)
      // The first one is the original client IP
      const ips = value.split(",").map((ip) => ip.trim());
      const clientIP = ips[0];

      // Validate IP format and exclude private/local IPs in production
      if (isValidIP(clientIP) && !isLocalIP(clientIP)) {
        return clientIP;
      }
    }
  }
  // Fallback to connection remote address (if available in the request context)
  // Note: NextRequest doesn't expose direct socket access, so this is mainly for other environments
  const remoteAddress =
    (request as any).socket?.remoteAddress ||
    (request as any).connection?.remoteAddress;

  if (remoteAddress && isValidIP(remoteAddress) && !isLocalIP(remoteAddress)) {
    return remoteAddress;
  }

  // In development or when we can't get a real IP, return a meaningful fallback
  if (process.env.NODE_ENV === "development") {
    return "127.0.0.1 (localhost)";
  }

  return "unknown";
}

/**
 * Check if an IP address is valid
 */
function isValidIP(ip: string): boolean {
  // IPv4 regex
  const ipv4Regex =
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

  // IPv6 regex (simplified)
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;

  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

/**
 * Check if an IP address is local/private
 */
function isLocalIP(ip: string): boolean {
  // IPv6 loopback
  if (ip === "::1" || ip === "::") {
    return true;
  }

  // IPv4 private ranges and loopback
  const privateRanges = [
    /^127\./, // 127.0.0.0/8 - Loopback
    /^10\./, // 10.0.0.0/8 - Private
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12 - Private
    /^192\.168\./, // 192.168.0.0/16 - Private
    /^169\.254\./, // 169.254.0.0/16 - Link-local
  ];

  return privateRanges.some((range) => range.test(ip));
}

/**
 * Get user agent with additional parsing
 */
export function getUserAgent(request: NextRequest): string {
  const userAgent = request.headers.get("user-agent") || "unknown";

  // In development, add a note
  if (process.env.NODE_ENV === "development" && userAgent !== "unknown") {
    return `${userAgent} (dev)`;
  }

  return userAgent;
}

/**
 * Get geographic location from IP (placeholder for future implementation)
 */
export function getLocationFromIP(ip: string): {
  country?: string;
  city?: string;
} {
  // This is a placeholder - you could integrate with services like:
  // - ipapi.co
  // - ipinfo.io
  // - MaxMind GeoIP
  // - Cloudflare (if using Cloudflare, check CF-IPCountry header)

  const cfCountry =
    process.env.NODE_ENV === "production"
      ? // In production, you might have CF-IPCountry header from Cloudflare
        undefined
      : undefined;

  return {
    country: cfCountry || undefined,
    city: undefined,
  };
}
