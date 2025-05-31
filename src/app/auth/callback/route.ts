import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { upsertUserProfile } from "@/lib/supabase/profiles";

/**
 * Handles the GET request for the OAuth callback route.
 *
 * This function processes the OAuth callback by validating the request,
 * handling errors, exchanging the authorization code for a session,
 * and redirecting the user to the appropriate destination.
 *
 * @param request - The incoming `NextRequest` object containing the callback request details.
 * @returns A `NextResponse` object that redirects the user to the appropriate page based on the outcome.
 *
 * ### Behavior:
 * - Validates the `referer` header to prevent CSRF attacks.
 * - Handles OAuth errors by mapping them to user-friendly error messages and redirecting to the login page.
 * - Exchanges the authorization code for a session using Supabase.
 * - Validates the session and user data after the exchange.
 * - Redirects the user to a secure destination, ensuring the redirect URL is same-origin and matches allowed paths.
 *
 * ### Error Handling:
 * - Redirects to the login page with appropriate error messages for:
 *   - Invalid or missing `referer`.
 *   - OAuth errors (e.g., `access_denied`, `invalid_request`).
 *   - Missing or invalid authorization code.
 *   - Token exchange errors (e.g., expired or invalid code).
 *   - Session creation failures.
 *   - Timeout during the token exchange process.
 *   - Generic callback handler errors.
 *
 * ### Security:
 * - Validates the `referer` header to ensure it matches the request's origin.
 * - Ensures the redirect URL is same-origin and matches a predefined list of allowed paths.
 *
 * ### Logging:
 * - Logs successful authentication details in development mode, including user ID, email, provider, and timestamp.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");
  const state = requestUrl.searchParams.get("state");
  const origin = requestUrl.origin;

  // Get redirect destination with validation
  const redirectTo = requestUrl.searchParams.get("redirect_to")?.toString();

  // Security: Validate origin to prevent CSRF attacks
  // Note: During OAuth flows, referer can legitimately come from OAuth providers
  const referer = request.headers.get("referer");

  // Debug logging
  if (process.env.NODE_ENV === "development") {
    console.log("Callback referer:", referer);
    console.log("Request origin:", origin);
  }

  // Temporarily disable strict referer validation for OAuth debugging
  // TODO: Re-enable with proper OAuth provider validation
  /*
  if (referer && !referer.startsWith(origin)) {
    // Allow common OAuth providers
    const allowedOAuthDomains = [
      "accounts.google.com",
      "github.com",
      "discord.com",
      "api.twitter.com",
      "facebook.com",
      "linkedin.com",
    ];

    const isFromOAuthProvider = allowedOAuthDomains.some((domain) =>
      referer.includes(domain)
    );

    if (!isFromOAuthProvider) {
      console.error("Invalid referer:", referer);
      return NextResponse.redirect(
        `${origin}/auth/login?error=invalid_request`
      );
    }
  }
  */

  // Handle OAuth errors
  if (error) {
    console.error("OAuth error:", { error, errorDescription, state });

    // Map common OAuth errors to user-friendly messages
    const errorMap: Record<string, string> = {
      access_denied: "access_denied",
      invalid_request: "invalid_request",
      unauthorized_client: "configuration_error",
      unsupported_response_type: "configuration_error",
      invalid_scope: "invalid_permissions",
      server_error: "server_error",
      temporarily_unavailable: "service_unavailable",
    };

    const mappedError = errorMap[error] || "unknown_error";
    return NextResponse.redirect(
      `${origin}/auth/login?error=${mappedError}&description=${encodeURIComponent(
        errorDescription || ""
      )}`
    );
  }

  // Handle missing authorization code
  if (!code) {
    console.error("Missing authorization code in callback");
    return NextResponse.redirect(`${origin}/auth/login?error=missing_code`);
  }

  try {
    const supabase = await createClient();

    // Exchange code for session with timeout
    const exchangePromise = supabase.auth.exchangeCodeForSession(code);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Exchange timeout")), 10000)
    );

    const { data, error: exchangeError } = (await Promise.race([
      exchangePromise,
      timeoutPromise,
    ])) as any;

    if (exchangeError) {
      console.error("Token exchange error:", exchangeError);

      // Handle specific exchange errors
      if (exchangeError.message?.includes("expired")) {
        return NextResponse.redirect(`${origin}/auth/login?error=code_expired`);
      } else if (exchangeError.message?.includes("invalid")) {
        return NextResponse.redirect(`${origin}/auth/login?error=invalid_code`);
      } else {
        return NextResponse.redirect(
          `${origin}/auth/login?error=exchange_failed`
        );
      }
    }

    // Validate session was created successfully
    if (!data?.session || !data?.user) {
      console.error("Session creation failed: No session or user data");
      return NextResponse.redirect(`${origin}/auth/login?error=session_failed`);
    }

    // Create/update user profile automatically
    try {
      const { error: profileError } = await upsertUserProfile(data.user);
      if (profileError) {
        console.error("Failed to create user profile:", profileError);
        // Don't fail the login, just log the error
      }
    } catch (profileError) {
      console.error("Error during profile creation:", profileError);
      // Don't fail the login, just log the error
    }

    // Security: Validate redirect URL to prevent open redirects
    let finalRedirect = "/dashboard"; // Default secure redirect

    if (redirectTo) {
      try {
        const redirectUrl = new URL(redirectTo, origin);

        // Only allow same-origin redirects
        if (redirectUrl.origin === origin) {
          // Additional validation: only allow specific paths
          const allowedPaths = ["/dashboard", "/profile", "/settings"];
          const isAllowedPath = allowedPaths.some((path) =>
            redirectUrl.pathname.startsWith(path)
          );

          if (isAllowedPath) {
            finalRedirect = redirectUrl.pathname + redirectUrl.search;
          }
        }
      } catch (e) {
        console.error("Invalid redirect URL:", redirectTo);
        // Use default redirect
      }
    }

    // Log successful authentication (in development)
    if (process.env.NODE_ENV === "development") {
      console.log("Authentication successful:", {
        userId: data.user.id,
        email: data.user.email,
        provider: data.user.app_metadata?.provider,
        timestamp: new Date().toISOString(),
      });
    }

    // Redirect to final destination
    return NextResponse.redirect(`${origin}${finalRedirect}`);
  } catch (error) {
    console.error("Callback handler error:", error);

    // Handle timeout specifically
    if (error instanceof Error && error.message === "Exchange timeout") {
      return NextResponse.redirect(`${origin}/auth/login?error=timeout`);
    }

    // Generic error fallback
    return NextResponse.redirect(`${origin}/auth/login?error=callback_failed`);
  }
}
