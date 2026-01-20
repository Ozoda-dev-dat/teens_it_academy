var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";
import { WebSocketServer } from "ws";

// server/auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session2 from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  groupStudents: () => groupStudents,
  groupStudentsRelations: () => groupStudentsRelations,
  groups: () => groups,
  groupsRelations: () => groupsRelations,
  insertGroupSchema: () => insertGroupSchema,
  insertGroupStudentSchema: () => insertGroupStudentSchema,
  insertMedalAwardSchema: () => insertMedalAwardSchema,
  insertProductSchema: () => insertProductSchema,
  insertPurchaseSchema: () => insertPurchaseSchema,
  insertTeacherGroupSchema: () => insertTeacherGroupSchema,
  insertUserSchema: () => insertUserSchema,
  medalAwards: () => medalAwards,
  medalAwardsRelations: () => medalAwardsRelations,
  products: () => products,
  productsRelations: () => productsRelations,
  purchases: () => purchases,
  purchasesRelations: () => purchasesRelations,
  teacherGroups: () => teacherGroups,
  teacherGroupsRelations: () => teacherGroupsRelations,
  updateUserSchema: () => updateUserSchema,
  users: () => users,
  usersRelations: () => usersRelations
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, boolean, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  role: text("role").notNull().default("student"),
  // "admin", "student", or "teacher"
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone"),
  // Student's own phone number
  parentPhone: text("parent_phone"),
  // Parent's phone number
  parentName: text("parent_name"),
  // Parent's name
  profilePic: text("profile_pic"),
  avatarConfig: jsonb("avatar_config"),
  // Stores detailed avatar customization data
  medals: jsonb("medals").default(sql`'{"gold": 0, "silver": 0, "bronze": 0}'`),
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
  teacherId: varchar("teacher_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  groupId: varchar("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
  assignedAt: timestamp("assigned_at").defaultNow(),
  completedAt: timestamp("completed_at")
}, (table) => ({
  uniqueTeacherGroup: unique().on(table.teacherId, table.groupId)
}));
var products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  image: text("image"),
  quantity: integer("quantity").notNull().default(0),
  medalCost: jsonb("medal_cost").$type().notNull().default(sql`'{"gold": 0, "silver": 0, "bronze": 0}'`),
  // {gold: 0, silver: 0, bronze: 0}
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow()
});
var purchases = pgTable("purchases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  productId: varchar("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  medalsPaid: jsonb("medals_paid").notNull(),
  status: text("status").notNull().default("pending"),
  // "pending", "approved", or "rejected"
  purchaseDate: timestamp("purchase_date").defaultNow(),
  approvedById: varchar("approved_by_id").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  rejectionReason: text("rejection_reason")
});
var medalAwards = pgTable("medal_awards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  medalType: text("medal_type").notNull(),
  // "gold", "silver", or "bronze"
  amount: integer("amount").notNull().default(1),
  reason: text("reason"),
  // e.g., "attendance", "achievement", "purchase"
  relatedId: varchar("related_id"),
  // Reference to attendance, achievement, etc.
  awardedAt: timestamp("awarded_at").defaultNow()
});
var usersRelations = relations(users, ({ many }) => ({
  groupStudents: many(groupStudents),
  purchases: many(purchases)
}));
var groupsRelations = relations(groups, ({ many }) => ({
  groupStudents: many(groupStudents),
  teacherGroups: many(teacherGroups)
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
  teacher: one(users, {
    fields: [teacherGroups.teacherId],
    references: [users.id]
  }),
  group: one(groups, {
    fields: [teacherGroups.groupId],
    references: [groups.id]
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
var medalAwardsRelations = relations(medalAwards, ({ one }) => ({
  student: one(users, {
    fields: [medalAwards.studentId],
    references: [users.id]
  })
}));
var baseUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
}).extend({
  // Make parentPhone and parentName optional (they are only required for students)
  parentPhone: z.string().optional(),
  parentName: z.string().optional()
});
var insertUserSchema = baseUserSchema.refine(
  (data) => {
    if (data.role === "student") {
      return !!data.parentPhone && data.parentPhone.length > 0 && !!data.parentName && data.parentName.length > 0;
    }
    return true;
  },
  {
    message: "Ota-ona telefon raqami va ismi o'quvchilar uchun talab qilinadi",
    path: ["parentPhone"]
    // This will show the error on the parentPhone field
  }
);
var updateUserSchema = baseUserSchema.partial();
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
var insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true
});
var insertPurchaseSchema = createInsertSchema(purchases).omit({
  id: true,
  purchaseDate: true
});
var insertMedalAwardSchema = createInsertSchema(medalAwards).omit({
  id: true,
  awardedAt: true
});

// server/db.ts
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set!");
}
var pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
    // 🔑 Neon uchun majburiy
  },
  connectionTimeoutMillis: 15e3,
  // 10 soniya kutadi
  idleTimeoutMillis: 3e4,
  // bo‘sh ulanishni yopadi
  max: 10
  // pool ulanishlar soni
}).on("error", (err, client) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});
var db = drizzle(pool, { schema: schema_exports });

