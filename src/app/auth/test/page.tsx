"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AuthTestPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-dm-sans font-medium mb-4">
            Authentication Test Page
          </h1>
          <p className="text-gray-600">
            This page shows the raw user data for testing OAuth providers
          </p>
        </div>

        {user ? (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-medium mb-4">
                User Authentication Data
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Email:</strong> {user.email || "N/A"}
                </div>
                <div>
                  <strong>Provider:</strong>{" "}
                  {user.app_metadata?.provider || "N/A"}
                </div>
                <div>
                  <strong>Created At:</strong>{" "}
                  {new Date(user.created_at).toLocaleDateString()}
                </div>
                <div>
                  <strong>Last Sign In:</strong>{" "}
                  {user.last_sign_in_at
                    ? new Date(user.last_sign_in_at).toLocaleDateString()
                    : "N/A"}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">User Metadata</h3>
              <pre className="text-xs bg-white p-4 rounded border overflow-auto">
                {JSON.stringify(user.user_metadata, null, 2)}
              </pre>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">App Metadata</h3>
              <pre className="text-xs bg-white p-4 rounded border overflow-auto">
                {JSON.stringify(user.app_metadata, null, 2)}
              </pre>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">Full User Object</h3>
              <pre className="text-xs bg-white p-4 rounded border overflow-auto max-h-96">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>

            <div className="flex gap-4 justify-center">
              <Button asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">Go to Home</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-gray-600 mb-6">You are not authenticated.</p>
            <Button asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
