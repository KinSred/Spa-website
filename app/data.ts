export type Product = {
  id: number;
  slug: string;
  name: string;
  category: "Tinh chất" | "Làm sạch" | "Dưỡng ẩm" | "Chống nắng" | "Thiết bị";
  price: number;
  skin: string[];
  concern: string[];
  image: string;
  note: string;
  description: string;
  ingredients: string[];
  usage: string;
  stock: number;
};

export const products: Product[] = [
  {
    id: 1,
    slug: "serum-phuc-hoi-soie-01",
    name: "Sérum Soie 01",
    category: "Tinh chất",
    price: 890000,
    skin: ["Da nhạy cảm", "Da khô"],
    concern: ["Phục hồi", "Cấp ẩm"],
    image: "/product-serum.webp",
    note: "30 ml · Kết cấu nước",
    description:
      "Tinh chất nền nước dành cho hàng rào da yếu, tập trung vào độ êm và khả năng giữ ẩm sau các liệu trình làm sạch sâu.",
    ingredients: ["Panthenol 3%", "Beta-glucan", "Ectoin", "Ceramide NP"],
    usage: "Dùng 2-3 giọt sau toner, sáng và tối. Vỗ nhẹ trên da còn ẩm.",
    stock: 18,
  },
  {
    id: 2,
    slug: "sua-rua-mat-voile",
    name: "Nettoyant Voile",
    category: "Làm sạch",
    price: 520000,
    skin: ["Mọi loại da", "Da nhạy cảm"],
    concern: ["Làm sạch dịu", "Phục hồi"],
    image: "/product-cleanser.webp",
    note: "120 ml · pH 5.5",
    description:
      "Sữa rửa mặt ít bọt, loại bỏ kem chống nắng và bụi mịn mà không để lại cảm giác căng sau khi rửa.",
    ingredients: ["Amino acid surfactants", "Inulin", "Allantoin", "Oat lipid"],
    usage: "Tạo bọt trong lòng bàn tay, massage trên da ướt 45 giây rồi rửa sạch.",
    stock: 26,
  },
  {
    id: 3,
    slug: "kem-duong-creme-calme",
    name: "Crème Calme",
    category: "Dưỡng ẩm",
    price: 760000,
    skin: ["Da khô", "Da nhạy cảm"],
    concern: ["Cấp ẩm", "Phục hồi"],
    image: "/product-cream.webp",
    note: "50 g · Không hương liệu",
    description:
      "Kem dưỡng có độ ôm vừa phải, khóa ẩm nhưng không bí, phù hợp dùng sau treatment hoặc trong khí hậu điều hòa.",
    ingredients: ["Ceramide complex", "Squalane", "Madecassoside", "Cholesterol"],
    usage: "Lấy lượng bằng một hạt đậu, áp nhẹ lên mặt và cổ ở bước cuối.",
    stock: 9,
  },
  {
    id: 4,
    slug: "dau-duong-huile-ambre",
    name: "Huile Ambre",
    category: "Tinh chất",
    price: 940000,
    skin: ["Da khô", "Da thường"],
    concern: ["Thiếu sức sống", "Cấp ẩm"],
    image: "/product-oil.webp",
    note: "25 ml · Dầu khô",
    description:
      "Hỗn hợp dầu thực vật ép lạnh với độ trượt mỏng, dùng riêng hoặc pha cùng kem dưỡng cho những tối da cần nghỉ.",
    ingredients: ["Meadowfoam", "Jojoba", "Bisabolol", "Vitamin E"],
    usage: "Làm ấm 2 giọt giữa hai lòng bàn tay rồi áp lên da sau kem dưỡng.",
    stock: 12,
  },
  {
    id: 5,
    slug: "kem-chong-nang-ecran-50",
    name: "Écran 50",
    category: "Chống nắng",
    price: 680000,
    skin: ["Mọi loại da", "Da dầu"],
    concern: ["Bảo vệ UV", "Thâm sạm"],
    image: "/product-spf.webp",
    note: "50 ml · SPF 50+ PA++++",
    description:
      "Kem chống nắng lai với bề mặt ráo, không nâng tông rõ và không để lại vệt trắng khi thoa đủ lượng.",
    ingredients: ["Uvinul A Plus", "Tinosorb S", "Niacinamide", "Tocopherol"],
    usage: "Dùng hai ngón tay cho mặt và cổ, thoa lại sau 2-3 giờ khi hoạt động ngoài trời.",
    stock: 31,
  },
  {
    id: 6,
    slug: "thiet-bi-sculpt-i",
    name: "Sculpt I",
    category: "Thiết bị",
    price: 2480000,
    skin: ["Mọi loại da"],
    concern: ["Săn chắc", "Thư giãn"],
    image: "/product-device.webp",
    note: "Sóng ấm · 3 cường độ",
    description:
      "Thiết bị massage mặt cầm tay dành cho chu trình tại nhà, có ba mức nhiệt và chế độ tự ngắt sau mười phút.",
    ingredients: ["Đầu hợp kim y tế", "Sạc USB-C", "Ba mức nhiệt", "Túi bảo quản"],
    usage: "Dùng trên da có serum trượt, di chuyển hướng lên trong 5-10 phút, 3 lần mỗi tuần.",
    stock: 4,
  },
];

export const services = [
  {
    id: "consult",
    name: "Soi da & thiết kế routine",
    duration: "45 phút",
    price: 350000,
    description: "Phân tích bề mặt da, thói quen và xây routine có thể mua theo từng bước.",
  },
  {
    id: "calm",
    name: "Calme - phục hồi hàng rào da",
    duration: "75 phút",
    price: 1250000,
    description: "Làm sạch dịu, làm mát và mặt nạ lipid cho làn da đang nhạy cảm.",
  },
  {
    id: "clarity",
    name: "Clarté - làm sạch chuyên sâu",
    duration: "90 phút",
    price: 1580000,
    description: "Chu trình làm sạch lỗ chân lông, xử lý bít tắc và hướng dẫn chăm da sau buổi.",
  },
];

export const articles = [
  {
    tag: "Hàng rào da",
    title: "Khi nào da cần được nghỉ khỏi hoạt chất?",
    excerpt: "Bốn tín hiệu nhỏ thường xuất hiện trước khi da đỏ rát rõ rệt.",
    time: "5 phút đọc",
  },
  {
    tag: "Routine",
    title: "Một routine tốt không nhất thiết có nhiều bước",
    excerpt: "Cách giữ lại đúng ba bước phù hợp với khí hậu nóng ẩm.",
    time: "7 phút đọc",
  },
  {
    tag: "Tại spa",
    title: "Soi da có thay thế tư vấn bác sĩ không?",
    excerpt: "Ranh giới giữa chăm sóc thẩm mỹ và điều trị y khoa cần được nói rõ.",
    time: "4 phút đọc",
  },
];

export const formatMoney = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
