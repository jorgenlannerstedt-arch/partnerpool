import { db } from "./db";
import { agencyProfiles, agencyReviews } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

const seedAgencies = [
  {
    userId: "demo-agency-1",
    name: "Advokatfirman Lindberg & Partners",
    description: "Lindberg & Partners är en av Sveriges ledande affärsjuridiska byråer med fokus på avtalsrätt, affärsjuridik och tvistemål. Vi hjälper företag och privatpersoner med komplexa juridiska frågor.",
    address: "Kungsgatan 18",
    city: "Stockholm",
    latitude: 59.3345,
    longitude: 18.0632,
    phone: "+46 8 555 0100",
    email: "info@lindbergpartners.se",
    website: "https://www.lindbergpartners.se",
    specialties: ["Affärsjuridik", "Avtalsrätt", "Tvistemål"],
    employeeCount: 24,
    offices: [{ city: "Göteborg", address: "Avenyn 12" }, { city: "Malmö", address: "Stortorget 5" }],
    foundedYear: 1992,
    languages: ["Svenska", "Engelska"],
    priceRange: "Premium",
    barAssociationMember: true,
    responseTimeHours: 2,
    subscriptionActive: true,
  },
  {
    userId: "demo-agency-2",
    name: "Nordström Arbetsrätt AB",
    description: "Specialiserade på arbetsrätt och anställningsrelaterade tvister. Vi företräder både arbetsgivare och arbetstagare i alla typer av arbetsrättsliga frågor.",
    address: "Vasagatan 44",
    city: "Göteborg",
    latitude: 57.7089,
    longitude: 11.9746,
    phone: "+46 31 700 0200",
    email: "kontakt@nordstromarbetsratt.se",
    website: "https://www.nordstromarbetsratt.se",
    specialties: ["Arbetsrätt", "Avtalsrätt", "Tvistemål"],
    employeeCount: 12,
    offices: [{ city: "Stockholm", address: "Sveavägen 32" }],
    foundedYear: 2005,
    languages: ["Svenska", "Engelska", "Tyska"],
    priceRange: "Medel",
    barAssociationMember: true,
    responseTimeHours: 4,
    subscriptionActive: true,
  },
  {
    userId: "demo-agency-3",
    name: "Eriksson Familjerätt",
    description: "Eriksson Familjerätt har i över 20 år hjälpt familjer genom svåra juridiska situationer. Vi erbjuder trygg och personlig rådgivning inom familjerätt och vårdnadstvister.",
    address: "Drottninggatan 28",
    city: "Malmö",
    latitude: 55.605,
    longitude: 13.0038,
    phone: "+46 40 600 0300",
    email: "kontakt@erikssonfamiljeratt.se",
    website: "https://www.erikssonfamiljeratt.se",
    specialties: ["Familjerätt", "Civilrätt", "Tvistemål"],
    employeeCount: 8,
    foundedYear: 1995,
    languages: ["Svenska", "Engelska"],
    priceRange: "Medel",
    barAssociationMember: true,
    responseTimeHours: 8,
    subscriptionActive: true,
  },
  {
    userId: "demo-agency-4",
    name: "Westberg Straffrättsadvokaterna",
    description: "Westberg Straffrättsadvokaterna försvarar individer i brottmål och har lång erfarenhet av straffrätt och processrätt. Vi finns till för dig som behöver en skicklig försvarsadvokat.",
    address: "Birger Jarlsgatan 15",
    city: "Stockholm",
    latitude: 59.338,
    longitude: 18.073,
    phone: "+46 8 555 0400",
    email: "info@westbergstraffratt.se",
    website: "https://www.westbergstraffratt.se",
    specialties: ["Straffrätt", "Civilrätt", "Personskaderätt"],
    employeeCount: 6,
    foundedYear: 2010,
    languages: ["Svenska", "Engelska"],
    priceRange: "Premium",
    barAssociationMember: true,
    responseTimeHours: 1,
    subscriptionActive: true,
  },
  {
    userId: "demo-agency-5",
    name: "Bergman IP & Tech Law",
    description: "Bergman IP & Tech Law är ledande inom immaterialrätt och GDPR-frågor. Vi hjälper företag att skydda sina varumärken, patent och hantera dataskydd.",
    address: "Stureplan 4",
    city: "Stockholm",
    latitude: 59.3358,
    longitude: 18.0732,
    phone: "+46 8 555 0500",
    email: "info@bergmaniplaw.se",
    website: "https://www.bergmaniplaw.se",
    specialties: ["Immaterialrätt", "GDPR & Dataskydd", "Affärsjuridik"],
    employeeCount: 15,
    offices: [{ city: "Göteborg", address: "Kungsgatan 8" }],
    foundedYear: 2015,
    languages: ["Svenska", "Engelska"],
    priceRange: "Medel",
    barAssociationMember: false,
    responseTimeHours: 6,
    subscriptionActive: true,
  },
  {
    userId: "demo-agency-6",
    name: "Hallberg Fastighetsrätt",
    description: "Hallberg Fastighetsrätt är specialiserade på fastighetsjuridik och hyrestvister. Vi företräder både hyresvärdar, hyresgäster och fastighetsägare i alla typer av fastighetsfrågor.",
    address: "Strandvägen 22",
    city: "Stockholm",
    latitude: 59.331,
    longitude: 18.085,
    phone: "+46 8 555 0600",
    email: "kontakt@hallbergfastighet.se",
    website: "https://www.hallbergfastighet.se",
    specialties: ["Fastighetsrätt", "Avtalsrätt", "Civilrätt"],
    employeeCount: 10,
    offices: [{ city: "Uppsala", address: "Dragarbrunnsgatan 12" }, { city: "Västerås", address: "Stora Gatan 18" }],
    foundedYear: 1988,
    languages: ["Svenska", "Engelska", "Finska"],
    priceRange: "Premium",
    barAssociationMember: true,
    responseTimeHours: 3,
    subscriptionActive: true,
  },
  {
    userId: "demo-agency-7",
    name: "Söderström Skatterätt",
    description: "Söderström Skatterätt hjälper privatpersoner och företag med komplexa skattefrågor, skatteutredningar och skatteplanering. Vi har Sveriges mest erfarna skattejurister.",
    address: "Hamngatan 11",
    city: "Stockholm",
    latitude: 59.3327,
    longitude: 18.0685,
    phone: "+46 8 555 0700",
    email: "info@soderstromskatt.se",
    website: "https://www.soderstromskatt.se",
    specialties: ["Skatterätt", "Affärsjuridik", "Försäkringsrätt"],
    employeeCount: 18,
    offices: [{ city: "Malmö", address: "Baltzarsgatan 20" }, { city: "Göteborg", address: "Östra Hamngatan 5" }],
    foundedYear: 2002,
    languages: ["Svenska", "Engelska"],
    priceRange: "Budget-vänlig",
    barAssociationMember: true,
    responseTimeHours: 12,
    subscriptionActive: true,
  },
  {
    userId: "demo-agency-8",
    name: "Johansson Migrationsrätt",
    description: "Johansson Migrationsrätt har lång erfarenhet av migrationsfrågor, asylärenden och uppehållstillstånd. Vi hjälper dig med alla typer av migrationsrättsliga ärenden.",
    address: "Karlbergsvägen 45",
    city: "Stockholm",
    latitude: 59.344,
    longitude: 18.038,
    phone: "+46 8 555 0800",
    email: "kontakt@johanssonmigration.se",
    website: "https://www.johanssonmigration.se",
    specialties: ["Migrationsrätt", "Civilrätt", "Familjerätt"],
    employeeCount: 7,
    foundedYear: 2008,
    languages: ["Svenska", "Engelska", "Arabiska", "Persiska"],
    priceRange: "Budget-vänlig",
    barAssociationMember: true,
    responseTimeHours: 4,
    subscriptionActive: true,
  },
  {
    userId: "demo-agency-9",
    name: "Andersson & Björk Miljörätt",
    description: "Andersson & Björk Miljörätt är ledande inom miljöjuridik. Vi hjälper kommuner, företag och privatpersoner med tillståndsfrågor, föroreningar och miljöansvar.",
    address: "Vallgatan 6",
    city: "Göteborg",
    latitude: 57.7007,
    longitude: 11.9669,
    phone: "+46 31 700 0900",
    email: "info@abmiljorett.se",
    website: "https://www.abmiljorett.se",
    specialties: ["Miljörätt", "Fastighetsrätt", "Civilrätt"],
    employeeCount: 9,
    offices: [{ city: "Stockholm", address: "Kungsholmsgatan 14" }],
    foundedYear: 2000,
    languages: ["Svenska", "Engelska"],
    priceRange: "Medel",
    barAssociationMember: false,
    responseTimeHours: 24,
    subscriptionActive: true,
  },
  {
    userId: "demo-agency-10",
    name: "Pettersson Konkursrätt",
    description: "Pettersson Konkursrätt är specialiserade på insolvens, konkurs och företagsrekonstruktion. Vi hjälper företag i kris och borgenärer att tillvarata sina rättigheter.",
    address: "Östra Storgatan 30",
    city: "Jönköping",
    latitude: 57.7826,
    longitude: 14.1618,
    phone: "+46 36 100 1000",
    email: "kontakt@petterssonkonkurs.se",
    website: "https://www.petterssonkonkurs.se",
    specialties: ["Konkursrätt", "Affärsjuridik", "Avtalsrätt"],
    employeeCount: 5,
    foundedYear: 2012,
    languages: ["Svenska", "Engelska"],
    priceRange: "Medel",
    barAssociationMember: true,
    responseTimeHours: 6,
    subscriptionActive: true,
  },
  {
    userId: "demo-agency-11",
    name: "Försäkringsjuristerna i Malmö",
    description: "Försäkringsjuristerna är specialiserade på försäkringsfrågor och personskadeärenden. Vi hjälper dig att få den ersättning du har rätt till.",
    address: "Adelgatan 8",
    city: "Malmö",
    latitude: 55.6088,
    longitude: 12.9956,
    phone: "+46 40 600 1100",
    email: "info@forsakringsjuristerna.se",
    website: "https://www.forsakringsjuristerna.se",
    specialties: ["Försäkringsrätt", "Personskaderätt", "Tvistemål"],
    employeeCount: 11,
    offices: [{ city: "Lund", address: "Bredgatan 4" }],
    foundedYear: 1998,
    languages: ["Svenska", "Engelska", "Arabiska"],
    priceRange: "Budget-vänlig",
    barAssociationMember: true,
    responseTimeHours: 8,
    subscriptionActive: true,
  },
  {
    userId: "demo-agency-12",
    name: "Sjöberg Maritime Law",
    description: "Sjöberg Maritime Law har sedan 1985 arbetat med sjörättsliga frågor. Vi hjälper rederier, försäkringsbolag och godstransportörer med sjörättsliga tvister.",
    address: "Packhusplatsen 2",
    city: "Göteborg",
    latitude: 57.706,
    longitude: 11.9654,
    phone: "+46 31 700 1200",
    email: "info@sjobergmaritime.se",
    website: "https://www.sjobergmaritime.se",
    specialties: ["Sjörätt", "Försäkringsrätt", "Avtalsrätt"],
    employeeCount: 14,
    offices: [{ city: "Stockholm", address: "Skeppsbron 10" }],
    foundedYear: 2001,
    languages: ["Svenska", "Engelska", "Tyska", "Franska"],
    priceRange: "Premium",
    barAssociationMember: true,
    responseTimeHours: 2,
    subscriptionActive: true,
  },
];