// server/storage.ts
import { eq, and, sql as sql2, desc, gte, lte } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
var PostgresSessionStore = connectPg(session);
var DatabaseStorage = class {
  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      tableName: "session",
      createTableIfMissing: true,
      pruneSessionInterval: 60 * 15,
      ttl: 24 * 60 * 60 * 1e3
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
  // Group methods
  async createGroup(group) {
    const [newGroup] = await db.insert(groups).values(group).returning();
    return newGroup;
  }
  async getAllGroups() {
    return await db.select().from(groups).orderBy(desc(groups.createdAt));
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
    const result = await db.delete(groupStudents).where(and(eq(groupStudents.groupId, groupId), eq(groupStudents.studentId, studentId)));
    return (result.rowCount ?? 0) > 0;
  }
  async getGroupStudents(groupId) {
    return await db.select().from(groupStudents).where(eq(groupStudents.groupId, groupId));
  }
  async getStudentGroups(studentId) {
    return await db.select().from(groupStudents).where(eq(groupStudents.studentId, studentId));
  }
  // Teacher Group methods
  async assignTeacherToGroup(teacherGroup) {
    const [newTeacherGroup] = await db.insert(teacherGroups).values(teacherGroup).returning();
    return newTeacherGroup;
  }
  async removeTeacherFromGroup(teacherId, groupId) {
    const result = await db.delete(teacherGroups).where(and(eq(teacherGroups.teacherId, teacherId), eq(teacherGroups.groupId, groupId)));
    return (result.rowCount ?? 0) > 0;
  }
  async getTeacherGroups(teacherId) {
    return await db.select().from(teacherGroups).where(eq(teacherGroups.teacherId, teacherId));
  }
  async getGroupTeachers(groupId) {
    return await db.select().from(teacherGroups).where(eq(teacherGroups.groupId, groupId));
  }
  async updateTeacherGroupStatus(teacherGroupId, completedAt) {
    const [teacherGroup] = await db.update(teacherGroups).set({ completedAt }).where(eq(teacherGroups.id, teacherGroupId)).returning();
    return teacherGroup || void 0;
  }
  async getAllTeachers() {
    return await db.select().from(users).where(eq(users.role, "teacher"));
  }
  async createTeacher(teacher) {
    const [newTeacher] = await db.insert(users).values({ ...teacher, role: "teacher" }).returning();
    return newTeacher;
  }
  async getTeacher(id) {
    const [user] = await db.select().from(users).where(and(eq(users.id, id), eq(users.role, "teacher")));
    return user || void 0;
  }
  async getTeacherByEmail(email) {
    const [user] = await db.select().from(users).where(and(eq(users.email, email), eq(users.role, "teacher")));
    return user || void 0;
  }
  async updateTeacher(id, updates) {
    const [user] = await db.update(users).set(updates).where(and(eq(users.id, id), eq(users.role, "teacher"))).returning();
    return user || void 0;
  }
  async deleteTeacher(id) {
    const result = await db.delete(users).where(and(eq(users.id, id), eq(users.role, "teacher")));
    return (result.rowCount ?? 0) > 0;
  }
  // Product methods
  async createProduct(product) {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }
  async getAllProducts() {
    return await db.select().from(products);
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
    return await db.select().from(purchases).where(eq(purchases.studentId, studentId)).orderBy(desc(purchases.purchaseDate));
  }
  async getPendingPurchases() {
    return await db.select().from(purchases).where(eq(purchases.status, "pending")).orderBy(desc(purchases.purchaseDate));
  }
  async getPurchase(id) {
    const [purchase] = await db.select().from(purchases).where(eq(purchases.id, id));
    return purchase || void 0;
  }
  async approvePurchase(id, adminId) {
    return await db.transaction(async (tx) => {
      const [purchase] = await tx.select().from(purchases).where(eq(purchases.id, id)).for("update");
      if (!purchase || purchase.status !== "pending") throw new Error("Purchase not available");
      const [product] = await tx.select().from(products).where(eq(products.id, purchase.productId)).for("update");
      if (!product || product.quantity <= 0) throw new Error("Product unavailable");
      await tx.update(products).set({ quantity: product.quantity - 1 }).where(eq(products.id, product.id));
      const [updated] = await tx.update(purchases).set({ status: "approved", approvedById: adminId, approvedAt: /* @__PURE__ */ new Date() }).where(eq(purchases.id, id)).returning();
      return updated;
    });
  }
  async rejectPurchase(id, adminId, reason) {
    return await db.transaction(async (tx) => {
      const [purchase] = await tx.select().from(purchases).where(eq(purchases.id, id)).for("update");
      if (!purchase || purchase.status !== "pending") throw new Error("Purchase not available");
      const [student] = await tx.select().from(users).where(eq(users.id, purchase.studentId)).for("update");
      if (student) {
        const currentMedals = student.medals;
        const medalsToRefund = purchase.medalsPaid;
        const newMedals = {
          gold: currentMedals.gold + (medalsToRefund.gold || 0),
          silver: currentMedals.silver + (medalsToRefund.silver || 0),
          bronze: currentMedals.bronze + (medalsToRefund.bronze || 0)
        };
        await tx.update(users).set({ medals: newMedals }).where(eq(users.id, student.id));
      }
      const [updated] = await tx.update(purchases).set({ status: "rejected", approvedById: adminId, approvedAt: /* @__PURE__ */ new Date(), rejectionReason: reason }).where(eq(purchases.id, id)).returning();
      return updated;
    });
  }
  // Medal Award methods
  async createMedalAward(medalAward) {
    const [award] = await db.insert(medalAwards).values(medalAward).returning();
    return award;
  }
  async getStudentMedalAwards(studentId) {
    return await db.select().from(medalAwards).where(eq(medalAwards.studentId, studentId)).orderBy(desc(medalAwards.awardedAt));
  }
  async getMonthlyMedalAwards(studentId, year, month) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);
    return await db.select().from(medalAwards).where(and(eq(medalAwards.studentId, studentId), gte(medalAwards.awardedAt, start), lte(medalAwards.awardedAt, end))).orderBy(desc(medalAwards.awardedAt));
  }
  async canAwardMedals(studentId, medalType, amount = 1) {
    const now = /* @__PURE__ */ new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const results = await db.select().from(medalAwards).where(and(eq(medalAwards.studentId, studentId), eq(medalAwards.medalType, medalType), gte(medalAwards.awardedAt, start), lte(medalAwards.awardedAt, end)));
    const current = results.reduce((sum, a) => sum + a.amount, 0);
    const limits = { gold: 2, silver: 2, bronze: 48 };
    return current + amount <= limits[medalType];
  }
  async awardMedalsSafelyWithTotals(studentId, medalType, amount, reason, relatedId) {
    return await db.transaction(async (tx) => {
      const [student] = await tx.select().from(users).where(eq(users.id, studentId)).for("update");
      if (!student) return { success: false, reason: "O'quvchi topilmadi" };
      if (!await this.canAwardMedals(studentId, medalType, amount)) return { success: false, reason: "Limitga yetildi" };
      const current = student.medals;
      const newMedals = { ...current, [medalType]: current[medalType] + amount };
      await tx.update(users).set({ medals: newMedals }).where(eq(users.id, studentId));
      await tx.insert(medalAwards).values({ studentId, medalType, amount, reason, relatedId });
      return { success: true, updatedTotals: newMedals };
    });
  }
  async revokeMedalsSafely(studentId, medalType, amount, reason, relatedId) {
    return await db.transaction(async (tx) => {
      const [student] = await tx.select().from(users).where(eq(users.id, studentId)).for("update");
      if (!student) return { success: false, reason: "Student not found" };
      const current = student.medals;
      if (current[medalType] < amount) return { success: false, reason: "Not enough medals" };
      const newMedals = { ...current, [medalType]: current[medalType] - amount };
      await tx.update(users).set({ medals: newMedals }).where(eq(users.id, studentId));
      await tx.delete(medalAwards).where(and(eq(medalAwards.studentId, studentId), eq(medalAwards.medalType, medalType), eq(medalAwards.reason, reason), relatedId ? eq(medalAwards.relatedId, relatedId) : sql2`true`));
      return { success: true };
    });
  }
  // Ranking methods
  async getTopStudentsByMedalsThisWeek(limit) {
    const now = /* @__PURE__ */ new Date();
    const start = new Date(now.setDate(now.getDate() - now.getDay()));
    start.setHours(0, 0, 0, 0);
    const result = await db.select({
      id: users.id,
      role: users.role,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      phone: users.phone,
      profilePic: users.profilePic,
      avatarConfig: users.avatarConfig,
      medals: users.medals,
      createdAt: users.createdAt,
      gold: sql2`COALESCE(SUM(CASE WHEN ${medalAwards.medalType} = 'gold' THEN ${medalAwards.amount} ELSE 0 END), 0)`,
      silver: sql2`COALESCE(SUM(CASE WHEN ${medalAwards.medalType} = 'silver' THEN ${medalAwards.amount} ELSE 0 END), 0)`,
      bronze: sql2`COALESCE(SUM(CASE WHEN ${medalAwards.medalType} = 'bronze' THEN ${medalAwards.amount} ELSE 0 END), 0)`
    }).from(users).leftJoin(medalAwards, and(eq(medalAwards.studentId, users.id), gte(medalAwards.awardedAt, start))).where(eq(users.role, "student")).groupBy(users.id).orderBy(desc(sql2`gold * 3 + silver * 2 + bronze`)).limit(limit);
    return result.map((r) => ({ ...r, password: "", parentPhone: null, parentName: null, weeklyMedals: { gold: Number(r.gold), silver: Number(r.silver), bronze: Number(r.bronze) } }));
  }
  async getTopStudentsByMedalsThisMonth(limit) {
    const now = /* @__PURE__ */ new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const result = await db.select({
      id: users.id,
      role: users.role,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      phone: users.phone,
      profilePic: users.profilePic,
      avatarConfig: users.avatarConfig,
      medals: users.medals,
      createdAt: users.createdAt,
      gold: sql2`COALESCE(SUM(CASE WHEN ${medalAwards.medalType} = 'gold' THEN ${medalAwards.amount} ELSE 0 END), 0)`,
      silver: sql2`COALESCE(SUM(CASE WHEN ${medalAwards.medalType} = 'silver' THEN ${medalAwards.amount} ELSE 0 END), 0)`,
      bronze: sql2`COALESCE(SUM(CASE WHEN ${medalAwards.medalType} = 'bronze' THEN ${medalAwards.amount} ELSE 0 END), 0)`
    }).from(users).leftJoin(medalAwards, and(eq(medalAwards.studentId, users.id), gte(medalAwards.awardedAt, start))).where(eq(users.role, "student")).groupBy(users.id).orderBy(desc(sql2`gold * 3 + silver * 2 + bronze`)).limit(limit);
    return result.map((r) => ({ ...r, password: "", parentPhone: null, parentName: null, monthlyMedals: { gold: Number(r.gold), silver: Number(r.silver), bronze: Number(r.bronze) } }));
  }
  async getTopStudentsByMedalsAllTime(limit) {
    const result = await db.select().from(users).where(eq(users.role, "student")).orderBy(desc(sql2`CAST(medals->>'gold' AS INTEGER) * 3 + CAST(medals->>'silver' AS INTEGER) * 2 + CAST(medals->>'bronze' AS INTEGER)`)).limit(limit);
    return result.map((r) => ({ ...r, password: "", parentPhone: null, parentName: null }));
  }
  // Stats methods
  async getStats() {
    const [sc] = await db.select({ count: sql2`count(*)` }).from(users).where(eq(users.role, "student"));
    const [gc] = await db.select({ count: sql2`count(*)` }).from(groups);
    const students = await this.getAllStudents();
    const tm = students.reduce((acc, s) => {
      const m = s.medals;
      acc.gold += m?.gold || 0;
      acc.silver += m?.silver || 0;
      acc.bronze += m?.bronze || 0;
      return acc;
    }, { gold: 0, silver: 0, bronze: 0 });
    return { totalStudents: Number(sc.count), activeGroups: Number(gc.count), totalMedals: tm };
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
    store: storage.sessionStore,
    cookie: {
      maxAge: 24 * 60 * 60 * 1e3,
      // 24 hours
      httpOnly: true,
      secure: false,
      // Set to false for Replit environment
      sameSite: "lax"
      // Allow cross-site requests in iframe
    }
  };
  app2.set("trust proxy", 1);
  app2.use(session2(sessionSettings));
  app2.use("/api", (req, _res, next) => {
    try {
      console.log("API request:", {
        method: req.method,
        path: req.path,
        sessionID: req.sessionID || null,
        hasCookie: !!req.headers?.cookie,
        isAuthenticated: typeof req.isAuthenticated === "function" ? req.isAuthenticated() : false,
        userId: req.user?.id ?? null
      });
    } catch (err) {
      console.debug("API request logging failed", err);
    }
    next();
  });
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
      if (user) {
        const { password, ...publicUser } = user;
        done(null, publicUser);
      } else {
        done(null, null);
      }
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
        const { password, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
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
    try {
      console.log("/api/user called - isAuthenticated:", typeof req.isAuthenticated === "function" ? req.isAuthenticated() : false, "sessionID:", req.sessionID || null);
    } catch (err) {
      console.debug("Error logging /api/user call", err);
    }
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}

