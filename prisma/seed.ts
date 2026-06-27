import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: "file:./prisma/dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  // 清空旧数据
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // 创建分类
  const categories = await Promise.all([
    prisma.category.create({ data: { name: "数码产品", slug: "digital" } }),
    prisma.category.create({ data: { name: "服装鞋帽", slug: "clothing" } }),
    prisma.category.create({ data: { name: "食品饮料", slug: "food" } }),
    prisma.category.create({ data: { name: "家居用品", slug: "home" } }),
  ]);

  const products = [
    { name: "机械键盘 K8 Pro", description: "RGB 背光、热插拔轴、三模连接，办公游戏两相宜", price: 399, stock: 120, categoryId: categories[0].id },
    { name: "无线蓝牙耳机 Air Pro", description: "主动降噪、40小时续航、Hi-Res 认证音质", price: 899, stock: 56, categoryId: categories[0].id },
    { name: "27寸 4K 显示器", description: "IPS 面板、HDR400、Type-C 65W 反向充电", price: 2499, stock: 32, categoryId: categories[0].id },
    { name: "USB-C 扩展坞 12合1", description: "双 HDMI + DP、千兆网口、SD/TF 读卡器", price: 259, stock: 200, categoryId: categories[0].id },
    { name: "氮化镓充电器 100W", description: "三口输出、折叠插脚、支持 PD/QC 快充协议", price: 149, stock: 300, categoryId: categories[0].id },
    { name: "人体工学椅 Pro", description: "4D 扶手、135° 后仰、腰部支撑可调、全网面透气", price: 1899, stock: 18, categoryId: categories[0].id },
    { name: "男士休闲卫衣", description: "纯棉面料、宽松版型、多色可选、春秋百搭", price: 199, stock: 500, categoryId: categories[1].id },
    { name: "女士牛仔外套", description: "做旧水洗、短款设计、复古风格、春季新品", price: 359, stock: 230, categoryId: categories[1].id },
    { name: "运动跑鞋 Ultra Boost", description: "全掌缓震、透气飞织鞋面、橡胶外底耐磨防滑", price: 699, stock: 88, categoryId: categories[1].id },
    { name: "轻薄羽绒服", description: "90% 白鹅绒、蓬松度 800+、可收纳设计", price: 599, stock: 150, categoryId: categories[1].id },
    { name: "有机坚果礼盒 1.2kg", description: "6种混合坚果、原味烘焙无添加、送礼首选", price: 168, stock: 600, categoryId: categories[2].id },
    { name: "冻干咖啡粉 30条装", description: "中度烘焙、冷热水 3 秒即溶、阿拉比卡豆", price: 89, stock: 800, categoryId: categories[2].id },
    { name: "进口黑巧克力 70%", description: "比利时进口、纯可可脂、低糖配方", price: 45, stock: 400, categoryId: categories[2].id },
    { name: "有机抹茶粉 100g", description: "日本宇治、石磨研磨、茶道级、无添加", price: 128, stock: 180, categoryId: categories[2].id },
    { name: "智能台灯 护眼版", description: "国 AA 级照度、自动调光、番茄钟提醒", price: 329, stock: 95, categoryId: categories[3].id },
    { name: "记忆棉枕头 一对装", description: "慢回弹、人体工学曲线、抗菌防螨枕套", price: 259, stock: 370, categoryId: categories[3].id },
    { name: "不锈钢保温杯 500ml", description: "316 不锈钢内胆、12小时保温、食品级硅胶圈", price: 99, stock: 450, categoryId: categories[3].id },
    { name: "日式餐具套装 18件", description: "釉下彩、微波炉可用、适合4-6人家庭", price: 289, stock: 140, categoryId: categories[3].id },
    { name: "超声波香薰机", description: "500ml 大容量、7色夜灯、定时关机关灯功能", price: 169, stock: 210, categoryId: categories[3].id },
    { name: "无线吸尘器 V12", description: "120AW 强劲吸力、60分钟续航、5重过滤系统", price: 1299, stock: 42, categoryId: categories[3].id },
  ];

  await prisma.product.createMany({ data: products });

  console.log(`已创建 ${categories.length} 个分类、${products.length} 个商品`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
