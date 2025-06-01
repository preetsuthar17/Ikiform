"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  formatDistanceToNow,
  format,
  isAfter,
  isBefore,
  startOfDay,
  endOfDay,
} from "date-fns";
import {
  useForm,
  useFormAnalytics,
  useFormResponses,
} from "@/lib/hooks/useForms";
import { formService } from "@/lib/services/formService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "react-hot-toast";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Eye,
  Users,
  Clock,
  TrendingUp,
  Download,
  Share,
  BarChart3,
  Calendar,
  Search,
  Filter,
  ChevronDown,
  ExternalLink,
  CalendarIcon,
  Smartphone,
  Monitor,
  Tablet,
  X,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DayPicker, getDefaultClassNames } from "react-day-picker";
import "react-day-picker/dist/style.css";

// Utility function to detect device type from user agent
const getDeviceType = (
  userAgent: string
): "Mobile" | "Desktop" | "Tablet" | "Unknown" => {
  if (!userAgent || userAgent === "unknown") return "Unknown";

  const ua = userAgent.toLowerCase();

  // Check for mobile first
  if (
    ua.includes("mobile") ||
    ua.includes("android") ||
    ua.includes("iphone")
  ) {
    return "Mobile";
  }

  // Check for tablet
  if (ua.includes("tablet") || ua.includes("ipad")) {
    return "Tablet";
  }

  // Check for desktop indicators
  if (
    ua.includes("windows") ||
    ua.includes("macintosh") ||
    ua.includes("linux")
  ) {
    return "Desktop";
  }
  // Default to Desktop for unknown cases
  return "Desktop";
};

