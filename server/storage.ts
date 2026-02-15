import {
  type UserProfile, type InsertUserProfile,
  type AgencyProfile, type InsertAgencyProfile,
  type Case, type InsertCase,
  type CaseInquiry, type InsertCaseInquiry,
  type DirectMessage, type InsertDirectMessage,
  userProfiles, agencyProfiles, cases, caseInquiries, directMessages,
} from "@shared/schema";
import { users } from "@shared/models/auth";
import { db } from "./db";
import { eq, and, or, desc, sql, ne, inArray } from "drizzle-orm";

export interface IStorage {
  getProfile(userId: string): Promise<UserProfile | undefined>;
  createProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateProfile(userId: string, updates: Partial<InsertUserProfile>): Promise<UserProfile | undefined>;
  getAgencyProfile(userId: string): Promise<AgencyProfile | undefined>;
  getAgencyProfileById(id: number): Promise<AgencyProfile | undefined>;
  upsertAgencyProfile(data: InsertAgencyProfile): Promise<AgencyProfile>;
  getAllAgencies(): Promise<AgencyProfile[]>;
  getCasesByClient(clientId: string): Promise<Case[]>;
  getCaseById(id: number): Promise<Case | undefined>;
  createCase(data: InsertCase): Promise<Case>;
  updateCase(id: number, updates: Partial<InsertCase>): Promise<Case | undefined>;
  getOpenCases(): Promise<Case[]>;
  getOpenCasesForAgency(specialties: string[]): Promise<Case[]>;
  getInquiriesByCase(caseId: number): Promise<(CaseInquiry & { agency?: AgencyProfile })[]>;
  getInquiryByCaseAndAgency(caseId: number, agencyId: string): Promise<CaseInquiry | undefined>;
  createInquiry(data: InsertCaseInquiry): Promise<CaseInquiry>;
  getMessageThreads(userId: string): Promise<any[]>;
  getMessagesBetween(userId: string, partnerId: string): Promise<DirectMessage[]>;
  createMessage(data: InsertDirectMessage): Promise<DirectMessage>;
  getUnreadCount(userId: string): Promise<number>;
  markMessagesRead(userId: string, senderId: string): Promise<void>;
}

