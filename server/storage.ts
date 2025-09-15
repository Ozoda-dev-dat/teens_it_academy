import { users, groups, groupStudents, teacherGroups, attendance, payments, products, purchases, medalAwards } from "@shared/schema";
import type { User, InsertUser, Group, InsertGroup, GroupStudent, InsertGroupStudent, TeacherGroup, InsertTeacherGroup, Attendance, InsertAttendance, Payment, InsertPayment, Product, InsertProduct, Purchase, InsertPurchase, MedalAward, InsertMedalAward } from "@shared/schema";
import { db, pool } from "./db";
import { eq, and, sql, desc, gte, lte } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import MemoryStore from "memorystore";

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
  updateTeacherGroupStatus(teacherGroupId: string, status: string, completedAt: Date | null): Promise<TeacherGroup | undefined>;
  getAllTeachers(): Promise<User[]>;
  createTeacher(teacher: InsertUser): Promise<User>;
  getTeacher(id: string): Promise<User | undefined>;
  getTeacherByEmail(email: string): Promise<User | undefined>;
  updateTeacher(id: string, updates: Partial<InsertUser>): Promise<User | undefined>;
  deleteTeacher(id: string): Promise<boolean>;

  // Attendance methods
  createAttendance(attendance: InsertAttendance): Promise<Attendance>;
  getGroupAttendance(groupId: string): Promise<Attendance[]>;
  getAttendanceByDate(groupId: string, date: Date): Promise<Attendance | undefined>;

  // Payment methods
  createPayment(payment: InsertPayment): Promise<Payment>;
  getStudentPayments(studentId: string): Promise<Payment[]>;
  updatePayment(id: string, updates: Partial<InsertPayment>): Promise<Payment | undefined>;

  // Product methods
  createProduct(product: InsertProduct): Promise<Product>;
  getAllProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;

  // Purchase methods
  createPurchase(purchase: InsertPurchase): Promise<Purchase>;
  getStudentPurchases(studentId: string): Promise<Purchase[]>;

  // Medal Award methods
  createMedalAward(medalAward: InsertMedalAward): Promise<MedalAward>;
  getStudentMedalAwards(studentId: string): Promise<MedalAward[]>;
  getMonthlyMedalAwards(studentId: string, year: number, month: number): Promise<MedalAward[]>;

  // Stats methods
  getStats(): Promise<{
    totalStudents: number;
    activeGroups: number;
    totalMedals: { gold: number; silver: number; bronze: number };
    unpaidAmount: number;
  }>;

  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    // Use PostgreSQL session store for better security and scalability
    // This connects to the same database as the main app using the existing pool
    this.sessionStore = new PostgresSessionStore({
      // Use the existing database pool instead of creating a new connection
      pool: pool,
      tableName: 'session', // Table to store sessions
      createTableIfMissing: true,
      pruneSessionInterval: 60 * 15, // Prune expired sessions every 15 minutes
      // Use shorter session expiry for better security
      ttl: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
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

  // Medal Award methods
  async createMedalAward(medalAward: InsertMedalAward): Promise<MedalAward> {
    const [award] = await db
      .insert(medalAwards)
      .values(medalAward)
      .returning();
    return award;
  }

  async getStudentMedalAwards(studentId: string): Promise<MedalAward[]> {
    const result = await db
      .select()
      .from(medalAwards)
      .where(eq(medalAwards.studentId, studentId))
      .orderBy(desc(medalAwards.awardedAt));
    return result || [];
  }

  async getMonthlyMedalAwards(studentId: string, year: number, month: number): Promise<MedalAward[]> {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);
    
    const result = await db
      .select()
      .from(medalAwards)
      .where(
        and(
          eq(medalAwards.studentId, studentId),
          gte(medalAwards.awardedAt, startOfMonth),
          lte(medalAwards.awardedAt, endOfMonth)
        )
      )
      .orderBy(desc(medalAwards.awardedAt));
    return result || [];
  }

  // Monthly medal tracking using the new medal_awards table
  async getMonthlyMedalCount(studentId: string, year: number, month: number): Promise<{ gold: number; silver: number; bronze: number }> {
    const monthlyAwards = await this.getMonthlyMedalAwards(studentId, year, month);
    
    const counts = { gold: 0, silver: 0, bronze: 0 };
    
    for (const award of monthlyAwards) {
      const medalType = award.medalType as 'gold' | 'silver' | 'bronze';
      if (medalType in counts) {
        counts[medalType] += award.amount;
      }
    }
    
    return counts;
  }

  async canAwardMedals(studentId: string, medalType: 'gold' | 'silver' | 'bronze', amount: number = 1): Promise<boolean> {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    const monthlyCount = await this.getMonthlyMedalCount(studentId, currentYear, currentMonth);
    
    const monthlyLimits = {
      gold: 2,
      silver: 2,
      bronze: 48
    };
    
    return (monthlyCount[medalType] + amount) <= monthlyLimits[medalType];
  }

  async awardMedalsSafely(studentId: string, medalType: 'gold' | 'silver' | 'bronze', amount: number = 1, reason: string = 'attendance', relatedId?: string): Promise<boolean> {
    // Begin transaction to ensure atomicity
    return await db.transaction(async (tx) => {
      // Check if we can award medals (using current state)
      const canAward = await this.canAwardMedals(studentId, medalType, amount);
      if (!canAward) {
        return false;
      }
      
      const student = await tx.select().from(users).where(eq(users.id, studentId)).then(res => res[0]);
      if (!student) {
        return false;
      }
      
      // Update the user's total medal count
      const currentMedals = student.medals as { gold: number; silver: number; bronze: number };
      const newMedals = {
        ...currentMedals,
        [medalType]: currentMedals[medalType] + amount
      };
      
      await tx
        .update(users)
        .set({ medals: newMedals })
        .where(eq(users.id, studentId));
      
      // Create a medal award record for tracking
      await tx
        .insert(medalAwards)
        .values({
          studentId,
          medalType,
          amount,
          reason,
          relatedId
        });
      
      return true;
    });
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getAllStudents(): Promise<User[]> {
    const result = await db.select().from(users).where(eq(users.role, "student"));
    return result || [];
  }

  async getAllTeachers(): Promise<User[]> {
    const result = await db.select().from(users).where(eq(users.role, "teacher"));
    return result || [];
  }

  async createTeacher(insertUser: InsertUser): Promise<User> {
    const teacherData = { ...insertUser, role: 'teacher' as const };
    const [teacher] = await db
      .insert(users)
      .values(teacherData)
      .returning();
    return teacher;
  }

  async getTeacher(id: string): Promise<User | undefined> {
    const [teacher] = await db.select().from(users).where(and(eq(users.id, id), eq(users.role, "teacher")));
    return teacher || undefined;
  }

  async getTeacherByEmail(email: string): Promise<User | undefined> {
    const [teacher] = await db.select().from(users).where(and(eq(users.email, email), eq(users.role, "teacher")));
    return teacher || undefined;
  }

  async updateTeacher(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [teacher] = await db
      .update(users)
      .set(updates)
      .where(and(eq(users.id, id), eq(users.role, "teacher")))
      .returning();
    return teacher || undefined;
  }

  async deleteTeacher(id: string): Promise<boolean> {
    const result = await db.delete(users).where(and(eq(users.id, id), eq(users.role, "teacher")));
    return (result.rowCount ?? 0) > 0;
  }

  // Group methods
  async createGroup(group: InsertGroup): Promise<Group> {
    const [newGroup] = await db
      .insert(groups)
      .values(group)
      .returning();
    return newGroup;
  }

  async getAllGroups(): Promise<Group[]> {
    const result = await db.select().from(groups);
    return result || [];
  }

  async getGroup(id: string): Promise<Group | undefined> {
    const [group] = await db.select().from(groups).where(eq(groups.id, id));
    return group || undefined;
  }

  async updateGroup(id: string, updates: Partial<InsertGroup>): Promise<Group | undefined> {
    const [group] = await db
      .update(groups)
      .set(updates)
      .where(eq(groups.id, id))
      .returning();
    return group || undefined;
  }

  async deleteGroup(id: string): Promise<boolean> {
    const result = await db.delete(groups).where(eq(groups.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Group Student methods
  async addStudentToGroup(groupStudent: InsertGroupStudent): Promise<GroupStudent> {
    const [newGroupStudent] = await db
      .insert(groupStudents)
      .values(groupStudent)
      .returning();
    return newGroupStudent;
  }

  async removeStudentFromGroup(groupId: string, studentId: string): Promise<boolean> {
    const result = await db
      .delete(groupStudents)
      .where(and(
        eq(groupStudents.groupId, groupId),
        eq(groupStudents.studentId, studentId)
      ));
    return (result.rowCount ?? 0) > 0;
  }

  async getGroupStudents(groupId: string): Promise<any[]> {
    const result = await db
      .select({
        id: groupStudents.id,
        groupId: groupStudents.groupId,
        studentId: groupStudents.studentId,
        joinedAt: groupStudents.joinedAt,
        student: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          role: users.role,
        }
      })
      .from(groupStudents)
      .innerJoin(users, eq(groupStudents.studentId, users.id))
      .where(eq(groupStudents.groupId, groupId));
    return result || [];
  }

  async getStudentGroups(studentId: string): Promise<GroupStudent[]> {
    const result = await db
      .select()
      .from(groupStudents)
      .where(eq(groupStudents.studentId, studentId));
    return result || [];
  }

  // Teacher Group methods
  async assignTeacherToGroup(teacherGroup: InsertTeacherGroup): Promise<TeacherGroup> {
    const [newTeacherGroup] = await db
      .insert(teacherGroups)
      .values(teacherGroup)
      .returning();
    return newTeacherGroup;
  }

  async removeTeacherFromGroup(teacherId: string, groupId: string): Promise<boolean> {
    const result = await db
      .delete(teacherGroups)
      .where(and(
        eq(teacherGroups.teacherId, teacherId),
        eq(teacherGroups.groupId, groupId)
      ));
    return (result.rowCount ?? 0) > 0;
  }

  async updateTeacherGroupStatus(teacherGroupId: string, status: string, completedAt: Date | null): Promise<TeacherGroup | undefined> {
    const [updated] = await db
      .update(teacherGroups)
      .set({ status, completedAt })
      .where(eq(teacherGroups.id, teacherGroupId))
      .returning();
    return updated || undefined;
  }

  async getTeacherGroups(teacherId: string): Promise<TeacherGroup[]> {
    const result = await db
      .select()
      .from(teacherGroups)
      .where(eq(teacherGroups.teacherId, teacherId));
    return result || [];
  }

  async getGroupTeachers(groupId: string): Promise<TeacherGroup[]> {
    const result = await db
      .select()
      .from(teacherGroups)
      .where(eq(teacherGroups.groupId, groupId));
    return result || [];
  }

  // Attendance methods
  async createAttendance(attendanceData: InsertAttendance): Promise<Attendance> {
    const [newAttendance] = await db
      .insert(attendance)
      .values(attendanceData)
      .returning();
    return newAttendance;
  }

  async getGroupAttendance(groupId: string): Promise<Attendance[]> {
    try {
      const result = await db
        .select()
        .from(attendance)
        .where(eq(attendance.groupId, groupId))
        .orderBy(desc(attendance.date));
      return result || [];
    } catch (error) {
      console.error("Error fetching group attendance:", error);
      return [];
    }
  }

  async getAttendanceByDate(groupId: string, date: Date): Promise<Attendance | undefined> {
    // Use date-only comparison to prevent duplicate attendance records for the same day
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const nextDay = new Date(dateOnly.getTime() + 24 * 60 * 60 * 1000);
    
    const [attendanceRecord] = await db
      .select()
      .from(attendance)
      .where(and(
        eq(attendance.groupId, groupId),
        gte(attendance.date, dateOnly),
        sql`${attendance.date} < ${nextDay}`
      ));
    return attendanceRecord || undefined;
  }

  // Payment methods
  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [newPayment] = await db
      .insert(payments)
      .values(payment)
      .returning();
    return newPayment;
  }

  async getStudentPayments(studentId: string): Promise<Payment[]> {
    const result = await db
      .select()
      .from(payments)
      .where(eq(payments.studentId, studentId))
      .orderBy(desc(payments.paymentDate));
    return result || [];
  }

  async updatePayment(id: string, updates: Partial<InsertPayment>): Promise<Payment | undefined> {
    const [payment] = await db
      .update(payments)
      .set(updates)
      .where(eq(payments.id, id))
      .returning();
    return payment || undefined;
  }

  // Product methods
  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db
      .insert(products)
      .values(product)
      .returning();
    return newProduct;
  }

  async getAllProducts(): Promise<Product[]> {
    try {
      const result = await db
        .select()
        .from(products)
        .where(eq(products.isActive, true));
      return result || [];
    } catch (error) {
      console.error("Error fetching products:", error);
      return [];
    }
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const [product] = await db
      .update(products)
      .set(updates)
      .where(eq(products.id, id))
      .returning();
    return product || undefined;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Purchase methods
  async createPurchase(purchase: InsertPurchase): Promise<Purchase> {
    const [newPurchase] = await db
      .insert(purchases)
      .values(purchase)
      .returning();
    return newPurchase;
  }

  async getStudentPurchases(studentId: string): Promise<Purchase[]> {
    const result = await db
      .select()
      .from(purchases)
      .where(eq(purchases.studentId, studentId))
      .orderBy(desc(purchases.purchaseDate));
    return result || [];
  }

  // Stats methods
  async getStats(): Promise<{
    totalStudents: number;
    activeGroups: number;
    totalMedals: { gold: number; silver: number; bronze: number };
    unpaidAmount: number;
  }> {
    try {
      // Get total students
      const studentCountResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(eq(users.role, "student"));
      
      const totalStudents = studentCountResult[0]?.count || 0;

      // Get active groups
      const groupCountResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(groups);
      
      const activeGroups = groupCountResult[0]?.count || 0;

      // Get total medals
      const medalResults = await db
        .select({ medals: users.medals })
        .from(users)
        .where(eq(users.role, "student"));

      const totalMedals = (medalResults || []).reduce(
        (acc, user) => {
          const medals = user.medals as { gold: number; silver: number; bronze: number };
          acc.gold += medals?.gold || 0;
          acc.silver += medals?.silver || 0;
          acc.bronze += medals?.bronze || 0;
          return acc;
        },
        { gold: 0, silver: 0, bronze: 0 }
      );

      // Get unpaid amount
      const unpaidPayments = await db
        .select({ amount: payments.amount })
        .from(payments)
        .where(eq(payments.status, "unpaid"));

      const unpaidAmount = (unpaidPayments || []).reduce((total, payment) => total + (payment.amount || 0), 0);

      return {
        totalStudents: Number(totalStudents),
        activeGroups: Number(activeGroups),
        totalMedals,
        unpaidAmount: Number(unpaidAmount) / 100, // Convert from cents to dollars
      };
    } catch (error) {
      console.error("Error fetching stats:", error);
      return {
        totalStudents: 0,
        activeGroups: 0,
        totalMedals: { gold: 0, silver: 0, bronze: 0 },
        unpaidAmount: 0,
      };
    }
  }
}

// Export the storage instance for better build compatibility
export const storage = new DatabaseStorage();
