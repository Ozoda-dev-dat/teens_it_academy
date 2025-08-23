import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../../lib/storage';
import { z } from 'zod';

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

function requireAdmin(req: VercelRequest, res: VercelResponse) {
  const user = getUserFromSession(req);
  if (!user || user.role !== "admin") {
    res.status(403).json({ message: "Faqat administratorlar uchun" });
    return false;
  }
  return true;
}

const medalSchema = z.object({
  gold: z.number().min(0),
  silver: z.number().min(0),
  bronze: z.number().min(0)
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid student ID' });
  }

  if (req.method === 'PUT') {
    // PUT /api/students/[id]/medals - Update student medals
    if (!requireAdmin(req, res)) return;

    try {
      const medals = medalSchema.parse(req.body);
      const student = await storage.updateUser(id, { medals });
      
      if (!student) {
        return res.status(404).json({ message: "Talaba topilmadi" });
      }
      
      return res.status(200).json(student);
    } catch (error) {
      console.error("Medallarni yangilashda xatolik:", error);
      return res.status(400).json({ message: "Medallarni yangilashda xatolik" });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}