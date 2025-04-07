
import React, { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Edit, Eye, EyeOff, ListRestart } from "lucide-react";
import RichTextEditor, { sanitizeContent } from "@/components/rich-text/RichTextEditor";
import RichTextDisplay from "@/components/rich-text/RichTextDisplay";
import { SummaryFindingField, getFormattedFieldName, predefinedOptions } from "./PredefinedOptions";

interface SummaryFindingFieldProps {
  field: SummaryFindingField;
  value: string;
  onChange: (field: string, value: string) => void;
  canEdit: boolean;
}

export const SummaryFindingField = ({
  field,
  value,
  onChange,
  canEdit
}: SummaryFindingFieldProps) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isPreviewActive, setIsPreviewActive] = useState<boolean>(false);
  const [lastSelectedOption, setLastSelectedOption] = useState<string>("");
  
  const fieldName = getFormattedFieldName(field);
  const options = predefinedOptions[field];
  
  // Check if a value matches any predefined option
  const isCustomValue = value !== "" && !options.includes(value);
  const showEditor = isEditing || isCustomValue;

  // Handle select change with special handling for rich text editor option
  const handleSelectChange = (value: string) => {
    if (value === "rich-text-editor") {
      setIsEditing(true);
      return;
    }
    
    // For predefined options, update the form data and exit editing mode
    onChange(field, sanitizeContent(value));
    setIsEditing(false);
    
    // Store the last selected option
    setLastSelectedOption(value);
  };

  // Toggle preview mode for a specific field
  const togglePreview = () => {
    setIsPreviewActive(!isPreviewActive);
  };

  // Switch back from rich text editor to predefined options
  const switchToOptions = () => {
    setIsEditing(false);
    
    // If there was a previously selected option, restore it
    if (lastSelectedOption) {
      onChange(field, lastSelectedOption);
    }
  };

  return (
    <tr>
      <td className="px-4 py-2 border bg-gray-50 w-1/4 text-left">
        {fieldName}
      </td>
      <td className="px-4 py-2 border">
        <div className="relative">
          {canEdit && (
            <div className="absolute right-2 top-2 flex space-x-1 z-10">
              {showEditor && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={togglePreview}
                    title={isPreviewActive ? "Edit" : "Preview"}
                  >
                    {isPreviewActive ? (
                      <Edit className="h-3 w-3" />
                    ) : (
                      <Eye className="h-3 w-3" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={switchToOptions}
                    title="Revert to Options"
                  >
                    <ListRestart className="h-3 w-3" />
                  </Button>
                </>
              )}
            </div>
          )}

          {showEditor ? (
            <div>
              {isPreviewActive ? (
                <div className="border rounded-md p-3 min-h-[100px] bg-gray-50">
                  <RichTextDisplay content={value} />
                </div>
              ) : (
                <RichTextEditor
                  content={value}
                  onChange={(html) => onChange(field, html)}
                  disabled={!canEdit}
                  placeholder="Enter rich text content here..."
                />
              )}
            </div>
          ) : (
            <div className="relative">
              <Select
                disabled={!canEdit}
                value={value || ""}
                onValueChange={handleSelectChange}
              >
                <SelectTrigger className={cn(
                  "w-full border-0 p-0 min-h-[60px] h-auto text-left",
                  "focus:ring-0 focus:ring-offset-0",
                  value ? "text-foreground" : "text-muted-foreground"
                )}>
                  {value ? (
                    <div className="py-1 pr-8">
                      <RichTextDisplay
                        content={value.length > 150 ? `${value.substring(0, 150)}...` : value}
                      />
                    </div>
                  ) : (
                    <SelectValue placeholder="Select an option or use the rich text editor" />
                  )}
                </SelectTrigger>
                <SelectContent>
                  {options.map((option, index) => (
                    <SelectItem key={index} value={option} className="py-2 min-h-[40px]">
                      <RichTextDisplay 
                        content={option.length > 100 ? `${option.substring(0, 100)}...` : option}
                        className="text-sm"
                      />
                    </SelectItem>
                  ))}
                  <SelectItem value="rich-text-editor" className="font-medium text-primary">
                    <div className="flex items-center">
                      <Edit className="mr-2 h-4 w-4" />
                      [Rich Text Editor]
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {canEdit && value && !showEditor && (
                <button 
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100"
                  onClick={() => setIsEditing(true)}
                  type="button"
                >
                  <Edit className="h-4 w-4 text-gray-500" />
                </button>
              )}
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};
