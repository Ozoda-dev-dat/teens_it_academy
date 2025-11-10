import { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { storage } from '../../lib/storage';
import { insertAttendanceSchema } from '../../shared/schema';
import { requireSecureTeacher } from '../../lib/secure-auth';
import { isScheduledClassDay, getUzbekDayName } from '../../shared/utils';

async function verifyTeacherGroup(teacherId: string, groupId: string): Promise<boolean> {
  const teacherGroups = await storage.getTeacherGroups(teacherId);
  return teacherGroups.some(tg => tg.groupId === groupId);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    const user = await requireSecureTeacher(req, res);
    if (!user) return;

    try {
      const attendanceData = insertAttendanceSchema.parse(req.body);
      
      const canManageGroup = await verifyTeacherGroup(user.id, attendanceData.groupId);
      if (!canManageGroup) {
        return res.status(403).json({ message: "Bu guruhni boshqarish huquqingiz yo'q" });
      }

      const today = new Date();
      const attendanceDate = new Date(attendanceData.date);
      const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const attendanceDateOnly = new Date(attendanceDate.getFullYear(), attendanceDate.getMonth(), attendanceDate.getDate());
      
      if (attendanceDateOnly.getTime() !== todayDateOnly.getTime()) {
        return res.status(403).json({ 
          message: "O'qituvchilar faqat bugungi sana uchun davomat belgilashi mumkin. O'tmish yoki kelajak sanalar uchun davomat belgilab bo'lmaydi." 
        });
      }
      const group = await storage.getGroup(attendanceData.groupId);
      if (!group) {
        return res.status(404).json({ message: "Guruh topilmadi" });
      }

      const schedule = group.schedule as string[] | null;
      if (!isScheduledClassDay(schedule, today)) {
        const todayName = getUzbekDayName(today);
        return res.status(403).json({ 
          message: `Bugun (${todayName}) bu guruh uchun dars kuni emas. Faqat jadvalda belgilangan kunlarda davomat belgilash mumkin.`
        });
      }

      const existingAttendance = await storage.getAttendanceByDate(attendanceData.groupId, attendanceData.date);
      if (existingAttendance) {
        return res.status(400).json({ 
          message: "Bu guruh uchun bugungi sana uchun davomat allaqachon belgilangan. Har kuni faqat bir marta davomat belgilash mumkin." 
        });
      }
      const attendanceWithTracking = {
        ...attendanceData,
        createdById: user.id,
        createdByRole: user.role,
      };
      
      const attendance = await storage.createAttendance(attendanceWithTracking);
      return res.status(201).json(attendance);
    } catch (error) {
      console.error("Davomat belgilashda xatolik:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Ma'lumotlarni to'g'ri kiriting",
          errors: error.errors
        });
      }
      return res.status(400).json({ message: "Davomat belgilashda xatolik yuz berdi" });
    }
  }

  if (req.method === 'PUT') {
    const user = await requireSecureTeacher(req, res);
    if (!user) return;

    const { attendanceId } = req.query;
    
    if (!attendanceId || typeof attendanceId !== 'string') {
      return res.status(400).json({ message: "Davomat ID talab qilinadi" });
    }

    try {
      const existingAttendance = await storage.getAttendance(attendanceId);
      if (!existingAttendance) {
        return res.status(404).json({ message: "Davomat yozuvi topilmadi" });
      }
      const canManageGroup = await verifyTeacherGroup(user.id, existingAttendance.groupId);
      if (!canManageGroup) {
        return res.status(403).json({ message: "Bu guruhni boshqarish huquqingiz yo'q" });
      }

      const today = new Date();
      const attendanceDate = new Date(existingAttendance.date);
      
      const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const attendanceDateOnly = new Date(attendanceDate.getFullYear(), attendanceDate.getMonth(), attendanceDate.getDate());
      
      if (attendanceDateOnly.getTime() !== todayDateOnly.getTime()) {
        return res.status(403).json({ 
          message: "O'qituvchilar faqat bugungi sana uchun davomat o'zgartirishi mumkin. O'tmish yoki kelajak sanalar uchun davomat o'zgartirib bo'lmaydi." 
        });
      }
      const groupForUpdate = await storage.getGroup(existingAttendance.groupId);
      if (!groupForUpdate) {
        return res.status(404).json({ message: "Guruh topilmadi" });
      }

      const scheduleForUpdate = groupForUpdate.schedule as string[] | null;
      if (!isScheduledClassDay(scheduleForUpdate, today)) {
        const todayName = getUzbekDayName(today);
        return res.status(403).json({ 
          message: `Bugun (${todayName}) bu guruh uchun dars kuni emas. Faqat jadvalda belgilangan kunlarda davomat o'zgartirish mumkin.`
        });
      }
      const attendanceData = insertAttendanceSchema.parse({
        ...req.body,
        date: new Date(req.body.date)
      });
      const group = await storage.getGroup(attendanceData.groupId);
      if (!group) {
        return res.status(404).json({ message: "Guruh topilmadi" });
      }

      if (attendanceData.groupId !== existingAttendance.groupId) {
        return res.status(400).json({ message: "Guruh ID o'zgartirib bo'lmaydi" });
      }
      const attendanceWithTracking = {
        ...attendanceData,
        updatedAt: new Date(),
        updatedById: user.id,
        updatedByRole: user.role,
      };
      
      const updatedAttendance = await storage.updateAttendance(attendanceId, attendanceWithTracking);
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

  if (req.method === 'GET') {
    const user = await requireSecureTeacher(req, res);
    if (!user) return;

    const { groupId } = req.query;
    
    if (!groupId || typeof groupId !== 'string') {
      return res.status(400).json({ message: "Guruh ID talab qilinadi" });
    }

    try {
      const canManageGroup = await verifyTeacherGroup(user.id, groupId);
      if (!canManageGroup) {
        return res.status(403).json({ message: "Bu guruhni ko'rish huquqingiz yo'q" });
      }

      const attendance = await storage.getGroupAttendance(groupId);
      return res.status(200).json(attendance);
    } catch (error) {
      console.error("Davomat ma'lumotlarini olishda xatolik:", error);
      return res.status(500).json({ message: "Davomat ma'lumotlarini yuklashda xatolik" });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
