import mongoose from "mongoose";
import { env } from "./env.js";

let isConnected = false;

export async function connectDB(): Promise<void> {
  if (isConnected) return;

  try {
    const conn = await mongoose.connect(env.MONGODB_URI);
    isConnected = true;
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
}

// Handle connection events
mongoose.connection.on("disconnected", () => {
  isConnected = false;
  console.log("⚠️ MongoDB disconnected");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB error:", err);
});
