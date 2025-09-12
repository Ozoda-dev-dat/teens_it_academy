var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session2 from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  attendance: () => attendance,
  attendanceRelations: () => attendanceRelations,
  groupStudents: () => groupStudents,
  groupStudentsRelations: () => groupStudentsRelations,
  groups: () => groups,
  groupsRelations: () => groupsRelations,
  insertAttendanceSchema: () => insertAttendanceSchema,
  insertGroupSchema: () => insertGroupSchema,
  insertGroupStudentSchema: () => insertGroupStudentSchema,
  insertPaymentSchema: () => insertPaymentSchema,
  insertProductSchema: () => insertProductSchema,
  insertPurchaseSchema: () => insertPurchaseSchema,
  insertTeacherGroupSchema: () => insertTeacherGroupSchema,
  insertTeacherSchema: () => insertTeacherSchema,
  insertUserSchema: () => insertUserSchema,
  payments: () => payments,
  paymentsRelations: () => paymentsRelations,
  products: () => products,
  productsRelations: () => productsRelations,
  purchases: () => purchases,
  purchasesRelations: () => purchasesRelations,
  teacherGroups: () => teacherGroups,
  teacherGroupsRelations: () => teacherGroupsRelations,
  teachers: () => teachers,
  teachersRelations: () => teachersRelations,
  users: () => users,
  usersRelations: () => usersRelations
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, boolean, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  role: text("role").notNull().default("student"),
  // "admin" or "student"
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  profilePic: text("profile_pic"),
  avatarConfig: jsonb("avatar_config"),
  // Stores detailed avatar customization data
  medals: jsonb("medals").default(sql`'{"gold": 0, "silver": 0, "bronze": 0}'`),
  createdAt: timestamp("created_at").defaultNow()
});
var teachers = pgTable("teachers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  profilePic: text("profile_pic"),
  avatarConfig: jsonb("avatar_config"),
  // Stores detailed avatar customization data
  createdAt: timestamp("created_at").defaultNow()
});
var groups = pgTable("groups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  schedule: jsonb("schedule"),
  // array of class times
  createdAt: timestamp("created_at").defaultNow()
});
var groupStudents = pgTable("group_students", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  groupId: varchar("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
  studentId: varchar("student_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  joinedAt: timestamp("joined_at").defaultNow()
});
var teacherGroups = pgTable("teacher_groups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teacherId: varchar("teacher_id").notNull().references(() => teachers.id, { onDelete: "cascade" }),
  groupId: varchar("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
  assignedAt: timestamp("assigned_at").defaultNow()
}, (table) => ({
  // Unique constraint to prevent duplicate teacher-group assignments
  uniqueTeacherGroup: unique().on(table.teacherId, table.groupId)
}));
var attendance = pgTable("attendance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  groupId: varchar("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
  date: timestamp("date").notNull(),
  participants: jsonb("participants").notNull(),
  // array of {studentId: string, status: 'arrived' | 'late' | 'absent'}
  createdAt: timestamp("created_at").defaultNow()
});
var payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(),
  // in cents
  paymentDate: timestamp("payment_date").defaultNow(),
  classesAttended: integer("classes_attended").notNull().default(0),
  status: text("status").notNull().default("paid"),
  // "paid" or "unpaid"
  createdAt: timestamp("created_at").defaultNow()
});
var products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  image: text("image"),
  quantity: integer("quantity").notNull().default(0),
  medalCost: jsonb("medal_cost").notNull(),
  // {gold: 0, silver: 0, bronze: 0}
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow()
});
var purchases = pgTable("purchases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  productId: varchar("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  medalsPaid: jsonb("medals_paid").notNull(),
  purchaseDate: timestamp("purchase_date").defaultNow()
});
var usersRelations = relations(users, ({ many }) => ({
  groupStudents: many(groupStudents),
  payments: many(payments),
  purchases: many(purchases)
}));
var teachersRelations = relations(teachers, ({ many }) => ({
  teacherGroups: many(teacherGroups)
}));
var groupsRelations = relations(groups, ({ many }) => ({
  groupStudents: many(groupStudents),
  teacherGroups: many(teacherGroups),
  attendance: many(attendance)
}));
var groupStudentsRelations = relations(groupStudents, ({ one }) => ({
  group: one(groups, {
    fields: [groupStudents.groupId],
    references: [groups.id]
  }),
  student: one(users, {
    fields: [groupStudents.studentId],
    references: [users.id]
  })
}));
var teacherGroupsRelations = relations(teacherGroups, ({ one }) => ({
  teacher: one(teachers, {
    fields: [teacherGroups.teacherId],
    references: [teachers.id]
  }),
  group: one(groups, {
    fields: [teacherGroups.groupId],
    references: [groups.id]
  })
}));
var attendanceRelations = relations(attendance, ({ one }) => ({
  group: one(groups, {
    fields: [attendance.groupId],
    references: [groups.id]
  })
}));
var paymentsRelations = relations(payments, ({ one }) => ({
  student: one(users, {
    fields: [payments.studentId],
    references: [users.id]
  })
}));
var productsRelations = relations(products, ({ many }) => ({
  purchases: many(purchases)
}));
var purchasesRelations = relations(purchases, ({ one }) => ({
  student: one(users, {
    fields: [purchases.studentId],
    references: [users.id]
  }),
  product: one(products, {
    fields: [purchases.productId],
    references: [products.id]
  })
}));
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});
var insertTeacherSchema = createInsertSchema(teachers).omit({
  id: true,
  createdAt: true
});
var insertGroupSchema = createInsertSchema(groups).omit({
  id: true,
  createdAt: true
});
var insertGroupStudentSchema = createInsertSchema(groupStudents).omit({
  id: true,
  joinedAt: true
});
var insertTeacherGroupSchema = createInsertSchema(teacherGroups).omit({
  id: true,
  assignedAt: true
});
var insertAttendanceSchema = createInsertSchema(attendance).omit({
  id: true,
  createdAt: true
});
var insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true
});
var insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true
});
var insertPurchaseSchema = createInsertSchema(purchases).omit({
  id: true,
  purchaseDate: true
});

