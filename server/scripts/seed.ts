/**
 * Seed script — populates categories and products from the frontend data snapshot.
 * Run: cd server && npm run seed
 * Requires MONGODB_URI in .env
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "..", ".env") });

import Category from "../src/models/Category.model.js";
import Product from "../src/models/Product.model.js";

// ── Category snapshot ──────────────────────────────────────────
const categories = [
  {
    name: "Herbal Teas",
    slug: "herbal-teas",
    description: "Organic herbal infusions for wellness",
  },
  {
    name: "Dried Vegetables & Powders",
    slug: "dried-vegetables-powders",
    description: "Nutrient-rich vegetable powders",
  },
  {
    name: "Mushrooms",
    slug: "mushrooms",
    description: "Fresh and dried medicinal mushrooms",
  },
];

// ── Product snapshot ───────────────────────────────────────────
const products = [
  // Herbal Teas
  {
    name: "Tulasi Herbal Tea",
    slug: "tulasi-herbal-tea",
    categorySlug: "herbal-teas",
    price: 299,
    originalPrice: 399,
    weight: "100g",
    badge: "Bestseller",
    rating: 4.5,
    reviews: 124,
    benefits: [
      "Boosts immunity",
      "Reduces stress",
      "Improves digestion",
      "Rich in antioxidants",
    ],
    ingredients: ["Organic Tulasi leaves", "Dried ginger", "Black pepper"],
    howToUse:
      "Steep 1 teaspoon in hot water for 5-7 minutes. Add honey to taste.",
    description:
      "Our signature Tulasi tea is handpicked from organic farms. Known as the 'Queen of Herbs' in Ayurveda, Tulasi supports respiratory health and natural immunity.",
    inStock: true,
  },
  {
    name: "Lemongrass Ginger Tea",
    slug: "lemongrass-ginger-tea",
    categorySlug: "herbal-teas",
    price: 249,
    weight: "100g",
    rating: 4.6,
    reviews: 89,
    benefits: [
      "Aids digestion",
      "Reduces inflammation",
      "Refreshing taste",
      "Caffeine-free",
    ],
    ingredients: ["Fresh lemongrass", "Dried ginger root", "Lemon peel"],
    howToUse: "Brew 1-2 teaspoons in 200ml hot water for 5 minutes.",
    description:
      "A refreshing blend of lemongrass and ginger that soothes the stomach and uplifts the mood. Perfect for any time of day.",
    inStock: true,
  },
  {
    name: "Hibiscus Rose Tea",
    slug: "hibiscus-rose-tea",
    categorySlug: "herbal-teas",
    price: 329,
    weight: "75g",
    badge: "New",
    rating: 4.7,
    reviews: 67,
    benefits: [
      "Supports heart health",
      "Rich in Vitamin C",
      "Natural blood pressure support",
      "Beautiful ruby color",
    ],
    ingredients: ["Dried hibiscus flowers", "Rose petals", "Cardamom"],
    howToUse:
      "Steep 2 teaspoons in 200ml hot water for 8-10 minutes. Can be enjoyed hot or cold.",
    description:
      "A stunning ruby-red tea with the tanginess of hibiscus and the delicate fragrance of rose. Naturally caffeine-free and full of antioxidants.",
    inStock: true,
  },
  {
    name: "Moringa Green Tea",
    slug: "moringa-green-tea",
    categorySlug: "herbal-teas",
    price: 349,
    weight: "100g",
    badge: "Premium",
    rating: 4.5,
    reviews: 156,
    benefits: [
      "Superfood nutrition",
      "Energy boost",
      "Detoxifying",
      "Anti-inflammatory",
    ],
    ingredients: ["Organic moringa leaves", "Green tea", "Mint"],
    howToUse: "Steep 1 teaspoon in 180ml water at 80°C for 3-4 minutes.",
    description:
      "The miracle tree meets premium green tea. Moringa is packed with vitamins, minerals, and all essential amino acids.",
    inStock: true,
  },
  {
    name: "Chamomile Sleep Tea",
    slug: "chamomile-sleep-tea",
    categorySlug: "herbal-teas",
    price: 279,
    weight: "50g",
    rating: 4.6,
    reviews: 98,
    benefits: [
      "Promotes restful sleep",
      "Calms anxiety",
      "Soothes stomach",
      "Gentle and safe",
    ],
    ingredients: ["Chamomile flowers", "Lavender", "Valerian root"],
    howToUse: "Drink 30 minutes before bedtime. Steep for 5-7 minutes.",
    description:
      "A gentle bedtime ritual. Our sleep tea combines the calming properties of chamomile with soothing lavender for peaceful nights.",
    inStock: true,
  },

  // Dried Vegetables & Powders
  {
    name: "Tomato Powder",
    slug: "tomato-powder",
    categorySlug: "dried-vegetables-powders",
    price: 199,
    weight: "150g",
    rating: 4.6,
    reviews: 112,
    benefits: [
      "Rich in lycopene",
      "Long shelf life",
      "Versatile cooking",
      "No preservatives",
    ],
    ingredients: ["100% dehydrated ripe tomatoes"],
    howToUse:
      "Add 1 tbsp to 100ml water for tomato puree. Use in curries, soups, and sauces.",
    description:
      "Sun-ripened tomatoes, dehydrated and ground to a fine powder. Adds rich tomato flavor to any dish with minimal effort.",
    inStock: true,
  },
  {
    name: "Beetroot & Spinach Powder Combo",
    slug: "beetroot-spinach-powder-combo",
    categorySlug: "dried-vegetables-powders",
    price: 449,
    originalPrice: 549,
    weight: "200g",
    badge: "Value Pack",
    rating: 4.8,
    reviews: 89,
    benefits: [
      "Iron-rich",
      "Natural coloring",
      "Detoxifying",
      "Energy boosting",
    ],
    ingredients: ["Dehydrated beetroot", "Dehydrated spinach"],
    howToUse:
      "Add to smoothies, rotis, parathas, or any recipe for nutrition boost.",
    description:
      "The perfect nutrition combo. Beetroot for stamina and spinach for iron. Both powders are versatile and easy to use.",
    inStock: true,
  },

  // Mushrooms
  {
    name: "Fresh Milky Mushrooms",
    slug: "fresh-milky-mushrooms",
    categorySlug: "mushrooms",
    price: 149,
    weight: "250g",
    badge: "Bestseller",
    rating: 4.9,
    reviews: 500,
    benefits: [
      "High protein",
      "Low calorie",
      "Vitamin D rich",
      "Versatile cooking",
    ],
    ingredients: ["100% fresh milky mushrooms"],
    howToUse:
      "Clean with damp cloth. Cook within 3-4 days. Use in stir-fries, curries, or grills.",
    description:
      "Our farm-fresh milky mushrooms are harvested daily. Tender, flavorful, and packed with protein.",
    inStock: true,
  },
  {
    name: "Fresh Oyster Mushrooms",
    slug: "fresh-oyster-mushrooms",
    categorySlug: "mushrooms",
    price: 179,
    weight: "200g",
    rating: 4.8,
    reviews: 167,
    benefits: [
      "Immune support",
      "Heart healthy",
      "Antioxidant rich",
      "Meat alternative",
    ],
    ingredients: ["100% fresh oyster mushrooms"],
    howToUse:
      "Use within 5 days. Perfect for Asian cuisines, soups, and stir-fries.",
    description:
      "Delicate oyster mushrooms with a subtle anise flavor. Excellent meat substitute for vegetarian dishes.",
    inStock: true,
  },
  {
    name: "Dried Mushroom Powder",
    slug: "dried-mushroom-powder",
    categorySlug: "mushrooms",
    price: 399,
    weight: "100g",
    badge: "Superfood",
    rating: 4.9,
    reviews: 145,
    benefits: [
      "Adaptogenic",
      "Immune boosting",
      "Brain health",
      "Energy support",
    ],
    ingredients: [
      "Reishi",
      "Lion's mane",
      "Shiitake",
      "Cordyceps blend",
    ],
    howToUse: "Add 1/2 tsp to coffee, smoothies, or soups daily.",
    description:
      "A powerful blend of medicinal mushrooms. Supports immunity, cognitive function, and overall vitality.",
    inStock: true,
  },
];

// ── Weight parser ──────────────────────────────────────────────
function parseWeight(raw: string) {
  // Try to extract number + unit from strings like "100g", "250g", "60 capsules", "200g (100g each)"
  const match = raw.match(/(\d+)\s*(g|kg|ml|l|capsule|pc)/i);
  if (!match) {
    // Fallback: treat as piece
    return { value: 1, unit: "pc", unitType: "piece" as const };
  }

  const value = parseInt(match[1], 10);
  const unitRaw = match[2].toLowerCase();

  if (unitRaw === "g") return { value, unit: "g", unitType: "weight" as const };
  if (unitRaw === "kg") return { value, unit: "kg", unitType: "weight" as const };
  if (unitRaw === "ml") return { value, unit: "ml", unitType: "volume" as const };
  if (unitRaw === "l") return { value, unit: "l", unitType: "volume" as const };
  if (unitRaw === "capsule" || unitRaw === "capsules")
    return { value, unit: "pc", unitType: "piece" as const };

  return { value: 1, unit: "pc", unitType: "piece" as const };
}

// ── Main seed ──────────────────────────────────────────────────
async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ MONGODB_URI is not set in .env");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("✅ Connected to MongoDB");

  // Upsert categories
  const categoryMap = new Map<string, mongoose.Types.ObjectId>();

  for (const cat of categories) {
    const doc = await Category.findOneAndUpdate(
      { slug: cat.slug },
      { $set: { name: cat.name, description: cat.description } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    categoryMap.set(cat.slug, doc._id);
    console.log(`  📁 Category: ${cat.name} (${doc._id})`);
  }

  // Upsert products
  for (const p of products) {
    const categoryId = categoryMap.get(p.categorySlug);
    if (!categoryId) {
      console.warn(`  ⚠️  Skipping "${p.name}" — unknown category slug: ${p.categorySlug}`);
      continue;
    }

    const variantData = parseWeight(p.weight);

    const productData = {
      name: p.name,
      slug: p.slug,
      category: categoryId,
      description: p.description,
      benefits: p.benefits,
      ingredients: p.ingredients,
      howToUse: p.howToUse,
      badge: p.badge,
      brand: "Beejveda",
      ratingsAverage: p.rating || 0,
      ratingsCount: p.reviews || 0,
      images: [], // real images uploaded via admin endpoint
      variants: [
        {
          unitType: variantData.unitType,
          value: variantData.value,
          unit: variantData.unit,
          price: p.price,
          originalPrice: p.originalPrice,
          stock: p.inStock ? 100 : 0,
          isDefault: true,
        },
      ],
    };

    const doc = await Product.findOneAndUpdate(
      { slug: p.slug },
      { $set: productData },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`  🍄 Product: ${p.name} → variant ${variantData.value} ${variantData.unit}`);
  }

  console.log("\n✅ Seed complete!");
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
