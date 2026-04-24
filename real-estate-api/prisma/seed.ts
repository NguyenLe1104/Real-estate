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
    const categories: Array<{ code: string; name: string; categoryType: 'HOUSE' | 'LAND' }> = [
        { code: 'HOUSE', name: 'Nhà ở', categoryType: 'HOUSE' },
        { code: 'VILLA', name: 'Biệt thự', categoryType: 'HOUSE' },
        { code: 'APARTMENT', name: 'Chung cư', categoryType: 'HOUSE' },
        { code: 'TOWNHOUSE', name: 'Nhà phố', categoryType: 'HOUSE' },
        { code: 'RESLAND', name: 'Đất ở', categoryType: 'LAND' },
        { code: 'COMLAND', name: 'Đất thương mại', categoryType: 'LAND' },
        { code: 'AGRLAND', name: 'Đất nông nghiệp', categoryType: 'LAND' },
        { code: 'INDLAND', name: 'Đất công nghiệp', categoryType: 'LAND' },
    ];

    for (const cat of categories) {
        await prisma.propertyCategory.upsert({
            where: { code: cat.code },
            update: { name: cat.name, categoryType: cat.categoryType },
            create: cat,
        });
    }

    // Create VIP packages
    const vipPackages = [
        {
            name: 'Đăng tin 1 lần (10k)',
            description: 'Đăng tin 1 bài viết được ưu tiên hiển thị - 10.000đ/lần',
            durationDays: 1,
            price: 10000,
            priorityLevel: 0,
            features: JSON.stringify({
                singlePost: true,
                highlight: true,
                badge: 'NỔIBẬT',
            }),
        },
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

    // ==================== Create 20 employees ====================
    const employeeData = [
        { username: 'emp01', fullName: 'Nguyễn Văn An',     email: 'nvan.an@realestate.com',       phone: '0901111001', code: 'EMP001', city: 'Đà Nẵng' },
        { username: 'emp02', fullName: 'Trần Thị Bảo',      email: 'tthi.bao@realestate.com',      phone: '0901111002', code: 'EMP002', city: 'Đà Nẵng' },
        { username: 'emp03', fullName: 'Lê Minh Cường',     email: 'lm.cuong@realestate.com',      phone: '0901111003', code: 'EMP003', city: 'Đà Nẵng' },
        { username: 'emp04', fullName: 'Phạm Thị Dung',     email: 'pthi.dung@realestate.com',     phone: '0901111004', code: 'EMP004', city: 'Đà Nẵng' },
        { username: 'emp05', fullName: 'Hoàng Văn Em',      email: 'hvan.em@realestate.com',       phone: '0901111005', code: 'EMP005', city: 'Đà Nẵng' },
        { username: 'emp06', fullName: 'Vũ Thị Phương',     email: 'vthi.phuong@realestate.com',   phone: '0901111006', code: 'EMP006', city: 'Đà Nẵng' },
        { username: 'emp07', fullName: 'Đặng Quốc Hùng',    email: 'dq.hung@realestate.com',       phone: '0901111007', code: 'EMP007', city: 'Đà Nẵng' },
        { username: 'emp08', fullName: 'Bùi Thị Lan',       email: 'bthi.lan@realestate.com',      phone: '0901111008', code: 'EMP008', city: 'Đà Nẵng' },
        { username: 'emp09', fullName: 'Trương Văn Mạnh',   email: 'tv.manh@realestate.com',       phone: '0901111009', code: 'EMP009', city: 'Đà Nẵng' },
        { username: 'emp10', fullName: 'Ngô Thị Nhi',       email: 'nthi.nhi@realestate.com',      phone: '0901111010', code: 'EMP010', city: 'Đà Nẵng' },
        { username: 'emp11', fullName: 'Lý Văn Oanh',       email: 'lv.oanh@realestate.com',       phone: '0901111011', code: 'EMP011', city: 'Đà Nẵng' },
        { username: 'emp12', fullName: 'Đinh Thị Phượng',   email: 'dthi.phuong2@realestate.com',  phone: '0901111012', code: 'EMP012', city: 'Đà Nẵng' },
        { username: 'emp13', fullName: 'Cao Văn Quang',     email: 'cv.quang@realestate.com',      phone: '0901111013', code: 'EMP013', city: 'Đà Nẵng' },
        { username: 'emp14', fullName: 'Tô Thị Ry',         email: 'tthi.ry@realestate.com',       phone: '0901111014', code: 'EMP014', city: 'Đà Nẵng' },
        { username: 'emp15', fullName: 'Dương Văn Sơn',     email: 'dv.son@realestate.com',        phone: '0901111015', code: 'EMP015', city: 'Đà Nẵng' },
        { username: 'emp16', fullName: 'Lưu Thị Thủy',      email: 'lthi.thuy@realestate.com',     phone: '0901111016', code: 'EMP016', city: 'Đà Nẵng' },
        { username: 'emp17', fullName: 'Phan Văn Uy',       email: 'pv.uy@realestate.com',         phone: '0901111017', code: 'EMP017', city: 'Đà Nẵng' },
        { username: 'emp18', fullName: 'Hồ Thị Vân',        email: 'hthi.van@realestate.com',      phone: '0901111018', code: 'EMP018', city: 'Đà Nẵng' },
        { username: 'emp19', fullName: 'Mai Văn Xuân',      email: 'mv.xuan@realestate.com',       phone: '0901111019', code: 'EMP019', city: 'Đà Nẵng' },
        { username: 'emp20', fullName: 'Võ Thị Yến',        email: 'vthi.yen@realestate.com',      phone: '0901111020', code: 'EMP020', city: 'Đà Nẵng' },
    ];

    const createdEmployees: { id: number; code: string }[] = [];

    for (const emp of employeeData) {
        const hashPassEmp = await bcrypt.hash('employee123', 10);
        const empUser = await prisma.user.upsert({
            where: { username: emp.username },
            update: {},
            create: {
                username: emp.username,
                password: hashPassEmp,
                fullName: emp.fullName,
                email: emp.email,
                phone: emp.phone,
                status: 1,
            },
        });

        await prisma.userRole.upsert({
            where: { userId_roleId: { userId: empUser.id, roleId: employeeRole.id } },
            update: {},
            create: { userId: empUser.id, roleId: employeeRole.id },
        });

        const employee = await prisma.employee.upsert({
            where: { code: emp.code },
            update: {},
            create: {
                code: emp.code,
                userId: empUser.id,
                startDate: new Date('2024-01-01'),
                city: emp.city,
                isActive: true,
            },
        });

        createdEmployees.push({ id: employee.id, code: emp.code });
    }

    console.log(`Created ${createdEmployees.length} employees`);

    // ==================== Assign employees to existing houses ====================
    const allHouses = await prisma.house.findMany({ select: { id: true }, orderBy: { id: 'asc' } });
    if (allHouses.length > 0) {
        console.log(`Assigning employees to ${allHouses.length} houses...`);
        for (let i = 0; i < allHouses.length; i++) {
            const emp = createdEmployees[i % createdEmployees.length];
            await prisma.house.update({
                where: { id: allHouses[i].id },
                data: { employeeId: emp.id },
            });
        }
        console.log('Houses assigned.');
    }

    // ==================== Assign employees to existing lands ====================
    const allLands = await prisma.land.findMany({ select: { id: true }, orderBy: { id: 'asc' } });
    if (allLands.length > 0) {
        console.log(`Assigning employees to ${allLands.length} lands...`);
        for (let i = 0; i < allLands.length; i++) {
            // offset by 3 so land assignments start from a different employee than houses
            const emp = createdEmployees[(i + 3) % createdEmployees.length];
            await prisma.land.update({
                where: { id: allLands[i].id },
                data: { employeeId: emp.id },
            });
        }
        console.log('Lands assigned.');
    }

    // Create customers
    const customerData = [
        { username: 'cus01', fullName: 'Phạm Thị Dung', email: 'pthi.dung@gmail.com', phone: '0912221001', code: 'CUS001' },
        { username: 'cus02', fullName: 'Hoàng Văn Em', email: 'hvan.em@gmail.com', phone: '0912221002', code: 'CUS002' },
        { username: 'cus03', fullName: 'Vũ Thị Phương', email: 'vthi.phuong@gmail.com', phone: '0912221003', code: 'CUS003' },
    ];

    for (const cus of customerData) {
        const hashPassCus = await bcrypt.hash('customer123', 10);
        const cusUser = await prisma.user.upsert({
            where: { username: cus.username },
            update: {},
            create: {
                username: cus.username,
                password: hashPassCus,
                fullName: cus.fullName,
                email: cus.email,
                phone: cus.phone,
                status: 1,
            },
        });

        await prisma.userRole.upsert({
            where: { userId_roleId: { userId: cusUser.id, roleId: customerRole.id } },
            update: {},
            create: { userId: cusUser.id, roleId: customerRole.id },
        });

        await prisma.customer.upsert({
            where: { code: cus.code },
            update: {},
            create: {
                code: cus.code,
                userId: cusUser.id,
            },
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
