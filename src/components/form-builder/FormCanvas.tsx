// filepath: c:\preett\coding\work\ikiform\src\components\form-builder\FormCanvas.tsx
// Form Builder Canvas - Main form editing area
"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Form, FormField } from "@/lib/types/forms";
import { FormFieldRenderer } from "./FormFieldRenderer";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Smartphone, Monitor, Tablet } from "lucide-react";

interface FormCanvasProps {
  form: Form | null;
  fields: FormField[];
  selectedField: string | null;
  onFieldSelect: (fieldId: string) => void;
  onFieldAdd: (field: Partial<FormField>, insertIndex?: number) => void;
  onFieldUpdate: (fieldId: string, updates: Partial<FormField>) => void;
  onFieldDelete: (fieldId: string) => void;
  onFieldMove: (fromIndex: number, toIndex: number) => void;
  previewMode: boolean;
  onPreviewToggle: () => void;
  className?: string;
}

type ViewportMode = "desktop" | "tablet" | "mobile";

export function FormCanvas({
  form,
  fields,
  selectedField,
  onFieldSelect,
  onFieldAdd,
  onFieldUpdate,
  onFieldDelete,
  onFieldMove,
  previewMode,
  onPreviewToggle,
  className,
}: FormCanvasProps) {
  const [viewportMode, setViewportMode] = useState<ViewportMode>("desktop");

  const getViewportClasses = () => {
    switch (viewportMode) {
      case "mobile":
        return "max-w-sm";
      case "tablet":
        return "max-w-2xl";
      default:
        return "max-w-4xl";
    }
  };

  return (
    <div className={cn("flex-1 flex flex-col", className)}>
      {/* Canvas Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#E5E5E5] bg-white">
        <div className="flex items-center gap-3">
          <h2 className="font-semibold text-[#2D2D2D]">
            {form?.title || "Untitled Form"}
          </h2>
          {form?.is_published && (
            <Badge
              variant="default"
              className="bg-green-100 text-green-800 border-green-200"
            >
              Published
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Viewport Controls */}
          <div className="flex items-center bg-neutral-50 rounded-lg p-1">
            {(["desktop", "tablet", "mobile"] as ViewportMode[]).map((mode) => {
              const Icon =
                mode === "desktop"
                  ? Monitor
                  : mode === "tablet"
                    ? Tablet
                    : Smartphone;
              return (
                <Button
                  key={mode}
                  variant={viewportMode === mode ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewportMode(mode)}
                  className={cn(
                    "h-8 w-8 p-0 shadow-none",
                    viewportMode === mode
                      ? "bg-[#2D2D2D] text-white"
                      : "text-[#717171] hover:text-[#2D2D2D] hover:bg-[#F5F5F5]"
                  )}
                >
                  <Icon className="w-4 h-4" />
                </Button>
              );
            })}
          </div>

          {/* Preview Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={onPreviewToggle}
            className={cn(
              "gap-2 shadow-none border-[#E5E5E5]",
              previewMode
                ? "bg-[#2D2D2D] text-white hover:bg-[#1A1A1A]"
                : "border-[#E5E5E5] text-[#2D2D2D] hover:bg-[#F5F5F5]"
            )}
          >
            {previewMode ? (
              <>
                <EyeOff className="w-4 h-4" />
                Edit
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                Preview
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Canvas Content */}
      <div className="flex-1 overflow-auto bg-white p-8">
        <div
          className={cn(
            "mx-auto transition-all duration-300",
            getViewportClasses()
          )}
        >
          <Card className="border-0 bg-neutral-50">
            <CardHeader className="space-y-4 p-8">
              {!previewMode && (
                <div className="flex items-center gap-2 text-sm text-[#717171]">
                  <div className="w-2 h-2 rounded-full bg-[#2D2D2D]" />
                  Form Header
                </div>
              )}
              {form?.title && (
                <h1 className="text-2xl font-bold text-[#2D2D2D]">
                  {form.title}
                </h1>
              )}
              {form?.description && (
                <p className="text-[#717171] leading-relaxed">
                  {form.description}
                </p>
              )}
            </CardHeader>

            <CardContent className="space-y-4">
              {fields.length === 0 ? (
                <div className="min-h-32 border-2 border-dashed rounded-lg flex items-center justify-center bg-[#FAFAFA] border-[#E5E5E5]">
                  <div className="text-center text-[#717171] pointer-events-none">
                    <p className="font-medium">Start building your form</p>
                    <p className="text-sm mt-1">
                      Click on field types in the palette to add them to your
                      form
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {fields.map((field) => (
                    <FormFieldRenderer
                      key={field.id}
                      field={field}
                      isSelected={selectedField === field.id}
                      onSelect={() => onFieldSelect(field.id)}
                      onUpdate={(updates) => onFieldUpdate(field.id, updates)}
                      onDelete={() => onFieldDelete(field.id)}
                      previewMode={previewMode}
                    />
                  ))}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