// server/db.ts
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});
var db = drizzle(pool, { schema: schema_exports });

// server/storage.ts
import { eq, and, sql as sql2, desc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
var PostgresSessionStore = connectPg(session);
var DatabaseStorage = class {
  sessionStore;
  constructor() {
    this.sessionStore = new PostgresSessionStore({
      // Use the existing database pool instead of creating a new connection
      pool,
      tableName: "session",
      // Table to store sessions
      createTableIfMissing: true,
      pruneSessionInterval: 60 * 15,
      // Prune expired sessions every 15 minutes
      // Use shorter session expiry for better security
      ttl: 24 * 60 * 60 * 1e3
      // 24 hours in milliseconds
    });
  }
  // User methods
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || void 0;
  }
  async getUserByEmail(email) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || void 0;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  async updateUser(id, updates) {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user || void 0;
  }
  async deleteUser(id) {
    const result = await db.delete(users).where(eq(users.id, id));
    return (result.rowCount ?? 0) > 0;
  }
  async getAllStudents() {
    const result = await db.select().from(users).where(eq(users.role, "student"));
    return result || [];
  }
  async getAllTeachers() {
    const result = await db.select().from(teachers);
    return result || [];
  }
  async createTeacher(insertTeacher) {
    const [teacher] = await db.insert(teachers).values(insertTeacher).returning();
    return teacher;
  }
  async getTeacher(id) {
    const [teacher] = await db.select().from(teachers).where(eq(teachers.id, id));
    return teacher || void 0;
  }
  async getTeacherByEmail(email) {
    const [teacher] = await db.select().from(teachers).where(eq(teachers.email, email));
    return teacher || void 0;
  }
  async updateTeacher(id, updates) {
    const [teacher] = await db.update(teachers).set(updates).where(eq(teachers.id, id)).returning();
    return teacher || void 0;
  }
  async deleteTeacher(id) {
    const result = await db.delete(teachers).where(eq(teachers.id, id));
    return (result.rowCount ?? 0) > 0;
  }
  // Group methods
  async createGroup(group) {
    const [newGroup] = await db.insert(groups).values(group).returning();
    return newGroup;
  }
  async getAllGroups() {
    const result = await db.select().from(groups);
    return result || [];
  }
  async getGroup(id) {
    const [group] = await db.select().from(groups).where(eq(groups.id, id));
    return group || void 0;
  }
  async updateGroup(id, updates) {
    const [group] = await db.update(groups).set(updates).where(eq(groups.id, id)).returning();
    return group || void 0;
  }
  async deleteGroup(id) {
    const result = await db.delete(groups).where(eq(groups.id, id));
    return (result.rowCount ?? 0) > 0;
  }
  // Group Student methods
  async addStudentToGroup(groupStudent) {
    const [newGroupStudent] = await db.insert(groupStudents).values(groupStudent).returning();
    return newGroupStudent;
  }
  async removeStudentFromGroup(groupId, studentId) {
    const result = await db.delete(groupStudents).where(and(
      eq(groupStudents.groupId, groupId),
      eq(groupStudents.studentId, studentId)
    ));
    return (result.rowCount ?? 0) > 0;
  }
  async getGroupStudents(groupId) {
    const result = await db.select({
      id: groupStudents.id,
      groupId: groupStudents.groupId,
      studentId: groupStudents.studentId,
      joinedAt: groupStudents.joinedAt,
      student: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        role: users.role
      }
    }).from(groupStudents).innerJoin(users, eq(groupStudents.studentId, users.id)).where(eq(groupStudents.groupId, groupId));
    return result || [];
  }
  async getStudentGroups(studentId) {
    const result = await db.select().from(groupStudents).where(eq(groupStudents.studentId, studentId));
    return result || [];
  }
  // Teacher Group methods
  async assignTeacherToGroup(teacherGroup) {
    const [newTeacherGroup] = await db.insert(teacherGroups).values(teacherGroup).returning();
    return newTeacherGroup;
  }
  async removeTeacherFromGroup(teacherId, groupId) {
    const result = await db.delete(teacherGroups).where(and(
      eq(teacherGroups.teacherId, teacherId),
      eq(teacherGroups.groupId, groupId)
    ));
    return (result.rowCount ?? 0) > 0;
  }
  async getTeacherGroups(teacherId) {
    const result = await db.select().from(teacherGroups).where(eq(teacherGroups.teacherId, teacherId));
    return result || [];
  }
  async getGroupTeachers(groupId) {
    const result = await db.select().from(teacherGroups).where(eq(teacherGroups.groupId, groupId));
    return result || [];
  }
  // Attendance methods
  async createAttendance(attendanceData) {
    const [newAttendance] = await db.insert(attendance).values(attendanceData).returning();
    return newAttendance;
  }
  async getGroupAttendance(groupId) {
    try {
      const result = await db.select().from(attendance).where(eq(attendance.groupId, groupId)).orderBy(desc(attendance.date));
      return result || [];
    } catch (error) {
      console.error("Error fetching group attendance:", error);
      return [];
    }
  }
  async getAttendanceByDate(groupId, date) {
    const [attendanceRecord] = await db.select().from(attendance).where(and(
      eq(attendance.groupId, groupId),
      eq(attendance.date, date)
    ));
    return attendanceRecord || void 0;
  }
  // Payment methods
  async createPayment(payment) {
    const [newPayment] = await db.insert(payments).values(payment).returning();
    return newPayment;
  }
  async getStudentPayments(studentId) {
    const result = await db.select().from(payments).where(eq(payments.studentId, studentId)).orderBy(desc(payments.paymentDate));
    return result || [];
  }
  async updatePayment(id, updates) {
    const [payment] = await db.update(payments).set(updates).where(eq(payments.id, id)).returning();
    return payment || void 0;
  }
  // Product methods
  async createProduct(product) {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }
  async getAllProducts() {
    try {
      const result = await db.select().from(products).where(eq(products.isActive, true));
      return result || [];
    } catch (error) {
      console.error("Error fetching products:", error);
      return [];
    }
  }
  async getProduct(id) {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || void 0;
  }
  async updateProduct(id, updates) {
    const [product] = await db.update(products).set(updates).where(eq(products.id, id)).returning();
    return product || void 0;
  }
  async deleteProduct(id) {
    const result = await db.delete(products).where(eq(products.id, id));
    return (result.rowCount ?? 0) > 0;
  }
  // Purchase methods
  async createPurchase(purchase) {
    const [newPurchase] = await db.insert(purchases).values(purchase).returning();
    return newPurchase;
  }
  async getStudentPurchases(studentId) {
    const result = await db.select().from(purchases).where(eq(purchases.studentId, studentId)).orderBy(desc(purchases.purchaseDate));
    return result || [];
  }
  // Stats methods
  async getStats() {
    try {
      const studentCountResult = await db.select({ count: sql2`count(*)` }).from(users).where(eq(users.role, "student"));
      const totalStudents = studentCountResult[0]?.count || 0;
      const groupCountResult = await db.select({ count: sql2`count(*)` }).from(groups);
      const activeGroups = groupCountResult[0]?.count || 0;
      const medalResults = await db.select({ medals: users.medals }).from(users).where(eq(users.role, "student"));
      const totalMedals = (medalResults || []).reduce(
        (acc, user) => {
          const medals = user.medals;
          acc.gold += medals?.gold || 0;
          acc.silver += medals?.silver || 0;
          acc.bronze += medals?.bronze || 0;
          return acc;
        },
        { gold: 0, silver: 0, bronze: 0 }
      );
      const unpaidPayments = await db.select({ amount: payments.amount }).from(payments).where(eq(payments.status, "unpaid"));
      const unpaidAmount = (unpaidPayments || []).reduce((total, payment) => total + (payment.amount || 0), 0);
      return {
        totalStudents: Number(totalStudents),
        activeGroups: Number(activeGroups),
        totalMedals,
        unpaidAmount: Number(unpaidAmount) / 100
        // Convert from cents to dollars
      };
    } catch (error) {
      console.error("Error fetching stats:", error);
      return {
        totalStudents: 0,
        activeGroups: 0,
        totalMedals: { gold: 0, silver: 0, bronze: 0 },
        unpaidAmount: 0
      };
    }
  }
};
var storage = new DatabaseStorage();

