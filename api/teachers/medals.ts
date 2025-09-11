import { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { storage } from '../../lib/storage';
import { requireSecureTeacher } from '../../lib/secure-auth';

async function verifyTeacherCanManageStudent(teacherId: string, studentId: string): Promise<boolean> {
  // Get teacher's groups
  const teacherGroups = await storage.getTeacherGroups(teacherId);
  const teacherGroupIds = teacherGroups.map(tg => tg.groupId);
  
  // Get student's groups
  const studentGroups = await storage.getStudentGroups(studentId);
  
  // Check if student is in any of the teacher's groups
  return studentGroups.some(sg => teacherGroupIds.includes(sg.groupId));
}

const medalUpdateSchema = z.object({
  studentId: z.string(),
  medals: z.object({
    gold: z.number().min(0),
    silver: z.number().min(0),
    bronze: z.number().min(0),
  }),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'PUT') {
    // PUT /api/teachers/medals - Award medals to student
    const user = await requireSecureTeacher(req, res);
    if (!user) return;

    try {
      const { studentId, medals } = medalUpdateSchema.parse(req.body);
      
      // Verify teacher can manage this student
      const canManageStudent = await verifyTeacherCanManageStudent(user.id, studentId);
      if (!canManageStudent) {
        return res.status(403).json({ message: "Bu o'quvchini boshqarish huquqingiz yo'q" });
      }

      // Get current student data
      const student = await storage.getUser(studentId);
      if (!student) {
        return res.status(404).json({ message: "O'quvchi topilmadi" });
      }

      // Update student medals
      const updatedStudent = await storage.updateUser(studentId, { medals });
      if (!updatedStudent) {
        return res.status(500).json({ message: "Medallarni yangilashda xatolik" });
      }

      // Remove password from response
      const { password, ...studentWithoutPassword } = updatedStudent;
      
      return res.status(200).json({
        student: studentWithoutPassword,
        message: "Medallar muvaffaqiyatli yangilandi"
      });
    } catch (error) {
      console.error("Medallarni yangilashda xatolik:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Ma'lumotlarni to'g'ri kiriting",
          errors: error.errors
        });
      }
      return res.status(400).json({ message: "Medallarni yangilashda xatolik yuz berdi" });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}