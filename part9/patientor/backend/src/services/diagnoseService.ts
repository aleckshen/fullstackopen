import diagnosesData from '../../data/diagnoses';
import { Diagnose } from '../types'

const diagnoses: Diagnose[] = diagnosesData as Diagnose[]

const getDiagnoses = (): Diagnose[] => {
  return diagnoses;
};

export default {
  getDiagnoses
};
