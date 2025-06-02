"use client";

import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useUserProfile } from "@/hooks/use-user-profile";
import { updateUserProfile } from "@/lib/supabase/profiles";
import {
  ArrowLeft,
  Mail,
  Calendar,
  Shield,
  Edit3,
  Save,
  X,
} from "lucide-react";
import { authToasts, successToasts, appToasts } from "@/lib/toast";

interface ProfileContentProps {
  user: User;
}

export default function ProfileContent({ user }: ProfileContentProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // Use the user profile hook to get database profile data
  const {
    profile,
    loading: profileLoading,
    error: profileError,
    refreshProfile,
  } = useUserProfile(user);

  // Use profile data if available, otherwise fallback to user metadata
  const displayData = profile
    ? {
        name:
          profile.full_name ||
          `${profile.first_name} ${profile.last_name}`.trim() ||
          "User",
        firstName: profile.first_name || "User",
        lastName: profile.last_name || "",
        email: profile.email,
        provider: profile.provider,
        emailVerified: profile.email_verified,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
      }
    : {
        name: user.email?.split("@")[0] || "User",
        firstName: user.email?.split("@")[0] || "User",
        lastName: "",
        email: user.email,
        provider: "Loading...",
        emailVerified: !!user.email_confirmed_at,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      };

  const [editedData, setEditedData] = useState({
    firstName: displayData.firstName,
    lastName: displayData.lastName,
  });

  // Update edited data when profile changes
  useEffect(() => {
    setEditedData({
      firstName: displayData.firstName,
      lastName: displayData.lastName,
    });
  }, [displayData.firstName, displayData.lastName]);
  const handleSaveProfile = async () => {
    if (!profile) {
      appToasts.unexpectedError();
      return;
    }

    setIsLoading(true);
    try {
      const updates = {
        first_name: editedData.firstName,
        last_name: editedData.lastName,
        full_name: `${editedData.firstName} ${editedData.lastName}`.trim(),
      };

      const { data, error } = await updateUserProfile(user.id, updates);

      if (error) {
        throw error;
      }

      await refreshProfile();
      successToasts.updated("Profile");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      appToasts.unexpectedError();
    } finally {
      setIsLoading(false);
    }
  };
  const handleCancelEdit = () => {
    setEditedData({
      firstName: displayData.firstName,
      lastName: displayData.lastName,
    });
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Profile Details */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="font-dm-sans">
                    Profile Information
                  </CardTitle>
                  <CardDescription>
                    Update your personal information
                  </CardDescription>
                </div>
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEdit}
                      disabled={isLoading}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveProfile}
                      disabled={isLoading}
                      className="bg-zinc-900 hover:bg-zinc-800"
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    {isEditing ? (
                      <Input
                        id="firstName"
                        value={editedData.firstName}
                        onChange={(e) =>
                          setEditedData({
                            ...editedData,
                            firstName: e.target.value,
                          })
                        }
                      />
                    ) : (
                      <p className="px-3 py-2 text-sm bg-neutral-50 rounded-md">
                        {displayData.firstName}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    {isEditing ? (
                      <Input
                        id="lastName"
                        value={editedData.lastName}
                        onChange={(e) =>
                          setEditedData({
                            ...editedData,
                            lastName: e.target.value,
                          })
                        }
                      />
                    ) : (
                      <p className="px-3 py-2 text-sm bg-neutral-50 rounded-md">
                        {displayData.lastName || "Not provided"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <p className="px-3 py-2 text-sm bg-neutral-50 rounded-md text-gray-600">
                    {displayData.email} (managed by {displayData.provider})
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle className="font-dm-sans">
                  Account Information
                </CardTitle>
                <CardDescription>
                  Your account details and authentication information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-gray-600">
                        Your account email address
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-600">
                    {displayData.email}
                  </span>
                </div>

                <Separator />

                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium">Authentication Provider</p>
                      <p className="text-sm text-gray-600">
                        How you sign in to your account
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-600">
                    {displayData.provider}
                  </span>
                </div>

                <Separator />

                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium">Last Sign In</p>
                      <p className="text-sm text-gray-600">
                        When you last accessed your account
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-600">
                    {user.last_sign_in_at
                      ? formatDate(user.last_sign_in_at)
                      : "N/A"}
                  </span>
                </div>

                <Separator />

                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium">Email Verification</p>
                      <p className="text-sm text-gray-600">
                        Your email verification status
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-sm px-2 py-1 rounded-full ${
                      user.email_confirmed_at
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {user.email_confirmed_at ? "Verified" : "Pending"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
