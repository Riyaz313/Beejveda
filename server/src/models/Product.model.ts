import mongoose, { Document, Schema } from "mongoose";

export interface IProductVariant {
  _id?: mongoose.Types.ObjectId;
  unitType: "piece" | "weight" | "volume";
  value: number;
  unit: string;
  displayLabel: string;
  price: number;
  originalPrice?: number;
  sku: string;
  stock: number;
  isDefault: boolean;
}

export interface IProductImage {
  key: string;
  alt?: string;
  isPrimary: boolean;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  category: mongoose.Types.ObjectId;
  description: string;
  benefits: string[];
  ingredients: string[];
  howToUse: string;
  images: IProductImage[];
  badge?: string;
  brand: string;
  ratingsAverage: number;
  ratingsCount: number;
  isActive: boolean;
  variants: IProductVariant[];
  createdAt: Date;
  updatedAt: Date;
}

const variantSchema = new Schema<IProductVariant>(
  {
    unitType: {
      type: String,
      enum: ["piece", "weight", "volume"],
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      required: true,
    },
    displayLabel: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: {
      type: Number,
      min: 0,
    },
    sku: {
      type: String,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

const imageSchema = new Schema<IProductImage>(
  {
    key: { type: String, required: true },
    alt: { type: String },
    isPrimary: { type: Boolean, default: false },
  },
  { _id: false }
);

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: 200,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    benefits: [{ type: String }],
    ingredients: [{ type: String }],
    howToUse: { type: String, trim: true },
    images: [imageSchema],
    badge: {
      type: String,
      trim: true,
    },
    brand: {
      type: String,
      default: "Beejveda",
      trim: true,
    },
    ratingsAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingsCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    variants: [variantSchema],
  },
  { timestamps: true }
);

// Pre-save hook: derive displayLabel for each variant
productSchema.pre("save", function (next) {
  for (const variant of this.variants) {
    variant.displayLabel = `${variant.value} ${variant.unit}`;
    if (!variant.sku) {
      variant.sku = `${this.slug}-${variant.unitType}-${variant.value}${variant.unit}`;
    }
  }

  // Ensure exactly one default variant
  const defaultVariants = this.variants.filter((v) => v.isDefault);
  if (defaultVariants.length === 0 && this.variants.length > 0) {
    this.variants[0].isDefault = true;
  } else if (defaultVariants.length > 1) {
    let foundFirst = false;
    for (const v of this.variants) {
      if (v.isDefault) {
        if (!foundFirst) {
          foundFirst = true;
        } else {
          v.isDefault = false;
        }
      }
    }
  }

  next();
});

// Index for text search
productSchema.index({ name: "text", description: "text", benefits: "text" });

const Product = mongoose.model<IProduct>("Product", productSchema);
export default Product;
