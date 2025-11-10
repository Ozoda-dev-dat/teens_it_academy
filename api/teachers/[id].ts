import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../lib/storage';
import { requireSecureAdmin } from '../../lib/secure-auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const adminUser = await requireSecureAdmin(req, res);
    if (!adminUser) return;

    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: "O'qituvchi ID talab qilinadi" });
    }

    try {
      const teacher = await storage.getTeacher(id);
      if (!teacher) {
        return res.status(404).json({ message: "O'qituvchi topilmadi" });
      }

      const teacherGroups = await storage.getTeacherGroups(id);
    
      const groupsWithDetails = await Promise.all(
        teacherGroups.map(async (tg) => {
          const group = await storage.getGroup(tg.groupId);
          const groupStudents = await storage.getGroupStudents(tg.groupId);
          const attendance = await storage.getGroupAttendance(tg.groupId);
          
          return {
            id: group?.id,
            name: group?.name,
            description: group?.description,
            schedule: group?.schedule,
            status: tg.status,
            assignedAt: tg.assignedAt,
            completedAt: tg.completedAt,
            totalStudents: groupStudents.length,
            totalClasses: attendance.length,
            teacherGroupId: tg.id
          };
        })
      );
      const activeGroups = groupsWithDetails.filter(g => g.status === 'active');
      const completedGroups = groupsWithDetails.filter(g => g.status === 'completed');

      const { password, ...teacherWithoutPassword } = teacher;

      return res.status(200).json({
        teacher: teacherWithoutPassword,
        groups: {
          active: activeGroups,
          completed: completedGroups,
          total: groupsWithDetails.length
        },
        stats: {
          totalGroups: groupsWithDetails.length,
          activeGroups: activeGroups.length,
          completedGroups: completedGroups.length,
          totalStudents: groupsWithDetails.reduce((sum, group) => sum + group.totalStudents, 0),
          totalClasses: groupsWithDetails.reduce((sum, group) => sum + group.totalClasses, 0)
        }
      });
    } catch (error) {
      console.error("O'qituvchi ma'lumotlarini olishda xatolik:", error);
      return res.status(500).json({ message: "O'qituvchi ma'lumotlarini yuklashda xatolik" });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
