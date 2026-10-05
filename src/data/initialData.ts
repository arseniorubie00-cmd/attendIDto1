import { StudentProfile, AdminProfile, CampusEvent, AttendanceRecord, AppNotification } from '../types';

// Universities and Colleges in Cagayan de Oro City (CDO)
// USTP-CDO placed first and prominent as requested
export const UNIVERSITIES = [
  'USTP-CDO (University of Science and Technology of Southern Philippines)',
  'Xavier University – Ateneo de Cagayan (XU)',
  'Liceo de Cagayan University (LDCU)',
  'Capitol University (CU)',
  'PHINMA – Cagayan de Oro College (PHINMA COC)',
  'Lourdes College (LC - CDO)',
  'Southern Philippines College (SPC - CDO)',
  'Pilgrim Christian College (PCC - CDO)',
  'STI College – Cagayan de Oro',
  'Golden Heritage Polytechnic College (GHPC - CDO)',
  'Vineyard International Polytechnic College (CDO)',
  'Oro Bible Baptist Academy & College'
];

export const DEPARTMENTS = [
  'College of Computer Studies',
  'College of Engineering & Architecture',
  'College of Business & Accountancy',
  'College of Arts & Sciences',
  'College of Nursing & Allied Health Sciences',
  'College of Education',
  'College of Criminology'
];

export const COURSES = [
  'BS Information Technology (BSIT)',
  'BS Computer Science (BSCS)',
  'BS Information Systems (BSIS)',
  'BS Computer Engineering (BSCpE)',
  'BS Civil Engineering (BSCE)',
  'BS Electrical Engineering (BSEE)',
  'BS Accountancy (BSA)',
  'BS Business Administration (BSBA)',
  'BS Nursing (BSN)',
  'BS Psychology',
  'BS Criminology',
  'Bachelor of Secondary Education (BSEd)'
];

export const YEAR_LEVELS = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year'
];

// Clean ready-to-use initial states
export const INITIAL_STUDENTS: StudentProfile[] = [];
export const INITIAL_ADMINS: AdminProfile[] = [];
export const INITIAL_EVENTS: CampusEvent[] = [];
export const generateInitialAttendance = (): AttendanceRecord[] => [];
export const INITIAL_NOTIFICATIONS: AppNotification[] = [];
