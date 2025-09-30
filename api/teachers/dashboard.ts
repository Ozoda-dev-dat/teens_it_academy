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
          const groupStudents = await storage.getGroupStudents(tg.groupId);
          const attendance = await storage.getGroupAttendance(tg.groupId);
          
          // Flatten the student data structure to match what the teacher dashboard expects
          const students = groupStudents.map((gs: any) => ({
            id: gs.student.id,
            firstName: gs.student.firstName,
            lastName: gs.student.lastName,
            email: gs.student.email,
            role: gs.student.role,
            medals: gs.student.medals || { gold: 0, silver: 0, bronze: 0 },
            joinedAt: gs.joinedAt
          }));
          
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

      // Calculate today's attendance (students who attended today)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      let todayAttendance = 0;
      for (const tg of teacherGroups) {
        // Fetch all attendance records for this group (not just the recent 5)
        const allAttendance = await storage.getGroupAttendance(tg.groupId);
        const todayRecords = allAttendance.filter((record: any) => {
          const recordDate = new Date(record.date);
          return recordDate >= today && recordDate < tomorrow;
        });
        
        for (const record of todayRecords) {
          const participants = record.participants as any[] || [];
          const arrivedCount = participants.filter((p: any) => p.status === 'arrived').length;
          todayAttendance += arrivedCount;
        }
      }

      // Calculate total medals of all students in teacher's groups (deduplicated)
      const uniqueStudents = new Map<string, any>();
      for (const group of groupsWithDetails) {
        for (const student of group.students) {
          if (!uniqueStudents.has(student.id)) {
            uniqueStudents.set(student.id, student);
          }
        }
      }
      
      let medalsGiven = 0;
      for (const student of uniqueStudents.values()) {
        if (student.medals) {
          medalsGiven += (student.medals.gold || 0) + (student.medals.silver || 0) + (student.medals.bronze || 0);
        }
      }

      return res.status(200).json({
        teacher: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        },
        groups: groupsWithDetails,
        totalGroups: groupsWithDetails.length,
        totalStudents: groupsWithDetails.reduce((sum, group) => sum + group.totalStudents, 0),
        todayAttendance,
        medalsGiven
      });
    } catch (error) {
      console.error("O'qituvchi dashboard ma'lumotlarini olishda xatolik:", error);
      return res.status(500).json({ message: "Ma'lumotlarni yuklashda xatolik" });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}