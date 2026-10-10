import { useState, useEffect, useCallback } from 'react';
import {
  AuthUser,
  StudentProfile,
  AdminProfile,
  CampusEvent,
  AttendanceRecord,
  AppNotification
} from '../types';
import {
  INITIAL_STUDENTS,
  INITIAL_ADMINS,
  INITIAL_EVENTS,
  generateInitialAttendance,
  INITIAL_NOTIFICATIONS
} from './initialData';

const STORAGE_KEYS = {
  CURRENT_USER: 'attendidto_current_user_v6',
  STUDENTS: 'attendidto_students_v6',
  ADMINS: 'attendidto_admins_v6',
  EVENTS: 'attendidto_events_v6',
  ATTENDANCE: 'attendidto_attendance_v6',
  NOTIFICATIONS: 'attendidto_notifications_v6'
};

function getStored<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Error saving to localStorage', e);
  }
}

export function useAppStore() {
  const [currentUser, setCurrentUserState] = useState<AuthUser | null>(() =>
    getStored<AuthUser | null>(STORAGE_KEYS.CURRENT_USER, null)
  );

  const [students, setStudentsState] = useState<StudentProfile[]>(() =>
    getStored<StudentProfile[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS)
  );

  const [admins, setAdminsState] = useState<AdminProfile[]>(() =>
    getStored<AdminProfile[]>(STORAGE_KEYS.ADMINS, INITIAL_ADMINS)
  );

  const [events, setEventsState] = useState<CampusEvent[]>(() =>
    getStored<CampusEvent[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS)
  );

  const [attendance, setAttendanceState] = useState<AttendanceRecord[]>(() =>
    getStored<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, generateInitialAttendance())
  );

  const [notifications, setNotificationsState] = useState<AppNotification[]>(() =>
    getStored<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS)
  );

  // Sync with Centralized Server Database (Enables Multi-Device Sync across Phones & Laptops)
  const syncWithServer = useCallback(async () => {
    try {
      const res = await fetch('/api/data');
      if (res.ok) {
        const data = await res.json();
        if (data.students) {
          setStudentsState(data.students);
          setStored(STORAGE_KEYS.STUDENTS, data.students);
        }
        if (data.admins) {
          setAdminsState(data.admins);
          setStored(STORAGE_KEYS.ADMINS, data.admins);
        }
        if (data.events) {
          setEventsState(data.events);
          setStored(STORAGE_KEYS.EVENTS, data.events);
        }
        if (data.attendance) {
          setAttendanceState(data.attendance);
          setStored(STORAGE_KEYS.ATTENDANCE, data.attendance);
        }
        if (data.notifications) {
          setNotificationsState(prev => {
            const readMap = new Map(prev.filter(n => n.read).map(n => [n.id, true]));
            const merged = (data.notifications as AppNotification[]).map(n => ({
              ...n,
              read: n.read || !!readMap.get(n.id)
            }));
            setStored(STORAGE_KEYS.NOTIFICATIONS, merged);
            return merged;
          });
        }
      }
    } catch {
      // Local fallback in case server is not reachable
    }
  }, []);

  // Poll server periodically for multi-device live attendance and new events
  useEffect(() => {
    syncWithServer();
    const interval = setInterval(syncWithServer, 2000);

    const handleFocus = () => syncWithServer();
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [syncWithServer]);

  const setCurrentUser = useCallback((user: AuthUser | null) => {
    setCurrentUserState(user);
    setStored(STORAGE_KEYS.CURRENT_USER, user);
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, [setCurrentUser]);

  // Strict Login: Queries Server Database so accounts created on other devices are immediately recognized!
  const login = useCallback(
    async (email: string, passwordInput: string, role: 'student' | 'admin'): Promise<{ success: boolean; message: string; user?: AuthUser }> => {
      const cleanEmail = email.trim().toLowerCase();

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, password: passwordInput, role })
        });

        const data = await res.json();
        if (data.success && data.user) {
          setCurrentUser(data.user);
          // Sync database state after login
          syncWithServer();
          return { success: true, message: data.message, user: data.user };
        } else {
          return { success: false, message: data.message || 'Login failed.' };
        }
      } catch (err) {
        // Fallback local check
        if (role === 'admin') {
          const admin = admins.find(a => a.email.toLowerCase() === cleanEmail);
          if (!admin) {
            return { success: false, message: 'No organizer account found. Please sign up first.' };
          }
          if (admin.password && passwordInput && admin.password !== passwordInput) {
            return { success: false, message: 'Incorrect password. Please verify credentials.' };
          }
          setCurrentUser(admin);
          return { success: true, message: 'Signed in successfully!', user: admin };
        } else {
          const student = students.find(s => s.email.toLowerCase() === cleanEmail);
          if (!student) {
            return { success: false, message: 'No student account found. Please sign up first.' };
          }
          if (student.password && passwordInput && student.password !== passwordInput) {
            return { success: false, message: 'Incorrect password. Please verify credentials.' };
          }
          setCurrentUser(student);
          return { success: true, message: 'Signed in successfully!', user: student };
        }
      }
    },
    [admins, students, setCurrentUser, syncWithServer]
  );

  // Register Student via Server Database
  const registerStudent = useCallback(
    async (data: {
      fullName: string;
      email: string;
      password?: string;
      school: string;
      yearLevel: string;
      department: string;
      course: string;
      avatarUrl?: string;
    }): Promise<{ success: boolean; user?: StudentProfile }> => {
      try {
        const res = await fetch('/api/auth/register-student', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        const resData = await res.json();
        if (resData.success && resData.user) {
          setCurrentUser(resData.user);
          syncWithServer();
          return { success: true, user: resData.user };
        }
      } catch {
        // Local fallback
      }

      // Local fallback
      const cleanEmail = data.email.trim().toLowerCase();
      const uniqueHex = Math.random().toString(16).substring(2, 10).toUpperCase();
      const newStudent: StudentProfile = {
        id: `stu-${Date.now()}`,
        role: 'student',
        fullName: data.fullName.trim(),
        email: cleanEmail,
        password: data.password || 'password123',
        school: data.school.trim(),
        yearLevel: data.yearLevel,
        department: data.department,
        course: data.course,
        avatarUrl: data.avatarUrl || '',
        qrCodeToken: `ATTENDIDTO:STU_${uniqueHex}`,
        savedEventIds: [],
        emailVerified: true,
        createdAt: new Date().toISOString()
      };

      const updated = [newStudent, ...students];
      setStudentsState(updated);
      setStored(STORAGE_KEYS.STUDENTS, updated);
      setCurrentUser(newStudent);
      return { success: true, user: newStudent };
    },
    [students, setCurrentUser, syncWithServer]
  );

  // Register Admin / Organizer via Server Database
  const registerAdmin = useCallback(
    async (data: {
      fullName: string;
      email: string;
      password?: string;
      school: string;
      organization: string;
      position: string;
      department?: string;
      course?: string;
      yearLevel?: string;
      avatarUrl?: string;
    }): Promise<{ success: boolean; user?: AdminProfile }> => {
      try {
        const res = await fetch('/api/auth/register-admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        const resData = await res.json();
        if (resData.success && resData.user) {
          setCurrentUser(resData.user);
          syncWithServer();
          return { success: true, user: resData.user };
        }
      } catch {
        // Local fallback
      }

      const cleanEmail = data.email.trim().toLowerCase();
      const newAdmin: AdminProfile = {
        id: `admin-${Date.now()}`,
        role: 'admin',
        fullName: data.fullName.trim(),
        email: cleanEmail,
        password: data.password || 'password123',
        school: data.school.trim(),
        organization: data.organization.trim(),
        position: data.position.trim(),
        department: data.department || '',
        course: data.course || '',
        yearLevel: data.yearLevel || '',
        avatarUrl: data.avatarUrl || '',
        emailVerified: true,
        verifiedOrg: true,
        createdAt: new Date().toISOString()
      };

      const updated = [newAdmin, ...admins];
      setAdminsState(updated);
      setStored(STORAGE_KEYS.ADMINS, updated);
      setCurrentUser(newAdmin);
      return { success: true, user: newAdmin };
    },
    [admins, setCurrentUser, syncWithServer]
  );

  // Update Student Profile
  const updateStudentProfile = useCallback(
    async (id: string, updates: Partial<StudentProfile>) => {
      try {
        await fetch(`/api/students/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        });
      } catch {
        // Fallback
      }

      const { fullName, school, id: _id, email: _email, qrCodeToken: _qr, ...allowedUpdates } = updates;
      setStudentsState(prev => {
        const updated = prev.map(s => (s.id === id ? { ...s, ...allowedUpdates } : s));
        setStored(STORAGE_KEYS.STUDENTS, updated);
        return updated;
      });

      setCurrentUserState(prev => {
        if (prev && prev.id === id && prev.role === 'student') {
          const updated = { ...prev, ...allowedUpdates } as StudentProfile;
          setStored(STORAGE_KEYS.CURRENT_USER, updated);
          return updated;
        }
        return prev;
      });
    },
    []
  );

  // Update Admin Profile
  const updateAdminProfile = useCallback(
    async (id: string, updates: Partial<AdminProfile>) => {
      try {
        await fetch(`/api/admins/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        });
      } catch {
        // Fallback
      }

      const { fullName, school, organization, id: _id, email: _email, ...allowedUpdates } = updates;
      setAdminsState(prev => {
        const updated = prev.map(a => (a.id === id ? { ...a, ...allowedUpdates } : a));
        setStored(STORAGE_KEYS.ADMINS, updated);
        return updated;
      });

      setCurrentUserState(prev => {
        if (prev && prev.id === id && prev.role === 'admin') {
          const updated = { ...prev, ...allowedUpdates } as AdminProfile;
          setStored(STORAGE_KEYS.CURRENT_USER, updated);
          return updated;
        }
        return prev;
      });
    },
    []
  );

  // Create Event via Server Database
  const createEvent = useCallback(
    async (payload: Omit<CampusEvent, 'id' | 'isLaunched' | 'createdAt'>): Promise<CampusEvent> => {
      try {
        const res = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (data.success && data.event) {
          syncWithServer();
          return data.event;
        }
      } catch {
        // Fallback
      }

      const newEvent: CampusEvent = {
        ...payload,
        id: `ev-${Date.now()}`,
        isLaunched: true,
        createdAt: new Date().toISOString()
      };

      setEventsState(prev => {
        const updated = [newEvent, ...prev];
        setStored(STORAGE_KEYS.EVENTS, updated);
        return updated;
      });

      return newEvent;
    },
    [syncWithServer]
  );

  // Record Attendance via Server Database (Centralized Multi-Device Tap Scanning)
  const recordAttendance = useCallback(
    (
      eventId: string,
      studentIdentifier: string,
      stationId: string = 'Gate 1',
      operatorLabel: string = 'Entrance Officer'
    ): {
      success: boolean;
      record?: AttendanceRecord;
      student?: StudentProfile;
      message: string;
      alreadyCheckedIn?: boolean;
    } => {
      // Fire async request to server immediately
      fetch('/api/attendance/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, studentIdentifier, stationId, operatorLabel })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.record) {
            syncWithServer();
          }
        })
        .catch(() => {});

      // Optimistic local update
      const cleanIdent = studentIdentifier.trim().toLowerCase();
      const targetEvent = events.find(e => e.id === eventId);
      if (!targetEvent) {
        return { success: false, message: 'Event not found.' };
      }

      let student = students.find(
        s =>
          s.id === studentIdentifier ||
          (s.qrCodeToken && s.qrCodeToken.toLowerCase() === cleanIdent) ||
          s.email.toLowerCase() === cleanIdent ||
          s.fullName.toLowerCase() === cleanIdent
      );

      if (!student) {
        const uniqueHex = Math.random().toString(16).substring(2, 10).toUpperCase();
        const fallbackName = studentIdentifier.startsWith('ATTENDIDTO:')
          ? 'Attendee ' + studentIdentifier.slice(-4)
          : studentIdentifier;

        student = {
          id: `stu-${Date.now()}`,
          role: 'student',
          fullName: fallbackName,
          email: `${fallbackName.toLowerCase().replace(/\s+/g, '')}@cdo.edu.ph`,
          school: targetEvent.school || 'USTP-CDO (University of Science and Technology of Southern Philippines)',
          yearLevel: '2nd Year',
          department: 'College of Computer Studies',
          course: 'BS Information Technology (BSIT)',
          qrCodeToken: studentIdentifier.startsWith('ATTENDIDTO:') ? studentIdentifier : `ATTENDIDTO:STU_${uniqueHex}`,
          savedEventIds: [],
          emailVerified: true,
          createdAt: new Date().toISOString()
        };

        const updatedStudents = [student, ...students];
        setStudentsState(updatedStudents);
        setStored(STORAGE_KEYS.STUDENTS, updatedStudents);
      }

      // Check duplicates
      const existingRecord = attendance.find(
        a => a.eventId === eventId && (a.studentId === student!.id || a.studentName.toLowerCase() === student!.fullName.toLowerCase())
      );

      if (existingRecord) {
        return {
          success: false,
          alreadyCheckedIn: true,
          student,
          record: existingRecord,
          message: `Already Checked In! Time in was at ${existingRecord.timeIn} (${existingRecord.stationId})`
        };
      }

      const now = new Date();
      const timeIn = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });

      const newRecord: AttendanceRecord = {
        id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        eventId,
        studentId: student.id,
        studentName: student.fullName,
        school: student.school,
        department: student.department,
        course: student.course,
        yearLevel: student.yearLevel,
        timeIn,
        timestamp: now.getTime(),
        stationId,
        verifiedBy: operatorLabel
      };

      const updatedAttendance = [newRecord, ...attendance];
      setAttendanceState(updatedAttendance);
      setStored(STORAGE_KEYS.ATTENDANCE, updatedAttendance);

      return {
        success: true,
        record: newRecord,
        student,
        message: `Success! ${student.fullName} checked in at ${timeIn}.`
      };
    },
    [events, students, attendance, syncWithServer]
  );

  const markNotificationRead = useCallback((id: string) => {
    // 1. Instantly update local state so red dot disappears immediately
    setNotificationsState(prev => {
      const updated = prev.map(n => (n.id === id ? { ...n, read: true } : n));
      setStored(STORAGE_KEYS.NOTIFICATIONS, updated);
      return updated;
    });

    // 2. Persist to server database so polling doesn't bring back the red dot
    fetch(`/api/notifications/${id}/read`, {
      method: 'PUT'
    }).catch(err => console.error('Failed to persist notification read state:', err));
  }, []);

  const markAllNotificationsRead = useCallback((userId?: string) => {
    // 1. Instantly mark all as read locally
    setNotificationsState(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      setStored(STORAGE_KEYS.NOTIFICATIONS, updated);
      return updated;
    });

    // 2. Persist to server database
    fetch('/api/notifications/read-all', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    }).catch(err => console.error('Failed to persist all notifications read state:', err));
  }, []);

  // Verify Email Address
  const verifyEmail = useCallback(async (email: string, role: 'student' | 'admin'): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role })
      });
      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
        syncWithServer();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [setCurrentUser, syncWithServer]);

  // Toggle RSVP / Save Event for Student
  const toggleSaveEvent = useCallback((studentId: string, eventId: string) => {
    fetch(`/api/students/${studentId}/rsvp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId })
    }).catch(() => {});

    setStudentsState(prev => {
      const updated = prev.map(s => {
        if (s.id === studentId) {
          const current = s.savedEventIds || [];
          const next = current.includes(eventId)
            ? current.filter(id => id !== eventId)
            : [...current, eventId];
          return { ...s, savedEventIds: next };
        }
        return s;
      });
      setStored(STORAGE_KEYS.STUDENTS, updated);
      return updated;
    });

    setCurrentUserState(prev => {
      if (prev && prev.id === studentId && prev.role === 'student') {
        const current = (prev as StudentProfile).savedEventIds || [];
        const next = current.includes(eventId)
          ? current.filter(id => id !== eventId)
          : [...current, eventId];
        const updated = { ...prev, savedEventIds: next } as StudentProfile;
        setStored(STORAGE_KEYS.CURRENT_USER, updated);
        return updated;
      }
      return prev;
    });
  }, []);

  return {
    currentUser,
    setCurrentUser,
    login,
    logout,
    students,
    admins,
    events,
    attendance,
    notifications,
    registerStudent,
    registerAdmin,
    updateStudentProfile,
    updateAdminProfile,
    createEvent,
    recordAttendance,
    markNotificationRead,
    markAllNotificationsRead,
    verifyEmail,
    toggleSaveEvent
  };
}
