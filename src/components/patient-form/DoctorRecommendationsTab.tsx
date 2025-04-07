
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { NutritionRecommendation, ExerciseRecommendation, SleepStressRecommendation } from "@/types";

interface DoctorRecommendationsTabProps {
  nutritionRecommendations?: NutritionRecommendation;
  exerciseDetail?: ExerciseRecommendation;
  sleepStressRecommendations?: SleepStressRecommendation;
  doctorName?: string;
  onNutritionRecommendationsChange?: (recommendations: NutritionRecommendation) => void;
  onExerciseDetailChange?: (detail: ExerciseRecommendation) => void;
  onSleepStressRecommendationsChange?: (recommendations: SleepStressRecommendation) => void;
  onDoctorNameChange?: (name: string) => void;
  canEditDoctorSection?: boolean;
}

export const DoctorRecommendationsTab = ({
  nutritionRecommendations = {
    nutritionalStyle: '',
    proteinConsumption: '',
    eatingWindow: '',
    limitations: '',
    additionalConsiderations: ''
  },
  exerciseDetail = {
    focusOn: '',
    walking: '',
    restRecovery: '',
    tracking: ''
  },
  sleepStressRecommendations = {
    sleep: '',
    stress: ''
  },
  doctorName = '',
  onNutritionRecommendationsChange,
  onExerciseDetailChange,
  onSleepStressRecommendationsChange,
  onDoctorNameChange,
  canEditDoctorSection
}: DoctorRecommendationsTabProps) => {
  const handleNutritionChange = (field: keyof NutritionRecommendation, value: string) => {
    if (onNutritionRecommendationsChange) {
      onNutritionRecommendationsChange({
        ...nutritionRecommendations,
        [field]: value
      });
    }
  };

  const handleExerciseChange = (field: keyof ExerciseRecommendation, value: string) => {
    if (onExerciseDetailChange) {
      onExerciseDetailChange({
        ...exerciseDetail,
        [field]: value
      });
    }
  };

  const handleSleepStressChange = (field: keyof SleepStressRecommendation, value: string) => {
    if (onSleepStressRecommendationsChange) {
      onSleepStressRecommendationsChange({
        ...sleepStressRecommendations,
        [field]: value
      });
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-6">
          <Label htmlFor="doctorName">Doctor's Name</Label>
          <Input
            id="doctorName"
            value={doctorName}
            onChange={(e) => onDoctorNameChange && onDoctorNameChange(e.target.value)}
            disabled={!canEditDoctorSection}
            placeholder="Enter the doctor's name"
            className="mt-1.5"
          />
        </div>

        <Tabs defaultValue="nutrition">
          <TabsList className="mb-6 grid grid-cols-1 md:grid-cols-3">
            <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
            <TabsTrigger value="exercise">Exercise</TabsTrigger>
            <TabsTrigger value="sleepStress">Sleep & Stress</TabsTrigger>
          </TabsList>
          
          <TabsContent value="nutrition">
            <div className="space-y-6">
              <div>
                <Label htmlFor="nutritionalStyle">Nutritional Style</Label>
                <Textarea 
                  id="nutritionalStyle" 
                  value={nutritionRecommendations.nutritionalStyle} 
                  onChange={(e) => handleNutritionChange('nutritionalStyle', e.target.value)}
                  disabled={!canEditDoctorSection}
                  placeholder="Enter nutritional style recommendations"
                  className="min-h-[100px] mt-1.5"
                />
              </div>
              
              <div>
                <Label htmlFor="proteinConsumption">Protein Consumption</Label>
                <Textarea 
                  id="proteinConsumption" 
                  value={nutritionRecommendations.proteinConsumption} 
                  onChange={(e) => handleNutritionChange('proteinConsumption', e.target.value)}
                  disabled={!canEditDoctorSection}
                  placeholder="Enter protein consumption recommendations"
                  className="min-h-[100px] mt-1.5"
                />
              </div>
              
              <div>
                <Label htmlFor="eatingWindow">Eating Window</Label>
                <Textarea 
                  id="eatingWindow" 
                  value={nutritionRecommendations.eatingWindow} 
                  onChange={(e) => handleNutritionChange('eatingWindow', e.target.value)}
                  disabled={!canEditDoctorSection}
                  placeholder="Enter eating window recommendations"
                  className="min-h-[100px] mt-1.5"
                />
              </div>
              
              <div>
                <Label htmlFor="limitations">Limitations</Label>
                <Textarea 
                  id="limitations" 
                  value={nutritionRecommendations.limitations} 
                  onChange={(e) => handleNutritionChange('limitations', e.target.value)}
                  disabled={!canEditDoctorSection}
                  placeholder="Enter dietary limitations"
                  className="min-h-[100px] mt-1.5"
                />
              </div>
              
              <div>
                <Label htmlFor="additionalConsiderations">Additional Considerations</Label>
                <Textarea 
                  id="additionalConsiderations" 
                  value={nutritionRecommendations.additionalConsiderations} 
                  onChange={(e) => handleNutritionChange('additionalConsiderations', e.target.value)}
                  disabled={!canEditDoctorSection}
                  placeholder="Enter additional dietary considerations"
                  className="min-h-[100px] mt-1.5"
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="exercise">
            <div className="space-y-6">
              <div>
                <Label htmlFor="focusOn">Focus On</Label>
                <Textarea 
                  id="focusOn" 
                  value={exerciseDetail.focusOn} 
                  onChange={(e) => handleExerciseChange('focusOn', e.target.value)}
                  disabled={!canEditDoctorSection}
                  placeholder="Enter exercise focus recommendations"
                  className="min-h-[100px] mt-1.5"
                />
              </div>
              
              <div>
                <Label htmlFor="walking">Walking</Label>
                <Textarea 
                  id="walking" 
                  value={exerciseDetail.walking} 
                  onChange={(e) => handleExerciseChange('walking', e.target.value)}
                  disabled={!canEditDoctorSection}
                  placeholder="Enter walking recommendations"
                  className="min-h-[100px] mt-1.5"
                />
              </div>
              
              <div>
                <Label htmlFor="restRecovery">Rest/Recovery</Label>
                <Textarea 
                  id="restRecovery" 
                  value={exerciseDetail.restRecovery} 
                  onChange={(e) => handleExerciseChange('restRecovery', e.target.value)}
                  disabled={!canEditDoctorSection}
                  placeholder="Enter rest and recovery recommendations"
                  className="min-h-[100px] mt-1.5"
                />
              </div>
              
              <div>
                <Label htmlFor="tracking">Tracking</Label>
                <Textarea 
                  id="tracking" 
                  value={exerciseDetail.tracking} 
                  onChange={(e) => handleExerciseChange('tracking', e.target.value)}
                  disabled={!canEditDoctorSection}
                  placeholder="Enter exercise tracking recommendations"
                  className="min-h-[100px] mt-1.5"
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="sleepStress">
            <div className="space-y-6">
              <div>
                <Label htmlFor="sleep">Sleep</Label>
                <Textarea 
                  id="sleep" 
                  value={sleepStressRecommendations.sleep} 
                  onChange={(e) => handleSleepStressChange('sleep', e.target.value)}
                  disabled={!canEditDoctorSection}
                  placeholder="Enter sleep recommendations"
                  className="min-h-[150px] mt-1.5"
                />
              </div>
              
              <div>
                <Label htmlFor="stress">Stress</Label>
                <Textarea 
                  id="stress" 
                  value={sleepStressRecommendations.stress} 
                  onChange={(e) => handleSleepStressChange('stress', e.target.value)}
                  disabled={!canEditDoctorSection}
                  placeholder="Enter stress management recommendations"
                  className="min-h-[150px] mt-1.5"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
