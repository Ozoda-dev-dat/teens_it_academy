import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../lib/storage';
import { requireSecureTeacher } from '../../lib/secure-auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    // GET /api/teachers/dashboard - Get teacher's dashboard data
    const user = await requireSecureTeacher(req, res);
    if (!user) return;

    try {
      // Get teacher's assigned groups
      const teacherGroups = await storage.getTeacherGroups(user.id);
      
      // Get detailed information for each group
      const groupsWithDetails = await Promise.all(
        teacherGroups.map(async (tg) => {
          const group = await storage.getGroup(tg.groupId);
          const students = await storage.getGroupStudents(tg.groupId);
          const attendance = await storage.getGroupAttendance(tg.groupId);
          
          return {
            id: group?.id,
            name: group?.name,
            description: group?.description,
            schedule: group?.schedule,
            students: students,
            totalStudents: students.length,
            recentAttendance: attendance.slice(0, 5), // Last 5 attendance records
            assignedAt: tg.assignedAt
          };
        })
      );

      return res.status(200).json({
        teacher: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        },
        groups: groupsWithDetails,
        totalGroups: groupsWithDetails.length,
        totalStudents: groupsWithDetails.reduce((sum, group) => sum + group.totalStudents, 0)
      });
    } catch (error) {
      console.error("O'qituvchi dashboard ma'lumotlarini olishda xatolik:", error);
      return res.status(500).json({ message: "Ma'lumotlarni yuklashda xatolik" });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}