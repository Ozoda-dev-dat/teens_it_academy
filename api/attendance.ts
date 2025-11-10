import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { storage } from '../lib/storage';
import { insertAttendanceSchema } from '../shared/schema';
import { notificationService } from '../server/notifications';
import { requireSecureAdmin } from '../lib/secure-auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    const adminUser = await requireSecureAdmin(req, res);
    if (!adminUser) return;

    try {
      console.log("Received attendance data:", req.body);

      const bodyWithDate = {
        ...req.body,
        date: new Date(req.body.date)
      };
      
      const attendanceData = insertAttendanceSchema.parse(bodyWithDate);
      console.log("Parsed attendance data:", attendanceData);
      
      const group = await storage.getGroup(attendanceData.groupId);
      if (!group) {
        return res.status(404).json({ message: "Guruh topilmadi" });
      }
      
      const existingAttendance = await storage.getAttendanceByDate(attendanceData.groupId, attendanceData.date);
      if (existingAttendance) {
        return res.status(400).json({ message: "Bu sana uchun davomat allaqachon mavjud" });
      }
      const attendanceWithTracking = {
        ...attendanceData,
        createdById: adminUser.id,
        createdByRole: adminUser.role,
      };
      
      const attendance = await storage.createAttendance(attendanceWithTracking);
      
      notificationService.broadcast({
        type: 'attendance_created',
        data: { ...attendance, groupId: attendanceData.groupId },
        timestamp: new Date().toISOString()
      });
      
      return res.status(201).json(attendance);
    } catch (error) {
      console.error("Davomat yaratishda xatolik:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Ma'lumotlarni to'g'ri kiriting",
          errors: error.errors
        });
      }
      if (error instanceof Error) {
        return res.status(400).json({ message: "Davomat yaratishda xatolik: " + error.message });
      }
      return res.status(400).json({ message: "Davomat yaratishda xatolik" });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
