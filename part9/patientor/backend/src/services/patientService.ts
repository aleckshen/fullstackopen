import patientData from '../../data/patients'
import { Patient, NonSensitivePatients, NewPatient } from '../types'
import { v1 as uuid } from 'uuid'

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

const addPatient = (entry: NewPatient): Patient => {
  const newPatient = {
    id: uuid(),
    ...entry
  }

  patients.push(newPatient)
  return newPatient
}

export default {
  getPatients,
  getNonSensitivePatients,
  addPatient
}
