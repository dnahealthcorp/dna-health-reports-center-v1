
export const calculateBMI = (height: string, weight: string): string => {
  if (!height || !weight) return '-';
  
  let heightInMeters = 0;
  if (height.includes("'")) {
    const parts = height.replace(/"/g, '').split("'");
    const feet = parseFloat(parts[0]);
    const inches = parseFloat(parts[1] || '0');
    heightInMeters = ((feet * 12) + inches) * 0.0254;
  } else {
    heightInMeters = parseFloat(height) / 100;
  }
  
  let weightInKg = parseFloat(weight);
  if (height.includes('lbs')) {
    weightInKg = weightInKg * 0.45359237;
  }
  
  if (isNaN(heightInMeters) || isNaN(weightInKg) || heightInMeters === 0) return '-';
  
  const bmi = weightInKg / (heightInMeters * heightInMeters);
  return bmi.toFixed(1);
};

export const calculateAge = (dateOfBirth: string): string => {
  if (!dateOfBirth) return '-';
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age.toString();
};
