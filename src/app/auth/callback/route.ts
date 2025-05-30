import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * Enhanced OAuth callback handler with security improvements
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
  const referer = request.headers.get("referer");
  if (referer && !referer.startsWith(origin)) {
    console.error("Invalid referer:", referer);
    return NextResponse.redirect(`${origin}/auth/login?error=invalid_request`);
  }

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
        errorDescription || "",
      )}`,
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
      setTimeout(() => reject(new Error("Exchange timeout")), 10000),
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
          `${origin}/auth/login?error=exchange_failed`,
        );
      }
    }

    // Validate session was created successfully
    if (!data?.session || !data?.user) {
      console.error("Session creation failed: No session or user data");
      return NextResponse.redirect(`${origin}/auth/login?error=session_failed`);
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
            redirectUrl.pathname.startsWith(path),
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
