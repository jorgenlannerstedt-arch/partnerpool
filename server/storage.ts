import {
  type UserProfile, type InsertUserProfile,
  type AgencyProfile, type InsertAgencyProfile,
  type Case, type InsertCase,
  type CaseInquiry, type InsertCaseInquiry,
  type DirectMessage, type InsertDirectMessage,
  type AgencyReview, type InsertAgencyReview,
  userProfiles, agencyProfiles, cases, caseInquiries, directMessages, agencyReviews, dismissedCases,
  AMOUNT_RANGES,
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
  deleteCase(id: number, clientId: string): Promise<boolean>;
  getOpenCases(): Promise<Case[]>;
  getOpenCasesForAgency(agencyProfile: AgencyProfile): Promise<Case[]>;
  getInquiriesByCase(caseId: number): Promise<(CaseInquiry & { agency?: AgencyProfile })[]>;
  getInquiryByCaseAndAgency(caseId: number, agencyId: string): Promise<CaseInquiry | undefined>;
  getInquiriesByAgency(agencyId: string): Promise<CaseInquiry[]>;
  createInquiry(data: InsertCaseInquiry): Promise<CaseInquiry>;
  markInquiriesRead(ids: number[]): Promise<void>;
  getUnreadInquiryCount(clientId: string): Promise<number>;
  getMessageThreads(userId: string): Promise<any[]>;
  getMessagesBetween(userId: string, partnerId: string): Promise<DirectMessage[]>;
  createMessage(data: InsertDirectMessage): Promise<DirectMessage>;
  getUnreadCount(userId: string): Promise<number>;
  markMessagesRead(userId: string, senderId: string): Promise<void>;
  getReviewsByAgency(agencyId: number): Promise<AgencyReview[]>;
  getReviewByClientAndAgency(clientId: string, agencyId: number): Promise<AgencyReview | undefined>;
  createReview(data: InsertAgencyReview): Promise<AgencyReview>;
  getAgencyStats(agencyId: number): Promise<{ avgRating: number; reviewCount: number; caseCount: number; selectedCount: number; avgResponseHours: number | null }>;
  dismissCase(agencyUserId: string, caseId: number): Promise<void>;
  getDismissedCaseIds(agencyUserId: string): Promise<number[]>;
  deleteAccount(userId: string): Promise<void>;
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
          foundedYear: data.foundedYear,
          languages: data.languages,
          priceRange: data.priceRange,
          barAssociationMember: data.barAssociationMember,
          responseTimeHours: data.responseTimeHours,
          minCaseAmount: data.minCaseAmount,
          maxCaseAmount: data.maxCaseAmount,
          acceptedInsuranceTypes: data.acceptedInsuranceTypes,
          notificationEmail: data.notificationEmail,
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

  async deleteCase(id: number, clientId: string) {
    await db.delete(caseInquiries).where(eq(caseInquiries.caseId, id));
    await db.delete(directMessages).where(eq(directMessages.caseId, id));
    const result = await db.delete(cases).where(and(eq(cases.id, id), eq(cases.clientId, clientId))).returning();
    return result.length > 0;
  }

  async getOpenCases() {
    return db.select().from(cases).where(eq(cases.status, "open")).orderBy(desc(cases.createdAt));
  }

  async getOpenCasesForAgency(agencyProfile: AgencyProfile) {
    const specialties = agencyProfile.specialties;
    if (!specialties || specialties.length === 0) {
      return [];
    }
    const dismissedIds = await this.getDismissedCaseIds(agencyProfile.userId);
    const allOpen = await db.select().from(cases).where(eq(cases.status, "open")).orderBy(desc(cases.createdAt));
    return allOpen.filter((c) => {
      if (dismissedIds.includes(c.id)) return false;
      if (!c.legalArea) return false;
      if (!specialties.some((s) => s.toLowerCase() === c.legalArea!.toLowerCase())) {
        return false;
      }
      if (agencyProfile.acceptedInsuranceTypes && agencyProfile.acceptedInsuranceTypes.length > 0) {
        if (c.insuranceType && !agencyProfile.acceptedInsuranceTypes.includes(c.insuranceType)) {
          return false;
        }
      }
      if (agencyProfile.minCaseAmount != null || agencyProfile.maxCaseAmount != null) {
        if (c.estimatedAmount && c.estimatedAmount !== "unknown") {
          const range = AMOUNT_RANGES.find((r) => r.value === c.estimatedAmount);
          if (range) {
            const caseMin = "numericMin" in range ? (range as any).numericMin : 0;
            const caseMax = "numericMax" in range ? (range as any).numericMax : Infinity;
            if (agencyProfile.minCaseAmount != null && caseMax < agencyProfile.minCaseAmount) {
              return false;
            }
            if (agencyProfile.maxCaseAmount != null && caseMin > agencyProfile.maxCaseAmount) {
              return false;
            }
          }
        }
      }
      return true;
    });
  }

  async getWonCasesForAgency(agencyProfile: AgencyProfile) {
    return db.select().from(cases).where(
      and(eq(cases.status, "closed"), eq(cases.selectedAgencyId, agencyProfile.id))
    ).orderBy(desc(cases.createdAt));
  }

  async getLostCasesForAgency(agencyProfile: AgencyProfile) {
    const agencyInquiries = await this.getInquiriesByAgency(agencyProfile.userId);
    const inquiredCaseIds = agencyInquiries.map(i => i.caseId);
    if (inquiredCaseIds.length === 0) return [];
    const closedCases = await db.select().from(cases).where(
      and(eq(cases.status, "closed"), inArray(cases.id, inquiredCaseIds))
    ).orderBy(desc(cases.createdAt));
    return closedCases.filter(c => c.selectedAgencyId !== agencyProfile.id);
  }

  async getInquiriesByCase(caseId: number, clientId?: string) {
    const inquiries = await db.select().from(caseInquiries).where(eq(caseInquiries.caseId, caseId)).orderBy(desc(caseInquiries.createdAt));
    const result = [];
    for (const inq of inquiries) {
      const agency = await this.getAgencyProfile(inq.agencyId);
      let messageCount = 0;
      if (clientId) {
        const [countResult] = await db.select({ count: sql<number>`count(*)::int` })
          .from(directMessages)
          .where(
            or(
              and(eq(directMessages.senderId, clientId), eq(directMessages.receiverId, inq.agencyId)),
              and(eq(directMessages.senderId, inq.agencyId), eq(directMessages.receiverId, clientId))
            )
          );
        messageCount = countResult?.count || 0;
      }
      result.push({ ...inq, agency: agency || undefined, messageCount });
    }
    return result;
  }

  async getInquiryByCaseAndAgency(caseId: number, agencyId: string) {
    const [inq] = await db.select().from(caseInquiries).where(
      and(eq(caseInquiries.caseId, caseId), eq(caseInquiries.agencyId, agencyId))
    );
    return inq;
  }

  async getInquiriesByAgency(agencyId: string) {
    return db.select().from(caseInquiries).where(eq(caseInquiries.agencyId, agencyId));
  }

  async createInquiry(data: InsertCaseInquiry) {
    const [inq] = await db.insert(caseInquiries).values(data).returning();
    return inq;
  }

  async markInquiriesRead(ids: number[]) {
    await db.update(caseInquiries)
      .set({ clientRead: true })
      .where(inArray(caseInquiries.id, ids));
  }

  async getUnreadInquiryCount(clientId: string) {
    const clientCases = await db.select({ id: cases.id }).from(cases).where(eq(cases.clientId, clientId));
    if (clientCases.length === 0) return 0;
    const caseIds = clientCases.map(c => c.id);
    const [result] = await db.select({ count: sql<number>`count(*)::int` })
      .from(caseInquiries)
      .where(and(inArray(caseInquiries.caseId, caseIds), eq(caseInquiries.clientRead, false)));
    return result?.count || 0;
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

        const relatedCases: { id: number; title: string }[] = [];
        if (partnerAgency) {
          const agencyInquiries = await db.select({ caseId: caseInquiries.caseId })
            .from(caseInquiries)
            .where(eq(caseInquiries.agencyId, partnerId));
          if (agencyInquiries.length > 0) {
            const caseIds = agencyInquiries.map(i => i.caseId);
            const relCases = await db.select({ id: cases.id, title: cases.title })
              .from(cases)
              .where(and(inArray(cases.id, caseIds), eq(cases.clientId, userId)));
            relatedCases.push(...relCases);
          }
        } else {
          const userInquiries = await db.select({ caseId: caseInquiries.caseId, agencyId: caseInquiries.agencyId })
            .from(caseInquiries)
            .where(eq(caseInquiries.agencyId, userId));
          if (userInquiries.length > 0) {
            const caseIds = userInquiries.map(i => i.caseId);
            const relCases = await db.select({ id: cases.id, title: cases.title })
              .from(cases)
              .where(and(inArray(cases.id, caseIds), eq(cases.clientId, partnerId)));
            relatedCases.push(...relCases);
          }
        }

        threadsMap.set(partnerId, {
          partnerId,
          partnerName: partnerAgency?.name || `${partnerUser?.firstName || ""} ${partnerUser?.lastName || ""}`.trim() || "User",
          partnerLogoUrl: partnerAgency?.logoUrl || null,
          relatedCases,
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

  async getReviewsByAgency(agencyId: number) {
    return db.select().from(agencyReviews).where(eq(agencyReviews.agencyId, agencyId)).orderBy(desc(agencyReviews.createdAt));
  }

  async getReviewByClientAndAgency(clientId: string, agencyId: number) {
    const [review] = await db.select().from(agencyReviews).where(
      and(eq(agencyReviews.clientId, clientId), eq(agencyReviews.agencyId, agencyId))
    );
    return review;
  }

  async createReview(data: InsertAgencyReview) {
    const [review] = await db.insert(agencyReviews).values(data).returning();
    return review;
  }

  async getAgencyStats(agencyId: number) {
    const agency = await this.getAgencyProfileById(agencyId);
    if (!agency) return { avgRating: 0, reviewCount: 0, caseCount: 0, selectedCount: 0, avgResponseHours: null };

    const reviews = await this.getReviewsByAgency(agencyId);
    const reviewCount = reviews.length;
    const avgRating = reviewCount > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount : 0;

    const [inquiryCount] = await db.select({ count: sql<number>`count(*)::int` })
      .from(caseInquiries)
      .where(eq(caseInquiries.agencyId, agency.userId));

    const [selectedCountResult] = await db.select({ count: sql<number>`count(*)::int` })
      .from(cases)
      .where(eq(cases.selectedAgencyId, agencyId));

    const [avgResponseResult] = await db.select({
      avgHours: sql<number>`avg(extract(epoch from (${caseInquiries.createdAt} - ${cases.createdAt})) / 3600)::float`
    })
      .from(caseInquiries)
      .innerJoin(cases, eq(caseInquiries.caseId, cases.id))
      .where(eq(caseInquiries.agencyId, agency.userId));

    const avgResponseHours = avgResponseResult?.avgHours != null
      ? Math.round(avgResponseResult.avgHours * 10) / 10
      : null;

    return { avgRating: Math.round(avgRating * 10) / 10, reviewCount, caseCount: inquiryCount?.count || 0, selectedCount: selectedCountResult?.count || 0, avgResponseHours };
  }

  async dismissCase(agencyUserId: string, caseId: number) {
    const existing = await db.select().from(dismissedCases).where(
      and(eq(dismissedCases.agencyUserId, agencyUserId), eq(dismissedCases.caseId, caseId))
    );
    if (existing.length === 0) {
      await db.insert(dismissedCases).values({ agencyUserId, caseId });
    }
  }

  async getDismissedCaseIds(agencyUserId: string) {
    const rows = await db.select({ caseId: dismissedCases.caseId }).from(dismissedCases).where(eq(dismissedCases.agencyUserId, agencyUserId));
    return rows.map(r => r.caseId);
  }

  async deleteAccount(userId: string) {
    await db.delete(dismissedCases).where(eq(dismissedCases.agencyUserId, userId));
    await db.delete(directMessages).where(or(eq(directMessages.senderId, userId), eq(directMessages.receiverId, userId)));
    await db.delete(caseInquiries).where(eq(caseInquiries.agencyId, userId));
    const userCases = await db.select({ id: cases.id }).from(cases).where(eq(cases.clientId, userId));
    for (const c of userCases) {
      await db.delete(caseInquiries).where(eq(caseInquiries.caseId, c.id));
    }
    await db.delete(cases).where(eq(cases.clientId, userId));
    await db.delete(agencyReviews).where(eq(agencyReviews.clientId, userId));
    const agencyProfile = await this.getAgencyProfile(userId);
    if (agencyProfile) {
      await db.delete(agencyReviews).where(eq(agencyReviews.agencyId, agencyProfile.id));
    }
    await db.delete(agencyProfiles).where(eq(agencyProfiles.userId, userId));
    await db.delete(userProfiles).where(eq(userProfiles.userId, userId));
    await db.delete(users).where(eq(users.id, userId));
  }
}

export const storage = new DatabaseStorage();
