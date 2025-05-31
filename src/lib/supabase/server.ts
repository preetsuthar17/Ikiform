import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "./types";

// Creates a Supabase server client using Next.js cookies
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              // Enhanced cookie options for production security
              const cookieOptions = {
                ...options,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax" as const,
                httpOnly: true,
                path: "/",
              };
              cookieStore.set(name, value, cookieOptions);
            });
          } catch {
            // Ignore errors when called from a Server Component
          }
        },
      },
    }
  );
}
