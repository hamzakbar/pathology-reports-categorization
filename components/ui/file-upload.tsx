import { ChangeEvent, DragEvent, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  onGenerateReport: () => void;
  selectedFile?: File | null;
}

export function FileUpload({ onFileSelect, onGenerateReport, selectedFile }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onFileSelect(file);
  };

  const [isDragActive, setIsDragActive] = useState(false);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(true);
  };
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
  };
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
    const file = e.dataTransfer.files?.[0] || null;
    onFileSelect(file);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div
        className={`flex flex-col items-center justify-center rounded-full border-2 border-dashed transition-colors ${isDragActive ? "border-primary bg-accent/30" : "border-muted bg-muted/50"} w-40 h-40 cursor-pointer select-none`}
        onClick={handleButtonClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        tabIndex={0}
        role="button"
        aria-label="Select PDF file"
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFileChange}
        />
        <span className="text-xs text-muted-foreground mt-2 text-center px-2">Drag and drop or browse a PDF</span>
      </div>
      {selectedFile && (
        <span className="mt-2 text-sm text-primary font-medium truncate max-w-full text-center" title={selectedFile.name}>
          Selected: {selectedFile.name}
        </span>
      )}
      <Button className="mt-4 w-full" onClick={onGenerateReport} disabled={!selectedFile}>
        Generate Report
      </Button>
    </div>
  );
} 