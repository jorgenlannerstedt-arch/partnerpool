import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, integer, boolean, timestamp, doublePrecision, pgEnum, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";

export const userRoleEnum = pgEnum("user_role", ["client", "agency"]);

export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().unique(),
  role: userRoleEnum("role").notNull().default("client"),
  onboardingComplete: boolean("onboarding_complete").default(false),
  newsletterOptIn: boolean("newsletter_opt_in").default(false),
  phone: text("phone"),
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
  logoData: text("logo_data"),
  logoMimeType: text("logo_mime_type"),
  offices: jsonb("offices").$type<Array<{ city: string; address: string; latitude?: number; longitude?: number; notificationEmail?: string }>>(),
  foundedYear: integer("founded_year"),
  languages: text("languages").array(),
  priceRange: text("price_range"),
  barAssociationMember: boolean("bar_association_member").default(false),
  responseTimeHours: integer("response_time_hours"),
  minCaseAmount: integer("min_case_amount"),
  maxCaseAmount: integer("max_case_amount"),
  acceptedInsuranceTypes: text("accepted_insurance_types").array(),
  notificationEmail: text("notification_email"),
  subscriptionActive: boolean("subscription_active").default(false),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
});

export const agencyReviews = pgTable("agency_reviews", {
  id: serial("id").primaryKey(),
  agencyId: integer("agency_id").notNull(),
  clientId: varchar("client_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const INSURANCE_TYPES = [
  "Hemförsäkring",
  "Företagsförsäkring",
  "Ingen försäkring",
  "Klient betalar själv",
] as const;

export const AMOUNT_RANGES = [
  { value: "under-50k", label: "Under 50 000 SEK", numericMax: 50000 },
  { value: "50k-100k", label: "50 000 - 100 000 SEK", numericMin: 50000, numericMax: 100000 },
  { value: "100k-250k", label: "100 000 - 250 000 SEK", numericMin: 100000, numericMax: 250000 },
  { value: "250k-500k", label: "250 000 - 500 000 SEK", numericMin: 250000, numericMax: 500000 },
  { value: "500k-1m", label: "500 000 - 1 000 000 SEK", numericMin: 500000, numericMax: 1000000 },
  { value: "over-1m", label: "Över 1 000 000 SEK", numericMin: 1000000 },
  { value: "unknown", label: "Osäker / Vet ej" },
] as const;

export const cases = pgTable("cases", {
  id: serial("id").primaryKey(),
  clientId: varchar("client_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  aiSummary: text("ai_summary"),
  legalArea: text("legal_area"),
  insuranceType: text("insurance_type"),
  estimatedAmount: text("estimated_amount"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  pdfFilename: text("pdf_filename"),
  status: text("status").notNull().default("open"),
  legalProtectionApplied: boolean("legal_protection_applied"),
  legalProtectionGranted: text("legal_protection_granted"),
  needsLegalProtectionHelp: boolean("needs_legal_protection_help"),
  selectedAgencyId: integer("selected_agency_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const caseInquiries = pgTable("case_inquiries", {
  id: serial("id").primaryKey(),
  caseId: integer("case_id").notNull(),
  agencyId: varchar("agency_id").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("pending"),
  clientRead: boolean("client_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const dismissedCases = pgTable("dismissed_cases", {
  id: serial("id").primaryKey(),
  agencyUserId: varchar("agency_user_id").notNull(),
  caseId: integer("case_id").notNull(),
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

export const LEGAL_AREAS = [
  "Affärsjuridik",
  "Arbetsrätt",
  "Avtalsrätt",
  "Civilrätt",
  "Entreprenadrätt",
  "Familjerätt",
  "Fastighetsrätt",
  "Försäkringsrätt",
  "Förvaltningsrätt",
  "GDPR & Dataskydd",
  "Hyresrätt",
  "Immaterialrätt",
  "Konkursrätt",
  "Migrationsrätt",
  "Miljörätt",
  "Offentlig upphandling",
  "Personskaderätt",
  "Sjörätt",
  "Skadeståndsrätt",
  "Skatterätt",
  "Straffrätt",
  "Tvistemål",
] as const;

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({ id: true });
export const insertAgencyProfileSchema = createInsertSchema(agencyProfiles).omit({ id: true });
export const insertCaseSchema = createInsertSchema(cases).omit({ id: true, createdAt: true });
export const insertCaseInquirySchema = createInsertSchema(caseInquiries).omit({ id: true, createdAt: true });
export const insertDirectMessageSchema = createInsertSchema(directMessages).omit({ id: true, createdAt: true });
export const insertAgencyReviewSchema = createInsertSchema(agencyReviews).omit({ id: true, createdAt: true });

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
export type AgencyReview = typeof agencyReviews.$inferSelect;
export type InsertAgencyReview = z.infer<typeof insertAgencyReviewSchema>;

export const PRICE_RANGES = ["Budget-vänlig", "Medel", "Premium"] as const;
export const LANGUAGES = ["Svenska", "Engelska", "Arabiska", "Finska", "Persiska", "Tyska", "Franska", "Spanska", "Polska", "Ryska"] as const;
