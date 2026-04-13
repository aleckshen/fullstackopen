import { NewPatient, Gender } from './types'

const isString = (text: unknown): text is string => {
  return typeof text === 'string' || text instanceof String;
};

const isGender = (param: string): param is Gender => {
  return Object.values(Gender).map(v => v.toString()).includes(param);
};

const parseName = (name: unknown): string => {
  if (!isString(name) || !name) throw new Error('Missing or invalid name');
  return name;
};

const parseSsn = (ssn: unknown): string => {
  if (!isString(ssn) || !ssn) throw new Error('Missing or invalid ssn');
  return ssn;
};

const parseDateOfBirth = (dateOfBirth: unknown): string => {
  if (!isString(dateOfBirth) || !dateOfBirth) throw new Error('Missing or invalid dateOfBirth');
  return dateOfBirth;
};

const parseOccupation = (occupation: unknown): string => {
  if (!isString(occupation) || !occupation) throw new Error('Missing or invalid occupation');
  return occupation;
};

const parseGender = (gender: unknown): Gender => {
  if (!isString(gender) || !isGender(gender)) throw new Error('Missing or invalid gender');
  return gender;
};

export const toNewPatientEntry = (object: unknown): NewPatient => {
  if (!object || typeof object !== 'object') throw new Error('Invalid data');
  const obj = object as Record<string, unknown>;

  return {
    name: parseName(obj.name),
    ssn: parseSsn(obj.ssn),
    dateOfBirth: parseDateOfBirth(obj.dateOfBirth),
    occupation: parseOccupation(obj.occupation),
    gender: parseGender(obj.gender)
  };
};
