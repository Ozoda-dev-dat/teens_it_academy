import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../../lib/storage';
import { requireSecureAdmin, requireSecureTeacher, getSecureUserFromSession } from '../../../lib/secure-auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'Guruh ID noto\'g\'ri' });
  }

  if (req.method === 'GET') {
    // GET /api/groups/[id]/students - Get students in a specific group (admin or assigned teachers)
    const user = await getSecureUserFromSession(req);
    if (!user) {
      return res.status(401).json({ message: "Autentifikatsiya talab qilinadi" });
    }

    // Allow admin access to any group
    if (user.role === 'admin') {
      // Admin can access any group - keep existing logic
    } else if (user.role === 'teacher') {
      // Check if teacher is assigned to this group
      const teacherGroups = await storage.getTeacherGroups(user.id);
      const hasAccess = teacherGroups.some(tg => tg.groupId === id);
      
      if (!hasAccess) {
        return res.status(403).json({ message: "Bu guruh uchun o'quvchilarni ko'rish huquqingiz yo'q" });
      }
    } else {
      return res.status(403).json({ message: "Kirish rad etildi" });
    }

    try {
      // First verify the group exists
      const group = await storage.getGroup(id);
      if (!group) {
        return res.status(404).json({ message: "Guruh topilmadi" });
      }

      const groupStudents = await storage.getGroupStudents(id);
      return res.status(200).json(groupStudents);
    } catch (error) {
      console.error("Guruh talabalarini olishda xatolik:", error);
      return res.status(500).json({ message: "Guruh talabalarini yuklashda xatolik" });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}