import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),

  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),

  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  JWT_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_SECRET: z.string().min(1, "JWT_REFRESH_SECRET is required"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("30d"),

  B2_KEY_ID: z.string().min(1, "B2_KEY_ID is required"),
  B2_APPLICATION_KEY: z.string().min(1, "B2_APPLICATION_KEY is required"),
  B2_BUCKET_NAME: z.string().min(1, "B2_BUCKET_NAME is required"),
  B2_BUCKET_ID: z.string().min(1, "B2_BUCKET_ID is required"),
  B2_ENDPOINT: z.string().url("B2_ENDPOINT must be a valid URL"),
  B2_REGION: z.string().default("us-east-005"),
  B2_SIGNED_URL_EXPIRY_SECONDS: z.coerce.number().default(3600),
});

export type Env = z.infer<typeof envSchema>;

let _env: Env;

try {
  _env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    const missing = error.issues.map((i) => i.message).join("\n");
    console.error("❌ Invalid environment variables:\n" + missing);
    process.exit(1);
  }
  throw error;
}

export const env = _env;
