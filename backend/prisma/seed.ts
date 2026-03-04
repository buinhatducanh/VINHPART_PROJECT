import '../src/env';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Create PostgreSQL pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Create Prisma adapter
const adapter = new PrismaPg(pool);

// Create Prisma client with adapter
const prisma = new PrismaClient({ adapter });

// Categories data matching Prisma schema
const categories = [
    // Parent categories
    { id: 'electric-system', name: 'Dàn máy điện', slug: 'dan-may-dien', description: 'Hệ thống điện xe máy', parentId: null },
    { id: 'brake-system', name: 'Hệ thống phanh', slug: 'he-thong-phanh', description: 'Má phanh, dầu phanh, đĩa phanh', parentId: null },
    { id: 'engine', name: 'Động cơ', slug: 'dong-co', description: 'Phụ tùng động cơ xe máy', parentId: null },
    { id: 'transmission', name: 'Hệ thống truyền động', slug: 'he-thong-truyen-dong', description: 'Nhông sên dĩa, ly hợp', parentId: null },
    { id: 'wheels-tires', name: 'Bánh xe & Lốp', slug: 'banh-xe-lop', description: 'Lốp xe và mâm', parentId: null },
    { id: 'accessories', name: 'Phụ kiện', slug: 'phu-kien', description: 'Phụ kiện xe máy', parentId: null },

    // Sub-categories - Electric System
    { id: 'lights', name: 'Đèn xe', slug: 'den-xe', description: 'Đèn pha, đèn xi nhan, đèn hậu', parentId: 'electric-system' },
    { id: 'battery', name: 'Acquy & Bình điện', slug: 'acquy-binh-dien', description: 'Bình acquy các loại', parentId: 'electric-system' },
    { id: 'wiring', name: 'Dây điện', slug: 'day-dien', description: 'Dây điện, cáp đề', parentId: 'electric-system' },

    // Sub-categories - Brake System
    { id: 'brake-pads', name: 'Má phanh', slug: 'ma-phanh', description: 'Má phanh các loại', parentId: 'brake-system' },
    { id: 'brake-oil', name: 'Dầu phanh', slug: 'dau-phanh', description: 'Dầu phanh DOT 3, DOT 4', parentId: 'brake-system' },
    { id: 'brake-disc', name: 'Đĩa phanh', slug: 'dia-phanh', description: 'Đĩa phanh xe máy', parentId: 'brake-system' },

    // Sub-categories - Engine
    { id: 'piston', name: 'Xi lanh piston', slug: 'xi-lanh-piston', description: 'Xi lanh, piston các loại', parentId: 'engine' },
    { id: 'air-filter', name: 'Lọc gió', slug: 'loc-gio', description: 'Lọc gió xe máy', parentId: 'engine' },
    { id: 'oil', name: 'Dầu nhớt', slug: 'dau-nhot', description: 'Dầu nhớt xe máy', parentId: 'engine' },

    // Sub-categories - Transmission
    { id: 'chain-sprocket', name: 'Nhông sên dĩa', slug: 'nhong-sen-dia', description: 'Bộ nhông sên dĩa', parentId: 'transmission' },
    { id: 'clutch', name: 'Ly hợp', slug: 'ly-hop', description: 'Bộ ly hợp xe máy', parentId: 'transmission' },

    // Sub-categories - Wheels & Tires
    { id: 'tires', name: 'Lốp xe', slug: 'lop-xe', description: 'Lốp xe các loại', parentId: 'wheels-tires' },
    { id: 'rims', name: 'Mâm xe', slug: 'mam-xe', description: 'Mâm đúc, mâm căm', parentId: 'wheels-tires' },

    // Sub-categories - Accessories
    { id: 'suspension', name: 'Phuộc', slug: 'phuoc', description: 'Phuộc xe máy', parentId: 'accessories' },
    { id: 'exhaust', name: 'Pô xe', slug: 'po-xe', description: 'Pô xe các loại', parentId: 'accessories' },
    { id: 'mirrors', name: 'Gương chiếu hậu', slug: 'guong-chieu-hau', description: 'Gương xe máy', parentId: 'accessories' },
];

