import type { VercelRequest, VercelResponse } from '@vercel/node';
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

// Auto-generate login: 5 digits + 1 letter (6 characters total)
function generateLogin(): string {
  const digits = Math.floor(10000 + Math.random() * 90000).toString();
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const letter = letters.charAt(Math.floor(Math.random() * letters.length));
  return digits + letter;
}

// Auto-generate password: 6 digits
function generatePassword(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    // GET /api/students - Get all students
    const adminUser = await requireSecureAdmin(req, res);
    if (!adminUser) return;

    try {
      const students = await storage.getAllStudents();
      // Remove password from response
      const studentsWithoutPassword = students.map(({ password, ...student }) => student);
      return res.status(200).json(studentsWithoutPassword);
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
      // Auto-generate login and password
      let login = generateLogin();
      let attempts = 0;
      const maxAttempts = 10;
      
      // Ensure unique login by checking if email already exists
      while (attempts < maxAttempts) {
        const existingUser = await storage.getUserByEmail(login);
        if (!existingUser) break;
        login = generateLogin();
        attempts++;
      }
      
      if (attempts >= maxAttempts) {
        return res.status(500).json({ message: "Login yaratishda xatolik yuz berdi" });
      }
      
      const plainPassword = generatePassword();
      
      const studentData = insertUserSchema.parse({
        ...req.body,
        email: login,
        password: plainPassword,
        role: "student",
        medals: { gold: 0, silver: 0, bronze: 0 }
      });
      
      // Hash the password before storing
      studentData.password = await hashPassword(plainPassword);
      
      const student = await storage.createUser(studentData);
      
      // Remove password from response
      const { password, ...studentWithoutPassword } = student;
      
      // Broadcast real-time notification
      notificationService.broadcast({
        type: 'user_created',
        data: { ...studentWithoutPassword, role: 'student' },
        timestamp: new Date().toISOString()
      });
      
      // Return student data with generated credentials (plain password for admin to see)
      return res.status(201).json({
        ...studentWithoutPassword,
        generatedCredentials: {
          login: login,
          password: plainPassword
        }
      });
    } catch (error) {
      console.error("Talaba yaratishda xatolik:", error);
      return res.status(400).json({ message: "Talaba yaratishda xatolik yuz berdi" });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}