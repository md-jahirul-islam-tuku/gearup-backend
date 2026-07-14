import "dotenv/config";
import bcrypt from "bcrypt";
// import { Prisma } from "../generated/prisma";
import { prisma } from "../src/app/config/prisma";
import { Role, UserStatus } from "../generated/prisma/enums";
import { Prisma } from "../generated/prisma/client";

type TSeedGear = {
  name: string;
  description: string;
  brand: string;
  pricePerDay: Prisma.Decimal;
  stock: number;
  isAvailable: boolean;
  images: string[];
  providerId: string;
  categoryId: string;
};

async function seedUsers() {
  console.log("🌱 Seeding users...");

  const adminPassword = await bcrypt.hash("Admin123@", 10);
  const providerPassword = await bcrypt.hash("Provider123@", 10);
  const customerPassword = await bcrypt.hash("Customer123@", 10);

  const admin = await prisma.user.upsert({
    where: {
      email: "admin@gearup.com",
    },

    update: {},

    create: {
      name: "System Admin",
      email: "admin@gearup.com",
      password: adminPassword,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  const provider = await prisma.user.upsert({
    where: {
      email: "provider@gearup.com",
    },

    update: {},

    create: {
      name: "Demo Provider",
      email: "provider@gearup.com",
      password: providerPassword,
      role: Role.PROVIDER,
      status: UserStatus.ACTIVE,
    },
  });

  const customer = await prisma.user.upsert({
    where: {
      email: "customer@gearup.com",
    },

    update: {},

    create: {
      name: "Demo Customer",
      email: "customer@gearup.com",
      password: customerPassword,
      role: Role.CUSTOMER,
      status: UserStatus.ACTIVE,
    },
  });

  return {
    admin,
    provider,
    customer,
  };
}

async function seedCategories() {
  console.log("📂 Seeding categories...");

  const cycling = await prisma.category.upsert({
    where: {
      slug: "cycling",
    },

    update: {},

    create: {
      name: "Cycling",
      slug: "cycling",
      description: "Cycling gears",
    },
  });

  const camping = await prisma.category.upsert({
    where: {
      slug: "camping",
    },

    update: {},

    create: {
      name: "Camping",
      slug: "camping",
      description: "Camping gears",
    },
  });

  const hiking = await prisma.category.upsert({
    where: {
      slug: "hiking",
    },

    update: {},

    create: {
      name: "Hiking",
      slug: "hiking",
      description: "Hiking gears",
    },
  });

  const fitness = await prisma.category.upsert({
    where: {
      slug: "fitness",
    },

    update: {},

    create: {
      name: "Fitness",
      slug: "fitness",
      description: "Fitness gears",
    },
  });

  const waterSports = await prisma.category.upsert({
    where: {
      slug: "water-sports",
    },

    update: {},

    create: {
      name: "Water Sports",
      slug: "water-sports",
      description: "Water sports gears",
    },
  });

  return {
    cycling,
    camping,
    hiking,
    fitness,
    waterSports,
  };
}

async function seedGear(
  providerId: string,
  categories: {
    cycling: { id: string };
    camping: { id: string };
    hiking: { id: string };
    fitness: { id: string };
    waterSports: { id: string };
  },
) {
  console.log("🚴 Seeding gear items...");

  // Seed বারবার চালালে Duplicate Demo Gear এড়াতে
  // await prisma.gearItem.deleteMany({
  //   where: {
  //     providerId,
  //   },
  // });

  // await prisma.gearItem.createMany({
  //   data: [
  //     {
  //       name: "Mountain Bike",
  //       description: "Professional mountain bike for off-road riding.",
  //       brand: "Trek",
  //       pricePerDay: new Prisma.Decimal(30),
  //       stock: 5,
  //       isAvailable: true,
  //       images: [
  //         "https://images.unsplash.com/photo-1541625602330-2277a4c46182",
  //       ],
  //       providerId,
  //       categoryId: categories.cycling.id,
  //     },

  //     {
  //       name: "Road Bike",
  //       description: "Lightweight road bike for long-distance cycling.",
  //       brand: "Giant",
  //       pricePerDay: new Prisma.Decimal(25),
  //       stock: 4,
  //       isAvailable: true,
  //       images: [
  //         "https://images.unsplash.com/photo-1485965120184-e220f721d03e",
  //       ],
  //       providerId,
  //       categoryId: categories.cycling.id,
  //     },

  //     {
  //       name: "Camping Tent",
  //       description: "4-person waterproof camping tent.",
  //       brand: "Coleman",
  //       pricePerDay: new Prisma.Decimal(20),
  //       stock: 6,
  //       isAvailable: true,
  //       images: [
  //         "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4",
  //       ],
  //       providerId,
  //       categoryId: categories.camping.id,
  //     },

  //     {
  //       name: "Sleeping Bag",
  //       description: "Warm sleeping bag for outdoor adventures.",
  //       brand: "Naturehike",
  //       pricePerDay: new Prisma.Decimal(12),
  //       stock: 8,
  //       isAvailable: true,
  //       images: [
  //         "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
  //       ],
  //       providerId,
  //       categoryId: categories.camping.id,
  //     },

  //     {
  //       name: "Hiking Backpack",
  //       description: "60L hiking backpack with rain cover.",
  //       brand: "Osprey",
  //       pricePerDay: new Prisma.Decimal(15),
  //       stock: 10,
  //       isAvailable: true,
  //       images: [
  //         "https://images.unsplash.com/photo-1517841905240-472988babdf9",
  //       ],
  //       providerId,
  //       categoryId: categories.hiking.id,
  //     },

  //     {
  //       name: "Trekking Pole",
  //       description: "Adjustable aluminum trekking pole.",
  //       brand: "Black Diamond",
  //       pricePerDay: new Prisma.Decimal(8),
  //       stock: 12,
  //       isAvailable: true,
  //       images: [
  //         "https://images.unsplash.com/photo-1522163182402-834f871fd851",
  //       ],
  //       providerId,
  //       categoryId: categories.hiking.id,
  //     },

  //     {
  //       name: "Adjustable Dumbbell",
  //       description: "Adjustable dumbbell for home workouts.",
  //       brand: "Bowflex",
  //       pricePerDay: new Prisma.Decimal(18),
  //       stock: 5,
  //       isAvailable: true,
  //       images: [
  //         "https://images.unsplash.com/photo-1517836357463-d25dfeac3438",
  //       ],
  //       providerId,
  //       categoryId: categories.fitness.id,
  //     },

  //     {
  //       name: "Kayak",
  //       description: "Single-person recreational kayak.",
  //       brand: "Perception",
  //       pricePerDay: new Prisma.Decimal(40),
  //       stock: 3,
  //       isAvailable: true,
  //       images: [
  //         "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
  //       ],
  //       providerId,
  //       categoryId: categories.waterSports.id,
  //     },
  //   ],
  // });

  const createGearIfNotExists = async (data: TSeedGear) => {
    const existingGear = await prisma.gearItem.findFirst({
      where: {
        providerId: data.providerId,
        name: data.name,
      },
    });

    if (!existingGear) {
      await prisma.gearItem.create({
        data,
      });

      console.log(`✅ ${data.name} created`);
    } else {
      console.log(`⏩ ${data.name} already exists`);
    }
  };

  console.log("✅ Gear items seeded.");

  await createGearIfNotExists({
    name: "Mountain Bike",
    description: "Professional mountain bike for off-road riding.",
    brand: "Trek",
    pricePerDay: new Prisma.Decimal(30),
    stock: 5,
    isAvailable: true,
    images: ["https://images.unsplash.com/photo-1541625602330-2277a4c46182"],
    providerId,
    categoryId: categories.cycling.id,
  });

  await createGearIfNotExists({
    name: "Road Bike",
    description: "Lightweight road bike for long-distance cycling.",
    brand: "Giant",
    pricePerDay: new Prisma.Decimal(25),
    stock: 4,
    isAvailable: true,
    images: ["https://images.unsplash.com/photo-1485965120184-e220f721d03e"],
    providerId,
    categoryId: categories.cycling.id,
  });

  await createGearIfNotExists({
    name: "Camping Tent",
    description: "4-person waterproof camping tent.",
    brand: "Coleman",
    pricePerDay: new Prisma.Decimal(20),
    stock: 6,
    isAvailable: true,
    images: ["https://images.unsplash.com/photo-1504280390367-361c6d9f38f4"],
    providerId,
    categoryId: categories.camping.id,
  });

  await createGearIfNotExists({
    name: "Sleeping Bag",
    description: "Warm sleeping bag for outdoor adventures.",
    brand: "Naturehike",
    pricePerDay: new Prisma.Decimal(12),
    stock: 8,
    isAvailable: true,
    images: ["https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"],
    providerId,
    categoryId: categories.camping.id,
  });

  await createGearIfNotExists({
    name: "Hiking Backpack",
    description: "60L hiking backpack with rain cover.",
    brand: "Osprey",
    pricePerDay: new Prisma.Decimal(15),
    stock: 10,
    isAvailable: true,
    images: ["https://images.unsplash.com/photo-1517841905240-472988babdf9"],
    providerId,
    categoryId: categories.hiking.id,
  });

  await createGearIfNotExists({
    name: "Trekking Pole",
    description: "Adjustable aluminum trekking pole.",
    brand: "Black Diamond",
    pricePerDay: new Prisma.Decimal(8),
    stock: 12,
    isAvailable: true,
    images: ["https://images.unsplash.com/photo-1522163182402-834f871fd851"],
    providerId,
    categoryId: categories.hiking.id,
  });

  await createGearIfNotExists({
    name: "Adjustable Dumbbell",
    description: "Adjustable dumbbell for home workouts.",
    brand: "Bowflex",
    pricePerDay: new Prisma.Decimal(18),
    stock: 5,
    isAvailable: true,
    images: ["https://images.unsplash.com/photo-1517836357463-d25dfeac3438"],
    providerId,
    categoryId: categories.fitness.id,
  });

  await createGearIfNotExists({
    name: "Kayak",
    description: "Single-person recreational kayak.",
    brand: "Perception",
    pricePerDay: new Prisma.Decimal(40),
    stock: 3,
    isAvailable: true,
    images: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e"],
    providerId,
    categoryId: categories.waterSports.id,
  });
}

async function main() {
  console.log("🌱 Starting database seeding...\n");

  // Users
  const users = await seedUsers();

  // Categories
  const categories = await seedCategories();

  // Gear
  await seedGear(users.provider.id, categories);

  console.log("\n🎉 Database seeded successfully!\n");

  console.log("=======================================");
  console.log("Demo Credentials");
  console.log("=======================================");

  console.log("\n👑 Admin");
  console.log("Email    : admin@gearup.com");
  console.log("Password : Admin123@");

  console.log("\n🏪 Provider");
  console.log("Email    : provider@gearup.com");
  console.log("Password : Provider123@");

  console.log("\n🙋 Customer");
  console.log("Email    : customer@gearup.com");
  console.log("Password : Customer123@");

  console.log("\n=======================================");
  console.log("Categories : 5");
  console.log("Gear Items : 8");
  console.log("=======================================");
}

main()
  .catch((error) => {
    console.error("\n❌ Seed Failed");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
