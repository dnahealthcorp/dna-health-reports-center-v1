
/**
 * Calculate the age from a date of birth string
 * @param dateOfBirth Date of birth in string format
 * @returns Age in years as a number
 */
export const calculateAge = (dateOfBirth: string): number => {
  if (!dateOfBirth) return 0;
  
  const dob = new Date(dateOfBirth);
  const today = new Date();
  
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Calculate BMI from height (cm) and weight (kg)
 * @param height Height in cm
 * @param weight Weight in kg
 * @returns BMI value as a number with 1 decimal place
 */
export const calculateBMI = (height: string, weight: string): number => {
  if (!height || !weight) return 0;
  
  const heightInM = parseFloat(height) / 100;
  const weightInKg = parseFloat(weight);
  
  if (heightInM <= 0 || weightInKg <= 0) return 0;
  
  // BMI = weight (kg) / (height (m))^2
  const bmi = weightInKg / (heightInM * heightInM);
  return Math.round(bmi * 10) / 10;
};
