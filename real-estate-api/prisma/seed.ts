import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // Create roles
    const adminRole = await prisma.role.upsert({
        where: { code: 'ADMIN' },
        update: {},
        create: { code: 'ADMIN', name: 'Administrator', description: 'Full system access' },
    });

    const employeeRole = await prisma.role.upsert({
        where: { code: 'EMPLOYEE' },
        update: {},
        create: { code: 'EMPLOYEE', name: 'Employee', description: 'Staff member' },
    });

    const customerRole = await prisma.role.upsert({
        where: { code: 'CUSTOMER' },
        update: {},
        create: { code: 'CUSTOMER', name: 'Customer', description: 'Regular customer' },
    });

    // Create admin user
    const hashPass = await bcrypt.hash('admin123', 10);
    const adminUser = await prisma.user.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            password: hashPass,
            fullName: 'System Admin',
            email: 'admin@realestate.com',
            phone: '0123456789',
            status: 1,
        },
    });

    await prisma.userRole.upsert({
        where: { userId_roleId: { userId: adminUser.id, roleId: adminRole.id } },
        update: {},
        create: { userId: adminUser.id, roleId: adminRole.id },
    });

    // Create property categories
    const categories = [
        { code: 'HOUSE', name: 'House' },
        { code: 'VILLA', name: 'Villa' },
        { code: 'APARTMENT', name: 'Apartment' },
        { code: 'TOWNHOUSE', name: 'Townhouse' },
        { code: 'RESLAND', name: 'Residential Land' },
        { code: 'COMLAND', name: 'Commercial Land' },
        { code: 'AGRLAND', name: 'Agricultural Land' },
        { code: 'INDLAND', name: 'Industrial Land' },
    ];

    for (const cat of categories) {
        await prisma.propertyCategory.upsert({
            where: { code: cat.code },
            update: {},
            create: cat,
        });
    }

    console.log('Seed completed successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
