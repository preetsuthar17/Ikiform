// Form Field Renderer - Renders individual form fields in the canvas
"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { FormField } from "@/lib/types/forms";
import { cn } from "@/lib/utils";
import {
  GripVertical,
  Edit,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Star,
  Upload,
  Calendar as CalendarIcon,
  Minus,
  ChevronUp,
  ChevronDown,
  Settings,
} from "lucide-react";
import { format } from "date-fns";
import FileUploadComponent from "@/components/ui/file-upload";
import { motion, AnimatePresence } from "framer-motion";
interface FormFieldRendererProps {
  field: FormField;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<FormField>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
  previewMode: boolean;
}

export function FormFieldRenderer({
  field,
  index,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  previewMode,
}: FormFieldRendererProps) {
  const [value, setValue] = useState<any>("");

  const handleInputChange = (newValue: any) => {
    setValue(newValue);
  };

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
            value={value}
            onChange={(e) => handleInputChange(e.target.value)}
            disabled={!previewMode}
            type={
              field.field_type === "email"
                ? "email"
                : field.field_type === "url"
                  ? "url"
                  : "text"
            }
          />
        );

      case "number":
        return (
          <Input
            type="number"
            placeholder={field.placeholder || "Enter number..."}
            value={value}
            onChange={(e) => handleInputChange(e.target.value)}
            disabled={!previewMode}
            min={field.validation_rules.min}
            max={field.validation_rules.max}
          />
        );

      case "textarea":
        return (
          <Textarea
            placeholder={field.placeholder || "Enter your response..."}
            value={value}
            onChange={(e) => handleInputChange(e.target.value)}
            disabled={!previewMode}
            className="min-h-24"
          />
        );

      case "select":
        return (
          <Select
            value={value}
            onValueChange={handleInputChange}
            disabled={!previewMode}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={field.placeholder || "Select an option..."}
              />
            </SelectTrigger>
            <SelectContent>
              {field.options.map((option) => (
                <SelectItem key={option.id} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "radio":
        return (
          <RadioGroup
            value={value}
            onValueChange={handleInputChange}
            disabled={!previewMode}
          >
            {field.options.map((option) => (
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
            {field.options.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  id={option.id}
                  checked={value.includes && value.includes(option.value)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleInputChange([...(value || []), option.value]);
                    } else {
                      handleInputChange(
                        (value || []).filter((v: string) => v !== option.value),
                      );
                    }
                  }}
                  disabled={!previewMode}
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
                )}
                disabled={!previewMode}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(value, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={value}
                onSelect={handleInputChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );
      case "file":
        return (
          <FileUploadComponent
            formId={field.form_id}
            fieldId={field.id}
            options={{
              maxFileSize: field.validation_rules.maxFileSize,
              allowedTypes: field.validation_rules.fileTypes,
              maxFiles: field.validation_rules.maxFiles,
            }}
            disabled={previewMode}
          />
        );

      case "rating":
        return (
          <div className="flex items-center gap-1">
            {Array.from({ length: field.validation_rules.max || 5 }, (_, i) => (
              <Star
                key={i}
                className={cn(
                  "w-6 h-6 cursor-pointer transition-colors",
                  i < value
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-[#E5E5E5]",
                )}
                onClick={() => previewMode && handleInputChange(i + 1)}
              />
            ))}
          </div>
        );

      case "slider":
        return (
          <div className="space-y-4">
            <Slider
              value={[value || field.validation_rules.min || 0]}
              onValueChange={(values) => handleInputChange(values[0])}
              min={field.validation_rules.min || 0}
              max={field.validation_rules.max || 100}
              step={1}
              disabled={!previewMode}
            />
            <div className="flex justify-between text-sm text-[#717171]">
              <span>{field.validation_rules.min || 0}</span>
              <span className="font-medium">
                {value || field.validation_rules.min || 0}
              </span>
              <span>{field.validation_rules.max || 100}</span>
            </div>
          </div>
        );

      case "section":
        return (
          <div className="text-center py-4">
            <h3 className="text-lg font-semibold text-[#2D2D2D]">
              {field.label}
            </h3>
            {field.placeholder && (
              <p className="text-[#717171] mt-1">{field.placeholder}</p>
            )}
          </div>
        );

      case "divider":
        return (
          <div className="flex items-center py-4">
            <Minus className="w-full h-px text-[#E5E5E5]" />
          </div>
        );

      default:
        return (
          <div className="p-4 bg-[#F5F5F5] rounded-lg text-center text-[#717171]">
            <p>Unsupported field type: {field.field_type}</p>
          </div>
        );
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{
        layout: { type: "spring", stiffness: 400, damping: 25 },
        opacity: { duration: 0.2 },
        y: { duration: 0.2 },
      }}
    >
      <Card
        className={cn(
          "relative group transition-all duration-200 cursor-pointer",
          isSelected
            ? "ring-2 ring-[#2D2D2D] border-[#2D2D2D]"
            : "border-[#E5E5E5] hover:border-[#4A4A4A]",
          previewMode && "cursor-default",
        )}
        onClick={!previewMode ? onSelect : undefined}
      >
        {/* Field Controls - Only visible in edit mode */}
        <AnimatePresence>
          {!previewMode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -5 }}
              transition={{ duration: 0.15 }}
              className={cn(
                "absolute -top-3 left-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-lg border border-[#E5E5E5] z-10 shadow-sm",
                isSelected && "opacity-100",
              )}
            >
              {/* Move Up Button */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveUp();
                  }}
                  disabled={isFirst}
                  title="Move up"
                >
                  <ChevronUp className="w-3 h-3" />
                </Button>
              </motion.div>

              {/* Move Down Button */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveDown();
                  }}
                  disabled={isLast}
                  title="Move down"
                >
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </motion.div>

              {/* Field Settings Button */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect();
                  }}
                  title="Field settings"
                >
                  <Settings className="w-3 h-3" />
                </Button>
              </motion.div>

              {/* Duplicate Button */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate();
                  }}
                  title="Duplicate field"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </motion.div>

              {/* Delete Button */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  title="Delete field"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <CardContent className="p-4 space-y-3">
          {/* Field Label */}
          {field.field_type !== "section" && field.field_type !== "divider" && (
            <div className="flex items-center gap-2">
              <Label className="text-[#2D2D2D] font-medium">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              {!previewMode && (
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="text-xs px-1 py-0">
                    {field.field_type}
                  </Badge>
                  {field.conditional_logic.conditions &&
                    field.conditional_logic.conditions.length > 0 && (
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        Conditional
                      </Badge>
                    )}
                </div>
              )}
            </div>
          )}

          {/* Field Input */}
          {renderFieldContent()}

          {/* Field Description/Help Text */}
          {field.placeholder && field.field_type !== "section" && (
            <p className="text-xs text-[#717171]">{field.placeholder}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
