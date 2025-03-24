
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { MedicationSidebar } from "@/components/MedicationSidebar";

interface MedicationLayoutProps {
  children: React.ReactNode;
}

const MedicationLayout = ({ children }: MedicationLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <MedicationSidebar />
        <main className="flex-1 p-4 md:p-6">
          <div className="container mx-auto">
            <div className="flex items-center mb-4">
              <SidebarTrigger className="mr-2" />
            </div>
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default MedicationLayout;
