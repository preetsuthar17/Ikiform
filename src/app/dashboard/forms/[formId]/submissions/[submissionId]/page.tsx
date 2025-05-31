"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  ArrowLeft,
  Copy,
  Download,
  Eye,
  Clock,
  MapPin,
  Monitor,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useForm } from "@/lib/hooks/useForms";
import { createClient } from "@/lib/supabase/client";

interface FormResponse {
  id: string;
  form_id: string;
  respondent_email: string | null;
  response_data: Record<string, any>;
  ip_address: string;
  user_agent: string;
  completion_time: number | null;
  submitted_at: string;
}

interface FormField {
  id: string;
  label: string;
  type: string;
  required: boolean;
  options?: string[];
}

export default function SubmissionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.formId as string;
  const submissionId = params.submissionId as string;

  const { form, loading: formLoading } = useForm(formId);
  const [submission, setSubmission] = useState<FormResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    async function fetchSubmission() {
      try {
        const supabase = createClient();

        console.log("🔍 Fetching submission with:", { formId, submissionId });
        console.log(
          "🔍 Type check - formId:",
          typeof formId,
          "submissionId:",
          typeof submissionId
        );

        // First, let's try to get all submissions for this form to see what's available
        console.log("🔍 First, checking all submissions for this form...");
        const { data: allSubmissions, error: allError } = await supabase
          .from("form_responses")
          .select("id, form_id, submitted_at")
          .eq("form_id", formId);

        console.log("📊 All submissions for form:", allSubmissions);
        console.log("📊 All submissions error:", allError);

        // Now try to fetch the specific submission
        console.log("🔍 Now fetching specific submission...");
        const { data, error } = await supabase
          .from("form_responses")
          .select("*")
          .eq("id", submissionId)
          .eq("form_id", formId)
          .maybeSingle();

        console.log("📊 Specific submission query result:", { data, error });

        // Also try without the form_id constraint to see if the submission exists at all
        console.log(
          "🔍 Trying to fetch submission without form_id constraint..."
        );
        const { data: submissionOnly, error: submissionOnlyError } =
          await supabase
            .from("form_responses")
            .select("*")
            .eq("id", submissionId)
            .maybeSingle();

        console.log("📊 Submission-only query result:", {
          data: submissionOnly,
          error: submissionOnlyError,
        });

        if (error) {
          throw error;
        }

        if (!data) {
          throw new Error("Submission not found");
        }

        setSubmission(data);
      } catch (err) {
        console.error("Error fetching submission:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch submission"
        );
      } finally {
        setLoading(false);
      }
    }

    if (formId && submissionId) {
      fetchSubmission();
    }
  }, [formId, submissionId]);

  const handleCopyId = () => {
    navigator.clipboard.writeText(submissionId);
    toast.success("Submission ID copied to clipboard!");
  };

  const handleCopyResponse = () => {
    if (submission) {
      navigator.clipboard.writeText(JSON.stringify(submission, null, 2));
      toast.success("Response data copied to clipboard!");
    }
  };

  const handleExportSubmission = () => {
    if (submission && form) {
      const exportData = {
        submission_id: submission.id,
        form_title: form.title,
        submitted_at: submission.submitted_at,
        respondent_email: submission.respondent_email,
        completion_time: submission.completion_time,
        ip_address: submission.ip_address,
        response_data: submission.response_data,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `submission_${submission.id.slice(0, 8)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Submission exported successfully!");
    }
  };

  const getFieldLabel = (fieldId: string): string => {
    const field = form?.form_fields?.find((f: FormField) => f.id === fieldId);
    return field?.label || fieldId;
  };

  const getFieldType = (fieldId: string): string => {
    const field = form?.form_fields?.find((f: FormField) => f.id === fieldId);
    return field?.type || "text";
  };

  const formatFieldValue = (value: any, fieldType: string): React.ReactNode => {
    if (value === null || value === undefined) {
      return <span className="text-[#717171] italic">No response</span>;
    }

    // Handle objects (including file uploads, complex selections, etc.)
    if (typeof value === "object") {
      if (Array.isArray(value)) {
        if (value.length === 0) {
          return <span className="text-[#717171] italic">No selections</span>;
        }
        return (
          <div className="space-y-1">
            {value.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                <span>{String(item)}</span>
              </div>
            ))}
          </div>
        );
      }

      // Handle file upload objects
      if (value.name && value.size) {
        return (
          <div className="bg-gray-50 p-3 rounded border">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                📎
              </div>
              <div>
                <div className="font-medium">{value.name}</div>
                <div className="text-xs text-[#717171]">
                  {(value.size / 1024).toFixed(1)} KB
                </div>
              </div>
            </div>
            {value.url && (
              <a
                href={value.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                View file
              </a>
            )}
          </div>
        );
      }

      // Handle other objects
      return (
        <div className="bg-gray-50 p-3 rounded border">
          <details className="cursor-pointer">
            <summary className="text-sm font-medium text-[#2D2D2D] mb-2">
              View object data
            </summary>
            <pre className="text-xs text-[#717171] whitespace-pre-wrap overflow-x-auto">
              {JSON.stringify(value, null, 2)}
            </pre>
          </details>
        </div>
      );
    }

    // Handle booleans
    if (typeof value === "boolean" || fieldType === "checkbox") {
      return (
        <span
          className={`font-medium ${value ? "text-green-600" : "text-red-600"}`}
        >
          {value ? "✓ Yes" : "✗ No"}
        </span>
      );
    }

    // Handle URLs
    if (
      fieldType === "url" &&
      typeof value === "string" &&
      value.startsWith("http")
    ) {
      return (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline break-all"
        >
          {value}
        </a>
      );
    }

    // Handle emails
    if (fieldType === "email" && typeof value === "string") {
      return (
        <a
          href={`mailto:${value}`}
          className="text-blue-600 hover:underline break-all"
        >
          {value}
        </a>
      );
    }

    // Handle phone numbers
    if (fieldType === "phone" || fieldType === "tel") {
      return (
        <a href={`tel:${value}`} className="text-blue-600 hover:underline">
          {String(value)}
        </a>
      );
    }

    // Handle long text
    const stringValue = String(value);
    if (stringValue.length > 200) {
      return (
        <div className="space-y-2">
          <div className="max-h-32 overflow-y-auto p-2 bg-gray-50 rounded border">
            <div className="whitespace-pre-wrap break-words">{stringValue}</div>
          </div>
          <div className="text-xs text-[#717171]">
            {stringValue.length} characters
          </div>
        </div>
      );
    }

    // Default: return as string with proper line breaks
    return <div className="whitespace-pre-wrap break-words">{stringValue}</div>;
  };

  if (formLoading || loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-neutral-50 border-0 shadow-none">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i}>
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-6 w-full" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <div>
            <Card className="bg-neutral-50 border-0 shadow-none">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Submission Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            {error || "The submission you're looking for doesn't exist."}
          </p>
          <Button
            onClick={() => router.push(`/dashboard/forms/${formId}/analytics`)}
            className="gap-2 shadow-none"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Analytics
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-start flex-col gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/dashboard/forms/${formId}/analytics`)}
            className="gap-2 shadow-none"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Analytics
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-[#2D2D2D]">
              Submission Details
            </h1>
            <p className="text-[#717171] text-sm">
              {form?.title} •{" "}
              {format(
                new Date(submission.submitted_at),
                "MMM dd, yyyy 'at' HH:mm"
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyId}
            className="gap-2 shadow-none"
          >
            <Copy className="w-4 h-4" />
            Copy ID
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyResponse}
            className="gap-2 shadow-none"
          >
            <Copy className="w-4 h-4" />
            Copy Data
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportSubmission}
            className="gap-2 shadow-none"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Response Data */}
        <div className="lg:col-span-2">
          <Card className="bg-neutral-50 border-0 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Response Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(submission.response_data).length > 0 ? (
                  Object.entries(submission.response_data).map(
                    ([fieldId, value], index) => (
                      <div key={fieldId}>
                        <div className="space-y-2">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <label className="font-medium text-[#2D2D2D] break-words">
                              {getFieldLabel(fieldId)}
                            </label>
                            <Badge
                              variant="outline"
                              className="text-xs self-start sm:self-center"
                            >
                              {getFieldType(fieldId)}
                            </Badge>
                          </div>
                          <div className="p-3 bg-white rounded-lg border min-h-[44px] flex items-start">
                            <div className="w-full">
                              {formatFieldValue(value, getFieldType(fieldId))}
                            </div>
                          </div>
                        </div>
                        {index <
                          Object.entries(submission.response_data).length -
                            1 && <Separator className="mt-6" />}
                      </div>
                    )
                  )
                ) : (
                  <div className="text-center py-8">
                    <Eye className="w-12 h-12 text-[#717171] mx-auto mb-3" />
                    <p className="text-[#717171]">No response data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Submission Metadata */}
        <div className="space-y-6">
          {/* Submission Info */}
          <Card className="bg-neutral-50 border-0 shadow-none">
            <CardHeader>
              <CardTitle>Submission Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-[#717171] text-sm">ID:</span>
                  <div className="text-right">
                    <div className="font-mono text-xs text-[#2D2D2D]">
                      {submission.id}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-[#717171] text-sm">Submitted:</span>
                  <div className="text-right text-sm">
                    <div>
                      {format(
                        new Date(submission.submitted_at),
                        "MMM dd, yyyy"
                      )}
                    </div>
                    <div className="text-xs text-[#717171]">
                      {format(new Date(submission.submitted_at), "HH:mm:ss")}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-[#717171] text-sm">Email:</span>
                  <span className="text-sm">
                    {submission.respondent_email || (
                      <span className="italic text-[#717171]">Anonymous</span>
                    )}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-[#717171] text-sm flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Completion:
                  </span>
                  <span className="text-sm">
                    {submission.completion_time
                      ? `${submission.completion_time}s`
                      : "N/A"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technical Details */}
          <Card className="bg-neutral-50 border-0 shadow-none">
            <CardHeader>
              <CardTitle>Technical Details</CardTitle>
            </CardHeader>
            <CardContent>
              {" "}
              <div className="space-y-3">
                <div>
                  <div className="flex items-center gap-1 text-[#717171] text-sm mb-1">
                    <MapPin className="w-3 h-3" />
                    IP Address:
                  </div>
                  <div className="font-mono text-xs bg-gray-50 p-2 rounded">
                    {submission.ip_address}
                    {submission.ip_address.includes("localhost") && (
                      <div className="text-[#717171] mt-1 font-normal">
                        Development environment
                      </div>
                    )}
                    {submission.ip_address === "::1" && (
                      <div className="text-[#717171] mt-1 font-normal">
                        IPv6 localhost (::1)
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1 text-[#717171] text-sm mb-1">
                    <Monitor className="w-3 h-3" />
                    User Agent:
                  </div>
                  <div className="font-mono text-xs bg-gray-50 p-2 rounded break-all">
                    {submission.user_agent}
                    {submission.user_agent.includes("(dev)") && (
                      <div className="text-[#717171] mt-1 font-normal">
                        Development mode
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Details */}
          {form && (
            <Card className="bg-neutral-50 border-0 shadow-none">
              <CardHeader>
                <CardTitle>Form Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[#717171] text-sm">Form:</span>
                    <span className="text-sm font-medium">{form.title}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-[#717171] text-sm">Fields:</span>
                    <span className="text-sm">
                      {form.form_fields?.length || 0}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-[#717171] text-sm">Status:</span>
                    <Badge
                      variant={form.is_published ? "default" : "secondary"}
                    >
                      {form.is_published ? "Published" : "Draft"}
                    </Badge>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-4 shadow-none"
                    onClick={() => router.push(`/dashboard/forms/${formId}`)}
                  >
                    View Form
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