// Products data matching Prisma schema
const products = [
    // ========== DÀN MÁY ĐIỆN ==========
    {
        name: 'Đèn pha LED M5 siêu sáng 6000K',
        slug: 'den-pha-led-m5-sieu-sang-6000k',
        description: 'Đèn pha LED công nghệ Nhật, ánh sáng trắng 6000K, độ sáng 3200 Lumen, tiết kiệm điện năng. Tương thích: Honda Winner X, Wave, Blade (110cc - 150cc)',
        price: 320000,
        salePrice: 256000,
        sku: 'E001',
        stock: 50,
        images: ['https://placehold.co/600x400?text=Den+Pha+LED+M5'],
        categoryId: 'lights',
        brand: 'M5',
        isActive: true,
        isFeatured: true,
    },
    {
        name: 'Đèn xi nhan LED ánh sáng vàng',
        slug: 'den-xi-nhan-led-anh-sang-vang',
        description: 'Đèn xi nhan LED chớp nhanh, thiết kế thể thao, chống nước chuẩn IP67. Tương thích: Yamaha Exciter 155, Jupiter (135cc - 155cc)',
        price: 180000,
        salePrice: null,
        sku: 'E002',
        stock: 80,
        images: ['https://placehold.co/600x400?text=Den+Xi+Nhan+LED'],
        categoryId: 'lights',
        brand: 'Generic',
        isActive: true,
        isFeatured: false,
    },
    {
        name: 'Đèn hậu LED 3 chế độ',
        slug: 'den-hau-led-3-che-do',
        description: 'Đèn hậu LED cao cấp với 3 chế độ: hậu, phanh, xi nhan. Thiết kế đẹp mắt. Tương thích: Honda SH, PCX, Vision (125cc - 150cc)',
        price: 450000,
        salePrice: 369000,
        sku: 'E003',
        stock: 35,
        images: ['https://placehold.co/600x400?text=Den+Hau+LED'],
        categoryId: 'lights',
        brand: 'Generic',
        isActive: true,
        isFeatured: true,
    },
    {
        name: 'Bình acquy khô GS 12V 5Ah',
        slug: 'binh-acquy-kho-gs-12v-5ah',
        description: 'Acquy khô công nghệ Nhật Bản, bảo hành 12 tháng, khởi động êm ái. Tương thích: Honda Wave, Blade, Future (100cc - 125cc)',
        price: 380000,
        salePrice: null,
        sku: 'E004',
        stock: 45,
        images: ['https://placehold.co/600x400?text=Acquy+GS+12V'],
        categoryId: 'battery',
        brand: 'GS',
        isActive: true,
        isFeatured: false,
    },
    {
        name: 'Bình acquy Lithium ion 12V 7Ah',
        slug: 'binh-acquy-lithium-ion-12v-7ah',
        description: 'Acquy Lithium ion siêu nhẹ, tuổi thọ cao, sạc nhanh, công nghệ cao cấp. Tương thích: Yamaha Exciter 155, NVX (150cc - 155cc)',
        price: 1250000,
        salePrice: 1037500,
        sku: 'E005',
        stock: 20,
        images: ['https://placehold.co/600x400?text=Acquy+Lithium+12V'],
        categoryId: 'battery',
        brand: 'Lithium Pro',
        isActive: true,
        isFeatured: true,
    },
    {
        name: 'Bộ dây điện zin theo xe Winner X',
        slug: 'bo-day-dien-zin-theo-xe-winner-x',
        description: 'Bộ dây điện chính hãng, đầy đủ cổng kết nối, chống nước tốt. Tương thích: Honda Winner X (150cc)',
        price: 650000,
        salePrice: null,
        sku: 'E006',
        stock: 15,
        images: ['https://placehold.co/600x400?text=Day+Dien+Winner+X'],
        categoryId: 'wiring',
        brand: 'Honda',
        isActive: true,
        isFeatured: false,
    },

    // ========== HỆ THỐNG PHANH ==========
    {
        name: 'Má phanh Honda Winner X chính hãng',
        slug: 'ma-phanh-honda-winner-x-chinh-hang',
        description: 'Má phanh chính hãng Honda, độ bám tốt, ít bụi, tuổi thọ cao. Tương thích: Honda Winner X, CBR150 (150cc)',
        price: 280000,
        salePrice: null,
        sku: 'B001',
        stock: 60,
        images: ['https://placehold.co/600x400?text=Ma+Phanh+Honda'],
        categoryId: 'brake-pads',
        brand: 'Honda',
        isActive: true,
        isFeatured: false,
    },
    {
        name: 'Má phanh Racing Boy Ceramic',
        slug: 'ma-phanh-racing-boy-ceramic',
        description: 'Má phanh ceramic cao cấp, lực phanh mạnh, ít ồn, tản nhiệt tốt. Tương thích: Yamaha Exciter 155, R15 (150cc - 155cc)',
        price: 420000,
        salePrice: 352800,
        sku: 'B002',
        stock: 40,
        images: ['https://placehold.co/600x400?text=Ma+Phanh+RCB'],
        categoryId: 'brake-pads',
        brand: 'Racing Boy',
        isActive: true,
        isFeatured: true,
    },
    {
        name: 'Dầu phanh Motul DOT 4 RBF 660',
        slug: 'dau-phanh-motul-dot-4-rbf-660',
        description: 'Dầu phanh cao cấp Motul, điểm sôi khô 325°C, chịu nhiệt tốt. Tương thích: Tất cả dòng xe',
        price: 180000,
        salePrice: null,
        sku: 'B003',
        stock: 100,
        images: ['https://placehold.co/600x400?text=Dau+Phanh+Motul'],
        categoryId: 'brake-oil',
        brand: 'Motul',
        isActive: true,
        isFeatured: false,
    },
    {
        name: 'Đĩa phanh Brembo Racing 260mm',
        slug: 'dia-phanh-brembo-racing-260mm',
        description: 'Đĩa phanh thể thao cao cấp, khả năng tản nhiệt vượt trội, lực phanh mạnh. Tương thích: Yamaha Exciter 155 (155cc)',
        price: 1000000,
        salePrice: 800000,
        sku: 'B005',
        stock: 25,
        images: ['https://placehold.co/600x400?text=Dia+Phanh+Brembo'],
        categoryId: 'brake-disc',
        brand: 'Brembo',
        isActive: true,
        isFeatured: true,
    },

    // ========== ĐỘNG CƠ ==========
    {
        name: 'Xi lanh piston STD Racing Winner X',
        slug: 'xi-lanh-piston-std-racing-winner-x',
        description: 'Xi lanh piston cao cấp, tăng hiệu suất động cơ, độ bền cao. Tương thích: Honda Winner X (150cc)',
        price: 980000,
        salePrice: null,
        sku: 'M001',
        stock: 20,
        images: ['https://placehold.co/600x400?text=Xi+Lanh+Piston'],
        categoryId: 'piston',
        brand: 'STD Racing',
        isActive: true,
        isFeatured: false,
    },
    {
        name: 'Bộ piston Takasago 62mm Exciter',
        slug: 'bo-piston-takasago-62mm-exciter',
        description: 'Bộ piston Takasago chính hãng, độ chính xác cao, tản nhiệt tốt. Tương thích: Yamaha Exciter 155 (155cc)',
        price: 650000,
        salePrice: 539500,
        sku: 'M002',
        stock: 30,
        images: ['https://placehold.co/600x400?text=Piston+Takasago'],
        categoryId: 'piston',
        brand: 'Takasago',
        isActive: true,
        isFeatured: true,
    },
    {
        name: 'Lọc gió DNA Racing cao cấp',
        slug: 'loc-gio-dna-racing-cao-cap',
        description: 'Lọc gió hiệu suất cao, tăng công suất động cơ, có thể giặt sử dụng lại. Tương thích: Honda Winner X, CBR150 (150cc)',
        price: 650000,
        salePrice: null,
        sku: 'M003',
        stock: 35,
        images: ['https://placehold.co/600x400?text=Loc+Gio+DNA'],
        categoryId: 'air-filter',
        brand: 'DNA Racing',
        isActive: true,
        isFeatured: true,
    },
    {
        name: 'Dầu nhớt Motul 7100 10W40',
        slug: 'dau-nhot-motul-7100-10w40',
        description: 'Dầu nhớt cao cấp cho xe máy thể thao, bảo vệ tối ưu động cơ. Tương thích: Honda Winner X, CBR150 (150cc)',
        price: 196000,
        salePrice: 156800,
        sku: 'M005',
        stock: 200,
        images: ['https://placehold.co/600x400?text=Nhot+Motul+7100'],
        categoryId: 'oil',
        brand: 'Motul',
        isActive: true,
        isFeatured: true,
    },
    {
        name: 'Dầu nhớt Shell Advance AX7 10W40',
        slug: 'dau-nhot-shell-advance-ax7-10w40',
        description: 'Dầu nhớt bán tổng hợp Shell, bảo vệ động cơ hiệu quả. Tương thích: Yamaha Exciter 155, Jupiter (135cc - 155cc)',
        price: 165000,
        salePrice: null,
        sku: 'M006',
        stock: 180,
        images: ['https://placehold.co/600x400?text=Nhot+Shell+AX7'],
        categoryId: 'oil',
        brand: 'Shell',
        isActive: true,
        isFeatured: false,
    },
    {
        name: 'Dầu nhớt Castrol Power1 4T 15W50',
        slug: 'dau-nhot-castrol-power1-4t-15w50',
        description: 'Dầu nhớt khoáng chất cao cấp, phù hợp xe số thông dụng. Tương thích: Honda Wave, Blade, Future (100cc - 125cc)',
        price: 135000,
        salePrice: null,
        sku: 'M007',
        stock: 150,
        images: ['https://placehold.co/600x400?text=Nhot+Castrol+Power1'],
        categoryId: 'oil',
        brand: 'Castrol',
        isActive: true,
        isFeatured: false,
    },

    // ========== HỆ THỐNG TRUYỀN ĐỘNG ==========
    {
        name: 'Bộ nhông sên dĩa DID Gold',
        slug: 'bo-nhong-sen-dia-did-gold',
        description: 'Bộ nhông sên dĩa cao cấp DID, độ bền vượt trội, mạ vàng chống gỉ. Tương thích: Yamaha Exciter 155 (155cc)',
        price: 1450000,
        salePrice: null,
        sku: 'T001',
        stock: 18,
        images: ['https://placehold.co/600x400?text=Nhong+Sen+Dia+DID'],
        categoryId: 'chain-sprocket',
        brand: 'DID',
        isActive: true,
        isFeatured: true,
    },
    {
        name: 'Sên RK Racing 428 Winner X',
        slug: 'sen-rk-racing-428-winner-x',
        description: 'Sên cao cấp RK Racing, O-ring seal, tuổi thọ cao. Tương thích: Honda Winner X (150cc)',
        price: 680000,
        salePrice: 578000,
        sku: 'T002',
        stock: 25,
        images: ['https://placehold.co/600x400?text=Sen+RK+Racing'],
        categoryId: 'chain-sprocket',
        brand: 'RK Racing',
        isActive: true,
        isFeatured: false,
    },
    {
        name: 'Ly hợp chính hãng Winner X',
        slug: 'ly-hop-chinh-hang-winner-x',
        description: 'Bộ ly hợp chính hãng Honda, vận hành êm ái, tuổi thọ cao. Tương thích: Honda Winner X (150cc)',
        price: 520000,
        salePrice: null,
        sku: 'T003',
        stock: 22,
        images: ['https://placehold.co/600x400?text=Ly+Hop+Winner+X'],
        categoryId: 'clutch',
        brand: 'Honda',
        isActive: true,
        isFeatured: false,
    },

    // ========== BÁNH XE & LỐP ==========
    {
        name: 'Lốp Michelin Pilot Street 2 80/90-17',
        slug: 'lop-michelin-pilot-street-2-80-90-17',
        description: 'Lốp xe chất lượng cao Michelin, độ bền vượt trội cho đường phố. Tương thích: Honda Winner X, Wave, Blade (110cc - 150cc)',
        price: 580000,
        salePrice: null,
        sku: 'W001',
        stock: 50,
        images: ['https://placehold.co/600x400?text=Lop+Michelin'],
        categoryId: 'tires',
        brand: 'Michelin',
        isActive: true,
        isFeatured: true,
    },
    {
        name: 'Lốp Dunlop TT93 GP 90/80-17',
        slug: 'lop-dunlop-tt93-gp-90-80-17',
        description: 'Lốp thể thao Dunlop, độ bám tốt trên mọi địa hình. Tương thích: Yamaha Exciter 155 (155cc)',
        price: 720000,
        salePrice: 612000,
        sku: 'W002',
        stock: 40,
        images: ['https://placehold.co/600x400?text=Lop+Dunlop'],
        categoryId: 'tires',
        brand: 'Dunlop',
        isActive: true,
        isFeatured: true,
    },
    {
        name: 'Mâm đúc Brembo 17 inch Exciter',
        slug: 'mam-duc-brembo-17-inch-exciter',
        description: 'Mâm đúc cao cấp Brembo, nhẹ, cứng, thiết kế thể thao. Tương thích: Yamaha Exciter 155 (155cc)',
        price: 3800000,
        salePrice: 3192000,
        sku: 'W004',
        stock: 8,
        images: ['https://placehold.co/600x400?text=Mam+Brembo'],
        categoryId: 'rims',
        brand: 'Brembo',
        isActive: true,
        isFeatured: true,
    },
    {
        name: 'Mâm đúc Racing Boy Winner X',
        slug: 'mam-duc-racing-boy-winner-x',
        description: 'Mâm đúc Racing Boy, thiết kế 5 chấu thể thao, nhẹ, bền. Tương thích: Honda Winner X (150cc)',
        price: 2950000,
        salePrice: null,
        sku: 'W005',
        stock: 12,
        images: ['https://placehold.co/600x400?text=Mam+RCB'],
        categoryId: 'rims',
        brand: 'Racing Boy',
        isActive: true,
        isFeatured: false,
    },

    // ========== PHỤ KIỆN ==========
    {
        name: 'Phuộc YSS Racing DTG',
        slug: 'phuoc-yss-racing-dtg',
        description: 'Phuộc cao cấp YSS, điều chỉnh được, tăng khả năng vận hành. Tương thích: Honda Winner X, CBR150 (150cc)',
        price: 4250000,
        salePrice: null,
        sku: 'A001',
        stock: 10,
        images: ['https://placehold.co/600x400?text=Phuoc+YSS'],
        categoryId: 'suspension',
        brand: 'YSS',
        isActive: true,
        isFeatured: true,
    },
    {
        name: 'Phuộc Ohlins TTX GP Exciter',
        slug: 'phuoc-ohlins-ttx-gp-exciter',
        description: 'Phuộc cao cấp nhất Ohlins, công nghệ GP, điều chỉnh toàn diện. Tương thích: Yamaha Exciter 155 (155cc)',
        price: 12500000,
        salePrice: 11125000,
        sku: 'A002',
        stock: 5,
        images: ['https://placehold.co/600x400?text=Phuoc+Ohlins'],
        categoryId: 'suspension',
        brand: 'Ohlins',
        isActive: true,
        isFeatured: true,
    },
    {
        name: 'Pô Akrapovic Carbon Winner X',
        slug: 'po-akrapovic-carbon-winner-x',
        description: 'Pô Akrapovic Carbon, giảm trọng lượng, tăng công suất, âm thanh hay. Tương thích: Honda Winner X (150cc)',
        price: 5800000,
        salePrice: 5162000,
        sku: 'A003',
        stock: 8,
        images: ['https://placehold.co/600x400?text=Po+Akrapovic'],
        categoryId: 'exhaust',
        brand: 'Akrapovic',
        isActive: true,
        isFeatured: true,
    },
    {
        name: 'Pô Yoshimura R77 Exciter',
        slug: 'po-yoshimura-r77-exciter',
        description: 'Pô Yoshimura R77, thiết kế thể thao, tăng hiệu suất động cơ. Tương thích: Yamaha Exciter 155 (155cc)',
        price: 4200000,
        salePrice: null,
        sku: 'A004',
        stock: 10,
        images: ['https://placehold.co/600x400?text=Po+Yoshimura'],
        categoryId: 'exhaust',
        brand: 'Yoshimura',
        isActive: true,
        isFeatured: false,
    },
    {
        name: 'Gương chiếu hậu Rizoma Spy-R',
        slug: 'guong-chieu-hau-rizoma-spy-r',
        description: 'Gương Rizoma thiết kế đẹp mắt, tầm nhìn rộng, chất lượng cao. Tương thích: Honda Winner X, CBR150 (150cc)',
        price: 1850000,
        salePrice: 1554000,
        sku: 'A006',
        stock: 15,
        images: ['https://placehold.co/600x400?text=Guong+Rizoma'],
        categoryId: 'mirrors',
        brand: 'Rizoma',
        isActive: true,
        isFeatured: true,
    },
    {
        name: 'Gương chiếu hậu CNC nhôm nguyên khối',
        slug: 'guong-chieu-hau-cnc-nhom-nguyen-khoi',
        description: 'Gương CNC nhôm nguyên khối, gọn nhẹ, thể thao. Tương thích: Yamaha Exciter 155 (155cc)',
        price: 680000,
        salePrice: null,
        sku: 'A007',
        stock: 30,
        images: ['https://placehold.co/600x400?text=Guong+CNC'],
        categoryId: 'mirrors',
        brand: 'CNC',
        isActive: true,
        isFeatured: false,
    },
    {
        name: 'Gương chiếu hậu KOSO Arrow',
        slug: 'guong-chieu-hau-koso-arrow',
        description: 'Gương KOSO Arrow, tích hợp đèn xi nhan LED, thiết kế hiện đại. Tương thích: Honda SH, PCX, Vision (125cc - 150cc)',
        price: 950000,
        salePrice: null,
        sku: 'A008',
        stock: 25,
        images: ['https://placehold.co/600x400?text=Guong+KOSO'],
        categoryId: 'mirrors',
        brand: 'KOSO',
        isActive: true,
        isFeatured: false,
    },
];

