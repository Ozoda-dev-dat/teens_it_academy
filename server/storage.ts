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
  updateTeacherGroupStatus(teacherGroupId: string, completedAt: Date | null): Promise<TeacherGroup | undefined>;
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
  getAllAttendanceByDate(date: Date): Promise<Attendance[]>;
  getAttendance(id: string): Promise<Attendance | undefined>;
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
  approvePurchase(id: string, adminId: string): Promise<Purchase>;
  rejectPurchase(id: string, adminId: string, reason?: string): Promise<Purchase>;

  // Medal Award methods
  createMedalAward(medalAward: InsertMedalAward): Promise<MedalAward>;
  getStudentMedalAwards(studentId: string): Promise<MedalAward[]>;
  getMonthlyMedalAwards(studentId: string, year: number, month: number): Promise<MedalAward[]>;
  
  // Student Rankings methods
  getTopStudentsByMedalsThisWeek(limit: number): Promise<Array<User & { weeklyMedals: { gold: number; silver: number; bronze: number } }>>;
  getTopStudentsByMedalsThisMonth(limit: number): Promise<Array<User & { monthlyMedals: { gold: number; silver: number; bronze: number } }>>;
  getTopStudentsByMedalsAllTime(limit: number): Promise<User[]>;

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

  // Student Rankings methods
  async getTopStudentsByMedalsThisWeek(limit: number): Promise<Array<User & { weeklyMedals: { gold: number; silver: number; bronze: number } }>> {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const result = await db
      .select({
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
        goldCount: sql<number>`COALESCE(SUM(CASE WHEN ${medalAwards.medalType} = 'gold' THEN ${medalAwards.amount} ELSE 0 END), 0)`,
        silverCount: sql<number>`COALESCE(SUM(CASE WHEN ${medalAwards.medalType} = 'silver' THEN ${medalAwards.amount} ELSE 0 END), 0)`,
        bronzeCount: sql<number>`COALESCE(SUM(CASE WHEN ${medalAwards.medalType} = 'bronze' THEN ${medalAwards.amount} ELSE 0 END), 0)`,
      })
      .from(users)
      .leftJoin(medalAwards, and(
        sql`${medalAwards.studentId}::varchar = ${users.id}::varchar`,
        gte(medalAwards.awardedAt, startOfWeek)
      ))
      .where(eq(users.role, 'student'))
      .groupBy(users.id)
      .orderBy(desc(sql`COALESCE(SUM(CASE WHEN ${medalAwards.medalType} = 'gold' THEN ${medalAwards.amount} ELSE 0 END), 0) * 3 + COALESCE(SUM(CASE WHEN ${medalAwards.medalType} = 'silver' THEN ${medalAwards.amount} ELSE 0 END), 0) * 2 + COALESCE(SUM(CASE WHEN ${medalAwards.medalType} = 'bronze' THEN ${medalAwards.amount} ELSE 0 END), 0)`))
      .limit(limit);

    return result.map(row => ({
      id: row.id,
      role: row.role,
      email: row.email,
      password: '', // Never expose password
      firstName: row.firstName,
      lastName: row.lastName,
      phone: row.phone,
      parentPhone: null, // Don't expose parent contact info in rankings
      parentName: null, // Don't expose parent name in rankings
      profilePic: row.profilePic,
      avatarConfig: row.avatarConfig,
      medals: row.medals,
      createdAt: row.createdAt,
      weeklyMedals: {
        gold: Number(row.goldCount) || 0,
        silver: Number(row.silverCount) || 0,
        bronze: Number(row.bronzeCount) || 0,
      }
    }));
  }

  async getTopStudentsByMedalsThisMonth(limit: number): Promise<Array<User & { monthlyMedals: { gold: number; silver: number; bronze: number } }>> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const result = await db
      .select({
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
        goldCount: sql<number>`COALESCE(SUM(CASE WHEN ${medalAwards.medalType} = 'gold' THEN ${medalAwards.amount} ELSE 0 END), 0)`,
        silverCount: sql<number>`COALESCE(SUM(CASE WHEN ${medalAwards.medalType} = 'silver' THEN ${medalAwards.amount} ELSE 0 END), 0)`,
        bronzeCount: sql<number>`COALESCE(SUM(CASE WHEN ${medalAwards.medalType} = 'bronze' THEN ${medalAwards.amount} ELSE 0 END), 0)`,
      })
      .from(users)
      .leftJoin(medalAwards, and(
        sql`${medalAwards.studentId}::varchar = ${users.id}::varchar`,
        gte(medalAwards.awardedAt, startOfMonth)
      ))
      .where(eq(users.role, 'student'))
      .groupBy(users.id)
      .orderBy(desc(sql`COALESCE(SUM(CASE WHEN ${medalAwards.medalType} = 'gold' THEN ${medalAwards.amount} ELSE 0 END), 0) * 3 + COALESCE(SUM(CASE WHEN ${medalAwards.medalType} = 'silver' THEN ${medalAwards.amount} ELSE 0 END), 0) * 2 + COALESCE(SUM(CASE WHEN ${medalAwards.medalType} = 'bronze' THEN ${medalAwards.amount} ELSE 0 END), 0)`))
      .limit(limit);

    return result.map(row => ({
      id: row.id,
      role: row.role,
      email: row.email,
      password: '', // Never expose password
      firstName: row.firstName,
      lastName: row.lastName,
      phone: row.phone,
      parentPhone: null, // Don't expose parent contact info in rankings
      parentName: null, // Don't expose parent name in rankings
      profilePic: row.profilePic,
      avatarConfig: row.avatarConfig,
      medals: row.medals,
      createdAt: row.createdAt,
      monthlyMedals: {
        gold: Number(row.goldCount) || 0,
        silver: Number(row.silverCount) || 0,
        bronze: Number(row.bronzeCount) || 0,
      }
    }));
  }

  async getTopStudentsByMedalsAllTime(limit: number): Promise<User[]> {
    const result = await db
      .select({
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
      })
      .from(users)
      .where(eq(users.role, 'student'))
      .orderBy(desc(sql`(CAST(${users.medals}->>'gold' AS INTEGER) * 3 + CAST(${users.medals}->>'silver' AS INTEGER) * 2 + CAST(${users.medals}->>'bronze' AS INTEGER))`))
      .limit(limit);

    return result.map(row => ({
      id: row.id,
      role: row.role,
      email: row.email,
      password: '', // Never expose password
      firstName: row.firstName,
      lastName: row.lastName,
      phone: row.phone,
      parentPhone: null, // Don't expose parent contact info in rankings
      parentName: null, // Don't expose parent name in rankings
      profilePic: row.profilePic,
      avatarConfig: row.avatarConfig,
      medals: row.medals,
      createdAt: row.createdAt,
    }));
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

  async revokeMedalsSafely(studentId: string, medalType: 'gold' | 'silver' | 'bronze', amount: number = 1, reason: string = 'attendance', relatedId?: string): Promise<{success: boolean, reason?: string}> {
    return await db.transaction(async (tx) => {
      const student = await tx.select().from(users).where(eq(users.id, studentId)).then(res => res[0]);
      if (!student) {
        return { success: false, reason: 'Student not found' };
      }

      // Check if student has enough medals to revoke
      const currentMedals = student.medals as { gold: number; silver: number; bronze: number };
      if (currentMedals[medalType] < amount) {
        return { success: false, reason: `Student only has ${currentMedals[medalType]} ${medalType} medals, cannot revoke ${amount}` };
      }

      // Find specific medal awards to revoke if relatedId is provided
      if (relatedId) {
        const existingAwards = await tx
          .select()
          .from(medalAwards)
          .where(
            and(
              eq(medalAwards.studentId, studentId),
              eq(medalAwards.medalType, medalType),
              eq(medalAwards.reason, reason),
              eq(medalAwards.relatedId, relatedId)
            )
          );

        if (existingAwards.length === 0) {
          return { success: false, reason: 'No matching medal awards found to revoke' };
        }

        // Delete the specific medal award record(s)
        await tx
          .delete(medalAwards)
          .where(
            and(
              eq(medalAwards.studentId, studentId),
              eq(medalAwards.medalType, medalType),
              eq(medalAwards.reason, reason),
              eq(medalAwards.relatedId, relatedId)
            )
          );
      }

      // Update the user's total medal count
      const newMedals = {
        ...currentMedals,
        [medalType]: currentMedals[medalType] - amount
      };

      await tx
        .update(users)
        .set({ medals: newMedals })
        .where(eq(users.id, studentId));

      return { success: true };
    });
  }

  async awardMedalsSafelyWithTotals(studentId: string, medalType: 'gold' | 'silver' | 'bronze', amount: number = 1, reason: string = 'attendance', relatedId?: string): Promise<{ success: boolean; updatedTotals?: { gold: number; silver: number; bronze: number }; reason?: string }> {
    // Begin transaction to ensure atomicity with proper row locking
    return await db.transaction(async (tx) => {
      try {
        // Lock the student row and get current data
        const [student] = await tx
          .select()
          .from(users)
          .where(eq(users.id, studentId))
          .for('update')
          .then(res => res);
        
        if (!student) {
          return { success: false, reason: 'Student not found' };
        }
        
        // Check monthly limit within the transaction (using locked data)
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;
        const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
        const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59);
        
        const monthlyAwards = await tx
          .select()
          .from(medalAwards)
          .where(
            and(
              eq(medalAwards.studentId, studentId),
              eq(medalAwards.medalType, medalType),
              gte(medalAwards.awardedAt, startOfMonth),
              lte(medalAwards.awardedAt, endOfMonth)
            )
          );
        
        const currentMonthlyCount = monthlyAwards.reduce((sum, award) => sum + award.amount, 0);
        const monthlyLimits = { gold: 2, silver: 2, bronze: 48 };
        
        if ((currentMonthlyCount + amount) > monthlyLimits[medalType]) {
          return { success: false, reason: 'Monthly medal limit reached' };
        }
        
        // Update the user's total medal count atomically
        const currentMedals = student.medals as { gold: number; silver: number; bronze: number };
        const newMedals = {
          ...currentMedals,
          [medalType]: currentMedals[medalType] + amount
        };
        
        // Use RETURNING to get the updated totals atomically
        const [updatedUser] = await tx
          .update(users)
          .set({ medals: newMedals })
          .where(eq(users.id, studentId))
          .returning({ medals: users.medals });
        
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
        
        return { 
          success: true, 
          updatedTotals: updatedUser.medals as { gold: number; silver: number; bronze: number }
        };
      } catch (error) {
        console.error('Error in medal award transaction:', error);
        return { success: false, reason: 'Database transaction failed' };
      }
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
          medals: users.medals,
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

  async updateTeacherGroupStatus(teacherGroupId: string, completedAt: Date | null): Promise<TeacherGroup | undefined> {
    const [updated] = await db
      .update(teacherGroups)
      .set({ completedAt })
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

  async getAllAttendanceByDate(date: Date): Promise<Attendance[]> {
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const nextDay = new Date(dateOnly.getTime() + 24 * 60 * 60 * 1000);
    
    const result = await db
      .select()
      .from(attendance)
      .where(and(
        gte(attendance.date, dateOnly),
        sql`${attendance.date} < ${nextDay}`
      ))
      .orderBy(desc(attendance.createdAt));
    return result || [];
  }

  async getAttendance(id: string): Promise<Attendance | undefined> {
    const [attendanceRecord] = await db
      .select()
      .from(attendance)
      .where(eq(attendance.id, id));
    return attendanceRecord || undefined;
  }

  async updateAttendance(id: string, updates: Partial<InsertAttendance>): Promise<Attendance | undefined> {
    const [updatedAttendance] = await db
      .update(attendance)
      .set(updates)
      .where(eq(attendance.id, id))
      .returning();
    return updatedAttendance || undefined;
  }

  async deleteAttendance(id: string): Promise<boolean> {
    const result = await db
      .delete(attendance)
      .where(eq(attendance.id, id))
      .returning({ id: attendance.id });
    return result.length > 0;
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

  async getPendingPurchases(): Promise<Purchase[]> {
    const result = await db
      .select()
      .from(purchases)
      .where(eq(purchases.status, "pending"))
      .orderBy(desc(purchases.purchaseDate));
    return result || [];
  }

  async getPurchase(id: string): Promise<Purchase | undefined> {
    const [purchase] = await db
      .select()
      .from(purchases)
      .where(eq(purchases.id, id));
    return purchase || undefined;
  }

  async approvePurchase(id: string, adminId: string): Promise<Purchase> {
    const [updated] = await db
      .update(purchases)
      .set({
        status: "approved",
        approvedById: adminId,
        approvedAt: new Date(),
      })
      .where(eq(purchases.id, id))
      .returning();
    return updated;
  }

  async rejectPurchase(id: string, adminId: string, reason?: string): Promise<Purchase> {
    const [updated] = await db
      .update(purchases)
      .set({
        status: "rejected",
        approvedById: adminId,
        approvedAt: new Date(),
        rejectionReason: reason || null,
      })
      .where(eq(purchases.id, id))
      .returning();
    return updated;
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
