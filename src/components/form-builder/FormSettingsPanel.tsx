// Form Settings Panel - Configure form-level properties
"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Form, FormSettings } from "@/lib/types/forms";
import { cn } from "@/lib/utils";
import {
  Palette,
  Bell,
  Shield,
  Zap,
  Eye,
  Lock,
  Globe,
  Mail,
  Webhook,
  Timer,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface FormSettingsPanelProps {
  form: Form;
  onUpdate: (updates: Partial<Form>) => void;
  onClose: () => void;
}

export function FormSettingsPanel({
  form,
  onUpdate,
  onClose,
}: FormSettingsPanelProps) {
  const [localForm, setLocalForm] = useState(form);
  const [isDirty, setIsDirty] = useState(false);
  const [isCopyingUrl, setIsCopyingUrl] = useState(false);

  useEffect(() => {
    setLocalForm(form);
    setIsDirty(false);
  }, [form]);

  const updateLocalForm = (updates: Partial<Form>) => {
    setLocalForm((prev) => ({ ...prev, ...updates }));
    setIsDirty(true);
  };

  const updateSettings = (settingsUpdate: Partial<FormSettings>) => {
    const newSettings = { ...localForm.settings, ...settingsUpdate };
    updateLocalForm({ settings: newSettings });
  };

  const handleSave = () => {
    onUpdate(localForm);
    setIsDirty(false);
  };
  const handleCancel = () => {
    if (isDirty) {
      if (
        confirm("You have unsaved changes. Are you sure you want to close?")
      ) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const handleCopyUrl = async () => {
    if (!localForm.share_url) return;

    setIsCopyingUrl(true);
    try {
      const shareUrl = `${window.location.origin}/f/${localForm.share_url}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Share URL copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy URL:", error);
      toast.error("Failed to copy URL");
    } finally {
      setIsCopyingUrl(false);
    }
  };

  return (
    <Dialog open onOpenChange={handleCancel}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-white">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-semibold">
            Form Settings
          </DialogTitle>
          <DialogDescription>
            Configure your form's appearance, behavior, and security settings.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="p-6">
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="design">Design</TabsTrigger>
                <TabsTrigger value="behavior">Behavior</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="flex flex-col gap-6 mt-6">
                <Card className="shadow-none border-none bg-neutral-50 rounded-2xl flex flex-col gap-8">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      Basic Information
                    </CardTitle>
                    <CardDescription>
                      Set your form's title and description that users will see.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <div className="flex flex-col gap-4">
                      <Label htmlFor="form-title">Form Title *</Label>
                      <Input
                        className="bg-white shadow-none py-5 rounded-xl border"
                        id="form-title"
                        value={localForm.title}
                        onChange={(e) =>
                          updateLocalForm({ title: e.target.value })
                        }
                        placeholder="Enter form title..."
                      />
                    </div>

                    <div className="flex flex-col gap-4">
                      <Label htmlFor="form-description">Description</Label>
                      <Textarea
                        className="bg-white shadow-none rounded-xl border-0"
                        id="form-description"
                        value={localForm.description || ""}
                        onChange={(e) =>
                          updateLocalForm({ description: e.target.value })
                        }
                        placeholder="Briefly describe what this form is for..."
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-none border-none bg-neutral-50 rounded-2xl flex flex-col gap-8">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      Sharing & Access
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Form Status</Label>
                        <p className="text-sm text-[#717171]">
                          Published forms can be accessed by anyone with the
                          link
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            localForm.is_published ? "default" : "secondary"
                          }
                        >
                          {localForm.is_published ? "Published" : "Draft"}
                        </Badge>
                        <Switch
                          checked={localForm.is_published}
                          onCheckedChange={(is_published) =>
                            updateLocalForm({ is_published })
                          }
                        />
                      </div>
                    </div>

                    {localForm.share_url && (
                      <div className="flex flex-col gap-4">
                        <Label>Share URL</Label>{" "}
                        <div className="flex gap-2">
                          <Input
                            className="bg-white shadow-none py-5 rounded-xl border"
                            value={`${window.location.origin}/f/${localForm.share_url}`}
                            readOnly
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCopyUrl}
                            disabled={isCopyingUrl}
                          >
                            {isCopyingUrl ? "Copied!" : "Copy"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="design" className="flex flex-col gap-6 mt-6">
                <Card className="shadow-none border-none bg-neutral-50 rounded-2xl flex flex-col gap-8">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="w-5 h-5" />
                      Theme & Appearance
                    </CardTitle>
                    <CardDescription>
                      Customize your form's visual appearance.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <div className="flex flex-col gap-4">
                      <Label>Primary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          className="bg-white shadow-none py-5 rounded-xl border w-20 h-10 p-1"
                          type="color"
                          value={
                            localForm.settings.theme?.primaryColor || "#2D2D2D"
                          }
                          onChange={(e) =>
                            updateSettings({
                              theme: {
                                ...localForm.settings.theme,
                                primaryColor: e.target.value,
                              },
                            })
                          }
                        />
                        <Input
                          className="bg-white shadow-none py-5 rounded-xl border"
                          value={
                            localForm.settings.theme?.primaryColor || "#2D2D2D"
                          }
                          onChange={(e) =>
                            updateSettings({
                              theme: {
                                ...localForm.settings.theme,
                                primaryColor: e.target.value,
                              },
                            })
                          }
                          placeholder="#2D2D2D"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      <Label>Background Color</Label>
                      <div className="flex gap-2">
                        <Input
                          className="bg-white shadow-none py-5 rounded-xl border w-20 h-10 p-1"
                          type="color"
                          value={
                            localForm.settings.theme?.backgroundColor ||
                            "#FFFFFF"
                          }
                          onChange={(e) =>
                            updateSettings({
                              theme: {
                                ...localForm.settings.theme,
                                backgroundColor: e.target.value,
                              },
                            })
                          }
                        />
                        <Input
                          className="bg-white shadow-none py-5 rounded-xl border"
                          value={
                            localForm.settings.theme?.backgroundColor ||
                            "#FFFFFF"
                          }
                          onChange={(e) =>
                            updateSettings({
                              theme: {
                                ...localForm.settings.theme,
                                backgroundColor: e.target.value,
                              },
                            })
                          }
                          placeholder="#FFFFFF"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      <Label>Font Family</Label>
                      <Select
                        value={localForm.settings.theme?.fontFamily || "system"}
                        onValueChange={(fontFamily) =>
                          updateSettings({
                            theme: {
                              ...localForm.settings.theme,
                              fontFamily,
                            },
                          })
                        }
                      >
                        <SelectTrigger className="shadow-none bg-white rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="shadow-none bg-white rounded-xl">
                          <SelectItem value="system">System Default</SelectItem>
                          <SelectItem value="inter">Inter</SelectItem>
                          <SelectItem value="roboto">Roboto</SelectItem>
                          <SelectItem value="opensans">Open Sans</SelectItem>
                          <SelectItem value="lato">Lato</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-4">
                      <Label>Spacing</Label>
                      <Select
                        value={localForm.settings.theme?.spacing || "normal"}
                        onValueChange={(spacing) =>
                          updateSettings({
                            theme: {
                              ...localForm.settings.theme,
                              spacing: spacing as
                                | "compact"
                                | "normal"
                                | "spacious",
                            },
                          })
                        }
                      >
                        <SelectTrigger className="shadow-none bg-white rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="shadow-none bg-white rounded-xl">
                          <SelectItem value="compact">Compact</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="spacious">Spacious</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent
                value="behavior"
                className="flex flex-col gap-6 mt-6"
              >
                <Card className="shadow-none border-none bg-neutral-50 rounded-2xl flex flex-col gap-8">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Form Behavior
                    </CardTitle>
                    <CardDescription>
                      Configure how your form behaves and what happens after
                      submission.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Show Progress Bar</Label>
                        <p className="text-sm text-[#717171]">
                          Display progress to users as they fill out the form
                        </p>
                      </div>
                      <Switch
                        checked={
                          localForm.settings.behavior?.showProgressBar || false
                        }
                        onCheckedChange={(showProgressBar) =>
                          updateSettings({
                            behavior: {
                              ...localForm.settings.behavior,
                              showProgressBar,
                            },
                          })
                        }
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Allow Multiple Submissions</Label>
                        <p className="text-sm text-[#717171]">
                          Allow users to submit the form multiple times
                        </p>
                      </div>
                      <Switch
                        checked={
                          localForm.settings.behavior
                            ?.allowMultipleSubmissions || false
                        }
                        onCheckedChange={(allowMultipleSubmissions) =>
                          updateSettings({
                            behavior: {
                              ...localForm.settings.behavior,
                              allowMultipleSubmissions,
                            },
                          })
                        }
                      />
                    </div>

                    <Separator />

                    <div className="flex flex-col gap-4">
                      <Label>Redirect URL (After Submission)</Label>
                      <Input
                        className="bg-white shadow-none py-5 rounded-xl border"
                        value={localForm.settings.behavior?.redirectUrl || ""}
                        onChange={(e) =>
                          updateSettings({
                            behavior: {
                              ...localForm.settings.behavior,
                              redirectUrl: e.target.value,
                            },
                          })
                        }
                        placeholder="https://example.com/thank-you"
                      />
                    </div>

                    <div className="flex flex-col gap-4">
                      <Label>Custom Success Message</Label>
                      <Textarea
                        value={
                          localForm.settings.behavior?.customSuccessMessage ||
                          ""
                        }
                        onChange={(e) =>
                          updateSettings({
                            behavior: {
                              ...localForm.settings.behavior,
                              customSuccessMessage: e.target.value,
                            },
                          })
                        }
                        placeholder="Thank you for your submission!"
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent
                value="notifications"
                className="flex flex-col gap-6 mt-6"
              >
                <Card className="shadow-none border-none bg-neutral-50 rounded-2xl flex flex-col gap-8">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="w-5 h-5" />
                      Notifications
                    </CardTitle>
                    <CardDescription>
                      Set up notifications for new form submissions.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <div className="flex flex-col gap-4">
                      <Label className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email Notifications
                      </Label>
                      <Input
                        className="bg-white shadow-none py-5 rounded-xl border"
                        value={localForm.settings.notifications?.email || ""}
                        onChange={(e) =>
                          updateSettings({
                            notifications: {
                              ...localForm.settings.notifications,
                              email: e.target.value,
                            },
                          })
                        }
                        placeholder="admin@example.com"
                        type="email"
                      />
                      <p className="text-sm text-[#717171]">
                        Receive an email for each new submission
                      </p>
                    </div>

                    <div className="flex flex-col gap-4">
                      <Label className="flex items-center gap-2">
                        <Webhook className="w-4 h-4" />
                        Webhook URL
                      </Label>
                      <Input
                        className="bg-white shadow-none py-5 rounded-xl border"
                        value={localForm.settings.notifications?.webhook || ""}
                        onChange={(e) =>
                          updateSettings({
                            notifications: {
                              ...localForm.settings.notifications,
                              webhook: e.target.value,
                            },
                          })
                        }
                        placeholder="https://your-app.com/webhook"
                        type="url"
                      />
                      <p className="text-sm text-[#717171]">
                        Send form data to your application via HTTP POST
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent
                value="security"
                className="flex flex-col gap-6 mt-6"
              >
                <Card className="shadow-none border-none bg-neutral-50 rounded-2xl flex flex-col gap-8">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Security & Protection
                    </CardTitle>
                    <CardDescription>
                      Protect your form from spam and unauthorized access.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          Password Protection
                        </Label>
                        <p className="text-sm text-[#717171]">
                          Require a password to access this form
                        </p>
                      </div>
                      <Switch
                        checked={localForm.password_protected}
                        onCheckedChange={(password_protected) =>
                          updateLocalForm({ password_protected })
                        }
                      />
                    </div>

                    {localForm.password_protected && (
                      <div className="flex flex-col gap-4 ml-6">
                        <Label>Password</Label>
                        <Input
                          className="bg-white shadow-none py-5 rounded-xl border"
                          type="password"
                          placeholder="Enter form password..."
                        />
                      </div>
                    )}

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Enable CAPTCHA</Label>
                        <p className="text-sm text-[#717171]">
                          Add CAPTCHA verification to prevent spam
                        </p>
                      </div>
                      <Switch
                        checked={localForm.settings.security?.captcha || false}
                        onCheckedChange={(captcha) =>
                          updateSettings({
                            security: {
                              ...localForm.settings.security,
                              captcha,
                            },
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>IP Address Limiting</Label>
                        <p className="text-sm text-[#717171]">
                          Prevent multiple submissions from the same IP
                        </p>
                      </div>
                      <Switch
                        checked={
                          localForm.settings.security?.ipLimiting || false
                        }
                        onCheckedChange={(ipLimiting) =>
                          updateSettings({
                            security: {
                              ...localForm.settings.security,
                              ipLimiting,
                            },
                          })
                        }
                      />
                    </div>

                    <div className="flex flex-col gap-4">
                      <Label className="flex items-center gap-2">
                        <Timer className="w-4 h-4" />
                        Time Limit (minutes)
                      </Label>
                      <Input
                        className="bg-white shadow-none py-5 rounded-xl border"
                        type="number"
                        value={localForm.settings.security?.timeLimit || ""}
                        onChange={(e) =>
                          updateSettings({
                            security: {
                              ...localForm.settings.security,
                              timeLimit: parseInt(e.target.value) || undefined,
                            },
                          })
                        }
                        placeholder="30"
                        min="1"
                        max="1440"
                      />
                      <p className="text-sm text-[#717171]">
                        Maximum time allowed to complete the form (leave empty
                        for no limit)
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>

        <div className="flex items-center justify-between p-6 border-t border-[#E5E5E5]">
          <div className="text-sm text-[#717171]">
            {isDirty && "You have unsaved changes"}
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!isDirty}>
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
