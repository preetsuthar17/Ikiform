"use client";

import React, { useState, useRef, useCallback } from "react";
import { Upload, X, File, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  FileUploadService,
  UploadedFile,
  FileUploadOptions,
} from "@/lib/services/fileUploadService";

interface FileUploadComponentProps {
  formId: string;
  fieldId: string;
  options?: FileUploadOptions;
  value?: UploadedFile[];
  onChange?: (files: UploadedFile[]) => void;
  disabled?: boolean;
  className?: string;
}

interface FileUploadState {
  isDragOver: boolean;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
  uploadedFiles: UploadedFile[];
}

export function FileUploadComponent({
  formId,
  fieldId,
  options = {},
  value = [],
  onChange,
  disabled = false,
  className,
}: FileUploadComponentProps) {
  const [state, setState] = useState<FileUploadState>({
    isDragOver: false,
    isUploading: false,
    uploadProgress: 0,
    error: null,
    uploadedFiles: value,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateState = useCallback((updates: Partial<FileUploadState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const validateFiles = useCallback(
    (files: File[]): string | null => {
      // Check file count
      const totalFiles = state.uploadedFiles.length + files.length;
      if (options.maxFiles && totalFiles > options.maxFiles) {
        return `Maximum ${options.maxFiles} file(s) allowed`;
      }

      // Check file sizes and types
      for (const file of files) {
        if (options.maxFileSize) {
          const maxSizeBytes = options.maxFileSize * 1024 * 1024;
          if (file.size > maxSizeBytes) {
            return `File "${file.name}" exceeds maximum size of ${options.maxFileSize}MB`;
          }
        }

        if (options.allowedTypes && options.allowedTypes.length > 0) {
          const fileExtension = file.name.split(".").pop()?.toLowerCase();
          const mimeType = file.type.toLowerCase();

          const isAllowed = options.allowedTypes.some(
            (type) =>
              type.toLowerCase() === `.${fileExtension}` ||
              type.toLowerCase() === fileExtension ||
              mimeType.startsWith(type.toLowerCase().replace("*", ""))
          );

          if (!isAllowed) {
            return `File type not allowed for "${file.name}". Supported types: ${options.allowedTypes.join(", ")}`;
          }
        }
      }

      return null;
    },
    [state.uploadedFiles.length, options]
  );

  const handleFileUpload = useCallback(
    async (files: File[]) => {
      if (disabled || files.length === 0) return;

      const validationError = validateFiles(files);
      if (validationError) {
        updateState({ error: validationError });
        return;
      }

      updateState({
        isUploading: true,
        uploadProgress: 0,
        error: null,
      });

      try {
        const uploadedFiles = await FileUploadService.uploadFiles(
          files,
          formId,
          fieldId,
          options
        );

        const newUploadedFiles = [...state.uploadedFiles, ...uploadedFiles];
        updateState({
          uploadedFiles: newUploadedFiles,
          isUploading: false,
          uploadProgress: 100,
        });

        onChange?.(newUploadedFiles);

        // Reset progress after a delay
        setTimeout(() => {
          updateState({ uploadProgress: 0 });
        }, 1000);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Upload failed";
        updateState({
          error: errorMessage,
          isUploading: false,
          uploadProgress: 0,
        });
      }
    },
    [
      disabled,
      validateFiles,
      formId,
      fieldId,
      options,
      state.uploadedFiles,
      onChange,
      updateState,
    ]
  );

  const handleRemoveFile = useCallback(
    async (fileToRemove: UploadedFile) => {
      if (disabled) return;

      try {
        await FileUploadService.deleteFile(formId, fieldId, fileToRemove.name);
        const newUploadedFiles = state.uploadedFiles.filter(
          (f) => f.id !== fileToRemove.id
        );
        updateState({ uploadedFiles: newUploadedFiles });
        onChange?.(newUploadedFiles);
      } catch (error) {
        updateState({ error: "Failed to remove file" });
      }
    },
    [disabled, state.uploadedFiles, onChange, updateState]
  );

  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        updateState({ isDragOver: true });
      }
    },
    [disabled, updateState]
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        updateState({ isDragOver: false });
      }
    },
    [disabled, updateState]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (disabled) return;

      updateState({ isDragOver: false });

      const droppedFiles = Array.from(e.dataTransfer.files);
      handleFileUpload(droppedFiles);
    },
    [disabled, handleFileUpload, updateState]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);
      handleFileUpload(selectedFiles);

      // Reset input value to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [handleFileUpload]
  );

  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  // Build accepted file types for input element
  const acceptedTypes = options.allowedTypes?.join(",") || "";

  // Calculate remaining file slots
  const remainingSlots = options.maxFiles
    ? options.maxFiles - state.uploadedFiles.length
    : Infinity;
  const canUploadMore = remainingSlots > 0;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      {canUploadMore && (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
            state.isDragOver
              ? "border-blue-400 bg-blue-50"
              : "border-gray-300 hover:border-gray-400",
            disabled && "opacity-50 cursor-not-allowed",
            state.isUploading && "pointer-events-none"
          )}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple={!options.maxFiles || options.maxFiles > 1}
            accept={acceptedTypes}
            onChange={handleFileInputChange}
            className="hidden"
            disabled={disabled}
          />

          <Upload
            className={cn(
              "w-8 h-8 mx-auto mb-2",
              state.isDragOver ? "text-blue-500" : "text-gray-400"
            )}
          />

          <p className="text-sm font-medium text-gray-700">
            {state.isDragOver
              ? "Drop files here"
              : "Click to upload or drag and drop"}
          </p>

          <p className="text-xs text-gray-500 mt-1">
            {options.allowedTypes && options.allowedTypes.length > 0 && (
              <>
                {options.allowedTypes.join(", ")}
                {options.maxFileSize && " • "}
              </>
            )}
            {options.maxFileSize && `Max ${options.maxFileSize}MB per file`}
            {options.maxFiles && ` • Max ${options.maxFiles} file(s)`}
          </p>

          {remainingSlots < Infinity && (
            <p className="text-xs text-gray-500 mt-1">
              {remainingSlots} slot(s) remaining
            </p>
          )}
        </div>
      )}

      {/* Upload Progress */}
      {state.isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Uploading...</span>
            <span className="text-gray-600">{state.uploadProgress}%</span>
          </div>
          <Progress value={state.uploadProgress} className="h-2" />
        </div>
      )}

      {/* Error Alert */}
      {state.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{state.error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearError}
              className="h-auto p-1"
            >
              <X className="h-3 w-3" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Uploaded Files List */}
      {state.uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            Uploaded Files ({state.uploadedFiles.length})
          </h4>
          <div className="space-y-2">
            {state.uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="text-lg">
                    {FileUploadService.getFileIcon(file.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {FileUploadService.formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(file.url, "_blank")}
                    className="h-8 px-2"
                  >
                    <File className="h-3 w-3" />
                  </Button>
                  {!disabled && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFile(file)}
                      className="h-8 px-2 text-red-600 hover:text-red-700"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Success State */}
      {state.uploadedFiles.length > 0 && !canUploadMore && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Maximum number of files uploaded ({options.maxFiles})
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

export default FileUploadComponent;
