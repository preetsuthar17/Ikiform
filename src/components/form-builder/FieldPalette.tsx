// Form Builder Field Palette - Click to add field types
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { FIELD_TEMPLATES, FieldTemplate, FormField } from "@/lib/types/forms";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";

interface FieldPaletteProps {
  className?: string;
  onFieldAdd?: (fieldData: Partial<FormField>) => void;
}

export function FieldPalette({ className, onFieldAdd }: FieldPaletteProps) {
  const categories = {
    basic: FIELD_TEMPLATES.filter((f) => f.category === "basic"),
    advanced: FIELD_TEMPLATES.filter((f) => f.category === "advanced"),
    layout: FIELD_TEMPLATES.filter((f) => f.category === "layout"),
    payment: FIELD_TEMPLATES.filter((f) => f.category === "payment"),
  };
  const handleFieldClick = (template: FieldTemplate) => {
    console.log("Adding field:", template.type);
    const fieldData: Partial<FormField> = {
      field_type: template.type,
      label: template.label,
      required: false,
    };
    onFieldAdd?.(fieldData);
  };

  return (
    <Card className={cn("h-full m-4 bg-neutral-50 border-0", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-[#2D2D2D]">
          Form Fields
        </CardTitle>
        <p className="text-sm text-[#717171]">
          Click on a field to add it to your form
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-180px)] [mask-image:linear-gradient(to_bottom,transparent,black_16px,black_calc(100%-16px),transparent)]">
          <div className="space-y-6 p-4">
            {Object.entries(categories).map(([categoryName, fields]) => (
              <div key={categoryName}>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-medium text-black/80 capitalize">
                    {categoryName}
                  </h3>
                  <Badge
                    variant="secondary"
                    className="bg-gray-100 text-black/50"
                  >
                    {fields.length}
                  </Badge>
                </div>

                <div className="grid gap-2">
                  {fields.map((template) => (
                    <FieldPaletteItem
                      key={template.type}
                      template={template}
                      onClick={() => handleFieldClick(template)}
                    />
                  ))}
                </div>

                {categoryName !== "payment" && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

interface FieldPaletteItemProps {
  template: FieldTemplate;
  onClick: () => void;
}

function FieldPaletteItem({ template, onClick }: FieldPaletteItemProps) {
  const IconComponent = Icons[
    template.icon as keyof typeof Icons
  ] as React.ComponentType<{ className?: string }>;

  return (
    <div
      onClick={onClick}
      className={cn(
        "group flex items-center gap-3 p-3 rounded-lg bg-white cursor-pointer transition-all duration-200",
        "hover:border-black/20 border border-transparent",
        "active:scale-95 active:bg-gray-50"
      )}
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-md bg-[#F5F5F5] flex items-center justify-center group-hover:bg-[#E5E5E5] transition-colors">
        {IconComponent && <IconComponent className="w-4 h-4 text-black/80" />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-black/80 truncate">
          {template.label}
        </div>
        <div className="text-xs text-black/50 truncate">
          {template.description}
        </div>
      </div>
    </div>
  );
}
