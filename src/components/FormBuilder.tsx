import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FormInput, Eye } from "lucide-react";
import type { Variable } from "./PdfBuilder";

interface FormBuilderProps {
  variables: Variable[];
}

export const FormBuilder = ({ variables }: FormBuilderProps) => {
  const getInputComponent = (variable: Variable) => {
    const baseProps = {
      id: variable.id,
      placeholder: `Enter ${variable.name.replace(/_/g, " ")}`,
      disabled: true,
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

  const getTypeColor = (type: Variable["type"]) => {
    switch (type) {
      case "text": return "bg-blue-100 text-blue-800";
      case "number": return "bg-green-100 text-green-800";
      case "date": return "bg-purple-100 text-purple-800";
      case "email": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (variables.length === 0) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        <FormInput className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No variables defined. Go to the Variables tab to add some fields.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Eye className="w-4 h-4" />
        <span className="text-sm">This is a preview of how your form will look to users</span>
      </div>
      
      <Card className="shadow-medium">
        <CardHeader className="bg-gradient-primary text-primary-foreground">
          <CardTitle className="flex items-center gap-2">
            <FormInput className="w-5 h-5" />
            Document Information Form
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
                Maps to: <code className="bg-variable text-variable-foreground px-1 py-0.5 rounded">{variable.placeholder}</code>
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};