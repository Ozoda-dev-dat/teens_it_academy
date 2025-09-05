import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../lib/storage';
import { insertUserSchema } from '../../shared/schema';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

function getUserFromSession(req: VercelRequest) {
  try {
    const sessionCookie = req.cookies?.session;
    if (!sessionCookie) return null;
    
    const sessionData = Buffer.from(sessionCookie, 'base64').toString('utf-8');
    return JSON.parse(sessionData);
  } catch {
    return null;
  }
}

function requireAuth(req: VercelRequest, res: VercelResponse) {
  const user = getUserFromSession(req);
  if (!user) {
    res.status(401).json({ message: "Autentifikatsiya talab qilinadi" });
    return null;
  }
  return user;
}

function requireStudentOrOwn(req: VercelRequest, res: VercelResponse) {
  const user = requireAuth(req, res);
  if (!user) return null;

  if (user.role === "admin") {
    return user; // Admin can access everything
  }
  
  if (user.role === "student") {
    // Students can only access their own data
    const studentId = req.query.id;
    if (studentId && studentId !== user.id) {
      res.status(403).json({ message: "Faqat o'z ma'lumotlaringizga kirish mumkin" });
      return null;
    }
    return user;
  }
  
  res.status(403).json({ message: "Kirish rad etildi" });
  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid student ID' });
  }

  if (req.method === 'GET') {
    // GET /api/students/[id] - Get student by ID
    if (!requireStudentOrOwn(req, res)) return;

    try {
      const student = await storage.getUser(id);
      if (!student) {
        return res.status(404).json({ message: "Talaba topilmadi" });
      }
      return res.status(200).json(student);
    } catch (error) {
      console.error("Talaba ma'lumotlarini olishda xatolik:", error);
      return res.status(500).json({ message: "Talaba ma'lumotlarini yuklashda xatolik" });
    }
  }

  if (req.method === 'PUT') {
    // PUT /api/students/[id] - Update student
    if (!requireStudentOrOwn(req, res)) return;

    try {
      const updates = insertUserSchema.partial().parse(req.body);
      
      // Hash the password if it's being updated
      if (updates.password) {
        updates.password = await hashPassword(updates.password);
      }
      
      const student = await storage.updateUser(id, updates);
      if (!student) {
        return res.status(404).json({ message: "Talaba topilmadi" });
      }
      return res.status(200).json(student);
    } catch (error) {
      console.error("Talaba ma'lumotlarini yangilashda xatolik:", error);
      return res.status(400).json({ message: "Ma'lumotlarni yangilashda xatolik" });
    }
  }

  if (req.method === 'DELETE') {
    // DELETE /api/students/[id] - Delete student (admin only)
    const user = requireAuth(req, res);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: "Faqat administratorlar uchun" });
    }

    try {
      const deleted = await storage.deleteUser(id);
      if (!deleted) {
        return res.status(404).json({ message: "Talaba topilmadi" });
      }
      return res.status(200).json({ message: "Talaba muvaffaqiyatli o'chirildi" });
    } catch (error) {
      console.error("Talabani o'chirishda xatolik:", error);
      return res.status(500).json({ message: "Talabani o'chirishda xatolik" });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
