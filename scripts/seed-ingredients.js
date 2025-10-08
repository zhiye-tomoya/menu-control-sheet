require("dotenv").config();
require("dotenv").config({ path: ".env.local" });

const { neon } = require("@neondatabase/serverless");

const japaneseIngredients = [
  {
    id: "rice-koshihikari",
    name: "コシヒカリ米",
    defaultUnit: "g",
    pricingUnit: "kg",
    conversionFactor: "1000", // 1kg = 1000g
    currentPrice: "580.00", // ¥580 per kg (typical supermarket price)
    category: "grains",
    description: "高品質なコシヒカリ米",
  },
  {
    id: "soy-sauce-regular",
    name: "醤油（濃口）",
    defaultUnit: "ml",
    pricingUnit: "本",
    conversionFactor: "1000", // 1 bottle = 1000ml
    currentPrice: "298.00", // ¥298 per 1L bottle
    category: "seasoning",
    description: "一般的な濃口醤油",
  },
  {
    id: "miso-red",
    name: "赤味噌",
    defaultUnit: "g",
    pricingUnit: "パック",
    conversionFactor: "750", // 1 pack = 750g
    currentPrice: "380.00", // ¥380 per 750g pack
    category: "seasoning",
    description: "コクのある赤味噌",
  },
  {
    id: "chicken-breast",
    name: "鶏胸肉",
    defaultUnit: "g",
    pricingUnit: "kg",
    conversionFactor: "1000", // 1kg = 1000g
    currentPrice: "980.00", // ¥980 per kg
    category: "protein",
    description: "国産鶏胸肉",
  },
  {
    id: "onion-medium",
    name: "玉ねぎ",
    defaultUnit: "個",
    pricingUnit: "個",
    conversionFactor: "1", // 1 piece = 1 piece
    currentPrice: "68.00", // ¥68 per piece (medium size)
    category: "vegetable",
    description: "中サイズの玉ねぎ",
  },
  {
    id: "carrot",
    name: "人参",
    defaultUnit: "g",
    pricingUnit: "本",
    conversionFactor: "150", // 1 carrot = ~150g
    currentPrice: "58.00", // ¥58 per piece
    category: "vegetable",
    description: "新鮮な人参",
  },
  {
    id: "potato",
    name: "じゃがいも",
    defaultUnit: "g",
    pricingUnit: "個",
    conversionFactor: "120", // 1 potato = ~120g
    currentPrice: "45.00", // ¥45 per piece
    category: "vegetable",
    description: "メークイン",
  },
  {
    id: "egg",
    name: "卵",
    defaultUnit: "個",
    pricingUnit: "パック",
    conversionFactor: "10", // 1 pack = 10 pieces
    currentPrice: "258.00", // ¥258 per 10-piece pack
    category: "protein",
    description: "Lサイズの卵",
  },
  {
    id: "tofu-silken",
    name: "絹ごし豆腐",
    defaultUnit: "g",
    pricingUnit: "パック",
    conversionFactor: "300", // 1 pack = 300g
    currentPrice: "88.00", // ¥88 per 300g pack
    category: "protein",
    description: "なめらかな絹ごし豆腐",
  },
  {
    id: "green-onion",
    name: "ねぎ",
    defaultUnit: "g",
    pricingUnit: "束",
    conversionFactor: "100", // 1 bunch = ~100g
    currentPrice: "128.00", // ¥128 per bunch
    category: "vegetable",
    description: "青ねぎ（万能ねぎ）",
  },
  {
    id: "cabbage",
    name: "キャベツ",
    defaultUnit: "g",
    pricingUnit: "玉",
    conversionFactor: "1200", // 1 head = ~1200g
    currentPrice: "198.00", // ¥198 per head
    category: "vegetable",
    description: "新鮮なキャベツ",
  },
  {
    id: "pork-belly",
    name: "豚バラ肉",
    defaultUnit: "g",
    pricingUnit: "kg",
    conversionFactor: "1000", // 1kg = 1000g
    currentPrice: "1580.00", // ¥1580 per kg
    category: "protein",
    description: "国産豚バラ肉",
  },
];

async function seedIngredients() {
  const sql = neon(process.env.DATABASE_URL);

  if (!process.env.DATABASE_URL) {
    console.log("❌ DATABASE_URL not found");
    process.exit(1);
  }

  try {
    console.log("🌱 Seeding ingredients database...");

    // Insert ingredients using SQL
    for (const ingredient of japaneseIngredients) {
      await sql`
        INSERT INTO "ingredients" (
          "id", "name", "default_unit", "pricing_unit", 
          "conversion_factor", "current_price", "category", "description"
        ) VALUES (
          ${ingredient.id}, ${ingredient.name}, ${ingredient.defaultUnit}, ${ingredient.pricingUnit},
          ${ingredient.conversionFactor}, ${ingredient.currentPrice}, ${ingredient.category}, ${ingredient.description}
        ) ON CONFLICT ("id") DO NOTHING
      `;
      console.log(`✅ Added: ${ingredient.name}`);
    }

    console.log(`🎉 Successfully seeded ${japaneseIngredients.length} ingredients!`);
  } catch (error) {
    console.error("❌ Error seeding ingredients:", error);
    console.error("Full error:", error);
  }
}

seedIngredients();