// server/notifications.ts
import { WebSocket } from "ws";
var NotificationService = class {
  constructor() {
    this.clients = /* @__PURE__ */ new Map();
    console.log("NotificationService initialized");
  }
  addClient(socket, userId, role) {
    const client = { socket, userId, role };
    this.clients.set(socket, client);
    console.log(`WebSocket client connected: userId=${userId}, role=${role}, total clients: ${this.clients.size}`);
    this.sendToSocket(socket, {
      type: "stats_updated",
      data: { message: "Connected to real-time updates" },
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
    socket.on("close", () => {
      this.clients.delete(socket);
      console.log(`WebSocket client disconnected: userId=${userId}, remaining clients: ${this.clients.size}`);
    });
    socket.on("error", (error) => {
      console.error("WebSocket error:", error);
      this.clients.delete(socket);
    });
  }
  removeClient(socket) {
    this.clients.delete(socket);
  }
  sendToSocket(socket, notification) {
    if (socket.readyState === WebSocket.OPEN) {
      try {
        socket.send(JSON.stringify(notification));
      } catch (error) {
        console.error("Error sending notification to client:", error);
        this.clients.delete(socket);
      }
    }
  }
  // Broadcast to all authenticated clients (sensitive notifications)
  broadcast(notification) {
    console.log(`Broadcasting notification: ${notification.type} to authenticated clients`);
    const isSensitive = ["medal_awarded", "user_created", "payment_created", "attendance_created"].includes(notification.type);
    Array.from(this.clients.entries()).forEach(([socket, client]) => {
      if (isSensitive && !client.userId) {
        return;
      }
      this.sendToSocket(socket, notification);
    });
  }
  // Broadcast to clients with specific role
  broadcastToRole(role, notification) {
    console.log(`Broadcasting to ${role}: ${notification.type}`);
    Array.from(this.clients.entries()).forEach(([socket, client]) => {
      if (client.role === role || role === "all") {
        this.sendToSocket(socket, notification);
      }
    });
  }
  // Broadcast to specific user
  broadcastToUser(userId, notification) {
    console.log(`Broadcasting to user ${userId}: ${notification.type}`);
    Array.from(this.clients.entries()).forEach(([socket, client]) => {
      if (client.userId === userId) {
        this.sendToSocket(socket, notification);
      }
    });
  }
  getConnectedClients() {
    return Array.from(this.clients.values());
  }
  getClientCount() {
    return this.clients.size;
  }
};
var notificationService = new NotificationService();

// server/routes.ts
import { scrypt as scrypt2, randomBytes as randomBytes2 } from "crypto";
import { promisify as promisify2 } from "util";
var scryptAsync2 = promisify2(scrypt2);
async function hashPassword(password) {
  const salt = randomBytes2(16).toString("hex");
  const buf = await scryptAsync2(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
function generateLogin() {
  const digits = Math.floor(1e4 + Math.random() * 9e4).toString();
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const letter = letters.charAt(Math.floor(Math.random() * letters.length));
  return digits + letter;
}
function generatePassword() {
  return Math.floor(1e5 + Math.random() * 9e5).toString();
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
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Autentifikatsiya talab qilinadi" });
    if (req.user.role === "admin") return next();
    if (req.user.role === "student") {
      const studentId = req.params.studentId || req.body.studentId || req.params.id;
      if (studentId && studentId !== req.user.id) return res.status(403).json({ message: "Faqat o'z ma'lumotlaringizga kirish mumkin" });
      return next();
    }
    return res.status(403).json({ message: "Kirish rad etildi" });
  };
  app2.post("/api/students", requireAdmin, async (req, res) => {
    try {
      let login = generateLogin();
      while (await storage.getUserByEmail(login)) login = generateLogin();
      const plainPassword = generatePassword();
      const studentData = insertUserSchema.parse({ ...req.body, email: login, password: plainPassword, role: "student", medals: { gold: 0, silver: 0, bronze: 0 } });
      studentData.password = await hashPassword(plainPassword);
      const student = await storage.createUser(studentData);
      const { password, ...s } = student;
      res.status(201).json({ ...s, generatedCredentials: { login, password: plainPassword } });
    } catch (e) {
      res.status(400).json({ message: "Xatolik" });
    }
  });
  app2.get("/api/students", requireAdmin, async (req, res) => {
    const students = await storage.getAllStudents();
    res.json(students.map(({ password, ...s }) => s));
  });
  app2.get("/api/students/:id", requireStudentOrOwn, async (req, res) => {
    const s = await storage.getUser(req.params.id);
    if (!s) return res.status(404).json({ message: "Topilmadi" });
    const { password, ...rest } = s;
    res.json(rest);
  });
  app2.put("/api/students/:id", requireStudentOrOwn, async (req, res) => {
    try {
      const updates = updateUserSchema.parse(req.body);
      const s = await storage.updateUser(req.params.id, updates);
      if (!s) return res.status(404).json({ message: "Topilmadi" });
      const { password, ...rest } = s;
      res.json(rest);
    } catch (e) {
      res.status(400).json({ message: "Xatolik" });
    }
  });
  app2.delete("/api/students/:id", requireAdmin, async (req, res) => {
    const d = await storage.deleteUser(req.params.id);
    res.json({ message: d ? "O'chirildi" : "Topilmadi" });
  });
  app2.post("/api/groups", requireAdmin, async (req, res) => {
    try {
      res.status(201).json(await storage.createGroup(insertGroupSchema.parse(req.body)));
    } catch (e) {
      res.status(400).json({ message: "Xatolik" });
    }
  });
  app2.get("/api/groups", async (req, res) => res.json(await storage.getAllGroups()));
  app2.get("/api/groups/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Autentifikatsiya" });
    const g = await storage.getGroup(req.params.id);
    if (!g) return res.status(404).json({ message: "Topilmadi" });
    res.json(g);
  });
  app2.post("/api/medals/award", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin" && req.user.role !== "teacher") return res.status(403).json({ message: "Rad etildi" });
    try {
      const { studentId, medalType, amount, reason } = req.body;
      const result = await storage.awardMedalsSafelyWithTotals(studentId, medalType, amount, reason, req.user.id);
      if (result.success) {
        notificationService.broadcast({ type: "medal_awarded", data: { studentId, delta: { [medalType]: amount }, totals: result.updatedTotals, awardedBy: req.user.id, reason }, timestamp: (/* @__PURE__ */ new Date()).toISOString() });
        res.json(result);
      } else res.status(400).json(result);
    } catch (e) {
      res.status(400).json({ message: "Xatolik" });
    }
  });
  app2.get("/api/products", async (req, res) => res.json(await storage.getAllProducts()));
  app2.post("/api/products", requireAdmin, async (req, res) => {
    try {
      res.status(201).json(await storage.createProduct(insertProductSchema.parse(req.body)));
    } catch (e) {
      res.status(400).json({ message: "Xatolik" });
    }
  });
  app2.post("/api/purchases", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "student") return res.status(401).json({ message: "O'quvchi bo'lishingiz kerak" });
    try {
      const { productId } = req.body;
      const product = await storage.getProduct(productId);
      if (!product || !product.isActive || product.quantity <= 0) return res.status(400).json({ message: "Mahsulot mavjud emas" });
      const student = await storage.getUser(req.user.id);
      const currentMedals = student.medals;
      const cost = product.medalCost;
      if (currentMedals.gold < cost.gold || currentMedals.silver < cost.silver || currentMedals.bronze < cost.bronze) {
        return res.status(400).json({ message: "Medallar yetarli emas" });
      }
      const newMedals = {
        gold: currentMedals.gold - cost.gold,
        silver: currentMedals.silver - cost.silver,
        bronze: currentMedals.bronze - cost.bronze
      };
      await storage.updateUser(req.user.id, { medals: newMedals });
      const purchase = await storage.createPurchase({ studentId: req.user.id, productId, medalsPaid: cost, status: "pending" });
      res.status(201).json(purchase);
    } catch (e) {
      res.status(400).json({ message: "Xatolik" });
    }
  });
  app2.get("/api/purchases/pending", requireAdmin, async (req, res) => res.json(await storage.getPendingPurchases()));
  app2.post("/api/purchases/:id/approve", requireAdmin, async (req, res) => {
    try {
      res.json(await storage.approvePurchase(req.params.id, req.user.id));
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  });
  app2.post("/api/purchases/:id/reject", requireAdmin, async (req, res) => {
    try {
      res.json(await storage.rejectPurchase(req.params.id, req.user.id, req.body.reason));
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  });
  app2.get("/api/stats", async (req, res) => res.json(await storage.getStats()));
  const server = createServer(app2);
  const wss = new WebSocketServer({ server, path: "/ws" });
  wss.on("connection", (ws) => {
    ws.on("message", (msg) => {
    });
  });
  return server;
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
    allowedHosts: true,
    fs: {
      strict: false,
      allow: [".."]
    },
    hmr: {
      clientPort: 443
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
    server: {
      ...vite_config_default.server,
      middlewareMode: true,
      hmr: { server }
    },
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
import cors from "cors";
var app = express2();
app.set("trust proxy", 1);
app.use(cors({
  origin: true,
  // Allow all origins in Replit environment
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept"]
}));
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
      if (process.env.NODE_ENV === "development" && capturedJsonResponse) {
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
  if (process.env.NODE_ENV === "development") {
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
