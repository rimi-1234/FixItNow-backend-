import { Category, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import prisma from "../../src/lib/prisma.js";

async function main() {
  console.log("Starting database seed...");

  const adminPassword = await bcrypt.hash("Admin@1234", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@fixitnow.com" },
    update: {},
    create: {
      email: "admin@fixitnow.com",
      password: adminPassword,
      role: Role.ADMIN,
      status: "ACTIVE",
    },
  });

  console.log(`Admin created: ${admin.email}`);

  const technicianPassword = await bcrypt.hash("tech123", 12);

  const technician = await prisma.user.upsert({
    where: { email: "technician@fixitnow.com" },
    update: {},
    create: {
      email: "technician@fixitnow.com",
      password: technicianPassword,
      role: Role.TECHNICIAN,
      status: "ACTIVE",
      technicianProfile: {
        create: {
          skills: ["Plumbing", "Electrical", "AC Repair"],
          experience: 5,
          hourlyRate: 25,
          bio: "Experienced home service technician with 5+ years of expertise.",
          location: "Dhaka",
        },
      },
    },
  });

  console.log(`Technician created: ${technician.email}`);

  const customerPassword = await bcrypt.hash("customer123", 12);

  const customer = await prisma.user.upsert({
    where: { email: "customer@fixitnow.com" },
    update: {},
    create: {
      email: "customer@fixitnow.com",
      password: customerPassword,
      role: Role.CUSTOMER,
      status: "ACTIVE",
    },
  });

  console.log(`Customer created: ${customer.email}`);

  const categories = [
    { name: "Plumbing", slug: "plumbing" },
    { name: "Electrical", slug: "electrical" },
    { name: "Cleaning", slug: "cleaning" },
  ];

  const createdCategories: Category[] = [];

  for (const cat of categories) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    createdCategories.push(category);
    console.log(`Category created: ${category.name}`);
  }

  const [plumbing, electrical, cleaning] = createdCategories;
  if (!plumbing || !electrical || !cleaning) {
    throw new Error("Failed to create seed categories");
  }

  const services = [
    {
      name: "Pipe Repair",
      description: "Professional pipe repair and leak fixing service for your home.",
      price: 75,
      categoryId: plumbing.id,
      technicianId: technician.id,
    },
    {
      name: "Electrical Wiring",
      description: "Safe and reliable electrical wiring installation and repair.",
      price: 120,
      categoryId: electrical.id,
      technicianId: technician.id,
    },
    {
      name: "Deep Home Cleaning",
      description: "Thorough deep cleaning service for your entire home.",
      price: 90,
      categoryId: cleaning.id,
      technicianId: technician.id,
    },
  ];

  for (const service of services) {
    const existing = await prisma.service.findFirst({
      where: { name: service.name, technicianId: technician.id },
    });

    if (!existing) {
      const created = await prisma.service.create({ data: service });
      console.log(`Service created: ${created.name} ($${created.price})`);
    } else {
      console.log(`Service already exists: ${service.name}`);
    }
  }

  console.log("\nSeed completed successfully!");
  console.log("\nDefault accounts:");
  console.log("  Admin:      admin@fixitnow.com / Admin@1234");
  console.log("  Technician: technician@fixitnow.com / tech123");
  console.log("  Customer:   customer@fixitnow.com / customer123");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
