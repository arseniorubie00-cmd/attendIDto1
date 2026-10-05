export type UserRole = 'student' | 'admin';

export interface StudentProfile {
  id: string;
  role: 'student';
  fullName: string;
  email: string;
  password?: string;
  school: string;
  yearLevel: string; // e.g. "1st Year", "2nd Year", "3rd Year", "4th Year"
  department: string; // e.g. "College of Computer Studies"
  course: string; // e.g. "BS Information Technology"
  avatarUrl?: string;
  qrCodeToken: string; // e.g. "ATTENDIDTO:STU_7A920B1C"
  savedEventIds?: string[]; // IDs of events the student has RSVP'd to
  emailVerified: boolean;
  createdAt: string;
}

export interface AdminProfile {
  id: string;
  role: 'admin';
  fullName: string;
  email: string;
  password?: string;
  school: string;
  organization: string; // e.g. "Computer Science Guild"
  position: string; // e.g. "President", "Auditor", "Event Chairperson"
  yearLevel?: string;
  department?: string;
  course?: string;
  avatarUrl?: string;
  emailVerified: boolean;
  verifiedOrg: boolean;
  createdAt: string;
}

export type AuthUser = StudentProfile | AdminProfile;

export interface EventTargetFilter {
  departments: string[];
  yearLevels: string[];
  courses: string[];
}

export interface CampusEvent {
  id: string;
  organizerId: string;
  organizerName: string;
  organization: string;
  school: string;
  title: string;
  description: string;
  category: 'Academic' | 'Organization' | 'Sports' | 'Seminar' | 'General Assembly' | 'Workshop';
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  targetAttendees: number;
  isLaunched: boolean;
  targetFilter: EventTargetFilter;
  bannerUrl?: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  eventId: string;
  studentId: string;
  studentName: string;
  school: string;
  department: string;
  course: string;
  yearLevel: string;
  timeIn: string; // e.g. "08:24:12 AM"
  timestamp: number;
  stationId: string;
  verifiedBy: string;
}

export interface AppNotification {
  id: string;
  targetUserId: string;
  title: string;
  message: string;
  type: 'event' | 'attendance' | 'announcement';
  timestamp: number;
  read: boolean;
  eventId?: string;
}
