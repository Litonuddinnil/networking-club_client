 import React, { useCallback, useRef, useState } from "react";
import { 
  Check, 
  ExternalLink, 
  ImageIcon, 
  Link as LinkIcon, 
  Loader2, 
  RefreshCw, 
  Trash2, 
  Upload, 
  UploadCloud, 
  X 
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * ImgBB upload helper — shared between events and gallery forms.
 * Uses VITE_IMGBB_API_KEY env var with fallback.
 */
export const uploadImageToImgBB = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("image", file);

  const apiKey =
    import.meta.env.VITE_IMGBB_API_KEY || "6d25783f05b0b40d35d070669229e611";

  const response = await fetch(
    `https://api.imgbb.com/1/upload?key=${apiKey}`,
    { method: "POST", body: formData }
  );
  const data = await response.json();
  if (data.success) {
    return data.data.display_url || data.data.url;
  }
  throw new Error(data.error?.message || "ImgBB Image Upload Failed");
};

export type DropzoneAspectRatio = "16/9" | "16/10" | "4/3" | "1/1" | "auto";

interface ImageDropzoneProps {
  value: string;
  onChange: (url: string) => void;
  onError?: (message: string) => void;
  label?: string;
  helperText?: string;
  className?: string;
  required?: boolean;
  aspectRatio?: DropzoneAspectRatio;
  maxSizeMB?: number;
  allowUrlInput?: boolean;
  disabled?: boolean;
}

const ASPECT_CLASSES: Record<DropzoneAspectRatio, string> = {
  "16/9": "aspect-[16/9]",
  "16/10": "aspect-[16/10]",
  "4/3": "aspect-[4/3]",
  "1/1": "aspect-square max-w-[240px] mx-auto",
  auto: "min-h-[180px]",
};