export default function FormAnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.formId as string;

  const { form, loading: formLoading } = useForm(formId);
  const { analytics, loading: analyticsLoading } = useFormAnalytics(formId);
  const { responses, loading: responsesLoading } = useFormResponses(formId);

  useEffect(() => {
    if (responses && responses.length > 0) {
      // Analytics page has loaded with responses
    }
  }, [responses]);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "email" | "completion_time">(
    "date"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [deviceFilter, setDeviceFilter] = useState<
    "All" | "Mobile" | "Desktop" | "Tablet" | "Unknown"
  >("All");

  const [isExportingCSV, setIsExportingCSV] = useState(false);
  const [isExportingJSON, setIsExportingJSON] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const filteredAndSortedResponses = responses
    ? responses
        .filter((response) => {
          const searchTerm = searchQuery.toLowerCase();
          const emailMatch = response.respondent_email
            ?.toLowerCase()
            .includes(searchTerm);
          const dataMatch = Object.values(response.response_data).some(
            (value) => String(value).toLowerCase().includes(searchTerm)
          );
          const idMatch = response.id.toLowerCase().includes(searchTerm);
          const searchMatches =
            !searchQuery || emailMatch || dataMatch || idMatch;

          const submissionDate = new Date(response.submitted_at);
          const dateMatches =
            (!dateFrom ||
              isAfter(submissionDate, startOfDay(dateFrom)) ||
              submissionDate.toDateString() === dateFrom.toDateString()) &&
            (!dateTo ||
              isBefore(submissionDate, endOfDay(dateTo)) ||
              submissionDate.toDateString() === dateTo.toDateString());

          const deviceType = getDeviceType(response.user_agent || "");
          const deviceMatches =
            deviceFilter === "All" || deviceType === deviceFilter;

          return searchMatches && dateMatches && deviceMatches;
        })
        .sort((a, b) => {
          let comparison = 0;
          switch (sortBy) {
            case "date":
              comparison =
                new Date(a.submitted_at).getTime() -
                new Date(b.submitted_at).getTime();
              break;
            case "email":
              comparison = (a.respondent_email || "").localeCompare(
                b.respondent_email || ""
              );
              break;
            case "completion_time":
              comparison = (a.completion_time || 0) - (b.completion_time || 0);
              break;
          }
          return sortOrder === "asc" ? comparison : -comparison;
        })
    : [];

  const clearAllFilters = () => {
    setSearchQuery("");
    setDateFrom(undefined);
    setDateTo(undefined);
    setDeviceFilter("All");
  };

  const hasActiveFilters =
    searchQuery || dateFrom || dateTo || deviceFilter !== "All";

  const handleExportData = async (format: "csv" | "json") => {
    const isCSV = format === "csv";
    const setLoading = isCSV ? setIsExportingCSV : setIsExportingJSON;

    try {
      setLoading(true);
      const blob = await formService.exportFormData(formId, format);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${form?.title || "form"}_responses.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`Data exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error("Failed to export data");
    } finally {
      setLoading(false);
    }
  };

  const handleShareForm = async () => {
    if (!form?.share_url) {
      toast.error("Form must be published to share");
      return;
    }

    try {
      setIsSharing(true);
      const shareUrl = `${window.location.origin}/f/${form.share_url}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Share link copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy share link");
    } finally {
      setIsSharing(false);
    }
  };

  if (formLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Form Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The form you're looking for doesn't exist.
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

  const loading = analyticsLoading || responsesLoading;
  const defaultClassNames = getDefaultClassNames();

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard/forms")}
          className="gap-2 self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Forms
        </Button>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#2D2D2D] break-words">
              {form.title}
            </h1>
            <p className="text-[#717171] mt-1">Form Analytics & Insights</p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Badge
              variant={form.is_published ? "default" : "secondary"}
              className={form.is_published ? "bg-green-100 text-green-800" : ""}
            >
              {form.is_published ? "Published" : "Draft"}
            </Badge>

            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              {form.is_published && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShareForm}
                  disabled={isSharing}
                  className="gap-2 w-full sm:w-auto"
                >
                  <Share className="w-4 h-4" />
                  {isSharing ? "Copied!" : "Share"}
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                asChild
                className="gap-2 w-full sm:w-auto"
              >
                <Link href={`/dashboard/forms/${formId}`}>
                  <BarChart3 className="w-4 h-4" />
                  Edit Form
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>{" "}
      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <Card className="bg-neutral-50 border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#717171] flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Total Views
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-[#2D2D2D]">
                {analytics?.views || 0}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="bg-neutral-50 border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#717171] flex items-center gap-2">
              <Users className="w-4 h-4" />
              Submissions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-[#2D2D2D]">
                {filteredAndSortedResponses?.length || 0}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="bg-neutral-50 border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#717171] flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Conversion Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-[#2D2D2D]">
                {analytics?.conversion_rate
                  ? `${analytics.conversion_rate.toFixed(1)}%`
                  : "0%"}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="bg-neutral-50 border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#717171] flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Avg. Completion
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-[#2D2D2D]">
                {analytics?.average_completion_time
                  ? `${Math.round(analytics.average_completion_time)}s`
                  : "0s"}
              </div>
            )}
          </CardContent>
        </Card>{" "}
      </div>
      {/* Simple Response Summary */}
      {responses && responses.length > 0 && (
        <Card className="mb-8 bg-neutral-50 border-0">
          <CardHeader>
            <CardTitle>Response Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-[#717171] mb-4">
                A summary of all form submissions showing submission IDs and
                response data.
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {responses.map((response) => (
                  <div key={response.id} className="rounded-2xl p-4 bg-white">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[#2D2D2D]">
                          Submission ID:
                        </span>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                          {response.id}
                        </code>
                      </div>
                      <span className="text-xs text-[#717171]">
                        {format(
                          new Date(response.submitted_at),
                          "MMM dd, yyyy HH:mm"
                        )}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-[#2D2D2D] mb-2">
                        Response Data:
                      </h4>
                      {Object.keys(response.response_data).length > 0 ? (
                        <div className="space-y-2">
                          {Object.entries(response.response_data).map(
                            ([key, value]) => (
                              <div
                                key={key}
                                className="flex flex-col sm:flex-row sm:items-start gap-2 text-sm"
                              >
                                <span className="font-medium text-[#2D2D2D] min-w-0 sm:min-w-[150px]">
                                  {key}:
                                </span>
                                <span className="text-[#717171] break-words flex-1">
                                  {typeof value === "object"
                                    ? JSON.stringify(value, null, 2)
                                    : String(value) || "(empty)"}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-[#717171] italic">
                          No response data
                        </p>
                      )}
                    </div>

                    {response.respondent_email && (
                      <div className="mt-3 pt-3 border-t">
                        <span className="text-xs text-[#717171]">
                          Submitted by: {response.respondent_email}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Submissions Table */}
      <Card className="mb-8 bg-neutral-50 border-0">
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <CardTitle>All Submissions</CardTitle>
              <Badge variant="outline">
                {filteredAndSortedResponses?.length || 0} of{" "}
                {responses?.length || 0}
              </Badge>
            </div>{" "}
            {responses && responses.length > 0 && (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1 min-w-0">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-[#717171]" />
                    <Input
                      placeholder="Search submissions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 w-full shadow-none bg-white"
                    />
                  </div>

                  {/* Date Range Filter */}
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="default"
                          className="gap-2 w-full sm:w-auto justify-start"
                        >
                          <CalendarIcon className="w-4 h-4" />
                          {dateFrom ? format(dateFrom, "MMM dd") : "From"}
                        </Button>
                      </PopoverTrigger>{" "}
                      <PopoverContent className="w-auto p-0" align="start">
                        <DayPicker
                          mode="single"
                          selected={dateFrom}
                          onSelect={setDateFrom}
                          disabled={(date) => date > new Date()}
                          showOutsideDays
                          className="p-3 grayscale-100 rounded-xl border-0 shadow-none text-sm "
                        />
                      </PopoverContent>
                    </Popover>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="default"
                          className="gap-2 w-full sm:w-auto justify-start"
                        >
                          <CalendarIcon className="w-4 h-4" />
                          {dateTo ? format(dateTo, "MMM dd") : "To"}
                        </Button>
                      </PopoverTrigger>{" "}
                      <PopoverContent className="w-auto p-0" align="start">
                        <DayPicker
                          mode="single"
                          selected={dateTo}
                          onSelect={setDateTo}
                          disabled={(date) =>
                            date > new Date() ||
                            Boolean(dateFrom && date < dateFrom)
                          }
                          showOutsideDays
                          className="p-3 grayscale-100 rounded-xl border-0 shadow-none text-sm "
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Device Filter */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="default"
                        className="gap-2 w-full sm:w-auto"
                      >
                        {deviceFilter === "Mobile" && (
                          <Smartphone className="w-4 h-4" />
                        )}
                        {deviceFilter === "Desktop" && (
                          <Monitor className="w-4 h-4" />
                        )}
                        {deviceFilter === "Tablet" && (
                          <Tablet className="w-4 h-4" />
                        )}
                        {deviceFilter === "All" && (
                          <Filter className="w-4 h-4" />
                        )}
                        {deviceFilter === "Unknown" && (
                          <Filter className="w-4 h-4" />
                        )}
                        {deviceFilter === "All" ? "All Devices" : deviceFilter}
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setDeviceFilter("All")}>
                        <Filter className="w-4 h-4 mr-2 " />
                        All Devices
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeviceFilter("Mobile")}
                      >
                        <Smartphone className="w-4 h-4 mr-2" />
                        Mobile
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeviceFilter("Desktop")}
                      >
                        <Monitor className="w-4 h-4 mr-2" />
                        Desktop
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeviceFilter("Tablet")}
                      >
                        <Tablet className="w-4 h-4 mr-2" />
                        Tablet
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeviceFilter("Unknown")}
                      >
                        <Filter className="w-4 h-4 mr-2" />
                        Unknown
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Sort Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="default"
                        className="gap-2 w-full sm:w-auto"
                      >
                        <Filter className="w-4 h-4" />
                        Sort
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setSortBy("date");
                          setSortOrder("desc");
                        }}
                      >
                        Latest First
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSortBy("date");
                          setSortOrder("asc");
                        }}
                      >
                        Oldest First
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSortBy("email");
                          setSortOrder("asc");
                        }}
                      >
                        Email A-Z
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSortBy("completion_time");
                          setSortOrder("asc");
                        }}
                      >
                        Fastest First
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSortBy("completion_time");
                          setSortOrder("desc");
                        }}
                      >
                        Slowest First
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Active Filters Display */}
                {hasActiveFilters && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-[#717171]">
                      Active filters:
                    </span>

                    {searchQuery && (
                      <Badge variant="secondary" className="gap-1">
                        Search: {searchQuery}
                        <button
                          onClick={() => setSearchQuery("")}
                          className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}

                    {dateFrom && (
                      <Badge variant="secondary" className="gap-1">
                        From: {format(dateFrom, "MMM dd")}
                        <button
                          onClick={() => setDateFrom(undefined)}
                          className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}

                    {dateTo && (
                      <Badge variant="secondary" className="gap-1">
                        To: {format(dateTo, "MMM dd")}
                        <button
                          onClick={() => setDateTo(undefined)}
                          className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}

                    {deviceFilter !== "All" && (
                      <Badge variant="secondary" className="gap-1">
                        Device: {deviceFilter}
                        <button
                          onClick={() => setDeviceFilter("All")}
                          className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="text-[#717171] hover:text-[#2D2D2D] p-1 h-auto"
                    >
                      Clear all
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          {loading ? (
            <div className="space-y-3 px-6 sm:px-0">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          ) : filteredAndSortedResponses &&
            filteredAndSortedResponses.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[120px]">
                      Submission ID
                    </TableHead>
                    <TableHead className="min-w-[100px]">Submitted</TableHead>
                    <TableHead className="min-w-[80px]">Device</TableHead>
                    <TableHead className="min-w-[100px]">
                      Completion Time
                    </TableHead>
                    <TableHead className="min-w-[150px]">
                      Response Data
                    </TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedResponses.map((response) => (
                    <TableRow key={response.id}>
                      <TableCell className="font-mono text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <Link
                            href={`/dashboard/forms/${formId}/submissions/${response.id}`}
                            className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer truncate"
                          >
                            {response.id.slice(0, 8)}...
                          </Link>
                          <ExternalLink className="w-3 h-3" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm whitespace-nowrap">
                            {format(
                              new Date(response.submitted_at),
                              "MMM dd, yyyy"
                            )}
                          </span>
                          <span className="text-xs text-[#717171] whitespace-nowrap">
                            {format(new Date(response.submitted_at), "HH:mm")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {(() => {
                            const deviceType = getDeviceType(
                              response.user_agent || ""
                            );
                            switch (deviceType) {
                              case "Mobile":
                                return (
                                  <Smartphone className="w-4 h-4 text-blue-600" />
                                );
                              case "Desktop":
                                return (
                                  <Monitor className="w-4 h-4 text-green-600" />
                                );
                              case "Tablet":
                                return (
                                  <Tablet className="w-4 h-4 text-purple-600" />
                                );
                              default:
                                return (
                                  <Filter className="w-4 h-4 text-gray-400" />
                                );
                            }
                          })()}
                          <span className="text-sm">
                            {getDeviceType(response.user_agent || "")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {response.completion_time ? (
                          <span className="text-sm whitespace-nowrap">
                            {Math.round(response.completion_time)}s
                          </span>
                        ) : (
                          <span className="text-[#717171]">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px] lg:max-w-xs">
                          {Object.keys(response.response_data).length > 0 ? (
                            <details className="cursor-pointer">
                              <summary className="text-sm text-blue-600 hover:text-blue-800">
                                {Object.keys(response.response_data).length}{" "}
                                field(s)
                              </summary>
                              <div className="mt-2 space-y-1 text-xs max-h-40 overflow-y-auto">
                                {Object.entries(response.response_data).map(
                                  ([key, value]) => (
                                    <div
                                      key={key}
                                      className="border-l-2 border-gray-200 pl-2"
                                    >
                                      <span className="font-medium text-[#2D2D2D] break-words">
                                        {key}:
                                      </span>
                                      <span className="ml-1 text-[#717171] break-words">
                                        {typeof value === "object"
                                          ? JSON.stringify(value)
                                          : String(value).length > 50
                                            ? String(value).slice(0, 50) + "..."
                                            : String(value)}
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            </details>
                          ) : (
                            <span className="text-[#717171] italic">
                              No data
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <ChevronDown className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                const data = JSON.stringify(response, null, 2);
                                navigator.clipboard.writeText(data);
                                toast.success("Response data copied!");
                              }}
                            >
                              Copy JSON
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                const csv = Object.entries(
                                  response.response_data
                                )
                                  .map(([key, value]) => `"${key}","${value}"`)
                                  .join("\n");
                                navigator.clipboard.writeText(csv);
                                toast.success("Response CSV copied!");
                              }}
                            >
                              Copy as CSV
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : responses && responses.length > 0 && searchQuery ? (
            <div className="text-center py-12 px-6 sm:px-0">
              <Search className="w-12 h-12 text-[#717171] mx-auto mb-3" />
              <h3 className="text-lg font-medium text-[#2D2D2D] mb-2">
                No matching submissions
              </h3>
              <p className="text-[#717171] mb-4">
                Try adjusting your search criteria
              </p>
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                Clear Search
              </Button>
            </div>
          ) : (
            <div className="text-center py-12 px-6 sm:px-0">
              <Users className="w-12 h-12 text-[#717171] mx-auto mb-3" />
              <h3 className="text-lg font-medium text-[#2D2D2D] mb-2">
                No submissions yet
              </h3>
              <p className="text-[#717171] mb-6">
                Share your form to start collecting responses
              </p>{" "}
              {form.is_published && form.share_url && (
                <Button
                  onClick={handleShareForm}
                  disabled={isSharing}
                  className="gap-2"
                >
                  <Share className="w-4 h-4" />
                  {isSharing ? "Copied!" : "Copy Share Link"}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <Card className="bg-neutral-50 border-0">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Activity</span>
              <Badge variant="outline">
                {analytics?.recent_submissions || 0} this week
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20 mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            ) : responses && responses.length > 0 ? (
              <div className="space-y-3">
                {responses.slice(0, 5).map((response) => (
                  <div
                    key={response.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#2D2D2D]">
                        New submission
                      </p>
                      <p className="text-xs text-[#717171]">
                        {formatDistanceToNow(new Date(response.submitted_at))}{" "}
                        ago
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-[#717171] mx-auto mb-3" />
                <p className="text-[#717171]">No submissions yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-neutral-50 border-0">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Export Data</span>
              <Calendar className="w-5 h-5 text-[#717171]" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-[#717171] mb-4">
                Download your form responses and analytics data in various
                formats.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleExportData("csv")}
                  className="gap-2 w-full"
                  disabled={
                    !responses || responses.length === 0 || isExportingCSV
                  }
                >
                  <Download className="w-4 h-4" />
                  {isExportingCSV ? "Exporting..." : "Export CSV"}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleExportData("json")}
                  className="gap-2 w-full"
                  disabled={
                    !responses || responses.length === 0 || isExportingJSON
                  }
                >
                  <Download className="w-4 h-4" />
                  {isExportingJSON ? "Exporting..." : "Export JSON"}
                </Button>
              </div>
              {responses && responses.length > 0 && (
                <div className="text-xs text-[#717171] mt-3">
                  Last export: {format(new Date(), "MMM dd, yyyy")}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Form Details */}
      <Card className="mt-8 bg-neutral-50 border-0">
        <CardHeader>
          <CardTitle>Form Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-[#2D2D2D] mb-2">Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#717171]">Created:</span>
                  <span className="text-right">
                    {format(new Date(form.created_at), "MMM dd, yyyy")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#717171]">Last Updated:</span>
                  <span className="text-right">
                    {format(new Date(form.updated_at), "MMM dd, yyyy")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#717171]">Fields:</span>
                  <span>{form.form_fields?.length || 0}</span>
                </div>
              </div>
            </div>

            {form.is_published && form.share_url && (
              <div>
                <h4 className="font-medium text-[#2D2D2D] mb-2">Share</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-[#717171] block mb-1">
                      Public URL:
                    </span>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <code className="flex-1 px-2 py-1 bg-gray-100 rounded text-sm break-all min-w-0 font-jetbrains-mono text-center items-center flex">
                        {`${window.location.origin}/f/${form.share_url}`}
                      </code>{" "}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleShareForm}
                        disabled={isSharing}
                        className="w-full sm:w-auto flex-shrink-0"
                      >
                        <Share className="w-4 h-4" />
                        {isSharing ? "Copied!" : ""}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
