import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { z } from "zod";
import { storage } from "./storage";
import { LEGAL_AREAS, INSURANCE_TYPES, AMOUNT_RANGES } from "@shared/schema";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import Anthropic from "@anthropic-ai/sdk";
import { sendInquiryNotification, sendNewCaseNotification, sendAgencySelectedNotification, sendAgencyNotSelectedNotification, sendSelectionRevertedNotification } from "./email";
import { seedDemoData } from "./seed";

const anthropic = new Anthropic({
  apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
});

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const logoDir = path.join(process.cwd(), "uploads", "logos");
if (!fs.existsSync(logoDir)) {
  fs.mkdirSync(logoDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDF files are allowed"));
  },
});

const logoUpload = multer({
  dest: logoDir,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

function requireRole(role: "client" | "agency") {
  return async (req: any, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getProfile(userId);
      if (!profile || profile.role !== role) {
        return res.status(403).json({ message: "Access denied" });
      }
      req.userProfile = profile;
      next();
    } catch {
      res.status(500).json({ message: "Authorization error" });
    }
  };
}

const roleSchema = z.object({
  role: z.enum(["client", "agency"]),
  agencyEmail: z.string().email().optional(),
});

const BLOCKED_EMAIL_DOMAINS = [
  "gmail.com", "googlemail.com",
  "hotmail.com", "hotmail.se", "hotmail.co.uk",
  "outlook.com", "outlook.se",
  "live.com", "live.se",
  "msn.com",
  "yahoo.com", "yahoo.se", "yahoo.co.uk",
  "ymail.com",
  "aol.com",
  "icloud.com", "me.com", "mac.com",
  "protonmail.com", "proton.me",
  "mail.com",
  "zoho.com",
  "gmx.com", "gmx.se",
  "tutanota.com", "tuta.io",
  "fastmail.com",
  "hey.com",
  "pm.me",
  "mailbox.org",
];

function isBusinessEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;
  return !BLOCKED_EMAIL_DOMAINS.includes(domain);
}

const messageSchema = z.object({
  receiverId: z.string().min(1),
  content: z.string().min(1).max(5000),
  caseId: z.number().nullable().optional(),
});

const inquirySchema = z.object({
  message: z.string().min(1).max(5000),
});

const officeSchema = z.object({
  city: z.string().min(1),
  address: z.string().optional().default(""),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  notificationEmail: z.string().email().nullable().optional().or(z.literal("")),
});

const agencyProfileSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).nullable().optional(),
  address: z.string().max(500).nullable().optional(),
  city: z.string().max(100).nullable().optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  phone: z.string().max(50).nullable().optional(),
  email: z.string().email().nullable().optional().or(z.literal("")),
  website: z.string().max(500).nullable().optional(),
  specialties: z.array(z.string()).nullable().optional(),
  employeeCount: z.number().int().min(1).max(100000).optional(),
  offices: z.array(officeSchema).nullable().optional(),
  logoUrl: z.string().nullable().optional(),
  foundedYear: z.number().int().min(1800).max(2030).nullable().optional(),
  languages: z.array(z.string()).nullable().optional(),
  priceRange: z.string().nullable().optional(),
  barAssociationMember: z.boolean().optional(),
  responseTimeHours: z.number().int().min(1).max(168).nullable().optional(),
  minCaseAmount: z.number().int().min(0).nullable().optional(),
  maxCaseAmount: z.number().int().min(0).nullable().optional(),
  acceptedInsuranceTypes: z.array(z.string()).nullable().optional(),
  notificationEmail: z.string().email().nullable().optional().or(z.literal("")),
});

