
interface EmptyPatientStateProps {
  searchQuery: string;
  onClearSearch: () => void;
}

const EmptyPatientState = ({ searchQuery, onClearSearch }: EmptyPatientStateProps) => {
  return (
    <div className="text-center py-12">
      <p className="text-muted-foreground mb-2">No patients found</p>
      {searchQuery && (
        <p className="text-sm">
          Try adjusting your search or{" "}
          <button className="text-primary" onClick={onClearSearch}>
            clear the search
          </button>
        </p>
      )}
    </div>
  );
};

export default EmptyPatientState;