// server/auth.ts
var scryptAsync = promisify(scrypt);
async function comparePasswords(supplied, stored) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return timingSafeEqual(hashedBuf, suppliedBuf);
}
function setupAuth(app2) {
  const sessionSettings = {
    secret: process.env.SESSION_SECRET || "teens-it-school-secret-2024",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore
  };
  app2.set("trust proxy", 1);
  app2.use(session2(sessionSettings));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
      try {
        console.log("\u{1F50D} Login attempt:", { email, passwordLength: password.length });
        const user = await storage.getUserByEmail(email);
        console.log("\u{1F464} User found:", user ? "YES" : "NO");
        if (!user) {
          console.log("\u274C User not found");
          return done(null, false);
        }
        const passwordMatch = await comparePasswords(password, user.password);
        console.log("\u{1F510} Password match:", passwordMatch);
        if (!passwordMatch) {
          console.log("\u274C Password mismatch");
          return done(null, false);
        } else {
          console.log("\u2705 Login successful");
          return done(null, user);
        }
      } catch (error) {
        console.log("\u{1F4A5} Auth error:", error);
        return done(error);
      }
    })
  );
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
  app2.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return res.status(500).json({ message: "Tizimga kirishda xatolik yuz berdi" });
      }
      if (!user) {
        return res.status(401).json({ message: "Email yoki parol noto'g'ri" });
      }
      req.login(user, (err2) => {
        if (err2) {
          return res.status(500).json({ message: "Tizimga kirishda xatolik yuz berdi" });
        }
        res.status(200).json(user);
      });
    })(req, res, next);
  });
  app2.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });
  app2.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}

