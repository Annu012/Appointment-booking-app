import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('Passw0rd!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@example.com',
      passwordHash: adminPassword,
      role: UserRole.admin,
    },
  });
  console.log('👑 Created admin user:', admin.email);

  // Create patient user
  const patientPassword = await bcrypt.hash('Passw0rd!', 12);
  const patient = await prisma.user.upsert({
    where: { email: 'patient@example.com' },
    update: {},
    create: {
      name: 'Patient User',
      email: 'patient@example.com',
      passwordHash: patientPassword,
      role: UserRole.patient,
    },
  });
  console.log('👤 Created patient user:', patient.email);

  // Generate slots for the next 7 days
  const today = new Date();
  const slots = [];

  for (let day = 0; day < 7; day++) {
    const date = new Date(today);
    date.setUTCDate(today.getUTCDate() + day);
    date.setUTCHours(9, 0, 0, 0); // Start at 09:00 UTC

    // Generate 30-minute slots from 09:00 to 17:00 (8 hours = 16 slots)
    for (let hour = 0; hour < 8; hour++) {
      for (let halfHour = 0; halfHour < 2; halfHour++) {
        const startAt = new Date(date);
        startAt.setUTCHours(9 + hour, halfHour * 30, 0, 0);
        
        const endAt = new Date(startAt);
        endAt.setUTCMinutes(startAt.getUTCMinutes() + 30);

        slots.push({
          startAt,
          endAt,
        });
      }
    }
  }

  // Insert slots (delete existing ones first)
  await prisma.slot.deleteMany({});
  const createdSlots = await prisma.slot.createMany({
    data: slots,
  });
  
  console.log(`📅 Created ${createdSlots.count} slots for the next 7 days`);
  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });