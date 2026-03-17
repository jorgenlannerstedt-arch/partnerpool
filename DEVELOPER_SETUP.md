# Vertigogo – Utvecklaruppsättning

## GitHub-repo

```
https://github.com/jorgenlannerstedt-arch/partnerpool
```

Klona projektet:

```bash
git clone https://github.com/jorgenlannerstedt-arch/partnerpool.git
cd partnerpool
```

---

## Synka kod från GitHub

När repot uppdateras (av annan utvecklare eller via Replit Agent), hämta senaste versionen:

```bash
git pull origin main
```

Om du jobbar i en feature-branch och vill merga in main:

```bash
git fetch origin
git merge origin/main
```

Pusha dina egna ändringar:

```bash
git add .
git commit -m "Beskrivning av ändring"
git push origin main
```

---

## Miljövariabler

Skapa en fil som heter `.env` i projektets rot med följande innehåll. Fyll i riktiga värden – se respektive tjänst för hur man hämtar dem.

```env
# PostgreSQL-databas (Neon, Supabase eller lokal Postgres)
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DBNAME

# Sessionshemlighet – valfri lång slumpsträng, t.ex. genererad med: openssl rand -hex 32
SESSION_SECRET=din-hemliga-nyckel-här

# Anthropic Claude – används för AI-analys av PDF-dokument
# Hämtas från: https://console.anthropic.com/
AI_INTEGRATIONS_ANTHROPIC_API_KEY=sk-ant-...
AI_INTEGRATIONS_ANTHROPIC_BASE_URL=https://api.anthropic.com

# Resend – används för e-postnotifieringar
# Hämtas från: https://resend.com/api-keys
RESEND_API_KEY=re_...

# Stripe – används för byråprenumeration (995 SEK/mån)
# Hämtas från: https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Google Maps API-nyckel (används minimalt – kartor körs primärt via Leaflet utan nyckel)
GOOGLE_MAPS_API_KEY=
```

> `.env` är gitignorerad och ska aldrig committas till repot.

---

## Databas

Projektet använder **PostgreSQL** med **Drizzle ORM**. Schemat finns i `shared/schema.ts`.

Synka schemat mot databasen (kör efter kloning och efter schemaändringar):

```bash
npm run db:push
```

För lokal utveckling kan du använda en lokal Postgres-instans eller gratis Neon-databas (https://neon.tech).

---

## Starta lokalt

```bash
npm install
npm run db:push
npm run dev
```

Applikationen körs på **http://localhost:5000** – både frontend (Vite) och backend (Express) serveras på samma port.

---

## Autentisering – viktig notering

I produktion (Replit) används **Replit Auth** för inloggning, som är Replits egna OAuth-lösning. Den fungerar inte lokalt utanför Replit-miljön utan modifiering.

För lokal utveckling behöver du antingen:
- Sätta upp en alternativ auth-lösning lokalt
- Eller hårdkoda en testanvändare i `server/replit_integrations/auth.ts` för utvecklingssyfte

Ta kontakt med Replit Agent (Vertigogo-projektet) för att diskutera hur auth ska hanteras i lokal miljö.

---

## Projektstruktur

```
/
├── client/src/
│   ├── App.tsx                      # Routing (wouter)
│   ├── pages/
│   │   ├── landing.tsx              # Landningssida (ej inloggad)
│   │   ├── client-login.tsx         # Inloggning för klienter
│   │   ├── agency-register.tsx      # Registrering för byråer
│   │   ├── role-select.tsx          # Välj roll: Klient eller Byrå
│   │   ├── client-dashboard.tsx     # Klientpanel – lista ärenden
│   │   ├── new-case.tsx             # Skapa ärende (PDF → AI → publicera)
│   │   ├── case-detail.tsx          # Klientvy: ärendedetalj + förfrågningar
│   │   ├── agency-dashboard.tsx     # Byråpanel – matchade ärenden
│   │   ├── agency-case-detail.tsx   # Byråvy: ärendedetalj + skicka förfrågan
│   │   ├── agency-profile-setup.tsx # Byråprofil: kontor, specialiseringar, logo
│   │   ├── agency-subscribe.tsx     # Stripe-betalning för byråprenumeration
│   │   ├── partner-pool.tsx         # Partnerpool – lista + karta
│   │   ├── partner-detail.tsx       # Byråprofil med omdömen och stats
│   │   ├── messages.tsx             # Intern meddelandeplattform
│   │   ├── settings.tsx             # Klientinställningar
│   │   ├── support.tsx              # Supportsida
│   │   ├── privacy-policy.tsx       # Integritetspolicy
│   │   ├── data-policy.tsx          # Datapolicy
│   │   └── not-found.tsx            # 404
│   └── components/
│       └── app-layout.tsx           # Gemensam layout med navigering
├── server/
│   ├── index.ts                     # Entry point
│   ├── routes.ts                    # Alla API-endpoints
│   ├── storage.ts                   # Databaslager (Drizzle ORM)
│   ├── db.ts                        # Databasanslutning
│   ├── email.ts                     # E-postfunktioner via Resend
│   └── seed.ts                      # Seed-data (12 svenska advokatbyråer)
└── shared/
    └── schema.ts                    # Drizzle-schema + TypeScript-typer + konstanter
```

---

## Viktiga designbeslut

- **Allt kommuniceras via plattformen** – byråer kan inte visa kontaktuppgifter
- **Matchning** sker på juridiskt område + beloppsintervall + försäkringstyp
- **Logotyper** sparas som base64 i databasen och serveras via `/api/agency/:id/logo`
- **Ärenden** är utkast tills klienten publicerar dem – AI anonymiserar och sammanfattar PDF
- **Omdömen** är verifierade – endast klienter som valt en byrå kan lämna omdöme
- **Alla UI-texter är på svenska**

---

## Konstanter (shared/schema.ts)

| Konstant | Beskrivning |
|---|---|
| `LEGAL_AREAS` | 17 svenska juridiska områden |
| `INSURANCE_TYPES` | 4 försäkringstyper (Hemförsäkring, Företagsförsäkring, m.fl.) |
| `AMOUNT_RANGES` | Beloppsintervall för ärenden |
| `LANGUAGES` | Tillgängliga språk för byråer |
| `PRICE_RANGES` | Budget-vänlig / Medel / Premium |

---

## Vad saknas (framtida utveckling)

- **Admin-panel** – ingen finns ännu (hantering av användare, byråer, betalningsstatus)
- **Lokal auth** – Replit Auth fungerar inte utanför Replit-miljön