class DatabaseStorage implements IStorage {
  async getProfile(userId: string) {
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));
    return profile;
  }

  async createProfile(profile: InsertUserProfile) {
    const [created] = await db.insert(userProfiles).values(profile).returning();
    return created;
  }

  async updateProfile(userId: string, updates: Partial<InsertUserProfile>) {
    const [updated] = await db.update(userProfiles).set(updates).where(eq(userProfiles.userId, userId)).returning();
    return updated;
  }

  async getAgencyProfile(userId: string) {
    const [profile] = await db.select().from(agencyProfiles).where(eq(agencyProfiles.userId, userId));
    return profile;
  }

  async getAgencyProfileById(id: number) {
    const [profile] = await db.select().from(agencyProfiles).where(eq(agencyProfiles.id, id));
    return profile;
  }

  async upsertAgencyProfile(data: InsertAgencyProfile) {
    const [profile] = await db
      .insert(agencyProfiles)
      .values(data)
      .onConflictDoUpdate({
        target: agencyProfiles.userId,
        set: {
          name: data.name,
          description: data.description,
          address: data.address,
          city: data.city,
          latitude: data.latitude,
          longitude: data.longitude,
          phone: data.phone,
          email: data.email,
          website: data.website,
          specialties: data.specialties,
          employeeCount: data.employeeCount,
          logoUrl: data.logoUrl,
          offices: data.offices,
        },
      })
      .returning();
    return profile;
  }

  async getAllAgencies() {
    return db.select().from(agencyProfiles);
  }

  async getCasesByClient(clientId: string) {
    return db.select().from(cases).where(eq(cases.clientId, clientId)).orderBy(desc(cases.createdAt));
  }

  async getCaseById(id: number) {
    const [c] = await db.select().from(cases).where(eq(cases.id, id));
    return c;
  }

  async createCase(data: InsertCase) {
    const [c] = await db.insert(cases).values(data).returning();
    return c;
  }

  async updateCase(id: number, updates: Partial<InsertCase>) {
    const [c] = await db.update(cases).set(updates).where(eq(cases.id, id)).returning();
    return c;
  }

  async getOpenCases() {
    return db.select().from(cases).where(eq(cases.status, "open")).orderBy(desc(cases.createdAt));
  }

  async getOpenCasesForAgency(specialties: string[]) {
    if (!specialties || specialties.length === 0) {
      return [];
    }
    const allOpen = await db.select().from(cases).where(eq(cases.status, "open")).orderBy(desc(cases.createdAt));
    return allOpen.filter((c) => {
      if (!c.legalArea) return false;
      return specialties.some((s) => s.toLowerCase() === c.legalArea!.toLowerCase());
    });
  }

  async getInquiriesByCase(caseId: number) {
    const inquiries = await db.select().from(caseInquiries).where(eq(caseInquiries.caseId, caseId)).orderBy(desc(caseInquiries.createdAt));
    const result = [];
    for (const inq of inquiries) {
      const agency = await this.getAgencyProfile(inq.agencyId);
      result.push({ ...inq, agency: agency || undefined });
    }
    return result;
  }

  async getInquiryByCaseAndAgency(caseId: number, agencyId: string) {
    const [inq] = await db.select().from(caseInquiries).where(
      and(eq(caseInquiries.caseId, caseId), eq(caseInquiries.agencyId, agencyId))
    );
    return inq;
  }

  async createInquiry(data: InsertCaseInquiry) {
    const [inq] = await db.insert(caseInquiries).values(data).returning();
    return inq;
  }

  async getMessageThreads(userId: string) {
    const allMessages = await db.select().from(directMessages)
      .where(or(eq(directMessages.senderId, userId), eq(directMessages.receiverId, userId)))
      .orderBy(desc(directMessages.createdAt));

    const threadsMap = new Map<string, any>();
    for (const msg of allMessages) {
      const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      if (!threadsMap.has(partnerId)) {
        const [partnerUser] = await db.select().from(users).where(eq(users.id, partnerId));
        const partnerAgency = await this.getAgencyProfile(partnerId);

        const unreadMessages = allMessages.filter(
          (m) => m.senderId === partnerId && m.receiverId === userId && !m.read
        );

        threadsMap.set(partnerId, {
          partnerId,
          partnerName: partnerAgency?.name || `${partnerUser?.firstName || ""} ${partnerUser?.lastName || ""}`.trim() || "User",
          lastMessage: msg.content,
          lastMessageTime: msg.createdAt,
          unreadCount: unreadMessages.length,
        });
      }
    }
    return Array.from(threadsMap.values());
  }

  async getMessagesBetween(userId: string, partnerId: string) {
    const msgs = await db.select().from(directMessages)
      .where(
        or(
          and(eq(directMessages.senderId, userId), eq(directMessages.receiverId, partnerId)),
          and(eq(directMessages.senderId, partnerId), eq(directMessages.receiverId, userId))
        )
      )
      .orderBy(directMessages.createdAt);

    await db.update(directMessages)
      .set({ read: true })
      .where(
        and(eq(directMessages.senderId, partnerId), eq(directMessages.receiverId, userId), eq(directMessages.read, false))
      );

    return msgs;
  }

  async createMessage(data: InsertDirectMessage) {
    const [msg] = await db.insert(directMessages).values(data).returning();
    return msg;
  }

  async getUnreadCount(userId: string) {
    const [result] = await db.select({ count: sql<number>`count(*)::int` })
      .from(directMessages)
      .where(and(eq(directMessages.receiverId, userId), eq(directMessages.read, false)));
    return result?.count || 0;
  }

  async markMessagesRead(userId: string, senderId: string) {
    await db.update(directMessages)
      .set({ read: true })
      .where(
        and(eq(directMessages.senderId, senderId), eq(directMessages.receiverId, userId))
      );
  }
}

export const storage = new DatabaseStorage();