const reviewSchema = z.object({
  agencyId: z.number().int(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).nullable().optional(),
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);

  seedDemoData().catch((err) => console.error("Auto-seed error:", err));

  app.get("/api/demo-login", async (req: any, res) => {
    try {
      const demoUserId = "demo_client_user";
      const { authStorage } = await import("./replit_integrations/auth/storage");
      const existingUser = await authStorage.getUser(demoUserId);
      if (!existingUser) {
        await authStorage.upsertUser({
          id: demoUserId,
          email: "demo@vertigogo.se",
          firstName: "Demo",
          lastName: "Användare",
          profileImageUrl: null,
        });
        await storage.createProfile({ userId: demoUserId, role: "client" });
      }
      const sessionUser = {
        claims: {
          sub: demoUserId,
          email: "demo@vertigogo.se",
          first_name: "Demo",
          last_name: "Användare",
        },
        expires_at: Math.floor(Date.now() / 1000) + 86400,
      };
      req.login(sessionUser, (err: any) => {
        if (err) {
          console.error("Demo login error:", err);
          return res.status(500).json({ message: "Demo login failed" });
        }
        res.redirect("/");
      });
    } catch (error) {
      console.error("Demo login error:", error);
      res.status(500).json({ message: "Demo login failed" });
    }
  });

  app.use("/uploads/logos", (req, res, next) => {
    const filePath = path.join(logoDir, path.basename(req.url));
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).send("Not found");
    }
  });

  app.get("/api/config/maps", (_req, res) => {
    res.json({ apiKey: process.env.GOOGLE_MAPS_API_KEY || "" });
  });

  app.get("/api/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getProfile(userId);
      res.json(profile || null);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.post("/api/profile/role", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const parsed = roleSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid role" });
      }
      const { role, agencyEmail } = parsed.data;

      if (role === "agency") {
        if (!agencyEmail) {
          return res.status(400).json({ message: "Företagets e-postadress krävs för byråregistrering." });
        }
        if (!isBusinessEmail(agencyEmail)) {
          return res.status(400).json({ message: "Vi accepterar bara företagsmailadresser (inte Gmail, Hotmail etc.)." });
        }
      }

      let profile = await storage.getProfile(userId);
      if (profile) {
        if (profile.onboardingComplete) {
          return res.status(400).json({ message: "Role already set" });
        }
        profile = await storage.updateProfile(userId, { role, onboardingComplete: true })!;
      } else {
        profile = await storage.createProfile({ userId, role, onboardingComplete: true });
      }

      res.json(profile);
    } catch (error) {
      console.error("Error setting role:", error);
      res.status(500).json({ message: "Failed to set role" });
    }
  });

  app.post("/api/profile/reset-role", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.updateProfile(userId, { onboardingComplete: false });
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      res.json({ message: "Role reset. You can now choose a new role." });
    } catch (error) {
      console.error("Error resetting role:", error);
      res.status(500).json({ message: "Failed to reset role" });
    }
  });

  app.get("/api/agencies", async (_req, res) => {
    try {
      const agencies = await storage.getAllAgencies();
      res.json(agencies);
    } catch (error) {
      console.error("Error fetching agencies:", error);
      res.status(500).json({ message: "Failed to fetch agencies" });
    }
  });

  app.get("/api/agencies/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
      const agency = await storage.getAgencyProfileById(id);
      if (!agency) return res.status(404).json({ message: "Agency not found" });
      res.json(agency);
    } catch (error) {
      console.error("Error fetching agency:", error);
      res.status(500).json({ message: "Failed to fetch agency" });
    }
  });

  app.get("/api/agency/profile", isAuthenticated, requireRole("agency"), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getAgencyProfile(userId);
      res.json(profile || null);
    } catch (error) {
      console.error("Error fetching agency profile:", error);
      res.status(500).json({ message: "Failed to fetch agency profile" });
    }
  });

  app.post("/api/agency/profile", isAuthenticated, requireRole("agency"), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const parsed = agencyProfileSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid profile data", errors: parsed.error.flatten() });
      }
      const data = { ...parsed.data, userId };
      const profile = await storage.upsertAgencyProfile(data as any);

      let userProfile = await storage.getProfile(userId);
      if (userProfile && !userProfile.onboardingComplete) {
        await storage.updateProfile(userId, { onboardingComplete: true });
      }

      res.json(profile);
    } catch (error) {
      console.error("Error saving agency profile:", error);
      res.status(500).json({ message: "Failed to save agency profile" });
    }
  });

  app.post("/api/agency/logo", isAuthenticated, requireRole("agency"), logoUpload.single("logo"), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const ext = path.extname(req.file.originalname) || ".png";
      const newFilename = `${req.file.filename}${ext}`;
      const newPath = path.join(logoDir, newFilename);
      fs.renameSync(req.file.path, newPath);

      const logoUrl = `/uploads/logos/${newFilename}`;
      res.json({ logoUrl });
    } catch (error) {
      console.error("Error uploading logo:", error);
      res.status(500).json({ message: "Failed to upload logo" });
    }
  });

  app.get("/api/cases", isAuthenticated, requireRole("client"), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const clientCases = await storage.getCasesByClient(userId);
      res.json(clientCases);
    } catch (error) {
      console.error("Error fetching cases:", error);
      res.status(500).json({ message: "Failed to fetch cases" });
    }
  });

  app.get("/api/cases/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
      const c = await storage.getCaseById(id);
      if (!c) return res.status(404).json({ message: "Case not found" });

      const userId = req.user.claims.sub;
      const profile = await storage.getProfile(userId);
      if (profile?.role === "client" && c.clientId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(c);
    } catch (error) {
      console.error("Error fetching case:", error);
      res.status(500).json({ message: "Failed to fetch case" });
    }
  });

  app.get("/api/cases/:id/inquiries", isAuthenticated, async (req: any, res) => {
    try {
      const caseId = parseInt(req.params.id);
      if (isNaN(caseId)) return res.status(400).json({ message: "Invalid ID" });

      const c = await storage.getCaseById(caseId);
      if (!c) return res.status(404).json({ message: "Case not found" });

      const userId = req.user.claims.sub;
      if (c.clientId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const inquiries = await storage.getInquiriesByCase(caseId, userId);
      res.json(inquiries);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      res.status(500).json({ message: "Failed to fetch inquiries" });
    }
  });

  app.post("/api/cases", isAuthenticated, requireRole("client"), upload.single("pdf"), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const title = req.body.title?.trim();
      const description = req.body.description?.trim() || null;
      const rawInsuranceType = req.body.insuranceType?.trim() || null;
      const insuranceType = rawInsuranceType && (INSURANCE_TYPES as readonly string[]).includes(rawInsuranceType) ? rawInsuranceType : null;
      const estimatedAmount = req.body.estimatedAmount?.trim() || null;
      const contactEmail = req.body.contactEmail?.trim() || null;
      const contactPhone = req.body.contactPhone?.trim() || null;
      const legalProtectionApplied = req.body.legalProtectionApplied === "yes" ? true : req.body.legalProtectionApplied === "no" ? false : null;
      const legalProtectionGranted = legalProtectionApplied === true && ["yes", "no", "pending"].includes(req.body.legalProtectionGranted) ? req.body.legalProtectionGranted : null;
      const needsLegalProtectionHelp = legalProtectionApplied === false && req.body.needsLegalProtectionHelp === "yes" ? true : legalProtectionApplied === false && req.body.needsLegalProtectionHelp === "no" ? false : null;

      if (!title || title.length > 200) {
        return res.status(400).json({ message: "Title is required and must be under 200 characters" });
      }

      let aiSummary = null;
      let pdfFilename = null;
      let legalArea = null;

      if (req.file) {
        pdfFilename = req.file.filename;

        try {
          const { PDFParse } = await import("pdf-parse");
          const pdfBuffer = fs.readFileSync(req.file.path);
          const uint8 = new Uint8Array(pdfBuffer);
          const parser = new PDFParse(uint8);
          await parser.load();
          const result = await parser.getText();
          const pdfText = (result.text || "").slice(0, 8000);

          const legalAreasList = LEGAL_AREAS.join(", ");

          const message = await anthropic.messages.create({
            model: "claude-sonnet-4-5",
            max_tokens: 1500,
            system: `Du är en juridisk dokumentanalytiker för Vertigogo, en juridisk tjänsteplattform.
Din uppgift är att:
1. Läsa den tillhandahållna dokumenttexten
2. ANONYMISERA all personlig information (namn, adresser, telefonnummer, e-postadresser, personnummer, bankuppgifter)
3. Skapa en professionell, anonymiserad ärendesammanfattning som advokatbyråer kan granska
4. Klassificera ärendet i EXAKT ETT rättsområde

Sammanfattningen ska innehålla:
- Typ av juridiskt ärende
- Viktiga fakta i ärendet (utan personliga identifierare)
- Relevanta rättsområden
- Vilken typ av juridisk hjälp som behövs

Ersätt personlig information med generiska termer som [Klient], [Motpart], [Adress], etc.

Du MÅSTE svara i följande JSON-format (inget annat):
{
  "summary": "Den anonymiserade ärendesammanfattningen på svenska (200-400 ord)",
  "legalArea": "Exakt ett av följande rättsområden: ${legalAreasList}"
}

VIKTIGT: 
- Resultatet FÅR INTE innehålla några riktiga namn, adresser, telefonnummer, e-postadresser eller personnummer från originaldokumentet.
- legalArea MÅSTE vara exakt ett av de angivna alternativen.
- Svara ENBART med JSON, ingen annan text.`,
            messages: [
              {
                role: "user",
                content: `Vänligen analysera detta juridiska dokument och skapa en fullständigt anonymiserad ärendesammanfattning:\n\n${pdfText}`,
              },
            ],
          });

          const textContent = message.content[0];
          if (textContent.type === "text") {
            let rawText = textContent.text.trim();
            const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (jsonMatch) {
              rawText = jsonMatch[1].trim();
            }
            try {
              const parsed = JSON.parse(rawText);
              aiSummary = parsed.summary || rawText;
              if (parsed.legalArea && LEGAL_AREAS.includes(parsed.legalArea)) {
                legalArea = parsed.legalArea;
              }
            } catch {
              const summaryMatch = rawText.match(/"summary"\s*:\s*"([\s\S]*?)(?:"\s*[,}])/);
              if (summaryMatch) {
                aiSummary = summaryMatch[1];
              } else {
                aiSummary = textContent.text.replace(/```(?:json)?/g, "").replace(/```/g, "").replace(/"legalArea"\s*:\s*"[^"]*"/g, "").replace(/"summary"\s*:\s*/g, "").replace(/[{}]/g, "").trim();
              }
              const areaMatch = rawText.match(/"legalArea"\s*:\s*"([^"]*)"/);
              if (areaMatch && LEGAL_AREAS.includes(areaMatch[1])) {
                legalArea = areaMatch[1];
              }
            }
          }

          fs.unlinkSync(req.file.path);
          pdfFilename = null;
        } catch (aiError) {
          console.error("AI analysis error:", aiError);
          aiSummary = "Ärendesammanfattningen genereras. Vänligen kontrollera igen om en stund.";
          if (req.file?.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
          }
        }
      }

      const newCase = await storage.createCase({
        clientId: userId,
        title,
        description,
        aiSummary,
        legalArea,
        insuranceType,
        estimatedAmount,
        contactEmail,
        contactPhone,
        pdfFilename,
        legalProtectionApplied,
        legalProtectionGranted,
        needsLegalProtectionHelp,
        status: "draft",
      });

      res.status(201).json(newCase);
    } catch (error) {
      console.error("Error creating case:", error);
      res.status(500).json({ message: "Failed to create case" });
    }
  });

  app.patch("/api/cases/:id", isAuthenticated, requireRole("client"), async (req: any, res) => {
    try {
      const caseId = parseInt(req.params.id);
      if (isNaN(caseId)) return res.status(400).json({ message: "Invalid ID" });
      const userId = req.user.claims.sub;

      const caseData = await storage.getCaseById(caseId);
      if (!caseData || caseData.clientId !== userId) {
        return res.status(404).json({ message: "Case not found" });
      }

      const updates: Record<string, any> = {};
      if (req.body.description !== undefined) {
        updates.description = req.body.description?.trim() || null;
      }
      if (req.body.aiSummary !== undefined) {
        updates.aiSummary = req.body.aiSummary?.trim() || null;
      }
      if (req.body.status === "open" && caseData.status === "draft") {
        updates.status = "open";
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: "No valid updates provided" });
      }

      const updated = await storage.updateCase(caseId, updates);

      if (updates.status === "open" && updated && updated.legalArea) {
        const allAgencies = await storage.getAllAgencies();
        for (const agency of allAgencies) {
          if (!agency.subscriptionActive) continue;
          if (!agency.specialties?.some((s) => s.toLowerCase() === updated.legalArea!.toLowerCase())) continue;

          if (agency.acceptedInsuranceTypes && agency.acceptedInsuranceTypes.length > 0) {
            if (updated.insuranceType && !agency.acceptedInsuranceTypes.includes(updated.insuranceType)) continue;
          }

          if (agency.minCaseAmount != null || agency.maxCaseAmount != null) {
            if (updated.estimatedAmount && updated.estimatedAmount !== "unknown") {
              const range = AMOUNT_RANGES.find((r: any) => r.value === updated.estimatedAmount);
              if (range) {
                const caseMin = "numericMin" in range ? (range as any).numericMin : 0;
                const caseMax = "numericMax" in range ? (range as any).numericMax : Infinity;
                if (agency.minCaseAmount != null && caseMax < agency.minCaseAmount) continue;
                if (agency.maxCaseAmount != null && caseMin > agency.maxCaseAmount) continue;
              }
            }
          }

          const emails: string[] = [];
          if (agency.notificationEmail) {
            emails.push(agency.notificationEmail);
          }
          if (agency.offices) {
            for (const office of agency.offices as Array<{ notificationEmail?: string }>) {
              if (office.notificationEmail && !emails.includes(office.notificationEmail)) {
                emails.push(office.notificationEmail);
              }
            }
          }
          for (const email of emails) {
            sendNewCaseNotification(email, updated.title, updated.legalArea!)
              .catch(err => console.error("Agency notification failed:", err));
          }
        }
      }

      res.json(updated);
    } catch (error) {
      console.error("Error updating case:", error);
      res.status(500).json({ message: "Failed to update case" });
    }
  });

  app.delete("/api/cases/:id", isAuthenticated, requireRole("client"), async (req: any, res) => {
    try {
      const caseId = parseInt(req.params.id);
      if (isNaN(caseId)) return res.status(400).json({ message: "Invalid ID" });
      const userId = req.user.claims.sub;

      const deleted = await storage.deleteCase(caseId, userId);
      if (!deleted) {
        return res.status(404).json({ message: "Case not found or not authorized" });
      }
      res.json({ message: "Case deleted" });
    } catch (error) {
      console.error("Error deleting case:", error);
      res.status(500).json({ message: "Failed to delete case" });
    }
  });

  app.post("/api/cases/:id/select-agency", isAuthenticated, requireRole("client"), async (req: any, res) => {
    try {
      const caseId = parseInt(req.params.id);
      if (isNaN(caseId)) return res.status(400).json({ message: "Invalid ID" });
      const userId = req.user.claims.sub;

      const caseData = await storage.getCaseById(caseId);
      if (!caseData || caseData.clientId !== userId) {
        return res.status(404).json({ message: "Case not found" });
      }
      if (caseData.status !== "open") {
        return res.status(400).json({ message: "Case is not open" });
      }

      const { agencyId } = req.body;
      if (!agencyId) {
        return res.status(400).json({ message: "agencyId is required" });
      }

      const inquiry = await storage.getInquiryByCaseAndAgency(caseId, agencyId);
      if (!inquiry) {
        return res.status(400).json({ message: "Agency has not sent an inquiry for this case" });
      }

      const agencyProfile = await storage.getAgencyProfile(agencyId);
      if (!agencyProfile) {
        return res.status(400).json({ message: "Agency not found" });
      }

      const updated = await storage.updateCase(caseId, {
        status: "closed",
        selectedAgencyId: agencyProfile.id,
      });

      const allInquiries = await storage.getInquiriesByCase(caseId);

      if (agencyProfile.email) {
        sendAgencySelectedNotification(agencyProfile.email, caseData.title, caseData.legalArea || "")
          .catch(err => console.error("Selected agency notification failed:", err));
      }

      for (const inq of allInquiries) {
        if (inq.agencyId === agencyId) continue;
        const otherAgency = inq.agency;
        if (otherAgency?.email) {
          sendAgencyNotSelectedNotification(otherAgency.email, caseData.title, caseData.legalArea || "")
            .catch(err => console.error("Not selected notification failed:", err));
        }
      }

      res.json(updated);
    } catch (error) {
      console.error("Error selecting agency:", error);
      res.status(500).json({ message: "Failed to select agency" });
    }
  });

  app.post("/api/cases/:id/deselect-agency", isAuthenticated, requireRole("client"), async (req: any, res) => {
    try {
      const caseId = parseInt(req.params.id);
      if (isNaN(caseId)) return res.status(400).json({ message: "Invalid ID" });
      const userId = req.user.claims.sub;

      const caseData = await storage.getCaseById(caseId);
      if (!caseData || caseData.clientId !== userId) {
        return res.status(404).json({ message: "Case not found" });
      }
      if (caseData.status !== "closed" || !caseData.selectedAgencyId) {
        return res.status(400).json({ message: "No agency is selected for this case" });
      }

      const previousAgencyId = caseData.selectedAgencyId;
      const previousAgency = await storage.getAgencyProfileById(previousAgencyId);

      const updated = await storage.updateCase(caseId, {
        status: "open",
        selectedAgencyId: null,
      });

      const allInquiries = await storage.getInquiriesByCase(caseId);

      for (const inq of allInquiries) {
        const agency = inq.agency;
        if (!agency?.email) continue;
        const wasSelected = agency.id === previousAgencyId;
        sendSelectionRevertedNotification(agency.email, caseData.title, caseData.legalArea || "", wasSelected)
          .catch(err => console.error("Selection reverted notification failed:", err));
      }

      res.json(updated);
    } catch (error) {
      console.error("Error deselecting agency:", error);
      res.status(500).json({ message: "Failed to deselect agency" });
    }
  });

  app.get("/api/agency/cases", isAuthenticated, requireRole("agency"), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const agencyProfile = await storage.getAgencyProfile(userId);
      if (!agencyProfile) {
        return res.json([]);
      }
      const matchingCases = (agencyProfile.specialties && agencyProfile.specialties.length > 0)
        ? await storage.getOpenCasesForAgency(agencyProfile)
        : [];
      const wonCases = await storage.getWonCasesForAgency(agencyProfile);
      const agencyInquiries = await storage.getInquiriesByAgency(userId);
      const inquiredCaseIds = new Set(agencyInquiries.map((i) => i.caseId));

      const allCases = [...matchingCases, ...wonCases];
      const seenIds = new Set<number>();
      const uniqueCases = allCases.filter(c => {
        if (seenIds.has(c.id)) return false;
        seenIds.add(c.id);
        return true;
      });

      const casesWithStatus = uniqueCases.map((c) => ({
        ...c,
        hasInquired: inquiredCaseIds.has(c.id),
        agencyWon: c.status === "closed" && c.selectedAgencyId === agencyProfile.id,
      }));
      res.json(casesWithStatus);
    } catch (error) {
      console.error("Error fetching agency cases:", error);
      res.status(500).json({ message: "Failed to fetch cases" });
    }
  });

  app.get("/api/agency/cases/:id", isAuthenticated, requireRole("agency"), async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
      const c = await storage.getCaseById(id);
      if (!c) return res.status(404).json({ message: "Case not found" });
      res.json(c);
    } catch (error) {
      console.error("Error fetching case:", error);
      res.status(500).json({ message: "Failed to fetch case" });
    }
  });

  app.get("/api/agency/cases/:id/my-inquiry", isAuthenticated, requireRole("agency"), async (req: any, res) => {
    try {
      const caseId = parseInt(req.params.id);
      if (isNaN(caseId)) return res.status(400).json({ message: "Invalid ID" });
      const userId = req.user.claims.sub;
      const inquiry = await storage.getInquiryByCaseAndAgency(caseId, userId);
      res.json(inquiry || null);
    } catch (error) {
      console.error("Error fetching inquiry:", error);
      res.status(500).json({ message: "Failed to fetch inquiry" });
    }
  });

  app.post("/api/agency/cases/:id/inquire", isAuthenticated, requireRole("agency"), async (req: any, res) => {
    try {
      const caseId = parseInt(req.params.id);
      if (isNaN(caseId)) return res.status(400).json({ message: "Invalid ID" });
      const agencyId = req.user.claims.sub;

      const parsed = inquirySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Message is required" });
      }

      const existing = await storage.getInquiryByCaseAndAgency(caseId, agencyId);
      if (existing) {
        return res.status(400).json({ message: "You have already sent an inquiry for this case" });
      }

      const inquiry = await storage.createInquiry({
        caseId,
        agencyId,
        message: parsed.data.message,
        status: "pending",
      });

      const caseData = await storage.getCaseById(caseId);
      if (caseData) {
        await storage.createMessage({
          senderId: agencyId,
          receiverId: caseData.clientId,
          caseId,
          content: parsed.data.message,
          read: false,
        });

        if (caseData.contactEmail) {
          const agencyProfile = await storage.getAgencyProfile(agencyId);
          const agencyName = agencyProfile?.name || "En advokatbyrå";
          sendInquiryNotification(caseData.contactEmail, caseData.title, agencyName)
            .catch(err => console.error("Email notification failed:", err));
        }
      }

      res.status(201).json(inquiry);
    } catch (error) {
      console.error("Error creating inquiry:", error);
      res.status(500).json({ message: "Failed to send inquiry" });
    }
  });

  app.post("/api/agency/cases/:id/dismiss", isAuthenticated, requireRole("agency"), async (req: any, res) => {
    try {
      const caseId = parseInt(req.params.id);
      if (isNaN(caseId)) return res.status(400).json({ message: "Invalid ID" });
      const userId = req.user.claims.sub;
      await storage.dismissCase(userId, caseId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error dismissing case:", error);
      res.status(500).json({ message: "Failed to dismiss case" });
    }
  });

  app.get("/api/agencies/:id/reviews", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
      const reviews = await storage.getReviewsByAgency(id);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.get("/api/agencies/:id/stats", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
      const stats = await storage.getAgencyStats(id);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.post("/api/reviews", isAuthenticated, requireRole("client"), async (req: any, res) => {
    try {
      const clientId = req.user.claims.sub;
      const parsed = reviewSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid review data", errors: parsed.error.flatten() });
      }

      const existing = await storage.getReviewByClientAndAgency(clientId, parsed.data.agencyId);
      if (existing) {
        return res.status(400).json({ message: "Du har redan lämnat ett omdöme för denna byrå" });
      }

      const clientCases = await storage.getCasesByClient(clientId);
      const hasSelectedAgency = clientCases.some(c => c.selectedAgencyId === parsed.data.agencyId);
      if (!hasSelectedAgency) {
        return res.status(403).json({ message: "Du kan bara lämna omdöme för byråer du har valt för ett ärende" });
      }

      const review = await storage.createReview({
        agencyId: parsed.data.agencyId,
        clientId,
        rating: parsed.data.rating,
        comment: parsed.data.comment || null,
      });

      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  app.get("/api/messages/selectable-cases/:partnerId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const partnerId = req.params.partnerId;
      const profile = await storage.getProfile(userId);
      if (!profile || profile.role !== "client") return res.json([]);

      const allCases = await storage.getCasesByClient(userId);
      const openCases = allCases.filter((c: any) => c.status === "open");

      const results: { id: number; title: string; agencyName: string }[] = [];
      for (const c of openCases) {
        const inquiries = await storage.getInquiriesByCase(c.id, userId);
        const hasInquiry = inquiries.some((inq: any) => inq.agencyId === partnerId);
        if (hasInquiry) {
          const agencyProfile = await storage.getAgencyProfile(partnerId);
          results.push({ id: c.id, title: c.title, agencyName: agencyProfile?.name || "Byrå" });
        }
      }
      res.json(results);
    } catch (error) {
      console.error("Error fetching selectable cases:", error);
      res.status(500).json({ message: "Failed to fetch selectable cases" });
    }
  });

  app.get("/api/messages/threads", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const threads = await storage.getMessageThreads(userId);
      res.json(threads);
    } catch (error) {
      console.error("Error fetching threads:", error);
      res.status(500).json({ message: "Failed to fetch message threads" });
    }
  });

  app.get("/api/messages/unread-count", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const count = await storage.getUnreadCount(userId);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread count:", error);
      res.status(500).json({ message: "Failed to fetch unread count" });
    }
  });

  app.post("/api/inquiries/:id/mark-read", isAuthenticated, async (req: any, res) => {
    try {
      const inquiryId = parseInt(req.params.id);
      if (isNaN(inquiryId)) return res.status(400).json({ message: "Invalid inquiry ID" });
      await storage.markInquiriesRead([inquiryId]);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking inquiry as read:", error);
      res.status(500).json({ message: "Failed to mark inquiry as read" });
    }
  });

  app.get("/api/inquiries/unread-count", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const count = await storage.getUnreadInquiryCount(userId);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread inquiry count:", error);
      res.status(500).json({ message: "Failed to fetch unread inquiry count" });
    }
  });

  app.get("/api/messages/:partnerId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const partnerId = req.params.partnerId;
      if (!partnerId) return res.status(400).json({ message: "Partner ID required" });
      const messages = await storage.getMessagesBetween(userId, partnerId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/messages", isAuthenticated, async (req: any, res) => {
    try {
      const senderId = req.user.claims.sub;
      const parsed = messageSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Receiver and content are required" });
      }

      if (parsed.data.receiverId === senderId && senderId !== "43466662") {
        return res.status(400).json({ message: "Cannot message yourself" });
      }

      const message = await storage.createMessage({
        senderId,
        receiverId: parsed.data.receiverId,
        caseId: parsed.data.caseId || null,
        content: parsed.data.content,
        read: false,
      });

      await storage.markMessagesRead(senderId, parsed.data.receiverId);

      res.status(201).json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.post("/api/agency/create-checkout", isAuthenticated, requireRole("agency"), async (req: any, res) => {
    try {
      const stripeKey = process.env.STRIPE_SECRET_KEY;
      if (!stripeKey) {
        return res.status(503).json({ message: "Payment system is being configured. Please try again later." });
      }

      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(stripeKey);

      const userId = req.user.claims.sub;
      const agencyProfile = await storage.getAgencyProfile(userId);

      let customerId = agencyProfile?.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          metadata: { userId },
        });
        customerId = customer.id;
      }

      const host = req.headers.host;
      const protocol = req.headers["x-forwarded-proto"] || "https";

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "subscription",
        line_items: [
          {
            price_data: {
              currency: "sek",
              product_data: {
                name: "Vertigogo Professional",
                description: "Full access to client cases and messaging",
              },
              recurring: { interval: "month" },
              unit_amount: 99500,
            },
            quantity: 1,
          },
        ],
        success_url: `${protocol}://${host}/agency/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${protocol}://${host}/agency/subscribe`,
        metadata: { userId },
      });

      res.json({ url: session.url });
    } catch (error) {
      console.error("Stripe checkout error:", error);
      res.status(500).json({ message: "Failed to create checkout session" });
    }
  });

  app.post("/api/webhooks/stripe", async (req, res) => {
    try {
      const stripeKey = process.env.STRIPE_SECRET_KEY;
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!stripeKey || !webhookSecret) {
        return res.status(503).send("Webhook not configured");
      }

      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(stripeKey);

      const sig = req.headers["stripe-signature"] as string;
      if (!sig) {
        return res.status(400).send("Missing stripe-signature header");
      }

      const rawBody = (req as any).rawBody;
      if (!rawBody) {
        return res.status(400).send("Missing raw body");
      }

      const event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);

      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        if (userId) {
          const agencyProfile = await storage.getAgencyProfile(userId);
          if (agencyProfile) {
            await storage.upsertAgencyProfile({
              ...agencyProfile,
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: session.subscription as string,
              subscriptionActive: true,
            });
          }
        }
      }

      if (event.type === "customer.subscription.deleted") {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        const agencies = await storage.getAllAgencies();
        const agency = agencies.find((a) => a.stripeCustomerId === customerId);
        if (agency) {
          await storage.upsertAgencyProfile({
            ...agency,
            subscriptionActive: false,
            stripeSubscriptionId: null,
          });
        }
      }

      res.json({ received: true });
    } catch (error) {
      console.error("Stripe webhook error:", error);
      res.status(400).json({ message: "Webhook verification failed" });
    }
  });

  app.get("/api/settings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getProfile(userId);
      if (!profile) return res.status(404).json({ message: "Profile not found" });

      const { authStorage } = await import("./replit_integrations/auth/storage");
      const user = await authStorage.getUser(userId);

      res.json({
        user: user || null,
        profile,
      });
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.patch("/api/settings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { newsletterOptIn, phone } = req.body;

      const updates: Record<string, any> = {};
      if (typeof newsletterOptIn === "boolean") {
        updates.newsletterOptIn = newsletterOptIn;
      }
      if (typeof phone === "string") {
        updates.phone = phone.trim() || null;
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: "No valid updates provided" });
      }

      const updated = await storage.updateProfile(userId, updates);
      res.json(updated);
    } catch (error) {
      console.error("Error updating settings:", error);
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  app.delete("/api/account", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.deleteAccount(userId);
      res.json({ message: "Account deleted" });
    } catch (error) {
      console.error("Error deleting account:", error);
      res.status(500).json({ message: "Failed to delete account" });
    }
  });

  app.get("/api/agency/subscription-status", isAuthenticated, requireRole("agency"), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const agencyProfile = await storage.getAgencyProfile(userId);
      res.json({
        active: agencyProfile?.subscriptionActive || false,
        subscriptionId: agencyProfile?.stripeSubscriptionId || null,
      });
    } catch (error) {
      console.error("Error fetching subscription status:", error);
      res.status(500).json({ message: "Failed to fetch subscription status" });
    }
  });

  return httpServer;
}
