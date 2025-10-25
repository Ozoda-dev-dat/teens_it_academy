import { users, groups, groupStudents, teacherGroups, attendance, payments, products, purchases } from "../shared/schema";
import type { User, InsertUser, Group, InsertGroup, GroupStudent, InsertGroupStudent, TeacherGroup, InsertTeacherGroup, Attendance, InsertAttendance, Payment, InsertPayment, Product, InsertProduct, Purchase, InsertPurchase } from "../shared/schema";
import { db } from "./db";
import { eq, and, sql, desc } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  getAllStudents(): Promise<User[]>;
  getAllTeachers(): Promise<User[]>;

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

  // Attendance methods
  createAttendance(attendance: InsertAttendance): Promise<Attendance>;
  getGroupAttendance(groupId: string): Promise<Attendance[]>;
  getAttendance(id: string): Promise<Attendance | undefined>;
  getAttendanceByDate(groupId: string, date: Date): Promise<Attendance | undefined>;
  getAttendanceByDateRange(groupId: string, startDate: Date, endDate: Date): Promise<Attendance[]>;
  updateAttendance(id: string, updates: Partial<InsertAttendance>): Promise<Attendance | undefined>;
  deleteAttendance(id: string): Promise<boolean>;

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
  getPendingPurchases(): Promise<Purchase[]>;
  getPurchase(id: string): Promise<Purchase | undefined>;
  updatePurchase(id: string, updates: Partial<InsertPurchase>): Promise<Purchase | undefined>;

  // Stats methods
  getStats(): Promise<{
    totalStudents: number;
    activeGroups: number;
    totalMedals: { gold: number; silver: number; bronze: number };
    unpaidAmount: number;
  }>;
}

export class ServerlessStorage implements IStorage {
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
    return await db.select().from(users).where(eq(users.role, "student"));
  }

  async getAllTeachers(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, "teacher"));
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
    return await db.select().from(groups);
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
    return await db
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
          medals: users.medals,
        }
      })
      .from(groupStudents)
      .innerJoin(users, eq(groupStudents.studentId, users.id))
      .where(eq(groupStudents.groupId, groupId));
  }

  async getStudentGroups(studentId: string): Promise<GroupStudent[]> {
    return await db
      .select()
      .from(groupStudents)
      .where(eq(groupStudents.studentId, studentId));
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

  async updateTeacherGroupStatus(teacherGroupId: string, completedAt: Date | null): Promise<TeacherGroup | undefined> {
    const [updated] = await db
      .update(teacherGroups)
      .set({ completedAt })
      .where(eq(teacherGroups.id, teacherGroupId))
      .returning();
    return updated || undefined;
  }

  async getTeacherGroups(teacherId: string): Promise<TeacherGroup[]> {
    return await db
      .select()
      .from(teacherGroups)
      .where(eq(teacherGroups.teacherId, teacherId));
  }

  async getGroupTeachers(groupId: string): Promise<TeacherGroup[]> {
    return await db
      .select()
      .from(teacherGroups)
      .where(eq(teacherGroups.groupId, groupId));
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
    return await db
      .select()
      .from(attendance)
      .where(eq(attendance.groupId, groupId))
      .orderBy(desc(attendance.date));
  }

  async getAttendance(id: string): Promise<Attendance | undefined> {
    const [attendanceRecord] = await db.select().from(attendance).where(eq(attendance.id, id));
    return attendanceRecord || undefined;
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

  async getAttendanceByDateRange(groupId: string, startDate: Date, endDate: Date): Promise<Attendance[]> {
    return await db
      .select()
      .from(attendance)
      .where(and(
        eq(attendance.groupId, groupId),
        sql`${attendance.date} >= ${startDate}`,
        sql`${attendance.date} <= ${endDate}`
      ))
      .orderBy(desc(attendance.date));
  }

  async updateAttendance(id: string, updates: Partial<InsertAttendance>): Promise<Attendance | undefined> {
    const [attendanceRecord] = await db
      .update(attendance)
      .set(updates)
      .where(eq(attendance.id, id))
      .returning();
    return attendanceRecord || undefined;
  }

  async deleteAttendance(id: string): Promise<boolean> {
    const result = await db.delete(attendance).where(eq(attendance.id, id));
    return (result.rowCount ?? 0) > 0;
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
    return await db
      .select()
      .from(payments)
      .where(eq(payments.studentId, studentId))
      .orderBy(desc(payments.paymentDate));
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
    return await db
      .select()
      .from(products)
      .where(eq(products.isActive, true));
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
    return await db
      .select()
      .from(purchases)
      .where(eq(purchases.studentId, studentId))
      .orderBy(desc(purchases.purchaseDate));
  }

  async getPendingPurchases(): Promise<Purchase[]> {
    return await db
      .select()
      .from(purchases)
      .where(eq(purchases.status, "pending"))
      .orderBy(desc(purchases.purchaseDate));
  }

  async getPurchase(id: string): Promise<Purchase | undefined> {
    const [purchase] = await db
      .select()
      .from(purchases)
      .where(eq(purchases.id, id));
    return purchase || undefined;
  }

  async updatePurchase(id: string, updates: Partial<InsertPurchase>): Promise<Purchase | undefined> {
    const [purchase] = await db
      .update(purchases)
      .set(updates)
      .where(eq(purchases.id, id))
      .returning();
    return purchase || undefined;
  }

  // Stats methods
  async getStats(): Promise<{
    totalStudents: number;
    activeGroups: number;
    totalMedals: { gold: number; silver: number; bronze: number };
    unpaidAmount: number;
  }> {
    // Get total students
    const [{ count: totalStudents }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.role, "student"));

    // Get active groups
    const [{ count: activeGroups }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(groups);

    // Get total medals
    const medalResults = await db
      .select({ medals: users.medals })
      .from(users)
      .where(eq(users.role, "student"));

    const totalMedals = medalResults.reduce(
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

    const unpaidAmount = unpaidPayments.reduce((total, payment) => total + (payment.amount || 0), 0);

    return {
      totalStudents: Number(totalStudents),
      activeGroups: Number(activeGroups),
      totalMedals,
      unpaidAmount: Number(unpaidAmount) / 100, // Convert from cents to dollars
    };
  }
}

export const storage = new ServerlessStorage();
