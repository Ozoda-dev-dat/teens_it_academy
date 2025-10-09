import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../lib/storage';
import { insertUserSchema } from '../../shared/schema';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import { requireSecureStudentOrOwn, requireSecureAdmin, requireTeacherAccessToStudent, canTeacherAccessStudent } from '../../lib/secure-auth';

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid student ID' });
  }

  if (req.method === 'GET') {
    const { getSecureUserFromSession } = await import('../../lib/secure-auth');
    const user = await getSecureUserFromSession(req);
    
    if (!user) {
      return res.status(401).json({ message: 'Autentifikatsiya talab qilinadi' });
    }
    if (user.role === 'admin') {
    } else if (user.role === 'student') {
      if (user.id !== id) {
        return res.status(403).json({ message: "Faqat o'z ma'lumotlaringizga kirish mumkin" });
      }
    } else if (user.role === 'teacher') {
      const hasAccess = await canTeacherAccessStudent(user.id, id);
      if (!hasAccess) {
        return res.status(403).json({ message: "Bu o'quvchini boshqarish huquqingiz yo'q" });
      }
    } else {
      return res.status(403).json({ message: 'Kirish rad etildi' });
    }

    try {
      const student = await storage.getUser(id);
      if (!student) {
        return res.status(404).json({ message: "Talaba topilmadi" });
      }
      
      const { password, ...studentWithoutPassword } = student;
      return res.status(200).json(studentWithoutPassword);
    } catch (error) {
      console.error("Talaba ma'lumotlarini olishda xatolik:", error);
      return res.status(500).json({ message: "Talaba ma'lumotlarini yuklashda xatolik" });
    }
  }

  if (req.method === 'PUT') {
    const user = await requireSecureStudentOrOwn(req, res, id);
    if (!user) return;

    try {
      const updates = insertUserSchema.partial().parse(req.body);
    
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
    const user = await requireSecureAdmin(req, res);
    if (!user) return;

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
