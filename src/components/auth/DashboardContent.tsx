"use client";

import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useForms } from "@/lib/hooks/useForms";
import { useState } from "react";
import {
  Plus,
  FileText,
  BarChart3,
  Users,
  Eye,
  Edit,
  Trash2,
  ExternalLink,
  Calendar,
  Copy,
  LogOut,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface DashboardContentProps {
  user: User;
}

export default function DashboardContent({ user }: DashboardContentProps) {
  const router = useRouter();
  const supabase = createClient();

  // Hooks
  const {
    profile,
    loading: profileLoading,
    error: profileError,
  } = useUserProfile(user);
  const {
    forms,
    loading: formsLoading,
    error: formsError,
    fetchForms,
    deleteForm,
  } = useForms(); // State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [copyingLinks, setCopyingLinks] = useState<Set<string>>(new Set());
  const handleCreateForm = () => {
    router.push("/dashboard/forms/new");
  };
  const handleEditForm = (formId: string) => {
    router.push(`/dashboard/forms/${formId}`);
  };

  const handleViewForm = (shareUrl: string) => {
    window.open(`/f/${shareUrl}`, "_blank");
  };
  const handleCopyLink = async (shareUrl: string) => {
    setCopyingLinks((prev) => new Set(prev).add(shareUrl));
    try {
      const url = `${window.location.origin}/f/${shareUrl}`;
      await navigator.clipboard.writeText(url);
      toast.success("Form link copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy link");
    } finally {
      setCopyingLinks((prev) => {
        const newSet = new Set(prev);
        newSet.delete(shareUrl);
        return newSet;
      });
    }
  };

  const handleDeleteForm = (formId: string, formTitle: string) => {
    setFormToDelete({ id: formId, title: formTitle });
    setDeleteDialogOpen(true);
  };
  const confirmDeleteForm = async () => {
    if (!formToDelete) return;

    try {
      await deleteForm(formToDelete.id);
      toast.success("Form deleted successfully");
    } catch (error) {
      toast.error("Failed to delete form");
    } finally {
      setDeleteDialogOpen(false);
      setFormToDelete(null);
    }
  };

  const handleViewAnalytics = (formId: string) => {
    router.push(`/dashboard/forms/${formId}/analytics`);
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    toast.success("Signed out successfully");
    router.push("/");
    router.refresh();
  };

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
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center flex-wrap gap-6 py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">
                Welcome back, {userDisplayData.firstName}!
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={handleCreateForm} className="gap-2">
                Create Form
                <Plus className="w-4 h-4" />
              </Button>
              <Button variant="ghost" onClick={handleSignOut}>
                Sign Out
                <LogOut className="w-4 h-4s" />
              </Button>
            </div>
          </div>
        </div>
      </div>{" "}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Forms List */}
        <Card className="border-none bg-neutral-50">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Your Forms</CardTitle>
              <Button onClick={handleCreateForm} size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                New Form
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {formsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-white shadow-none rounded-xl space-y-3 sm:space-y-0"
                  >
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </div>
                ))}
              </div>
            ) : formsError ? (
              <div className="text-center py-8 text-red-600">
                Error loading forms: {formsError}
              </div>
            ) : forms.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No forms yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Create your first form to start collecting responses
                </p>
                <Button onClick={handleCreateForm} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Your First Form
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {forms.map((form) => (
                  <div
                    key={form.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-white shadow-none rounded-xl space-y-3 sm:space-y-0"
                  >
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                        <h3 className="font-medium text-gray-900">
                          {form.title}
                        </h3>
                        <div className="flex gap-2">
                          {form.is_published ? (
                            <Badge
                              variant="default"
                              className="bg-green-100 text-green-800 w-fit"
                            >
                              Published
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="w-fit">
                              Draft
                            </Badge>
                          )}
                          {form.password_protected && (
                            <Badge variant="outline" className="w-fit">
                              Protected
                            </Badge>
                          )}
                        </div>{" "}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(form.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewAnalytics(form.id)}
                        title="View analytics"
                        className="flex-shrink-0"
                      >
                        <BarChart3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditForm(form.id)}
                        title="Edit form"
                        className="flex-shrink-0"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {form.is_published && form.share_url && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewForm(form.share_url!)}
                            title="View form"
                            className="flex-shrink-0"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>{" "}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyLink(form.share_url!)}
                            title="Copy link"
                            className="flex-shrink-0"
                            disabled={copyingLinks.has(form.share_url!)}
                          >
                            <Copy className="w-4 h-4" />
                            {copyingLinks.has(form.share_url!) && (
                              <span className="ml-1 text-xs">Copied!</span>
                            )}
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteForm(form.id, form.title)}
                        title="Delete form"
                        className="text-red-600 hover:text-red-700 flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Form</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{formToDelete?.title}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteForm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
