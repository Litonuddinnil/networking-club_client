import React, { useCallback, useRef, useState } from "react";
import { ImageIcon, Loader2, Trash2, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * ImgBB upload helper — shared between events and gallery forms.
 * Uses VITE_IMGBB_API_KEY env var with a fallback key.
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

interface ImageDropzoneProps {
  value: string;
  onChange: (url: string) => void;
  onError?: (message: string) => void;
  label?: string;
  helperText?: string;
  className?: string;
  required?: boolean;
}

/**
 * ImageDropzone — drag-drop + click upload with preview.
 * Uses the shared ImgBB uploader, returns the URL via onChange.
 */
export default function ImageDropzone({
  value,
  onChange,
  onError,
  label = "Cover Image",
  helperText = "Drag an image or click to upload. PNG / JPG / WEBP up to 5MB.",
  className,
  required = false,
}: ImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        onError?.("Please choose an image file (PNG, JPG, WEBP).");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        onError?.("Image is larger than 5MB. Please pick a smaller file.");
        return;
      }
      setUploading(true);
      try {
        const url = await uploadImageToImgBB(file);
        onChange(url);
      } catch (err: any) {
        onError?.(err?.message || "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [onChange, onError]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) void handleFile(file);
    },
    [handleFile]
  );

  if (value) {
    return (
      <div className={cn("space-y-2", className)}>
        {label && (
          <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
            {label}
          </p>
        )}
        <div className="dropzone-preview aspect-[16/10] w-full">
          <img
            src={value}
            alt="Uploaded preview"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 inline-flex items-center justify-center w-8 h-8 rounded-full bg-black/70 hover:bg-rose-500/90 text-white backdrop-blur transition"
            aria-label="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
          {uploading && (
            <div className="absolute inset-0 grid place-items-center bg-black/60">
              <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
            </div>
          )}
        </div>
        <p className="text-[10px] font-mono text-muted-foreground truncate">
          {value}
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </p>
      )}
      <div
        className={cn("dropzone", dragOver && "is-dragover")}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        role="button"
        tabIndex={0}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />
        <div className="flex flex-col items-center justify-center gap-2 py-4">
          {uploading ? (
            <Loader2 className="w-7 h-7 text-emerald-400 animate-spin" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 grid place-items-center">
              <Upload className="w-5 h-5 text-emerald-400" />
            </div>
          )}
          <p className="text-sm font-semibold text-foreground">
            {uploading ? "Uploading to ImgBB..." : "Drop an image or click to upload"}
          </p>
          <p className="text-[10px] font-mono text-muted-foreground">{helperText}</p>
        </div>
      </div>
    </div>
  );
}