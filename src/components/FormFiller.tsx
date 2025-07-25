import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Variable, FormData } from "./PdfBuilder";
import { toast } from "sonner";
import { PDFDocument, rgb } from "pdf-lib";
import { saveAs } from "file-saver";

interface FormFillerProps {
  docxFile: File | null;
  variables: Variable[];
  formData: FormData;
  onFormDataChange: (data: FormData) => void;
}

export const FormFiller = ({ docxFile, variables, formData, onFormDataChange }: FormFillerProps) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleInputChange = (variableId: string, value: string) => {
    onFormDataChange({
      ...formData,
      [variableId]: value,
    });
  };

  const getInputComponent = (variable: Variable) => {
    const value = formData[variable.id] || "";
    const baseProps = {
      id: variable.id,
      value,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(variable.id, e.target.value),
      placeholder: `Enter ${variable.name.replace(/_/g, " ")}`,
      required: variable.required,
    };

    switch (variable.type) {
      case "email":
        return <Input {...baseProps} type="email" />;
      case "number":
        return <Input {...baseProps} type="number" />;
      case "date":
        return <Input {...baseProps} type="date" />;
      default:
        return <Input {...baseProps} type="text" />;
    }
  };

  const validateForm = () => {
    const missingRequired = variables
      .filter(v => v.required)
      .filter(v => !formData[v.id]?.trim());

    if (missingRequired.length > 0) {
      toast.error(`Please fill in required fields: ${missingRequired.map(v => v.name).join(", ")}`);
      return false;
    }

    return true;
  };

  const generatePdf = async () => {
    if (!docxFile) {
      toast.error("Please upload a DOCX template first");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsGenerating(true);
    
    try {
      // Read the DOCX file
      const docxBytes = await docxFile.arrayBuffer();
      
      // Use docxtemplater to replace variables
      const Docxtemplater = (await import("docxtemplater")).default;
      const PizZip = (await import("pizzip")).default;
      
      const zip = new PizZip(docxBytes);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      // Create data object for template
      const templateData: Record<string, string> = {};
      variables.forEach((variable) => {
        // Remove {{ }} from placeholder to get the key
        const key = variable.placeholder.replace(/[{}]/g, "");
        templateData[key] = formData[variable.id] || "";
      });

      // Render the document with the data
      doc.render(templateData);

      // Get the generated docx
      const generatedDocx = doc.getZip().generate({ type: "arraybuffer" });
      
      // For now, save as DOCX (we can add PDF conversion later)
      const blob = new Blob([generatedDocx], { 
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
      });
      saveAs(blob, `filled-document-${Date.now()}.docx`);
      
      toast.success("Document generated and downloaded successfully!");
    } catch (error) {
      console.error("Error generating document:", error);
      toast.error("Failed to generate document. Please check your template format.");
    } finally {
      setIsGenerating(false);
    }
  };

  const getTypeColor = (type: Variable["type"]) => {
    switch (type) {
      case "text": return "bg-blue-100 text-blue-800";
      case "number": return "bg-green-100 text-green-800";
      case "date": return "bg-purple-100 text-purple-800";
      case "email": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (!docxFile) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please upload a DOCX template first to enable form filling and document generation.
        </AlertDescription>
      </Alert>
    );
  }

  if (variables.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No variables defined. Please go to the Variables tab to define some fields first.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Form Section */}
      <Card className="shadow-medium">
        <CardHeader className="bg-gradient-primary text-primary-foreground">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Fill Document Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {variables.map((variable) => (
            <div key={variable.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor={variable.id} className="text-foreground font-medium">
                  {variable.name.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                  {variable.required && <span className="text-destructive ml-1">*</span>}
                </Label>
                <div className="flex items-center gap-2">
                  <Badge className={getTypeColor(variable.type)} variant="secondary">
                    {variable.type}
                  </Badge>
                  {variable.required && (
                    <Badge variant="destructive" className="text-xs">Required</Badge>
                  )}
                </div>
              </div>
              {getInputComponent(variable)}
              <p className="text-xs text-muted-foreground">
                Will replace: <code className="bg-variable text-variable-foreground px-1 py-0.5 rounded">{variable.placeholder}</code>
              </p>
            </div>
          ))}
          
          <Button 
            onClick={generatePdf} 
            disabled={isGenerating} 
            className="w-full mt-6"
            size="lg"
          >
            <Download className="w-4 h-4 mr-2" />
            {isGenerating ? "Generating Document..." : "Generate & Download DOCX"}
          </Button>
        </CardContent>
      </Card>

      {/* Preview Section */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle>Data Preview</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Current form data:</h4>
            {variables.map((variable) => {
              const value = formData[variable.id] || "";
              return (
                <div key={variable.id} className="p-3 bg-muted rounded-lg">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-sm">{variable.name}</span>
                    <Badge className={getTypeColor(variable.type)} variant="secondary">
                      {variable.type}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    Placeholder: <code className="bg-variable text-variable-foreground px-1 py-0.5 rounded text-xs">{variable.placeholder}</code>
                  </div>
                  <div className="text-sm">
                    <strong>Value:</strong> {value || <span className="text-muted-foreground italic">Not filled</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};