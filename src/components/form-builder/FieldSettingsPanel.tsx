// Field Settings Panel - Configure selected field properties
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { FormField, FormFieldOption, ValidationRules } from "@/lib/types/forms";
import { cn } from "@/lib/utils";
import {
  Plus,
  Trash2,
  GripVertical,
  Settings,
  Eye,
  Zap,
  AlertCircle,
  Crown,
} from "lucide-react";
// Premium system imports
import { usePremium } from "@/lib/premium";
import { PremiumGate } from "@/components/premium/PremiumComponents";

interface FieldSettingsPanelProps {
  field: FormField | null;
  onUpdate: (updates: Partial<FormField>) => void;
  onClose: () => void;
  className?: string;
}

export function FieldSettingsPanel({
  field,
  onUpdate,
  onClose,
  className,
}: FieldSettingsPanelProps) {
  const [localField, setLocalField] = useState<FormField | null>(field);
  const { hasFeature } = usePremium();

  useEffect(() => {
    setLocalField(field);
  }, [field]);

  if (!localField) {
    return (
      <Card className={cn("h-full", className)}>
        <CardContent className="flex items-center justify-center h-full text-center">
          <div className="space-y-2">
            <Settings className="w-8 h-8 text-[#717171] mx-auto" />
            <p className="text-[#717171]">
              Select a field to edit its properties
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const updateLocalField = (updates: Partial<FormField>) => {
    const updated = { ...localField, ...updates };
    setLocalField(updated);
    onUpdate(updates);
  };

  const addOption = () => {
    const newOption: FormFieldOption = {
      id: `option-${Date.now()}`,
      label: `Option ${localField.options.length + 1}`,
      value: `option_${localField.options.length + 1}`,
    };
    updateLocalField({
      options: [...localField.options, newOption],
    });
  };

  const updateOption = (
    optionId: string,
    updates: Partial<FormFieldOption>,
  ) => {
    const updatedOptions = localField.options.map((option) =>
      option.id === optionId ? { ...option, ...updates } : option,
    );
    updateLocalField({ options: updatedOptions });
  };

  const removeOption = (optionId: string) => {
    const updatedOptions = localField.options.filter(
      (option) => option.id !== optionId,
    );
    updateLocalField({ options: updatedOptions });
  };

  const updateValidation = (key: keyof ValidationRules, value: any) => {
    updateLocalField({
      validation_rules: {
        ...localField.validation_rules,
        [key]: value,
      },
    });
  };

  const hasOptions = ["select", "radio", "checkbox"].includes(
    localField.field_type,
  );
  const hasValidation = !["section", "divider"].includes(localField.field_type);

  return (
    <Card className={cn("h-full m-4 bg-neutral-50 border-0", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-black/80">
            Field Settings
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 text-xl"
          >
            ×
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{localField.field_type}</Badge>
          <Badge variant={localField.required ? "default" : "secondary"}>
            {localField.required ? "Required" : "Optional"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-180px)]">
          <div className="p-4 space-y-6">
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="validation" disabled={!hasValidation}>
                  Validation
                </TabsTrigger>
                <TabsTrigger value="logic" className="flex items-center gap-2">
                  Logic
                  <Badge
                    variant="outline"
                    className="text-xs text-amber-600 border-amber-200 bg-amber-50"
                  >
                    <Crown className="w-3 h-3 mr-1" />
                    Pro
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4 mt-4">
                {/* Basic Properties */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="field-label">Field Label</Label>
                    <Input
                      className="bg-white shadow-none py-5 rounded-xl border"
                      id="field-label"
                      value={localField.label}
                      onChange={(e) =>
                        updateLocalField({ label: e.target.value })
                      }
                      placeholder="Enter field label..."
                    />
                  </div>

                  {localField.field_type !== "section" &&
                    localField.field_type !== "divider" && (
                      <div className="space-y-2">
                        <Label htmlFor="field-placeholder">Placeholder</Label>
                        <Input
                          className="bg-white shadow-none py-5 rounded-xl border"
                          id="field-placeholder"
                          value={localField.placeholder || ""}
                          onChange={(e) =>
                            updateLocalField({ placeholder: e.target.value })
                          }
                          placeholder="Enter placeholder text..."
                        />
                      </div>
                    )}

                  <div className="flex items-center justify-between">
                    <Label htmlFor="field-required">Required field</Label>
                    <Switch
                      className="shadow-none"
                      id="field-required"
                      checked={localField.required}
                      onCheckedChange={(required) =>
                        updateLocalField({ required })
                      }
                    />
                  </div>
                </div>

                {/* Options for multi-choice fields */}
                {hasOptions && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Options</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={addOption}
                          className="gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add Option
                        </Button>
                      </div>

                      <div className="space-y-2">
                        {localField.options.map((option, index) => (
                          <div
                            key={option.id}
                            className="flex items-center gap-2"
                          >
                            <div className="flex-1 grid grid-cols-2 gap-2">
                              <Input
                                className="bg-white shadow-none py-5 rounded-xl text-sm"
                                value={option.label}
                                onChange={(e) =>
                                  updateOption(option.id, {
                                    label: e.target.value,
                                  })
                                }
                                placeholder="Option label"
                              />
                              <Input
                                className="bg-white shadow-none py-5 rounded-xl text-sm"
                                value={option.value}
                                onChange={(e) =>
                                  updateOption(option.id, {
                                    value: e.target.value,
                                  })
                                }
                                placeholder="Option value"
                              />
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeOption(option.id)}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      {localField.options.length === 0 && (
                        <div className="text-center py-8 text-[#717171]">
                          <AlertCircle className="w-6 h-6 mx-auto mb-2" />
                          <p className="text-sm">No options added yet</p>
                          <p className="text-xs">
                            Click "Add Option" to get started
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="validation" className="space-y-4 mt-4">
                {/* Text/Number Validation */}
                {["text", "email", "textarea", "url", "phone"].includes(
                  localField.field_type,
                ) && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Min Length</Label>
                        <Input
                          className="bg-white shadow-none py-5 rounded-xl border"
                          type="number"
                          value={localField.validation_rules.minLength || ""}
                          onChange={(e) =>
                            updateValidation(
                              "minLength",
                              parseInt(e.target.value) || undefined,
                            )
                          }
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Max Length</Label>
                        <Input
                          className="bg-white shadow-none py-5 rounded-xl border"
                          type="number"
                          value={localField.validation_rules.maxLength || ""}
                          onChange={(e) =>
                            updateValidation(
                              "maxLength",
                              parseInt(e.target.value) || undefined,
                            )
                          }
                          placeholder="255"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Pattern (RegEx)</Label>
                      <Input
                        className="bg-white shadow-none py-5 rounded-xl border"
                        value={localField.validation_rules.pattern || ""}
                        onChange={(e) =>
                          updateValidation("pattern", e.target.value)
                        }
                        placeholder="^[a-zA-Z]+$"
                      />
                    </div>
                  </div>
                )}

                {/* Number/Rating/Slider Validation */}
                {["number", "rating", "slider"].includes(
                  localField.field_type,
                ) && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Minimum Value</Label>
                      <Input
                        className="bg-white shadow-none py-5 rounded-xl border"
                        type="number"
                        value={localField.validation_rules.min || ""}
                        onChange={(e) =>
                          updateValidation(
                            "min",
                            parseInt(e.target.value) || undefined,
                          )
                        }
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Maximum Value</Label>
                      <Input
                        className="bg-white shadow-none py-5 rounded-xl border"
                        type="number"
                        value={localField.validation_rules.max || ""}
                        onChange={(e) =>
                          updateValidation(
                            "max",
                            parseInt(e.target.value) || undefined,
                          )
                        }
                        placeholder="100"
                      />
                    </div>
                  </div>
                )}

                {/* File Upload Validation */}
                {localField.field_type === "file" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Allowed File Types</Label>
                      <Textarea
                        value={
                          localField.validation_rules.fileTypes?.join(", ") ||
                          ""
                        }
                        onChange={(e) =>
                          updateValidation(
                            "fileTypes",
                            e.target.value.split(",").map((t) => t.trim()),
                          )
                        }
                        placeholder="image/*, .pdf, .doc, .docx"
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Max File Size (MB)</Label>
                        <Input
                          className="bg-white shadow-none py-5 rounded-xl border"
                          type="number"
                          value={localField.validation_rules.maxFileSize || ""}
                          onChange={(e) =>
                            updateValidation(
                              "maxFileSize",
                              parseInt(e.target.value) || undefined,
                            )
                          }
                          placeholder="10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Max Files</Label>
                        <Input
                          className="bg-white shadow-none py-5 rounded-xl border"
                          type="number"
                          value={localField.validation_rules.maxFiles || ""}
                          onChange={(e) =>
                            updateValidation(
                              "maxFiles",
                              parseInt(e.target.value) || undefined,
                            )
                          }
                          placeholder="1"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="logic" className="space-y-4 mt-4">
                <PremiumGate
                  featureId="CONDITIONAL_LOGIC"
                  fallback={
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
                      <Zap className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">
                        Conditional Logic
                      </p>
                      <p className="text-xs text-gray-500 mb-4">
                        Upgrade to Pro to show/hide fields based on other field
                        values and create dynamic forms
                      </p>
                      <div className="text-xs text-gray-400">
                        • Show/hide fields conditionally
                        <br />
                        • Dynamic form branching
                        <br />• Complex field dependencies
                      </div>
                    </div>
                  }
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          Enable Conditional Logic
                        </Label>
                        <p className="text-sm text-[#717171]">
                          Show or hide this field based on other field values
                        </p>
                      </div>
                      <Switch
                        checked={
                          localField?.conditional_logic?.show !== undefined
                        }
                        onCheckedChange={(enabled) =>
                          updateLocalField({
                            conditional_logic: enabled
                              ? { show: true, conditions: [] }
                              : undefined,
                          })
                        }
                      />
                    </div>

                    {localField?.conditional_logic && (
                      <div className="space-y-4 ml-6 p-4 bg-gray-50 rounded-xl">
                        <div className="space-y-2">
                          <Label>
                            Show this field when conditions are met:
                          </Label>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">Show field:</span>
                            <Select
                              value={
                                localField.conditional_logic.show
                                  ? "true"
                                  : "false"
                              }
                              onValueChange={(value) =>
                                updateLocalField({
                                  conditional_logic: {
                                    ...localField.conditional_logic,
                                    show: value === "true",
                                  },
                                })
                              }
                            >
                              <SelectTrigger className="bg-white shadow-none rounded-xl w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="true">Show</SelectItem>
                                <SelectItem value="false">Hide</SelectItem>
                              </SelectContent>
                            </Select>
                            <span className="text-sm">
                              when conditions match
                            </span>
                          </div>
                        </div>

                        {localField.conditional_logic.conditions &&
                        localField.conditional_logic.conditions.length > 0 ? (
                          <div className="space-y-3">
                            {localField.conditional_logic.conditions.map(
                              (condition, index) => (
                                <div
                                  key={index}
                                  className="grid grid-cols-4 gap-2 p-3 bg-white rounded-lg border"
                                >
                                  <Select
                                    value={condition.field_id || ""}
                                    onValueChange={(field_id) => {
                                      const updatedConditions = [
                                        ...(localField.conditional_logic
                                          ?.conditions || []),
                                      ];
                                      updatedConditions[index] = {
                                        ...condition,
                                        field_id,
                                      };
                                      updateLocalField({
                                        conditional_logic: {
                                          ...localField.conditional_logic,
                                          conditions: updatedConditions,
                                        },
                                      });
                                    }}
                                  >
                                    <SelectTrigger className="bg-white shadow-none rounded-xl">
                                      <SelectValue placeholder="Field" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="field1">
                                        Field 1
                                      </SelectItem>
                                      <SelectItem value="field2">
                                        Field 2
                                      </SelectItem>
                                      <SelectItem value="field3">
                                        Field 3
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>

                                  <Select
                                    value={condition.operator}
                                    onValueChange={(operator: any) => {
                                      const updatedConditions = [
                                        ...(localField.conditional_logic
                                          ?.conditions || []),
                                      ];
                                      updatedConditions[index] = {
                                        ...condition,
                                        operator,
                                      };
                                      updateLocalField({
                                        conditional_logic: {
                                          ...localField.conditional_logic,
                                          conditions: updatedConditions,
                                        },
                                      });
                                    }}
                                  >
                                    <SelectTrigger className="bg-white shadow-none rounded-xl">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="equals">
                                        Equals
                                      </SelectItem>
                                      <SelectItem value="not_equals">
                                        Not equals
                                      </SelectItem>
                                      <SelectItem value="contains">
                                        Contains
                                      </SelectItem>
                                      <SelectItem value="greater_than">
                                        Greater than
                                      </SelectItem>
                                      <SelectItem value="less_than">
                                        Less than
                                      </SelectItem>
                                      <SelectItem value="is_empty">
                                        Is empty
                                      </SelectItem>
                                      <SelectItem value="is_not_empty">
                                        Is not empty
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>

                                  <Input
                                    className="bg-white shadow-none py-5 rounded-xl border"
                                    value={condition.value || ""}
                                    onChange={(e) => {
                                      const updatedConditions = [
                                        ...(localField.conditional_logic
                                          ?.conditions || []),
                                      ];
                                      updatedConditions[index] = {
                                        ...condition,
                                        value: e.target.value,
                                      };
                                      updateLocalField({
                                        conditional_logic: {
                                          ...localField.conditional_logic,
                                          conditions: updatedConditions,
                                        },
                                      });
                                    }}
                                    placeholder="Value"
                                  />

                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      const updatedConditions = (
                                        localField.conditional_logic
                                          ?.conditions || []
                                      ).filter((_, i) => i !== index);
                                      updateLocalField({
                                        conditional_logic: {
                                          ...localField.conditional_logic,
                                          conditions: updatedConditions,
                                        },
                                      });
                                    }}
                                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              ),
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-gray-500">
                            <p className="text-sm">No conditions set</p>
                          </div>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newCondition = {
                              field_id: "",
                              operator: "equals" as const,
                              value: "",
                            };
                            updateLocalField({
                              conditional_logic: {
                                ...localField.conditional_logic,
                                conditions: [
                                  ...(localField.conditional_logic
                                    ?.conditions || []),
                                  newCondition,
                                ],
                              },
                            });
                          }}
                          className="gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add Condition
                        </Button>

                        <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
                          <strong>Example:</strong> Show this field when "Email
                          Preferences" equals "Newsletter"
                        </div>
                      </div>
                    )}
                  </div>
                </PremiumGate>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
