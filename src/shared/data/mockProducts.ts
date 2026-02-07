import { Product, Category } from '@/shared/types';

// Cấu trúc danh mục phân cấp (chỉ xe máy)
export const hierarchicalCategories = [
  {
    id: 'electric-system',
    name: 'Dàn máy điện',
    parent_id: null,
    children: [
      { id: 'lights', name: 'Đèn xe', parent_id: 'electric-system' },
      { id: 'battery', name: 'Acquy & Bình điện', parent_id: 'electric-system' },
      { id: 'wiring', name: 'Dây điện', parent_id: 'electric-system' },
    ]
  },
  {
    id: 'brake-system',
    name: 'Hệ thống phanh',
    parent_id: null,
    children: [
      { id: 'brake-pads', name: 'Má phanh', parent_id: 'brake-system' },
      { id: 'brake-oil', name: 'Dầu phanh', parent_id: 'brake-system' },
      { id: 'brake-disc', name: 'Đĩa phanh', parent_id: 'brake-system' },
    ]
  },
  {
    id: 'engine',
    name: 'Động cơ',
    parent_id: null,
    children: [
      { id: 'piston', name: 'Xi lanh piston', parent_id: 'engine' },
      { id: 'air-filter', name: 'Lọc gió', parent_id: 'engine' },
      { id: 'oil', name: 'Dầu nhớt', parent_id: 'engine' },
    ]
  },
  {
    id: 'transmission',
    name: 'Hệ thống truyền động',
    parent_id: null,
    children: [
      { id: 'chain-sprocket', name: 'Nhông sên dĩa', parent_id: 'transmission' },
      { id: 'clutch', name: 'Ly h��p', parent_id: 'transmission' },
    ]
  },
  {
    id: 'wheels-tires',
    name: 'Bánh xe & Lốp',
    parent_id: null,
    children: [
      { id: 'tires', name: 'Lốp xe', parent_id: 'wheels-tires' },
      { id: 'rims', name: 'Mâm xe', parent_id: 'wheels-tires' },
    ]
  },
  {
    id: 'accessories',
    name: 'Phụ kiện',
    parent_id: null,
    children: [
      { id: 'suspension', name: 'Phuộc', parent_id: 'accessories' },
      { id: 'exhaust', name: 'Pô xe', parent_id: 'accessories' },
      { id: 'mirrors', name: 'Gương chiếu hậu', parent_id: 'accessories' },
    ]
  },
];

