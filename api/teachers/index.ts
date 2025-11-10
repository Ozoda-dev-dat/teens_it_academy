import { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { storage } from '../../lib/storage';
import { insertUserSchema } from '../../shared/schema';
import { notificationService } from '../../server/notifications';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import { requireSecureAdmin } from '../../lib/secure-auth';

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const adminUser = await requireSecureAdmin(req, res);
    if (!adminUser) return;

    try {
      const teachers = await storage.getAllTeachers();
      const teachersWithoutPassword = teachers.map(({ password, ...teacher }) => teacher);
      return res.status(200).json(teachersWithoutPassword);
    } catch (error) {
      console.error("O'qituvchilarni olishda xatolik:", error);
      return res.status(500).json({ message: "O'qituvchilarni yuklashda xatolik" });
    }
  }

  if (req.method === 'POST') {
    const adminUser = await requireSecureAdmin(req, res);
    if (!adminUser) return;

    try {
      const teacherData = insertUserSchema.parse({
        ...req.body,
        role: "teacher",
        medals: { gold: 0, silver: 0, bronze: 0 }
      });
      
      if (teacherData.password) {
        teacherData.password = await hashPassword(teacherData.password);
      }
      
      const teacher = await storage.createUser(teacherData);
      const { password, ...teacherWithoutPassword } = teacher;
      
      notificationService.broadcast({
        type: 'user_created',
        data: { ...teacherWithoutPassword, role: 'teacher' },
        timestamp: new Date().toISOString()
      });
      
      return res.status(201).json(teacherWithoutPassword);
    } catch (error) {
      console.error("O'qituvchi yaratishda xatolik:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Ma'lumotlarni to'g'ri kiriting",
          errors: error.errors
        });
      }
      return res.status(400).json({ message: "O'qituvchi yaratishda xatolik yuz berdi" });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
