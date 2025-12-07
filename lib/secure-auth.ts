import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from './storage';
import type { User } from '../shared/schema';
import { unsign } from 'cookie-signature';
import { Pool } from 'pg';

/**
 * Secure session validation for API routes
 * This replaces the vulnerable base64 cookie parsing with proper server-side session validation
 */

// Session cookie parser that safely extracts signed session ID
function getSessionIdFromCookie(cookieHeader: string | undefined): string | null {
  if (!cookieHeader) return null;
  
  // Parse session ID from connect.sid cookie (standard express-session format)
  const match = cookieHeader.match(/connect\.sid=([^;]+)/);
  if (!match) return null;
  
  try {
    // Decode the URL-encoded session cookie
    const sessionCookie = decodeURIComponent(match[1]);
    
    // Return the full signed cookie (s:sessionId.signature) for verification
    return sessionCookie;
  } catch (error) {
    console.error('Error parsing session cookie:', error);
    return null;
  }
}

// Create PostgreSQL connection for session validation
const sessionPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Validate session against server-side session store
async function validateSession(sessionId: string): Promise<any | null> {
  try {
    const sessionSecret = process.env.SESSION_SECRET;
    if (!sessionSecret) {
      console.error('SESSION_SECRET environment variable is required but not set');
      return null;
    }
    
    console.log('Validating session:', sessionId ? 'present' : 'missing');
    
    let realSessionId: string;
    
    // Handle both signed and unsigned cookies
    if (sessionId.startsWith('s:')) {
      // Signed cookie - verify signature
      const unsigned = unsign(sessionId, sessionSecret);
      if (!unsigned) {
        console.log('Invalid session signature');
        return null;
      }
      realSessionId = unsigned;
      console.log('Session signature verified successfully');
    } else {
      // Unsigned cookie - use as is
      realSessionId = sessionId;
      console.log('Using unsigned session ID');
    }

    // Query the session from PostgreSQL store
    const sessionTable = process.env.SESSION_TABLE || 'session';
    const query = `SELECT sess FROM ${sessionTable} WHERE sid = $1 AND expire > NOW()`;
    
    console.log('Querying session table:', sessionTable);
    const result = await sessionPool.query(query, [realSessionId]);

    if (result.rows.length === 0) {
      console.log('Session not found or expired, rows:', result.rows.length);
      return null;
    }

    let sessionData = result.rows[0].sess;
    
    // Handle both JSON object and string formats
    if (typeof sessionData === 'string') {
      try {
        sessionData = JSON.parse(sessionData);
      } catch (parseError) {
        console.error('Failed to parse session JSON:', parseError);
        return null;
      }
    }

    if (!sessionData || !sessionData.passport || !sessionData.passport.user) {
      console.log('Invalid session data structure:', !!sessionData, !!sessionData?.passport, !!sessionData?.passport?.user);
      return null;
    }

    console.log('Session validation successful, user ID:', sessionData.passport.user);
    return sessionData;
  } catch (error) {
    console.error('Session validation error:', error);
    return null;
  }
}

/**
 * Secure replacement for getUserFromSession
 * This validates server-side sessions instead of parsing unsigned cookies
 */
export async function getSecureUserFromSession(req: VercelRequest): Promise<User | null> {
  try {
    const sessionId = getSessionIdFromCookie(req.headers.cookie);
    if (!sessionId) return null;

    const session = await validateSession(sessionId);
    if (!session || !session.passport || !session.passport.user) {
      return null;
    }

    // Get fresh user data from database using the session's user ID
    const userId = session.passport.user;
    const user = await storage.getUser(userId);
    
    return user || null;
  } catch (error) {
    console.error('Secure session validation error:', error);
    return null;
  }
}

/**
 * Secure admin authorization helper
 */
export async function requireSecureAdmin(req: VercelRequest, res: VercelResponse): Promise<User | null> {
  const user = await getSecureUserFromSession(req);
  
  if (!user || user.role !== 'admin') {
    res.status(403).json({ message: 'Faqat administratorlar uchun' });
    return null;
  }
  
  return user;
}

/**
 * Secure teacher authorization helper
 */
