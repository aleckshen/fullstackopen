import express from 'express';
import patientService from '../services/patientService'
import { toNewPatientEntry } from '../utils'

const router = express.Router()

router.get('/', (_req, res) => {
  res.send(patientService.getNonSensitivePatients())
})

router.post('/', (req, res) => {
  const newPatientEntry = toNewPatientEntry(req.body);
  const patientEntry = patientService.addPatient(newPatientEntry);
  res.json(patientEntry);
})

export default router
