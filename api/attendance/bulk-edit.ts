import type { VercelRequest, VercelResponse } from "@vercel/node";
import { storage } from "../../lib/storage";
import { requireSecureAdmin } from "../../lib/secure-auth";
import { insertAttendanceSchema } from "../../shared/schema";
import { z } from "zod";

const bulkEditSchema = z.object({
  updates: z.array(z.object({
    attendanceId: z.string(),
    data: insertAttendanceSchema.partial()
  }))
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'PUT') {
    const adminUser = await requireSecureAdmin(req, res);
    if (!adminUser) return;

    try {
      const requestData = bulkEditSchema.parse(req.body);
      
      const results = [];
      const errors = [];

      for (let i = 0; i < requestData.updates.length; i++) {
        const update = requestData.updates[i];
        
        try {
          const existingAttendance = await storage.getAttendance(update.attendanceId);
          if (!existingAttendance) {
            errors.push({
              index: i,
              attendanceId: update.attendanceId,
              error: "Davomat yozuvi topilmadi"
            });
            continue;
          }

          const updateData = {
            ...update.data,
            updatedAt: new Date(),
            updatedById: adminUser.id,
            updatedByRole: adminUser.role,
          };

          if (update.data.date) {
            updateData.date = new Date(update.data.date);
          }

          if (update.data.date || update.data.groupId) {
            const checkGroupId = update.data.groupId || existingAttendance.groupId;
            const checkDate = update.data.date ? new Date(update.data.date) : existingAttendance.date;
            
            const duplicateAttendance = await storage.getAttendanceByDate(checkGroupId, checkDate);
            if (duplicateAttendance && duplicateAttendance.id !== update.attendanceId) {
              errors.push({
                index: i,
                attendanceId: update.attendanceId,
                error: "Bu sana uchun davomat allaqachon mavjud"
              });
              continue;
            }
          }

          const updatedAttendance = await storage.updateAttendance(update.attendanceId, updateData);
          if (updatedAttendance) {
            results.push({
              index: i,
              attendanceId: update.attendanceId,
              success: true,
              data: updatedAttendance
            });
          } else {
            errors.push({
              index: i,
              attendanceId: update.attendanceId,
              error: "Davomat yozuvini yangilashda xatolik"
            });
          }
        } catch (error) {
          console.error(`Bulk edit error for attendance ${update.attendanceId}:`, error);
          errors.push({
            index: i,
            attendanceId: update.attendanceId,
            error: error instanceof Error ? error.message : "Noma'lum xatolik"
          });
        }
      }

      const response = {
        totalUpdates: requestData.updates.length,
        successful: results.length,
        failed: errors.length,
        results,
        errors
      };

      if (results.length > 0) {
        return res.status(200).json(response);
      } else {
        return res.status(400).json({
          message: "Hech qanday davomat yozuvi yangilanmadi",
          ...response
        });
      }
    } catch (error) {
      console.error("Bulk edit xatolik:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Ma'lumotlarni to'g'ri kiriting",
          errors: error.errors
        });
      }
      return res.status(500).json({ message: "Davomat yozuvlarini yangilashda xatolik" });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
