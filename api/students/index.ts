import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../lib/storage';
import { insertUserSchema } from '../../shared/schema';
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
    // GET /api/students - Get all students
    const adminUser = await requireSecureAdmin(req, res);
    if (!adminUser) return;

    try {
      const students = await storage.getAllStudents();
      return res.status(200).json(students);
    } catch (error) {
      console.error("Talabalarni olishda xatolik:", error);
      return res.status(500).json({ message: "Talabalarni yuklashda xatolik" });
    }
  }

  if (req.method === 'POST') {
    // POST /api/students - Create student
    const adminUser = await requireSecureAdmin(req, res);
    if (!adminUser) return;

    try {
      const studentData = insertUserSchema.parse({
        ...req.body,
        role: "student",
        medals: { gold: 0, silver: 0, bronze: 0 }
      });
      
      // Hash the password before storing
      if (studentData.password) {
        studentData.password = await hashPassword(studentData.password);
      }
      
      const student = await storage.createUser(studentData);
      return res.status(201).json(student);
    } catch (error) {
      console.error("Talaba yaratishda xatolik:", error);
      return res.status(400).json({ message: "Talaba yaratishda xatolik yuz berdi" });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}