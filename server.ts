import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DB_DIR, 'database.json');

interface DatabaseSchema {
  students: any[];
  admins: any[];
  events: any[];
  attendance: any[];
  notifications: any[];
}

function initDb(): DatabaseSchema {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initial: DatabaseSchema = {
      students: [],
      admins: [],
      events: [],
      attendance: [],
      notifications: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse database file, resetting', e);
    const initial: DatabaseSchema = {
      students: [],
      admins: [],
      events: [],
      attendance: [],
      notifications: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
}

function readDb(): DatabaseSchema {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return initDb();
  }
}

function writeDb(data: DatabaseSchema): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing to database.json', e);
  }
}

async function startServer() {
  initDb();
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API ROUTE 1: Get full synchronized database
  app.get('/api/data', (_req, res) => {
    const db = readDb();
    res.json({
      students: db.students || [],
      admins: db.admins || [],
      events: db.events || [],
      attendance: db.attendance || [],
      notifications: db.notifications || []
    });
  });

  // API ROUTE 2: Authentication Login
  app.post('/api/auth/login', (req, res) => {
    const { email, password, role } = req.body || {};
    if (!email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Email, password, and role are required.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const db = readDb();

    if (role === 'admin') {
      const admin = db.admins.find((a: any) => a.email.toLowerCase() === cleanEmail);
      if (!admin) {
        const isStudent = db.students.find((s: any) => s.email.toLowerCase() === cleanEmail);
        if (isStudent) {
          return res.status(400).json({
            success: false,
            message: 'This email is registered as a Student. Please switch to Student Sign In.'
          });
        }
        return res.status(404).json({
          success: false,
          message: 'No organizer account found with this email. Please sign up first.'
        });
      }

      if (admin.password && admin.password !== password) {
        return res.status(401).json({ success: false, message: 'Incorrect password. Please verify credentials.' });
      }

      return res.json({ success: true, message: 'Signed in successfully!', user: admin });
    } else {
      const student = db.students.find((s: any) => s.email.toLowerCase() === cleanEmail);
      if (!student) {
        const isAdmin = db.admins.find((a: any) => a.email.toLowerCase() === cleanEmail);
        if (isAdmin) {
          return res.status(400).json({
            success: false,
            message: 'This email is registered as an Organizer. Please switch to Organizer Sign In.'
          });
        }
        return res.status(404).json({
          success: false,
          message: 'No student account found with this email. Please sign up first.'
        });
      }

      if (student.password && student.password !== password) {
        return res.status(401).json({ success: false, message: 'Incorrect password. Please verify credentials.' });
      }

      return res.json({ success: true, message: 'Signed in successfully!', user: student });
    }
  });

  // API ROUTE 3: Student Registration
  app.post('/api/auth/register-student', (req, res) => {
    const { fullName, email, password, school, yearLevel, department, course, avatarUrl } = req.body || {};
    if (!fullName || !email || !password || !school) {
      return res.status(400).json({ success: false, message: 'Full name, email, password, and CDO school are required.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const db = readDb();

    // Check if already registered
    const existing = db.students.find((s: any) => s.email.toLowerCase() === cleanEmail);
    if (existing) {
      return res.json({ success: true, user: existing, message: 'Account already exists. Logged in.' });
    }

    const uniqueHex = Math.random().toString(16).substring(2, 10).toUpperCase();
    const newStudent = {
      id: `stu-${Date.now()}`,
      role: 'student',
      fullName: String(fullName).trim(),
      email: cleanEmail,
      password: String(password).trim(),
      school: String(school).trim(),
      yearLevel: yearLevel || '1st Year',
      department: department || 'College of Computer Studies',
      course: course || 'BS Information Technology (BSIT)',
      avatarUrl: avatarUrl || '',
      qrCodeToken: `ATTENDIDTO:STU_${uniqueHex}`,
      savedEventIds: [],
      emailVerified: true,
      createdAt: new Date().toISOString()
    };

    db.students.unshift(newStudent);
    writeDb(db);

    res.json({ success: true, user: newStudent, message: 'Student registered successfully!' });
  });

  // API ROUTE 4: Organizer Registration
  app.post('/api/auth/register-admin', (req, res) => {
    const { fullName, email, password, school, organization, position, department, course, yearLevel, avatarUrl } = req.body || {};
    if (!fullName || !email || !password || !school || !organization) {
      return res.status(400).json({ success: false, message: 'Full name, email, password, school, and organization are required.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const db = readDb();

    const existing = db.admins.find((a: any) => a.email.toLowerCase() === cleanEmail);
    if (existing) {
      return res.json({ success: true, user: existing, message: 'Organization already exists. Logged in.' });
    }

    const newAdmin = {
      id: `admin-${Date.now()}`,
      role: 'admin',
      fullName: String(fullName).trim(),
      email: cleanEmail,
      password: String(password).trim(),
      school: String(school).trim(),
      organization: String(organization).trim(),
      position: position ? String(position).trim() : 'Event Officer',
      department: department || '',
      course: course || '',
      yearLevel: yearLevel || '',
      avatarUrl: avatarUrl || '',
      emailVerified: true,
      verifiedOrg: true,
      createdAt: new Date().toISOString()
    };

    db.admins.unshift(newAdmin);
    writeDb(db);

    res.json({ success: true, user: newAdmin, message: 'Organizer registered successfully!' });
  });

  // API ROUTE 5: Create Event
  app.post('/api/events', (req, res) => {
    const payload = req.body;
    if (!payload.title || !payload.organizerId) {
      return res.status(400).json({ success: false, message: 'Event title and organizer ID are required.' });
    }

    const db = readDb();
    const newEvent = {
      ...payload,
      id: `ev-${Date.now()}`,
      isLaunched: true,
      createdAt: new Date().toISOString()
    };

    db.events.unshift(newEvent);

    // Create system notification
    const notification = {
      id: `notif-${Date.now()}`,
      targetUserId: 'all',
      title: `New Event: ${newEvent.title}`,
      message: `${newEvent.organization} announced a new event on ${newEvent.date} at ${newEvent.venue}.`,
      type: 'event',
      timestamp: Date.now(),
      read: false,
      eventId: newEvent.id
    };
    db.notifications.unshift(notification);

    writeDb(db);
    res.json({ success: true, event: newEvent });
  });

  // API ROUTE 6: Multi-Device Attendance Scan (Centralized Database)
  app.post('/api/attendance/scan', (req, res) => {
    const { eventId, studentIdentifier, stationId, operatorLabel } = req.body || {};
    if (!eventId || !studentIdentifier) {
      return res.status(400).json({ success: false, message: 'Event ID and student identifier are required.' });
    }

    const cleanIdent = String(studentIdentifier).trim().toLowerCase();
    const db = readDb();

    const targetEvent = db.events.find((e: any) => e.id === eventId);
    if (!targetEvent) {
      return res.status(404).json({ success: false, message: 'Event not found in centralized database.' });
    }

    // Resolve student
    let student = db.students.find((s: any) => 
      s.id === studentIdentifier ||
      (s.qrCodeToken && s.qrCodeToken.toLowerCase() === cleanIdent) ||
      s.email.toLowerCase() === cleanIdent ||
      s.fullName.toLowerCase() === cleanIdent
    );

    if (!student) {
      // Auto-create attendee profile if not already in system
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
      db.students.unshift(student);
    }

    // Duplicate Check
    const existingRecord = db.attendance.find((a: any) =>
      a.eventId === eventId && (a.studentId === student.id || a.studentName.toLowerCase() === student.fullName.toLowerCase())
    );

    if (existingRecord) {
      return res.json({
        success: false,
        alreadyCheckedIn: true,
        student,
        record: existingRecord,
        message: `Already Checked In! Time in was at ${existingRecord.timeIn} (${existingRecord.stationId})`
      });
    }

    // Exact Time-In Timestamp
    const now = new Date();
    const timeIn = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });

    const newRecord = {
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
      stationId: stationId || 'Gate 1',
      verifiedBy: operatorLabel || 'Entrance Officer'
    };

    db.attendance.unshift(newRecord);
    writeDb(db);

    res.json({
      success: true,
      record: newRecord,
      student,
      message: `Success! ${student.fullName} checked in at ${timeIn}.`
    });
  });

  // API ROUTE 7: Student Profile Update
  app.put('/api/students/:id', (req, res) => {
    const studentId = req.params.id;
    const { yearLevel, department, course, avatarUrl } = req.body;
    const db = readDb();

    const studentIndex = db.students.findIndex((s: any) => s.id === studentId);
    if (studentIndex === -1) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    db.students[studentIndex] = {
      ...db.students[studentIndex],
      ...(yearLevel && { yearLevel }),
      ...(department && { department }),
      ...(course && { course }),
      ...(avatarUrl !== undefined && { avatarUrl })
    };

    writeDb(db);
    res.json({ success: true, user: db.students[studentIndex] });
  });

  // API ROUTE 8: Admin Profile Update
  app.put('/api/admins/:id', (req, res) => {
    const adminId = req.params.id;
    const { position, department, course, yearLevel, avatarUrl } = req.body;
    const db = readDb();

    const adminIndex = db.admins.findIndex((a: any) => a.id === adminId);
    if (adminIndex === -1) {
      return res.status(404).json({ success: false, message: 'Admin not found.' });
    }

    db.admins[adminIndex] = {
      ...db.admins[adminIndex],
      ...(position && { position }),
      ...(department && { department }),
      ...(course && { course }),
      ...(yearLevel && { yearLevel }),
      ...(avatarUrl !== undefined && { avatarUrl })
    };

    writeDb(db);
    res.json({ success: true, user: db.admins[adminIndex] });
  });

  // API ROUTE 9: Toggle RSVP Event
  app.post('/api/students/:id/rsvp', (req, res) => {
    const studentId = req.params.id;
    const { eventId } = req.body;
    const db = readDb();

    const studentIndex = db.students.findIndex((s: any) => s.id === studentId);
    if (studentIndex === -1) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const currentSaved = db.students[studentIndex].savedEventIds || [];
    const nextSaved = currentSaved.includes(eventId)
      ? currentSaved.filter((id: string) => id !== eventId)
      : [...currentSaved, eventId];

    db.students[studentIndex].savedEventIds = nextSaved;
    writeDb(db);
    res.json({ success: true, savedEventIds: nextSaved });
  });

  // API ROUTE 10: Mark Single Notification as Read
  app.put('/api/notifications/:id/read', (req, res) => {
    const notifId = req.params.id;
    const db = readDb();
    const notifIndex = db.notifications.findIndex((n: any) => n.id === notifId);
    if (notifIndex !== -1) {
      db.notifications[notifIndex].read = true;
      writeDb(db);
    }
    res.json({ success: true });
  });

  // API ROUTE 11: Mark All Notifications as Read
  app.put('/api/notifications/read-all', (req, res) => {
    const { userId } = req.body || {};
    const db = readDb();
    db.notifications = db.notifications.map((n: any) => {
      if (!userId || n.targetUserId === 'all' || n.targetUserId === 'all_students' || n.targetUserId === userId) {
        return { ...n, read: true };
      }
      return n;
    });
    writeDb(db);
    res.json({ success: true });
  });

  // API ROUTE 12: Verify Email Address
  app.post('/api/auth/verify-email', (req, res) => {
    const { email, role } = req.body || {};
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }
    const cleanEmail = String(email).trim().toLowerCase();
    const db = readDb();

    if (role === 'admin') {
      const idx = db.admins.findIndex((a: any) => a.email.toLowerCase() === cleanEmail);
      if (idx !== -1) {
        db.admins[idx].emailVerified = true;
        writeDb(db);
        return res.json({ success: true, user: db.admins[idx] });
      }
    } else {
      const idx = db.students.findIndex((s: any) => s.email.toLowerCase() === cleanEmail);
      if (idx !== -1) {
        db.students[idx].emailVerified = true;
        writeDb(db);
        return res.json({ success: true, user: db.students[idx] });
      }
    }
    res.status(404).json({ success: false, message: 'Account not found.' });
  });

  // Mount Vite Middleware in Development
  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.resolve(__dirname, 'dist'))) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AttendIDto Central Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
