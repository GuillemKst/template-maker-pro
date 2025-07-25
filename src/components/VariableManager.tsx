import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Variable as VariableIcon } from "lucide-react";
import type { Variable } from "./PdfBuilder";
import { toast } from "sonner";

interface VariableManagerProps {
  variables: Variable[];
  onAdd: (variable: Omit<Variable, "id">) => void;
  onUpdate: (id: string, updates: Partial<Variable>) => void;
  onDelete: (id: string) => void;
}

export const VariableManager = ({ variables, onAdd, onUpdate, onDelete }: VariableManagerProps) => {
  const [newVariable, setNewVariable] = useState<{
    name: string;
    placeholder: string;
    type: Variable["type"];
    required: boolean;
  }>({
    name: "",
    placeholder: "",
    type: "text",
    required: false,
  });

  const handleAddVariable = () => {
    if (!newVariable.name.trim()) {
      toast.error("Variable name is required");
      return;
    }
    if (!newVariable.placeholder.trim()) {
      toast.error("Placeholder text is required");
      return;
    }
    
    // Check for duplicate names
    if (variables.some(v => v.name.toLowerCase() === newVariable.name.toLowerCase())) {
      toast.error("Variable name already exists");
      return;
    }

    onAdd(newVariable);
    setNewVariable({
      name: "",
      placeholder: "",
      type: "text",
      required: false,
    });
    toast.success("Variable added successfully!");
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

  return (
    <div className="space-y-6">
      {/* Add new variable form */}
      <Card className="bg-gradient-secondary border-accent">
        <CardContent className="p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Variable
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="var-name">Variable Name</Label>
              <Input
                id="var-name"
                placeholder="e.g., customer_name"
                value={newVariable.name}
                onChange={(e) => setNewVariable({ ...newVariable, name: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="var-placeholder">Placeholder Text</Label>
              <Input
                id="var-placeholder"
                placeholder="e.g., {{customer_name}}"
                value={newVariable.placeholder}
                onChange={(e) => setNewVariable({ ...newVariable, placeholder: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="var-type">Field Type</Label>
              <Select 
                value={newVariable.type} 
                onValueChange={(value) => setNewVariable({ ...newVariable, type: value as Variable["type"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2 pt-6">
              <Checkbox
                id="var-required"
                checked={newVariable.required}
                onCheckedChange={(checked) => setNewVariable({ ...newVariable, required: !!checked })}
              />
              <Label htmlFor="var-required">Required field</Label>
            </div>
          </div>
          
          <Button onClick={handleAddVariable} className="mt-4">
            <Plus className="w-4 h-4 mr-2" />
            Add Variable
          </Button>
        </CardContent>
      </Card>

      {/* Variables list */}
      {variables.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <VariableIcon className="w-5 h-5" />
            Defined Variables ({variables.length})
          </h3>
          
          <div className="grid gap-4">
            {variables.map((variable) => (
              <Card key={variable.id} className="p-4 shadow-soft">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-foreground">{variable.name}</h4>
                        <Badge className={getTypeColor(variable.type)}>{variable.type}</Badge>
                        {variable.required && (
                          <Badge variant="destructive" className="text-xs">Required</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Placeholder: <code className="bg-variable text-variable-foreground px-1 py-0.5 rounded text-xs">{variable.placeholder}</code>
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onDelete(variable.id);
                      toast.success("Variable deleted");
                    }}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {variables.length === 0 && (
        <Card className="p-8 text-center text-muted-foreground">
          <VariableIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No variables defined yet. Add your first variable above.</p>
        </Card>
      )}
    </div>
  );
};