async function main() {
    console.log('🌱 Starting database seeding...\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
    console.log('✅ Existing data cleared\n');

    // Seed categories (parent first, then children)
    console.log('📁 Seeding categories...');
    const parentCategories = categories.filter(c => c.parentId === null);
    const childCategories = categories.filter(c => c.parentId !== null);

    for (const cat of parentCategories) {
        await prisma.category.create({
            data: {
                id: cat.id,
                name: cat.name,
                slug: cat.slug,
                description: cat.description,
            },
        });
    }
    console.log(`  ✅ Created ${parentCategories.length} parent categories`);

    for (const cat of childCategories) {
        await prisma.category.create({
            data: {
                id: cat.id,
                name: cat.name,
                slug: cat.slug,
                description: cat.description,
                parentId: cat.parentId,
            },
        });
    }
    console.log(`  ✅ Created ${childCategories.length} child categories`);

    // Seed products
    console.log('\n📦 Seeding products...');
    for (const product of products) {
        await prisma.product.create({
            data: {
                name: product.name,
                slug: product.slug,
                description: product.description,
                price: product.price,
                salePrice: product.salePrice,
                sku: product.sku,
                stock: product.stock,
                images: product.images,
                categoryId: product.categoryId,
                brand: product.brand,
                isActive: product.isActive,
                isFeatured: product.isFeatured,
            },
        });
    }
    console.log(`  ✅ Created ${products.length} products`);

    // Create admin user
    console.log('\n👤 Creating admin user...');
    await prisma.user.create({
        data: {
            email: 'admin@vinhpart.vn',
            name: 'Admin VinhPart',
            // password: admin123 (Generated 2026-02-08)
            password: 'eac12dbbc58891c557034414c59cf6b7:a2b04ca31a760d827315ac80a37fad48e23b2f43a477a493e19ebcd1c6856267dc057f1ca43324b65677147b2ef7e6630290be65dc9761d0ada8493f1531d00d',
            role: 'ADMIN',
        },
    });
    console.log('  ✅ Admin user created (email: admin@vinhpart.vn, password: admin123)');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log(`   - ${categories.length} categories`);
    console.log(`   - ${products.length} products`);
    console.log(`   - 1 admin user`);
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