export async function requireSecureTeacher(req: VercelRequest, res: VercelResponse): Promise<User | null> {
  const user = await getSecureUserFromSession(req);
  
  if (!user || user.role !== 'teacher') {
    res.status(403).json({ message: "Faqat o'qituvchilar uchun" });
    return null;
  }
  
  return user;
}

/**
 * Secure student authorization helper
 */
export async function requireSecureStudent(req: VercelRequest, res: VercelResponse): Promise<User | null> {
  const user = await getSecureUserFromSession(req);
  
  if (!user || user.role !== 'student') {
    res.status(403).json({ message: "Faqat talabalar uchun" });
    return null;
  }
  
  return user;
}

/**
 * Generic authentication helper - requires any logged in user
 */
export async function requireSecureAuth(req: VercelRequest, res: VercelResponse): Promise<User | null> {
  const user = await getSecureUserFromSession(req);
  
  if (!user) {
    res.status(401).json({ message: 'Autentifikatsiya talab qilinadi' });
    return null;
  }
  
  return user;
}

/**
 * Helper for student-or-own data access (students can access their own data, admins can access all)
 */
export async function requireSecureStudentOrOwn(req: VercelRequest, res: VercelResponse, resourceStudentId?: string): Promise<User | null> {
  const user = await getSecureUserFromSession(req);
  
  if (!user) {
    res.status(401).json({ message: 'Autentifikatsiya talab qilinadi' });
    return null;
  }
  
  // Admin can access everything
  if (user.role === 'admin') {
    return user;
  }
  
  // Students can only access their own data
  if (user.role === 'student') {
    const targetStudentId = resourceStudentId || req.query.id || req.body.studentId;
    if (targetStudentId && targetStudentId !== user.id) {
      res.status(403).json({ message: "Faqat o'z ma'lumotlaringizga kirish mumkin" });
      return null;
    }
    return user;
  }
  
  res.status(403).json({ message: 'Kirish rad etildi' });
  return null;
}

/**
 * Centralized helper to verify if a teacher can access a specific student
 * Ensures teachers can only access students in their assigned groups
 */
export async function requireTeacherAccessToStudent(req: VercelRequest, res: VercelResponse, studentId: string): Promise<User | null> {
  const user = await getSecureUserFromSession(req);
  
  if (!user) {
    res.status(401).json({ message: 'Autentifikatsiya talab qilinadi' });
    return null;
  }
  
  // Admin can access any student
  if (user.role === 'admin') {
    return user;
  }
  
  // Only teachers should use this function for student access
  if (user.role !== 'teacher') {
    res.status(403).json({ message: 'Kirish rad etildi' });
    return null;
  }
  
  // Verify teacher can manage this student through group assignments
  try {
    // Get teacher's groups
    const teacherGroups = await storage.getTeacherGroups(user.id);
    const teacherGroupIds = teacherGroups.map(tg => tg.groupId);
    
    // Get student's groups
    const studentGroups = await storage.getStudentGroups(studentId);
    
    // Check if student is in any of the teacher's groups
    const hasAccess = studentGroups.some(sg => teacherGroupIds.includes(sg.groupId));
    
    if (!hasAccess) {
      res.status(403).json({ message: "Bu o'quvchini boshqarish huquqingiz yo'q" });
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Error verifying teacher access to student:', error);
    res.status(500).json({ message: 'Ruxsat tekshirishda xatolik' });
    return null;
  }
}

/**
 * Check if a teacher can access a specific student (without sending responses)
 * Returns boolean for authorization checks within other functions
 */
export async function canTeacherAccessStudent(teacherId: string, studentId: string): Promise<boolean> {
  try {
    // Get teacher's groups
    const teacherGroups = await storage.getTeacherGroups(teacherId);
    const teacherGroupIds = teacherGroups.map(tg => tg.groupId);
    
    // Get student's groups
    const studentGroups = await storage.getStudentGroups(studentId);
    
    // Check if student is in any of the teacher's groups
    return studentGroups.some(sg => teacherGroupIds.includes(sg.groupId));
  } catch (error) {
    console.error('Error checking teacher access to student:', error);
    return false;
  }
}