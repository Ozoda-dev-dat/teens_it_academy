import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { setupAuth } from "./auth";
import { notificationService } from "./notifications";
import { storage } from "./storage";
import { insertUserSchema, updateUserSchema, insertGroupSchema, insertProductSchema, insertPurchaseSchema, insertGroupStudentSchema, insertTeacherGroupSchema } from "@shared/schema";
import { z } from "zod";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

function generateLogin(): string {
  const digits = Math.floor(10000 + Math.random() * 90000).toString();
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const letter = letters.charAt(Math.floor(Math.random() * letters.length));
  return digits + letter;
}

function generatePassword(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Faqat administratorlar uchun" });
    }
    next();
  };

  const requireStudentOrOwn = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Autentifikatsiya talab qilinadi" });
    if (req.user.role === "admin") return next();
    if (req.user.role === "student") {
      const studentId = req.params.studentId || req.body.studentId || req.params.id;
      if (studentId && studentId !== req.user.id) return res.status(403).json({ message: "Faqat o'z ma'lumotlaringizga kirish mumkin" });
      return next();
    }
    return res.status(403).json({ message: "Kirish rad etildi" });
  };

  // Student management
  app.post("/api/students", requireAdmin, async (req, res) => {
    try {
      let login = generateLogin();
      while (await storage.getUserByEmail(login)) login = generateLogin();
      const plainPassword = generatePassword();
      const studentData = insertUserSchema.parse({ ...req.body, email: login, password: plainPassword, role: "student", medals: { gold: 0, silver: 0, bronze: 0 } });
      studentData.password = await hashPassword(plainPassword);
      const student = await storage.createUser(studentData);
      
      // Notify about new student for real-time updates
      notificationService.broadcast({
        type: 'user_created',
        data: { user: student },
        timestamp: new Date().toISOString()
      });

      const { password, ...s } = student;
      res.status(201).json({ ...s, generatedCredentials: { login, password: plainPassword } });
    } catch (e) { 
      console.error('Create student error:', e);
      res.status(400).json({ message: e instanceof Error ? e.message : "Xatolik" }); 
    }
  });

  app.get("/api/students", async (req, res) => {
    if (!req.isAuthenticated() || (req.user.role !== "admin" && req.user.role !== "teacher")) {
      return res.status(403).json({ message: "Kirish rad etildi" });
    }
    const students = await storage.getAllStudents();
    res.json(students.map(({ password, ...s }) => s));
  });

  app.get("/api/students/:id", requireStudentOrOwn, async (req, res) => {
    const s = await storage.getUser(req.params.id);
    if (!s) return res.status(404).json({ message: "Topilmadi" });
    const { password, ...rest } = s;
    res.json(rest);
  });

  app.put("/api/students/:id", requireStudentOrOwn, async (req, res) => {
    try {
      const updates = updateUserSchema.parse(req.body);
      const s = await storage.updateUser(req.params.id, updates);
      if (!s) return res.status(404).json({ message: "Topilmadi" });
      const { password, ...rest } = s;
      res.json(rest);
    } catch (e) { res.status(400).json({ message: "Xatolik" }); }
  });

  app.delete("/api/students/:id", requireAdmin, async (req, res) => {
    const d = await storage.deleteUser(req.params.id);
    res.json({ message: d ? "O'chirildi" : "Topilmadi" });
  });

  // Group management
  app.post("/api/groups", requireAdmin, async (req, res) => {
    try { res.status(201).json(await storage.createGroup(insertGroupSchema.parse(req.body))); } catch (e) { res.status(400).json({ message: "Xatolik" }); }
  });
  app.get("/api/groups", async (req, res) => res.json(await storage.getAllGroups()));
  app.get("/api/groups/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Autentifikatsiya" });
    const g = await storage.getGroup(req.params.id);
    if (!g) return res.status(404).json({ message: "Topilmadi" });
    res.json(g);
  });

  // Medal management
  app.post("/api/medals/award", async (req, res) => {
    if (!req.isAuthenticated() || (req.user.role !== "admin" && req.user.role !== "teacher")) return res.status(403).json({ message: "Rad etildi" });
    try {
      const { studentId, medalType, amount, reason } = req.body;
      const numAmount = parseInt(amount);
      if (isNaN(numAmount)) return res.status(400).json({ message: "Miqdor xato" });
      
      let result;
      if (numAmount >= 0) {
        result = await storage.awardMedalsSafelyWithTotals(studentId, medalType, numAmount, reason, req.user.id);
      } else {
        result = await storage.revokeMedalsSafely(studentId, medalType, Math.abs(numAmount), reason, req.user.id);
        // Map revoke result to include updatedTotals for consistency
        if (result.success) {
          const student = await storage.getUser(studentId);
          result.updatedTotals = student?.medals;
        }
      }

      if (result.success) {
        notificationService.broadcast({ 
          type: 'medal_awarded', 
          data: { 
            studentId, 
            delta: { [medalType]: numAmount }, 
            totals: result.updatedTotals, 
            awardedBy: req.user.id, 
            reason 
          }, 
          timestamp: new Date().toISOString() 
        });
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (e) { 
      console.error('Award medals error:', e);
      res.status(400).json({ message: "Xatolik yuz berdi" }); 
    }
  });

  // Store management
  app.get("/api/products", async (req, res) => res.json(await storage.getAllProducts()));
  app.post("/api/products", requireAdmin, async (req, res) => {
    try { res.status(201).json(await storage.createProduct(insertProductSchema.parse(req.body))); } catch (e) { res.status(400).json({ message: "Xatolik" }); }
  });

  app.put("/api/products/:id", requireAdmin, async (req, res) => {
    try {
      const updates = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(req.params.id, updates);
      if (!product) return res.status(404).json({ message: "Mahsulot topilmadi" });
      res.json(product);
    } catch (e) {
      res.status(400).json({ message: "Xatolik" });
    }
  });

  app.delete("/api/products/:id", requireAdmin, async (req, res) => {
    try {
      const success = await storage.deleteProduct(req.params.id);
      if (!success) return res.status(404).json({ message: "Mahsulot topilmadi" });
      res.json({ message: "O'chirildi" });
    } catch (e) {
      res.status(400).json({ message: "Xatolik" });
    }
  });

  app.post("/api/purchases", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "student") return res.status(401).json({ message: "O'quvchi bo'lishingiz kerak" });
    try {
      const { productId } = req.body;
      const product = await storage.getProduct(productId);
      if (!product || !product.isActive || product.quantity <= 0) return res.status(400).json({ message: "Mahsulot mavjud emas" });
      
      const student = await storage.getUser(req.user.id);
      const currentMedals = student!.medals as any;
      const cost = product.medalCost as any;
      
      if (currentMedals.gold < cost.gold || currentMedals.silver < cost.silver || currentMedals.bronze < cost.bronze) {
        return res.status(400).json({ message: "Medallar yetarli emas" });
      }

      const newMedals = {
        gold: currentMedals.gold - cost.gold,
        silver: currentMedals.silver - cost.silver,
        bronze: currentMedals.bronze - cost.bronze,
      };

      await storage.updateUser(req.user.id, { medals: newMedals });
      const purchase = await storage.createPurchase({ studentId: req.user.id, productId, medalsPaid: cost, status: "pending" });
      res.status(201).json(purchase);
    } catch (e) { res.status(400).json({ message: "Xatolik" }); }
  });

  app.get("/api/purchases/pending", requireAdmin, async (req, res) => {
    try {
      const purchases = await storage.getPendingPurchases();
      const students = await storage.getAllStudents();
      const studentsMap = Object.fromEntries(students.map(s => [s.id, s]));
      
      res.json(purchases.map(p => ({
        ...p,
        studentName: studentsMap[p.studentId] 
          ? `${studentsMap[p.studentId].firstName} ${studentsMap[p.studentId].lastName}`
          : "Noma'lum o'quvchi"
      })));
    } catch (e) {
      console.error('Pending purchases error:', e);
      res.status(400).json({ message: "Xatolik" });
    }
  });
  app.post("/api/purchases/:id/approve", requireAdmin, async (req, res) => {
    try { res.json(await storage.approvePurchase(req.params.id, req.user!.id)); } catch (e) { res.status(400).json({ message: (e as Error).message }); }
  });
  app.post("/api/purchases/:id/reject", requireAdmin, async (req, res) => {
    try { res.json(await storage.rejectPurchase(req.params.id, req.user!.id, req.body.reason)); } catch (e) { res.status(400).json({ message: (e as Error).message }); }
  });

  app.get("/api/stats", async (req, res) => res.json(await storage.getStats()));

  const server = createServer(app);
  const wss = new WebSocketServer({ server, path: "/ws" });
  wss.on("connection", (ws) => { ws.on("message", (msg) => { /* handle */ }); });

  return server;
}