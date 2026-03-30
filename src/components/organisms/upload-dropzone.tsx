"use client";

import { useCallback, useState } from "react";
import { Upload, File, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadedFile {
  readonly id: string;
  readonly name: string;
  readonly size: number;
}

interface UploadDropzoneProps {
  readonly accept?: string;
  readonly maxFiles?: number;
  readonly onFilesReady?: (files: File[]) => void;
  readonly className?: string;
}

export function UploadDropzone({
  accept = ".pdf,.docx,.doc,.txt",
  maxFiles = 10,
  onFilesReady,
  className,
}: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const slots = maxFiles - files.length;
      if (slots <= 0) return;
      const arr = Array.from(incoming).slice(0, slots);
      const mapped: UploadedFile[] = arr.map((f) => ({
        id: `${f.name}-${Date.now()}-${Math.random()}`,
        name: f.name,
        size: f.size,
      }));
      setFiles((prev) => [...prev, ...mapped]);
      onFilesReady?.(arr);
    },
    [files.length, maxFiles, onFilesReady],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) addFiles(e.target.files);
    },
    [addFiles],
  );

  const removeFile = (id: string) =>
    setFiles((prev) => prev.filter((f) => f.id !== id));

  const formatSize = (bytes: number) =>
    bytes < 1024 * 1024
      ? `${Math.round(bytes / 1024)}KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)}MB`;

  return (
    <div className={cn("space-y-3", className)}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border bg-muted/30 hover:border-muted-foreground/40 hover:bg-muted/50",
        )}
      >
        <Upload className="mb-3 h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium">
          Drop files here or{" "}
          <label className="cursor-pointer text-primary hover:underline">
            browse
            <input
              type="file"
              accept={accept}
              multiple
              className="sr-only"
              onChange={handleInputChange}
            />
          </label>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          PDF, DOCX, or TXT · up to {maxFiles} files
        </p>
      </div>

      {files.length > 0 && (
        <ul className="space-y-1.5">
          {files.map((f) => (
            <li
              key={f.id}
              className="flex items-center gap-3 rounded-md border border-border bg-card px-3 py-2"
            >
              <File className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate text-sm">{f.name}</span>
              <span className="shrink-0 font-mono text-xs text-muted-foreground">
                {formatSize(f.size)}
              </span>
              <button
                type="button"
                onClick={() => removeFile(f.id)}
                className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                aria-label={`Remove ${f.name}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
