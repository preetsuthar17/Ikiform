// filepath: src/app/f/[shareUrl]/page.tsx
// Public Form View - Form submission page for end users
"use client";

import { useParams } from "next/navigation";
import { useState, useCallback, useEffect, use } from "react";
import { usePublicForm } from "@/lib/hooks/useForms";
import { PublicFormFieldRenderer } from "@/components/forms/PublicFormFieldRenderer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "react-hot-toast";
import { Eye, EyeOff, Lock, Send, CheckCircle } from "lucide-react";
import { FormField } from "@/lib/types/forms";
import {
  FileUploadService,
  UploadedFile,
} from "@/lib/services/fileUploadService";
import { SubmissionService } from "@/lib/services/submissionService";
import { useRouter } from "next/navigation";

export default function PublicFormPage() {
  const params = useParams();
  const shareUrl = params.shareUrl as string;

  const { form, loading, error, submitForm } = usePublicForm(shareUrl);
  const [responses, setResponses] = useState<{ [fieldId: string]: any }>({});
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    [fieldId: string]: string;
  }>({});
  const [startTime] = useState(Date.now());
  const router = useRouter();

  useEffect(() => {
    router.refresh();
    if (!shareUrl) {
      router.push("/");
    }
  }, [shareUrl, router]);
  // Track form view when component mounts
  useEffect(() => {
    if (form?.id) {
      // Track form view for analytics using the service
      SubmissionService.trackFormView(form.id).catch((error) => {
        console.error("Failed to track form view:", error);
      });
    }
  }, [form?.id]);

  const handleFieldChange = useCallback(
    (fieldId: string, value: any) => {
      setResponses((prev) => ({ ...prev, [fieldId]: value }));
      // Clear validation error when user starts typing
      if (validationErrors[fieldId]) {
        setValidationErrors((prev) => ({ ...prev, [fieldId]: "" }));
      }
    },
    [validationErrors]
  );
  const validateForm = () => {
    if (!form) return false;

    const errors: { [fieldId: string]: string } = {};
    let isValid = true;

    form.form_fields.forEach((field) => {
      const value = responses[field.id];

      // Check required fields
      if (field.required) {
        if (field.field_type === "file") {
          // File fields need special handling - check if files array is empty
          if (!value || !Array.isArray(value) || value.length === 0) {
            errors[field.id] = `${field.label} is required`;
            isValid = false;
          }
        } else {
          // Regular fields
          if (!value || value === "") {
            errors[field.id] = `${field.label} is required`;
            isValid = false;
          }
        }
      }

      // Skip validation if field is empty and not required
      if (!value && !field.required) return;

      // Field-specific validation
      switch (field.field_type) {
        case "email":
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (value && !emailRegex.test(value)) {
            errors[field.id] = "Please enter a valid email address";
            isValid = false;
          }
          break;

        case "number":
          if (value && isNaN(Number(value))) {
            errors[field.id] = "Please enter a valid number";
            isValid = false;
          }
          break;

        case "url":
          try {
            if (value) new URL(value);
          } catch {
            errors[field.id] = "Please enter a valid URL";
            isValid = false;
          }
          break;

        case "phone":
          const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
          if (value && !phoneRegex.test(value.replace(/[\s\-\(\)]/g, ""))) {
            errors[field.id] = "Please enter a valid phone number";
            isValid = false;
          }
          break;

        case "file":
          // File field validation
          if (value && Array.isArray(value)) {
            const rules = field.validation_rules;

            // Check file count limits
            if (rules?.maxFiles && value.length > rules.maxFiles) {
              errors[field.id] = `Maximum ${rules.maxFiles} files allowed`;
              isValid = false;
            }

            // Check individual file constraints
            for (const file of value) {
              if (rules?.maxSize && file.size > rules.maxSize) {
                errors[field.id] =
                  `File "${file.name}" exceeds maximum size limit`;
                isValid = false;
                break;
              }

              if (rules?.allowedTypes && rules.allowedTypes.length > 0) {
                const fileType =
                  file.type || file.name.split(".").pop()?.toLowerCase();
                if (
                  !rules.allowedTypes.some(
                    (type) =>
                      fileType?.includes(type) ||
                      file.name.toLowerCase().endsWith(`.${type}`)
                  )
                ) {
                  errors[field.id] = `File type not allowed for "${file.name}"`;
                  isValid = false;
                  break;
                }
              }
            }
          }
          break;
      }

      // Custom validation rules for non-file fields
      if (field.validation_rules && value && field.field_type !== "file") {
        const rules = field.validation_rules;

        if (rules.minLength && value.length < rules.minLength) {
          errors[field.id] = `Must be at least ${rules.minLength} characters`;
          isValid = false;
        }

        if (rules.maxLength && value.length > rules.maxLength) {
          errors[field.id] =
            `Must be no more than ${rules.maxLength} characters`;
          isValid = false;
        }

        if (rules.pattern && !new RegExp(rules.pattern).test(value)) {
          errors[field.id] = rules.patternError || "Invalid format";
          isValid = false;
        }

        if (rules.min && Number(value) < rules.min) {
          errors[field.id] = `Must be at least ${rules.min}`;
          isValid = false;
        }

        if (rules.max && Number(value) > rules.max) {
          errors[field.id] = `Must be no more than ${rules.max}`;
          isValid = false;
        }
      }
    });

    setValidationErrors(errors);
    return isValid;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form || !validateForm()) {
      toast.error("Please fix the errors and try again");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare file uploads data
      const fileUploads: Array<{ fieldId: string; files: UploadedFile[] }> = [];
      const processedResponses = { ...responses };

      for (const field of form.form_fields) {
        if (field.field_type === "file" && responses[field.id]) {
          const files = responses[field.id] as UploadedFile[];
          if (files && files.length > 0) {
            fileUploads.push({
              fieldId: field.id,
              files: files,
            });

            // Store file references in response data
            processedResponses[field.id] = files.map((file) => ({
              id: file.id,
              name: file.name,
              size: file.size,
              type: file.type,
              url: file.url,
            }));
          }
        }
      }

      const completionTime = Math.round((Date.now() - startTime) / 1000);

      // Submit via public form API endpoint
      const response = await fetch(`/api/forms/public/${shareUrl}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          responses: processedResponses,
          metadata: {
            completion_time: completionTime,
            password: form.password_protected ? password : undefined,
            fileUploads,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit form");
      }

      setIsSubmitted(true);
      toast.success("Form submitted successfully!");
    } catch (error: any) {
      if (error.message.includes("password")) {
        toast.error("Invalid password");
      } else if (error.message.includes("Missing required fields")) {
        toast.error("Please fill in all required fields");
      } else {
        toast.error("Failed to submit form. Please try again.");
        console.error("Form submission error:", error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent className="space-y-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            {error || "Form Not Found"}
          </h2>
          <p className="text-gray-600">
            {error ||
              "The form you're looking for doesn't exist or is no longer available."}
          </p>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#2D2D2D] mb-2">
              Thank You!
            </h2>
            <p className="text-[#717171]">
              Your response has been submitted successfully.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold text-[#2D2D2D]">
                {form.title}
              </CardTitle>
              {form.password_protected && (
                <Badge variant="outline" className="gap-1">
                  <Lock className="w-3 h-3" />
                  Protected
                </Badge>
              )}
            </div>
            {form.description && (
              <p className="text-[#717171] mt-2">{form.description}</p>
            )}
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Password field for protected forms */}
              {form.password_protected && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#2D2D2D]">
                    Password *
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter form password"
                      required
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Form fields */}
              {form.form_fields.map((field) => (
                <div key={field.id} className="space-y-2">
                  {/* Only render label for regular fields, not section/divider */}
                  {field.field_type !== "section" &&
                    field.field_type !== "divider" && (
                      <label className="text-sm font-medium text-[#2D2D2D] flex items-center gap-1">
                        {field.label}
                        {field.required && (
                          <span className="text-red-500">*</span>
                        )}
                      </label>
                    )}
                  <PublicFormFieldRenderer
                    field={field}
                    value={responses[field.id]}
                    onChange={(value: any) =>
                      handleFieldChange(field.id, value)
                    }
                    error={validationErrors[field.id]}
                  />

                  {validationErrors[field.id] && (
                    <p className="text-sm text-red-600">
                      {validationErrors[field.id]}
                    </p>
                  )}
                </div>
              ))}

              {/* Submit button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full gap-2"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
