
// Generate a unique MRN
export const generateMRN = (): string => {
  try {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let mrn = "MRN-";
    for (let i = 0; i < 8; i++) {
      mrn += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return mrn;
  } catch (error) {
    console.error("Error generating MRN:", error);
    return `MRN-${Date.now()}`;
  }
};
