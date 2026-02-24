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

    // Create VIP packages
    const vipPackages = [
        {
            name: 'VIP 7 ngày',
            description: 'Gói VIP 7 ngày - Tin đăng được ưu tiên hiển thị',
            durationDays: 7,
            price: 100000,
            priorityLevel: 1,
            features: JSON.stringify({
                highlight: true,
                topPost: true,
                badge: 'VIP 7',
            }),
        },
        {
            name: 'VIP 15 ngày',
            description: 'Gói VIP 15 ngày - Tin đăng được ưu tiên cao',
            durationDays: 15,
            price: 180000,
            priorityLevel: 2,
            features: JSON.stringify({
                highlight: true,
                topPost: true,
                badge: 'VIP 15',
                featured: true,
            }),
        },
        {
            name: 'VIP 30 ngày',
            description: 'Gói VIP 30 ngày - Ưu tiên cao nhất',
            durationDays: 30,
            price: 300000,
            priorityLevel: 3,
            features: JSON.stringify({
                highlight: true,
                topPost: true,
                badge: 'VIP 30',
                featured: true,
                urgent: true,
            }),
        },
    ];

    for (const pkg of vipPackages) {
        const existing = await prisma.vipPackage.findFirst({
            where: { name: pkg.name },
        });

        if (!existing) {
            await prisma.vipPackage.create({
                data: pkg,
            });
        }
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