// Danh mục cũ để tương thích
export const categories: Category[] = [
  {
    id: 'motorcycle',
    name: 'Phụ tùng xe máy',
    subCategories: [
      'Dầu nhớt xe máy',
      'Đĩa phanh xe máy',
      'Bánh / mâm xe máy',
      'Xi lanh xe máy',
      'Lọc gió',
      'Nhông sên dĩa'
    ],
    order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'engine',
    name: 'Động cơ',
    subCategories: [],
    order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'brake',
    name: 'Phanh',
    subCategories: [],
    order: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'tire',
    name: 'Lốp',
    subCategories: [],
    order: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'accessories',
    name: 'Phụ kiện',
    subCategories: [],
    order: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'promotion',
    name: 'Khuyến mãi',
    subCategories: [],
    order: 6,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const mockProducts: Product[] = [
  // ========== DÀN MÁY ĐIỆN ==========
  // Đèn xe
  {
    product_id: 'E001',
    product_name: 'Đèn pha LED M5 siêu sáng 6000K',
    category: 'electric-system',
    sub_category: 'lights',
    vehicle_type: 'Motorbike',
    compatible_brand: 'Honda',
    compatible_model: 'Winner X, Wave, Blade',
    engine_capacity: '110cc - 150cc',
    price: 320000,
    original_price: 400000,
    discount_percentage: 20,
    stock_status: 'in_stock',
    description: 'Đèn pha LED công nghệ Nhật, ánh sáng trắng 6000K, độ sáng 3200 Lumen, tiết kiệm điện năng',
    product_image: 'motorcycle LED headlight white bright',
    tags: ['led', 'bright', 'energy-saving', 'sale']
  },
  {
    product_id: 'E002',
    product_name: 'Đèn xi nhan LED anh sáng vàng',
    category: 'electric-system',
    sub_category: 'lights',
    vehicle_type: 'Motorbike',
    compatible_brand: 'Yamaha',
    compatible_model: 'Exciter 155, Jupiter',
    engine_capacity: '135cc - 155cc',
    price: 180000,
    stock_status: 'in_stock',
    description: 'Đèn xi nhan LED chớp nhanh, thiết kế thể thao, chống nước chuẩn IP67',
    product_image: 'motorcycle turn signal LED yellow',
    tags: ['led', 'waterproof', 'sporty']
  },
  {
    product_id: 'E003',
    product_name: 'Đèn hậu LED 3 chế độ',
    category: 'electric-system',
    sub_category: 'lights',
    vehicle_type: 'Motorbike',
    compatible_brand: 'Honda',
    compatible_model: 'SH, PCX, Vision',
    engine_capacity: '125cc - 150cc',
    price: 450000,
    original_price: 550000,
    discount_percentage: 18,
    stock_status: 'in_stock',
    description: 'Đèn hậu LED cao cấp với 3 chế độ: hậu, phanh, xi nhan. Thiết kế đẹp mắt',
    product_image: 'motorcycle tail light LED red',
    tags: ['led', 'multimode', 'premium', 'sale']
  },

  // Acquy & Bình điện
  {
    product_id: 'E004',
    product_name: 'Bình acquy khô GS 12V 5Ah',
    category: 'electric-system',
    sub_category: 'battery',
    vehicle_type: 'Motorbike',
    compatible_brand: 'Honda',
    compatible_model: 'Wave, Blade, Future',
    engine_capacity: '100cc - 125cc',
    price: 380000,
    stock_status: 'in_stock',
    description: 'Acquy khô công nghệ Nhật Bản, bảo hành 12 tháng, khởi động êm ái',
    product_image: 'motorcycle battery GS dry cell',
    tags: ['battery', 'GS', 'warranty']
  },
  {
    product_id: 'E005',
    product_name: 'Bình acquy Lithium ion 12V 7Ah',
    category: 'electric-system',
    sub_category: 'battery',
    vehicle_type: 'Motorbike',
    compatible_brand: 'Yamaha',
    compatible_model: 'Exciter 155, NVX',
    engine_capacity: '150cc - 155cc',
    price: 1250000,
    original_price: 1500000,
    discount_percentage: 17,
    stock_status: 'in_stock',
    description: 'Acquy Lithium ion siêu nhẹ, tuổi thọ cao, sạc nhanh, công nghệ cao cấp',
    product_image: 'motorcycle lithium battery compact',
    tags: ['lithium', 'lightweight', 'premium', 'sale']
  },

  // Dây điện
  {
    product_id: 'E006',
    product_name: 'Bộ dây điện zin theo xe Winner X',
    category: 'electric-system',
    sub_category: 'wiring',
    vehicle_type: 'Motorbike',
    compatible_brand: 'Honda',
    compatible_model: 'Winner X',
    engine_capacity: '150cc',
    price: 650000,
    stock_status: 'in_stock',
    description: 'Bộ dây điện chính hãng, đầy đủ cổng kết nối, chống nước tốt',
    product_image: 'motorcycle wiring harness complete',
    tags: ['genuine', 'complete', 'waterproof']
  },
  {
    product_id: 'E007',
    product_name: 'Cáp đề silicon cao cấp 3 sợi',
    category: 'electric-system',
    sub_category: 'wiring',
    vehicle_type: 'Motorbike',
    compatible_brand: 'Yamaha',
    compatible_model: 'Exciter 155, Sirius',
    engine_capacity: '110cc - 155cc',
    price: 85000,
    stock_status: 'in_stock',
    description: 'Cáp đề silicon dẻo, chịu nhiệt tốt, độ bền cao',
    product_image: 'motorcycle starter cable silicon',
    tags: ['cable', 'heat-resistant', 'durable']
  },

  // ========== HỆ THỐNG PHANH ==========
  // Má phanh
  {
    product_id: 'B001',
    product_name: 'Má phanh Honda Winner X chính hãng',
    category: 'brake-system',
    sub_category: 'brake-pads',
    vehicle_type: 'Motorbike',
    compatible_brand: 'Honda',
    compatible_model: 'Winner X, CBR150',
    engine_capacity: '150cc',
    price: 280000,
    stock_status: 'in_stock',
    description: 'Má phanh chính hãng Honda, độ bám tốt, ít bụi, tuổi thọ cao',
    product_image: 'motorcycle brake pads Honda genuine',
    tags: ['genuine', 'honda', 'quality']
  },
  {
    product_id: 'B002',
    product_name: 'Má phanh Racing Boy ceramic',
    category: 'brake-system',
    sub_category: 'brake-pads',
    vehicle_type: 'Motorbike',
    compatible_brand: 'Yamaha',
    compatible_model: 'Exciter 155, R15',
    engine_capacity: '150cc - 155cc',
    price: 420000,
    original_price: 500000,
    discount_percentage: 16,
    stock_status: 'in_stock',
    description: 'Má phanh ceramic cao cấp, lực phanh mạnh, ít ồn, tản nhiệt tốt',
    product_image: 'motorcycle brake pads ceramic racing',
    tags: ['racing', 'ceramic', 'performance', 'sale']
  },

  // Dầu phanh
  {
    product_id: 'B003',
    product_name: 'Dầu phanh Motul DOT 4 RBF 660',
    category: 'brake-system',
    sub_category: 'brake-oil',
    vehicle_type: 'Motorbike',
    compatible_brand: 'Honda',
    compatible_model: 'Tất cả dòng xe',
    engine_capacity: 'Universal',
    price: 180000,
    stock_status: 'in_stock',
    description: 'Dầu phanh cao cấp Motul, điểm sôi khô 325°C, chịu nhiệt tốt',
    product_image: 'motorcycle brake fluid Motul DOT4',
    tags: ['motul', 'premium', 'high-performance']
  },
  {
    product_id: 'B004',
    product_name: 'Dầu phanh Castrol DOT 3 React',
    category: 'brake-system',
    sub_category: 'brake-oil',
    vehicle_type: 'Motorbike',
    compatible_brand: 'Yamaha',
    compatible_model: 'Tất cả dòng xe',
    engine_capacity: 'Universal',
    price: 85000,
    stock_status: 'in_stock',
    description: 'Dầu phanh tiêu chuẩn DOT 3, chất lượng ổn định, giá tốt',
    product_image: 'motorcycle brake fluid Castrol',
    tags: ['castrol', 'standard', 'affordable']
  },

  // Đĩa phanh
  {
    product_id: 'B005',
    product_name: 'Đĩa phanh Brembo Racing 260mm',
    category: 'brake-system',
    sub_category: 'brake-disc',
    vehicle_type: 'Motorbike',
    compatible_brand: 'Yamaha',
    compatible_model: 'Exciter 155',
    engine_capacity: '155cc',
    price: 1000000,
    original_price: 1250000,
    discount_percentage: 20,
    stock_status: 'in_stock',
    description: 'Đĩa phanh thể thao cao cấp, khả năng tản nhiệt vượt trội, lực phanh mạnh',
    product_image: 'motorcycle brake disc Brembo racing',
    tags: ['brembo', 'racing', 'performance', 'sale']
  },
  {
    product_id: 'B006',
    product_name: 'Đĩa phanh zin theo xe Wave',
    category: 'brake-system',
    sub_category: 'brake-disc',
    vehicle_type: 'Motorbike',
    compatible_brand: 'Honda',
    compatible_model: 'Wave Alpha, Blade',
    engine_capacity: '110cc - 125cc',
    price: 320000,
    stock_status: 'in_stock',
    description: 'Đĩa phanh zin theo xe, đường kính 220mm, chất lượng ổn định',
    product_image: 'motorcycle brake disc Honda standard',
    tags: ['genuine', 'honda', 'standard']
  },

  // ========== ĐỘNG CƠ ==========
  // Xi lanh piston
  {
    product_id: 'M001',
    product_name: 'Xi lanh piston STD Racing Winner X',
    category: 'engine',
    sub_category: 'piston',
    vehicle_type: 'Motorbike',
    compatible_brand: 'Honda',
    compatible_model: 'Winner X',
    engine_capacity: '150cc',
    price: 980000,
    stock_status: 'in_stock',
    description: 'Xi lanh piston cao cấp, tăng hiệu suất động cơ, độ bền cao',
    product_image: 'motorcycle piston cylinder racing',
    tags: ['racing', 'performance', 'upgrade']
  },
  {
    product_id: 'M002',
    product_name: 'Bộ piston Takasago 62mm Exciter',
    category: 'engine',
    sub_category: 'piston',
    vehicle_type: 'Motorbike',
    compatible_brand: 'Yamaha',
    compatible_model: 'Exciter 155',
    engine_capacity: '155cc',
    price: 650000,
    original_price: 780000,
    discount_percentage: 17,
    stock_status: 'in_stock',
    description: 'Bộ piston Takasago chính hãng, độ chính xác cao, tản nhiệt tốt',
    product_image: 'motorcycle piston set Takasago',
    tags: ['takasago', 'genuine', 'precision', 'sale']
  },

  // Lọc gió
  {
    product_id: 'M003',
    product_name: 'Lọc gió DNA Racing cao cấp',
    category: 'engine',
    sub_category: 'air-filter',
    vehicle_type: 'Motorbike',
    compatible_brand: 'Honda',
    compatible_model: 'Winner X, CBR150',
    engine_capacity: '150cc',
    price: 650000,
    stock_status: 'in_stock',
    description: 'Lọc gió hiệu suất cao, tăng công suất động cơ, có thể giặt sử dụng lại',
    product_image: 'motorcycle air filter DNA racing red',
    tags: ['dna', 'performance', 'washable', 'racing']
  },
  {
    product_id: 'M004',
    product_name: 'Lọc gió BMC thể thao Exciter',
    category: 'engine',
    sub_category: 'air-filter',
    vehicle_type: 'Motorbike',
    compatible_brand: 'Yamaha',
    compatible_model: 'Exciter 155',
    engine_capacity: '155cc',
    price: 580000,
    stock_status: 'in_stock',
    description: 'Lọc gió BMC cotton, độ lọc cao, tăng luồng khí nạp',
    product_image: 'motorcycle air filter BMC sport',
    tags: ['bmc', 'sport', 'performance']
  },

  // Dầu nhớt
  {
    product_id: 'M005',
    product_name: 'Dầu nhớt Motul 7100 10W40',
    category: 'engine',
    sub_category: 'oil',
    vehicle_type: 'Motorbike',
    compatible_brand: 'Honda',
    compatible_model: 'Winner X, CBR150',
    engine_capacity: '150cc',
    price: 196000,
    original_price: 245000,
    discount_percentage: 20,
    stock_status: 'in_stock',
    description: 'Dầu nhớt cao cấp cho xe máy thể thao, bảo vệ tối ưu động cơ',
    product_image: 'motorcycle oil Motul premium synthetic',
    tags: ['motul', 'premium', 'synthetic', 'performance', 'sale']
  },
  {
    product_id: 'M006',
    product_name: 'Dầu nhớt Shell Advance AX7 10W40',
    category: 'engine',
    sub_category: 'oil',
    vehicle_type: 'Motorbike',
    compatible_brand: 'Yamaha',
    compatible_model: 'Exciter 155, Jupiter',
    engine_capacity: '135cc - 155cc',
    price: 165000,
    stock_status: 'in_stock',
    description: 'Dầu nhớt bán tổng hợp Shell, bảo vệ động cơ hiệu quả',
    product_image: 'motorcycle oil Shell synthetic blend',
    tags: ['shell', 'semi-synthetic', 'protection']
  },
  {
    product_id: 'M007',
    product_name: 'Dầu nhớt Castrol Power1 4T 15W50',
    category: 'engine',
    sub_category: 'oil',
    vehicle_type: 'Motorbike',
    compatible_brand: 'Honda',
    compatible_model: 'Wave, Blade, Future',
    engine_capacity: '100cc - 125cc',
    price: 135000,
    stock_status: 'in_stock',
    description: 'Dầu nhớt khoáng chất cao cấp, phù hợp xe số thông dụng',
    product_image: 'motorcycle oil Castrol mineral',
    tags: ['castrol', 'mineral', 'everyday']
  },

  // ========== HỆ THỐNG TRUYỀN ĐỘNG ==========
  // Nhông sên dĩa
  {
    product_id: 'T001',
    product_name: 'Bộ nhông sên dĩa DID Gold',
    category: 'transmission',
    sub_category: 'chain-sprocket',
    vehicle_type: 'Motorbike',
    compatible_brand: 'Yamaha',
    compatible_model: 'Exciter 155',
    engine_capacity: '155cc',
    price: 1450000,
    stock_status: 'in_stock',
    description: 'Bộ nhông sên dĩa cao cấp DID, độ bền vượt trội, mạ vàng chống gỉ',
    product_image: 'motorcycle chain sprocket DID gold premium',
    tags: ['did', 'premium', 'durable', 'racing']
  },
  {
    product_id: 'T002',
    product_name: 'Sên RK Racing 428 Winner X',
    category: 'transmission',
    sub_category: 'chain-sprocket',
    vehicle_type: 'Motorbike',
    compatible_brand: 'Honda',
    compatible_model: 'Winner X',
    engine_capacity: '150cc',
    price: 680000,
    original_price: 800000,
    discount_percentage: 15,
    stock_status: 'in_stock',
    description: 'Sên cao cấp RK Racing, O-ring seal, tuổi thọ cao',
    product_image: 'motorcycle chain RK racing',
    tags: ['rk', 'racing', 'o-ring', 'sale']
  },

  // Ly hợp
  {
    product_id: 'T003',
    product_name: 'Ly hợp chính hãng Winner X',
    category: 'transmission',
    sub_category: 'clutch',
    vehicle_type: 'Motorbike',
    compatible_brand: 'Honda',
    compatible_model: 'Winner X',
    engine_capacity: '150cc',
    price: 520000,
    stock_status: 'in_stock',
    description: 'Bộ ly hợp chính hãng Honda, vận hành êm ái, tuổi thọ cao',
    product_image: 'motorcycle clutch Honda genuine',
    tags: ['genuine', 'honda', 'smooth']
  },
  {
    product_id: 'T004',
    product_name: 'Lò xo ly hợp YSS Racing',
    category: 'transmission',
    sub_category: 'clutch',
    vehicle_type: 'Motorbike',
    compatible_brand: 'Yamaha',
    compatible_model: 'Exciter 155',
    engine_capacity: '155cc',
    price: 380000,
    stock_status: 'in_stock',
    description: 'Lò xo ly hợp YSS, tăng độ cứng, cải thiện khả năng bứt tốc',
    product_image: 'motorcycle clutch spring YSS',
    tags: ['yss', 'racing', 'performance']
  },

  // ========== BÁNH XE & LỐP ==========
  // Lốp xe
  {
    product_id: 'W001',
    product_name: 'Lốp Michelin Pilot Street 2 80/90-17',
    category: 'wheels-tires',
    sub_category: 'tires',
    vehicle_type: 'Motorbike',
    compatible_brand: 'Honda',
    compatible_model: 'Winner X, Wave, Blade',
    engine_capacity: '110cc - 150cc',
    price: 580000,
    stock_status: 'in_stock',
    description: 'Lốp xe chất lượng cao Michelin, độ bền vượt trội cho đường phố',
    product_image: 'motorcycle tire Michelin street',
    tags: ['michelin', 'durable', 'grip', 'all-weather']
  },
  {
    product_id: 'W002',
    product_name: 'Lốp Dunlop TT93 GP 90/80-17',
    category: 'wheels-tires',
    sub_category: 'tires',
    vehicle_type: 'Motorbike',
    compatible_brand: 'Yamaha',
    compatible_model: 'Exciter 155',
    engine_capacity: '155cc',
    price: 720000,
    original_price: 850000,
    discount_percentage: 15,
    stock_status: 'in_stock',
    description: 'Lốp thể thao Dunlop, độ bám tốt trên mọi địa hình',
    product_image: 'motorcycle tire Dunlop racing sport',
    tags: ['dunlop', 'sport', 'racing', 'sale']
  },
  {
    product_id: 'W003',
    product_name: 'Lốp IRC 100/80-17 cho Exciter',
    category: 'wheels-tires',
    sub_category: 'tires',
    vehicle_type: 'Motorbike',
    compatible_brand: 'Yamaha',
    compatible_model: 'Exciter 150, Exciter 155',
    engine_capacity: '150cc - 155cc',
    price: 650000,
    stock_status: 'in_stock',
    description: 'Lốp IRC chất lượng Nhật, độ bền cao, giá hợp lý',
    product_image: 'motorcycle tire IRC sport',
    tags: ['irc', 'japanese', 'quality']
  },

  // Mâm xe
  {
    product_id: 'W004',
    product_name: 'Mâm đúc Brembo 17 inch Exciter',
    category: 'wheels-tires',
    sub_category: 'rims',
    vehicle_type: 'Motorbike',
    compatible_brand: 'Yamaha',
    compatible_model: 'Exciter 155',
    engine_capacity: '155cc',
    price: 3800000,
    original_price: 4500000,
    discount_percentage: 16,
    stock_status: 'low_stock',
    description: 'Mâm đúc cao cấp Brembo, nhẹ, cứng, thiết kế thể thao',
    product_image: 'motorcycle wheel rim Brembo racing',
    tags: ['brembo', 'premium', 'racing', 'lightweight', 'sale']
  },
  {
    product_id: 'W005',
    product_name: 'Mâm đúc Racing Boy Winner X',
    category: 'wheels-tires',
    sub_category: 'rims',
    vehicle_type: 'Motorbike',
    compatible_brand: 'Honda',
    compatible_model: 'Winner X',
    engine_capacity: '150cc',
    price: 2950000,
    stock_status: 'in_stock',
    description: 'Mâm đúc Racing Boy, thiết kế 5 chấu thể thao, nhẹ, bền',
    product_image: 'motorcycle wheel rim racing sport',
    tags: ['racing-boy', 'sport', 'durable']
  },

  // ========== PHỤ KIỆN ==========
  // Phuộc
  {
    product_id: 'A001',
    product_name: 'Phuộc YSS Racing DTG',
    category: 'accessories',
    sub_category: 'suspension',
    vehicle_type: 'Motorbike',
    compatible_brand: 'Honda',
    compatible_model: 'Winner X, CBR150',
    engine_capacity: '150cc',
    price: 4250000,
    stock_status: 'in_stock',
    description: 'Phuộc cao cấp YSS, điều chỉnh được, tăng khả năng vận hành',
    product_image: 'motorcycle suspension YSS racing gold',
    tags: ['yss', 'racing', 'adjustable', 'premium']
  },
  {
    product_id: 'A002',
    product_name: 'Phuộc Ohlins TTX GP Exciter',
    category: 'accessories',
    sub_category: 'suspension',
    vehicle_type: 'Motorbike',
    compatible_brand: 'Yamaha',
    compatible_model: 'Exciter 155',
    engine_capacity: '155cc',
    price: 12500000,
    original_price: 14000000,
    discount_percentage: 11,
    stock_status: 'low_stock',
    description: 'Phuộc cao cấp nhất Ohlins, công nghệ GP, điều chỉnh toàn diện',
    product_image: 'motorcycle suspension Ohlins gold premium',
    tags: ['ohlins', 'premium', 'gp', 'top-tier', 'sale']
  },

  // Pô xe
  {
    product_id: 'A003',
    product_name: 'Pô Akrapovic Carbon Winner X',
    category: 'accessories',
    sub_category: 'exhaust',
    vehicle_type: 'Motorbike',
    compatible_brand: 'Honda',
    compatible_model: 'Winner X',
    engine_capacity: '150cc',
    price: 5800000,
    original_price: 6500000,
    discount_percentage: 11,
    stock_status: 'in_stock',
    description: 'Pô Akrapovic Carbon, giảm trọng lượng, tăng công suất, âm thanh hay',
    product_image: 'motorcycle exhaust Akrapovic carbon',
    tags: ['akrapovic', 'carbon', 'performance', 'lightweight', 'sale']
  },
  {
    product_id: 'A004',
    product_name: 'Pô Yoshimura R77 Exciter',
    category: 'accessories',
    sub_category: 'exhaust',
    vehicle_type: 'Motorbike',
    compatible_brand: 'Yamaha',
    compatible_model: 'Exciter 155',
    engine_capacity: '155cc',
    price: 4200000,
    stock_status: 'in_stock',
    description: 'Pô Yoshimura R77, thiết kế thể thao, tăng hiệu suất động cơ',
    product_image: 'motorcycle exhaust Yoshimura racing',
    tags: ['yoshimura', 'racing', 'performance']
  },
  {
    product_id: 'A005',
    product_name: 'Pô Racing Boy S1 inox',
    category: 'accessories',
    sub_category: 'exhaust',
    vehicle_type: 'Motorbike',
    compatible_brand: 'Honda',
    compatible_model: 'Wave, Blade',
    engine_capacity: '110cc - 125cc',
    price: 850000,
    stock_status: 'in_stock',
    description: 'Pô Racing Boy inox, chống gỉ tốt, giá hợp lý',
    product_image: 'motorcycle exhaust Racing Boy stainless',
    tags: ['racing-boy', 'stainless', 'affordable']
  },

  // Gương chiếu hậu
  {
    product_id: 'A006',
    product_name: 'Gương chiếu hậu Rizoma Spy-R',
    category: 'accessories',
    sub_category: 'mirrors',
    vehicle_type: 'Motorbike',
    compatible_brand: 'Honda',
    compatible_model: 'Winner X, CBR150',
    engine_capacity: '150cc',
    price: 1850000,
    original_price: 2200000,
    discount_percentage: 16,
    stock_status: 'in_stock',
    description: 'Gương Rizoma thiết kế đẹp mắt, tầm nhìn rộng, chất lượng cao',
    product_image: 'motorcycle mirror Rizoma sport modern',
    tags: ['rizoma', 'premium', 'design', 'sale']
  },
  {
    product_id: 'A007',
    product_name: 'Gương chiếu hậu CNC nhôm nguyên khối',
    category: 'accessories',
    sub_category: 'mirrors',
    vehicle_type: 'Motorbike',
    compatible_brand: 'Yamaha',
    compatible_model: 'Exciter 155',
    engine_capacity: '155cc',
    price: 680000,
    stock_status: 'in_stock',
    description: 'Gương CNC nhôm nguyên khối, gọn nhẹ, thể thao',
    product_image: 'motorcycle mirror CNC aluminum sport',
    tags: ['cnc', 'aluminum', 'sport']
  },
  {
    product_id: 'A008',
    product_name: 'Gương chiếu hậu KOSO Arrow',
    category: 'accessories',
    sub_category: 'mirrors',
    vehicle_type: 'Motorbike',
    compatible_brand: 'Honda',
    compatible_model: 'SH, PCX, Vision',
    engine_capacity: '125cc - 150cc',
    price: 950000,
    stock_status: 'in_stock',
    description: 'Gương KOSO Arrow, tích hợp đèn xi nhan LED, thiết kế hiện đại',
    product_image: 'motorcycle mirror KOSO LED modern',
    tags: ['koso', 'led', 'modern', 'integrated']
  },
];