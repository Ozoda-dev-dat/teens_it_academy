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
    const user = await requireSecureTeacher(req, res);
    if (!user) return;

    try {
      const group = await storage.getGroup(id);
      if (!group) {
        return res.status(404).json({ message: "Guruh topilmadi" });
      }

      if (user.role === 'teacher') {
        const teacherGroups = await storage.getTeacherGroups(user.id);
        const canAccess = teacherGroups.some(tg => tg.groupId === id);
        if (!canAccess) {
          return res.status(403).json({ message: "Bu guruhni ko'rish huquqingiz yo'q" });
        }
      }

      const groupStudents = await storage.getGroupStudents(id);
      
      const students = groupStudents.map((gs: any) => ({
        id: gs.student.id,
        firstName: gs.student.firstName,
        lastName: gs.student.lastName,
        email: gs.student.email,
        role: gs.student.role,
        medals: gs.student.medals || { gold: 0, silver: 0, bronze: 0 },
        joinedAt: gs.joinedAt
      }));
      
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
    const adminUser = await requireSecureAdmin(req, res);
    if (!adminUser) return;

    try {
      const updates = insertGroupSchema.partial().parse(req.body);
      
      if (updates.schedule) {
        const allGroups = await storage.getAllGroups();
        const newSchedule = updates.schedule as string[] || [];
        
        for (const existingGroup of allGroups) {
          if (existingGroup.id === id) continue;
          
          const existingSchedule = existingGroup.schedule as string[] || [];
          
          for (const newTime of newSchedule) {
            if (existingSchedule.includes(newTime)) {
              return res.status(400).json({ 
                message: `Ushbu vaqtda "${existingGroup.name}" guruhi mavjud, guruh vaqti va kunini o'zgartiring` 
              });
            }
          }
        }
      }
      
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
