import { users, groups, groupStudents, teacherGroups, products, purchases, medalAwards } from "@shared/schema";
import type { User, InsertUser, Group, InsertGroup, GroupStudent, InsertGroupStudent, TeacherGroup, InsertTeacherGroup, Product, InsertProduct, Purchase, InsertPurchase, MedalAward, InsertMedalAward } from "@shared/schema";
import { db, pool } from "./db";
import { eq, and, sql, desc, gte, lte } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  getAllStudents(): Promise<User[]>;

  // Group methods
  createGroup(group: InsertGroup): Promise<Group>;
  getAllGroups(): Promise<Group[]>;
  getGroup(id: string): Promise<Group | undefined>;
  updateGroup(id: string, updates: Partial<InsertGroup>): Promise<Group | undefined>;
  deleteGroup(id: string): Promise<boolean>;

  // Group Student methods
  addStudentToGroup(groupStudent: InsertGroupStudent): Promise<GroupStudent>;
  removeStudentFromGroup(groupId: string, studentId: string): Promise<boolean>;
  getGroupStudents(groupId: string): Promise<GroupStudent[]>;
  getStudentGroups(studentId: string): Promise<GroupStudent[]>;

  // Teacher Group methods
  assignTeacherToGroup(teacherGroup: InsertTeacherGroup): Promise<TeacherGroup>;
  removeTeacherFromGroup(teacherId: string, groupId: string): Promise<boolean>;
  getTeacherGroups(teacherId: string): Promise<TeacherGroup[]>;
  getGroupTeachers(groupId: string): Promise<TeacherGroup[]>;
  updateTeacherGroupStatus(teacherGroupId: string, completedAt: Date | null): Promise<TeacherGroup | undefined>;
  getAllTeachers(): Promise<User[]>;
  createTeacher(teacher: InsertUser): Promise<User>;
  getTeacher(id: string): Promise<User | undefined>;
  getTeacherByEmail(email: string): Promise<User | undefined>;
  updateTeacher(id: string, updates: Partial<InsertUser>): Promise<User | undefined>;
  deleteTeacher(id: string): Promise<boolean>;

  // Product methods
  createProduct(product: InsertProduct): Promise<Product>;
  getAllProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;

  // Purchase methods
  createPurchase(purchase: InsertPurchase): Promise<Purchase>;
  getStudentPurchases(studentId: string): Promise<Purchase[]>;
  getPendingPurchases(): Promise<Purchase[]>;
  getPurchase(id: string): Promise<Purchase | undefined>;
  approvePurchase(id: string, adminId: string): Promise<Purchase>;
  rejectPurchase(id: string, adminId: string, reason?: string): Promise<Purchase>;

  // Medal Award methods
  createMedalAward(medalAward: InsertMedalAward): Promise<MedalAward>;
  getStudentMedalAwards(studentId: string): Promise<MedalAward[]>;
  getMonthlyMedalAwards(studentId: string, year: number, month: number): Promise<MedalAward[]>;
  canAwardMedals(studentId: string, medalType: 'gold' | 'silver' | 'bronze', amount?: number): Promise<boolean>;
  awardMedalsSafelyWithTotals(studentId: string, medalType: 'gold' | 'silver' | 'bronze', amount: number, reason: string, relatedId?: string): Promise<{ success: boolean; updatedTotals?: { gold: number; silver: number; bronze: number }; reason?: string }>;
  revokeMedalsSafely(studentId: string, medalType: 'gold' | 'silver' | 'bronze', amount: number, reason: string, relatedId?: string): Promise<{success: boolean, reason?: string}>;
  
  // Student Rankings methods
  getTopStudentsByMedalsThisWeek(limit: number): Promise<Array<User & { weeklyMedals: { gold: number; silver: number; bronze: number } }>>;
  getTopStudentsByMedalsThisMonth(limit: number): Promise<Array<User & { monthlyMedals: { gold: number; silver: number; bronze: number } }>>;
  getTopStudentsByMedalsAllTime(limit: number): Promise<User[]>;

  // Stats methods
  getStats(): Promise<{
    totalStudents: number;
    activeGroups: number;
    totalMedals: { gold: number; silver: number; bronze: number };
  }>;

  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool: pool,
      tableName: 'session',
      createTableIfMissing: true,
      pruneSessionInterval: 60 * 15,
      ttl: 24 * 60 * 60 * 1000,
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getAllStudents(): Promise<User[]> {
    const result = await db.select().from(users).where(eq(users.role, "student"));
    return result || [];
  }

  // Group methods
  async createGroup(group: InsertGroup): Promise<Group> {
    const [newGroup] = await db.insert(groups).values(group).returning();
    return newGroup;
  }

  async getAllGroups(): Promise<Group[]> {
    return await db.select().from(groups).orderBy(desc(groups.createdAt));
  }

  async getGroup(id: string): Promise<Group | undefined> {
    const [group] = await db.select().from(groups).where(eq(groups.id, id));
    return group || undefined;
  }

  async updateGroup(id: string, updates: Partial<InsertGroup>): Promise<Group | undefined> {
    const [group] = await db.update(groups).set(updates).where(eq(groups.id, id)).returning();
    return group || undefined;
  }

  async deleteGroup(id: string): Promise<boolean> {
    const result = await db.delete(groups).where(eq(groups.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Group Student methods
  async addStudentToGroup(groupStudent: InsertGroupStudent): Promise<GroupStudent> {
    const [newGroupStudent] = await db.insert(groupStudents).values(groupStudent).returning();
    return newGroupStudent;
  }

  async removeStudentFromGroup(groupId: string, studentId: string): Promise<boolean> {
    const result = await db.delete(groupStudents).where(and(eq(groupStudents.groupId, groupId), eq(groupStudents.studentId, studentId)));
    return (result.rowCount ?? 0) > 0;
  }

  async getGroupStudents(groupId: string): Promise<GroupStudent[]> {
    return await db.select().from(groupStudents).where(eq(groupStudents.groupId, groupId));
  }

  async getStudentGroups(studentId: string): Promise<GroupStudent[]> {
    return await db.select().from(groupStudents).where(eq(groupStudents.studentId, studentId));
  }

  // Teacher Group methods
  async assignTeacherToGroup(teacherGroup: InsertTeacherGroup): Promise<TeacherGroup> {
    const [newTeacherGroup] = await db.insert(teacherGroups).values(teacherGroup).returning();
    return newTeacherGroup;
  }

  async removeTeacherFromGroup(teacherId: string, groupId: string): Promise<boolean> {
    const result = await db.delete(teacherGroups).where(and(eq(teacherGroups.teacherId, teacherId), eq(teacherGroups.groupId, groupId)));
    return (result.rowCount ?? 0) > 0;
  }

  async getTeacherGroups(teacherId: string): Promise<TeacherGroup[]> {
    return await db.select().from(teacherGroups).where(eq(teacherGroups.teacherId, teacherId));
  }

  async getGroupTeachers(groupId: string): Promise<TeacherGroup[]> {
    return await db.select().from(teacherGroups).where(eq(teacherGroups.groupId, groupId));
  }

  async updateTeacherGroupStatus(teacherGroupId: string, completedAt: Date | null): Promise<TeacherGroup | undefined> {
    const [teacherGroup] = await db.update(teacherGroups).set({ completedAt }).where(eq(teacherGroups.id, teacherGroupId)).returning();
    return teacherGroup || undefined;
  }

  async getAllTeachers(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, "teacher"));
  }

  async createTeacher(teacher: InsertUser): Promise<User> {
    const [newTeacher] = await db.insert(users).values({ ...teacher, role: "teacher" }).returning();
    return newTeacher;
  }

  async getTeacher(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(and(eq(users.id, id), eq(users.role, "teacher")));
    return user || undefined;
  }

  async getTeacherByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(and(eq(users.email, email), eq(users.role, "teacher")));
    return user || undefined;
  }

  async updateTeacher(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users).set(updates).where(and(eq(users.id, id), eq(users.role, "teacher"))).returning();
    return user || undefined;
  }

  async deleteTeacher(id: string): Promise<boolean> {
    const result = await db.delete(users).where(and(eq(users.id, id), eq(users.role, "teacher")));
    return (result.rowCount ?? 0) > 0;
  }

  // Product methods
  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.isActive, true));
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const [product] = await db.update(products).set(updates).where(eq(products.id, id)).returning();
    return product || undefined;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Purchase methods
  async createPurchase(purchase: InsertPurchase): Promise<Purchase> {
    const [newPurchase] = await db.insert(purchases).values(purchase).returning();
    return newPurchase;
  }

  async getStudentPurchases(studentId: string): Promise<Purchase[]> {
    return await db.select().from(purchases).where(eq(purchases.studentId, studentId)).orderBy(desc(purchases.purchaseDate));
  }

  async getPendingPurchases(): Promise<Purchase[]> {
    return await db.select().from(purchases).where(eq(purchases.status, "pending")).orderBy(desc(purchases.purchaseDate));
  }

  async getPurchase(id: string): Promise<Purchase | undefined> {
    const [purchase] = await db.select().from(purchases).where(eq(purchases.id, id));
    return purchase || undefined;
  }

  async approvePurchase(id: string, adminId: string): Promise<Purchase> {
    return await db.transaction(async (tx) => {
      const [purchase] = await tx.select().from(purchases).where(eq(purchases.id, id)).for('update');
      if (!purchase || purchase.status !== 'pending') throw new Error('Purchase not available');
      const [product] = await tx.select().from(products).where(eq(products.id, purchase.productId)).for('update');
      if (!product || product.quantity <= 0) throw new Error('Product unavailable');
      await tx.update(products).set({ quantity: product.quantity - 1 }).where(eq(products.id, product.id));
      const [updated] = await tx.update(purchases).set({ status: 'approved', approvedById: adminId, approvedAt: new Date() }).where(eq(purchases.id, id)).returning();
      return updated;
    });
  }

  async rejectPurchase(id: string, adminId: string, reason?: string): Promise<Purchase> {
    return await db.transaction(async (tx) => {
      const [purchase] = await tx.select().from(purchases).where(eq(purchases.id, id)).for('update');
      if (!purchase || purchase.status !== 'pending') throw new Error('Purchase not available');
      
      const [student] = await tx.select().from(users).where(eq(users.id, purchase.studentId)).for('update');
      if (student) {
        const currentMedals = student.medals as { gold: number; silver: number; bronze: number };
        const medalsToRefund = purchase.medalsPaid as { gold: number; silver: number; bronze: number };
        const newMedals = {
          gold: currentMedals.gold + (medalsToRefund.gold || 0),
          silver: currentMedals.silver + (medalsToRefund.silver || 0),
          bronze: currentMedals.bronze + (medalsToRefund.bronze || 0),
        };
        await tx.update(users).set({ medals: newMedals }).where(eq(users.id, student.id));
      }

      const [updated] = await tx.update(purchases).set({ status: 'rejected', approvedById: adminId, approvedAt: new Date(), rejectionReason: reason }).where(eq(purchases.id, id)).returning();
      return updated;
    });
  }

  // Medal Award methods
  async createMedalAward(medalAward: InsertMedalAward): Promise<MedalAward> {
    const [award] = await db.insert(medalAwards).values(medalAward).returning();
    return award;
  }

  async getStudentMedalAwards(studentId: string): Promise<MedalAward[]> {
    return await db.select().from(medalAwards).where(eq(medalAwards.studentId, studentId)).orderBy(desc(medalAwards.awardedAt));
  }

  async getMonthlyMedalAwards(studentId: string, year: number, month: number): Promise<MedalAward[]> {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);
    return await db.select().from(medalAwards).where(and(eq(medalAwards.studentId, studentId), gte(medalAwards.awardedAt, start), lte(medalAwards.awardedAt, end))).orderBy(desc(medalAwards.awardedAt));
  }

  async canAwardMedals(studentId: string, medalType: 'gold' | 'silver' | 'bronze', amount: number = 1): Promise<boolean> {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const results = await db.select().from(medalAwards).where(and(eq(medalAwards.studentId, studentId), eq(medalAwards.medalType, medalType), gte(medalAwards.awardedAt, start), lte(medalAwards.awardedAt, end)));
    const current = results.reduce((sum, a) => sum + a.amount, 0);
    const limits = { gold: 2, silver: 2, bronze: 48 };
    return (current + amount) <= limits[medalType];
  }

  async awardMedalsSafelyWithTotals(studentId: string, medalType: 'gold' | 'silver' | 'bronze', amount: number, reason: string, relatedId?: string): Promise<{ success: boolean; updatedTotals?: { gold: number; silver: number; bronze: number }; reason?: string }> {
    return await db.transaction(async (tx) => {
      const [student] = await tx.select().from(users).where(eq(users.id, studentId)).for('update');
      if (!student) return { success: false, reason: 'Student not found' };
      if (!await this.canAwardMedals(studentId, medalType, amount)) return { success: false, reason: 'Limit reached' };
      const current = student.medals as { gold: number; silver: number; bronze: number };
      const newMedals = { ...current, [medalType]: current[medalType] + amount };
      await tx.update(users).set({ medals: newMedals }).where(eq(users.id, studentId));
      await tx.insert(medalAwards).values({ studentId, medalType, amount, reason, relatedId });
      return { success: true, updatedTotals: newMedals };
    });
  }

  async revokeMedalsSafely(studentId: string, medalType: 'gold' | 'silver' | 'bronze', amount: number, reason: string, relatedId?: string): Promise<{success: boolean, reason?: string}> {
    return await db.transaction(async (tx) => {
      const [student] = await tx.select().from(users).where(eq(users.id, studentId)).for('update');
      if (!student) return { success: false, reason: 'Student not found' };
      const current = student.medals as { gold: number; silver: number; bronze: number };
      if (current[medalType] < amount) return { success: false, reason: 'Not enough medals' };
      const newMedals = { ...current, [medalType]: current[medalType] - amount };
      await tx.update(users).set({ medals: newMedals }).where(eq(users.id, studentId));
      await tx.delete(medalAwards).where(and(eq(medalAwards.studentId, studentId), eq(medalAwards.medalType, medalType), eq(medalAwards.reason, reason), relatedId ? eq(medalAwards.relatedId, relatedId) : sql`true`));
      return { success: true };
    });
  }

  // Ranking methods
  async getTopStudentsByMedalsThisWeek(limit: number): Promise<Array<User & { weeklyMedals: { gold: number; silver: number; bronze: number } }>> {
    const now = new Date();
    const start = new Date(now.setDate(now.getDate() - now.getDay()));
    start.setHours(0,0,0,0);
    const result = await db.select({
      id: users.id, role: users.role, email: users.email, firstName: users.firstName, lastName: users.lastName, phone: users.phone, profilePic: users.profilePic, avatarConfig: users.avatarConfig, medals: users.medals, createdAt: users.createdAt,
      gold: sql<number>`COALESCE(SUM(CASE WHEN ${medalAwards.medalType} = 'gold' THEN ${medalAwards.amount} ELSE 0 END), 0)`,
      silver: sql<number>`COALESCE(SUM(CASE WHEN ${medalAwards.medalType} = 'silver' THEN ${medalAwards.amount} ELSE 0 END), 0)`,
      bronze: sql<number>`COALESCE(SUM(CASE WHEN ${medalAwards.medalType} = 'bronze' THEN ${medalAwards.amount} ELSE 0 END), 0)`
    }).from(users).leftJoin(medalAwards, and(eq(medalAwards.studentId, users.id), gte(medalAwards.awardedAt, start))).where(eq(users.role, 'student')).groupBy(users.id).orderBy(desc(sql`gold * 3 + silver * 2 + bronze`)).limit(limit);
    return result.map(r => ({ ...r, password: '', parentPhone: null, parentName: null, weeklyMedals: { gold: Number(r.gold), silver: Number(r.silver), bronze: Number(r.bronze) } as any }));
  }

  async getTopStudentsByMedalsThisMonth(limit: number): Promise<Array<User & { monthlyMedals: { gold: number; silver: number; bronze: number } }>> {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const result = await db.select({
      id: users.id, role: users.role, email: users.email, firstName: users.firstName, lastName: users.lastName, phone: users.phone, profilePic: users.profilePic, avatarConfig: users.avatarConfig, medals: users.medals, createdAt: users.createdAt,
      gold: sql<number>`COALESCE(SUM(CASE WHEN ${medalAwards.medalType} = 'gold' THEN ${medalAwards.amount} ELSE 0 END), 0)`,
      silver: sql<number>`COALESCE(SUM(CASE WHEN ${medalAwards.medalType} = 'silver' THEN ${medalAwards.amount} ELSE 0 END), 0)`,
      bronze: sql<number>`COALESCE(SUM(CASE WHEN ${medalAwards.medalType} = 'bronze' THEN ${medalAwards.amount} ELSE 0 END), 0)`
    }).from(users).leftJoin(medalAwards, and(eq(medalAwards.studentId, users.id), gte(medalAwards.awardedAt, start))).where(eq(users.role, 'student')).groupBy(users.id).orderBy(desc(sql`gold * 3 + silver * 2 + bronze`)).limit(limit);
    return result.map(r => ({ ...r, password: '', parentPhone: null, parentName: null, monthlyMedals: { gold: Number(r.gold), silver: Number(r.silver), bronze: Number(r.bronze) } as any }));
  }

  async getTopStudentsByMedalsAllTime(limit: number): Promise<User[]> {
    const result = await db.select().from(users).where(eq(users.role, 'student')).orderBy(desc(sql`CAST(medals->>'gold' AS INTEGER) * 3 + CAST(medals->>'silver' AS INTEGER) * 2 + CAST(medals->>'bronze' AS INTEGER)`)).limit(limit);
    return result.map(r => ({ ...r, password: '', parentPhone: null, parentName: null }));
  }

  // Stats methods
  async getStats(): Promise<{ totalStudents: number; activeGroups: number; totalMedals: { gold: number; silver: number; bronze: number } }> {
    const [sc] = await db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.role, 'student'));
    const [gc] = await db.select({ count: sql<number>`count(*)` }).from(groups);
    const students = await this.getAllStudents();
    const tm = students.reduce((acc, s) => {
      const m = s.medals as any;
      acc.gold += m?.gold || 0;
      acc.silver += m?.silver || 0;
      acc.bronze += m?.bronze || 0;
      return acc;
    }, { gold: 0, silver: 0, bronze: 0 });
    return { totalStudents: Number(sc.count), activeGroups: Number(gc.count), totalMedals: tm };
  }
}

export const storage = new DatabaseStorage();