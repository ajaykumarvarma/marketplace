import { useState, useRef } from "react";
import { Upload, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface FileUploaderProps {
  onUpload: (fileInfo: { name: string; path: string; size: number; type: string }) => void;
  onRemove?: () => void;
  uploadedFile?: { name: string; size: number } | null;
}

export function FileUploader({ onUpload, onRemove, uploadedFile }: FileUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (file.size > 100 * 1024 * 1024) {
      alert("File too large. Max 100MB.");
      return;
    }
    setUploading(true);
    setProgress(0);

    const path = `uploads/${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from("digital-files")
      .upload(path, file, {
        upsert: false,
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded / e.total) * 100));
        },
      });

    setUploading(false);
    if (error) {
      alert("Upload failed: " + error.message);
      return;
    }

    onUpload({
      name: file.name,
      path: data.path,
      size: file.size,
      type: file.type,
    });
  };

  if (uploadedFile) {
    return (
      <div className="flex items-center gap-3 p-3 bg-muted rounded-lg border border-border">
        <FileText className="h-5 w-5 text-primary" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground truncate">{uploadedFile.name}</p>
          <p className="text-xs text-foreground/70">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
        {onRemove && (
          <Button variant="ghost" size="icon" onClick={onRemove} aria-label="Remove file">
            <X className="h-4 w-4 text-foreground/70" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="w-full flex flex-col items-center justify-center gap-2 p-6 rounded-lg border-2 border-dashed border-border hover:border-primary/30 bg-muted/50 transition-colors disabled:opacity-50"
      >
        <Upload className="h-6 w-6 text-foreground/70" />
        <p className="text-sm text-foreground/70">{uploading ? `Uploading... ${progress}%` : "Click to upload digital file"}</p>
        <p className="text-xs text-foreground/50">Max 100MB</p>
      </button>
    </div>
  );
}