
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getMedications } from "@/services/databaseService";
import { Medication } from "@/types";
import { Plus, Filter } from "lucide-react";

const Supplements = () => {
  const { toast } = useToast();
  const [supplements, setSupplements] = useState<Medication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSupplements = async () => {
      try {
        const medications = await getMedications();
        // Filter only supplements
        const supplementsList = medications.filter(med => med.type === 'supplement');
        setSupplements(supplementsList);
      } catch (error) {
        console.error("Error loading supplements:", error);
        toast({
          title: "Error",
          description: "Failed to load supplements",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSupplements();
  }, [toast]);

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Supplements</h1>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Supplement
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader className="bg-gray-100 h-12"></CardHeader>
              <CardContent className="mt-4">
                <div className="h-4 bg-gray-100 rounded mb-2"></div>
                <div className="h-4 bg-gray-100 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {supplements.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-lg text-gray-500">No supplements found</p>
                <Button className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add your first supplement
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {supplements.map((supplement) => (
                <Card key={supplement.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      {supplement.name}
                    </CardTitle>
                    <CardDescription>
                      Dosage: {supplement.dosage}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {supplement.notes && (
                      <p className="text-sm text-gray-500 mb-2">{supplement.notes}</p>
                    )}
                    {supplement.link && (
                      <a 
                        href={supplement.link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-500 hover:underline text-sm"
                      >
                        More information
                      </a>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Supplements;
