import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * Handles the POST request to sign out a user.
 *
 * This function uses the Supabase client to retrieve the currently authenticated user.
 * If a user is found, it signs them out and redirects them to the home page.
 *
 * @param request - The incoming Next.js request object.
 * @returns A `NextResponse` object that redirects the user to the home page with a 302 status code.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await supabase.auth.signOut();
  }

  return NextResponse.redirect(new URL("/", request.url), {
    status: 302,
  });
}
