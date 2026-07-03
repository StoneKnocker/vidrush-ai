import { AlertCircle, ImageIcon, Loader2, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  generateUploadFilePath,
  type UploadProgress,
  uploadToR2,
} from "~/lib/r2/r2.client";
import { trpc } from "~/lib/trpc/trpc-provider";
import { cn } from "~/lib/utils";

export interface UploadLabels {
  dropHere: string;
  formats: string;
  uploading: string;
  remove: string;
}

interface UploadProps {
  labels: UploadLabels;
  onUploadComplete: (url: string) => void;
  onUploadError?: (error: Error) => void;
  userId: string;
  maxSize?: number;
  accept?: string;
  className?: string;
}

interface UploadState {
  status: "idle" | "uploading" | "success" | "error";
  previewUrl: string | null;
  progress: number;
  error: string | null;
}

export function Upload({
  labels,
  onUploadComplete,
  onUploadError,
  userId,
  maxSize = 10 * 1024 * 1024, // 10MB default
  accept = "image/*",
  className,
}: UploadProps) {
  const [state, setState] = useState<UploadState>({
    status: "idle",
    previewUrl: null,
    progress: 0,
    error: null,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // tRPC mutation for getting presigned URL
  const getPresignedUrlMutation = trpc.r2.getPresignedUrl.useMutation();

  // Cleanup Object URL on unmount
  useEffect(() => {
    return () => {
      if (state.previewUrl) {
        URL.revokeObjectURL(state.previewUrl);
      }
    };
  }, [state.previewUrl]);

  const handleFile = useCallback(
    async (file: File) => {
      // Validate file
      if (file.size > maxSize) {
        const error = new Error(
          `File exceeds maximum size of ${(maxSize / 1024 / 1024).toFixed(0)}MB`,
        );
        setState((prev) => ({ ...prev, error: error.message }));
        onUploadError?.(error);
        return;
      }

      // Show local preview immediately
      const previewUrl = URL.createObjectURL(file);
      setState({
        status: "uploading",
        previewUrl,
        progress: 0,
        error: null,
      });

      // Upload to R2
      try {
        const filePath = generateUploadFilePath(userId, file.name);
        const { uploadUrl } = await getPresignedUrlMutation.mutateAsync({
          filePath,
          contentType: file.type,
        });
        const url = await uploadToR2({
          filePath,
          contentType: file.type,
          file,
          uploadUrl,
          onProgress: (progress: UploadProgress) => {
            setState((prev) => ({ ...prev, progress: progress.percentage }));
          },
        });
        setState((prev) => ({ ...prev, status: "success", progress: 100 }));
        onUploadComplete(url);
      } catch (err) {
        console.error("upload error:", err);
        const error = err instanceof Error ? err : new Error("Upload failed");
        URL.revokeObjectURL(previewUrl);
        setState((prev) => ({
          ...prev,
          status: "error",
          error: error.message,
          previewUrl: null,
        }));
        onUploadError?.(error);
      }
    },
    [maxSize, userId, onUploadComplete, onUploadError, getPresignedUrlMutation],
  );

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (state.previewUrl) {
        URL.revokeObjectURL(state.previewUrl);
      }
      setState({
        status: "idle",
        previewUrl: null,
        progress: 0,
        error: null,
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [state.previewUrl],
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) {
      return;
    }
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile],
  );

  const handleClick = useCallback(() => {
    if (state.status === "idle") {
      fileInputRef.current?.click();
    }
  }, [state.status]);

  return (
    <div className={cn("relative", className)}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        className="hidden"
      />
      {state.status === "idle" ? (
        <button
          type="button"
          onClick={handleClick}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={cn(
            "relative aspect-[4/3] w-full cursor-pointer rounded-xl border-2 border-dashed transition-all duration-300",
            isDragging
              ? "border-indigo-400 bg-indigo-50/50"
              : "border-slate-300 hover:border-indigo-300",
          )}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
            <div
              className={cn(
                "mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 transition-all duration-300",
                isDragging && "scale-110 bg-indigo-100",
              )}
            >
              <ImageIcon className="text-slate-400" size={32} />
            </div>
            <span className="font-medium text-slate-600 text-sm">
              {labels.dropHere}
            </span>
            <span className="mt-1 text-slate-600 text-xs">
              {labels.formats}
            </span>
          </div>
        </button>
      ) : (
        <div className="relative aspect-[4/3] rounded-xl border-2 border-slate-300 border-dashed transition-all duration-300">
          {state.status === "uploading" && state.previewUrl && (
            <>
              <img
                src={state.previewUrl}
                alt="Preview"
                className="h-full w-full rounded-lg object-contain"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center rounded-lg bg-black/40">
                <Loader2 className="mb-2 animate-spin text-white" size={32} />
                <span className="font-medium text-white">
                  {labels.uploading}
                </span>
                <div className="mt-3 h-1 w-32 overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full bg-white transition-all duration-300"
                    style={{ width: `${state.progress}%` }}
                  />
                </div>
              </div>
            </>
          )}

          {state.status === "success" && state.previewUrl && (
            <img
              src={state.previewUrl}
              alt="Uploaded preview"
              className="h-full w-full rounded-lg object-contain"
            />
          )}

          {state.status === "error" && state.previewUrl && (
            <>
              <img
                src={state.previewUrl}
                alt="Failed upload"
                className="h-full w-full rounded-lg object-contain opacity-50"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center rounded-lg bg-black/40">
                <AlertCircle className="mb-2 text-red-400" size={32} />
                <span className="font-medium text-white">Upload failed</span>
                {state.error && (
                  <span className="mt-1 text-sm text-white/70">
                    {state.error}
                  </span>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(e);
                  }}
                  className="mt-3 text-white/70 text-xs transition-colors hover:text-white"
                >
                  Try again
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {state.status === "success" && (
        <button
          type="button"
          onClick={handleRemove}
          className="mt-3 flex items-center gap-1 text-slate-600 text-xs transition-colors hover:text-indigo-500"
        >
          <RefreshCw size={12} />
          {labels.remove}
        </button>
      )}
    </div>
  );
}

export default Upload;
