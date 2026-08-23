import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "customer" | "admin";
  phone?: string;
  addresses: {
    label?: string;
    address: string;
    address2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    isDefault: boolean;
  }[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const addressSchema = new Schema(
  {
    label: { type: String },
    address: { type: String, required: true },
    address2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: "India" },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
    phone: {
      type: String,
      trim: true,
    },
    addresses: [addressSchema],
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Ensure at least one default address
userSchema.pre("save", function (next) {
  if (this.addresses.length > 0) {
    const hasDefault = this.addresses.some((a) => a.isDefault);
    if (!hasDefault) {
      this.addresses[0].isDefault = true;
    }
  }
  next();
});

const User = mongoose.model<IUser>("User", userSchema);
export default User;
