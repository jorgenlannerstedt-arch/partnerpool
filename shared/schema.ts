import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, integer, boolean, timestamp, doublePrecision, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";

export const userRoleEnum = pgEnum("user_role", ["client", "agency"]);

export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().unique(),
  role: userRoleEnum("role").notNull().default("client"),
  onboardingComplete: boolean("onboarding_complete").default(false),
});

export const agencyProfiles = pgTable("agency_profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  address: text("address"),
  city: text("city"),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  phone: text("phone"),
  email: text("email"),
  website: text("website"),
  specialties: text("specialties").array(),
  employeeCount: integer("employee_count").default(1),
  logoUrl: text("logo_url"),
  subscriptionActive: boolean("subscription_active").default(false),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
});

export const cases = pgTable("cases", {
  id: serial("id").primaryKey(),
  clientId: varchar("client_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  aiSummary: text("ai_summary"),
  pdfFilename: text("pdf_filename"),
  status: text("status").notNull().default("open"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const caseInquiries = pgTable("case_inquiries", {
  id: serial("id").primaryKey(),
  caseId: integer("case_id").notNull(),
  agencyId: varchar("agency_id").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const directMessages = pgTable("direct_messages", {
  id: serial("id").primaryKey(),
  senderId: varchar("sender_id").notNull(),
  receiverId: varchar("receiver_id").notNull(),
  caseId: integer("case_id"),
  content: text("content").notNull(),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({ id: true });
export const insertAgencyProfileSchema = createInsertSchema(agencyProfiles).omit({ id: true });
export const insertCaseSchema = createInsertSchema(cases).omit({ id: true, createdAt: true });
export const insertCaseInquirySchema = createInsertSchema(caseInquiries).omit({ id: true, createdAt: true });
export const insertDirectMessageSchema = createInsertSchema(directMessages).omit({ id: true, createdAt: true });

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type AgencyProfile = typeof agencyProfiles.$inferSelect;
export type InsertAgencyProfile = z.infer<typeof insertAgencyProfileSchema>;
export type Case = typeof cases.$inferSelect;
export type InsertCase = z.infer<typeof insertCaseSchema>;
export type CaseInquiry = typeof caseInquiries.$inferSelect;
export type InsertCaseInquiry = z.infer<typeof insertCaseInquirySchema>;
export type DirectMessage = typeof directMessages.$inferSelect;
export type InsertDirectMessage = z.infer<typeof insertDirectMessageSchema>;