const seedReviews = [
  { agencyUserId: "demo-agency-1", clientId: "demo-client-1", rating: 5, comment: "Utmärkt service och mycket professionella. Hjälpte oss med ett komplicerat affärsjuridiskt ärende." },
  { agencyUserId: "demo-agency-1", clientId: "demo-client-2", rating: 4, comment: "Kunniga jurister med bra kommunikation. Lite högt pris men värt det." },
  { agencyUserId: "demo-agency-1", clientId: "demo-client-3", rating: 5, comment: "Snabb respons och tydlig rådgivning. Rekommenderas varmt!" },
  { agencyUserId: "demo-agency-2", clientId: "demo-client-1", rating: 4, comment: "Bra hjälp med arbetsrättsliga frågor. Grundlig och noggrann." },
  { agencyUserId: "demo-agency-2", clientId: "demo-client-4", rating: 5, comment: "Fantastisk expertis inom arbetsrätt. Löste vår tvist snabbt." },
  { agencyUserId: "demo-agency-3", clientId: "demo-client-2", rating: 4, comment: "Hjälpsam och empatisk byrå. Bra på familjerätt." },
  { agencyUserId: "demo-agency-3", clientId: "demo-client-5", rating: 3, comment: "Bra kunskap men kunde ha kommunicerat bättre under processens gång." },
  { agencyUserId: "demo-agency-4", clientId: "demo-client-3", rating: 5, comment: "Den bästa straffrättsadvokaten i Stockholm. Mycket professionell." },
  { agencyUserId: "demo-agency-6", clientId: "demo-client-4", rating: 5, comment: "Extremt kunniga inom fastighetsrätt. Sparade oss mycket pengar." },
  { agencyUserId: "demo-agency-6", clientId: "demo-client-5", rating: 4, comment: "Bra service och rimliga priser för fastighetsärenden." },
  { agencyUserId: "demo-agency-8", clientId: "demo-client-1", rating: 5, comment: "Fantastisk hjälp med migrationsärende. Flerspråkig personal var en stor fördel." },
  { agencyUserId: "demo-agency-8", clientId: "demo-client-6", rating: 4, comment: "Professionell och kunnig. Tack för er hjälp!" },
  { agencyUserId: "demo-agency-11", clientId: "demo-client-6", rating: 5, comment: "Mycket bra hjälp med försäkringsärende. Snabb och effektiv." },
  { agencyUserId: "demo-agency-12", clientId: "demo-client-2", rating: 5, comment: "Världsklass inom sjörätt. Internationell expertis." },
  { agencyUserId: "demo-agency-12", clientId: "demo-client-3", rating: 4, comment: "Kunniga och erfarna. Bra på att förklara komplexa juridiska frågor." },
];

