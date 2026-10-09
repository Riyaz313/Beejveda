import mongoose from "mongoose";
import dotenv from "dotenv";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import Product from "../src/models/Product.model.js";
import Category from "../src/models/Category.model.js";
import { uploadToB2 } from "../src/utils/b2Storage.js";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryDirectory = join(scriptDirectory, "..", "..");
dotenv.config({ path: join(scriptDirectory, "..", ".env") });

const productImages = [
  ["tomato-powder", "TomatoPowder.png"],
  ["beetroot-spinach-powder-combo", "Beetroot&SpanishPowder.png"],
  ["fresh-milky-mushrooms", "MilkyMushrooms.png"],
  ["fresh-oyster-mushrooms", "OysterMushrooms.png"],
  ["dried-mushroom-powder", "DriedMushroomPowder.png"],
] as const;

const categoryImages = [
  ["dried-vegetables-powders", "Driedvegetablepowder.png"],
  ["mushrooms", "FreshMilkyMushrooms.png"],
] as const;

const remoteCategoryImages = [
  ["herbal-teas", "herbal-teas.jpg", "https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=400&h=400&fit=crop"],
] as const;

const remoteProductImages = [
  ["tulasi-herbal-tea", "tulasi-herbal-tea.jpg", "https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=400&h=400&fit=crop"],
  ["lemongrass-ginger-tea", "lemongrass-ginger-tea.jpg", "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400&h=400&fit=crop"],
  ["hibiscus-rose-tea", "hibiscus-rose-tea.jpg", "https://images.unsplash.com/photo-1558160074-4d7d8bdf4256?w=400&h=400&fit=crop"],
  ["moringa-green-tea", "moringa-green-tea.jpg", "https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=400&h=400&fit=crop"],
  ["chamomile-sleep-tea", "chamomile-sleep-tea.jpg", "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&h=400&fit=crop"],
] as const;

async function migrateProductImage(slug: string, filename: string): Promise<void> {
  const product = await Product.findOne({ slug });
  if (!product) throw new Error(`Product not found for image migration: ${slug}`);
  if (product.images.length > 0) {
    console.log(`Skipped existing product image: ${slug}`);
    return;
  }

  const filePath = join(repositoryDirectory, "src", "assets", "products", filename);
  const buffer = await readFile(filePath);
  const key = await uploadToB2(buffer, filename, `products/${slug}`);
  product.images.push({ key, alt: product.name, isPrimary: true });
  await product.save();
  console.log(`Uploaded product image: ${slug}`);
}

async function migrateCategoryImage(slug: string, filename: string): Promise<void> {
  const category = await Category.findOne({ slug });
  if (!category) throw new Error(`Category not found for image migration: ${slug}`);
  if (category.image) {
    console.log(`Skipped existing category image: ${slug}`);
    return;
  }

  const filePath = join(repositoryDirectory, "src", "assets", "products", filename);
  const buffer = await readFile(filePath);
  category.image = await uploadToB2(buffer, filename, `categories/${slug}`);
  await category.save();
  console.log(`Uploaded category image: ${slug}`);
}

async function migrateRemoteProductImage(slug: string, filename: string, url: string): Promise<void> {
  const product = await Product.findOne({ slug });
  if (!product) throw new Error(`Product not found for image migration: ${slug}`);
  if (product.images.length > 0) {
    console.log(`Skipped existing product image: ${slug}`);
    return;
  }

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Image download failed for ${slug}: HTTP ${response.status}`);
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.startsWith("image/")) throw new Error(`Downloaded file is not an image for ${slug}`);

  const buffer = Buffer.from(await response.arrayBuffer());
  const key = await uploadToB2(buffer, filename, `products/${slug}`);
  product.images.push({ key, alt: product.name, isPrimary: true });
  await product.save();
  console.log(`Uploaded product image: ${slug}`);
}

async function migrateRemoteCategoryImage(slug: string, filename: string, url: string): Promise<void> {
  const category = await Category.findOne({ slug });
  if (!category) throw new Error(`Category not found for image migration: ${slug}`);
  if (category.image) {
    console.log(`Skipped existing category image: ${slug}`);
    return;
  }

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Category image download failed for ${slug}: HTTP ${response.status}`);
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.startsWith("image/")) throw new Error(`Downloaded category file is not an image for ${slug}`);

  const buffer = Buffer.from(await response.arrayBuffer());
  category.image = await uploadToB2(buffer, filename, `categories/${slug}`);
  await category.save();
  console.log(`Uploaded category image: ${slug}`);
}

async function migrate(): Promise<void> {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not configured");

  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  for (const [slug, filename] of productImages) {
    await migrateProductImage(slug, filename);
  }
  for (const [slug, filename, url] of remoteProductImages) {
    await migrateRemoteProductImage(slug, filename, url);
  }
  for (const [slug, filename] of categoryImages) {
    await migrateCategoryImage(slug, filename);
  }
  for (const [slug, filename, url] of remoteCategoryImages) {
    await migrateRemoteCategoryImage(slug, filename, url);
  }

  const productsWithoutImages = await Product.find({ images: { $size: 0 } }).select("slug");
  if (productsWithoutImages.length > 0) {
    throw new Error(`Products still missing B2 images: ${productsWithoutImages.map((product) => product.slug).join(", ")}`);
  }

  const [productCount, categoryCount, categoriesWithoutImages] = await Promise.all([
    Product.countDocuments(),
    Category.countDocuments(),
    Category.find({ image: { $exists: false } }).select("slug"),
  ]);
  if (categoriesWithoutImages.length > 0) {
    throw new Error(`Categories still missing B2 images: ${categoriesWithoutImages.map((category) => category.slug).join(", ")}`);
  }
  console.log(`Verified B2 images for ${productCount} products and ${categoryCount} categories.`);
}

migrate()
  .then(() => mongoose.disconnect())
  .catch(async (error: unknown) => {
    console.error("Catalog image migration failed:", error);
    await mongoose.disconnect().catch(() => undefined);
    process.exitCode = 1;
  });