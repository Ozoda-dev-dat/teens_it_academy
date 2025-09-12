import { users, groups, groupStudents, teacherGroups, attendance, payments, products, purchases } from "@shared/schema";
import type { User, InsertUser, Group, InsertGroup, GroupStudent, InsertGroupStudent, TeacherGroup, InsertTeacherGroup, Attendance, InsertAttendance, Payment, InsertPayment, Product, InsertProduct, Purchase, InsertPurchase } from "@shared/schema";
import { db, pool } from "./db";
import { eq, and, sql, desc } from "drizzle-orm";
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
  getAllTeachers(): Promise<User[]>;

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
    const [attendanceRecord] = await db
      .select()
      .from(attendance)
      .where(and(
        eq(attendance.groupId, groupId),
        eq(attendance.date, date)
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

export const storage = new DatabaseStorage();
