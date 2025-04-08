
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchControlsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const SearchControls = ({ searchQuery, onSearchChange }: SearchControlsProps) => {
  return (
    <div className="relative mb-8">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
      <Input 
        placeholder="Search patients by name or medical record number..." 
        className="pl-10" 
        value={searchQuery} 
        onChange={(e) => onSearchChange(e.target.value)} 
      />
    </div>
  );
};

export default SearchControls;
