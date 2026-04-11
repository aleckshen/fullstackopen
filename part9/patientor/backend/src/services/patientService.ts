import patientData from '../../data/patients'
import { Patient, NonSensitivePatients } from '../types'

const patients: Patient[] = patientData as Patient[]

const getPatients = (): Patient[] => {
  return patients;
}

const getNonSensitivePatients = (): NonSensitivePatients[] => {
  return patients.map(({ id, name, dateOfBirth, gender, occupation }) => ({
    id,
    name,
    dateOfBirth,
    gender,
    occupation
  }))
}

export default {
  getPatients,
  getNonSensitivePatients
}