export async function seedDemoData() {
  // Always ensure demo agency has active subscription
  await db
    .update(agencyProfiles)
    .set({ subscriptionActive: true })
    .where(eq(agencyProfiles.userId, "demo_client_user"));

  const existing = await db.select({ count: sql<number>`count(*)` }).from(agencyProfiles);
  const count = Number(existing[0]?.count ?? 0);
  if (count > 0) {
    return;
  }

  console.log("Seeding demo agency profiles...");
  const agencyIdMap: Record<string, number> = {};

  for (const agency of seedAgencies) {
    try {
      const [inserted] = await db.insert(agencyProfiles).values(agency).returning({ id: agencyProfiles.id });
      agencyIdMap[agency.userId] = inserted.id;
      console.log(`  Seeded: ${agency.name}`);
    } catch (error) {
      console.log(`  Skipped: ${agency.name}`);
    }
  }

  console.log("Seeding demo reviews...");
  for (const review of seedReviews) {
    const agencyId = agencyIdMap[review.agencyUserId];
    if (!agencyId) continue;
    try {
      await db.insert(agencyReviews).values({
        agencyId,
        clientId: review.clientId,
        rating: review.rating,
        comment: review.comment,
      });
    } catch (error) {
      // skip
    }
  }

  console.log("Demo seeding complete!");
}