export default function ImageDropzone({
  value,
  onChange,
  onError,
  label = "Cover Image",
  helperText = "Drag & drop an image, paste (Ctrl+V), or click to upload. Max 5MB.",
  className,
  required = false,
  aspectRatio = "16/10",
  maxSizeMB = 5,
  allowUrlInput = true,
  disabled = false,
}: ImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"upload" | "url">("upload");
  const [urlInputValue, setUrlInputValue] = useState("");
  const [fileName, setFileName] = useState("");

  const handleFile = useCallback(
    async (file: File) => {
      if (disabled) return;
      if (!file.type.startsWith("image/")) {
        onError?.("Please choose a valid image file (PNG, JPG, WEBP, GIF).");
        return;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        onError?.(`Image is larger than ${maxSizeMB}MB. Please select a smaller file.`);
        return;
      }

      setFileName(file.name);
      setUploading(true);
      try {
        const url = await uploadImageToImgBB(file);
        onChange(url);
      } catch (err: any) {
        onError?.(err?.message || "Image upload failed. Please try again.");
      } finally {
        setUploading(false);
        setFileName("");
      }
    },
    [onChange, onError, maxSizeMB, disabled]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (disabled) return;
      const file = e.dataTransfer.files?.[0];
      if (file) void handleFile(file);
    },
    [handleFile, disabled]
  );

  // Paste image directly from clipboard (Ctrl+V / Cmd+V)
  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      if (disabled || value) return;
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            void handleFile(file);
            break;
          }
        }
      }
    },
    [handleFile, disabled, value]
  );

  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInputValue.trim()) return;
    onChange(urlInputValue.trim());
    setUrlInputValue("");
  };

  return (
    <div className={cn("space-y-2", className)} onPaste={handlePaste}>
      {/* Header: Label + Upload Mode Switcher */}
      <div className="flex items-center justify-between">
        {label && (
          <label className="flex items-center gap-1 text-xs font-semibold text-foreground/90">
            {label}
            {required && <span className="text-rose-400 font-bold">*</span>}
          </label>
        )}

        {!value && allowUrlInput && (
          <div className="flex items-center bg-white/5 border border-white/10 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setActiveTab("upload")}
              className={cn(
                "px-2 py-0.5 text-[11px] font-medium rounded-md transition-all",
                activeTab === "upload"
                  ? "bg-teal-500/20 text-teal-400 shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Upload File
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("url")}
              className={cn(
                "px-2 py-0.5 text-[11px] font-medium rounded-md transition-all flex items-center gap-1",
                activeTab === "url"
                  ? "bg-teal-500/20 text-teal-400 shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LinkIcon className="w-3 h-3" />
              <span>Image URL</span>
            </button>
          </div>
        )}
      </div>

      {/* 1. Value Exists: Live Preview with Floating Actions */}
      {value ? (
        <div className="space-y-2 animate-in fade-in zoom-in-95 duration-200">
          <div
            className={cn(
              "group relative w-full overflow-hidden rounded-2xl border border-white/15 bg-black/40 shadow-xl backdrop-blur-md",
              ASPECT_CLASSES[aspectRatio]
            )}
          >
            <img
              src={value}
              alt="Uploaded preview"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Dark Vignette Overlay on Hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Action Bar Floating Top Right */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-all">
              
              {/* Fullscreen / Open in New Tab */}
              <a
                href={value}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-black/60 hover:bg-black/90 text-white border border-white/15 backdrop-blur-md transition-colors shadow-md"
                title="View full resolution"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              {/* Replace Image */}
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-black/60 hover:bg-black/90 text-amber-300 border border-white/15 backdrop-blur-md transition-colors shadow-md"
                title="Change image"
              >
                <RefreshCw className={cn("w-3.5 h-3.5", uploading && "animate-spin")} />
              </button>

              {/* Delete / Remove */}
              <button
                type="button"
                onClick={() => onChange("")}
                disabled={uploading}
                className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-black/60 hover:bg-rose-600 text-rose-300 hover:text-white border border-white/15 backdrop-blur-md transition-colors shadow-md"
                title="Remove image"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Uploading Overlay during image replacement */}
            {uploading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm gap-2">
                <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
                <p className="text-xs font-semibold text-white">Replacing image...</p>
              </div>
            )}
          </div>

          {/* Image URL Footer Strip */}
          <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
            <span className="font-mono truncate max-w-[85%]">{value}</span>
            <span className="text-emerald-400 flex items-center gap-1 font-medium shrink-0">
              <Check className="w-3 h-3" /> Uploaded
            </span>
          </div>
        </div>
      ) : activeTab === "url" ? (
        /* 2. Direct Image URL Input Mode */
        <div className="rounded-2xl border border-white/10 bg-background/40 p-4 space-y-3">
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInputValue}
              onChange={(e) => setUrlInputValue(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="flex-1 rounded-xl border border-white/10 bg-background/60 px-3.5 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400"
            />
            <button
              type="button"
              onClick={handleApplyUrl}
              className="rounded-xl bg-teal-500 hover:bg-teal-600 px-4 py-2 text-xs font-semibold text-black transition-all shadow-md"
            >
              Apply
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Paste a direct public image URL ending in .jpg, .png, or .webp.
          </p>
        </div>
      ) : (
        /* 3. Drag & Drop Upload Zone */
        <div
          onClick={() => !disabled && !uploading && inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled) setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          tabIndex={0}
          role="button"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          className={cn(
            "group relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed p-6 transition-all duration-300 cursor-pointer outline-none",
            ASPECT_CLASSES[aspectRatio],
            dragOver
              ? "border-teal-400 bg-teal-500/10 scale-[0.99] shadow-lg shadow-teal-500/10"
              : "border-white/15 bg-white/[0.02] hover:border-teal-400/50 hover:bg-white/[0.04]",
            disabled && "opacity-50 cursor-not-allowed pointer-events-none"
          )}
        >
          {/* Hidden File Input */}
          <input
            ref={inputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp, image/gif"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
            }}
          />

          <div className="flex flex-col items-center justify-center text-center gap-3 max-w-sm">
            {uploading ? (
              <div className="flex flex-col items-center gap-2.5">
                <div className="relative flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full border-2 border-teal-500/20 border-t-teal-400 animate-spin" />
                  <UploadCloud className="w-5 h-5 text-teal-400 absolute" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Uploading to ImgBB...</p>
                  {fileName && (
                    <p className="text-[10px] font-mono text-muted-foreground truncate max-w-[200px]">
                      {fileName}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/25 flex items-center justify-center text-teal-400 group-hover:scale-110 group-hover:bg-teal-500/20 transition-all duration-300 shadow-inner">
                  <UploadCloud className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-bold text-foreground">
                    Drop your image here, or{" "}
                    <span className="text-teal-400 underline underline-offset-2">browse</span>
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-muted-foreground leading-relaxed">
                    {helperText}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}