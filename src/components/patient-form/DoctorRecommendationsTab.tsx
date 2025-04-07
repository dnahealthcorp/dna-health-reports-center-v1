
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { PatientFormData, User } from "@/types";
import { ClipboardCheck } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAllDoctors } from "@/services/databaseService";

interface DoctorRecommendationsTabProps {
  formData: PatientFormData;
  handleInputChange: (section: keyof PatientFormData | "", field: string, value: string | boolean) => void;
  canEditDoctorSection: boolean;
}

export const DoctorRecommendationsTab = ({
  formData,
  handleInputChange,
  canEditDoctorSection
}: DoctorRecommendationsTabProps) => {
  const [doctors, setDoctors] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setIsLoading(true);
        const doctorsData = await getAllDoctors();
        setDoctors(doctorsData);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const handleDoctorSelect = (value: string) => {
    handleInputChange("", "doctorName", value);
  };

  return (
    <div className="grid gap-6">
      {/* Doctor Name Field */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg font-medium">
            <ClipboardCheck className="h-5 w-5 text-primary mr-2" />
            Doctor Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="doctorName">Doctor Name (will appear in the signature)</Label>
            <div className="mt-1 relative">
              <Select
                value={formData.doctorName || ''}
                onValueChange={handleDoctorSelect}
                disabled={!canEditDoctorSection || isLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a doctor" />
                </SelectTrigger>
                <SelectContent position="popper" className="w-full bg-white">
                  <SelectGroup>
                    <SelectLabel>Doctors</SelectLabel>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.name}>
                        {doctor.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {!formData.doctorName && canEditDoctorSection && (
                <Input
                  id="customDoctorName"
                  value={formData.doctorName || ''}
                  onChange={(e) => handleInputChange("", "doctorName", e.target.value)}
                  className="mt-2"
                  placeholder="Or enter custom name"
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Nutrition Recommendations */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg font-medium">
            <ClipboardCheck className="h-5 w-5 text-primary mr-2" />
            Nutrition Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="nutritionalStyle">Nutritional Style</Label>
              <Textarea
                id="nutritionalStyle"
                value={formData.nutritionRecommendations.nutritionalStyle || ''}
                onChange={(e) => handleInputChange("nutritionRecommendations", "nutritionalStyle", e.target.value)}
                disabled={!canEditDoctorSection}
                className="resize-none"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="proteinConsumption">Protein Consumption</Label>
              <Textarea
                id="proteinConsumption"
                value={formData.nutritionRecommendations.proteinConsumption || ''}
                onChange={(e) => handleInputChange("nutritionRecommendations", "proteinConsumption", e.target.value)}
                disabled={!canEditDoctorSection}
                className="resize-none"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="eatingWindow">Eating Window</Label>
              <Textarea
                id="eatingWindow"
                value={formData.nutritionRecommendations.eatingWindow || ''}
                onChange={(e) => handleInputChange("nutritionRecommendations", "eatingWindow", e.target.value)}
                disabled={!canEditDoctorSection}
                className="resize-none"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="limitations">Limitations</Label>
              <Textarea
                id="limitations"
                value={formData.nutritionRecommendations.limitations || ''}
                onChange={(e) => handleInputChange("nutritionRecommendations", "limitations", e.target.value)}
                disabled={!canEditDoctorSection}
                className="resize-none"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="additionalConsiderations">Additional Considerations</Label>
              <Textarea
                id="additionalConsiderations"
                value={formData.nutritionRecommendations.additionalConsiderations || ''}
                onChange={(e) => handleInputChange("nutritionRecommendations", "additionalConsiderations", e.target.value)}
                disabled={!canEditDoctorSection}
                className="resize-none"
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exercise Recommendations */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg font-medium">
            <ClipboardCheck className="h-5 w-5 text-primary mr-2" />
            Exercise Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="focusOn">Focus On</Label>
              <Textarea
                id="focusOn"
                value={formData.exerciseDetail.focusOn || ''}
                onChange={(e) => handleInputChange("exerciseDetail", "focusOn", e.target.value)}
                disabled={!canEditDoctorSection}
                className="resize-none"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="walking">Walking</Label>
              <Textarea
                id="walking"
                value={formData.exerciseDetail.walking || ''}
                onChange={(e) => handleInputChange("exerciseDetail", "walking", e.target.value)}
                disabled={!canEditDoctorSection}
                className="resize-none"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="restRecovery">Rest/Recovery</Label>
              <Textarea
                id="restRecovery"
                value={formData.exerciseDetail.restRecovery || ''}
                onChange={(e) => handleInputChange("exerciseDetail", "restRecovery", e.target.value)}
                disabled={!canEditDoctorSection}
                className="resize-none"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="tracking">Tracking</Label>
              <Textarea
                id="tracking"
                value={formData.exerciseDetail.tracking || ''}
                onChange={(e) => handleInputChange("exerciseDetail", "tracking", e.target.value)}
                disabled={!canEditDoctorSection}
                className="resize-none"
                rows={2}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sleep and Stress Recommendations */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg font-medium">
            <ClipboardCheck className="h-5 w-5 text-primary mr-2" />
            Sleep and Stress Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="sleep">Sleep</Label>
              <Textarea
                id="sleep"
                value={formData.sleepStressRecommendations.sleep || ''}
                onChange={(e) => handleInputChange("sleepStressRecommendations", "sleep", e.target.value)}
                disabled={!canEditDoctorSection}
                className="resize-none"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="stress">Stress</Label>
              <Textarea
                id="stress"
                value={formData.sleepStressRecommendations.stress || ''}
                onChange={(e) => handleInputChange("sleepStressRecommendations", "stress", e.target.value)}
                disabled={!canEditDoctorSection}
                className="resize-none"
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
