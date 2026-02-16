import { users, type User, type UpsertUser } from "@shared/models/auth";
import { db } from "../../db";
import { eq } from "drizzle-orm";

// Interface for auth storage operations
// (IMPORTANT) These user operations are mandatory for Replit Auth.
export interface IAuthStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
}

class AuthStorage implements IAuthStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existing = await this.getUser(userData.id!);
    const updateData: Record<string, any> = { updatedAt: new Date() };

    if (userData.email) updateData.email = userData.email;
    if (userData.profileImageUrl) updateData.profileImageUrl = userData.profileImageUrl;

    if (userData.firstName && !userData.firstName.includes('\uFFFD')) {
      updateData.firstName = userData.firstName;
    }
    if (userData.lastName && !userData.lastName.includes('\uFFFD')) {
      updateData.lastName = userData.lastName;
    }

    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: existing ? updateData : { ...userData, updatedAt: new Date() },
      })
      .returning();
    return user;
  }
}

export const authStorage = new AuthStorage();
