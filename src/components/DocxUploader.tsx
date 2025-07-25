import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, FileText, X } from "lucide-react";
import { toast } from "sonner";

interface DocxUploaderProps {
  onFileUpload: (file: File | null) => void;
  currentFile: File | null;
}

export const DocxUploader = ({ onFileUpload, currentFile }: DocxUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        toast.error("Please upload a DOCX file");
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error("File size must be less than 10MB");
        return;
      }
      onFileUpload(file);
      toast.success("DOCX uploaded successfully!");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      onFileUpload(file);
      toast.success("DOCX uploaded successfully!");
    } else {
      toast.error("Please upload a DOCX file");
    }
  };

  const removeFile = () => {
    onFileUpload(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.success("DOCX removed");
  };

  return (
    <div className="space-y-4">
      {!currentFile ? (
        <Card
          className="border-dashed border-2 border-muted-foreground/25 p-8 text-center cursor-pointer transition-colors hover:border-primary/50 hover:bg-muted/50"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Upload your DOCX template
          </h3>
          <p className="text-muted-foreground mb-4">
            Drag and drop your DOCX file here, or click to browse
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Use variables like <code className="bg-variable text-variable-foreground px-1 py-0.5 rounded">{"{{name}}"}</code>, <code className="bg-variable text-variable-foreground px-1 py-0.5 rounded">{"{{email}}"}</code>, <code className="bg-variable text-variable-foreground px-1 py-0.5 rounded">{"{{phone}}"}</code> in your document
          </p>
          <Button variant="secondary">
            Choose DOCX File
          </Button>
        </Card>
      ) : (
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-primary" />
              <div>
                <h3 className="font-semibold text-foreground">{currentFile.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {(currentFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={removeFile}
              className="text-destructive hover:text-destructive"
            >
              <X className="w-4 h-4" />
              Remove
            </Button>
          </div>
        </Card>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept=".docx"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};