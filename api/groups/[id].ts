import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../lib/storage';
import { insertGroupSchema } from '../../shared/schema';
import { requireSecureAdmin, requireSecureTeacher } from '../../lib/secure-auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid group ID' });
  }

  if (req.method === 'GET') {
    // GET /api/groups/[id] - Get group details with students (teachers and admins)
    const user = await requireSecureTeacher(req, res);
    if (!user) return;

    try {
      const group = await storage.getGroup(id);
      if (!group) {
        return res.status(404).json({ message: "Guruh topilmadi" });
      }

      // For teachers, verify they can access this group
      if (user.role === 'teacher') {
        const teacherGroups = await storage.getTeacherGroups(user.id);
        const canAccess = teacherGroups.some(tg => tg.groupId === id);
        if (!canAccess) {
          return res.status(403).json({ message: "Bu guruhni ko'rish huquqingiz yo'q" });
        }
      }

      // Get students for this group
      const students = await storage.getGroupStudents(id);
      
      return res.status(200).json({
        ...group,
        students
      });
    } catch (error) {
      console.error("Guruh ma'lumotlarini olishda xatolik:", error);
      return res.status(500).json({ message: "Guruh ma'lumotlarini yuklashda xatolik" });
    }
  }

  if (req.method === 'PUT') {
    // PUT /api/groups/[id] - Update group (admin only)
    const adminUser = await requireSecureAdmin(req, res);
    if (!adminUser) return;

    try {
      const updates = insertGroupSchema.partial().parse(req.body);
      const group = await storage.updateGroup(id, updates);
      if (!group) {
        return res.status(404).json({ message: "Guruh topilmadi" });
      }
      return res.status(200).json(group);
    } catch (error) {
      console.error("Guruh yangilashda xatolik:", error);
      return res.status(400).json({ message: "Guruh yangilashda xatolik" });
    }
  }

  if (req.method === 'DELETE') {
    // DELETE /api/groups/[id] - Delete group (admin only)
    const adminUser = await requireSecureAdmin(req, res);
    if (!adminUser) return;

    try {
      const deleted = await storage.deleteGroup(id);
      if (!deleted) {
        return res.status(404).json({ message: "Guruh topilmadi" });
      }
      return res.status(200).json({ message: "Guruh muvaffaqiyatli o'chirildi" });
    } catch (error) {
      console.error("Guruhni o'chirishda xatolik:", error);
      return res.status(500).json({ message: "Guruhni o'chirishda xatolik" });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}