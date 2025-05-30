"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "react-hot-toast";

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const supabase = createClient();

  const handleOAuthLogin = async (provider: "github" | "google") => {
    try {
      setIsLoading(true);
      setLoadingProvider(provider);

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error(`Error during ${provider} login:`, error);
        toast.error(
          `Failed to sign in with ${
            provider === "github" ? "GitHub" : "Google"
          }`,
        );
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  const LoadingSpinner = () => (
    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
  );

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm flex flex-col gap-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-dm-sans font-medium text-gray-900 mb-2">
            Welcome to Ikiform
          </h2>
          <p className="text-gray-600">Choose your preferred sign-in method</p>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-white text-gray-500">
              Quick & secure authentication
            </span>
          </div>
        </div>

        {/* Social Login Buttons */}
        <div className="flex flex-col gap-3">
          <Button
            variant="outline"
            className="w-full h-12 text-sm font-medium border-gray-300 hover:bg-gray-50 hover:border-gray-400 focus:ring-2 focus:ring-zinc-500 focus:border-transparent transition-all duration-200"
            onClick={() => handleOAuthLogin("github")}
            disabled={isLoading}
          >
            <div className="flex items-center justify-center">
              {" "}
              {loadingProvider === "github" ? (
                <LoadingSpinner />
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              )}
              <span className="ml-3">Continue with GitHub</span>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full h-12 text-sm font-medium border-gray-300 hover:bg-gray-50 hover:border-gray-400 focus:ring-2 focus:ring-zinc-500 focus:border-transparent transition-all duration-200"
            onClick={() => handleOAuthLogin("google")}
            disabled={isLoading}
          >
            <div className="flex items-center justify-center">
              {loadingProvider === "google" ? (
                <LoadingSpinner />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              <span className="ml-3">Continue with Google</span>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
