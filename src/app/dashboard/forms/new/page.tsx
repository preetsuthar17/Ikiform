// filepath: src/app/dashboard/forms/new/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { FormBuilder } from "@/components/form-builder";
import { Form } from "@/lib/types/forms";
import { toast } from "sonner";

export default function NewFormPage() {
  const router = useRouter();

  const handleFormSaved = (form: Form) => {
    console.log("Form saved:", form);
    toast.success("Form saved successfully!");

    // Redirect to edit mode with the new form ID
    if (form.id) {
      router.push(`/dashboard/forms/${form.id}`);
    }
  };

  const handleFormPublished = (form: Form) => {
    console.log("Form published:", form);
    toast.success("Form published successfully!");
  };

  return (
    <div className="h-screen">
      <FormBuilder
        onFormSaved={handleFormSaved}
        onFormPublished={handleFormPublished}
      />
    </div>
  );
}
