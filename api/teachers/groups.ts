import { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { storage } from '../../lib/storage';
import { insertTeacherGroupSchema } from '../../shared/schema';
import { requireSecureAdmin } from '../../lib/secure-auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    const adminUser = await requireSecureAdmin(req, res);
    if (!adminUser) return;

    try {
      const assignmentData = insertTeacherGroupSchema.parse(req.body);
      
      const assignment = await storage.assignTeacherToGroup(assignmentData);
      return res.status(201).json(assignment);
    } catch (error: any) {
      console.error("O'qituvchini guruhga tayinlashda xatolik:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Ma'lumotlarni to'g'ri kiriting",
          errors: error.errors
        });
      }
      
      if (error?.code === '23505' || error?.constraint?.includes('uniqueTeacherGroup')) {
        return res.status(409).json({ 
          message: "Bu o'qituvchi allaqachon ushbu guruhga tayinlangan" 
        });
      }
      
      return res.status(400).json({ message: "O'qituvchini guruhga tayinlashda xatolik" });
    }
  }

  if (req.method === 'DELETE') {
    const adminUser = await requireSecureAdmin(req, res);
    if (!adminUser) return;

    const { teacherId, groupId } = req.query;
    
    if (!teacherId || !groupId) {
      return res.status(400).json({ message: "O'qituvchi ID va Guruh ID talab qilinadi" });
    }

    try {
      const success = await storage.removeTeacherFromGroup(teacherId as string, groupId as string);
      if (success) {
        return res.status(200).json({ message: "O'qituvchi guruhdan muvaffaqiyatli olib tashlandi" });
      } else {
        return res.status(404).json({ message: "Tayinlash topilmadi" });
      }
    } catch (error) {
      console.error("O'qituvchini guruhdan olib tashlashda xatolik:", error);
      return res.status(500).json({ message: "O'qituvchini guruhdan olib tashlashda xatolik" });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
