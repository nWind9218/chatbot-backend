const { PrismaClient } = require('../generated/prisma');
const { hashPassword } = require('../src/utils/crypto');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  try {
    // Create admin user
    const adminPassword = await hashPassword('admin123456');
    const admin = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        email: 'admin@example.com',
        hashPassword: adminPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
      },
    });
    console.log('✅ Created admin user:', admin.email);

    // Create regular users
    const user1Password = await hashPassword('user123456');
    const user1 = await prisma.user.upsert({
      where: { email: 'user1@example.com' },
      update: {},
      create: {
        email: 'user1@example.com',
        hashPassword: user1Password,
        firstName: 'John',
        lastName: 'Doe',
        role: 'USER',
      },
    });
    console.log('✅ Created user1:', user1.email);

    const user2Password = await hashPassword('user123456');
    const user2 = await prisma.user.upsert({
      where: { email: 'user2@example.com' },
      update: {},
      create: {
        email: 'user2@example.com',
        hashPassword: user2Password,
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'USER',
      },
    });
    console.log('✅ Created user2:', user2.email);

    // Create sample organization
    const organization = await prisma.organization.upsert({
      where: { slug: 'acme-corp' },
      update: {},
      create: {
        name: 'ACME Corporation',
        slug: 'acme-corp',
        description: 'A sample organization for testing',
        creatorId: user1.id,
        planType: 'PRO',
        planExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      },
    });
    console.log('✅ Created organization:', organization.name);

    // Add organization members
    await prisma.organizationMember.upsert({
      where: {
        userId_organizationId: {
          userId: user1.id,
          organizationId: organization.id,
        },
      },
      update: {},
      create: {
        userId: user1.id,
        organizationId: organization.id,
        role: 'OWNER',
      },
    });
    console.log('✅ Added user1 as organization owner');

    await prisma.organizationMember.upsert({
      where: {
        userId_organizationId: {
          userId: user2.id,
          organizationId: organization.id,
        },
      },
      update: {},
      create: {
        userId: user2.id,
        organizationId: organization.id,
        role: 'MEMBER',
      },
    });
    console.log('✅ Added user2 as organization member');

    console.log('🎉 Database seed completed successfully!');
    console.log('\n📧 Test accounts:');
    console.log('  Admin: admin@example.com / admin123456');
    console.log('  User1: user1@example.com / user123456');
    console.log('  User2: user2@example.com / user123456');
    console.log('\n🏢 Test organization: acme-corp');

  } catch (error) {
    console.error('❌ Error during seed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
