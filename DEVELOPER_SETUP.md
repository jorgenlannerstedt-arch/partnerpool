# Vertigogo – Guide för lokal utveckling

Hej! Välkommen till kodbasen. Den här guiden är skriven för att du ska komma igång så smidigt som möjligt. Läs igenom den en gång först, sen kör du steg för steg.

---

## Repot

```
https://github.com/jorgenlannerstedt-arch/partnerpool
```

```bash
git clone https://github.com/jorgenlannerstedt-arch/partnerpool.git
cd partnerpool
npm install
```

---

## Samarbetsregler – läs detta först

Vi är två som jobbar i samma repo: **Replit Agent** (AI på Replit-sidan) och **du** (kodaren lokalt i Claude Code). För att undvika konflikter gäller dessa regler:

### Filer som Replit ALDRIG redigerar – dessa äger du

Dessa filer skrivs av kodaren och ska inte röras av Replit Agent:

- `server/localAuth.ts` — lokal auth-bypass för din dev-miljö
- `server/productionAuth.ts` — din produktionsauth-lösning
- `shared/models/auth.ts` — dina auth-modeller

Om Replit råkar ändra dessa av misstag — säg till så rullar vi tillbaka.

### Filer som du ALDRIG redigerar – dessa äger Replit

Dessa filer genereras eller hanteras av Replit och skrivs över vid deploy:

- `server/replit_integrations/` — hela katalogen (Replit Auth, AI-integrationer m.m.)
- `.replit` och `replit.nix` — Replits miljökonfiguration

Om du behöver ändra auth-beteendet i produktion — kommunicera det till Replit-sidan istället.

### Nya miljövariabler

Om du lägger till en ny integration eller tjänst som kräver en ny env-variabel:
1. Dokumentera den i `DEVELOPER_SETUP.md` under "Miljövariabler"
2. Meddela Replit-sidan så den läggs till i Replit Secrets — annars kraschar produktionsappen tyst

Samma gäller omvänt: om Replit-sidan lägger till nya env-variabler uppdateras `DEVELOPER_SETUP.md` och du meddelas.

### Schemaändringar (shared/schema.ts)

Om du ändrar databasschemat:
1. Ändra `shared/schema.ts`
2. Kör `npm run db:push` lokalt för att synka din databas
3. Committa och pusha till GitHub
4. Meddela Replit-sidan — de kör `npm run db:push` på sin server

Ingen av oss kör manuella SQL-migreringar. Drizzle sköter det via `db:push`.

---

## Synka med repot

Hämta senaste koden (gör detta varje gång du börjar jobba):

```bash
git pull origin main
```

Pusha dina ändringar:

```bash
git add .
git commit -m "Vad du ändrade"
git push origin main
```

---

## Databas – sätt upp lokalt

Projektet använder **PostgreSQL**. Du behöver en Postgres-databas. Enklaste alternativen:

**Alternativ A – Lokal Postgres (rekommenderas för snabb start):**
```bash
# macOS med Homebrew
brew install postgresql@15
brew services start postgresql@15
createdb vertigogo

# Ubuntu/Debian
sudo apt install postgresql
sudo -u postgres createdb vertigogo
```

Din `DATABASE_URL` blir då:
```
DATABASE_URL=postgresql://localhost/vertigogo
```

