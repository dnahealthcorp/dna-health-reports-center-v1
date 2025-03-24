import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import * as React from "react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { addPatient, getPatientByMedicalRecordNumber } from "@/services/databaseService";
import { formatDateForDatabase } from "@/lib/utils";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Patient } from "@/types";

interface AddPatientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPatientAdded?: (patient: Patient) => void;
}

const addPatientFormSchema = z.object({
  name: z.string().min(2, {
    message: "Patient name must be at least 2 characters.",
  }),
  dateOfBirth: z.date({
    required_error: "A date of birth is required.",
  }),
  gender: z.enum(["Male", "Female", "Other"], {
    required_error: "Please select a gender.",
  }),
  medicalRecordNumber: z.string().regex(/^P\d{6}$/, {
    message: "Medical Record Number must be in the format P followed by 6 digits (e.g., P123456)",
  }),
});

type AddPatientFormValues = z.infer<typeof addPatientFormSchema>;

export function AddPatientDialog({
  open,
  onOpenChange,
  onPatientAdded,
}: AddPatientDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const form = useForm<AddPatientFormValues>({
    resolver: zodResolver(addPatientFormSchema),
    defaultValues: {
      name: "",
      dateOfBirth: undefined,
      gender: "Male",
      medicalRecordNumber: "",
    },
  });

  const handleSubmit = async (data: AddPatientFormValues) => {
    setIsLoading(true);
    setFormErrors({});
    
    try {
      // Validate medical record number format
      if (!/^P\d{6}$/.test(data.medicalRecordNumber)) {
        setFormErrors(prev => ({
          ...prev,
          medicalRecordNumber: "MRN must be in format P followed by 6 digits (e.g., P123456)"
        }));
        setIsLoading(false);
        return;
      }
      
      // Check if patient already exists
      const existingPatient = await getPatientByMedicalRecordNumber(data.medicalRecordNumber);
      if (existingPatient) {
        setFormErrors(prev => ({
          ...prev,
          medicalRecordNumber: "A patient with this medical record number already exists"
        }));
        setIsLoading(false);
        return;
      }
      
      // Format date to be compatible with database
      const formattedDate = formatDateForDatabase(data.dateOfBirth);
      
      // Create the patient
      const newPatient = await addPatient({
        name: data.name,
        dateOfBirth: formattedDate,
        gender: data.gender,
        medicalRecordNumber: data.medicalRecordNumber,
        status: "nurse-pending",
      });
      
      // Show success notification
      toast({
        title: "Patient Added",
        description: `${data.name} has been added successfully.`,
      });
      
      // Close dialog and refresh patient list
      form.reset();
      onOpenChange(false);
      if (onPatientAdded) {
        onPatientAdded(newPatient);
      }
    } catch (error) {
      console.error("Error adding patient:", error);
      
      // Show more descriptive error message
      let errorMessage = "Failed to add patient. Please check your connection and try again.";
      
      if (error instanceof Error) {
        if (error.message.includes("duplicate")) {
          errorMessage = "This patient already exists in the system.";
        } else if (error.message.includes("validation")) {
          errorMessage = "Please check the patient information and try again.";
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Patient</DialogTitle>
          <DialogDescription>
            Enter the patient details to create a new record.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Full Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date of Birth</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(new Date(field.value), "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="medicalRecordNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Medical Record Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., P123456" {...field} />
                  </FormControl>
                  <FormDescription>
                    Format: P followed by 6 digits (e.g., P123456)
                  </FormDescription>
                  {formErrors.medicalRecordNumber && (
                    <p className="text-sm font-medium text-destructive">
                      {formErrors.medicalRecordNumber}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Patient"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
