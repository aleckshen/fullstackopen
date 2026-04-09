export const calculateBmi = (height: number, weight: number): string => {
  const heightInMeters = height / 100;
  const bmi: number = weight / (heightInMeters * heightInMeters);
  if (bmi < 18.5) {
    return 'Underweight'
  } else if (bmi < 24.9) {
    return 'Normal'
  } else if (bmi < 30) {
    return 'Overweight'
  } else {
    return 'Obese'
  }
}
