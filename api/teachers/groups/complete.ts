import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../../lib/storage';
import { requireSecureAdmin } from '../../../lib/secure-auth';
import { z } from 'zod';

const completeTeacherGroupSchema = z.object({
  teacherGroupId: z.string(),
  completed: z.boolean()
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'PUT') {
    const adminUser = await requireSecureAdmin(req, res);
    if (!adminUser) return;

    try {
      const { teacherGroupId, completed } = completeTeacherGroupSchema.parse(req.body);
      
      const completedAt = completed ? new Date() : null;
      
      const updated = await storage.updateTeacherGroupStatus(teacherGroupId, completedAt);
      
      if (!updated) {
        return res.status(404).json({ message: "Tayinlash topilmadi" });
      }

      return res.status(200).json({
        message: completed 
          ? "Guruh muvaffaqiyatli tugatilgan deb belgilandi"
          : "Guruh qayta faol holga keltirildi",
        teacherGroup: updated
      });
    } catch (error) {
      console.error("Guruh holatini yangilashda xatolik:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Ma'lumotlarni to'g'ri kiriting",
          errors: error.errors
        });
      }
      return res.status(400).json({ message: "Guruh holatini yangilashda xatolik" });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
