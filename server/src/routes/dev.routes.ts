import { Router } from "express";
import Category from "../models/Category.model.js";
import Product from "../models/Product.model.js";
import User from "../models/User.model.js";

const router = Router();

// Dev-only seed endpoint: creates one category and two products if none exist
router.post("/seed", async (_req, res) => {
  try {
    const catCount = await Category.countDocuments();
    let category;
    if (catCount === 0) {
      category = await Category.create({ name: "Wellness", slug: "wellness", description: "Wellness products" });
    } else {
      category = await Category.findOne();
    }

    if (!category) {
      return res.status(500).json({ success: false, message: "Unable to create or find a category for seeding" });
    }

    const prodCount = await Product.countDocuments();
    if (prodCount === 0) {
      await Product.create([
        {
          name: "Organic Neem Soap",
          slug: "organic-neem-soap",
          category: category._id,
          description: "Handmade neem soap for healthy skin",
          benefits: ["Soothes skin", "Natural"],
          ingredients: ["Neem", "Coconut oil"],
          howToUse: "Use daily",
          images: [{ key: "products/neem-soap.jpg", isPrimary: true }],
          variants: [
            { unitType: "piece", value: 1, unit: "pc", price: 199, sku: "NS-1", stock: 50, isDefault: true },
          ],
        },
        {
          name: "Amla Hair Oil",
          slug: "amla-hair-oil",
          category: category._id,
          description: "Nourishing oil for hair growth",
          benefits: ["Promotes growth", "Reduces fall"],
          ingredients: ["Amla", "Sesame oil"],
          howToUse: "Apply nightly",
          images: [{ key: "products/amla-oil.jpg", isPrimary: true }],
          variants: [
            { unitType: "volume", value: 200, unit: "ml", price: 349, sku: "AO-200", stock: 30, isDefault: true },
          ],
        },
      ]);
    }

    res.json({ success: true, message: "Seed complete" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Seed failed" });
  }
});

// Dev-only: promote a user to admin by email
router.post("/promote", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.role = "admin";
    await user.save();

    res.json({ success: true, message: `User ${email} promoted to admin` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Promote failed" });
  }
});

export default router;
