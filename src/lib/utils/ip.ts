import { NextRequest } from "next/server";

/**
 * Extract the real client IP address from various headers.
 * Handles development, production, and various proxy scenarios.
 */
export function getClientIP(request: NextRequest): string {
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
      const ips = value.split(",").map((ip) => ip.trim());
      const clientIP = ips[0];

      if (isValidIP(clientIP) && !isLocalIP(clientIP)) {
        return clientIP;
      }
    }
  }

  const remoteAddress =
    (request as any).socket?.remoteAddress ||
    (request as any).connection?.remoteAddress;

  if (remoteAddress && isValidIP(remoteAddress) && !isLocalIP(remoteAddress)) {
    return remoteAddress;
  }

  return process.env.NODE_ENV === "development"
    ? "127.0.0.1 (localhost)"
    : "unknown";
}

/**
 * Check if an IP address is valid.
 */
function isValidIP(ip: string): boolean {
  const ipv4Regex =
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;

  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

/**
 * Check if an IP address is local/private.
 */
function isLocalIP(ip: string): boolean {
  if (ip === "::1" || ip === "::") {
    return true;
  }

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
 * Get user agent with additional parsing.
 */
export function getUserAgent(request: NextRequest): string {
  const userAgent = request.headers.get("user-agent") || "unknown";

  return process.env.NODE_ENV === "development" && userAgent !== "unknown"
    ? `${userAgent} (dev)`
    : userAgent;
}

/**
 * Get geographic location from IP (placeholder for future implementation).
 */
export function getLocationFromIP(ip: string): {
  country?: string;
  city?: string;
} {
  const cfCountry =
    process.env.NODE_ENV === "production" ? undefined : undefined;

  return {
    country: cfCountry || undefined,
    city: undefined,
  };
}
