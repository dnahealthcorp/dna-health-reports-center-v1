
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Save, Loader2 } from "lucide-react";
import { Patient } from "@/types";
import { Progress } from "@/components/ui/progress";
import { PdfExportStatus } from "@/hooks/usePdfExporter";

interface PatientHeaderProps {
  patient: Patient;
  handleExportPDF: () => void;
  handleSave: () => void;
  isSaving: boolean;
  isExportingPDF?: boolean;
  exportStatus?: PdfExportStatus;
}

export const PatientHeader = ({ 
  patient, 
  handleExportPDF, 
  handleSave, 
  isSaving,
  isExportingPDF = false,
  exportStatus
}: PatientHeaderProps) => {
  const navigate = useNavigate();
  
  const getExportStatusText = () => {
    if (!exportStatus || exportStatus.stage === "idle") return "Export PDF";
    
    const stageText = {
      saving: "Saving form...",
      generating: "Generating PDF...",
      processing: "Processing content...",
      uploading: "Uploading PDF...",
      downloading: "Downloading...",
      complete: "Complete!",
      error: "Export failed"
    }[exportStatus.stage];
    
    return stageText;
  };
  
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span className="text-sm">Back</span>
          </button>
          <h1 className="text-3xl font-semibold tracking-tight">{patient?.name || "Patient"}</h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-muted-foreground">
              MRN: {patient?.medicalRecordNumber || "N/A"}
            </p>
            <span className="w-1 h-1 rounded-full bg-muted-foreground"></span>
            <p className="text-muted-foreground">
              DOB: {patient?.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : "N/A"}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={handleExportPDF} 
            disabled={isExportingPDF}
          >
            {isExportingPDF ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {getExportStatusText()}
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </>
            )}
          </Button>
          <Button disabled={isSaving} onClick={handleSave}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Form
              </>
            )}
          </Button>
        </div>
      </div>
      
      {isExportingPDF && exportStatus && (
        <div className="w-full space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">{exportStatus.message}</span>
            <span className="font-medium">{exportStatus.progress}%</span>
          </div>
          <Progress value={exportStatus.progress} className="h-2" />
        </div>
      )}
    </div>
  );
};
