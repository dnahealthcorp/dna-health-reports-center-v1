
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Pill, Beaker, Settings as SettingsIcon } from "lucide-react";
import { getCurrentUser } from "@/services/databaseService";
import Medications from "./Medications";

const Settings = () => {
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    const checkAdmin = async () => {
      const currentUser = await getCurrentUser();
      setIsAdmin(currentUser?.role === 'admin');
      
      if (currentUser?.role !== 'admin') {
        toast({
          title: "Access Denied",
          description: "Only administrators can access settings",
          variant: "destructive"
        });
      }
    };
    
    checkAdmin();
  }, [toast]);

  if (!isAdmin) {
    return (
      <Layout>
        <div className="container mx-auto py-6 max-w-5xl">
          <h1 className="text-2xl font-bold mb-6">Settings</h1>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center flex-col py-8">
                <SettingsIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
                <p className="text-muted-foreground text-center max-w-md">
                  Only administrators can access settings. Please contact an administrator if you need assistance.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-6 max-w-5xl">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        
        <Tabs defaultValue="medications">
          <TabsList className="mb-4">
            <TabsTrigger value="medications" className="flex items-center">
              <Pill className="h-4 w-4 mr-2" />
              Medications & Supplements
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center">
              <SettingsIcon className="h-4 w-4 mr-2" />
              System Settings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="medications">
            <Medications />
          </TabsContent>
          
          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Configure system-wide settings for DNA Health</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Application Data</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Manage application data and storage
                    </p>
                    <div className="flex space-x-2">
                      <Button variant="outline">Export Data</Button>
                      <Button variant="outline">Import Data</Button>
                      <Button variant="destructive">Reset Data</Button>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-medium mb-2">Appearance</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Customize the appearance of the application
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="border-2 border-primary">
                        <CardContent className="p-4 flex flex-col items-center">
                          <div className="w-full h-20 bg-background mb-2 rounded"></div>
                          <p className="text-sm font-medium">Light Mode</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 flex flex-col items-center">
                          <div className="w-full h-20 bg-slate-900 mb-2 rounded"></div>
                          <p className="text-sm font-medium">Dark Mode</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 flex flex-col items-center">
                          <div className="w-full h-20 bg-gradient-to-r from-background to-slate-900 mb-2 rounded"></div>
                          <p className="text-sm font-medium">System Default</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Settings;
