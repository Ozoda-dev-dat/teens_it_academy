import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, boolean, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  role: text("role").notNull().default("student"), // "admin", "student", or "teacher"
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  profilePic: text("profile_pic"),
  avatarConfig: jsonb("avatar_config"), // Stores detailed avatar customization data
  medals: jsonb("medals").default(sql`'{"gold": 0, "silver": 0, "bronze": 0}'`),
  createdAt: timestamp("created_at").defaultNow(),
});

// Teachers are now users with role="teacher" - removed separate teachers table

export const groups = pgTable("groups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  schedule: jsonb("schedule"), // array of class times
  createdAt: timestamp("created_at").defaultNow(),
});

export const groupStudents = pgTable("group_students", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  groupId: varchar("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
  studentId: varchar("student_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const teacherGroups = pgTable("teacher_groups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teacherId: varchar("teacher_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  groupId: varchar("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("active"), // "active" or "completed"
  assignedAt: timestamp("assigned_at").defaultNow(),
  completedAt: timestamp("completed_at"),
}, (table) => ({
  // Unique constraint to prevent duplicate teacher-group assignments
  uniqueTeacherGroup: unique().on(table.teacherId, table.groupId),
}));

export const attendance = pgTable("attendance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  groupId: varchar("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
  date: timestamp("date").notNull(),
  participants: jsonb("participants").notNull(), // array of {studentId: string, status: 'arrived' | 'late' | 'absent'}
  createdAt: timestamp("created_at").defaultNow(),
});

export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(), // in cents
  paymentDate: timestamp("payment_date").defaultNow(),
  classesAttended: integer("classes_attended").notNull().default(0),
  status: text("status").notNull().default("paid"), // "paid" or "unpaid"
  createdAt: timestamp("created_at").defaultNow(),
});

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  image: text("image"),
  quantity: integer("quantity").notNull().default(0),
  medalCost: jsonb("medal_cost").$type<{ gold: number; silver: number; bronze: number }>().notNull().default(sql`'{"gold": 0, "silver": 0, "bronze": 0}'`), // {gold: 0, silver: 0, bronze: 0}
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const purchases = pgTable("purchases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  productId: varchar("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  medalsPaid: jsonb("medals_paid").notNull(),
  purchaseDate: timestamp("purchase_date").defaultNow(),
});

// Medal awards table for proper tracking of individual medal awards
export const medalAwards = pgTable("medal_awards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  medalType: text("medal_type").notNull(), // "gold", "silver", or "bronze"
  amount: integer("amount").notNull().default(1),
  reason: text("reason"), // e.g., "attendance", "achievement", "purchase"
  relatedId: varchar("related_id"), // Reference to attendance, achievement, etc.
  awardedAt: timestamp("awarded_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  groupStudents: many(groupStudents),
  payments: many(payments),
  purchases: many(purchases),
}));

// Teachers are now users with role="teacher" - no separate relations needed

export const groupsRelations = relations(groups, ({ many }) => ({
  groupStudents: many(groupStudents),
  teacherGroups: many(teacherGroups),
  attendance: many(attendance),
}));

export const groupStudentsRelations = relations(groupStudents, ({ one }) => ({
  group: one(groups, {
    fields: [groupStudents.groupId],
    references: [groups.id],
  }),
  student: one(users, {
    fields: [groupStudents.studentId],
    references: [users.id],
  }),
}));

export const teacherGroupsRelations = relations(teacherGroups, ({ one }) => ({
  teacher: one(users, {
    fields: [teacherGroups.teacherId],
    references: [users.id],
  }),
  group: one(groups, {
    fields: [teacherGroups.groupId],
    references: [groups.id],
  }),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  group: one(groups, {
    fields: [attendance.groupId],
    references: [groups.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  student: one(users, {
    fields: [payments.studentId],
    references: [users.id],
  }),
}));

export const productsRelations = relations(products, ({ many }) => ({
  purchases: many(purchases),
}));

export const purchasesRelations = relations(purchases, ({ one }) => ({
  student: one(users, {
    fields: [purchases.studentId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [purchases.productId],
    references: [products.id],
  }),
}));

export const medalAwardsRelations = relations(medalAwards, ({ one }) => ({
  student: one(users, {
    fields: [medalAwards.studentId],
    references: [users.id],
  }),
}));

// Schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Teachers use the same schema as users with role="teacher"

export const insertGroupSchema = createInsertSchema(groups).omit({
  id: true,
  createdAt: true,
});

export const insertGroupStudentSchema = createInsertSchema(groupStudents).omit({
  id: true,
  joinedAt: true,
});

export const insertTeacherGroupSchema = createInsertSchema(teacherGroups).omit({
  id: true,
  assignedAt: true,
});

export const insertAttendanceSchema = createInsertSchema(attendance).omit({
  id: true,
  createdAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

export const insertPurchaseSchema = createInsertSchema(purchases).omit({
  id: true,
  purchaseDate: true,
});

export const insertMedalAwardSchema = createInsertSchema(medalAwards).omit({
  id: true,
  awardedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
// Teachers are users with role="teacher" - use User type with role filtering
export type Group = typeof groups.$inferSelect;
export type InsertGroup = z.infer<typeof insertGroupSchema>;
export type GroupStudent = typeof groupStudents.$inferSelect;
export type InsertGroupStudent = z.infer<typeof insertGroupStudentSchema>;
export type TeacherGroup = typeof teacherGroups.$inferSelect;
export type InsertTeacherGroup = z.infer<typeof insertTeacherGroupSchema>;
export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;
export type MedalAward = typeof medalAwards.$inferSelect;
export type InsertMedalAward = z.infer<typeof insertMedalAwardSchema>;