// server/routes.ts
import { z } from "zod";
import { scrypt as scrypt2, randomBytes as randomBytes2 } from "crypto";
import { promisify as promisify2 } from "util";
var scryptAsync2 = promisify2(scrypt2);
async function hashPassword(password) {
  const salt = randomBytes2(16).toString("hex");
  const buf = await scryptAsync2(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
function registerRoutes(app2) {
  setupAuth(app2);
  const requireAdmin = (req, res, next) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Faqat administratorlar uchun" });
    }
    next();
  };
  const requireStudentOrOwn = (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Autentifikatsiya talab qilinadi" });
    }
    if (req.user.role === "admin") {
      return next();
    }
    if (req.user.role === "student") {
      const studentId = req.params.studentId || req.body.studentId;
      if (studentId && studentId !== req.user.id) {
        return res.status(403).json({ message: "Faqat o'z ma'lumotlaringizga kirish mumkin" });
      }
      return next();
    }
    return res.status(403).json({ message: "Kirish rad etildi" });
  };
  app2.post("/api/students", requireAdmin, async (req, res) => {
    try {
      const studentData = insertUserSchema.parse({
        ...req.body,
        role: "student",
        medals: { gold: 0, silver: 0, bronze: 0 }
      });
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
  app2.get("/api/students", requireAdmin, async (req, res) => {
    try {
      const students = await storage.getAllStudents();
      res.json(students);
    } catch (error) {
      console.error("Talabalarni olishda xatolik:", error);
      res.status(500).json({ message: "Talabalarni yuklashda xatolik" });
    }
  });
  app2.get("/api/students/:id", requireStudentOrOwn, async (req, res) => {
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
  app2.put("/api/students/:id", requireStudentOrOwn, async (req, res) => {
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
  app2.delete("/api/students/:id", requireAdmin, async (req, res) => {
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
  app2.post("/api/groups", requireAdmin, async (req, res) => {
    try {
      const groupData = insertGroupSchema.parse(req.body);
      const group = await storage.createGroup(groupData);
      res.status(201).json(group);
    } catch (error) {
      console.error("Guruh yaratishda xatolik:", error);
      res.status(400).json({ message: "Guruh yaratishda xatolik" });
    }
  });
  app2.get("/api/groups", async (req, res) => {
    try {
      const groups2 = await storage.getAllGroups();
      res.json(groups2);
    } catch (error) {
      console.error("Guruhlarni olishda xatolik:", error);
      res.status(500).json({ message: "Guruhlarni yuklashda xatolik" });
    }
  });
  app2.get("/api/groups/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Autentifikatsiya talab qilinadi" });
    }
    try {
      if (req.user.role === "admin") {
        const group = await storage.getGroup(req.params.id);
        if (!group) {
          return res.status(404).json({ message: "Guruh topilmadi" });
        }
        return res.json(group);
      } else if (req.user.role === "teacher") {
        const teacherGroups2 = await storage.getTeacherGroups(req.user.id);
        const hasAccess = teacherGroups2.some((tg) => tg.groupId === req.params.id);
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
  app2.put("/api/groups/:id", requireAdmin, async (req, res) => {
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
  app2.delete("/api/groups/:id", requireAdmin, async (req, res) => {
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
  app2.post("/api/groups/:groupId/students", requireAdmin, async (req, res) => {
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
  app2.get("/api/groups/:groupId/students", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Autentifikatsiya talab qilinadi" });
    }
    try {
      if (req.user.role === "admin") {
        const groupStudents2 = await storage.getGroupStudents(req.params.groupId);
        return res.json(groupStudents2);
      } else if (req.user.role === "teacher") {
        const teacherGroups2 = await storage.getTeacherGroups(req.user.id);
        const hasAccess = teacherGroups2.some((tg) => tg.groupId === req.params.groupId);
        if (!hasAccess) {
          return res.status(403).json({ message: "Bu guruhga kirish huquqingiz yo'q" });
        }
        const groupStudents2 = await storage.getGroupStudents(req.params.groupId);
        return res.json(groupStudents2);
      }
      return res.status(403).json({ message: "Kirish rad etildi" });
    } catch (error) {
      console.error("Guruh talabalarini olishda xatolik:", error);
      res.status(500).json({ message: "Guruh talabalarini yuklashda xatolik" });
    }
  });
  app2.delete("/api/groups/:groupId/students/:studentId", requireAdmin, async (req, res) => {
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
  app2.post("/api/attendance", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Autentifikatsiya talab qilinadi" });
    }
    try {
      console.log("Received attendance data:", req.body);
      const bodyWithDate = {
        ...req.body,
        date: new Date(req.body.date)
      };
      const attendanceData = insertAttendanceSchema.parse(bodyWithDate);
      console.log("Parsed attendance data:", attendanceData);
      if (req.user.role === "admin") {
        const attendance2 = await storage.createAttendance(attendanceData);
        return res.status(201).json(attendance2);
      } else if (req.user.role === "teacher") {
        const teacherGroups2 = await storage.getTeacherGroups(req.user.id);
        const hasAccess = teacherGroups2.some((tg) => tg.groupId === attendanceData.groupId);
        if (!hasAccess) {
          return res.status(403).json({ message: "Bu guruh uchun davomat yaratish huquqingiz yo'q" });
        }
        const attendance2 = await storage.createAttendance(attendanceData);
        return res.status(201).json(attendance2);
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
  app2.get("/api/groups/:groupId/attendance", requireAdmin, async (req, res) => {
    try {
      const attendance2 = await storage.getGroupAttendance(req.params.groupId);
      res.json(attendance2);
    } catch (error) {
      console.error("Davomat ma'lumotlarini olishda xatolik:", error);
      res.status(500).json({ message: "Davomat ma'lumotlarini yuklashda xatolik" });
    }
  });
  app2.get("/api/teachers/attendance", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "teacher") {
      return res.status(403).json({ message: "Faqat o'qituvchilar uchun" });
    }
    const { groupId } = req.query;
    if (!groupId || typeof groupId !== "string") {
      return res.status(400).json({ message: "Guruh ID talab qilinadi" });
    }
    try {
      const teacherGroups2 = await storage.getTeacherGroups(req.user.id);
      const hasAccess = teacherGroups2.some((tg) => tg.groupId === groupId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Bu guruhni ko'rish huquqingiz yo'q" });
      }
      const attendance2 = await storage.getGroupAttendance(groupId);
      res.json(attendance2);
    } catch (error) {
      console.error("Davomat ma'lumotlarini olishda xatolik:", error);
      res.status(500).json({ message: "Davomat ma'lumotlarini yuklashda xatolik" });
    }
  });
  app2.post("/api/payments", requireAdmin, async (req, res) => {
    try {
      const paymentData = insertPaymentSchema.parse(req.body);
      const payment = await storage.createPayment(paymentData);
      res.status(201).json(payment);
    } catch (error) {
      console.error("To'lov yaratishda xatolik:", error);
      res.status(400).json({ message: "To'lov yaratishda xatolik" });
    }
  });
  app2.get("/api/students/:studentId/payments", requireStudentOrOwn, async (req, res) => {
    try {
      const payments2 = await storage.getStudentPayments(req.params.studentId);
      res.json(payments2);
    } catch (error) {
      console.error("To'lov ma'lumotlarini olishda xatolik:", error);
      res.status(500).json({ message: "To'lov ma'lumotlarini yuklashda xatolik" });
    }
  });
  app2.put("/api/students/:id/medals", requireAdmin, async (req, res) => {
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
  app2.post("/api/products", requireAdmin, async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      console.error("Mahsulot yaratishda xatolik:", error);
      res.status(400).json({ message: "Mahsulot yaratishda xatolik" });
    }
  });
  app2.get("/api/products", async (req, res) => {
    try {
      const products2 = await storage.getAllProducts();
      res.json(products2);
    } catch (error) {
      console.error("Mahsulotlarni olishda xatolik:", error);
      res.status(500).json({ message: "Mahsulotlarni yuklashda xatolik" });
    }
  });
  app2.put("/api/products/:id", requireAdmin, async (req, res) => {
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
  app2.post("/api/purchases", requireStudentOrOwn, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Autentifikatsiya talab qilinadi" });
      }
      const purchaseData = insertPurchaseSchema.parse({
        ...req.body,
        studentId: req.user.id
        // Ensure student can only purchase for themselves
      });
      const student = await storage.getUser(req.user.id);
      if (!student) {
        return res.status(404).json({ message: "Talaba topilmadi" });
      }
      const product = await storage.getProduct(purchaseData.productId);
      if (!product) {
        return res.status(404).json({ message: "Mahsulot topilmadi" });
      }
      const studentMedals = student.medals;
      const productCost = product.medalCost;
      if (studentMedals.gold < productCost.gold || studentMedals.silver < productCost.silver || studentMedals.bronze < productCost.bronze) {
        return res.status(400).json({ message: "Yetarli medallaringiz yo'q" });
      }
      const newMedals = {
        gold: studentMedals.gold - productCost.gold,
        silver: studentMedals.silver - productCost.silver,
        bronze: studentMedals.bronze - productCost.bronze
      };
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
  app2.get("/api/students/:studentId/purchases", requireStudentOrOwn, async (req, res) => {
    try {
      const purchases2 = await storage.getStudentPurchases(req.params.studentId);
      res.json(purchases2);
    } catch (error) {
      console.error("Xaridlar tarixini olishda xatolik:", error);
      res.status(500).json({ message: "Xaridlar tarixini yuklashda xatolik" });
    }
  });
  app2.post("/api/teachers", requireAdmin, async (req, res) => {
    try {
      const teacherData = insertTeacherSchema.parse(req.body);
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
  app2.get("/api/teachers", requireAdmin, async (req, res) => {
    try {
      const teachers2 = await storage.getAllTeachers();
      res.json(teachers2);
    } catch (error) {
      console.error("O'qituvchilarni olishda xatolik:", error);
      res.status(500).json({ message: "O'qituvchilarni yuklashda xatolik" });
    }
  });
  app2.post("/api/teachers/groups", requireAdmin, async (req, res) => {
    try {
      const assignmentData = insertTeacherGroupSchema.parse(req.body);
      const assignment = await storage.assignTeacherToGroup(assignmentData);
      res.status(201).json(assignment);
    } catch (error) {
      console.error("O'qituvchini guruhga tayinlashda xatolik:", error);
      res.status(400).json({ message: "O'qituvchini guruhga tayinlashda xatolik" });
    }
  });
  app2.delete("/api/teachers/groups", requireAdmin, async (req, res) => {
    try {
      const { teacherId, groupId } = req.query;
      if (!teacherId || !groupId) {
        return res.status(400).json({ message: "O'qituvchi ID va Guruh ID talab qilinadi" });
      }
      const success = await storage.removeTeacherFromGroup(teacherId, groupId);
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
  app2.get("/api/teachers/dashboard", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "teacher") {
      return res.status(403).json({ message: "Faqat o'qituvchilar uchun" });
    }
    try {
      const teacherGroups2 = await storage.getTeacherGroups(req.user.id);
      const groupsWithDetails = await Promise.all(
        teacherGroups2.map(async (tg) => {
          const group = await storage.getGroup(tg.groupId);
          const students = await storage.getGroupStudents(tg.groupId);
          const attendance2 = await storage.getGroupAttendance(tg.groupId);
          return {
            id: group?.id,
            name: group?.name,
            description: group?.description,
            schedule: group?.schedule,
            students,
            studentCount: students.length,
            recentAttendance: attendance2.slice(0, 5),
            assignedAt: tg.assignedAt
          };
        })
      );
      res.json({
        groups: groupsWithDetails,
        totalStudents: groupsWithDetails.reduce((sum, group) => sum + group.studentCount, 0),
        todayAttendance: 0,
        // Could be calculated based on today's date
        medalsGiven: 0,
        // Could be tracked separately
        recentActivity: []
        // Could be implemented later
      });
    } catch (error) {
      console.error("O'qituvchi dashboard ma'lumotlarini olishda xatolik:", error);
      res.status(500).json({ message: "Ma'lumotlarni yuklashda xatolik" });
    }
  });
  app2.get("/api/stats", requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Statistika olishda xatolik:", error);
      res.status(500).json({ message: "Statistika ma'lumotlarini yuklashda xatolik" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var __dirname = path.dirname(fileURLToPath(import.meta.url));
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets")
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    host: "0.0.0.0",
    port: 5e3,
    fs: {
      strict: false,
      allow: [".."]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var __dirname2 = path2.dirname(fileURLToPath2(import.meta.url));
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    if (url.startsWith("/api/")) {
      return next();
    }
    try {
      const clientTemplate = path2.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(__dirname2, "../dist/public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
if (process.env.NODE_ENV === "development") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}
var app = express2();
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.get("/health", (_req, res) => {
    res.status(200).json({
      status: "ok",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development"
    });
  });
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error("Server Error:", {
      message: err.message,
      stack: err.stack,
      status,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      url: _req.url,
      method: _req.method
    });
    res.status(status).json({ message });
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
