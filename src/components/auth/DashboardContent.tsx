"use client";

import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useUserProfile } from "@/hooks/use-user-profile";
import { successToasts, appToasts } from "@/lib/toast";
import { Plus, FileText, BarChart3, Users } from "lucide-react";

interface DashboardContentProps {
  user: User;
}

export default function DashboardContent({ user }: DashboardContentProps) {
  const router = useRouter();
  const supabase = createClient();

  // Use the user profile hook to automatically save/sync user data
  const {
    profile,
    loading: profileLoading,
    error: profileError,
  } = useUserProfile(user);

  // Extract user data from different OAuth providers
  const getUserDisplayData = (user: User) => {
    const metadata = user.user_metadata || {};
    const appMetadata = user.app_metadata || {};

    // For GitHub OAuth
    if (appMetadata.provider === "github") {
      return {
        name:
          metadata.full_name ||
          metadata.name ||
          metadata.user_name ||
          user.email?.split("@")[0] ||
          "GitHub User",
        firstName:
          metadata.full_name?.split(" ")[0] ||
          metadata.name?.split(" ")[0] ||
          metadata.user_name ||
          user.email?.split("@")[0] ||
          "there",
        email: user.email,
        provider: "GitHub",
      };
    }

    // For Google OAuth
    if (appMetadata.provider === "google") {
      return {
        name:
          metadata.full_name ||
          metadata.name ||
          user.email?.split("@")[0] ||
          "Google User",
        firstName:
          metadata.given_name ||
          metadata.full_name?.split(" ")[0] ||
          metadata.name?.split(" ")[0] ||
          user.email?.split("@")[0] ||
          "there",
        email: user.email,
        provider: "Google",
      };
    }

    // Fallback for other providers or direct email signup
    return {
      name:
        metadata.full_name ||
        metadata.name ||
        user.email?.split("@")[0] ||
        "User",
      firstName:
        metadata.full_name?.split(" ")[0] ||
        metadata.name?.split(" ")[0] ||
        user.email?.split("@")[0] ||
        "there",
      email: user.email,
      provider: "Email",
    };
  };

  // Use profile data if available, otherwise fallback to getUserDisplayData
  const userDisplayData = profile
    ? {
        name:
          profile.full_name ||
          `${profile.first_name} ${profile.last_name}`.trim() ||
          "User",
        firstName: profile.first_name || "User",
        lastName: profile.last_name || "",
        email: profile.email,
        provider: profile.provider,
      }
    : getUserDisplayData(user);

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <div className="max-w-6xl w-[90%] mx-auto py-8">
        {" "}
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
          <div className="mb-6 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-dm-sans font-medium mb-2">
              Welcome back, {userDisplayData.firstName}! 👋
            </h1>
            <p className="text-gray-600 text-lg">
              Ready to create some beautiful forms?
            </p>
          </div>
        </div>
        {/* Quick Navigation */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/dashboard/profile")}
            className="flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Profile
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => appToasts.featureNotAvailable()}
            className="flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            Analytics
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => appToasts.featureNotAvailable()}
            className="flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Forms
          </Button>
        </div>
        {/* Recent Activity Placeholder */}
        <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No forms yet
          </h3>
          <p className="text-gray-600 mb-4">
            Create your first form to start collecting responses from your
            audience.
          </p>
          <Button
            onClick={() => successToasts.created("Form")}
            className="bg-zinc-900 hover:bg-zinc-800"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Form
          </Button>
        </div>
      </div>
    </div>
  );
}
