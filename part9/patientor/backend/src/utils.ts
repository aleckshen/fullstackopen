import { z } from 'zod'
import { Gender } from './types'

export const NewPatientEntrySchema = z.object({
  name: z.string(),
  ssn: z.string(),
  dateOfBirth: z.string(),
  occupation: z.string(),
  gender: z.nativeEnum(Gender)
})
