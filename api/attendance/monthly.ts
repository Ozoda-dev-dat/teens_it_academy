import type { VercelRequest, VercelResponse } from "@vercel/node";
import { storage } from "../../lib/storage";
import { requireSecureAdmin } from "../../lib/secure-auth";
import { z } from "zod";

const monthlyAttendanceSchema = z.object({
  groupId: z.string(),
  year: z.number().int().min(2020).max(2050),
  month: z.number().int().min(1).max(12),
});

interface MonthlyAttendanceData {
  year: number;
  month: number;
  groupId: string;
  students: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    attendance: Array<{
      day: number;
      status: 'arrived' | 'late' | 'absent' | 'no-record';
      attendanceId: string | null;
      createdByRole?: string;
      updatedAt?: string;
      updatedByRole?: string;
    }>;
    statistics: {
      totalDays: number;
      present: number;
      late: number;
      absent: number;
      attendanceRate: number;
    };
  }>;
  totalDaysInMonth: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const adminUser = await requireSecureAdmin(req, res);
    if (!adminUser) return;

    try {
      const { groupId, year, month } = req.query;
      
      const validatedParams = monthlyAttendanceSchema.parse({
        groupId: groupId as string,
        year: parseInt(year as string),
        month: parseInt(month as string),
      });

      const group = await storage.getGroup(validatedParams.groupId);
      if (!group) {
        return res.status(404).json({ message: "Guruh topilmadi" });
      }

      const groupStudents = await storage.getGroupStudents(validatedParams.groupId);
      
      const startDate = new Date(validatedParams.year, validatedParams.month - 1, 1);
      const endDate = new Date(validatedParams.year, validatedParams.month, 0, 23, 59, 59);
      const daysInMonth = endDate.getDate();
      const attendanceRecords = await storage.getAttendanceByDateRange(
        validatedParams.groupId,
        startDate,
        endDate
      );

      const monthlyData: MonthlyAttendanceData = {
        year: validatedParams.year,
        month: validatedParams.month,
        groupId: validatedParams.groupId,
        totalDaysInMonth: daysInMonth,
        students: groupStudents.map(groupStudent => {
          const student = groupStudent.student as any;
          
          const attendance = Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dayDate = new Date(validatedParams.year, validatedParams.month - 1, day);
            const dayAttendance = attendanceRecords.find((record: any) => {
              const recordDate = new Date(record.date);
              return recordDate.getDate() === day;
            });
            
            const participants = (dayAttendance?.participants as any[]) || [];
            const studentAttendance = participants.find(
              (p: any) => p.studentId === student.id
            );
            
            return {
              day,
              status: studentAttendance?.status || 'no-record',
              attendanceId: dayAttendance?.id || null,
              createdByRole: dayAttendance?.createdByRole,
              updatedAt: dayAttendance?.updatedAt ? new Date(dayAttendance.updatedAt).toISOString() : undefined,
              updatedByRole: dayAttendance?.updatedByRole || undefined,
            };
          });
          const presentDays = attendance.filter(a => a.status === 'arrived').length;
          const lateDays = attendance.filter(a => a.status === 'late').length;
          const absentDays = attendance.filter(a => a.status === 'absent').length;
          const recordedDays = attendance.filter(a => a.status !== 'no-record').length;
          const attendanceRate = recordedDays > 0 ? Math.round(((presentDays + lateDays) / recordedDays) * 100) : 0;

          return {
            id: student.id,
            firstName: student.firstName,
            lastName: student.lastName,
            email: student.email,
            attendance,
            statistics: {
              totalDays: recordedDays,
              present: presentDays,
              late: lateDays,
              absent: absentDays,
              attendanceRate,
            },
          };
        }),
      };

      return res.status(200).json(monthlyData);
    } catch (error) {
      console.error("Oylik davomat ma'lumotlarini olishda xatolik:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Noto'g'ri parametrlar",
          errors: error.errors
        });
      }
      return res.status(500).json({ message: "Oylik davomat ma'lumotlarini yuklashda xatolik" });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
