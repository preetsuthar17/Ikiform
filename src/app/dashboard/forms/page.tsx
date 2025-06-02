"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { toast } from "react-hot-toast";
import { useForms } from "@/lib/hooks/useForms";
import { Form } from "@/lib/types/forms";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Search,
  Eye,
  Edit,
  Copy,
  Share,
  Trash2,
  MoreVertical,
  FileText,
  BarChart3,
  Users,
  ArrowLeft,
} from "lucide-react";

export default function FormsPage() {
  const { forms, loading, error, deleteForm } = useForms();
  const [searchQuery, setSearchQuery] = useState("");
  const [formToDelete, setFormToDelete] = useState<Form | null>(null);

  const router = useRouter();

  // Filter forms based on search query
  const filteredForms = forms.filter(
    (form) =>
      form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (form.description &&
        form.description.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const handleDeleteForm = async (form: Form) => {
    try {
      await deleteForm(form.id);
      toast.success("Form deleted successfully");
      setFormToDelete(null);
    } catch (error) {
      toast.error("Failed to delete form");
    }
  };

  const handleShareForm = (form: Form) => {
    if (form.share_url) {
      const shareUrl = `${window.location.origin}/f/${form.share_url}`;
      navigator.clipboard.writeText(shareUrl);
      toast.success("Share link copied to clipboard");
    } else {
      toast.error("Form must be published to share");
    }
  };

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">
            Error Loading Forms
          </h2>
          <p className="text-gray-600 mt-2">{error}</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard")}
          className="gap-2 self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#2D2D2D]">My Forms</h1>
            <p className="text-[#717171] mt-1">Create and manage your forms</p>
          </div>
          <Link href="/dashboard/forms/new">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create New Form
            </Button>
          </Link>
        </div>
      </div>

      <div className="rounded-3xl bg-neutral-50 p-6 ">
        {/* Search and Filters */}
        <div className="mb-6">
          <div className="relative max-w-md bg-white rounded-xl">
            <Search className="absolute left-3 top-[9.5px] w-4 h-4 text-[#717171]" />
            <Input
              placeholder="Search forms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-xl shadow-none border-0"
            />
          </div>
        </div>

        {/* Forms Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="h-64 border-0">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-1/3" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : filteredForms.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-[#717171] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[#2D2D2D] mb-2">
              {searchQuery ? "No forms found" : "No forms yet"}
            </h3>
            <p className="text-[#717171] mb-6">
              {searchQuery
                ? "Try adjusting your search terms"
                : "Get started by creating your first form"}
            </p>
            {!searchQuery && (
              <Link href="/dashboard/forms/new">
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Your First Form
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredForms.map((form) => (
              <Card key={form.id} className="group border-0">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-[#2D2D2D] truncate">
                        {form.title}
                      </h3>
                      {form.description && (
                        <p className="text-sm text-[#717171] mt-1 line-clamp-2">
                          {form.description}
                        </p>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/forms/${form.id}`}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        {form.is_published && (
                          <DropdownMenuItem asChild>
                            <Link href={`/f/${form.share_url}`} target="_blank">
                              <Eye className="w-4 h-4 mr-2" />
                              Preview
                            </Link>
                          </DropdownMenuItem>
                        )}

                        {form.is_published && (
                          <DropdownMenuItem
                            onClick={() => handleShareForm(form)}
                          >
                            <Share className="w-4 h-4 mr-2" />
                            Copy Link
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setFormToDelete(form)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="flex items-center gap-2 mt-3">
                    <Badge
                      variant={form.is_published ? "default" : "secondary"}
                      className={
                        form.is_published ? "bg-green-100 text-green-800" : ""
                      }
                    >
                      {form.is_published ? "Published" : "Draft"}
                    </Badge>
                    {form.password_protected && (
                      <Badge variant="outline">Protected</Badge>
                    )}
                  </div>

                  <p className="text-xs text-[#717171] mt-3">
                    Updated {formatDistanceToNow(new Date(form.updated_at))} ago
                  </p>
                </CardContent>

                <CardFooter className="pt-0">
                  <div className="flex gap-2 w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="flex-1"
                    >
                      <Link href={`/dashboard/forms/${form.id}`}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/forms/${form.id}/analytics`}>
                        <BarChart3 className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!formToDelete}
        onOpenChange={() => setFormToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Form</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{formToDelete?.title}"? This
              action cannot be undone. All form responses will also be
              permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => formToDelete && handleDeleteForm(formToDelete)}
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
