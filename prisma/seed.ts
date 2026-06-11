import { PrismaClient, Role, UserStatus, ContentStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  const adminPassword = await bcrypt.hash("Admin1234!", 12);
  const userPassword = await bcrypt.hash("User1234!", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@cesizen.fr" },
    update: {},
    create: {
      email: "admin@cesizen.fr",
      passwordHash: adminPassword,
      role: Role.ADMIN,
      statut: UserStatus.ACTIF,
    },
  });

  await prisma.user.upsert({
    where: { email: "user@cesizen.fr" },
    update: {},
    create: {
      email: "user@cesizen.fr",
      passwordHash: userPassword,
      role: Role.USER,
      statut: UserStatus.ACTIF,
    },
  });
  console.log("✅ Users seeded");

  // Categories (using upsert by name is tricky since not unique, so check first)
  let stressCat = await prisma.category.findFirst({ where: { name: "Stress" } });
  if (!stressCat) {
    stressCat = await prisma.category.create({ data: { name: "Stress" } });
  }
  let sleepCat = await prisma.category.findFirst({ where: { name: "Sommeil" } });
  if (!sleepCat) {
    sleepCat = await prisma.category.create({ data: { name: "Sommeil" } });
  }
  console.log("✅ Categories seeded");

  // Contents
  let stressContent = await prisma.content.findFirst({
    where: { title: "Comprendre le stress" },
  });
  if (!stressContent) {
    stressContent = await prisma.content.create({
      data: {
        title: "Comprendre le stress",
        body: "Contenu de démonstration sur la compréhension du stress et ses mécanismes.",
        status: ContentStatus.PUBLIE,
        authorId: admin.id,
      },
    });
  }

  let sleepContent = await prisma.content.findFirst({
    where: { title: "Améliorer son sommeil" },
  });
  if (!sleepContent) {
    sleepContent = await prisma.content.create({
      data: {
        title: "Améliorer son sommeil",
        body: "Contenu de démonstration sur l'amélioration du sommeil.",
        status: ContentStatus.BROUILLON,
        authorId: admin.id,
      },
    });
  }
  console.log("✅ Contents seeded");

  await prisma.contentCategory.upsert({
    where: {
      contentId_categoryId: {
        contentId: stressContent.id,
        categoryId: stressCat.id,
      },
    },
    update: {},
    create: {
      contentId: stressContent.id,
      categoryId: stressCat.id,
    },
  });
  console.log("✅ Content-Category links seeded");

  const presets = [
    { code: "748", inspirationS: 7, apneeS: 4, expirationS: 8 },
    { code: "55", inspirationS: 5, apneeS: 0, expirationS: 5 },
    { code: "46", inspirationS: 4, apneeS: 0, expirationS: 6 },
  ];

  for (const preset of presets) {
    await prisma.breathingPreset.upsert({
      where: { code: preset.code },
      update: {},
      create: preset,
    });
  }
  console.log("✅ Breathing presets seeded");

  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
