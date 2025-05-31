// Main Form Builder Component - Orchestrates the entire form building experience
"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Form, FormField, FIELD_TEMPLATES } from "@/lib/types/forms";
import { formService } from "@/lib/services/formService";
import { FieldPalette } from "./FieldPalette";
import { FormCanvas } from "./FormCanvas";
import { FieldSettingsPanel } from "./FieldSettingsPanel";
import { FormSettingsPanel } from "./FormSettingsPanel";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Save,
  Eye,
  Share,
  Settings,
  MoreVertical,
  ChevronLeft,
  Loader2,
} from "lucide-react";

interface FormBuilderProps {
  initialForm?: Form;
  onFormSaved?: (form: Form) => void;
  onFormPublished?: (form: Form) => void;
  className?: string;
}

export function FormBuilder({
  initialForm,
  onFormSaved,
  onFormPublished,
  className,
}: FormBuilderProps) {
  // Form state
  const [form, setForm] = useState<Form | null>(initialForm || null);
  const [fields, setFields] = useState<FormField[]>(initialForm?.fields || []);
  // UI state
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showFormSettings, setShowFormSettings] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const router = useRouter();

  // Initialize form if not provided
  useEffect(() => {
    if (!form) {
      setForm({
        id: "",
        user_id: "",
        title: "Untitled Form",
        description: "",
        settings: {},
        is_published: false,
        password_protected: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  }, [form]); // Track unsaved changes
  useEffect(() => {
    // Mark as unsaved if:
    // 1. Form has an ID and there are changes, OR
    // 2. Form doesn't have an ID (new form with content)
    if (
      form &&
      (form.id || fields.length > 0 || form.title !== "Untitled Form")
    ) {
      setHasUnsavedChanges(true);
    }
  }, [form, fields]);

  // Form operations
  const updateForm = useCallback((updates: Partial<Form>) => {
    setForm((prev) => (prev ? { ...prev, ...updates } : null));
  }, []);

  const addField = useCallback(
    (fieldData: Partial<FormField>, insertIndex?: number) => {
      const newField: FormField = {
        id: `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        form_id: form?.id || "",
        field_type: fieldData.field_type || "text",
        label: fieldData.label || `New ${fieldData.field_type || "text"} field`,
        placeholder: fieldData.placeholder,
        options: fieldData.options || [],
        required: fieldData.required || false,
        field_order: insertIndex ?? fields.length,
        validation_rules: fieldData.validation_rules || {},
        conditional_logic: fieldData.conditional_logic || {},
        created_at: new Date().toISOString(),
      };

      setFields((prev) => {
        const newFields = [...prev];
        if (insertIndex !== undefined) {
          newFields.splice(insertIndex, 0, newField);
          // Update field_order for subsequent fields
          return newFields.map((field, index) => ({
            ...field,
            field_order: index,
          }));
        } else {
          return [...newFields, newField];
        }
      });

      setSelectedField(newField.id);
      toast.success("Field added successfully");
    },
    [form?.id, fields]
  );

  const updateField = useCallback(
    (fieldId: string, updates: Partial<FormField>) => {
      setFields((prev) =>
        prev.map((field) =>
          field.id === fieldId ? { ...field, ...updates } : field
        )
      );
    },
    []
  );

  const deleteField = useCallback(
    (fieldId: string) => {
      setFields((prev) => prev.filter((field) => field.id !== fieldId));
      if (selectedField === fieldId) {
        setSelectedField(null);
      }
      toast.success("Field deleted");
    },
    [selectedField]
  );

  const moveField = useCallback((fromIndex: number, toIndex: number) => {
    setFields((prev) => {
      const newFields = [...prev];
      const [movedField] = newFields.splice(fromIndex, 1);
      newFields.splice(toIndex, 0, movedField);

      // Update field_order for all fields
      return newFields.map((field, index) => ({
        ...field,
        field_order: index,
      }));
    });
  }, []);

  const duplicateField = useCallback(
    (fieldId: string) => {
      const fieldToDuplicate = fields.find((f) => f.id === fieldId);
      if (fieldToDuplicate) {
        const duplicatedField: FormField = {
          ...fieldToDuplicate,
          id: `field-${Date.now()}`,
          label: `${fieldToDuplicate.label} (Copy)`,
          field_order: fieldToDuplicate.field_order + 1,
        };

        setFields((prev) => {
          const newFields = [...prev];
          const insertIndex = fieldToDuplicate.field_order + 1;
          newFields.splice(insertIndex, 0, duplicatedField);

          // Update field_order for subsequent fields
          return newFields.map((field, index) => ({
            ...field,
            field_order: index,
          }));
        });

        setSelectedField(duplicatedField.id);
        toast.success("Field duplicated");
      }
    },
    [fields]
  ); // Save functionality
  const handleSave = useCallback(async () => {
    if (!form) return;

    setIsSaving(true);
    try {
      if (form.id && form.id !== "") {
        // Update existing form
        const updatedForm = await formService.updateForm(form.id, {
          form,
          fields,
        });
        setForm(updatedForm.form);
        onFormSaved?.(updatedForm.form);
      } else {
        // Create new form
        const newForm = await formService.createForm({
          form,
          fields,
        });
        setForm(newForm.form);
        onFormSaved?.(newForm.form);
        // Update URL to edit mode after creation
        if (typeof window !== "undefined") {
          window.history.replaceState(
            null,
            "",
            `/dashboard/forms/${newForm.form.id}`
          );
        }
      }
      setHasUnsavedChanges(false);
      toast.success("Form saved successfully");
    } catch (error) {
      toast.error("Failed to save form");
      console.error("Save error:", error);
    } finally {
      setIsSaving(false);
    }
  }, [form, fields, onFormSaved]);

  // Auto-save functionality - only for existing forms and less aggressive
  useEffect(() => {
    if (!hasUnsavedChanges || !form?.id) return;

    const autoSaveTimeout = setTimeout(() => {
      if (form?.id) {
        // Only auto-save existing forms
        handleSave();
      }
    }, 5000); // Auto-save after 5 seconds of inactivity

    return () => clearTimeout(autoSaveTimeout);
  }, [hasUnsavedChanges, handleSave, form?.id]);
  const handlePublish = useCallback(async () => {
    if (!form) return;

    try {
      let currentForm = form;

      // Save first if there are unsaved changes or if form doesn't have an ID
      if (!form.id || hasUnsavedChanges) {
        setIsSaving(true);
        if (form.id && form.id !== "") {
          // Update existing form
          const updatedForm = await formService.updateForm(form.id, {
            form,
            fields,
          });
          currentForm = updatedForm.form;
          setForm(currentForm);
        } else {
          // Create new form
          const newForm = await formService.createForm({
            form,
            fields,
          });
          currentForm = newForm.form;
          setForm(currentForm);
          // Update URL to edit mode after creation
          if (typeof window !== "undefined") {
            window.history.replaceState(
              null,
              "",
              `/dashboard/forms/${newForm.form.id}`
            );
          }
        }
        setHasUnsavedChanges(false);
        setIsSaving(false);
      }

      if (!currentForm.id) {
        toast.error("Failed to save form before publishing");
        return;
      }

      // Now publish the form
      const publishedForm = await formService.updateForm(currentForm.id, {
        form: { ...currentForm, is_published: true },
        fields,
      });
      setForm(publishedForm.form);
      onFormPublished?.(publishedForm.form);
      toast.success("Form published successfully");
    } catch (error) {
      toast.error("Failed to publish form");
      console.error("Publish error:", error);
    } finally {
      setIsSaving(false);
    }
  }, [form, fields, onFormPublished, hasUnsavedChanges]);

  const handleShare = useCallback(async () => {
    if (!form?.share_url) return;

    const shareUrl = `${window.location.origin}/f/${form.share_url}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Form link copied to clipboard!");
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      console.error("Failed to copy to clipboard:", error);
      toast.error("Failed to copy link");
    }
  }, [form?.share_url]);

  const handleTitleEdit = useCallback(
    (newTitle: string) => {
      if (form) {
        updateForm({ title: newTitle });
        setEditingTitle(false);
      }
    },
    [form, updateForm]
  );
  const handleTitleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleTitleEdit((e.target as HTMLInputElement).value);
      } else if (e.key === "Escape") {
        setEditingTitle(false);
      }
    },
    [handleTitleEdit]
  );

  const selectedFieldData = selectedField
    ? fields.find((f) => f.id === selectedField) || null
    : null;

  return (
    <div className={cn("h-screen bg-[#FAFAFA]", className)}>
      {/* Header */}
      <div className="h-16 bg-white border-b border-[#E5E5E5] px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 shadow-none"
            onClick={() => router.push("/dashboard")}
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>{" "}
          <div className="flex items-center gap-3">
            {editingTitle ? (
              <Input
                defaultValue={form?.title || "Untitled Form"}
                onBlur={(e) => handleTitleEdit(e.target.value)}
                onKeyDown={handleTitleKeyDown}
                className="text-xl font-semibold h-8 border-none shadow-none p-0 focus-visible:ring-0"
                autoFocus
              />
            ) : (
              <h1
                className="text-xl font-semibold text-[#2D2D2D] cursor-pointer hover:text-[#4A4A4A] transition-colors"
                onClick={() => setEditingTitle(true)}
                title="Click to edit title"
              >
                {form?.title || "Untitled Form"}
              </h1>
            )}
            {hasUnsavedChanges && (
              <Badge
                variant="secondary"
                className="bg-yellow-100 text-yellow-800"
              >
                Unsaved
              </Badge>
            )}
            {form?.is_published && (
              <Badge className="bg-green-100 text-green-800 border-green-200">
                Published
              </Badge>
            )}
          </div>
        </div>{" "}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFormSettings(true)}
            className="gap-2 shadow-none"
          >
            <Settings className="w-4 h-4" />
            Form Settings
          </Button>{" "}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={isSaving || (!!form?.id && !hasUnsavedChanges)}
            className="gap-2 shadow-none"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSaving ? "Saving..." : "Save"}
          </Button>{" "}
          {form?.is_published ? (
            <Button
              size="sm"
              onClick={handleShare}
              className="gap-2 shadow-none"
            >
              <Share className="w-4 h-4" />
              Share
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handlePublish}
              disabled={isSaving || !form}
              className="gap-2 shadow-none"
            >
              <Eye className="w-4 h-4" />
              Publish
            </Button>
          )}
        </div>
      </div>
      {/* Main Content */}
      <div className="h-[calc(100vh-4rem)]">
        <ResizablePanelGroup direction="horizontal">
          {/* Field Palette */}{" "}
          <ResizablePanel
            className="bg-white"
            defaultSize={20}
            minSize={15}
            maxSize={25}
          >
            <FieldPalette onFieldAdd={addField} />
          </ResizablePanel>
          <ResizableHandle withHandle />
          {/* Form Canvas */}
          <ResizablePanel defaultSize={selectedField ? 50 : 80} minSize={40}>
            <FormCanvas
              className="bg-neutral-50 h-full"
              form={form}
              fields={fields}
              selectedField={selectedField}
              onFieldSelect={setSelectedField}
              onFieldAdd={addField}
              onFieldUpdate={updateField}
              onFieldDelete={deleteField}
              onFieldMove={moveField}
              previewMode={previewMode}
              onPreviewToggle={() => setPreviewMode(!previewMode)}
            />
          </ResizablePanel>
          {/* Field Settings Panel */}
          {selectedField && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel
                className="bg-white"
                defaultSize={30}
                minSize={25}
                maxSize={35}
              >
                <FieldSettingsPanel
                  field={selectedFieldData}
                  onUpdate={(updates) =>
                    selectedField && updateField(selectedField, updates)
                  }
                  onClose={() => setSelectedField(null)}
                />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>
      {/* Form Settings Modal */}
      {showFormSettings && form && (
        <FormSettingsPanel
          form={form}
          onUpdate={updateForm}
          onClose={() => setShowFormSettings(false)}
        />
      )}{" "}
    </div>
  );
}
