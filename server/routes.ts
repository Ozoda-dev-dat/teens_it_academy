import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertUserSchema, insertTeacherSchema, insertGroupSchema, insertAttendanceSchema, insertPaymentSchema, insertProductSchema, insertPurchaseSchema, insertGroupStudentSchema, insertTeacherGroupSchema } from "@shared/schema";
import { z } from "zod";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
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
      const studentData = insertUserSchema.parse({
        ...req.body,
        role: "student",
        medals: { gold: 0, silver: 0, bronze: 0 }
      });
      
      // Hash the password before storing
      if (studentData.password) {
        studentData.password = await hashPassword(studentData.password);
      }
      
      const student = await storage.createUser(studentData);
      res.status(201).json(student);
    } catch (error) {
      console.error("Talaba yaratishda xatolik:", error);
      res.status(400).json({ message: "Talaba yaratishda xatolik yuz berdi" });
    }
  });

  app.get("/api/students", requireAdmin, async (req, res) => {
    try {
      const students = await storage.getAllStudents();
      res.json(students);
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
      res.json(student);
    } catch (error) {
      console.error("Talaba ma'lumotlarini olishda xatolik:", error);
      res.status(500).json({ message: "Talaba ma'lumotlarini yuklashda xatolik" });
    }
  });

  app.put("/api/students/:id", requireStudentOrOwn, async (req, res) => {
    try {
      const updates = insertUserSchema.partial().parse(req.body);
      const student = await storage.updateUser(req.params.id, updates);
      if (!student) {
        return res.status(404).json({ message: "Talaba topilmadi" });
      }
      res.json(student);
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
      
      // Allow admin to create attendance for any group, teachers only for their assigned groups
      if (req.user.role === "admin") {
        const attendance = await storage.createAttendance(attendanceData);
        return res.status(201).json(attendance);
      } else if (req.user.role === "teacher") {
        // Check if teacher is assigned to this group
        const teacherGroups = await storage.getTeacherGroups(req.user.id);
        const hasAccess = teacherGroups.some(tg => tg.groupId === attendanceData.groupId);
        
        if (!hasAccess) {
          return res.status(403).json({ message: "Bu guruh uchun davomat yaratish huquqingiz yo'q" });
        }
        
        const attendance = await storage.createAttendance(attendanceData);
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

  // Teacher attendance route - allows teachers to get attendance for their assigned groups
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
      
      const purchaseData = insertPurchaseSchema.parse({
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
      
      // Calculate new medal counts
      const newMedals = {
        gold: studentMedals.gold - productCost.gold,
        silver: studentMedals.silver - productCost.silver,
        bronze: studentMedals.bronze - productCost.bronze
      };
      
      // Create purchase and update student medals
      const purchase = await storage.createPurchase({
        ...purchaseData,
        medalsPaid: productCost
      });
      
      await storage.updateUser(req.user.id, { medals: newMedals });
      
      res.status(201).json(purchase);
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

  // Teacher management routes (Admin only)
  app.post("/api/teachers", requireAdmin, async (req, res) => {
    try {
      const teacherData = insertTeacherSchema.parse(req.body);
      
      // Hash the password before storing
      if (teacherData.password) {
        teacherData.password = await hashPassword(teacherData.password);
      }
      
      const teacher = await storage.createTeacher(teacherData);
      res.status(201).json(teacher);
    } catch (error) {
      console.error("O'qituvchi yaratishda xatolik:", error);
      res.status(400).json({ message: "O'qituvchi yaratishda xatolik yuz berdi" });
    }
  });

  app.get("/api/teachers", requireAdmin, async (req, res) => {
    try {
      const teachers = await storage.getAllTeachers();
      res.json(teachers);
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
      
      // Check if this is a unique constraint violation (teacher already assigned to group)
      if (error.code === '23505' && error.constraint === 'teacher_groups_teacher_id_group_id_unique') {
        return res.status(409).json({ message: "Bu o'qituvchi allaqachon shu guruhga tayinlangan" });
      }
      
      res.status(400).json({ message: "O'qituvchini guruhga tayinlashda xatolik" });
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
            studentCount: students.length,
            recentAttendance: attendance.slice(0, 5),
            assignedAt: tg.assignedAt
          };
        })
      );

      res.json({
        groups: groupsWithDetails,
        totalStudents: groupsWithDetails.reduce((sum, group) => sum + group.studentCount, 0),
        todayAttendance: 0, // Could be calculated based on today's date
        medalsGiven: 0, // Could be tracked separately
        recentActivity: [] // Could be implemented later
      });
    } catch (error) {
      console.error("O'qituvchi dashboard ma'lumotlarini olishda xatolik:", error);
      res.status(500).json({ message: "Ma'lumotlarni yuklashda xatolik" });
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
  return httpServer;
}