**Alternativ B – Neon (gratis molndatabas, neon.tech):**
Skapa ett konto på [neon.tech](https://neon.tech), skapa ett projekt, kopiera connection string.

När du har databasen, synka schemat:
```bash
npm run db:push
```

---

## Autentisering – viktig läsning

Produktionen (Replit) använder **Replit Auth** – ett OpenID Connect-system som är knutet till Replitkontot. Det är alltså inloggning på **webbplatsen** (inte GitHub-access). Det funkar inte lokalt eftersom det kräver Replits servrar och ett `REPL_ID`.

**Du behöver alltså ersätta auth-lagret för lokal utveckling.** Här är det enklaste sättet:

### Lösning: Dev-bypass i auth-middleware

I `server/replit_integrations/auth/replitAuth.ts` exporteras `isAuthenticated` och `setupAuth`. För lokal dev kan du skapa en mock-version.

Skapa filen `server/localAuth.ts`:

```typescript
import type { Express, RequestHandler } from "express";
import session from "express-session";
import { storage } from "./storage";

// Hårdkodad testanvändare – ändra till din smak
const DEV_USER = {
  id: "dev-user-1",
  email: "dev@example.com",
  firstName: "Dev",
  lastName: "User",
  profileImageUrl: null,
};

export async function setupAuth(app: Express) {
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "dev-secret",
      resave: false,
      saveUninitialized: false,
    })
  );

  // Sätt in dev-användaren i databasen vid start
  await storage.upsertUser(DEV_USER);

  // Fejkad login-route
  app.get("/api/login", async (req: any, res) => {
    req.session.userId = DEV_USER.id;
    res.redirect("/");
  });

  app.get("/api/logout", (req: any, res) => {
    req.session.destroy(() => res.redirect("/"));
  });

  app.get("/api/callback", (_req, res) => res.redirect("/"));
}

export const isAuthenticated: RequestHandler = (req: any, res, next) => {
  if (req.session?.userId) {
    req.user = {
      claims: { sub: req.session.userId },
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    };
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};

export function getSession() {
  return session({
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
  });
}

export function registerAuthRoutes(_app: Express) {}
```

Sedan i `server/routes.ts`, byt ut importen längst upp:

```typescript
// Ändra detta:
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";

// Till detta (bara i lokal dev):
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./localAuth";
```

> Tips: Använd en env-variabel för att styra vilken auth som används, t.ex.:
> ```typescript
> const auth = process.env.NODE_ENV === "development" && process.env.USE_LOCAL_AUTH === "true"
>   ? await import("./localAuth")
>   : await import("./replit_integrations/auth");
> ```
> Då slipper du ändra imports manuellt.

Du behöver också se till att `storage.upsertUser` finns – kolla `server/replit_integrations/auth/storage.ts` för hur den fungerar.

---

## Miljövariabler

Skapa `.env` i projektets rot (den är gitignorerad, committas aldrig):

```env
# Databas
DATABASE_URL=postgresql://localhost/vertigogo

# Session
SESSION_SECRET=vilken-lång-sträng-som-helst-funkar-lokalt

# Aktivera lokal auth (se ovan)
USE_LOCAL_AUTH=true

# Anthropic – för AI-analys av PDF
# Hämtas från: https://console.anthropic.com/
AI_INTEGRATIONS_ANTHROPIC_API_KEY=sk-ant-...
AI_INTEGRATIONS_ANTHROPIC_BASE_URL=https://api.anthropic.com

# Resend – för e-postnotifieringar (kan lämnas tom lokalt, emails loggas då i konsolen)
RESEND_API_KEY=re_...

# Stripe – för betalningar (kan lämnas tom lokalt om du inte testar checkout)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Google Maps (används minimalt, kan lämnas tom)
GOOGLE_MAPS_API_KEY=
```

> Anthropic-nyckeln behövs om du testar PDF-uppladdning och AI-analys.
> Resend och Stripe kan lämnas tomma för UI-utveckling – de relevanta kodvägarna triggas bara vid specifika användarflöden.

---

## Starta

```bash
npm install
npm run db:push   # Synka schemat mot databasen (kör en gång, och efter schemaändringar)
npm run dev       # Startar på http://localhost:5000
```

Gå till `http://localhost:5000/api/login` för att logga in som dev-användaren. Sedan `/` för att komma till appen.

---

## Välj roll

Första gången du loggar in hamnar du på rollvalsidan. Välj **Klient** eller **Byrå** – du kan återställa det via databasen om du vill testa båda:

```sql
UPDATE user_profiles SET role = NULL, onboarding_complete = false WHERE user_id = 'dev-user-1';
```

För att testa byråflödet behöver byrån en byråprofil. Det finns seed-data med 12 svenska byråer – kör:

```bash
# Det finns en seed-route i appen:
curl -X POST http://localhost:5000/api/seed
```

Eller kolla `server/seed.ts` för att köra direkt.

---

## Projektstruktur

```
/
├── client/src/
│   ├── App.tsx                       # Routing (wouter)
│   ├── pages/
│   │   ├── landing.tsx               # Landningssida (ej inloggad)
│   │   ├── client-login.tsx          # Inloggning för klienter
│   │   ├── agency-register.tsx       # Registrering för byråer
│   │   ├── role-select.tsx           # Välj roll: Klient eller Byrå
│   │   ├── client-dashboard.tsx      # Klientpanel – lista ärenden
│   │   ├── new-case.tsx              # Skapa ärende (PDF → AI → publicera)
│   │   ├── case-detail.tsx           # Klientvy: ärendedetalj + förfrågningar
│   │   ├── agency-dashboard.tsx      # Byråpanel – matchade ärenden
│   │   ├── agency-case-detail.tsx    # Byråvy: ärendedetalj + skicka förfrågan
│   │   ├── agency-profile-setup.tsx  # Byråprofil: kontor, specialiseringar, logo
│   │   ├── agency-subscribe.tsx      # Stripe-betalning (995 SEK/mån)
│   │   ├── partner-pool.tsx          # Partnerpool – lista + karta (Leaflet)
│   │   ├── partner-detail.tsx        # Byråprofil med omdömen och stats
│   │   ├── messages.tsx              # Intern meddelandeplattform
│   │   ├── settings.tsx              # Klientinställningar
│   │   ├── support.tsx               # Supportsida
│   │   ├── privacy-policy.tsx        # Integritetspolicy
│   │   └── data-policy.tsx           # Datapolicy
│   └── components/
│       └── app-layout.tsx            # Gemensam layout med navigering
├── server/
│   ├── index.ts                      # Entry point
│   ├── routes.ts                     # Alla API-endpoints (~1200 rader)
│   ├── storage.ts                    # Databaslager (Drizzle ORM)
│   ├── db.ts                         # Databasanslutning
│   ├── email.ts                      # E-postfunktioner via Resend
│   ├── seed.ts                       # Seed-data (12 svenska byråer)
│   └── replit_integrations/auth/     # Replit Auth (används bara i produktion)
└── shared/
    └── schema.ts                     # Drizzle-schema + typer + konstanter
```

---

## Viktiga designbeslut att känna till

- **Allt kommuniceras via plattformen** – byråer kan aldrig visa kontaktuppgifter till klienter direkt
- **Matchning** sker på tre kriterier: juridiskt område + beloppsintervall + försäkringstyp
- **Logotyper** sparas som base64 i databasen (inte filsystemet) och serveras via `/api/agency/:id/logo` – detta för att fungera i molnmiljö utan persistent filsystem
- **Ärenden är utkast** tills klienten aktivt publicerar – AI anonymiserar och sammanfattar PDF-innehållet
- **Omdömen är verifierade** – bara klienter som faktiskt valt en byrå kan lämna omdöme
- **Alla UI-texter är på svenska**
- Kartor körs via **Leaflet** (ingen API-nyckel krävs)

---

## Konstanter att känna till (shared/schema.ts)

```typescript
LEGAL_AREAS       // 17 svenska juridiska områden – styr matchning
INSURANCE_TYPES   // 4 försäkringstyper
AMOUNT_RANGES     // Beloppsintervall
LANGUAGES         // Tillgängliga språk för byråer
PRICE_RANGES      // Budget-vänlig / Medel / Premium
```

---

## Om du kör fast

- **Databasen hittas inte:** Kontrollera att Postgres körs och `DATABASE_URL` stämmer
- **Inloggning fungerar inte:** Kontrollera att du använder lokalt auth-lager och att dev-användaren finns i `users`-tabellen
- **AI-analys misslyckas:** Kontrollera `AI_INTEGRATIONS_ANTHROPIC_API_KEY`
- **Schemat är ur sync:** Kör `npm run db:push` igen

Lycka till! Du har allt du behöver.
