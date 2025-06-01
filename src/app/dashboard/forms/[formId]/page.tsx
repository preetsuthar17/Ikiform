// filepath: src/app/dashboard/forms/[formId]/page.tsx
// Edit Form Page
"use client";

import { useParams, useRouter } from "next/navigation";
import { useForm } from "@/lib/hooks/useForms";
import { FormBuilder } from "@/components/form-builder";
import { Form } from "@/lib/types/forms";
import { toast } from "react-hot-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function EditFormPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.formId as string;

  const { form, loading, error } = useForm(formId);

  const handleFormSaved = (updatedForm: Form) => {
    console.log("Form updated:", updatedForm);
  };

  const handleFormPublished = (publishedForm: Form) => {
    console.log("Form published:", publishedForm);
    toast.success("Form published successfully!");
  };

  if (loading) {
    return (
      <div className="h-screen">
        {/* Header Skeleton */}
        <div className="h-16 bg-white border-b border-[#E5E5E5] px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="h-[calc(100vh-4rem)] flex">
          <div className="w-1/5 border-r border-[#E5E5E5] p-4">
            <Skeleton className="h-6 w-20 mb-4" />
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full mb-2" />
            ))}
          </div>
          <div className="flex-1 p-8">
            <Skeleton className="h-8 w-64 mb-6" />
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full mb-4" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            Error Loading Form
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/forms")}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Forms
            </Button>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Form Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The form you're looking for doesn't exist or you don't have
            permission to access it.
          </p>
          <Button
            onClick={() => router.push("/dashboard/forms")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Forms
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen">
      <FormBuilder
        initialForm={form}
        onFormSaved={handleFormSaved}
        onFormPublished={handleFormPublished}
      />
    </div>
  );
}
