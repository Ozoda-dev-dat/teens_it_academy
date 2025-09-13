import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { storage } from '../../lib/storage';
import { insertAttendanceSchema } from '../../shared/schema';
import { requireSecureAdmin } from '../../lib/secure-auth';
import { and, ne, eq } from 'drizzle-orm';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'Davomat ID noto\'g\'ri' });
  }

  if (req.method === 'PUT') {
    // PUT /api/attendance/[id] - Update attendance record (admin only)
    const adminUser = await requireSecureAdmin(req, res);
    if (!adminUser) return;

    try {
      // First verify the attendance record exists
      const existingAttendance = await storage.getAttendance(id);
      if (!existingAttendance) {
        return res.status(404).json({ message: "Davomat yozuvi topilmadi" });
      }

      console.log("Received attendance update data:", req.body);
      
      // Create a new object with converted date
      const bodyWithDate = {
        ...req.body,
        date: new Date(req.body.date)
      };
      
      const attendanceData = insertAttendanceSchema.parse(bodyWithDate);
      console.log("Parsed attendance update data:", attendanceData);
      
      // Verify the group exists
      const group = await storage.getGroup(attendanceData.groupId);
      if (!group) {
        return res.status(404).json({ message: "Guruh topilmadi" });
      }
      
      // Check for duplicate attendance record for same group and date (excluding current record)
      const duplicateAttendance = await storage.getAttendanceByDate(attendanceData.groupId, attendanceData.date);
      if (duplicateAttendance && duplicateAttendance.id !== id) {
        return res.status(400).json({ message: "Bu sana uchun davomat allaqachon mavjud" });
      }
      
      const updatedAttendance = await storage.updateAttendance(id, attendanceData);
      if (!updatedAttendance) {
        return res.status(404).json({ message: "Davomat yozuvini yangilashda xatolik" });
      }
      
      return res.status(200).json(updatedAttendance);
    } catch (error) {
      console.error("Davomat yangilashda xatolik:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Ma'lumotlarni to'g'ri kiriting",
          errors: error.errors
        });
      }
      if (error instanceof Error) {
        return res.status(400).json({ message: "Davomat yangilashda xatolik: " + error.message });
      }
      return res.status(400).json({ message: "Davomat yangilashda xatolik" });
    }
  }

  if (req.method === 'DELETE') {
    // DELETE /api/attendance/[id] - Delete attendance record (admin only)
    const adminUser = await requireSecureAdmin(req, res);
    if (!adminUser) return;

    try {
      // First verify the attendance record exists
      const existingAttendance = await storage.getAttendance(id);
      if (!existingAttendance) {
        return res.status(404).json({ message: "Davomat yozuvi topilmadi" });
      }

      const deleted = await storage.deleteAttendance(id);
      if (!deleted) {
        return res.status(500).json({ message: "Davomat yozuvini o'chirishda xatolik" });
      }

      return res.status(200).json({ message: "Davomat yozuvi muvaffaqiyatli o'chirildi" });
    } catch (error) {
      console.error("Davomat o'chirishda xatolik:", error);
      if (error instanceof Error) {
        return res.status(500).json({ message: "Davomat o'chirishda xatolik: " + error.message });
      }
      return res.status(500).json({ message: "Davomat o'chirishda xatolik" });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}