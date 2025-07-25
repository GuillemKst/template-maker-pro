import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PdfUploader } from "./PdfUploader";
import { VariableManager } from "./VariableManager";
import { FormBuilder } from "./FormBuilder";
import { FormFiller } from "./FormFiller";
import { FileText, Settings, FormInput, Download } from "lucide-react";

export interface Variable {
  id: string;
  name: string;
  placeholder: string;
  type: "text" | "number" | "date" | "email";
  required: boolean;
}

export interface FormData {
  [key: string]: string;
}

export const PdfBuilder = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [variables, setVariables] = useState<Variable[]>([]);
  const [formData, setFormData] = useState<FormData>({});
  const [activeTab, setActiveTab] = useState("upload");

  const handleVariableAdd = (variable: Omit<Variable, "id">) => {
    const newVariable: Variable = {
      ...variable,
      id: Date.now().toString(),
    };
    setVariables([...variables, newVariable]);
  };

  const handleVariableUpdate = (id: string, updates: Partial<Variable>) => {
    setVariables(vars => vars.map(v => v.id === id ? { ...v, ...updates } : v));
  };

  const handleVariableDelete = (id: string) => {
    setVariables(vars => vars.filter(v => v.id !== id));
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto p-6">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">PDF Builder</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Upload your PDF template, define variables, and create dynamic forms that generate personalized documents.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Upload PDF
            </TabsTrigger>
            <TabsTrigger value="variables" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Variables
            </TabsTrigger>
            <TabsTrigger value="form" className="flex items-center gap-2">
              <FormInput className="w-4 h-4" />
              Form Builder
            </TabsTrigger>
            <TabsTrigger value="fill" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Fill & Download
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload PDF Template</CardTitle>
              </CardHeader>
              <CardContent>
                <PdfUploader onFileUpload={setPdfFile} currentFile={pdfFile} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="variables" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Manage Variables</CardTitle>
              </CardHeader>
              <CardContent>
                <VariableManager
                  variables={variables}
                  onAdd={handleVariableAdd}
                  onUpdate={handleVariableUpdate}
                  onDelete={handleVariableDelete}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="form" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Form Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <FormBuilder variables={variables} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fill" className="space-y-6">
            <FormFiller
              pdfFile={pdfFile}
              variables={variables}
              formData={formData}
              onFormDataChange={setFormData}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};