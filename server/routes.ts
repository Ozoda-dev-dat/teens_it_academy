import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { setupAuth } from "./auth";
import { notificationService } from "./notifications";
import { getSecureUserFromSession } from "../lib/secure-auth";
import { storage } from "./storage";
import { insertUserSchema, updateUserSchema, insertGroupSchema, insertAttendanceSchema, insertPaymentSchema, insertProductSchema, insertPurchaseSchema, insertGroupStudentSchema, insertTeacherGroupSchema } from "@shared/schema";
import { z } from "zod";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Auto-generate login: 5 digits + 1 letter (6 characters total)
function generateLogin(): string {
  const digits = Math.floor(10000 + Math.random() * 90000).toString();
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const letter = letters.charAt(Math.floor(Math.random() * letters.length));
  return digits + letter;
}

// Auto-generate password: 6 digits
function generatePassword(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Helper function to check if bronze medals can be awarded for attendance participants
async function canAwardBronzeMedalsForAttendance(participants: Array<{studentId: string, status: string}>): Promise<{canAward: boolean, issues: string[]}> {
  const issues: string[] = [];
  
  try {
    for (const participant of participants) {
      // Only check bronze medals for students who attended (status: 'arrived')
      if (participant.status === 'arrived') {
        const canAward = await storage.canAwardMedals(participant.studentId, 'bronze', 1);
        if (!canAward) {
          const student = await storage.getUser(participant.studentId);
          const studentName = student ? `${student.firstName} ${student.lastName}` : participant.studentId;
          issues.push(`${studentName} has reached monthly bronze medal limit (48)`);
        }
      }
    }
    
    return {
      canAward: issues.length === 0,
      issues
    };
  } catch (error) {
    console.error('Error checking bronze medal eligibility:', error);
    return {
      canAward: false,
      issues: ['Internal error checking medal eligibility']
    };
  }
}

// Helper function to automatically award bronze medals for attendance
async function awardBronzeMedalsForAttendance(participants: Array<{studentId: string, status: string}>, attendanceId: string) {
  try {
    for (const participant of participants) {
      // Only award bronze medals to students who attended (status: 'arrived')
      if (participant.status === 'arrived') {
        const result = await storage.awardMedalsSafelyWithTotals(participant.studentId, 'bronze', 1, 'attendance', attendanceId);
        if (result.success) {
          console.log(`🥉 Awarded +1 bronze medal to student ${participant.studentId} for attendance`);
          
          // Broadcast real-time notification for attendance-based medal award
          notificationService.broadcast({
            type: 'medal_awarded',
            data: {
              studentId: participant.studentId,
              delta: { gold: 0, silver: 0, bronze: 1 },
              totals: result.updatedTotals,
              awardedBy: 'system',
              awardedByName: 'System (Attendance)',
              reason: 'attendance',
              awardedAt: new Date().toISOString()
            },
            timestamp: new Date().toISOString()
          });
        } else {
          console.log(`⚠️ Could not award bronze medal to student ${participant.studentId} - ${result.reason}`);
        }
      }
    }
  } catch (error) {
    console.error('Error awarding bronze medals for attendance:', error);
  }
}

export function registerRoutes(app: Express): Server {
  // Setup authentication routes
  setupAuth(app);

  // Middleware to check admin role
  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Faqat administratorlar uchun" });
    }
    next();
  };

  // Middleware to check student role or own data access
  const requireStudentOrOwn = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Autentifikatsiya talab qilinadi" });
    }
    if (req.user.role === "admin") {
      return next(); // Admin can access everything
    }
    if (req.user.role === "student") {
      // Students can only access their own data
      const studentId = req.params.studentId || req.body.studentId;
      if (studentId && studentId !== req.user.id) {
        return res.status(403).json({ message: "Faqat o'z ma'lumotlaringizga kirish mumkin" });
      }
      return next();
    }
    return res.status(403).json({ message: "Kirish rad etildi" });
  };

  // Student management routes (Admin only)
  app.post("/api/students", requireAdmin, async (req, res) => {
    try {
      // Auto-generate login and password
      let login = generateLogin();
      let attempts = 0;
      const maxAttempts = 10;
      
      // Ensure unique login by checking if email already exists
      while (attempts < maxAttempts) {
        const existingUser = await storage.getUserByEmail(login);
        if (!existingUser) break;
        login = generateLogin();
        attempts++;
      }
      
      if (attempts >= maxAttempts) {
        return res.status(500).json({ message: "Login yaratishda xatolik yuz berdi" });
      }
      
      const plainPassword = generatePassword();
      
      const studentData = insertUserSchema.parse({
        ...req.body,
        email: login,
        password: plainPassword,
        role: "student",
        medals: { gold: 0, silver: 0, bronze: 0 }
      });
      
      // Hash the password before storing
      studentData.password = await hashPassword(plainPassword);
      
      const student = await storage.createUser(studentData);
      
      // Return student data with generated credentials (plain password for admin to see)
      const { password, ...studentWithoutPassword } = student;
      res.status(201).json({
        ...studentWithoutPassword,
        generatedCredentials: {
          login: login,
          password: plainPassword
        }
      });
    } catch (error) {
      console.error("Talaba yaratishda xatolik:", error);
      res.status(400).json({ message: "Talaba yaratishda xatolik yuz berdi" });
    }
  });

  app.get("/api/students", requireAdmin, async (req, res) => {
    try {
      const students = await storage.getAllStudents();
      // Remove password from response
      const studentsWithoutPassword = students.map(({ password, ...student }) => student);
      res.json(studentsWithoutPassword);
    } catch (error) {
      console.error("Talabalarni olishda xatolik:", error);
      res.status(500).json({ message: "Talabalarni yuklashda xatolik" });
    }
  });

  app.get("/api/students/:id", requireStudentOrOwn, async (req, res) => {
    try {
      const student = await storage.getUser(req.params.id);
      if (!student) {
        return res.status(404).json({ message: "Talaba topilmadi" });
      }
      // Remove password from response
      const { password, ...studentWithoutPassword } = student;
      res.json(studentWithoutPassword);
    } catch (error) {
      console.error("Talaba ma'lumotlarini olishda xatolik:", error);
      res.status(500).json({ message: "Talaba ma'lumotlarini yuklashda xatolik" });
    }
  });

  app.put("/api/students/:id", requireStudentOrOwn, async (req, res) => {
    try {
      const updates = updateUserSchema.parse(req.body);
      const student = await storage.updateUser(req.params.id, updates);
      if (!student) {
        return res.status(404).json({ message: "Talaba topilmadi" });
      }
      // Remove password from response
      const { password, ...studentWithoutPassword } = student;
      res.json(studentWithoutPassword);
    } catch (error) {
      console.error("Talaba ma'lumotlarini yangilashda xatolik:", error);
      res.status(400).json({ message: "Ma'lumotlarni yangilashda xatolik" });
    }
  });

  app.delete("/api/students/:id", requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteUser(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Talaba topilmadi" });
      }
      res.json({ message: "Talaba muvaffaqiyatli o'chirildi" });
    } catch (error) {
      console.error("Talabani o'chirishda xatolik:", error);
      res.status(500).json({ message: "Talabani o'chirishda xatolik" });
    }
  });

  // Group management routes (Admin only)
  app.post("/api/groups", requireAdmin, async (req, res) => {
    try {
      const groupData = insertGroupSchema.parse(req.body);
      const group = await storage.createGroup(groupData);
      res.status(201).json(group);
    } catch (error) {
      console.error("Guruh yaratishda xatolik:", error);
      res.status(400).json({ message: "Guruh yaratishda xatolik" });
    }
  });

  app.get("/api/groups", async (req, res) => {
    try {
      const groups = await storage.getAllGroups();
      res.json(groups);
    } catch (error) {
      console.error("Guruhlarni olishda xatolik:", error);
      res.status(500).json({ message: "Guruhlarni yuklashda xatolik" });
    }
  });

  app.get("/api/groups/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Autentifikatsiya talab qilinadi" });
    }

    try {
      // Allow admin to access any group, teachers only their assigned groups
      if (req.user.role === "admin") {
        const group = await storage.getGroup(req.params.id);
        if (!group) {
          return res.status(404).json({ message: "Guruh topilmadi" });
        }
        return res.json(group);
      } else if (req.user.role === "teacher") {
        // Check if teacher is assigned to this group
        const teacherGroups = await storage.getTeacherGroups(req.user.id);
        const hasAccess = teacherGroups.some(tg => tg.groupId === req.params.id);
        
        if (!hasAccess) {
          return res.status(403).json({ message: "Bu guruhga kirish huquqingiz yo'q" });
        }
        
        const group = await storage.getGroup(req.params.id);
        if (!group) {
          return res.status(404).json({ message: "Guruh topilmadi" });
        }
        return res.json(group);
      }
      
      return res.status(403).json({ message: "Kirish rad etildi" });
    } catch (error) {
      console.error("Guruh ma'lumotlarini olishda xatolik:", error);
      res.status(500).json({ message: "Guruh ma'lumotlarini yuklashda xatolik" });
    }
  });

  app.put("/api/groups/:id", requireAdmin, async (req, res) => {
    try {
      const updates = insertGroupSchema.partial().parse(req.body);
      const group = await storage.updateGroup(req.params.id, updates);
      if (!group) {
        return res.status(404).json({ message: "Guruh topilmadi" });
      }
      res.json(group);
    } catch (error) {
      console.error("Guruh yangilashda xatolik:", error);
      res.status(400).json({ message: "Guruh yangilashda xatolik" });
    }
  });

  app.delete("/api/groups/:id", requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteGroup(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Guruh topilmadi" });
      }
      res.json({ message: "Guruh muvaffaqiyatli o'chirildi" });
    } catch (error) {
      console.error("Guruhni o'chirishda xatolik:", error);
      res.status(500).json({ message: "Guruhni o'chirishda xatolik" });
    }
  });

  // Group-Student association routes
  app.post("/api/groups/:groupId/students", requireAdmin, async (req, res) => {
    try {
      const groupStudent = await storage.addStudentToGroup({
        groupId: req.params.groupId,
        studentId: req.body.studentId
      });
      res.status(201).json(groupStudent);
    } catch (error) {
      console.error("Talabani guruhga qo'shishda xatolik:", error);
      res.status(400).json({ message: "Talabani guruhga qo'shishda xatolik" });
    }
  });

  app.get("/api/groups/:groupId/students", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Autentifikatsiya talab qilinadi" });
    }

    try {
      // Allow admin to access any group, teachers only their assigned groups
      if (req.user.role === "admin") {
        const groupStudents = await storage.getGroupStudents(req.params.groupId);
        return res.json(groupStudents);
      } else if (req.user.role === "teacher") {
        // Check if teacher is assigned to this group
        const teacherGroups = await storage.getTeacherGroups(req.user.id);
        const hasAccess = teacherGroups.some(tg => tg.groupId === req.params.groupId);
        
        if (!hasAccess) {
          return res.status(403).json({ message: "Bu guruhga kirish huquqingiz yo'q" });
        }
        
        const groupStudents = await storage.getGroupStudents(req.params.groupId);
        return res.json(groupStudents);
      }
      
      return res.status(403).json({ message: "Kirish rad etildi" });
    } catch (error) {
      console.error("Guruh talabalarini olishda xatolik:", error);
      res.status(500).json({ message: "Guruh talabalarini yuklashda xatolik" });
    }
  });

  app.delete("/api/groups/:groupId/students/:studentId", requireAdmin, async (req, res) => {
    try {
      const removed = await storage.removeStudentFromGroup(req.params.groupId, req.params.studentId);
      if (!removed) {
        return res.status(404).json({ message: "O'quvchi bu guruhda topilmadi" });
      }
      res.status(200).json({ message: "O'quvchi guruhdan chiqarildi" });
    } catch (error) {
      console.error("Talabani guruhdan chiqarishda xatolik:", error);
      res.status(400).json({ message: "Talabani guruhdan chiqarishda xatolik" });
    }
  });

  // Attendance routes
  app.post("/api/attendance", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Autentifikatsiya talab qilinadi" });
    }

    try {
      console.log("Received attendance data:", req.body);
      
      // Create a new object with converted date
      const bodyWithDate = {
        ...req.body,
        date: new Date(req.body.date)
      };
      
      const attendanceData = insertAttendanceSchema.parse(bodyWithDate);
      console.log("Parsed attendance data:", attendanceData);
      
      // Check for duplicate attendance record for same group and date
      const existingAttendance = await storage.getAttendanceByDate(attendanceData.groupId, attendanceData.date);
      if (existingAttendance) {
        return res.status(400).json({ message: "Bu sana uchun davomat allaqachon mavjud" });
      }
      
      // Check if bronze medals can be awarded BEFORE creating attendance
      const medalCheck = await canAwardBronzeMedalsForAttendance(attendanceData.participants as Array<{studentId: string, status: string}>);
      if (!medalCheck.canAward) {
        return res.status(400).json({ 
          message: "Ba'zi talabalar oylik medal limitiga yetgan. Davomat yaratilmadi.",
          issues: medalCheck.issues
        });
      }
      
      // Allow admin to create attendance for any group, teachers only for their assigned groups
      if (req.user.role === "admin") {
        const attendance = await storage.createAttendance(attendanceData);
        
        // Automatically award +1 bronze medal to students who attended
        await awardBronzeMedalsForAttendance(attendanceData.participants as Array<{studentId: string, status: string}>, attendance.id);
        
        return res.status(201).json(attendance);
      } else if (req.user.role === "teacher") {
        // Check if teacher is assigned to this group
        const teacherGroups = await storage.getTeacherGroups(req.user.id);
        const hasAccess = teacherGroups.some(tg => tg.groupId === attendanceData.groupId);
        
        if (!hasAccess) {
          return res.status(403).json({ message: "Bu guruh uchun davomat yaratish huquqingiz yo'q" });
        }
        
        const attendance = await storage.createAttendance(attendanceData);
        
        // Automatically award +1 bronze medal to students who attended
        await awardBronzeMedalsForAttendance(attendanceData.participants as Array<{studentId: string, status: string}>, attendance.id);
        
        return res.status(201).json(attendance);
      }
      
      return res.status(403).json({ message: "Kirish rad etildi" });
    } catch (error) {
      console.error("Davomat yaratishda xatolik:", error);
      if (error instanceof Error) {
        res.status(400).json({ message: "Davomat yaratishda xatolik: " + error.message });
      } else {
        res.status(400).json({ message: "Davomat yaratishda xatolik" });
      }
    }
  });

  app.get("/api/groups/:groupId/attendance", requireAdmin, async (req, res) => {
    try {
      const attendance = await storage.getGroupAttendance(req.params.groupId);
      res.json(attendance);
    } catch (error) {
      console.error("Davomat ma'lumotlarini olishda xatolik:", error);
      res.status(500).json({ message: "Davomat ma'lumotlarini yuklashda xatolik" });
    }
  });

  app.get("/api/attendance/daily", requireAdmin, async (req, res) => {
    try {
      const dateParam = req.query.date as string;
      
      if (dateParam && isNaN(Date.parse(dateParam))) {
        return res.status(400).json({ message: "Noto'g'ri sana formati" });
      }
      
      const date = dateParam ? new Date(dateParam) : new Date();
      
      const attendanceRecords = await storage.getAllAttendanceByDate(date);
      
      const allGroups = await storage.getAllGroups();
      const [teachers, students] = await Promise.all([
        storage.getAllTeachers(),
        storage.getAllStudents()
      ]);
      const allUsers = [...teachers, ...students];
      
      const enrichedRecords = attendanceRecords.map((record) => {
        const group = allGroups.find(g => g.id === record.groupId);
        const createdBy = record.createdById 
          ? allUsers.find(u => u.id === record.createdById)
          : null;
        
        const participants = Array.isArray(record.participants) ? record.participants as any[] : [];
        const enrichedParticipants = participants.map((p: any) => {
          const student = allUsers.find(u => u.id === p.studentId);
          return {
            ...p,
            firstName: student?.firstName || 'Noma\'lum',
            lastName: student?.lastName || ''
          };
        });
        
        return {
          ...record,
          participants: enrichedParticipants,
          groupName: group?.name || 'Noma\'lum guruh',
          createdByName: createdBy 
            ? `${createdBy.firstName} ${createdBy.lastName}` 
            : 'Noma\'lum'
        };
      });
      
      res.json(enrichedRecords);
    } catch (error) {
      console.error("Kunlik davomat ma'lumotlarini olishda xatolik:", error);
      res.status(500).json({ message: "Kunlik davomat ma'lumotlarini yuklashda xatolik" });
    }
  });

  // Admin-only attendance edit/delete routes
  app.put("/api/attendance/:id", requireAdmin, async (req, res) => {
    try {
      // First verify the attendance record exists
      const existingAttendance = await storage.getAttendance(req.params.id);
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
      if (duplicateAttendance && duplicateAttendance.id !== req.params.id) {
        return res.status(400).json({ message: "Bu sana uchun davomat allaqachon mavjud" });
      }

      // Handle medal logic for attendance updates
      const oldParticipants = existingAttendance.participants as Array<{studentId: string, status: string}>;
      const newParticipants = attendanceData.participants as Array<{studentId: string, status: string}>;
      
      // Check if bronze medals can be awarded for new arrivals BEFORE updating
      const newArrivals = newParticipants.filter(np => 
        np.status === 'arrived' && 
        (!oldParticipants.find(op => op.studentId === np.studentId) || 
         oldParticipants.find(op => op.studentId === np.studentId)?.status !== 'arrived')
      );
      
      if (newArrivals.length > 0) {
        const medalCheck = await canAwardBronzeMedalsForAttendance(newArrivals);
        if (!medalCheck.canAward) {
          return res.status(400).json({ 
            message: "Ba'zi talabalar oylik medal limitiga yetgan. Davomat yangilanmadi.",
            issues: medalCheck.issues
          });
        }
      }
      
      const updatedAttendance = await storage.updateAttendance(req.params.id, attendanceData);
      if (!updatedAttendance) {
        return res.status(404).json({ message: "Davomat yozuvini yangilashda xatolik" });
      }

      // Award/revoke medals based on status changes
      for (const newParticipant of newParticipants) {
        const oldParticipant = oldParticipants.find(op => op.studentId === newParticipant.studentId);
        
        // If student changed from not-arrived to arrived, award bronze medal
        if (newParticipant.status === 'arrived' && 
            (!oldParticipant || oldParticipant.status !== 'arrived')) {
          await storage.awardMedalsSafelyWithTotals(newParticipant.studentId, 'bronze', 1, 'attendance', req.params.id);
          console.log(`🥉 Awarded +1 bronze medal to student ${newParticipant.studentId} for attendance update`);
        }
        
        // If student changed from arrived to not-arrived, revoke bronze medal
        if (newParticipant.status !== 'arrived' && 
            oldParticipant && oldParticipant.status === 'arrived') {
          const revokeResult = await storage.revokeMedalsSafely(newParticipant.studentId, 'bronze', 1, 'attendance', req.params.id);
          if (revokeResult.success) {
            console.log(`🥉 Revoked 1 bronze medal from student ${newParticipant.studentId} for attendance status change`);
          } else {
            console.log(`⚠️ Could not revoke bronze medal from student ${newParticipant.studentId}: ${revokeResult.reason}`);
          }
        }
      }
      
      res.status(200).json(updatedAttendance);
    } catch (error) {
      console.error("Davomat yangilashda xatolik:", error);
      if (error instanceof Error) {
        res.status(400).json({ message: "Davomat yangilashda xatolik: " + error.message });
      } else {
        res.status(400).json({ message: "Davomat yangilashda xatolik" });
      }
    }
  });

  app.delete("/api/attendance/:id", requireAdmin, async (req, res) => {
    try {
      // First verify the attendance record exists
      const existingAttendance = await storage.getAttendance(req.params.id);
      if (!existingAttendance) {
        return res.status(404).json({ message: "Davomat yozuvi topilmadi" });
      }

      // Handle medal revocation for students who were marked as arrived
      const participants = existingAttendance.participants as Array<{studentId: string, status: string}>;
      const arrivedStudents = participants.filter(p => p.status === 'arrived');
      
      // Revoke medals for all students who were marked as arrived
      for (const student of arrivedStudents) {
        const revokeResult = await storage.revokeMedalsSafely(student.studentId, 'bronze', 1, 'attendance', req.params.id);
        if (revokeResult.success) {
          console.log(`🥉 Revoked 1 bronze medal from student ${student.studentId} for attendance deletion`);
        } else {
          console.log(`⚠️ Could not revoke bronze medal from student ${student.studentId}: ${revokeResult.reason}`);
        }
      }

      const deleted = await storage.deleteAttendance(req.params.id);
      if (!deleted) {
        return res.status(500).json({ message: "Davomat yozuvini o'chirishda xatolik" });
      }

      console.log(`✅ Deleted attendance record ${req.params.id} with ${arrivedStudents.length} students who need medal revocation`);
      res.status(200).json({ message: "Davomat yozuvi muvaffaqiyatli o'chirildi" });
    } catch (error) {
      console.error("Davomat o'chirishda xatolik:", error);
      if (error instanceof Error) {
        res.status(500).json({ message: "Davomat o'chirishda xatolik: " + error.message });
      } else {
        res.status(500).json({ message: "Davomat o'chirishda xatolik" });
      }
    }
  });

  // Teacher attendance routes - allows teachers to get/create attendance for their assigned groups
  app.get("/api/teachers/attendance", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "teacher") {
      return res.status(403).json({ message: "Faqat o'qituvchilar uchun" });
    }

    const { groupId } = req.query;
    
    if (!groupId || typeof groupId !== 'string') {
      return res.status(400).json({ message: "Guruh ID talab qilinadi" });
    }

    try {
      // Verify teacher is assigned to this group
      const teacherGroups = await storage.getTeacherGroups(req.user.id);
      const hasAccess = teacherGroups.some(tg => tg.groupId === groupId);
      
      if (!hasAccess) {
        return res.status(403).json({ message: "Bu guruhni ko'rish huquqingiz yo'q" });
      }

      const attendance = await storage.getGroupAttendance(groupId);
      res.json(attendance);
    } catch (error) {
      console.error("Davomat ma'lumotlarini olishda xatolik:", error);
      res.status(500).json({ message: "Davomat ma'lumotlarini yuklashda xatolik" });
    }
  });

  app.post("/api/teachers/attendance", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "teacher") {
      return res.status(403).json({ message: "Faqat o'qituvchilar uchun" });
    }

    try {
      console.log("Received teacher attendance data:", req.body);
      
      // Create a new object with converted date
      const bodyWithDate = {
        ...req.body,
        date: new Date(req.body.date)
      };
      
      const attendanceData = insertAttendanceSchema.parse(bodyWithDate);
      console.log("Parsed teacher attendance data:", attendanceData);
      
      // Verify teacher is assigned to this group
      const teacherGroups = await storage.getTeacherGroups(req.user.id);
      const hasAccess = teacherGroups.some(tg => tg.groupId === attendanceData.groupId);
      
      if (!hasAccess) {
        return res.status(403).json({ message: "Bu guruh uchun davomat yaratish huquqingiz yo'q" });
      }
      
      // Check for duplicate attendance record for same group and date (same day)
      const existingAttendance = await storage.getAttendanceByDate(attendanceData.groupId, attendanceData.date);
      if (existingAttendance) {
        return res.status(400).json({ message: "Bu sana uchun davomat allaqachon mavjud" });
      }
      
      // Check if bronze medals can be awarded BEFORE creating attendance
      const medalCheck = await canAwardBronzeMedalsForAttendance(attendanceData.participants as Array<{studentId: string, status: string}>);
      if (!medalCheck.canAward) {
        return res.status(400).json({ 
          message: "Ba'zi talabalar oylik medal limitiga yetgan. Davomat yaratilmadi.",
          issues: medalCheck.issues
        });
      }
      
      const attendance = await storage.createAttendance(attendanceData);
      
      // Automatically award +1 bronze medal to students who attended
      await awardBronzeMedalsForAttendance(attendanceData.participants as Array<{studentId: string, status: string}>, attendance.id);
      
      res.status(201).json(attendance);
    } catch (error) {
      console.error("Davomat yaratishda xatolik:", error);
      if (error instanceof Error) {
        res.status(400).json({ message: "Davomat yaratishda xatolik: " + error.message });
      } else {
        res.status(400).json({ message: "Davomat yaratishda xatolik" });
      }
    }
  });

  // Payment routes
  app.post("/api/payments", requireAdmin, async (req, res) => {
    try {
      const paymentData = insertPaymentSchema.parse(req.body);
      const payment = await storage.createPayment(paymentData);
      res.status(201).json(payment);
    } catch (error) {
      console.error("To'lov yaratishda xatolik:", error);
      res.status(400).json({ message: "To'lov yaratishda xatolik" });
    }
  });

  // Admin: list all payments
  app.get("/api/payments", requireAdmin, async (req, res) => {
    try {
      const payments = await storage.getAllPayments();
      res.json(payments);
    } catch (error) {
      console.error("To'lovlarni olishda xatolik:", error);
      res.status(500).json({ message: "To'lovlarni yuklashda xatolik" });
    }
  });

  app.get("/api/students/:studentId/payments", requireStudentOrOwn, async (req, res) => {
    try {
      const payments = await storage.getStudentPayments(req.params.studentId);
      res.json(payments);
    } catch (error) {
      console.error("To'lov ma'lumotlarini olishda xatolik:", error);
      res.status(500).json({ message: "To'lov ma'lumotlarini yuklashda xatolik" });
    }
  });

  // Medal routes
  app.put("/api/students/:id/medals", requireAdmin, async (req, res) => {
    try {
      const medalSchema = z.object({
        gold: z.number().min(0),
        silver: z.number().min(0),
        bronze: z.number().min(0)
      });
      
      const medals = medalSchema.parse(req.body);
      const student = await storage.updateUser(req.params.id, { medals });
      
      if (!student) {
        return res.status(404).json({ message: "Talaba topilmadi" });
      }
      
      res.json(student);
    } catch (error) {
      console.error("Medallarni yangilashda xatolik:", error);
      res.status(400).json({ message: "Medallarni yangilashda xatolik" });
    }
  });

  // Product routes
  app.post("/api/products", requireAdmin, async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      console.error("Mahsulot yaratishda xatolik:", error);
      res.status(400).json({ message: "Mahsulot yaratishda xatolik" });
    }
  });

  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      console.error("Mahsulotlarni olishda xatolik:", error);
      res.status(500).json({ message: "Mahsulotlarni yuklashda xatolik" });
    }
  });

  app.put("/api/products/:id", requireAdmin, async (req, res) => {
    try {
      const updates = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(req.params.id, updates);
      if (!product) {
        return res.status(404).json({ message: "Mahsulot topilmadi" });
      }
      res.json(product);
    } catch (error) {
      console.error("Mahsulot yangilashda xatolik:", error);
      res.status(400).json({ message: "Mahsulot yangilashda xatolik" });
    }
  });

  // Purchase routes
  app.post("/api/purchases", requireStudentOrOwn, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Autentifikatsiya talab qilinadi" });
      }
      
      // Create input validation schema that excludes medalsPaid (server computes this)
      const purchaseInputSchema = insertPurchaseSchema.omit({ medalsPaid: true, status: true });
      const purchaseData = purchaseInputSchema.parse({
        ...req.body,
        studentId: req.user.id // Ensure student can only purchase for themselves
      });
      
      // Get student's current medals
      const student = await storage.getUser(req.user.id);
      if (!student) {
        return res.status(404).json({ message: "Talaba topilmadi" });
      }
      
      // Get product details
      const product = await storage.getProduct(purchaseData.productId);
      if (!product) {
        return res.status(404).json({ message: "Mahsulot topilmadi" });
      }
      
      const studentMedals = student.medals as { gold: number; silver: number; bronze: number };
      const productCost = product.medalCost as { gold: number; silver: number; bronze: number };
      
      // Check if student has enough medals
      if (studentMedals.gold < productCost.gold || 
          studentMedals.silver < productCost.silver || 
          studentMedals.bronze < productCost.bronze) {
        return res.status(400).json({ message: "Yetarli medallaringiz yo'q" });
      }

      // Check product stock before creating purchase request
      const availableQty = (product.quantity ?? 0) as number;
      if (availableQty <= 0) {
        return res.status(400).json({ message: "Mahsulot zaxirada yetarli emas" });
      }
      
      // Create PENDING purchase request (medals not deducted yet)
      // Medals will be deducted only when admin approves
      const purchase = await storage.createPurchase({
        ...purchaseData,
        medalsPaid: productCost,
        status: "pending" // Purchase waits for admin approval
      });
      
      // Broadcast notification to admins about new purchase request
      notificationService.broadcast({
        type: 'product_created',
        data: {
          purchaseId: purchase.id,
          studentId: req.user.id,
          studentName: `${student.firstName} ${student.lastName}`,
          productId: product.id,
          productName: product.name,
          status: 'pending'
        },
        timestamp: new Date().toISOString(),
        role: 'admin'
      });
      
      res.status(201).json({ 
        ...purchase, 
        message: "So'rovingiz administratorga yuborildi. Tasdiqlangandan keyin mahsulot sizga beriladi." 
      });
    } catch (error) {
      console.error("Xarid qilishda xatolik:", error);
      res.status(400).json({ message: "Xarid qilishda xatolik" });
    }
  });

  app.get("/api/students/:studentId/purchases", requireStudentOrOwn, async (req, res) => {
    try {
      const purchases = await storage.getStudentPurchases(req.params.studentId);
      res.json(purchases);
    } catch (error) {
      console.error("Xaridlar tarixini olishda xatolik:", error);
      res.status(500).json({ message: "Xaridlar tarixini yuklashda xatolik" });
    }
  });

  // Admin purchase management routes
  app.get("/api/admin/purchases/pending", requireAdmin, async (req, res) => {
    try {
      const pendingPurchases = await storage.getPendingPurchases();
      res.json(pendingPurchases);
    } catch (error) {
      console.error("Kutilayotgan xaridlarni olishda xatolik:", error);
      res.status(500).json({ message: "Kutilayotgan xaridlarni yuklashda xatolik" });
    }
  });

  app.post("/api/admin/purchases/:id/approve", requireAdmin, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Autentifikatsiya talab qilinadi" });
      }

      const purchase = await storage.getPurchase(req.params.id);
      if (!purchase) {
        return res.status(404).json({ message: "Xarid topilmadi" });
      }

      if (purchase.status !== "pending") {
        return res.status(400).json({ message: "Bu xarid allaqachon tasdiqlangan yoki rad etilgan" });
      }

      // Get student and product details
      const student = await storage.getUser(purchase.studentId);
      if (!student) {
        return res.status(404).json({ message: "Talaba topilmadi" });
      }

      const product = await storage.getProduct(purchase.productId);
      if (!product) {
        return res.status(404).json({ message: "Mahsulot topilmadi" });
      }

      const studentMedals = student.medals as { gold: number; silver: number; bronze: number };
      const productCost = purchase.medalsPaid as { gold: number; silver: number; bronze: number };

      // Verify student still has enough medals
      if (studentMedals.gold < productCost.gold || 
          studentMedals.silver < productCost.silver || 
          studentMedals.bronze < productCost.bronze) {
        return res.status(400).json({ message: "Talabada yetarli medallar yo'q" });
      }

      // Deduct medals from student
      const newMedals = {
        gold: studentMedals.gold - productCost.gold,
        silver: studentMedals.silver - productCost.silver,
        bronze: studentMedals.bronze - productCost.bronze
      };

      await storage.updateUser(purchase.studentId, { medals: newMedals });

      // Update purchase status
      const updatedPurchase = await storage.approvePurchase(req.params.id, req.user.id);

      // Broadcast notification to student
      notificationService.broadcast({
        type: 'product_updated',
        data: {
          purchaseId: updatedPurchase.id,
          studentId: purchase.studentId,
          productName: product.name,
          status: 'approved',
          message: `${product.name} xaridingiz tasdiqlandi! 🎉`
        },
        timestamp: new Date().toISOString(),
        userId: purchase.studentId
      });

      res.json({ 
        ...updatedPurchase, 
        message: "Xarid tasdiqlandi va medallar yechildi" 
      });
    } catch (error) {
      console.error("Xaridni tasdiqlashda xatolik:", error);
      res.status(500).json({ message: "Xaridni tasdiqlashda xatolik" });
    }
  });

  app.post("/api/admin/purchases/:id/reject", requireAdmin, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Autentifikatsiya talab qilinadi" });
      }

      const purchase = await storage.getPurchase(req.params.id);
      if (!purchase) {
        return res.status(404).json({ message: "Xarid topilmadi" });
      }

      if (purchase.status !== "pending") {
        return res.status(400).json({ message: "Bu xarid allaqachon tasdiqlangan yoki rad etilgan" });
      }

      const { reason } = req.body;

      // Update purchase status to rejected
      const updatedPurchase = await storage.rejectPurchase(req.params.id, req.user.id, reason);

      // Get product for notification
      const product = await storage.getProduct(purchase.productId);
      const productName = product?.name || "Mahsulot";

      // Broadcast notification to student
      notificationService.broadcast({
        type: 'product_updated',
        data: {
          purchaseId: updatedPurchase.id,
          studentId: purchase.studentId,
          productName: productName,
          status: 'rejected',
          reason: reason || "Sabab ko'rsatilmagan",
          message: `${productName} xaridingiz rad etildi. ${reason ? `Sabab: ${reason}` : ''}`
        },
        timestamp: new Date().toISOString(),
        userId: purchase.studentId
      });

      res.json({ 
        ...updatedPurchase, 
        message: "Xarid rad etildi" 
      });
    } catch (error) {
      console.error("Xaridni rad etishda xatolik:", error);
      res.status(500).json({ message: "Xaridni rad etishda xatolik" });
    }
  });

  // Teacher management routes (Admin only)
  app.post("/api/teachers", requireAdmin, async (req, res) => {
    try {
      const teacherData = insertUserSchema.parse({
        ...req.body,
        role: "teacher"
      });
      
      // Hash the password before storing
      if (teacherData.password) {
        teacherData.password = await hashPassword(teacherData.password);
      }
      
      const teacher = await storage.createUser(teacherData);
      // Remove password from response
      const { password, ...teacherWithoutPassword } = teacher;
      res.status(201).json(teacherWithoutPassword);
    } catch (error) {
      console.error("O'qituvchi yaratishda xatolik:", error);
      res.status(400).json({ message: "O'qituvchi yaratishda xatolik yuz berdi" });
    }
  });

  app.get("/api/teachers", requireAdmin, async (req, res) => {
    try {
      const teachers = await storage.getAllTeachers();
      // Remove password from response
      const teachersWithoutPassword = teachers.map(({ password, ...teacher }) => teacher);
      res.json(teachersWithoutPassword);
    } catch (error) {
      console.error("O'qituvchilarni olishda xatolik:", error);
      res.status(500).json({ message: "O'qituvchilarni yuklashda xatolik" });
    }
  });

  // Teacher-Group assignment routes (Admin only)
  app.post("/api/teachers/groups", requireAdmin, async (req, res) => {
    try {
      const assignmentData = insertTeacherGroupSchema.parse(req.body);
      const assignment = await storage.assignTeacherToGroup(assignmentData);
      res.status(201).json(assignment);
    } catch (error: any) {
      console.error("O'qituvchini guruhga tayinlashda xatolik:", error);
      
      // Check for specific database constraint violations
      if (error.code === '23503') {
        // Foreign key constraint violations
        if (error.constraint?.includes('teacher_id')) {
          return res.status(400).json({ message: "Tanlangan o'qituvchi topilmadi yoki mavjud emas" });
        }
        if (error.constraint?.includes('group_id')) {
          return res.status(400).json({ message: "Tanlangan guruh topilmadi yoki mavjud emas" });
        }
        return res.status(400).json({ message: "Noto'g'ri ma'lumot kiritilgan" });
      }
      
      // Check if this is a unique constraint violation (teacher already assigned to group)
      if (error.code === '23505' && error.constraint?.includes('teacher_groups_teacher_id_group_id')) {
        return res.status(409).json({ message: "Bu o'qituvchi allaqachon shu guruhga tayinlangan" });
      }
      
      res.status(400).json({ message: "O'qituvchini guruhga tayinlashda xatolik yuz berdi" });
    }
  });

  app.delete("/api/teachers/groups", requireAdmin, async (req, res) => {
    try {
      const { teacherId, groupId } = req.query;
      if (!teacherId || !groupId) {
        return res.status(400).json({ message: "O'qituvchi ID va Guruh ID talab qilinadi" });
      }

      const success = await storage.removeTeacherFromGroup(teacherId as string, groupId as string);
      if (success) {
        res.status(200).json({ message: "O'qituvchi guruhdan muvaffaqiyatli olib tashlandi" });
      } else {
        res.status(404).json({ message: "Tayinlash topilmadi" });
      }
    } catch (error) {
      console.error("O'qituvchini guruhdan olib tashlashda xatolik:", error);
      res.status(500).json({ message: "O'qituvchini guruhdan olib tashlashda xatolik" });
    }
  });

  // Teacher dashboard route
  app.get("/api/teachers/dashboard", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "teacher") {
      return res.status(403).json({ message: "Faqat o'qituvchilar uchun" });
    }

    try {
      const teacherGroups = await storage.getTeacherGroups(req.user.id);
      
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
            recentAttendance: attendance.slice(0, 5),
            assignedAt: tg.assignedAt
          };
        })
      );

      // Calculate today's attendance (count of attendance records made today)
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
        
        // Count the number of attendance records created today
        todayAttendance += todayRecords.length;
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

      res.json({
        groups: groupsWithDetails,
        totalGroups: groupsWithDetails.length,
        totalStudents: groupsWithDetails.reduce((sum, group) => sum + group.totalStudents, 0),
        todayAttendance,
        medalsGiven,
        recentActivity: []
      });
    } catch (error) {
      console.error("O'qituvchi dashboard ma'lumotlarini olishda xatolik:", error);
      res.status(500).json({ message: "Ma'lumotlarni yuklashda xatolik" });
    }
  });

  // Teacher Rankings route - Get top students by medals
  app.get("/api/teachers/rankings", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "teacher") {
      return res.status(403).json({ message: "Faqat o'qituvchilar uchun" });
    }

    try {
      const [weeklyTop, monthlyTop, allTimeTop] = await Promise.all([
        storage.getTopStudentsByMedalsThisWeek(5),
        storage.getTopStudentsByMedalsThisMonth(5),
        storage.getTopStudentsByMedalsAllTime(5)
      ]);

      // Remove passwords from all responses
      const sanitizeUser = (user: any) => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      };

      res.json({
        weeklyTop: weeklyTop.map(sanitizeUser),
        monthlyTop: monthlyTop.map(sanitizeUser),
        allTimeTop: allTimeTop.map(sanitizeUser)
      });
    } catch (error) {
      console.error("O'quvchilar reytingini olishda xatolik:", error);
      res.status(500).json({ message: "Ma'lumotlarni yuklashda xatolik" });
    }
  });

  // Teacher Profile routes (Admin only)
  app.get("/api/teachers/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Get teacher details
      const teacher = await storage.getTeacher(id);
      if (!teacher) {
        return res.status(404).json({ message: "O'qituvchi topilmadi" });
      }

      // Get teacher's assigned groups with details
      const teacherGroups = await storage.getTeacherGroups(id);
      
      // Get detailed information for each group
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
            status: tg.completedAt ? 'completed' : 'active',
            assignedAt: tg.assignedAt,
            completedAt: tg.completedAt,
            totalStudents: groupStudents.length,
            totalClasses: attendance.length,
            teacherGroupId: tg.id
          };
        })
      );

      // Separate active and completed groups
      const activeGroups = groupsWithDetails.filter(g => !g.completedAt);
      const completedGroups = groupsWithDetails.filter(g => g.completedAt);

      // Remove password from teacher response
      const { password, ...teacherWithoutPassword } = teacher;

      res.status(200).json({
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
      res.status(500).json({ message: "O'qituvchi ma'lumotlarini yuklashda xatolik" });
    }
  });

  const completeTeacherGroupSchema = z.object({
    teacherGroupId: z.string(),
    completed: z.boolean()
  });

  app.put("/api/teachers/groups/complete", requireAdmin, async (req, res) => {
    try {
      const { teacherGroupId, completed } = completeTeacherGroupSchema.parse(req.body);
      
      const completedAt = completed ? new Date() : null;
      
      const updated = await storage.updateTeacherGroupStatus(teacherGroupId, completedAt);
      
      if (!updated) {
        return res.status(404).json({ message: "Tayinlash topilmadi" });
      }

      res.status(200).json({
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
      res.status(400).json({ message: "Guruh holatini yangilashda xatolik" });
    }
  });

  // Helper function to verify teacher can manage student
  async function verifyTeacherCanManageStudent(teacherId: string, studentId: string): Promise<boolean> {
    // Get teacher's groups
    const teacherGroups = await storage.getTeacherGroups(teacherId);
    const teacherGroupIds = teacherGroups.map(tg => tg.groupId);
    
    // Get student's groups
    const studentGroups = await storage.getStudentGroups(studentId);
    
    // Check if student is in any of the teacher's groups
    return studentGroups.some(sg => teacherGroupIds.includes(sg.groupId));
  }

  const medalAwardSchema = z.object({
    studentId: z.string(),
    medalType: z.enum(['gold', 'silver', 'bronze']),
    amount: z.number().min(1).max(5).optional().default(1), // Optional amount, default 1
  });

  // Teacher medals route - allows teachers to award medals to their students atomically
  app.post("/api/teachers/medals/award", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "teacher") {
      return res.status(403).json({ message: "Faqat o'qituvchilar uchun" });
    }

    try {
      const { studentId, medalType, amount } = medalAwardSchema.parse(req.body);
      
      // Verify teacher can manage this student
      const canManageStudent = await verifyTeacherCanManageStudent(req.user.id, studentId);
      if (!canManageStudent) {
        return res.status(403).json({ message: "Bu o'quvchini boshqarish huquqingiz yo'q" });
      }

      // Award medals safely using atomic transaction
      const success = await storage.awardMedalsSafely(
        studentId, 
        medalType, 
        amount, 
        'teacher_award', 
        req.user.id
      );
      
      if (!success) {
        return res.status(400).json({ 
          message: "Medal berish imkonsiz - oylik limit yetdi yoki boshqa xatolik" 
        });
      }

      // Get updated student data
      const updatedStudent = await storage.getUser(studentId);
      if (!updatedStudent) {
        return res.status(500).json({ message: "Yangilangan ma'lumotlarni olishda xatolik" });
      }

      // Remove password from response
      const { password, ...studentWithoutPassword } = updatedStudent;
      
      // Broadcast real-time notification for medal awarded
      notificationService.broadcast({
        type: 'medal_awarded',
        data: {
          studentId: studentId,
          studentName: `${updatedStudent.firstName} ${updatedStudent.lastName}`,
          medalType: medalType,
          amount: amount,
          teacherAwarded: true,
          teacherId: req.user.id,
          teacherName: `${req.user.firstName} ${req.user.lastName}`
        },
        timestamp: new Date().toISOString()
      });
      
      return res.status(200).json({
        student: studentWithoutPassword,
        message: "Medal muvaffaqiyatli berildi"
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
  });

  // Statistics route
  app.get("/api/stats", requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Statistika olishda xatolik:", error);
      res.status(500).json({ message: "Statistika ma'lumotlarini yuklashda xatolik" });
    }
  });

  const httpServer = createServer(app);
  
  // Setup WebSocket server
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: '/ws'
  });
  
  wss.on('connection', async (socket, request) => {
    console.log('New WebSocket connection established');

    // Log upgrade metadata for diagnostics (do not log raw cookies)
    try {
      console.log('WS upgrade metadata', {
        url: request.url,
        remoteAddress: request.socket?.remoteAddress || null,
        hasCookie: !!request.headers.cookie,
        userAgent: request.headers['user-agent'] ? String(request.headers['user-agent']).slice(0, 200) : null,
      });
    } catch (err) {
      console.debug('Failed to log WS upgrade metadata', err);
    }

    // Authenticate WebSocket connection using session
    let authenticatedUser = null;
    try {
      // Extract session cookie from the WebSocket upgrade request
      const cookieHeader = request.headers.cookie;
      if (cookieHeader) {
        // Create a mock request object for session validation
        const mockReq = { headers: { cookie: cookieHeader } } as any;
        // Attempt to resolve the session -> user mapping
        try {
          authenticatedUser = await getSecureUserFromSession(mockReq);
        } catch (innerErr) {
          console.error('getSecureUserFromSession threw error during WS auth:', innerErr);
        }
      } else {
        console.log('WebSocket upgrade did not include cookie header');
      }
    } catch (error) {
      console.error('WebSocket authentication error:', error);
    }
    
    if (authenticatedUser) {
      // Add authenticated client
      notificationService.addClient(socket, authenticatedUser.id, authenticatedUser.role);
      console.log(`WebSocket client authenticated: userId=${authenticatedUser.id}, role=${authenticatedUser.role}`);
      
      // Send authentication confirmation
      socket.send(JSON.stringify({
        type: 'auth_confirmed',
        data: { userId: authenticatedUser.id, role: authenticatedUser.role },
        timestamp: new Date().toISOString()
      }));
    } else {
      // Add client without authentication (limited access)
      notificationService.addClient(socket);
      console.log('WebSocket client connected without authentication');
      console.log('WS unauthenticated connection - sent auth_required message');
      
      // Send authentication required message
      socket.send(JSON.stringify({
        type: 'auth_required',
        data: { message: 'Please log in to receive real-time updates' },
        timestamp: new Date().toISOString()
      }));
    }
    
    // Handle client messages (remove the insecure authenticate handler)
    socket.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        console.log('Received WebSocket message:', message.type);
        
        // Handle other message types here if needed
        // No longer accepting client-provided authentication
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });
  });
  
  console.log('WebSocket server initialized on /ws path');
  return httpServer;
}
