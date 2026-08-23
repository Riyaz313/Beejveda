import { z } from "zod";

// Allowed units per unit type
const allowedUnits: Record<string, string[]> = {
  piece: ["pc"],
  weight: ["g", "kg"],
  volume: ["ml", "l"],
};

const variantSchema = z.object({
  unitType: z.enum(["piece", "weight", "volume"]),
  value: z.number().min(0, "Value must be non-negative"),
  unit: z.string().min(1, "Unit is required"),
  price: z.number().min(0, "Price must be non-negative"),
  originalPrice: z.number().min(0).optional(),
  stock: z.number().min(0).default(0),
  isDefault: z.boolean().default(false),
}).refine(
  (data) => {
    const allowed = allowedUnits[data.unitType];
    return allowed ? allowed.includes(data.unit) : false;
  },
  {
    message: "Invalid unit for the given unit type",
    path: ["unit"],
  }
);

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required").max(200),
    slug: z.string().optional(),
    category: z.string().min(1, "Category ID is required"),
    description: z.string().min(1, "Description is required"),
    benefits: z.array(z.string()).optional().default([]),
    ingredients: z.array(z.string()).optional().default([]),
    howToUse: z.string().optional(),
    badge: z.string().optional(),
    brand: z.string().default("Beejveda"),
    variants: z
      .array(variantSchema)
      .min(1, "At least one variant is required"),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    slug: z.string().optional(),
    category: z.string().optional(),
    description: z.string().min(1).optional(),
    benefits: z.array(z.string()).optional(),
    ingredients: z.array(z.string()).optional(),
    howToUse: z.string().optional(),
    badge: z.string().optional().nullable(),
    brand: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const createVariantSchema = z.object({
  body: variantSchema,
});

export const updateVariantSchema = z.object({
  body: z.object({
    unitType: z.enum(["piece", "weight", "volume"]).optional(),
    value: z.number().min(0).optional(),
    unit: z.string().optional(),
    price: z.number().min(0).optional(),
    originalPrice: z.number().min(0).optional().nullable(),
    stock: z.number().min(0).optional(),
    isDefault: z.boolean().optional(),
  }),
});

export const productQuerySchema = z.object({
  query: z.object({
    category: z.string().optional(),
    search: z.string().optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    unitType: z.enum(["piece", "weight", "volume"]).optional(),
    sort: z
      .enum(["price_asc", "price_desc", "rating", "newest", "name"])
      .optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
  }),
});
