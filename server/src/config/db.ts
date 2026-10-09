import mongoose from "mongoose";
import { env } from "./env.js";

let isConnected = false;

export async function connectDB(): Promise<void> {
  if (isConnected) return;

  try {
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
  } catch (error) {
    console.error("❌ MongoDB connection failed");
    console.error(error instanceof Error ? error.message : String(error));
    console.log("⚠️ Server will not start until MongoDB connection is available.");
    process.exit(1);
  }
}

mongoose.connection.on("connected", () => {
  isConnected = true;
  console.log(`✅ MongoDB connected: ${mongoose.connection.host}`);
});

mongoose.connection.on("disconnected", () => {
  isConnected = false;
  console.log("⚠️ MongoDB disconnected");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB error:", err);
});
