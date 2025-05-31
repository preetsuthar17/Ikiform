// Public Form Field Renderer - Renders form fields for public form submissions
"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { FormField } from "@/lib/types/forms";
import { cn } from "@/lib/utils";
import { Star, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import FileUploadComponent from "@/components/ui/file-upload";

interface PublicFormFieldRendererProps {
  field: FormField;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

export function PublicFormFieldRenderer({
  field,
  value,
  onChange,
  error,
}: PublicFormFieldRendererProps) {
  const renderFieldContent = () => {
    switch (field.field_type) {
      case "text":
      case "email":
      case "url":
      case "phone":
        return (
          <Input
            placeholder={
              field.placeholder || `Enter ${field.label.toLowerCase()}...`
            }
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            type={
              field.field_type === "email"
                ? "email"
                : field.field_type === "url"
                  ? "url"
                  : "text"
            }
            className={error ? "border-red-500" : ""}
          />
        );

      case "number":
        return (
          <Input
            type="number"
            placeholder={field.placeholder || "Enter number..."}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            min={field.validation_rules?.min}
            max={field.validation_rules?.max}
            className={error ? "border-red-500" : ""}
          />
        );

      case "textarea":
        return (
          <Textarea
            placeholder={field.placeholder || "Enter your response..."}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className={cn("min-h-24", error ? "border-red-500" : "")}
          />
        );

      case "select":
        return (
          <Select value={value || ""} onValueChange={onChange}>
            <SelectTrigger className={error ? "border-red-500" : ""}>
              <SelectValue
                placeholder={field.placeholder || "Select an option..."}
              />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.id} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "radio":
        return (
          <RadioGroup value={value || ""} onValueChange={onChange}>
            {field.options?.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={option.id} />
                <Label htmlFor={option.id}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case "checkbox":
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  id={option.id}
                  checked={value?.includes && value.includes(option.value)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onChange([...(value || []), option.value]);
                    } else {
                      onChange(
                        (value || []).filter((v: string) => v !== option.value)
                      );
                    }
                  }}
                />
                <Label htmlFor={option.id}>{option.label}</Label>
              </div>
            ))}
          </div>
        );

      case "date":
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !value && "text-muted-foreground",
                  error && "border-red-500"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(new Date(value), "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={value ? new Date(value) : undefined}
                onSelect={(date) => onChange(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );
      case "file":
        return (
          <div className="space-y-2">
            <FileUploadComponent
              formId={field.form_id}
              fieldId={field.id}
              options={{
                maxFileSize: field.validation_rules?.maxSize,
                allowedTypes: field.validation_rules?.allowedTypes,
                maxFiles: field.validation_rules?.maxFiles,
              }}
              value={value}
              onChange={onChange}
              className={error ? "border-red-500" : ""}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        );

      case "rating":
        return (
          <div className="flex items-center gap-1">
            {Array.from(
              { length: field.validation_rules?.max || 5 },
              (_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-6 h-6 cursor-pointer transition-colors",
                    i < (value || 0)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300 hover:text-gray-400"
                  )}
                  onClick={() => onChange(i + 1)}
                />
              )
            )}
          </div>
        );

      case "slider":
        return (
          <div className="space-y-4">
            <Slider
              value={[value || field.validation_rules?.min || 0]}
              onValueChange={(values) => onChange(values[0])}
              min={field.validation_rules?.min || 0}
              max={field.validation_rules?.max || 100}
              step={1}
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>{field.validation_rules?.min || 0}</span>
              <span className="font-medium">
                {value || field.validation_rules?.min || 0}
              </span>
              <span>{field.validation_rules?.max || 100}</span>
            </div>
          </div>
        );

      default:
        return (
          <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center text-gray-500">
            Unsupported field type: {field.field_type}
          </div>
        );
    }
  };

  return <div className="w-full">{renderFieldContent()}</div>;
}
