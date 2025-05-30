"use client";

import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  Plus,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Users,
  Calendar,
  TrendingUp,
  Star,
  Zap,
} from "lucide-react";

interface DashboardContentProps {
  user: User;
}

export default function DashboardContent({ user }: DashboardContentProps) {
  const router = useRouter();
  const supabase = createClient();

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
        avatar: metadata.avatar_url,
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
        avatar: metadata.avatar_url || metadata.picture,
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
      avatar: metadata.avatar_url || metadata.picture,
      email: user.email,
      provider: "Email",
    };
  };

  const userDisplayData = getUserDisplayData(user);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error("Error signing out");
      } else {
        toast.success("Signed out successfully");
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      toast.error("Unexpected error occurred");
    }
  };

  const quickActions = [
    {
      title: "Create New Form",
      description: "Start building your next form",
      icon: Plus,
      action: () => toast.success("Form builder coming soon!"),
      primary: true,
    },
    {
      title: "View All Forms",
      description: "Manage your existing forms",
      icon: FileText,
      action: () => toast.success("Forms management coming soon!"),
    },
    {
      title: "Analytics",
      description: "See your form performance",
      icon: BarChart3,
      action: () => toast.success("Analytics dashboard coming soon!"),
    },
    {
      title: "Settings",
      description: "Configure your account",
      icon: Settings,
      action: () => toast.success("Settings panel coming soon!"),
    },
  ];

  const stats = [
    { label: "Total Forms", value: "0", icon: FileText, change: "+0%" },
    { label: "Total Responses", value: "0", icon: Users, change: "+0%" },
    { label: "This Month", value: "0", icon: Calendar, change: "+0%" },
    { label: "Conversion Rate", value: "0%", icon: TrendingUp, change: "+0%" },
  ];

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

          {/* User Profile Section */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={userDisplayData.avatar}
                  alt={userDisplayData.name}
                />
                <AvatarFallback className="bg-zinc-900 text-white">
                  {userDisplayData.firstName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <p className="font-medium text-sm">{userDisplayData.name}</p>
                <p className="text-xs text-gray-500">{userDisplayData.email}</p>
              </div>
            </div>
          </div>
        </div>
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-lg p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-2">
                <stat.icon className="w-5 h-5 text-gray-600" />
                <span className="text-xs text-green-600 font-medium">
                  {stat.change}
                </span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-dm-sans font-medium mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className={`text-left p-6 rounded-lg border-2 transition-all duration-200 hover:shadow-lg ${
                  action.primary
                    ? "bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800"
                    : "bg-white border-gray-200 hover:border-gray-300"
                }`}
              >
                <action.icon
                  className={`w-6 h-6 mb-3 ${
                    action.primary ? "text-white" : "text-gray-600"
                  }`}
                />
                <h3
                  className={`font-medium mb-1 ${
                    action.primary ? "text-white" : "text-gray-900"
                  }`}
                >
                  {action.title}
                </h3>
                <p
                  className={`text-sm ${
                    action.primary ? "text-gray-200" : "text-gray-600"
                  }`}
                >
                  {action.description}
                </p>
              </button>
            ))}
          </div>
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
            onClick={() => toast.success("Form builder coming soon!")}
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
